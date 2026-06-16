// Passive Service Worker for PWA compliance
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Transparent pass-through
  event.respondWith(fetch(event.request));
});
