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
      #game-status
      #vocab-deck-wrap
      #vocab-section-wrap
      #study-panel
      #word-list
      .study-resources
  footer
  #lesson-dialog
  #update-dialog
  module script: app.js
```

## Main study shell

### `.topbar`

- Brand / app name.
- `#offline-status` reports whether the offline shell/content cache is ready.

### `.study-controls`

- `#open-lessons`: opens the lesson/topic selector.
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

### `#game-status`

Always-visible lightweight gamification summary. `app.js` renders:

- current XP level and Indonesian title;
- progress to the next title;
- current daily study streak (longest streak in the tooltip);
- today's scored-review count.

The underlying data is stored inside the existing progress JSON by
`progress.js`; there is no separate account or analytics service.

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

Collapsible "Lesson notes and progress" area containing:

- `#unit-description`
- `#lesson-guide`
- `#vocab-analytics` (deck-level due/confidence histograms)

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
