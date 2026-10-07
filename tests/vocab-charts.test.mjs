import test from 'node:test';
import assert from 'node:assert/strict';
import { dueBuckets, confidenceBuckets, proficiencyBands } from '../vocab-charts.js';

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


test('live session owns the now bucket while deferred elapsed cards stay in today', () => {
  const now = new Date(2026, 9, 7, 9).getTime();
  const cards = [{ id: 'again' }, { id: 'elapsed' }, { id: 'later' }];
  const state = {
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        again: { correct: 0, wrong: 1, again: 1, dueAt: now + 10 * 60 * 1000 },
        elapsed: { correct: 1, wrong: 0, know: 1, dueAt: now - 60 * 60 * 1000 },
        later: { correct: 1, wrong: 0, know: 1, dueAt: now + 2 * 86400000 }
      },
      e2i: {}
    }
  };
  const due = dueBuckets(cards, state, now, 'i2e', new Set(['again']));
  assert.equal(due[0], 1);
  assert.equal(due[1], 1);
  assert.equal(due[3], 1);
  assert.equal(due.reduce((sum, count) => sum + count, 0), 3);
});


test('proficiency bands are 100% of only the cards passed in', () => {
  const state = {
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        a: { correct: 1, wrong: 0, confidenceHistory: [1] },
        b: { correct: 1, wrong: 1, confidenceHistory: [.5] },
        c: { correct: 0, wrong: 1, confidenceHistory: [0] },
        outside: { correct: 1, wrong: 0, confidenceHistory: [1] }
      },
      e2i: {}
    }
  };
  const selected = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const bands = proficiencyBands(selected, state, 'i2e');
  assert.equal(bands.reduce((sum, band) => sum + band.count, 0), 4);
  assert.equal(bands.reduce((sum, band) => sum + band.fraction, 0), 1);
  assert.equal(bands.find(band => band.key === 'b80').count, 1);
  assert.equal(bands.find(band => band.key === 'b40').count, 1);
  assert.equal(bands.find(band => band.key === 'b0').count, 1);
  assert.equal(bands.find(band => band.key === 'unseen').count, 1);
});
