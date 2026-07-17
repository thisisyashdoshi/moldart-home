import 'server-only';

import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export async function validateUpload(buffer: Buffer, mimeType: string, size: number) {
  if (size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('File exceeds upload size limit');
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('File type not allowed');
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (detected && detected.mime !== mimeType) {
    throw new Error('File signature does not match content type');
  }
}
