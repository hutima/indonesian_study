import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { UNIT_URLS } from '../content/manifest.js';

test('service worker caches the shell and every registered content unit for offline reads', async () => {
  // Pages hosts this repository under a project subpath, not at the domain root.
  const pagesBase = 'https://hutima.github.io/indonesian_study/';
  const handlers = new Map();
  const stored = new Map();
  const cache = {
    addAll: async urls => { for (const url of urls) stored.set(new URL(url.url || url, pagesBase).href, { body: url, ok: true }); },
    put: async (request, response) => stored.set(request.url, response)
  };
  const caches = {
    open: async () => cache,
    keys: async () => [],
    delete: async () => true,
    match: async request => stored.get(request.url)
  };
  const worker = {
    location: { origin: 'https://hutima.github.io' },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (type, handler) => handlers.set(type, handler)
  };
  const script = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, { self: worker, caches, URL, Request: class { constructor(path, options) { this.url = new URL(path, pagesBase).href; this.cache = options.cache; } }, fetch: () => { throw new Error('Network should not be used for cached files'); } });
  let install;
  handlers.get('install')({ waitUntil: promise => { install = promise; } });
  await install;

  let prefetch;
  let ready;
  handlers.get('message')({
    data: { type: 'CACHE_CONTENT', urls: UNIT_URLS },
    ports: [{ postMessage: value => { ready = value.ready; } }],
    waitUntil: promise => { prefetch = promise; }
  });
  await prefetch;
  assert.equal(ready, true);

  for (const path of ['./index.html', './app.js', './progress.js', './vocab-deck.js', './vocab-charts.js', './vocab-sections.js', './navigation.js', './js/domain/srs/constants.js', './js/domain/srs/scheduler.js', './js/utils/helpers.js', './content/manifest.js', ...UNIT_URLS]) {
    let response;
    const request = { url: new URL(path, pagesBase).href, method: 'GET' };
    handlers.get('fetch')({ request, respondWith: promise => { response = promise; }, waitUntil: () => {} });
    assert.ok(await response, `offline cache misses ${path}`);
  }
});


test('an installed update waits for an explicit refresh request', async () => {
  const handlers = new Map();
  let skipCalls = 0;
  const caches = { open: async () => ({ addAll: async () => {} }) };
  const self = { addEventListener: (type, fn) => handlers.set(type, fn), skipWaiting: async () => { skipCalls++; } };
  const script = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, { self, caches, Request: class { constructor(path) { this.url = path; } } });
  let install;
  handlers.get('install')({ waitUntil: promise => { install = promise; } });
  await install;
  assert.equal(skipCalls, 0);
  let requested;
  handlers.get('message')({ data: { type: 'SKIP_WAITING' }, waitUntil: promise => { requested = promise; } });
  await requested;
  assert.equal(skipCalls, 1);
});


test('offline content request refuses non-lesson paths', async () => {
  const handlers = new Map();
  const self = { addEventListener: (type, fn) => handlers.set(type, fn) };
  const script = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, { self });
  let reply;
  handlers.get('message')({ data: { type: 'CACHE_CONTENT', urls: ['./content/textbook/../secret.js'] }, ports: [{ postMessage: value => { reply = value; } }] });
  assert.equal(reply.ready, false);
});
