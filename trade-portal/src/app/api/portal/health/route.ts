import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { redis } from '@/server/security/rate-limit';
import { s3 } from '@/server/storage/s3';

const HEALTH_TIMEOUT_MS = 1500;

async function withTimeout(task: () => Promise<boolean>) {
  try {
    return await Promise.race<boolean>([
      task(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), HEALTH_TIMEOUT_MS)),
    ]);
  } catch {
    return false;
  }
}

async function checkDatabase() {
  return withTimeout(async () => {
    await prisma.$queryRawUnsafe('SELECT 1');
    return true;
  });
}

async function checkRedis() {
  return withTimeout(async () => (await redis.ping()) === 'PONG');
}

async function checkStorage() {
  return withTimeout(async () => {
    await s3.send(
      new HeadBucketCommand({
        Bucket: env.S3_BUCKET,
      }),
    );
    return true;
  });
}

export async function GET() {
  const [database, redisReady, storage] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStorage(),
  ]);

  const payload = {
    ok: database && redisReady && storage,
    authReady: database,
    services: {
      database,
      redis: redisReady,
      storage,
    },
  };

  return NextResponse.json(payload, {
    status: database ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
