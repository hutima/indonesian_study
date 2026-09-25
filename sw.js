// Offline shell. The app supplies the content module URLs after registration.
const CACHE = 'indonesian-study-v12';
const SHELL = [
  './', './index.html', './app.js', './app.css', './progress.js', './vocab-deck.js', './vocab-charts.js', './vocab-sections.js', './lesson-selection.js', './navigation.js',
  './js/domain/srs/constants.js', './js/domain/srs/scheduler.js', './js/utils/helpers.js',
  './content/manifest.js', './manifest.json', './sw.js'
];
self.addEventListener('install', event => {
  // Bypass the browser HTTP cache when populating a new version.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(path => new Request(path, { cache: 'reload' })))));
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
  const safe = Array.isArray(urls) && urls.length > 0 && urls.every(url => typeof url === 'string' && (/^\.\/content\/units\/[a-z0-9_-]+\.js$/.test(url) || /^\.\/content\/textbook\/topik[0-9]{2}\.js$/.test(url) || url === './content/vocab/pbwl-supplement.js' || /^\.\/content\/vocab\/expanded(?:-(?:01-05|06-10|11-15))?\.js$/.test(url)));
  if (!safe) { event.ports[0]?.postMessage({ ready: false }); return; }
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls.map(url => new Request(url, { cache: 'reload' })))).then(() => {
    event.ports[0]?.postMessage({ ready: true });
  }).catch(() => { event.ports[0]?.postMessage({ ready: false }); }));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    // Cache only successful local reads; the app does not request remote assets.
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  })));
});
