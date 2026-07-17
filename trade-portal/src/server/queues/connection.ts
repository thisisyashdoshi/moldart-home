import 'server-only';

import IORedis from 'ioredis';
import { env } from '@/lib/env';

const globalForQueueRedis = globalThis as unknown as { queueRedis?: IORedis };

export const queueRedis =
  globalForQueueRedis.queueRedis ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

queueRedis.on('error', () => {
  // Queue producers/workers surface Redis availability where they are used; keep builds quiet when Redis is offline.
});

if (process.env.NODE_ENV !== 'production') {
  globalForQueueRedis.queueRedis = queueRedis;
}
