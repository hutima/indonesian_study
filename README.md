# Indonesian Study

An offline-first Indonesian literacy and word-formation study app, adapted from the structure of [Duff Study Tool](https://github.com/hutima/duff_study_tool). It uses curated multiple-choice morphology and reading questions. No account, audio, analytics, or external services are required while studying.

## Run locally

Serve the directory with a static server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. The app works offline after it displays **Ready offline**. It stores progress in this browser's localStorage; Export JSON makes a portable backup.

## GitHub Pages

Configure Pages to publish from `main` at the repository root (`/`). The project URL is `https://hutima.github.io/indonesian_study/`. All runtime URLs are relative to that project path, including the service worker scope and the content modules. The root `.nojekyll` file keeps the static files unprocessed. On each release that changes the app or a content pack, bump the `CACHE` version in `sw.js` so installed copies refresh. Wait for **Ready offline** before disconnecting.

## Add content

Create `content/units/unitNN.js` exporting an object with `id`, `title`, `level`, `description`, `vocabulary`, `morphology`, and `readings`. Register it in `content/manifest.js` in both `UNITS` and `UNIT_URLS`. IDs are permanent: do not reuse or change an existing item ID. Every morphology step and reading question has curated choices, one exact answer, and an explanation. See existing units for examples.

Run `npm test` and `npm run validate` before committing content. Bump `CACHE` in `sw.js` when publishing changed runtime assets so previously installed copies receive a fresh cache. The app precaches any unit paths in `UNIT_URLS` after load, with an offline-ready acknowledgment.

## Source relationship

This repository includes an exact file copy of `hutima/duff_study_tool` as a reference during conversion. The Duff commit history remains in the original repository. The Greek code and assets remain in the tree, but `index.html` loads only `app.js`, `app.css`, and Indonesian content. See `docs/superpowers/specs/2026-09-24-indonesian-literacy-design.md` and the stage-one plan for scope and next steps. Existing third-party source and font licenses should be reviewed before any broader redistribution of the unused Greek corpus.
