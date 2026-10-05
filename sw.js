const CACHE = 'indonesian-study-v8';
const CORE = [
  './', './index.html', './app.css', './app.js', './vocab-review-panel.css', './vocab-review-panel.js',
  './manifest.json', './favicon.svg',
  './lesson-selection.js', './vocab-sections.js', './vocab-deck.js', './vocab-charts.js', './morphology-order.js', './progress.js',
  './content/manifest.js', './content/morphology-families.js', './content/vocab/custom-focus.js',
  './js/domain/srs/constants.js', './js/domain/srs/scheduler.js', './js/utils/helpers.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
      return response;
    }))
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data?.type !== 'CACHE_CONTENT') return;
  const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
  event.waitUntil((async () => {
    let ready = true;
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll([...new Set(urls)]);
    } catch {
      ready = false;
    }
    event.ports?.[0]?.postMessage({ ready });
  })());
});
