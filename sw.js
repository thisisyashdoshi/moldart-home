const CACHE = 'moldart-v2026.22';
const PRECACHE = [
  '/',
  '/styles.css?v=2026.22',
  '/pages.css?v=2026.22',
  '/main.js?v=2026.22',
  '/fonts/montserrat-latin.woff2',
  '/fonts/dm-sans-latin.woff2',
  '/offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  const isStatic = /\.(css|js|woff2|webp|avif|png|jpg|jpeg|svg|ico)(\?.*)?$/.test(url.pathname);

  if (isStatic) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      }))
    );
    return;
  }

  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
