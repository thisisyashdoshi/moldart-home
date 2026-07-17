import { NextResponse } from 'next/server';
import { getSecureSession } from '@/server/auth/session';
import { getDocumentDownload } from '@/server/repositories/portal-repository';
import { createSignedDownloadUrl } from '@/server/storage/documents';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSecureSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await getDocumentDownload(session, id);
  if (!document) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const signedUrl = await createSignedDownloadUrl(document.storageKey);
  return NextResponse.redirect(signedUrl);
}
