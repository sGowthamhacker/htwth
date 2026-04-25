const CACHE_NAME = 'highlevel-os-cache-v3';
const urlsToCache = [
  './',
  './index.html',
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force new SW to enter 'activating' state immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Force new SW to control loaded pages immediately
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Also bypass non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Also bypass chrome-extension schemes or other non-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});