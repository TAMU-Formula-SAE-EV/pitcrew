import { NextRequest } from 'next/server';
import { pgPool } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  writer.write(
    new TextEncoder().encode(`data: {"type": "connected"}\n\n`)
  );

  const client = await pgPool.connect();
  await client.query('LISTEN applicant_changes');
  console.log('SSE: Listening on applicant_changes');

  // send heartbeat messages to keep the connection alive
  const heartbeat = setInterval(() => {
    writer.write(new TextEncoder().encode(`: heartbeat\n\n`));
  }, 30000);

  const onNotification = (msg: any) => {
    console.log('SSE: Notification received:', msg.payload);
    writer.write(new TextEncoder().encode(`data: ${msg.payload}\n\n`));
  };

  client.on('notification', onNotification);

  req.signal.addEventListener('abort', () => {
    console.log('SSE: Client disconnected');
    clearInterval(heartbeat);
    client.off('notification', onNotification);
    client.release();
    writer.close();
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
