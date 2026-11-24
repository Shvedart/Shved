// Временное отключение прототипа: сбрасывает кеши и не обслуживает приложение.
const VERSION = 'kb-np-off-1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) client.navigate(client.url);
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
