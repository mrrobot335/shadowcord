const CACHE_NAME = 'shadowcord-v1';
const STATIC_ASSETS = ['/', '/index.html'];

// Install: cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache when offline, network first when online
self.addEventListener('fetch', (event) => {
  // Don't cache API calls or socket connections
  if (event.request.url.includes('/api/') || event.request.url.includes('socket.io')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful GET responses
        if (event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});