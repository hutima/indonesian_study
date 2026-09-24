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
