import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProgress, saveProgress, recordAnswer, recordVocabReview, dueVocab, getGamificationSummary, getCardStats } from '../progress.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('progress follows stable IDs across content reordering', () => {
  const storage = memoryStorage();
  const state = recordAnswer(loadProgress(storage), 'u01.m03', 'correct');
  saveProgress(storage, state);
  assert.equal(loadProgress(storage).items['u01.m03'].correct, 1);
  assert.equal(loadProgress(storage).items['u01.m02'], undefined);
});

test('malformed data falls back safely and does not pollute prototypes', () => {
  const storage = memoryStorage({ 'indonesian-study-progress-v1': '{broken' });
  assert.deepEqual(loadProgress(storage).items, {});
  const state = recordAnswer(loadProgress(storage), '__proto__', 'correct');
  assert.equal(Object.hasOwn(state.items, '__proto__'), false);
});

test('imported counters are normalized', () => {
  const storage = memoryStorage({ 'indonesian-study-progress-v1': JSON.stringify({ version: 1, items: { 'u01.v01': { correct: -3, wrong: 2.7, last: 'oops' } } }) });
  assert.deepEqual(loadProgress(storage).items['u01.v01'], { correct: 0, wrong: 2, last: 0, first: 0, again: 0, unsure: 0, know: 0 });
});

test('an ID matching an inherited Object property records a finite mark', () => {
  const state = recordAnswer({ version: 1, items: {} }, 'toString', 'correct');
  assert.equal(state.items.toString.correct, 1);
});

test('spaced Know defers a vocab card, then it becomes due again', () => {
  const now = 1_700_000_000_000;
  const state = recordVocabReview({ version: 1, items: {} }, 'id-u01-voc-buku', 'know', true, now);
  assert.equal(state.items['id-u01-voc-buku'].correct, 1);
  assert.deepEqual(dueVocab([{ id: 'id-u01-voc-buku' }], state, now + 1000), []);
  assert.equal(dueVocab([{ id: 'id-u01-voc-buku' }], state, now + 24 * 60 * 60 * 1000).length, 1);
});

test('spaced Again makes the card due soon; Unsure uses a shorter delay than Know', () => {
  const now = 1_700_000_000_000;
  const first = recordVocabReview({ version: 1, items: {} }, 'id-u02-voc-baca', 'know', true, now);
  const second = recordVocabReview(first, 'id-u02-voc-baca', 'know', true, now + 24 * 60 * 60 * 1000);
  const unsure = recordVocabReview(second, 'id-u02-voc-baca', 'unsure', true, now + 2 * 24 * 60 * 60 * 1000);
  const again = recordVocabReview(second, 'id-u02-voc-baca', 'again', true, now + 2 * 24 * 60 * 60 * 1000);
  assert.ok(again.items['id-u02-voc-baca'].dueAt < unsure.items['id-u02-voc-baca'].dueAt);
  assert.ok(unsure.items['id-u02-voc-baca'].dueAt < second.items['id-u02-voc-baca'].dueAt + 7 * 24 * 60 * 60 * 1000);
});

test('eight-month Duff cadence stabilizes before growth and retains relearn state across saves', () => {
  const storage = memoryStorage();
  const id = 'id-u01-voc-rumah';
  let state = loadProgress(storage);
  const start = 1_700_000_000_000;
  for (let n = 0; n < 5; n++) {
    state = recordVocabReview(state, id, 'know', true, start + n * 86400000);
    if (n < 4) assert.equal(state.items[id].intervalDays, 1);
  }
  assert.equal(state.items[id].intervalDays, 2);
  saveProgress(storage, state);
  state = recordVocabReview(loadProgress(storage), id, 'again', true, start + 6 * 86400000);
  assert.equal(state.items[id].inRelearn, true);
  assert.equal(state.items[id].relearnLeft, 2);
  assert.equal(state.items[id].dueAt, start + 6 * 86400000 + 300000);
  const uncertain = recordVocabReview(loadProgress(storage), id, 'unsure', true, start + 6 * 86400000);
  assert.equal(uncertain.items[id].dueAt, start + 6 * 86400000 + 7200000);
});

test('four hard lapses invoke Duff relaxed leech drill', () => {
  let state = { version: 1, items: {} };
  for (let n = 0; n < 4; n++) state = recordVocabReview(state, 'id-u02-voc-baca', 'again', true, 1_700_000_000_000 + n * 86400000);
  assert.equal(state.items['id-u02-voc-baca'].leechDrill, true);
  assert.equal(state.items['id-u02-voc-baca'].intervalDays, 1);
});


test('vocab reviews keep timestamps, rating breakdown, XP, and daily streaks', () => {
  const id = 'id-u01-voc-rumah';
  const day1 = new Date(2026, 0, 5, 12, 0, 0).getTime();
  const day2 = new Date(2026, 0, 6, 12, 0, 0).getTime();
  const day4 = new Date(2026, 0, 8, 12, 0, 0).getTime();
  let state = recordVocabReview({ version: 1, items: {} }, id, 'again', true, day1);
  state = recordVocabReview(state, id, 'know', true, day2);
  const card = getCardStats(state, id, day2);
  assert.equal(card.seen, 2);
  assert.equal(card.hard, 1);
  assert.equal(card.easy, 1);
  assert.equal(card.last, day2);
  assert.ok(state.items[id].dueAt > day2);
  const game = getGamificationSummary(state, day2);
  assert.equal(game.currentStreak, 2);
  assert.equal(game.todayReviews, 1);
  assert.equal(game.xp, 10);
  assert.equal(getGamificationSummary(state, day4).currentStreak, 0);
});

test('legacy card history remains visible when new rating-specific stats begin', () => {
  const id = 'id-u01-voc-buku';
  const legacy = { version: 1, items: { [id]: { correct: 4, wrong: 2, last: 1_700_000_000_000 } } };
  const state = recordVocabReview(legacy, id, 'unsure', false, 1_700_000_100_000);
  const stats = getCardStats(state, id);
  assert.equal(stats.seen, 7);
  assert.equal(stats.unsure, 1);
  assert.equal(stats.legacyUnclassified, 6);
});
