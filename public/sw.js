importScripts('idb.js');
importScripts('/src/js/utility.js');

const STATIC_CACHE = 'STATIC_CACHE_V7'; // Update the version number if change anything other than the service worker
const DYNAMIC_CACHE = 'DYNAMIC_CACHE_V4';

const static_content = [
    '/',
    '/index.html',
    '/offline', // Add offline page to pre cache
    '/offline.html',
    'idb.js',
    'src/js/utility.js',
    '/src/css/app.css',
    'src/js/app.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.min.js'
];

self.addEventListener('install', (event) => {
    console.log('[Service worker] installing service worker');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                // Pre-cache the basic layout
                cache.addAll(static_content);
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

// Check if requesting for a static file
const isStaticFile = (url) => {
    let cached = url;
    // If it's an internal request
    if (url.indexOf(self.origin) === 0) {
        cached = url.replace(self.origin, '');
    }

    return static_content.includes(cached);
}

// Intercepts fetch calls, returns from cache if present
self.addEventListener('fetch', (event) =>{
    const url = 'https://tours-offline-demo.firebaseio.com/tours';
    console.log("url: ", event.request.url);
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    console.log('got response for tours');
                    var clonedRes = res.clone();
                    clearAllData('tours')
                    .then(function () {
                        return clonedRes.json();
                    })
                    .then(function (data) {
                        for (var key in data) {
                        writeData('tours', data[key])
                        }
                    });
                    return res;
                })
        )
    } else if (isStaticFile(event.request.url)){
        // Assume the content is already cached
        // Cache only strategy
        event.respondWith(caches.match(event.request))
    } else {
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
                    })
                    .catch(err => {
                        // When not able to fetch the content from network or cache
                        // Render to offline page
                        return caches.match('/offline'); 
                    });
            })
        );    
    }
});