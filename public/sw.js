// Volt Motors - PWA Service Worker for Native App Installation
const CACHE_NAME = 'volt-motors-pwa-v1';

// We do minimal caching to satisfy the installability criteria of modern browsers
// while avoiding caching hashed Vite files, which can lead to white screens if updated.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// A standard pass-through fetch handler that satisfies PWA criteria.
self.addEventListener('fetch', (event) => {
  // Direct network requests by default
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline fallback can be added here if needed
      return caches.match(event.request);
    })
  );
});
