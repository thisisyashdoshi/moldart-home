import 'server-only';

import Redis from 'ioredis';
import { env } from '@/lib/env';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
  });

redis.on('error', () => {
  // Health checks and rateLimit() handle Redis outages explicitly; avoid noisy build-time errors.
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export async function rateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const ttl = await redis.ttl(key);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      resetInSeconds: ttl,
    };
  } catch (error) {
    console.warn('Rate limiter unavailable, failing open', error);
    return { success: true, remaining: limit, resetInSeconds: windowSeconds };
  }
}

export function getClientIp(headers: Headers) {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
