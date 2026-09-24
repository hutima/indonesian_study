import { getCadencePreset, SRS_AGAIN_MS, SRS_UNCERTAIN_MIN_MS, SRS_HARD_RELEARN_STEPS, SRS_RELEARN_STEP_DAYS, LEECH_LAPSE_THRESHOLD, LEECH_UNPIN_STREAK, LEECH_DRILL_DAYS } from './js/domain/srs/constants.js';
import { getNextEasyIntervalDays, msFromDays, getSrsEase, getSrsStage } from './js/domain/srs/scheduler.js';

const KEY = 'indonesian-study-progress-v1';
const safeId = id => typeof id === 'string' && /^[a-z0-9][a-z0-9._-]{1,80}$/i.test(id) && id !== '__proto__' && id !== 'constructor';
const count = n => Number.isFinite(n) && n > 0 ? Math.min(1000000, Math.floor(n)) : 0;
const days = n => Number.isFinite(n) && n > 0 ? Math.min(60, n) : 0;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function normalizeProgress(input) {
  const items = {};
  if (input && input.version === 1 && input.items && typeof input.items === 'object' && !Array.isArray(input.items)) {
    for (const [id, value] of Object.entries(input.items)) {
      if (!safeId(id) || !value || typeof value !== 'object') continue;
      const item = { correct: count(value.correct), wrong: count(value.wrong), last: count(value.last) };
      for (const key of ['dueAt', 'streak', 'easyStreak', 'srsStage', 'relearnLeft', 'lapseCount', 'leechStreak']) {
        if (Object.hasOwn(value, key)) item[key] = count(value[key]);
      }
      for (const key of ['intervalDays', 'lastEasyIntervalDays', 'preLapseIntervalDays']) {
        if (Object.hasOwn(value, key)) item[key] = days(value[key]);
      }
      if (Object.hasOwn(value, 'ease')) item.ease = Number.isFinite(value.ease) ? clamp(value.ease, 1.3, 3) : 2.3;
      if (Array.isArray(value.confidenceHistory)) item.confidenceHistory = value.confidenceHistory.filter(n => Number.isFinite(n) && n >= 0 && n <= 1).slice(-10);
      if (Object.hasOwn(value, 'inRelearn')) item.inRelearn = value.inRelearn === true;
      if (Object.hasOwn(value, 'leechDrill')) item.leechDrill = value.leechDrill === true;
      items[id] = item;
    }
  }
  return { version: 1, items };
}

export function loadProgress(storage) {
  try { return normalizeProgress(JSON.parse(storage.getItem(KEY))); }
  catch { return normalizeProgress(null); }
}
export function saveProgress(storage, state) { storage.setItem(KEY, JSON.stringify(normalizeProgress(state))); }

export function recordAnswer(state, id, result) {
  const next = normalizeProgress(state);
  if (!safeId(id) || !['correct', 'wrong'].includes(result)) return next;
  const previous = Object.hasOwn(next.items, id) ? next.items[id] : { correct: 0, wrong: 0, last: 0 };
  next.items[id] = { ...previous, [result]: Math.min(1000000, previous[result] + 1), last: Date.now() };
  return next;
}

// Duff's relaxed (8-month) cadence: the same stabilization, confidence/ease
// growth, short relearn ladders, and leech drill, applied to Indonesian words.
const cadence = getCadencePreset('relaxed');
function schedule(item, interval, now) {
  item.intervalDays = interval;
  item.dueAt = now + msFromDays(interval);
}
function resume(item, now) {
  const interval = clamp((item.preLapseIntervalDays || 0) / 2, SRS_RELEARN_STEP_DAYS, cadence.lapseResumeCapDays);
  item.inRelearn = false; item.relearnLeft = 0;
  item.streak = count(item.streak) + 1;
  item.easyStreak = count(item.easyStreak) + 1;
  item.lastEasyIntervalDays = interval;
  schedule(item, interval, now);
}
function grow(item, now) {
  const interval = getNextEasyIntervalDays(item, cadence);
  item.streak = count(item.streak) + 1;
  item.easyStreak = count(item.easyStreak) + 1;
  item.srsStage = getSrsStage(item) + 1;
  item.ease = clamp(getSrsEase(item) + .08, 1.3, 3);
  item.lastEasyIntervalDays = interval;
  schedule(item, interval, now);
}
export function recordVocabReview(state, id, rating, spaced = true, now = Date.now()) {
  if (!['again', 'unsure', 'know'].includes(rating)) return normalizeProgress(state);
  const next = recordAnswer(state, id, rating === 'know' ? 'correct' : 'wrong');
  if (!Object.hasOwn(next.items, id)) return next;
  const item = next.items[id];
  item.last = now;
  if (!spaced) return next;
  const history = Array.isArray(item.confidenceHistory) ? item.confidenceHistory : [];
  item.confidenceHistory = [...history, { again: 0, unsure: .5, know: 1 }[rating]].slice(-10);
  if (rating === 'again') {
    item.streak = 0; item.easyStreak = 0;
    item.srsStage = Math.max(0, getSrsStage(item) - 1);
    item.ease = clamp(getSrsEase(item) - .2, 1.3, 3);
    item.lapseCount = count(item.lapseCount) + 1;
    if (item.leechDrill || item.lapseCount >= LEECH_LAPSE_THRESHOLD) {
      item.leechDrill = true; item.leechStreak = 0;
      item.inRelearn = false; item.relearnLeft = 0;
      item.lastEasyIntervalDays = LEECH_DRILL_DAYS;
      schedule(item, LEECH_DRILL_DAYS, now);
    } else {
      if (!item.inRelearn) item.preLapseIntervalDays = Math.max(days(item.lastEasyIntervalDays), days(item.intervalDays));
      item.inRelearn = true; item.relearnLeft = SRS_HARD_RELEARN_STEPS;
      item.intervalDays = 0; item.dueAt = now + SRS_AGAIN_MS;
    }
  } else if (item.leechDrill) {
    item.leechStreak = count(item.leechStreak) + 1;
    if (item.leechStreak < LEECH_UNPIN_STREAK) {
      item.streak = count(item.streak) + 1;
      schedule(item, LEECH_DRILL_DAYS, now);
    } else {
      item.leechDrill = false; item.leechStreak = 0; item.lapseCount = 0;
      item.lastEasyIntervalDays = LEECH_DRILL_DAYS;
      grow(item, now);
    }
  } else if (item.inRelearn) {
    if (item.relearnLeft > 0) {
      item.relearnLeft -= 1; item.streak = count(item.streak) + 1;
      schedule(item, SRS_RELEARN_STEP_DAYS, now);
    } else resume(item, now);
  } else if (rating === 'unsure') {
    item.preLapseIntervalDays = Math.max(days(item.lastEasyIntervalDays), days(item.intervalDays));
    item.inRelearn = true; item.relearnLeft = 0;
    item.streak = count(item.streak) + 1; item.easyStreak = 0;
    item.intervalDays = 0; item.dueAt = now + SRS_UNCERTAIN_MIN_MS;
  } else grow(item, now);
  return next;
}
export function dueVocab(cards, state, now = Date.now()) {
  return cards.filter(card => !state.items?.[card.id]?.dueAt || state.items[card.id].dueAt <= now);
}
