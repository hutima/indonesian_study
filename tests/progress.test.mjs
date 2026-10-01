import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProgress, normalizeProgress, saveProgress, recordAnswer, recordVocabReview, dueVocab, getGamificationSummary, getCardStats, getVocabProgressEntry, getAchievements, syncGamificationCelebrations } from '../progress.js';

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
  assert.equal(getVocabProgressEntry(state, 'id-u01-voc-buku', 'i2e').correct, 1);
  assert.deepEqual(dueVocab([{ id: 'id-u01-voc-buku' }], state, now + 1000), []);
  assert.equal(dueVocab([{ id: 'id-u01-voc-buku' }], state, now + 24 * 60 * 60 * 1000).length, 1);
});

test('spaced Again makes the card due soon; Unsure uses a shorter delay than Know', () => {
  const now = 1_700_000_000_000;
  const first = recordVocabReview({ version: 1, items: {} }, 'id-u02-voc-baca', 'know', true, now);
  const second = recordVocabReview(first, 'id-u02-voc-baca', 'know', true, now + 24 * 60 * 60 * 1000);
  const unsure = recordVocabReview(second, 'id-u02-voc-baca', 'unsure', true, now + 2 * 24 * 60 * 60 * 1000);
  const again = recordVocabReview(second, 'id-u02-voc-baca', 'again', true, now + 2 * 24 * 60 * 60 * 1000);
  assert.ok(getVocabProgressEntry(again, 'id-u02-voc-baca', 'i2e').dueAt < getVocabProgressEntry(unsure, 'id-u02-voc-baca', 'i2e').dueAt);
  assert.ok(getVocabProgressEntry(unsure, 'id-u02-voc-baca', 'i2e').dueAt < getVocabProgressEntry(second, 'id-u02-voc-baca', 'i2e').dueAt + 7 * 24 * 60 * 60 * 1000);
});

test('eight-month Duff cadence stabilizes before growth and retains relearn state across saves', () => {
  const storage = memoryStorage();
  const id = 'id-u01-voc-rumah';
  let state = loadProgress(storage);
  const start = 1_700_000_000_000;
  for (let n = 0; n < 5; n++) {
    state = recordVocabReview(state, id, 'know', true, start + n * 86400000);
    if (n < 4) assert.equal(getVocabProgressEntry(state, id, 'i2e').intervalDays, 1);
  }
  assert.equal(getVocabProgressEntry(state, id, 'i2e').intervalDays, 2);
  saveProgress(storage, state);
  state = recordVocabReview(loadProgress(storage), id, 'again', true, start + 6 * 86400000);
  assert.equal(getVocabProgressEntry(state, id, 'i2e').inRelearn, true);
  assert.equal(getVocabProgressEntry(state, id, 'i2e').relearnLeft, 2);
  assert.equal(getVocabProgressEntry(state, id, 'i2e').dueAt, start + 6 * 86400000 + 300000);
  const uncertain = recordVocabReview(loadProgress(storage), id, 'unsure', true, start + 6 * 86400000);
  assert.equal(getVocabProgressEntry(uncertain, id, 'i2e').dueAt, start + 6 * 86400000 + 7200000);
});

