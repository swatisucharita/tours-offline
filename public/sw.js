const STATIC_CACHE = 'STATIC_CACHE_V1'; // Update the version number if change anything other than the service worker
const DYNAMIC_CACHE = 'DYNAMIC_CACHE_V1';

self.addEventListener('install', (event) => {
    console.log('[Service worker] installing service worker');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                // Pre-cache the basic layout
                cache.addAll([
                    '/',
                    '/index.html',
                    '/src/css/app.css',
                    'src/js/app.js',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.min.js'
                ]);
            })
    )
});

// Clean up the old cache
self.addEventListener('activate', (event) => {
    console.log('[service worker] actiavte service worker');
    event.waitUntil(
        caches.keys()
          .then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
              if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
                console.log('[Service Worker] Removing old cache.', key);
                return caches.delete(key);
              }
            }));
          })
    );
    return self.clients.claim();
});

// Intercepts fetch calls, returns from cache if present
self.addEventListener('fetch', (event) =>{
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request)
                .then(res => {
                    return caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(event.request.url, res.clone());
                            return res;
                        })
                });
        })
    );    
});