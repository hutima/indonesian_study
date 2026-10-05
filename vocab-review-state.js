const SRS_DAY_MS = 22 * 60 * 60 * 1000;
const SRS_FULL_DAY_MS = 24 * 60 * 60 * 1000;
const SORT_MODES = new Set(['lastSeen', 'alphabetical', 'confidence']);

function directionKey(direction) {
  return direction === 'e2i' ? 'e2i' : 'i2e';
}

function cloneState(state) {
  const next = state && typeof state === 'object'
    ? JSON.parse(JSON.stringify(state))
    : { version: 1, items: {}, vocabDirections: { i2e: {}, e2i: {} } };
  if (!next.items || typeof next.items !== 'object' || Array.isArray(next.items)) next.items = {};
  if (!next.vocabDirections || typeof next.vocabDirections !== 'object' || Array.isArray(next.vocabDirections)) next.vocabDirections = {};
  if (!next.vocabDirections.i2e || typeof next.vocabDirections.i2e !== 'object' || Array.isArray(next.vocabDirections.i2e)) next.vocabDirections.i2e = {};
  if (!next.vocabDirections.e2i || typeof next.vocabDirections.e2i !== 'object' || Array.isArray(next.vocabDirections.e2i)) next.vocabDirections.e2i = {};
  return next;
}

function getEntry(state, id, direction) {
  const dir = directionKey(direction);
  return state?.vocabDirections?.[dir]?.[id] || (dir === 'i2e' ? state?.items?.[id] : undefined);
}

function copyEntryIntoDirection(state, id, direction) {
  const dir = directionKey(direction);
  const prior = getEntry(state, id, dir);
  if (!prior || typeof prior !== 'object') return null;
  const copy = { ...prior };
  if (Array.isArray(prior.confidenceHistory)) copy.confidenceHistory = [...prior.confidenceHistory];
  state.vocabDirections[dir][id] = copy;
  return copy;
}

function daysFromMs(ms) {
  if (!(ms > 0)) return 0;
  if (ms <= SRS_DAY_MS) return ms / SRS_DAY_MS;
  return 1 + (ms - SRS_DAY_MS) / SRS_FULL_DAY_MS;
}

function seenCount(entry) {
  if (!entry) return 0;
  const rated = Math.max(0, Number(entry.again) || 0) + Math.max(0, Number(entry.unsure) || 0) + Math.max(0, Number(entry.know) || 0);
  const legacy = Math.max(0, Number(entry.correct) || 0) + Math.max(0, Number(entry.wrong) || 0);
  return Math.max(rated, legacy);
}

function confidencePct(entry) {
  if (!entry || !seenCount(entry)) return null;
  const history = Array.isArray(entry.confidenceHistory) ? entry.confidenceHistory.filter(Number.isFinite) : [];
  const fraction = history.length
    ? history.reduce((sum, value) => sum + value, 0) / history.length
    : (Math.max(0, Number(entry.correct) || 0) / Math.max(1, (Number(entry.correct) || 0) + (Number(entry.wrong) || 0)));
  return Math.round(fraction * 100);
}

/** Pull selected due dates closer without changing review history. */
export function advanceVocabScheduling(state, cards, advanceMs, now = Date.now(), direction = 'i2e') {
  const next = cloneState(state);
  const shift = Math.max(0, Number(advanceMs) || 0);
  if (!shift) return next;
  for (const card of cards || []) {
    if (!card?.id) continue;
    const prior = getEntry(next, card.id, direction);
    if (!prior?.dueAt || prior.dueAt <= now) continue;
    const entry = copyEntryIntoDirection(next, card.id, direction);
    entry.dueAt = Math.max(now, entry.dueAt - shift);
    entry.intervalDays = Math.max(0, daysFromMs(entry.dueAt - now));
  }
  return next;
}

/** Make one reviewed card immediately due again, preserving its history. */
export function returnVocabToDue(state, id, now = Date.now(), direction = 'i2e') {
  const next = cloneState(state);
  const entry = copyEntryIntoDirection(next, id, direction);
  if (!entry) return next;
  entry.dueAt = now;
  entry.intervalDays = 0;
  entry.streak = 0;
  entry.easyStreak = 0;
  entry.srsStage = Math.max(0, (Number(entry.srsStage) || 0) - 1);
  return next;
}

/** Sort only cards with history in the active direction, matching Duff's review list. */
export function sortReviewCards(cards, state, direction = 'i2e', mode = 'lastSeen') {
  const selectedMode = SORT_MODES.has(mode) ? mode : 'lastSeen';
  const rows = (cards || []).filter(card => seenCount(getEntry(state, card.id, direction)) > 0);
  const alpha = (a, b) => String(a.form || '').localeCompare(String(b.form || ''), 'id', { sensitivity: 'base' });
  rows.sort((a, b) => {
    const aEntry = getEntry(state, a.id, direction);
    const bEntry = getEntry(state, b.id, direction);
    if (selectedMode === 'confidence') {
      const av = confidencePct(aEntry) ?? -1;
      const bv = confidencePct(bEntry) ?? -1;
      return av === bv ? alpha(a, b) : av - bv;
    }
    if (selectedMode === 'alphabetical') return alpha(a, b);
    const at = Number(aEntry?.last) || 0;
    const bt = Number(bEntry?.last) || 0;
    return at === bt ? alpha(a, b) : bt - at;
  });
  return rows;
}
