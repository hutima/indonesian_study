// SRS scheduling constants

// Day model (see msFromDays/daysFromMs in scheduler.js): an N-day interval is
// due in 24N - 2 hours. The FIRST day is pulled in 2h (SRS_DAY_MS = 22h) so a
// daily card settles a touch earlier than its first review; every later day is
// a full calendar day (SRS_FULL_DAY_MS = 24h), so the cadence tracks the
// calendar and a card is never pushed later into a day. 1d = 22h, 2d = 46h,
// 3d = 70h, …
export const SRS_DAY_MS = 22 * 60 * 60 * 1000;
export const SRS_FULL_DAY_MS = 24 * 60 * 60 * 1000;
export const SRS_AGAIN_MS = 5 * 60 * 1000;
// 2h re-test floor — used both for an Uncertain lapse's single confirming pass
// and as the variant-form ROUND WINDOW: a "split card" set has 2h from when its
// first face is seen to clear every face, after which the round is closed out
// (its confidence recorded, unreached faces counting 0%) and a fresh one begins.
export const SRS_UNCERTAIN_MIN_MS = 2 * 60 * 60 * 1000;
export const SRS_VARIANT_HOLD_MS = SRS_UNCERTAIN_MIN_MS;
// Unspaced recovery delay is decoupled from the spaced uncertain floor — bumping
// the spaced floor (to give Again's middle-dump behaviour room) shouldn't slow
// the unspaced flip-deck cycle down.
export const SRS_UNSPACED_RECOVERY_MS = 60 * 60 * 1000;    // 1h
// Stabilization rule (in scheduler.js): "easy" caps at 1 day until the card
// has 5+ recent flips AND ≥50% confidence. Then confidence-scaled growth
// ramps 1 → 3 → 8 → 14 at top confidence rather than jumping to the cap.
export const SRS_MAX_INTERVAL_DAYS = 14;

// ── Lapse / relearn ladder ───────────────────────────────────────────────
// A lapse (Uncertain or Hard) no longer wipes a well-known card's spacing.
// Instead the card runs a short relearn ladder and then RESUMES at half its
// pre-lapse interval (preserved on the entry so the ladder steps don't
// overwrite it). Caps on the resumed interval are per-cadence
// (lapseResumeCapDays). See applySpacedReview in js/app/main.js.
//   • Uncertain → one confirming pass in 2h, then resume at ½ previous.
//   • Hard      → relearn in-session (due now), then SRS_HARD_RELEARN_STEPS
//                 passes one day apart, then resume at ½ previous.
export const SRS_RELEARN_STEP_DAYS = 1;
export const SRS_HARD_RELEARN_STEPS = 2;

// ── Leech (8-month / relaxed cadence only) ───────────────────────────────
// A card that keeps lapsing Hard gets pulled out of normal growth and drilled
// at 1 day until it survives a short clean streak, then rejoins the curve.
export const LEECH_LAPSE_THRESHOLD = 4;   // Hard lapses before the card is a leech
export const LEECH_UNPIN_STREAK = 3;      // clean reviews in a row to rejoin growth
export const LEECH_DRILL_DAYS = 1;        // interval while drilling

// ── Spacing-cadence presets ──────────────────────────────────────────────
// The "easy" interval growth and the hard cap are tuned to how long the
// course runs. A 2-month intensive wants tight intervals so everything
// resurfaces before the next weekly quiz; an 8-month course can let
// well-known cards rest far longer between reviews. Each preset supplies:
//   maxIntervalDays      — hard cap on any scheduled interval (in 20 h days)
//   easyCurve            — confidence → "easy" growth multiplier, piecewise:
//                          ≥90% → high; 70–89% → midBase+(pct-70)/midDiv;
//                          50–69% → lowBase+(pct-50)/lowDiv
// Each preset also supplies:
//   lapseResumeCapDays — cap on the ½-previous interval a lapse resumes at
//   maxEasyStepDays    — cap on how many days a single "easy" step may add
//                        (keeps the relaxed ramp gentle/near-linear and makes
//                        a 2-month → 8-month switch step 14 → 28, not a leap)
//   leechEnabled       — whether repeated Hard lapses trigger the 1-day leech
//                        drill (8-month only)
// `intensive` reproduces the historical 2-month behaviour, so it stays the
// default and existing schedules are unchanged.
export const SRS_CADENCE_PRESETS = {
  intensive: {
    id: 'intensive',
    label: '2-month intensive',
    maxIntervalDays: SRS_MAX_INTERVAL_DAYS,      // top-confidence ramp 1 → 3 → 8 → 14
    lapseResumeCapDays: 7,                        // resume a lapse at ½ prev, ≤ 7d
    easyCurve: { high: 2.5, midBase: 1.5, midDiv: 40, lowBase: 1.2, lowDiv: 100 },
    leechEnabled: false,
    // Course is short — a global confidence curve is enough; per-card
    // difficulty doesn't have time to matter.
    useCardDifficulty: false
  },
  relaxed: {
    id: 'relaxed',
    label: '8-month / continuous review',
    // Gentle near-linear top: neutral-ease ramp 14 → 28 → 42 → 56 → 60, capped
    // at 60 days (~2 months ≈ 4× the 14-day intensive cap). The shape comes
    // from a lower high-confidence multiplier (2.0) plus the +14/step cap.
    maxIntervalDays: 60,
    maxEasyStepDays: 14,
    lapseResumeCapDays: 14,                       // resume a lapse at ½ prev, ≤ 14d
    easyCurve: { high: 2.0, midBase: 1.5, midDiv: 40, lowBase: 1.3, lowDiv: 40 },
    leechEnabled: true,
    // Long horizon → blend each card's persistent ease (1.3–3.0) into the easy
    // growth: a stubborn card crawls (ease 1.3 → 14 → 16 → 18 …), a
    // consistently-easy one stretches to the cap fast. This lets the 8-month
    // mode double as an indefinite retention deck (mastered cards drop to a low
    // review load). Neutral at the default ease (2.3) so a fresh card matches
    // the base curve.
    useCardDifficulty: true,
    difficultyNeutralEase: 2.3
  }
};
export const DEFAULT_SRS_CADENCE = 'intensive';
export function getCadencePreset(id) {
  return SRS_CADENCE_PRESETS[id] || SRS_CADENCE_PRESETS[DEFAULT_SRS_CADENCE];
}

export const SRS_NEAR_WINDOW_MS = 30 * 60 * 1000;
export const SRS_CYCLE_ADVANCE_MS = 60 * 60 * 1000;
// Idle gap that ends a study session. Used by spaced-mode buildStudyDeck to
// decide "fresh start" (middle → active dump + reshuffle), and by the
// persistence layer to decide whether to restore the saved active/middle
// membership across reloads. Resets on any study interaction (vocab,
// grammar, or reader — anything that fires noteStudyInteraction).
export const SESSION_IDLE_RESET_MS = 5 * 60 * 60 * 1000;
