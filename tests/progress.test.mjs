import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeProgress,
  recordAnswer,
  recordVocabReview,
  dueVocab,
  getCardStats,
  getVocabProgressEntry
} from '../progress.js';
import { advanceVocabScheduling, returnVocabToDue } from '../vocab-review-panel.js';

function item(overrides = {}) {
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

test('normalizeProgress always returns stable stores', () => {
  const progress = normalizeProgress(null);
  assert.deepEqual(progress.items, {});
  assert.deepEqual(progress.vocabDirections, { i2e: {}, e2i: {} });
});

test('legacy item history counts only toward Indonesian to English recognition', () => {
  const state = normalizeProgress({ version: 1, items: { kata: item({ correct: 3, wrong: 1, last: 100 }) } });
  assert.equal(getVocabProgressEntry(state, 'kata', 'i2e').correct, 3);
  assert.equal(getVocabProgressEntry(state, 'kata', 'e2i'), undefined);
});

test('recordAnswer preserves first timestamp and updates last', () => {
  let state = normalizeProgress(null);
  state = recordAnswer(state, 'x1', 'correct', { now: 1000 });
  state = recordAnswer(state, 'x1', 'wrong', { now: 2000 });
  assert.equal(state.items.x1.first, 1000);
  assert.equal(state.items.x1.last, 2000);
  assert.equal(state.items.x1.correct, 1);
  assert.equal(state.items.x1.wrong, 1);
});

test('vocabulary reviews are stored independently by direction', () => {
  let state = normalizeProgress(null);
  state = recordVocabReview(state, 'kata', 'know', true, 1000, 'i2e');
  state = recordVocabReview(state, 'kata', 'again', true, 2000, 'e2i');
  assert.equal(getVocabProgressEntry(state, 'kata', 'i2e').know, 1);
  assert.equal(getVocabProgressEntry(state, 'kata', 'e2i').again, 1);
});

test('card stats report directional confidence from the rolling history', () => {
  let state = normalizeProgress(null);
  state = recordVocabReview(state, 'kata', 'know', false, 1000, 'i2e');
  state = recordVocabReview(state, 'kata', 'unsure', false, 2000, 'i2e');
  const stats = getCardStats(state, 'kata', 3000, 'i2e');
  assert.equal(stats.seen, 2);
  assert.equal(stats.easy, 1);
  assert.equal(stats.unsure, 1);
  assert.equal(stats.confidencePct, 75);
});

test('dueVocab uses the requested direction only', () => {
  const now = 10_000;
  const state = normalizeProgress({
    version: 1,
    items: {},
    vocabDirections: {
      i2e: { kata: item({ dueAt: now + 5000 }) },
      e2i: { kata: item({ dueAt: now - 1 }) }
    }
  });
  const cards = [{ id: 'kata' }];
  assert.deepEqual(dueVocab(cards, state, now, 'i2e'), []);
  assert.deepEqual(dueVocab(cards, state, now, 'e2i').map(card => card.id), ['kata']);
});

test('fast-forward shifts only selected-card scheduling in one direction', () => {
  const now = 1_800_000_000_000;
  const day = 24 * 60 * 60 * 1000;
  const state = normalizeProgress({
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        satu: item({ dueAt: now + 3 * day, intervalDays: 3 }),
        dua: item({ dueAt: now + 5 * day, intervalDays: 5 })
      },
      e2i: { satu: item({ dueAt: now + 7 * day, intervalDays: 7 }) }
    }
  });

  const next = advanceVocabScheduling(state, [{ id: 'satu' }], day, now, 'i2e');
  assert.equal(next.vocabDirections.i2e.satu.dueAt, now + 2 * day);
  assert.equal(next.vocabDirections.i2e.dua.dueAt, now + 5 * day);
  assert.equal(next.vocabDirections.e2i.satu.dueAt, now + 7 * day);
  assert.equal(state.vocabDirections.i2e.satu.dueAt, now + 3 * day);
});

test('return-to-circulation makes the selected direction due now without erasing history', () => {
  const now = 1_800_000_000_000;
  const state = normalizeProgress({
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        kata: item({
          correct: 8,
          wrong: 2,
          know: 8,
          unsure: 1,
          again: 1,
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
  const entry = next.vocabDirections.i2e.kata;
  assert.equal(entry.dueAt, now);
  assert.equal(entry.intervalDays, 0);
  assert.equal(entry.streak, 0);
  assert.equal(entry.easyStreak, 0);
  assert.equal(entry.srsStage, 5);
  assert.equal(entry.correct, 8);
  assert.equal(entry.know, 8);
  assert.deepEqual(entry.confidenceHistory, [1, 1, .5, 1]);
  assert.equal(state.vocabDirections.i2e.kata.dueAt > now, true);
});
