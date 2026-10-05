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
  manifest + app.css + vocab-review-panel.css
<body>
  .topbar
  main.layout
    section.workspace
      .study-controls
      nav.tabs
      #vocab-deck-wrap
      #vocab-section-wrap
      #study-panel
      #duff-review-shell (inserted dynamically after #study-panel in vocabulary mode)
      #word-list
      .study-resources
  footer
  #lesson-dialog
  #progress-dialog
  #update-dialog
  module scripts: app.js, vocab-review-panel.js
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

### `#duff-review-shell`

`vocab-review-panel.js` creates this in-flow section immediately after
`#study-panel` while Vocabulary mode is active. It ports the more useful Duff
bottom-panel workflow without replacing the larger Progress modal.

It contains:

- spaced-review developer controls for **Fast-forward 1 day** and
  **Fast-forward 1 week**;
- selected-deck counts for in-deck / due-now / due-later cards;
- high- vs low-confidence counts for the active vocabulary direction;
- the collapsible due-by-day histogram;
- a reviewed-card list sortable by **Last seen**, **A–Z**, or **Confidence**;
- per-row prompt/answer, due/seen/confidence metadata, and a `×` control that
  returns that card to circulation now.

All counts and rows are scoped to the same current vocabulary deck, subsection,
and Indonesian→English / English→Indonesian direction as the flashcard session.
The panel is hidden in Morphology, Grammar, and Reading modes.

### `#word-list`

Collapsible vocabulary browser. In lesson mode it groups words by selected
Topik/section. In a personal focus deck it lists that deck directly and includes
the focus source metadata.

### `.study-resources`

Collapsible **Lesson notes** area containing:

- `#unit-description`
- `#lesson-guide`

Progress analytics live in the dedicated modal instead of this in-flow panel.

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

The page loads two modules, in this order:

```html
<script type="module" src="./app.js"></script>
<script type="module" src="./vocab-review-panel.js"></script>
```

`app.js` owns the core study UI and imports the content manifest, personal focus
vocabulary, progress/SRS helpers, deck ordering, charts, lesson selection,
vocabulary section logic, and morphology helpers.

`vocab-review-panel.js` is an additive Duff-port layer. It reads the same
persistent selection/direction/progress stores and renders the bottom review
panel. Its pure scheduling/sorting operations live in `vocab-review-state.js`,
so fast-forward and return-to-circulation use the existing progress structure
rather than creating a second SRS data model.

## Offline/cache coupling

`sw.js` precaches the shell, including all review-panel JS/CSS assets, and
accepts the content URLs supplied through `UNIT_URLS` in
`content/manifest.js`.

When adding a new runtime content module:

1. register it in `UNIT_URLS` when it belongs to the content pack;
2. ensure `sw.js` allows that URL in its `CACHE_CONTENT` validation;
3. add it to the shell as well when the module is imported directly by a page
   entry module and must be available immediately offline;
4. bump the `indonesian-study-vNN` cache name.

## Maintenance

Update this document in the same change when:

- a major in-flow section is added, removed, renamed, or reordered;
- a JS-referenced `id` is added, removed, or renamed;
- a dialog is added or removed;
- the module entry point or offline-cache relationship changes.

Line numbers are intentionally omitted: this file is a structural map, not a
snapshot of a particular formatting pass.
