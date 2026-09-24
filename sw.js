// Offline shell. The app supplies the content module URLs after registration.
const CACHE = 'indonesian-study-v2';
const SHELL = [
  './', './index.html', './app.js', './app.css', './progress.js', './vocab-deck.js',
  './content/manifest.js', './manifest.json', './sw.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('indonesian-study-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (event.data?.type !== 'CACHE_CONTENT') return;
  const urls = event.data.urls;
  const safe = Array.isArray(urls) && urls.length > 0 && urls.every(url => typeof url === 'string' && /^\.\/content\/units\/[a-z0-9_-]+\.js$/.test(url));
  if (!safe) { event.ports[0]?.postMessage({ ready: false }); return; }
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls)).then(() => {
    event.ports[0]?.postMessage({ ready: true });
  }).catch(() => { event.ports[0]?.postMessage({ ready: false }); }));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    // Cache only successful local reads; the app does not request remote assets.
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  })));
});
