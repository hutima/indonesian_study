# `index.html` structure notes

Navigation map for the compact Indonesian Study shell. Keep this document in
sync with `index.html` when JS-facing IDs or major sections change.

The app is intentionally much smaller than the Duff source app. Do not copy
Duff's overlay/analytics structure into this document unless that markup
actually exists here.

## Top-level layout

```
<head>
  PWA/theme metadata
  manifest + app.css + review-panel.css
<body>
  .topbar
  main.layout
    section.workspace
      .study-controls
      nav.tabs
      #vocab-deck-wrap
      #vocab-section-wrap
      #study-panel
      #ff-row
      #review-shell
      #word-list
      .study-resources
  footer
  #lesson-dialog
  #progress-dialog
  #update-dialog
  module scripts: app.js, review-panel.js
```

## Main study shell

### `.topbar`

- Brand / app name.
- `#offline-status` reports whether the offline shell/content cache is ready.

### `.study-controls`

- `#open-lessons`: opens the lesson/topic selector.
- `#shuffle-button`: first-class vocabulary/morphology deck shuffle control.
- `#direction-toggle`: first-class vocabulary direction control. It stays
  outside Settings because English → Indonesian is active-production practice,
  not merely an alternate display direction. The preference persists locally.
  The two directions share a canonical word/card ID but have independent SRS
  entries, confidence histories, review streaks, and due dates.
- `#open-progress`: opens the Duff-style Progress modal; gamification no
  longer occupies permanent space in the study flow.
- `#selection-summary`: compact description of the current lesson selection.
- `#shuffle-button`: Vocabulary/Morphology shuffle toggle.
- `#morph-direction-button`: Morphology direction toggle; hidden outside that
  mode.
- `#settings-panel`: theme, vocabulary options, and progress import/export.
- `#vocab-toolbar`: vocabulary-only settings inside the settings disclosure.
- `#spaced-toggle`: spaced vs full-deck review.
- `#direction-toggle`: Indonesian→English vs English→Indonesian.

### `nav.tabs`

Four study modes, selected with buttons carrying `data-mode`:

- `vocabulary`
- `morphology`
- `grammar`
- `reading`

### Vocabulary controls

- `#vocab-deck-wrap` / `#vocab-deck`: switches among:
  - normal lesson vocabulary;
  - active personal **Struggling words**;
  - **Completed focus words** archive.
- `#vocab-section-wrap` / `#vocab-section`: lesson-vocabulary subsection
  filter (All words, Lesson words, Affix families, Formal reading, Everyday
  recognition). It is hidden while a personal focus deck is selected.

Personal focus deck data lives in `content/vocab/custom-focus.js`; maintenance
rules are in `docs/curriculum/custom-vocabulary.md`.

### `#study-panel`

Main dynamic mount for flashcards and questions. Vocabulary cards also render an
expandable **Card stats** panel here with per-card review counts, current streak,
confidence, due time, and last-seen time.

### Duff-style vocabulary review panel

Vocabulary mode keeps Duff's compact deck-status panel directly below the card:

- `#ff-row` contains `#fast-forward-day` and `#fast-forward-week`. These are
  spaced-review testing controls that move only the currently selected
  vocabulary deck and direction closer to its due dates.
- `#review-shell` / `#review-panel` is hidden outside Vocabulary mode.
- `#review-deck-tag` names the current full/filtered/focus deck; progress is
  still direction-specific even though Indonesian and English remain side by
  side in the row list.
- `#review-stats` shows In deck, Due now/Unconfirmed, Due later/Archived, high
  confidence, low confidence, and the collapsible due-by-day schedule.
- `#review-sort-row` switches the reviewed-card list among Last seen, A–Z, and
  Confidence ordering.
- `#review-list` contains only cards already reviewed in the current direction.
  Each row includes Indonesian, English, due/seen/confidence metadata, a
  confidence mark, and a × control that returns that word to circulation.

