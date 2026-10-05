const CACHE = 'indonesian-study-v8';
const CORE = [
  './', './index.html', './app.css', './app.js', './vocab-review-panel.css', './vocab-review-panel.js', './manifest.json', './favicon.svg',
  './content/manifest.js', './content/vocab/custom-focus.js', './content/vocab/expanded.js', './content/vocab/expanded-01-05.js', './content/vocab/expanded-06-10.js', './content/vocab/expanded-11-15.js', './content/vocab/pbwl-supplement.js', './content/morphology-families.js',
  './lesson-selection.js', './vocab-sections.js', './vocab-deck.js', './vocab-charts.js', './morphology-order.js', './navigation.js', './progress.js',
  './js/domain/srs/constants.js', './js/domain/srs/scheduler.js', './js/utils/helpers.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('indonesian-study-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data?.type !== 'CACHE_CONTENT') return;
  const port = event.ports?.[0];
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
      const unique = [...new Set(urls)];
      await Promise.all(unique.map(async url => {
        const request = new Request(url, { cache: 'reload' });
        const response = await fetch(request);
        if (!response.ok) throw new Error(`Could not cache ${url}`);
        await cache.put(request, response);
      }));
      port?.postMessage({ ready: true });
    } catch {
      port?.postMessage({ ready: false });
    }
  })());
});
