# Duff SRS Session Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Indonesian vocabulary review panel count the live spaced-review session the same way as the Duff Greek app, including cards requeued during the current pass.

**Architecture:** Keep persisted SRS scheduling unchanged. Expose a read-only snapshot of the current vocabulary deck from `app.js`; the bottom review panel intersects that live active/middle queue with its selected cards and passes those IDs into the due histogram so current-session cards remain in `now` even when their persisted `dueAt` is later.

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
- Direction changes cannot reuse a stale session snapshot.
- Unspaced mode keeps its existing behavior.

---

### Task 1: Pin the histogram regression

**Files:**
- Test: `tests/vocab-charts.test.mjs`
- Modify: `vocab-charts.js`

- [x] Add a failing test showing a live repeat-queue card with a future `dueAt` must be counted in `now`.
- [x] Run the regression test and confirm it fails on the current implementation.
- [ ] Add an optional live-session ID set to `dueBuckets()` and prioritize it over persisted `dueAt` bucketing.
- [ ] Run the test and confirm it passes.

### Task 2: Drive bottom-panel stats from the live deck

**Files:**
- Modify: `app.js`
- Modify: `vocab-review-panel.js`

- [ ] Export a read-only vocabulary session snapshot containing active IDs, middle IDs, spaced mode, and direction.
- [ ] In the bottom review panel, use a matching spaced/direction snapshot to compute `In deck`, `Due now`, `Due later`, and the histogram `now` bucket.
- [ ] Fall back to the existing persisted-due calculation when no matching live session exists.

### Task 3: Release and verify

**Files:**
- Modify: `sw.js`

- [ ] Bump the service-worker cache version.
- [ ] Run the full Node test suite and content validation.
- [ ] Review the branch diff, open a PR, verify available GitHub checks, and merge.
