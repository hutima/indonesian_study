# Indonesian Study

An offline-first Indonesian literacy and word-formation study app, adapted from the structure of [Duff Study Tool](https://github.com/hutima/duff_study_tool). It uses flip cards for vocabulary and curated multiple-choice morphology, grammar, and reading questions. No account, audio, tracking, or external services are required while studying. Vocabulary review counts stay in your browser.

## Run locally

Serve the directory with a static server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. The app works offline after it displays **Ready offline**. Tap a vocabulary card (or press Space/Enter) to flip it, then choose Again, Unsure, or Next (Know) from either side (keys 1–3). Eight-month spaced review is on by default. It uses the Duff relaxed schedule: confidence-based interval growth (up to 60 days), in-session Again requeue and relearning, a two-hour Unsure review, and daily practice for repeatedly missed cards. Turn spaced review off for a full unspaced deck. The sidebar shows vocabulary review counts and collapsible due-by-day and confidence histograms. System, light, and dark color themes are available. With one lesson selected, morphology advances into the next lesson when the current lesson is exhausted. Card backs label part of speech, formal/informal/neutral register, and roots or affixed forms. Cards are curated for reading utility and are not a corpus-ranked frequency list. It stores progress in this browser's localStorage; Export JSON makes a portable backup.

## GitHub Pages

Configure Pages to publish from `main` at the repository root (`/`). The project URL is `https://hutima.github.io/indonesian_study/`. All runtime URLs are relative to that project path, including the service worker scope and the content modules. The root `.nojekyll` file keeps the static files unprocessed. On each release that changes the app or a content pack, bump the `CACHE` version in `sw.js` so installed copies refresh. Wait for **Ready offline** before disconnecting. When an update is installed, the app offers a Refresh now dialog and waits for that choice before activating the new version. Installations from the original Stage 1 worker may need one manual reload or closing all open app tabs: an already cached old app cannot display a modal added later. New worker versions refresh the full offline shell from the network before activation. Progress remains in localStorage.

## Textbook-aligned study path

The selector follows all 15 Topik in Ulrich Kozok’s *Yang Tersirat dan Yang Tersurat*, in the supplied PDF order. Choose one or several Topik, or open Foundation practice for the earlier bridge units. Each Topik has 21–30 selected words with a browsable list, affix recognition exercises, three contextual grammar questions, and newly written short readings with comprehension questions. Vocabulary is selected from the topic’s glossary and prose; the reading passages and questions are original. The source PDFs and articles are not distributed with the app. See the [topic-by-topic curriculum map](docs/curriculum/textbook-roadmap.md).

## Add content

Create `content/textbook/topikNN.js` (or a foundation module in `content/units/`) exporting an object with `id`, `bookTopic` for textbook lessons, `title`, `level`, `description`, optional `guide` for each mode, `vocabulary`, `morphology`, and `readings`. Register it in `content/manifest.js` in both `UNITS` and `UNIT_URLS`. IDs are permanent: do not reuse or change an existing item ID. Every vocabulary entry has `pos`, `register` (formal, informal, or neutral), and `kind` (root or derived); derived forms have `root`, and opaque or irregular forms can set `irregular: true`. Every morphology step, grammar question, and reading question has curated choices, one exact answer, and an explanation. Grammar questions also carry an original contextual sentence and a permanent ID. Include a semantic-effect question for each affixed morphology form so learners practice what the affix does in context. See existing units for examples.

Run `npm test` and `npm run validate` before committing content. Bump `CACHE` in `sw.js` when publishing changed runtime assets so previously installed copies receive a fresh cache. The app precaches any unit paths in `UNIT_URLS` after load, with an offline-ready acknowledgment.

## Source relationship

This repository includes an exact file copy of `hutima/duff_study_tool` as a reference during conversion. The Duff commit history remains in the original repository. The Greek code and assets remain in the tree, but `index.html` loads only `app.js`, `app.css`, and Indonesian content. See `docs/superpowers/specs/2026-09-24-indonesian-literacy-design.md` and the stage-one plan for scope and next steps. Existing third-party source and font licenses should be reviewed before any broader redistribution of the unused Greek corpus.
