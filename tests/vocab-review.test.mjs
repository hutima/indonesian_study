import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewPanelModel, sortReviewedCards, returnCardToDeck, advanceVocabSchedule, returnCardProgressNow } from '../vocab-review.js';

const DAY = 24 * 60 * 60 * 1000;
const localMidnight = now => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime(); };

test('review panel mirrors Duff counts across the full selected deck', () => {
  const now = new Date(2026, 9, 5, 14, 0, 0).getTime();
  const cards = [
    { id: 'a', form: 'apel' },
    { id: 'b', form: 'buku' },
    { id: 'c', form: 'cari' },
    { id: 'd', form: 'duduk' }
  ];
  const stats = {
    a: { seen: 3, confidencePct: 90, dueAt: now, last: now - 1000 },
    b: { seen: 2, confidencePct: 50, dueAt: now, last: now - 2000 },
    c: { seen: 1, confidencePct: 80, dueAt: localMidnight(now) + DAY, last: now - 3000 },
    d: { seen: 0, confidencePct: null, dueAt: localMidnight(now) + 15 * DAY, last: 0 }
  };
  const deck = { active: ['a'], middle: ['b'] };

  const model = buildReviewPanelModel(cards, stats, deck, { spaced: true, now });

  assert.equal(model.inDeckCount, 1);
  assert.equal(model.dueNowCount, 2);
  assert.equal(model.dueLaterCount, 2);
  assert.equal(model.highConfidenceCount, 2);
  assert.equal(model.lowConfidenceCount, 2);
  assert.equal(model.histogram[0].label, 'now');
  assert.equal(model.histogram[0].count, 2);
  assert.equal(model.histogram.find(bucket => bucket.label === '1').count, 1);
  assert.equal(model.histogram.at(-1).label, '14d+');
  assert.equal(model.histogram.at(-1).count, 1);
});

test('review list only includes seen cards and supports Duff sort modes', () => {
  const cards = [
    { id: 'z', form: 'zebra' },
    { id: 'a', form: 'apel' },
    { id: 'b', form: 'buku' }
  ];
  const stats = {
    z: { seen: 2, confidencePct: 60, last: 100 },
    a: { seen: 1, confidencePct: 20, last: 300 },
    b: { seen: 0, confidencePct: null, last: 0 }
  };

  assert.deepEqual(sortReviewedCards(cards, stats, 'lastSeen').map(card => card.id), ['a', 'z']);
  assert.deepEqual(sortReviewedCards(cards, stats, 'alphabetical').map(card => card.id), ['a', 'z']);
  assert.deepEqual(sortReviewedCards(cards, stats, 'confidence').map(card => card.id), ['a', 'z']);
});

test('returnCardToDeck makes a reviewed card active without duplicating it', () => {
  const deck = { active: ['a', 'b'], middle: ['c'], completed: 7, total: 8 };
  const returned = returnCardToDeck(deck, 'c');
  assert.deepEqual(returned.active, ['a', 'b', 'c']);
  assert.deepEqual(returned.middle, []);
  assert.equal(returned.completed, 6);
  assert.equal(returned.total, 8);

  const unchanged = returnCardToDeck(returned, 'c');
  assert.deepEqual(unchanged.active, ['a', 'b', 'c']);
});


test('fast-forward moves only the current direction schedule toward now', () => {
  const now = 2_000_000_000_000;
  const day = 24 * 60 * 60 * 1000;
  const state = {
    version: 1,
    items: {},
    vocabDirections: {
      i2e: { a: { dueAt: now + 3 * day, intervalDays: 3, streak: 4 } },
      e2i: { a: { dueAt: now + 5 * day, intervalDays: 5, streak: 2 } }
    },
    gamification: { xp: 10 }
  };

  const next = advanceVocabSchedule(state, [{ id: 'a' }], day, now, 'i2e');
  assert.equal(next.vocabDirections.i2e.a.dueAt, now + 2 * day);
  assert.equal(next.vocabDirections.e2i.a.dueAt, now + 5 * day);
  assert.equal(state.vocabDirections.i2e.a.dueAt, now + 3 * day);
  assert.equal(next.gamification.xp, 10);
});

test('returning a reviewed card resets scheduling but preserves its review history', () => {
  const now = 2_000_000_000_000;
  const state = {
    version: 1,
    items: {},
    vocabDirections: {
      i2e: { a: { dueAt: now + 1000, intervalDays: 8, streak: 5, easyStreak: 4, srsStage: 6, correct: 9, wrong: 2, confidenceHistory: [1, .5] } },
      e2i: {}
    },
    gamification: {}
  };

  const next = returnCardProgressNow(state, 'a', now, 'i2e');
  const entry = next.vocabDirections.i2e.a;
  assert.equal(entry.dueAt, now);
  assert.equal(entry.intervalDays, 0);
  assert.equal(entry.streak, 0);
  assert.equal(entry.easyStreak, 0);
  assert.equal(entry.srsStage, 5);
  assert.equal(entry.correct, 9);
  assert.deepEqual(entry.confidenceHistory, [1, .5]);
});
