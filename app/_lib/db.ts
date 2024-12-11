import { PrismaClient, Prisma } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import type { Post, PostWithContext } from '@/types/posts';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

type DatabaseError = Error & {
  code?: string;
  event?: 'error';
  severity?: string;
};

function exponentialBackoff(attempt: number): number {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), 10000);
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as DatabaseError;

      const shouldRetry =
        lastError.code?.includes('ETIMEDOUT') ||
        lastError.code === '40P01' ||
        lastError.code === '40001' ||
        lastError.code === '40003' ||
        lastError.code?.startsWith('08');

      if (!shouldRetry) {
        throw error;
      }

      const delay = exponentialBackoff(i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Override Prisma's internal logging
const silentPrismaLogger: Prisma.LogLevel[] = [];
const emptyLogger = {
  emit: () => {},
  on: () => {},
  write: () => {},
};

const prismaClientSingleton = () => {
  neonConfig.webSocketConstructor = ws;
  const connectionString = `${process.env.DATABASE_URL}?connection_limit=10&pool_timeout=30`;

  // Create client with all logging disabled
  const prisma = new PrismaClient({
    errorFormat: 'minimal',
    log: silentPrismaLogger,
    datasources: {
      db: { url: connectionString },
    },
  });

  // Suppress all internal logging mechanisms
  (prisma as any).$on = () => {};
  (prisma as any).$use = () => {};
  if ((prisma as any)._engineConfig) {
    (prisma as any)._engineConfig.stdout = false;
    (prisma as any)._engineConfig.stderr = false;
    (prisma as any)._engineConfig.logger = emptyLogger;
  }

  // Override internal logging methods
  (prisma as any)._logger = emptyLogger;
  (prisma as any)._metrics = emptyLogger;

  const batchCache = new Map<
    string,
    {
      promise: Promise<any>;
      timestamp: number;
    }
  >();

  const BATCH_WINDOW = 50; // ms
  const CACHE_TTL = 1000; // ms

  prisma.$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        const batchKey = `${operation}-${JSON.stringify(args)}`;
        const now = Date.now();

        // Clean old cache entries
        for (const [key, value] of batchCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            batchCache.delete(key);
          }
        }

        // Return cached result if available
        const cached = batchCache.get(batchKey);
        if (cached) return cached.promise;

        // Batch similar queries
        const batchPromise = new Promise(async (resolve) => {
          await new Promise((r) => setTimeout(r, BATCH_WINDOW));
          const result = await query(args);
          resolve(result);
        });

        batchCache.set(batchKey, {
          promise: batchPromise,
          timestamp: now,
        });

        return batchPromise;
      },
    },
  });

  return prisma;
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Prevent global caching in development from causing logging
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

async function warmupConnections() {
  const warmupQueries = Array(3).fill(prisma.$queryRaw`SELECT 1`);
  try {
    await Promise.all(warmupQueries);
  } catch (error) {
    // Silently fail warmup - this is expected in some environments
    return;
  }
}

if (process.env.NODE_ENV === 'production') {
  warmupConnections();
}

// Additional logging suppression for Node process
process.env.DEBUG = '';
process.env.PRISMA_ENGINE_PROTOCOL = 'json';

// Export Prisma namespace for types
export type { Prisma };
export default prisma;

function handleDatabaseError(error: DatabaseError) {
  if (process.env.NODE_ENV === 'production') {
    // Send to your error tracking service
    // e.g., Sentry, LogRocket, etc.
  }
  throw error;
}
