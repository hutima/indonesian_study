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

## Cache-bust

Every asset URL in `index.html` ends in `?v=NNN`. The same number lives in
`sw.js` (`CACHE_NAME` + precache list). Bump both together on release.

### ⚠ ES-module imports are NOT cache-busted — don't break cross-version mixing

The `?v=NNN` only stamps the `<script>`/`<link>` URLs in `index.html`. The
relative `import ... from '../ui/foo.js'` specifiers **inside** the JS modules
carry no `?v=`, so they're fetched bare. During a service-worker update the
browser can momentarily pair a **new** `main.js?v=NNN` (from the network) with an
**old cached** sibling module (the bare import resolves via `ignoreSearch`).
If the new importer references an export the old module doesn't have yet, the
module throws a `SyntaxError` at load → `main.js` never runs → the whole app
freezes (no click handlers, and the update prompt — which lives in `main.js` —
never shows). This is the Safari "frozen on update" failure mode; it would bite
when `PARSING_SHUFFLE_ALL_VALUE` was added as a new `navigation.js` export and
imported into `main.js`.

Rules of thumb when changing module boundaries:
- **Avoid importing a brand-new export across modules** if you can define the
  value locally instead (e.g. a sentinel string constant — keep a mirrored copy
  and a sync comment, as `PARSING_SHUFFLE_ALL_VALUE` now does in both
  `navigation.js` and `main.js`).
- **Never remove an export that an older shipped `main.js` still imports** —
  keep it around (even if unused by the new code) so an old importer paired with
  the new module doesn't `SyntaxError`.
- Runtime wiring (deps objects passed to `configure*(...)`, `GLOBAL_CLICK_HANDLERS`
  / `window` handler assignments) degrades to `undefined`, not a module-load
  `SyntaxError`, so it's safe across versions — prefer it for new cross-module
  hooks.

## Changelog

The user guide's inline changelog (`#shortcutsOverlay` in `index.html`) is a
short, high-level summary for users — **not** a per-commit or per-day log:

- Keep it to a handful (~1–5) of **major release notes**, grouped by theme/era,
  newest first. Don't add a new entry per change or per day — fold edits into
  the most relevant existing entry (and re-consolidate if it's growing too fine).
- Bullets are **short and skimmable**: headline features only. Skip minor
  changes, bug fixes, and internal refactors.
- Only the newest entry carries the `open` attribute.
