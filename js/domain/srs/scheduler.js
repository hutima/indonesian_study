// SRS scheduling logic — pure functions, no state access
import { SRS_DAY_MS, SRS_FULL_DAY_MS, SRS_AGAIN_MS, SRS_UNSPACED_RECOVERY_MS, DEFAULT_SRS_CADENCE, getCadencePreset } from './constants.js';
import { clamp } from '../../utils/helpers.js';

// Default cadence preset used when a caller doesn't pass one (keeps these pure
// functions, their unit-callers, and any legacy call site on the historical
// 2-month tuning).
const DEFAULT_CADENCE = getCadencePreset(DEFAULT_SRS_CADENCE);

// Confidence → "easy" growth multiplier for a cadence's piecewise curve.
function easyMultiplierFor(recentPct, curve) {
  if (recentPct >= 90) return curve.high;
  if (recentPct >= 70) return curve.midBase + (recentPct - 70) / curve.midDiv;
  return curve.lowBase + (recentPct - 50) / curve.lowDiv;
}

// An N-day interval is due in 24N - 2 hours: the first day is pulled in 2h
// (SRS_DAY_MS = 22h) and every later day is a full calendar day
// (SRS_FULL_DAY_MS = 24h), so a card's due time never drifts later into a day.
// Fractional sub-day intervals scale by the first-day rate. msFromDays and
// daysFromMs are exact inverses (integer day counts round-trip).
export function msFromDays(days) {
  if (!(days > 0)) return 0;
  if (days <= 1) return Math.round(days * SRS_DAY_MS);
  return Math.round(SRS_DAY_MS + (days - 1) * SRS_FULL_DAY_MS);
}

export function daysFromMs(ms) {
  if (!(ms > 0)) return 0;
  if (ms <= SRS_DAY_MS) return ms / SRS_DAY_MS;
  return 1 + (ms - SRS_DAY_MS) / SRS_FULL_DAY_MS;
}

export function msFromHours(hours) {
  return Math.round(hours * 60 * 60 * 1000);
}

export function setProgressDelay(progress, delayMs, now = Date.now()) {
  progress.intervalDays = daysFromMs(delayMs);
  progress.dueAt = now + delayMs;
}

export function getRemainingProgressDelayMs(progress, now = Date.now()) {
  if (!progress || !progress.dueAt) return 0;
  return Math.max(0, progress.dueAt - now);
}

export function setMinimumProgressDelay(progress, minimumDelayMs, now = Date.now()) {
  const remainingDelayMs = getRemainingProgressDelayMs(progress, now);
  if (remainingDelayMs < minimumDelayMs) {
    setProgressDelay(progress, minimumDelayMs, now);
    return true;
  }
  progress.intervalDays = daysFromMs(remainingDelayMs);
  return false;
}

export function getSrsEase(progress) {
  const rawEase = Number(progress?.ease);
  const safeEase = Number.isFinite(rawEase) ? rawEase : 2.3;
  progress.ease = clamp(safeEase, 1.3, 3.0);
  return progress.ease;
}

export function getSrsStage(progress) {
  const rawStage = Number(progress?.srsStage);
  return Number.isFinite(rawStage) ? Math.max(0, Math.floor(rawStage)) : 0;
}

export function getLastEasyIntervalDays(progress) {
  const rawDays = Number(progress?.lastEasyIntervalDays);
  return Number.isFinite(rawDays) ? Math.max(0, rawDays) : 0;
}

