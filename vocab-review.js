const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAY = 14;

function statsFor(statsById, id) {
  return statsById?.[id] || { seen: 0, confidencePct: null, dueAt: 0, last: 0 };
}

function alphabetical(a, b) {
  return String(a?.form || '').localeCompare(String(b?.form || ''), 'id', { sensitivity: 'base' });
}

export function buildReviewPanelModel(cards = [], statsById = {}, deck = {}, options = {}) {
  const spaced = options.spaced !== false;
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const active = Array.isArray(deck.active) ? deck.active : [];
  const middle = Array.isArray(deck.middle) ? deck.middle : [];
  const sessionIds = new Set([...active, ...middle]);
  const totalCount = cards.length;
  let highConfidenceCount = 0;
  let lowConfidenceCount = 0;

  for (const card of cards) {
    const confidence = statsFor(statsById, card.id).confidencePct;
    if (confidence != null && confidence > 75) highConfidenceCount += 1;
    else lowConfidenceCount += 1;
  }

  const dueNowCount = Math.min(totalCount, sessionIds.size);
  const dueLaterCount = Math.max(0, totalCount - dueNowCount);
  let histogram = [];

  if (spaced && totalCount) {
    const labels = ['now', 'today', ...Array.from({ length: 13 }, (_, i) => String(i + 1)), '14d+'];
    const counts = new Array(labels.length).fill(0);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    for (const card of cards) {
      if (sessionIds.has(card.id)) {
        counts[0] += 1;
        continue;
      }
      const dueAt = statsFor(statsById, card.id).dueAt || now;
      const dueDay = new Date(dueAt);
      dueDay.setHours(0, 0, 0, 0);
      const calendarDays = Math.max(0, Math.round((dueDay.getTime() - startOfToday.getTime()) / DAY_MS));
      if (calendarDays === 0) counts[1] += 1;
      else if (calendarDays >= MAX_DAY) counts[counts.length - 1] += 1;
      else counts[calendarDays + 1] += 1;
    }

    histogram = labels.map((label, index) => ({ label, count: counts[index] }));
  }

  return {
    totalCount,
    inDeckCount: active.length,
    dueNowCount,
    dueLaterCount,
    highConfidenceCount,
    lowConfidenceCount,
    histogram
  };
}

export function sortReviewedCards(cards = [], statsById = {}, mode = 'lastSeen') {
  const reviewed = cards.filter(card => (statsFor(statsById, card.id).seen || 0) > 0);
  if (mode === 'alphabetical') return reviewed.sort(alphabetical);
  if (mode === 'confidence') {
    return reviewed.sort((a, b) => {
      const av = statsFor(statsById, a.id).confidencePct;
      const bv = statsFor(statsById, b.id).confidencePct;
      const ac = av == null ? -1 : av;
      const bc = bv == null ? -1 : bv;
      if (ac !== bc) return ac - bc;
      return alphabetical(a, b);
    });
  }
  return reviewed.sort((a, b) => {
    const at = statsFor(statsById, a.id).last || 0;
    const bt = statsFor(statsById, b.id).last || 0;
    if (at !== bt) return bt - at;
    return alphabetical(a, b);
  });
}

export function returnCardToDeck(deck = {}, cardId) {
  const active = Array.isArray(deck.active) ? [...deck.active] : [];
  const middle = Array.isArray(deck.middle) ? [...deck.middle] : [];
  if (active.includes(cardId)) return { ...deck, active, middle };
  const filteredMiddle = middle.filter(id => id !== cardId);
  active.push(cardId);
  return {
    ...deck,
    active,
    middle: filteredMiddle,
    completed: Math.max(0, Number(deck.completed || 0) - 1)
  };
}

const SRS_FIRST_DAY_MS = 22 * 60 * 60 * 1000;
const SRS_FULL_DAY_MS = 24 * 60 * 60 * 1000;

function daysFromDelayMs(ms) {
  if (!(ms > 0)) return 0;
  if (ms <= SRS_FIRST_DAY_MS) return ms / SRS_FIRST_DAY_MS;
  return 1 + (ms - SRS_FIRST_DAY_MS) / SRS_FULL_DAY_MS;
}

function cloneProgressState(state = {}) {
  return {
    ...state,
    items: { ...(state.items || {}) },
    vocabDirections: {
      i2e: { ...(state.vocabDirections?.i2e || {}) },
      e2i: { ...(state.vocabDirections?.e2i || {}) }
    }
  };
}

function locateProgressEntry(state, cardId, direction) {
  const dir = direction === 'e2i' ? 'e2i' : 'i2e';
  if (state.vocabDirections?.[dir]?.[cardId]) return { store: state.vocabDirections[dir], key: cardId };
  if (dir === 'i2e' && state.items?.[cardId]) return { store: state.items, key: cardId };
  return null;
}

export function advanceVocabSchedule(state, cards = [], advanceMs, now = Date.now(), direction = 'i2e') {
  const next = cloneProgressState(state);
  const amount = Math.max(0, Number(advanceMs) || 0);
  for (const card of cards) {
    const located = locateProgressEntry(next, card?.id, direction);
    if (!located) continue;
    const current = located.store[located.key];
    if (!(current?.dueAt > now)) continue;
    const dueAt = Math.max(now, current.dueAt - amount);
    located.store[located.key] = {
      ...current,
      dueAt,
      intervalDays: Math.max(0, daysFromDelayMs(dueAt - now))
    };
  }
  return next;
}

export function returnCardProgressNow(state, cardId, now = Date.now(), direction = 'i2e') {
  const next = cloneProgressState(state);
  const located = locateProgressEntry(next, cardId, direction);
  if (!located) return next;
  const current = located.store[located.key];
  located.store[located.key] = {
    ...current,
    dueAt: now,
    intervalDays: 0,
    streak: 0,
    easyStreak: 0,
    srsStage: Math.max(0, Math.floor(Number(current.srsStage) || 0) - 1)
  };
  return next;
}
