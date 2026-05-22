const CACHE_NAME = 'cupidon-ia-v8';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './three-bg.js',
    './worker.js',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes non-GET ou externes comme Gemini
    if (event.request.method !== 'GET' || event.request.url.includes('generativelanguage.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la réponse est valide, on met en cache la nouvelle version
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                      // Ignore cache.put errors gracefully (e.g. for chrome-extension or other non-http schemes)
                      }).catch(e => console.log('Cache put ignored:', e));
                }
                return response;
            })
            .catch(() => {
                // Hors ligne : on sert le cache
                return caches.match(event.request)
                    .then(cachedResponse => {
                        return cachedResponse || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
                    });
            })
    );
});

