# Repository notes for Claude

## Navigation

- **`index.html` structure:** see `docs/index-structure.md` before scanning
  the file. It maps the in-flow `.app` shell, the overlay siblings, and the
  script groups by line range and `id`.

## Maintenance rules

- **Keep `docs/index-structure.md` in sync.** If you edit `index.html` and
  any of the following change, update the doc in the same commit:
  - a section in `.app` is added, removed, reordered, or renamed
  - an overlay (`consent-overlay`) is added or removed
  - an `id` referenced by JS is added, removed, or renamed
  - the script load order / grouping changes
  - the `?v=NNN` cache-bust scheme changes
- Line numbers in the doc are approximate — don't chase a few lines of drift,
  but do refresh them when a section moves significantly.

## Offline releases and module changes

This app does **not** use Duff's `?v=NNN` query-string cache-bust scheme.
Runtime assets are bare relative URLs. Releases are refreshed by the service
worker's cache name in `sw.js` (`indonesian-study-vNN`).

### Release invariant: every deployed change must bump every service worker

**Do not merge or push a deployed app change without updating the service
worker version(s).** The in-app **Update available** modal only appears when the
browser detects a new service-worker script, so a content-only change can
otherwise remain invisible to installed copies.

For **every change to deployed app code, content, styles, assets, lessons,
vocabulary, or offline data — including a one-line/content-only PR**:

- find every service-worker file used by this app (currently `sw.js`) and bump
  its cache/version token (currently `indonesian-study-vNN`);
- if additional service workers are added later, bump **all of them** in the
  same PR/release; updating only one worker is not sufficient;
- treat the service-worker bump as part of the change itself, not as an
  optional follow-up or a separate cleanup PR;
- before merge, verify the worker source actually changed so an installed copy
  can enter the waiting state and trigger the **Update available** modal;
- if a new content module is added, register it in `UNIT_URLS` in
  `content/manifest.js` and allow it in the worker's `CACHE_CONTENT` URL
  validation;
- if `app.js` imports the module directly and it must work offline on first
  load, also include it in the worker's `SHELL` list;
- keep the waiting-worker behavior intact: an installed update should not
  replace the active worker until the user chooses Refresh now (or a later cold
  start naturally activates it).

**Release checklist:** if a PR changes anything a user can receive from the
deployed app and no service-worker version changed, the PR is incomplete.

### ES-module compatibility across installed versions

Relative ES-module imports are fetched as bare URLs, so avoid needless
cross-version breakage. Prefer additive changes: do not remove an export that a
recently shipped importer may still request, and avoid renaming runtime modules
without a deliberate cache/version migration. The waiting service worker
reduces mixed-version risk, but does not justify breaking old import contracts.

## Personal focus vocabulary

- **Read `docs/curriculum/custom-vocabulary.md` before editing
  `content/vocab/custom-focus.js`.** It is the authoritative maintenance
  policy for the learner-specific struggling-word and completed decks.
- Reuse an existing canonical vocabulary card/ID whenever the word already
  exists in a normal lesson. Never make a second progress identity just because
  the same word is also in the focus deck.
- For a personal-only word, keep its `id-focus-...` ID permanently. If that
  word is later added to a normal lesson, the lesson must reuse that same ID.
- When rotating an active focus word out: if a normal lesson already contains
  it, remove it from the active focus array only; if it exists nowhere else,
  move the unchanged definition to `COMPLETED_STRUGGLE_WORDS` instead of
  deleting it.
- Do not auto-rotate words from SRS performance alone. Update the focus deck
  from observed lesson/news difficulty or an explicit user request.