`review-panel.js` owns this view. `vocab-review.js` contains its pure deck/count,
sort, fast-forward, and return-to-circulation helpers. `vocab-deck.js` publishes
its live deck/progress references through `globalThis.__indonesianVocabDeckBridge`
so the ported panel can mirror the current in-flight rotation without moving the
existing study-state implementation into a second scheduler.

### `#word-list`

Collapsible vocabulary browser. In lesson mode it groups words by selected
Topik/section. In a personal focus deck it lists that deck directly and includes
the focus source metadata.

### `.study-resources`

Collapsible **Lesson notes** area containing:

- `#unit-description`
- `#lesson-guide`

The bottom review panel is the immediate deck/SRS dashboard; broader progress
analytics remain in the dedicated modal.

## Lesson selector dialog

`#lesson-dialog` contains:

- `#lesson-dialog-title`
- `#close-lessons`
- `#lesson-vocab-section` (lesson vocabulary focus)
- `#select-all-topics`
- `#clear-lessons`
- `#lesson-grid`
- `#foundation-grid`
- `#dialog-selection-summary`
- `#done-lessons`

The personal focus deck is intentionally not maintained from this dialog; it is
selected from `#vocab-deck` and edited in the repository data module.

## Progress dialog

`#progress-dialog` restores the compact Duff pattern: the main study surface
has a single Progress button and analytics live in a modal.

It contains:

- `#progress-hero`: current level/title, XP progress, current and longest
  streaks, today's review count, and total scored reviews;
- `#achievement-grid` + `#achievement-count`: daily-use, review-milestone,
  streak, and card-mastery achievements;
- `#activity-grid`: the last 28 days of scored-review activity;
- `#vocab-analytics`: a 100% stacked proficiency bar plus due-by-day schedule
  for only the currently selected vocabulary deck **and direction**. It does
  not use course-wide vocabulary totals;
- `#title-ladder`: all Indonesian rank titles and XP thresholds.

New rank and achievement events use a Duff-style temporary
`.level-toast-host` celebration banner created dynamically by `app.js`.
Celebration state is persisted with the gamification record so an Undo does not
spam the same badge repeatedly; the daily badge can be earned again on a later
day.

Vocabulary review progress is stored directionally under
`vocabDirections.i2e` and `vocabDirections.e2i`. Older blended vocabulary
entries in `items` are used only as an Indonesian → English fallback until
that card is reviewed again; they are never copied into production history.

## Update dialog

`#update-dialog` is shown when the service worker has a waiting update.

- `#update-later`
- `#update-now`

The app only activates the waiting worker immediately when the user chooses
Refresh now; otherwise the old version remains usable.

## Script entry points

The page scripts are:

```html
<script type="module" src="./app.js"></script>
<script type="module" src="./review-panel.js"></script>
```

`app.js` imports the content manifest, personal focus vocabulary, progress/SRS
helpers, deck ordering, charts, lesson selection, vocabulary section logic, and
morphology helpers. `review-panel.js` layers the Duff-style bottom progress
panel over the same selected vocabulary and directional progress state.

## Offline/cache coupling

`sw.js` precaches the shell and accepts the content URLs supplied through
`UNIT_URLS` in `content/manifest.js`. The shell now also precaches
`review-panel.js`, `review-panel.css`, and `vocab-review.js`.

When adding a new runtime content module:

1. register it in `UNIT_URLS` when it belongs to the content pack;
2. ensure `sw.js` allows that URL in its `CACHE_CONTENT` validation;
3. add it to the shell as well when the module is imported directly by a page
   module and must be available immediately offline;
4. bump the `indonesian-study-vNN` cache name.

## Maintenance

Update this document in the same change when:

- a major in-flow section is added, removed, renamed, or reordered;
- a JS-referenced `id` is added, removed, or renamed;
- a dialog is added or removed;
- the module entry point or offline-cache relationship changes.

Line numbers are intentionally omitted: this file is a structural map, not a
snapshot of a particular formatting pass.
