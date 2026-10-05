import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = path => fs.readFile(new URL(path, import.meta.url), 'utf8');

test('study shell includes the Duff-style bottom review panel and time controls', async () => {
  const html = await read('../index.html');
  for (const id of ['ff-row', 'fast-forward-day', 'fast-forward-week', 'review-shell', 'review-deck-tag', 'review-stats', 'review-sort-row', 'review-list']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /review-panel\.css/);
  assert.match(html, /review-panel\.js/);
});

test('offline shell caches every new review-panel module and bumps the service worker', async () => {
  const sw = await read('../sw.js');
  assert.match(sw, /indonesian-study-v22/);
  for (const asset of ['./review-panel.js', './review-panel.css', './vocab-review.js']) assert.match(sw, new RegExp(asset.replace(/[.]/g, '\\.'), 'm'));
});
