import { NextRequest, NextResponse } from 'next/server';
import { getSSEClient } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ActiveConnection {
    id: string;
    lastActivity: number;
    cleanup: () => void;
}

const activeConnections = new Map<string, ActiveConnection>();

const CLEANUP_INTERVAL = 60000;
const CONNECTION_TIMEOUT = 2 * 60000;

if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [id, connection] of activeConnections.entries()) {
            if (now - connection.lastActivity > CONNECTION_TIMEOUT) {
                console.log(`Connection ${id} timed out. Cleaning up.`);
                connection.cleanup();
                activeConnections.delete(id);
            }
        }
    }, CLEANUP_INTERVAL);
}

export async function GET(request: NextRequest) {
    const connectionId = crypto.randomUUID();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();
    let heartbeatInterval: ReturnType<typeof setInterval>;

    try {
        const client = getSSEClient();
        const conn = await client.connect();
        
        console.log(`New SSE connection ${connectionId}. Total connections: ${activeConnections.size + 1}`);
        await conn.query('LISTEN applicant_changes');

        // update activity timestamp
        const updateActivity = () => {
            const connection = activeConnections.get(connectionId);
            if (connection) {
                connection.lastActivity = Date.now();
            }
        };

        // cleanup function - now heartbeatInterval is in scope
        const cleanup = () => {
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
            conn.release();
            writer.close();
            activeConnections.delete(connectionId);
            console.log(`Connection ${connectionId} closed. Total connections: ${activeConnections.size}`);
        };

        // store connection info
        activeConnections.set(connectionId, {
            id: connectionId,
            lastActivity: Date.now(),
            cleanup
        });

        // send initial message
        await writer.write(
            encoder.encode('data: {"type":"connected"}\n\n')
        );

        // setup heartbeat after cleanup is defined
        heartbeatInterval = setInterval(async () => {
            try {
                if (activeConnections.has(connectionId)) {
                    await writer.write(encoder.encode(': heartbeat\n\n'));
                    updateActivity();
                } else {
                    cleanup();
                }
            } catch (error) {
                console.error(`Heartbeat failed for ${connectionId}:`, error);
                cleanup();
            }
        }, 30000);

        conn.on('notification', async (msg) => {
            if (!activeConnections.has(connectionId)) return;
            
            try {
                if (msg.payload) {
                    await writer.write(
                        encoder.encode(`data: ${msg.payload}\n\n`)
                    );
                    updateActivity();
                    console.log(`Notification sent to ${connectionId}`);
                }
            } catch (error) {
                console.error(`Error sending notification to ${connectionId}:`, error);
                cleanup();
            }
        });

        // cleanup on disconnect
        request.signal.addEventListener('abort', () => {
            console.log(`Client disconnected ${connectionId}`);
            cleanup();
        });

    } catch (error) {
        console.error(`Error in SSE setup for ${connectionId}:`, error);
        activeConnections.delete(connectionId);
        return NextResponse.json(
            { error: 'Failed to setup updates' }, 
            { status: 500 }
        );
    }

    return new NextResponse(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}