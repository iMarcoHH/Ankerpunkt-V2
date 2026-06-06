// Service Worker — cache busting
const CACHE_VERSION = 'v20260606-5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Kein Caching — immer frisch vom Netz
  event.respondWith(fetch(event.request));
});
