// Service worker: оболочка приложения доступна офлайн, картинки партнёров кешируются по мере просмотра.
const VERSION = 'kb-np-v9';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'cashback-web.json',
  'data/overrides.json',
  'styles/tokens.css',
  'styles/base.css',
  'styles/components.css',
  'styles/screens.css',
  'styles/shelves.css',
  'src/main.js',
  'src/app.js',
  'src/core/dom.js',
  'src/core/motion.js',
  'src/core/haptics.js',
  'src/core/store.js',
  'src/core/router.js',
  'src/data/repository.js',
  'src/domain/catalog.js',
  'src/ui/appbar.js',
  'src/ui/toast.js',
  'src/ui/components.js',
  'src/ui/favcard.js',
  'src/ui/sheet.js',
  'src/ui/scratch.js',
  'src/ui/shelves.js',
  'src/screens/feed.js',
  'src/screens/hub.js',
  'src/screens/bank.js',
  'src/screens/onboarding.js',
  'src/screens/main.js',
  'src/screens/tour.js',
  'src/screens/pk.js',
  'src/screens/offer.js',
  'src/screens/favorites.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Своё: сначала сеть (чтобы правки сразу были видны), офлайн — из кеша.
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(request, copy));
      return res;
    }).catch(() => caches.match(request, { ignoreSearch: true })));
    return;
  }
  // Картинки партнёров: из кеша, обновляя в фоне.
  if (request.destination === 'image') {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const cached = await c.match(request);
      const network = fetch(request).then((res) => { c.put(request, res.clone()); return res; }).catch(() => cached);
      return cached || network;
    }));
  }
});