test('four hard lapses invoke Duff relaxed leech drill', () => {
  let state = { version: 1, items: {} };
  for (let n = 0; n < 4; n++) state = recordVocabReview(state, 'id-u02-voc-baca', 'again', true, 1_700_000_000_000 + n * 86400000);
  assert.equal(getVocabProgressEntry(state, 'id-u02-voc-baca', 'i2e').leechDrill, true);
  assert.equal(getVocabProgressEntry(state, 'id-u02-voc-baca', 'i2e').intervalDays, 1);
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
  assert.ok(getVocabProgressEntry(state, id, 'i2e').dueAt > day2);
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


test('achievements cover daily use, review milestones, streaks, and card mastery', () => {
  const day1 = new Date(2026, 0, 5, 12, 0, 0).getTime();
  const day2 = new Date(2026, 0, 6, 12, 0, 0).getTime();
  let state = { version: 1, items: {} };
  for (let n = 0; n < 10; n++) {
    state = recordAnswer(state, `achievement-card-${n}`, 'correct', { now: day1 });
  }
  state = recordAnswer(state, 'achievement-card-next-day', 'correct', { now: day2 });
  state.items['achievement-card-0'].streak = 3;
  const earned = new Set(getAchievements(state, day2).filter(a => a.earned).map(a => a.id));
  assert.ok(earned.has('daily_first_review'));
  assert.ok(earned.has('first_review'));
  assert.ok(earned.has('ten_reviews'));
  assert.equal(earned.has('streak_3'), false);
  assert.equal(earned.has('strong_10'), false);
});

test('celebration state baselines old progress then emits only newly earned badges and ranks', () => {
  const now = new Date(2026, 0, 5, 12, 0, 0).getTime();
  let state = recordAnswer({ version: 1, items: {} }, 'card-1', 'correct', { now });
  let sync = syncGamificationCelebrations(state, now);
  state = sync.state;
  assert.equal(sync.level, null);
  assert.deepEqual(sync.achievements, []);

  for (let n = 2; n <= 10; n++) state = recordAnswer(state, `card-${n}`, 'correct', { now });
  sync = syncGamificationCelebrations(state, now);
  assert.ok(sync.achievements.some(a => a.id === 'ten_reviews'));
  assert.ok(sync.level && sync.level.level >= 2);

  const repeat = syncGamificationCelebrations(sync.state, now);
  assert.equal(repeat.level, null);
  assert.deepEqual(repeat.achievements, []);
});

test('daily achievement can celebrate again on a new study day', () => {
  const day1 = new Date(2026, 0, 5, 12, 0, 0).getTime();
  const day2 = new Date(2026, 0, 6, 12, 0, 0).getTime();
  let state = recordAnswer({ version: 1, items: {} }, 'card-a', 'correct', { now: day1 });
  state = syncGamificationCelebrations(state, day1).state;
  state = recordAnswer(state, 'card-b', 'correct', { now: day2 });
  const sync = syncGamificationCelebrations(state, day2);
  assert.ok(sync.achievements.some(a => a.id === 'daily_first_review'));
});


test('vocabulary recognition and production keep independent histories and schedules', () => {
  const id = 'id-u03-voc-ternyata';
  const now = 1_800_000_000_000;
  let state = recordVocabReview({ version: 1, items: {} }, id, 'know', true, now, 'i2e');

  const recognition = getCardStats(state, id, now, 'i2e');
  const productionBefore = getCardStats(state, id, now, 'e2i');
  assert.equal(recognition.easy, 1);
  assert.equal(recognition.seen, 1);
  assert.equal(productionBefore.seen, 0);
  assert.equal(dueVocab([{ id }], state, now + 1000, 'i2e').length, 0);
  assert.equal(dueVocab([{ id }], state, now + 1000, 'e2i').length, 1);

  state = recordVocabReview(state, id, 'again', true, now + 2000, 'e2i');
  const recognitionAfter = getCardStats(state, id, now + 2000, 'i2e');
  const productionAfter = getCardStats(state, id, now + 2000, 'e2i');
  assert.equal(recognitionAfter.easy, 1);
  assert.equal(recognitionAfter.hard, 0);
  assert.equal(productionAfter.easy, 0);
  assert.equal(productionAfter.hard, 1);
  assert.notEqual(recognitionAfter.dueAt, productionAfter.dueAt);
});

test('legacy blended vocab history migrates only to Indonesian-to-English fallback', () => {
  const id = 'id-u04-voc-ongkos';
  const legacy = {
    version: 1,
    items: {
      [id]: { correct: 3, wrong: 1, know: 3, again: 1, last: 1_700_000_000_000, dueAt: 1_900_000_000_000 }
    }
  };
  const state = normalizeProgress(legacy);
  assert.equal(getCardStats(state, id, 1_800_000_000_000, 'i2e').seen, 4);
  assert.equal(getCardStats(state, id, 1_800_000_000_000, 'e2i').seen, 0);
  assert.equal(dueVocab([{ id }], state, 1_800_000_000_000, 'i2e').length, 0);
  assert.equal(dueVocab([{ id }], state, 1_800_000_000_000, 'e2i').length, 1);
});
