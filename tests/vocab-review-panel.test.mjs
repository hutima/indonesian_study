import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProgress } from '../progress.js';
import { advanceVocabScheduling, returnVocabToDue, sortReviewCards } from '../vocab-review-panel.js';

function entry(overrides = {}) {
  return {
    correct: 0,
    wrong: 0,
    last: 0,
    first: 0,
    again: 0,
    unsure: 0,
    know: 0,
    ...overrides
  };
}

test('Duff fast-forward shifts selected scheduling in one direction without mutating source state', () => {
  const now = 1_800_000_000_000;
  const day = 24 * 60 * 60 * 1000;
  const duffDay = 22 * 60 * 60 * 1000;
  const state = normalizeProgress({
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        satu: entry({ correct: 1, know: 1, last: now, first: now, dueAt: now + 3 * day, intervalDays: 3 }),
        dua: entry({ correct: 1, know: 1, last: now, first: now, dueAt: now + 5 * day, intervalDays: 5 })
      },
      e2i: { satu: entry({ correct: 1, know: 1, last: now, first: now, dueAt: now + 7 * day, intervalDays: 7 }) }
    }
  });

  const next = advanceVocabScheduling(state, [{ id: 'satu' }], duffDay, now, 'i2e');
  assert.equal(next.vocabDirections.i2e.satu.dueAt, now + 3 * day - duffDay);
  assert.equal(next.vocabDirections.i2e.dua.dueAt, now + 5 * day);
  assert.equal(next.vocabDirections.e2i.satu.dueAt, now + 7 * day);
  assert.equal(state.vocabDirections.i2e.satu.dueAt, now + 3 * day);
});

test('Duff return-to-circulation keeps review history while making the chosen direction due now', () => {
  const now = 1_800_000_000_000;
  const state = normalizeProgress({
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        kata: entry({
          correct: 8,
          wrong: 2,
          last: now,
          first: now - 1000,
          again: 1,
          unsure: 1,
          know: 8,
          streak: 5,
          easyStreak: 4,
          srsStage: 6,
          intervalDays: 14,
          dueAt: now + 14 * 24 * 60 * 60 * 1000,
          confidenceHistory: [1, 1, .5, 1]
        })
      },
      e2i: {}
    }
  });

  const next = returnVocabToDue(state, 'kata', now, 'i2e');
  const result = next.vocabDirections.i2e.kata;
  assert.equal(result.dueAt, now);
  assert.equal(result.intervalDays, 0);
  assert.equal(result.streak, 0);
  assert.equal(result.easyStreak, 0);
  assert.equal(result.srsStage, 5);
  assert.equal(result.correct, 8);
  assert.equal(result.know, 8);
  assert.deepEqual(result.confidenceHistory, [1, 1, .5, 1]);
  assert.ok(state.vocabDirections.i2e.kata.dueAt > now);
});

test('review rows sort by last seen, Indonesian alphabet, and lowest confidence first', () => {
  const now = 1_800_000_000_000;
  const cards = [
    { id: 'b', form: 'baca', meaning: 'read' },
    { id: 'a', form: 'ada', meaning: 'exist' },
    { id: 'c', form: 'cari', meaning: 'seek' },
    { id: 'u', form: 'untouched', meaning: 'untouched' }
  ];
  const state = normalizeProgress({
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        a: entry({ correct: 1, know: 1, first: now - 300, last: now - 300, confidenceHistory: [1] }),
        b: entry({ correct: 1, wrong: 1, know: 1, again: 1, first: now - 200, last: now - 100, confidenceHistory: [1, 0] }),
        c: entry({ wrong: 1, unsure: 1, first: now - 400, last: now - 200, confidenceHistory: [.5] })
      },
      e2i: {}
    }
  });

  assert.deepEqual(sortReviewCards(cards, state, 'i2e', 'lastSeen', now).map(card => card.id), ['b', 'c', 'a']);
  assert.deepEqual(sortReviewCards(cards, state, 'i2e', 'alphabetical', now).map(card => card.id), ['a', 'b', 'c']);
  assert.deepEqual(sortReviewCards(cards, state, 'i2e', 'confidence', now).map(card => card.id), ['b', 'c', 'a']);
});
