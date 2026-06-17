/* STATUS — service worker. Offline-first app shell cache. */
const CACHE = 'status-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Network-first for the app document itself, so deploys ship without a
  // stale-cache trap. Falls back to cache when offline.
  const isNavigation = req.mode === 'navigate' ||
    (req.destination === 'document') ||
    /index\.html$/.test(req.url);
  if (isNavigation) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.match('./index.html').then((c) => c || caches.match('./')))
    );
    return;
  }

  // Cache-first for everything else (icons, manifest, fonts), with
  // opportunistic caching of new responses.
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          try {
            const url = new URL(req.url);
            const cacheable = url.origin === self.location.origin ||
              /fonts\.(googleapis|gstatic)\.com/.test(url.host);
            if (cacheable && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
          } catch (_) {}
          return res;
        })
        .catch(() => cached);
    })
  );
});
