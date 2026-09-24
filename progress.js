const KEY = 'indonesian-study-progress-v1';
const safeId = id => typeof id === 'string' && /^[a-z0-9][a-z0-9._-]{1,80}$/i.test(id) && id !== '__proto__' && id !== 'constructor';
const count = n => Number.isFinite(n) && n > 0 ? Math.min(1000000, Math.floor(n)) : 0;

export function normalizeProgress(input) {
  const items = {};
  if (input && input.version === 1 && input.items && typeof input.items === 'object' && !Array.isArray(input.items)) {
    for (const [id, value] of Object.entries(input.items)) {
      if (!safeId(id) || !value || typeof value !== 'object') continue;
      items[id] = { correct: count(value.correct), wrong: count(value.wrong), last: count(value.last) };
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
