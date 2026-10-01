import test from 'node:test';
import assert from 'node:assert/strict';
import { dueBuckets, confidenceBuckets } from '../vocab-charts.js';

test('histograms categorize unseen, due, future, and sampled confidence', () => {
  const now = new Date(2026, 8, 24, 12).getTime();
  const cards = ['a', 'b', 'c'].map(id => ({ id }));
  const state = { version: 1, items: {
    b: { dueAt: now + 60 * 60 * 1000, correct: 1, wrong: 0, confidenceHistory: [1] },
    c: { dueAt: now + 2 * 86400000, correct: 0, wrong: 1, confidenceHistory: [0] }
  } };
  const due = dueBuckets(cards, state, now);
  assert.equal(due[0], 1);
  assert.equal(due[1], 1);
  assert.equal(due[3], 1);
  assert.deepEqual(confidenceBuckets(cards, state), [1, 1, 0, 0, 0, 1]);
});


test('histograms keep recognition and production confidence separate', () => {
  const now = new Date(2026, 8, 24, 12).getTime();
  const cards = [{ id: 'a' }];
  const state = {
    version: 1,
    items: {},
    vocabDirections: {
      i2e: { a: { correct: 1, wrong: 0, know: 1, confidenceHistory: [1], dueAt: now + 86400000 } },
      e2i: { a: { correct: 0, wrong: 1, again: 1, confidenceHistory: [0], dueAt: now } }
    }
  };
  assert.deepEqual(confidenceBuckets(cards, state, 'i2e'), [0, 0, 0, 0, 0, 1]);
  assert.deepEqual(confidenceBuckets(cards, state, 'e2i'), [0, 1, 0, 0, 0, 0]);
  assert.equal(dueBuckets(cards, state, now, 'i2e')[0], 0);
  assert.equal(dueBuckets(cards, state, now, 'e2i')[0], 1);
});
