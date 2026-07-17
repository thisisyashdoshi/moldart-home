function gone() {
  return new Response(
    JSON.stringify({ ok: false, errors: ['Open Wood Science admin has been removed from the public Moldart site.'] }),
    {
      status: 410,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    }
  );
}

export async function onRequest() {
  return gone();
}
