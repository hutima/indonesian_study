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
  manifest + app.css
<body>
  .topbar
  main.layout
    section.workspace
      .study-controls
      nav.tabs
      #vocab-deck-wrap
      #vocab-section-wrap
      #study-panel
      #word-list
      .study-resources
  footer
  #lesson-dialog
  #progress-dialog
  #update-dialog
  module script: app.js
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
- `#vocab-analytics`: due-by-day and recognition-confidence histograms for the
  currently selected vocabulary deck;
- `#title-ladder`: all Indonesian rank titles and XP thresholds.

New rank and achievement events use a Duff-style temporary
`.level-toast-host` celebration banner created dynamically by `app.js`.
Celebration state is persisted with the gamification record so an Undo does not
spam the same badge repeatedly; the daily badge can be earned again on a later
day.

## Update dialog

`#update-dialog` is shown when the service worker has a waiting update.

- `#update-later`
- `#update-now`

The app only activates the waiting worker immediately when the user chooses
Refresh now; otherwise the old version remains usable.

## Script entry point

The only page script is:

```html
<script type="module" src="./app.js"></script>
```

`app.js` imports the content manifest, personal focus vocabulary, progress/SRS
helpers, deck ordering, charts, lesson selection, vocabulary section logic, and
morphology helpers.

## Offline/cache coupling

`sw.js` precaches the shell and accepts the content URLs supplied through
`UNIT_URLS` in `content/manifest.js`.

When adding a new runtime content module:

1. register it in `UNIT_URLS` when it belongs to the content pack;
2. ensure `sw.js` allows that URL in its `CACHE_CONTENT` validation;
3. add it to the shell as well when the module is imported directly by
   `app.js` and must be available immediately offline;
4. bump the `indonesian-study-vNN` cache name.

## Maintenance

Update this document in the same change when:

- a major in-flow section is added, removed, renamed, or reordered;
- a JS-referenced `id` is added, removed, or renamed;
- a dialog is added or removed;
- the module entry point or offline-cache relationship changes.

Line numbers are intentionally omitted: this file is a structural map, not a
snapshot of a particular formatting pass.
