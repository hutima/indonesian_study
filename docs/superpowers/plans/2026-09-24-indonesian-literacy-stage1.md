# Indonesian Literacy Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an offline, extensible Indonesian recognition app with vocabulary, morphology steps, and a graded reading sample.

**Architecture:** Preserve the Duff source as a reference and replace the entrypoint with small ES modules. Curated unit modules feed a generic renderer and stable-ID progress store. A versioned service worker caches every runtime asset.

**Tech Stack:** Static HTML/CSS, browser ES modules, localStorage, service worker, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-24-indonesian-literacy-design.md`

## Global Constraints

- No runtime internet requirement, accounts, analytics, audio, speaking, or free-text grading.
- All scored answers are curated multiple choice or self-rated vocabulary cards.
- Stable item IDs; adding a new unit changes its content module and manifest only.
- Preserve source attribution and existing repo history; publish work on `codex/indonesian-stage1` for review.

## Review Focus

- Duplicate IDs or a wrong answer absent from choices: validator rejects the pack.
- Special characters in authored text: renderer inserts text safely.
- Progress after adding/reordering units: prior marks survive by ID.
- Offline reload after first visit: shell and content remain available.
- A context-dependent form: answer follows the curated sentence, with an explanation.

---

### Task 1: Content contract and starter unit

**Files:** Create `content/units/unit01.js`, `content/manifest.js`, `scripts/validate-content.mjs`, `tests/content.test.mjs`.

**Interfaces:** `manifest.js` exports `UNITS`; each unit has `id`, `title`, `level`, `vocabulary`, `morphology`, and `readings`. Morphology steps have `prompt`, `choices`, `answer`, `explanation`.

- [ ] Write a failing Node test that imports the manifest and asserts unique IDs, every step's answer occurs exactly once in 2–4 choices, and every reading question refers to its own passage.
- [ ] Run `node --test tests/content.test.mjs` and observe failure.
- [ ] Add a first curated pack featuring `tulis`, `baca`, `selesai`, `kirim`, and contextual affix forms, plus one short original passage.
- [ ] Add `scripts/validate-content.mjs` to check the contract and exit nonzero with readable errors; test it with a deliberately invalid in-memory pack.
- [ ] Run `node --test tests/content.test.mjs` and `node scripts/validate-content.mjs`; commit.

### Task 2: Offline study app and stable progress

**Files:** Replace `index.html`; create `app.js`, `app.css`, `progress.js`, `tests/progress.test.mjs`; replace `sw.js`, `manifest.json`, and `README.md`.

**Interfaces:** `progress.js` exports `loadProgress(storage)`, `saveProgress(storage, state)`, and `recordAnswer(state, id, result)`; UI imports `UNITS` and uses IDs as progress keys.

- [ ] Write a failing test for stable progress after item reorder and malformed stored JSON.
- [ ] Run `node --test tests/progress.test.mjs` and observe failure.
- [ ] Implement the progress functions and focused test; run it until passing.
- [ ] Implement cumulative unit selection, vocabulary cards, one-step-at-a-time morphology choices with explanations, graded reading, and safe DOM text insertion.
- [ ] Cache only current app assets in a versioned service worker and remove all analytics/network dependencies from the new entrypoint.
- [ ] Run all Node tests, validate content, and perform browser/offline manual checks; commit.

### Task 3: Expandable question supply and review

**Files:** Extend `content/units/` with another pack, update `content/manifest.js`, `tests/content.test.mjs`, and docs.

- [ ] Add a second unit that advances from familiar sentences to simple formal prose and contrasts active and passive forms.
- [ ] Assert the new pack passes validation and prior stable progress still reads.
- [ ] Recheck offline precache inventory, all tabs, and reload; commit.

## Execution

Implement on the review branch with a lower-cost agent for curated content and the parent agent for integration and verification. Review each content pack for meaning, register, and distractor quality before publishing.
