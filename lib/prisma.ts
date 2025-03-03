import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const pgPool = globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

// prisma middleware to send NOTIFY on applicant changes
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (params.model === 'Applicant' && ['create', 'update', 'delete'].includes(params.action)) {
    const payload = JSON.stringify({
      action: params.action,
      id: params.args.where?.id || result.id,
      email: result.email,
      status: result.status,
      updatedAt: new Date().toISOString(),
    });
    try {
      // escape single quotes in the payload for SQL safety
      const escapedPayload = payload.replace(/'/g, "''");
      await pgPool.query(`NOTIFY applicant_changes, '${escapedPayload}'`);
      console.log('Prisma: NOTIFY sent for applicant change');
    } catch (error) {
      console.error('Prisma: Error sending NOTIFY', error);
    }
  }
  return result;
});

let sseClient: Pool | null = null;
export const getSSEClient = () => {
  if (!sseClient) {
    sseClient = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 0,
    });
  }
  return sseClient;
};

process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
    await pgPool.end();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});