# Duff SRS Session Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Indonesian vocabulary review panel count the live spaced-review session the same way as the Duff Greek app, including cards requeued during the current pass.

**Architecture:** Keep persisted SRS scheduling unchanged. The bottom panel maintains a shadow active/middle session using the same pure `reviewVocab()` transition function as the real study deck; it feeds that live session into the due histogram so current-session cards remain in `now` even when their persisted `dueAt` is later. This avoids duplicating scheduler rules while keeping the panel decoupled from `app.js` module-local state.

**Tech Stack:** Browser ES modules, Node built-in test runner, service worker cache.

**Spec:** User-reported regression in the current conversation: after a full spaced deck pass, repeated cards must remain represented in the bottom Duff-style progress panel.

## Global Constraints

- Do not alter SRS interval calculations or `dueVocab()` semantics.
- Preserve directional Indonesian→English / English→Indonesian progress.
- Scope live-session counts to the currently selected vocabulary cards.
- Bump `sw.js` cache version for the deployed change.

## Review Focus

- A Hard/Again card with future `dueAt` remains in the `now` bucket while it is in the live repeat queue.
- Deferred scheduled cards remain in their actual future day buckets.
- Cards outside the selected deck cannot inflate session counts.
- Direction/spaced/deck changes cannot reuse a stale session snapshot.
- Unspaced mode keeps its existing behavior.

**Ruling:** Instead of exporting `app.js`'s module-local deck, mirror its live piles in the panel through the already-pure `reviewVocab()` function. This keeps the fix confined to the Duff-port layer and its shared deck primitive; the cost is a small event bridge for rating/undo actions.

---

### Task 1: Pin the histogram regression

**Files:**
- Test: `tests/vocab-charts.test.mjs`
- Modify: `vocab-charts.js`

- [x] Add a failing test showing a live repeat-queue card with a future `dueAt` must be counted in `now`.
- [x] Run the regression test and confirm it fails on the current implementation.
- [x] Add an optional live-session ID set to `dueBuckets()` and prioritize it over persisted `dueAt` bucketing.
- [x] Run the focused test and confirm it passes.

### Task 2: Drive bottom-panel stats from the live deck

**Files:**
- Modify: `vocab-review-state.js`
- Modify: `vocab-review-panel.js`
- Test: `tests/vocab-review-panel.test.mjs`

- [x] Add a failing test for active/middle pile rollover across a repeated spaced pass.
- [x] Add pure helpers that create and advance the shadow session through `reviewVocab()`.
- [x] Use the shadow session for `In deck`, `Due now`, `Due later`, row due labels, and the histogram `now` bucket.
- [x] Track click/keyboard ratings and undo; reset the shadow session when spaced review, deck selection, import/reset, or explicit due-card refresh creates a new study session.
- [x] Run focused green tests for the session transition and histogram regression.

### Task 3: Release and verify

**Files:**
- Modify: `sw.js`

- [x] Bump the service-worker cache version from v22 to v23.
- [ ] Run available repository-wide verification and inspect the final diff.
- [ ] Open a PR, verify available GitHub checks, and merge.
