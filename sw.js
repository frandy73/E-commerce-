const CACHE_NAME = 'boutik-paw-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.ts',
  '/types.ts',
  '/geminiService.ts',
  '/components/ProductCard.tsx',
  '/components/Cart.tsx'
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network First strategy for HTML/JS, Cache First for Images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy for Images/Fonts (Cache First, then Network)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|woff|woff2)$/) || url.hostname.includes('picsum.photos') || url.hostname.includes('cdn')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy for HTML/JS/API (Network First, then Cache)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid network response, cache it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Fallback for navigation to index.html (SPA support)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});