export function getNextEasyIntervalDays(progress, cadence = DEFAULT_CADENCE) {
  const history = Array.isArray(progress?.confidenceHistory)
    ? progress.confidenceHistory.filter(Number.isFinite)
    : [];
  const recentPct = history.length
    ? (history.reduce((s, v) => s + v, 0) / history.length) * 100
    : 0;

  // Stabilization: while the card has fewer than 5 recorded flips, or its
  // last-10-flip confidence is under 50%, cap "easy" at 1 study day so the
  // card has to reappear at least 5 times at high confidence before any
  // longer interval is unlocked. (Same for both cadences.)
  if (history.length < 5 || recentPct < 50) return 1;

  // Post-stabilization: confidence-scaled multiplier on the previous interval.
  // Growth is gradual rather than a hard jump to the cap; the cadence preset
  // sets the curve and the cap (intensive 1 → 3 → 8 → 14; relaxed base
  // 1 → 4 → 14 → 49 → 120, then modulated per-card below).
  let multiplier = easyMultiplierFor(recentPct, cadence.easyCurve);
  if (cadence.useCardDifficulty) {
    // Blend the card's persistent ease (per-card difficulty, 1.3–3.0) into the
    // confidence multiplier: a stubborn card grows slower, a consistently-easy
    // one faster. Neutral at the cadence's reference ease so a fresh card still
    // matches the base curve; the minNext floor below keeps even a hard card
    // growing by at least 1 day rather than shrinking.
    const neutralEase = cadence.difficultyNeutralEase || 2.3;
    multiplier *= getSrsEase(progress) / neutralEase;
  }

  const previousDays = Math.max(
    1,
    getLastEasyIntervalDays(progress),
    Number.isFinite(Number(progress?.intervalDays)) ? Math.max(0, Number(progress.intervalDays)) : 0
  );
  const proposedDays = previousDays * multiplier;
  const minNext = Math.ceil(previousDays + 1);
  let cappedDays = Math.min(cadence.maxIntervalDays, Math.max(Math.round(proposedDays), minNext));

  // Per-step cap: a single 'easy' may add at most maxEasyStepDays. Keeps the
  // relaxed ramp gentle/near-linear (14 → 28 → 42 → 56 → 60 rather than a
  // steep 14 → 49 → 120 jump) and makes the first 2-month → 8-month step a
  // smooth 14 → 28. Never pulls below the minNext floor, so a card still grows
  // by at least a day. Intensive leaves it unset (its ramp never steps >14).
  if (Number.isFinite(cadence.maxEasyStepDays)) {
    const stepCappedDays = Math.max(minNext, Math.round(previousDays + cadence.maxEasyStepDays));
    cappedDays = Math.min(cappedDays, stepCappedDays);
  }
  return cappedDays;
}

export function formatRemainingForTable(dueAt) {
  const now = Date.now();
  if (!dueAt || dueAt <= now) return 'now';
  const remaining = dueAt - now;
  if (remaining > 12 * 60 * 60 * 1000) {
    return `${Math.max(1, Math.ceil(daysFromMs(remaining)))}d`;
  }
  if (remaining >= 60 * 60 * 1000) {
    return `${Math.max(1, Math.ceil(remaining / (60 * 60 * 1000)))}h`;
  }
  return `${Math.max(1, Math.ceil(remaining / (60 * 1000)))}m`;
}

// Apply unspaced schedule — takes cycleState and progress as arguments
export function applyUnspacedSchedule(progress, cycleEntry, outcome, reviewedAt = Date.now()) {
  const normalizedOutcome = outcome === 'easy' ? 'easy' : outcome === 'pass' ? 'pass' : 'again';

  if (normalizedOutcome === 'again') {
    cycleEntry.wrongThisCycle = true;
    cycleEntry.lastOutcome = 'again';
    setProgressDelay(progress, SRS_AGAIN_MS, reviewedAt);
    return progress;
  }

  const recoveringFromMiss = cycleEntry.wrongThisCycle;
  const minimumDelayMs = (normalizedOutcome === 'pass' || recoveringFromMiss)
    ? SRS_UNSPACED_RECOVERY_MS
    : SRS_DAY_MS;

  cycleEntry.correctCount += 1;
  cycleEntry.lastOutcome = normalizedOutcome;
  setMinimumProgressDelay(progress, minimumDelayMs, reviewedAt);
  return progress;
}
