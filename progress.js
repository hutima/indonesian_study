const KEY = 'indonesian-study-progress-v1';
const safeId = id => typeof id === 'string' && /^[a-z0-9][a-z0-9._-]{1,80}$/i.test(id) && id !== '__proto__' && id !== 'constructor';
const count = n => Number.isFinite(n) && n > 0 ? Math.min(1000000, Math.floor(n)) : 0;

export function normalizeProgress(input) {
  const items = {};
  if (input && input.version === 1 && input.items && typeof input.items === 'object' && !Array.isArray(input.items)) {
    for (const [id, value] of Object.entries(input.items)) {
      if (!safeId(id) || !value || typeof value !== 'object') continue;
      items[id] = { correct: count(value.correct), wrong: count(value.wrong), last: count(value.last) };
      if (Object.hasOwn(value, 'dueAt')) items[id].dueAt = count(value.dueAt);
      if (Object.hasOwn(value, 'intervalDays')) items[id].intervalDays = count(value.intervalDays);
      if (Object.hasOwn(value, 'streak')) items[id].streak = count(value.streak);
    }
  }
  return { version: 1, items };
}

export function loadProgress(storage) {
  try { return normalizeProgress(JSON.parse(storage.getItem(KEY))); }
  catch { return normalizeProgress(null); }
}

export function saveProgress(storage, state) {
  storage.setItem(KEY, JSON.stringify(normalizeProgress(state)));
}

export function recordAnswer(state, id, result) {
  const next = normalizeProgress(state);
  if (!safeId(id) || !['correct', 'wrong'].includes(result)) return next;
  const previous = Object.hasOwn(next.items, id) ? next.items[id] : { correct: 0, wrong: 0, last: 0 };
  next.items[id] = { ...previous, [result]: Math.min(1000000, previous[result] + 1), last: Date.now() };
  return next;
}

const DAY = 24 * 60 * 60 * 1000;
const KNOW_INTERVALS = [1, 3, 7, 14, 30, 60];

// The vocabulary schedule is intentionally small and independent of the Greek
// course's paradigm scheduler. Existing stage-one progress remains readable.
export function recordVocabReview(state, id, rating, spaced, now = Date.now()) {
  if (!['again', 'unsure', 'know'].includes(rating)) return normalizeProgress(state);
  const next = recordAnswer(state, id, rating === 'know' ? 'correct' : 'wrong');
  if (!spaced || !Object.hasOwn(next.items, id)) return next;
  const item = next.items[id];
  const oldStreak = count(item.streak);
  if (rating === 'know') {
    item.streak = Math.min(oldStreak + 1, KNOW_INTERVALS.length);
    item.intervalDays = KNOW_INTERVALS[item.streak - 1];
    item.dueAt = now + item.intervalDays * DAY;
  } else if (rating === 'unsure') {
    item.streak = Math.max(0, oldStreak - 1);
    item.intervalDays = 0;
    item.dueAt = now + 6 * 60 * 60 * 1000;
  } else {
    item.streak = 0;
    item.intervalDays = 0;
    item.dueAt = now + 5 * 60 * 1000;
  }
  item.last = now;
  return next;
}

export function dueVocab(cards, state, now = Date.now()) {
  return cards.filter(card => !state.items?.[card.id]?.dueAt || state.items[card.id].dueAt <= now);
}
