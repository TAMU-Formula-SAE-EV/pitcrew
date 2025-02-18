import { PrismaClient } from '@prisma/client';
import { Pool, PoolClient } from 'pg';

// maintain global prisma instance
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pgPool: Pool | undefined;
    pgClient: PoolClient | undefined;
};

// create prisma instance if it doesn't exist
export const prisma = globalForPrisma.prisma ?? 
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

// create pg pool instance if it doesn't exist
export const pgPool = globalForPrisma.pgPool ?? 
    new Pool({
        connectionString: process.env.DATABASE_URL,
    });

let sseClient: Pool | null = null;

export const getSSEClient = () => {
    if (!sseClient) {
        sseClient = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 1, // we only need one connection for SSE
            idleTimeoutMillis: 0, // disable idle timeout
        });
    }
    return sseClient;
};

// set up listener in development
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pgPool = pgPool;

    // set up pg listener
    const setupListener = async () => {
        try {
            const client = await pgPool.connect();
            globalForPrisma.pgClient = client;
            
            await client.query('LISTEN applicant_changes');
            console.log('PostgreSQL listener set up successfully');

            // handle connection errors
            client.on('error', (err) => {
                console.error('PostgreSQL client error:', err);
                client.release();
                // attempt to reconnect after a delay
                setTimeout(setupListener, 5000);
            });

        } catch (err) {
            console.error('Error setting up PostgreSQL listener:', err);
            // attempt to reconnect after a delay
            setTimeout(setupListener, 5000);
        }
    };

    setupListener();
}

// middleware for notifications
prisma.$use(async (params, next) => {
    const result = await next(params);

    // only notify for applicant model changes
    if (params.model === 'Applicant' && 
        ['create', 'update', 'delete'].includes(params.action)) {
        try {
            await pgPool.query(
                "NOTIFY applicant_changes, $1",
                [JSON.stringify({
                    action: params.action,
                    id: params.args.where?.id || result.id,
                    status: result.status,
                    updatedAt: new Date().toISOString()
                })]
            );
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    return result;
});

// cleanup on app shutdown
process.on('beforeExit', async () => {
    try {
        if (globalForPrisma.pgClient) {
            globalForPrisma.pgClient.release();
        }
        await Promise.all([
            prisma.$disconnect(),
            pgPool.end()
        ]);
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});