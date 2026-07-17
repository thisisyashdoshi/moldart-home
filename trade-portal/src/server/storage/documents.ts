import 'server-only';

import crypto from 'node:crypto';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/lib/env';
import { s3 } from './s3';
import { validateUpload } from '@/server/security/file-validation';

export async function uploadDocument({
  buffer,
  mimeType,
  originalFilename,
}: {
  buffer: Buffer;
  mimeType: string;
  originalFilename: string;
}) {
  await validateUpload(buffer, mimeType, buffer.byteLength);
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const storedFilename = `${crypto.randomUUID()}-${originalFilename.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const storageKey = `documents/${storedFilename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return {
    storageBucket: env.S3_BUCKET,
    storageKey,
    storedFilename,
    checksumSha256: checksum,
  };
}

export async function createSignedDownloadUrl(key: string) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
    { expiresIn: 60 * 5 },
  );
}
