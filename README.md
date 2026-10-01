# Indonesian Study

An offline-first Indonesian literacy and word-formation study app, adapted from the structure of [Duff Study Tool](https://github.com/hutima/duff_study_tool). It uses flip cards for vocabulary and curated multiple-choice morphology, grammar, and reading questions. No account, audio, tracking, or external services are required while studying. Vocabulary review counts stay in your browser.

## Run locally

Serve the directory with a static server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. The app works offline after it displays **Ready offline**. Tap a vocabulary card (or press Space/Enter) to flip it, then rate **Hard**, **Uncertain**, or **Easy** from either side (keys 1–3). **Undo** (Z) reverses the last review. **Again →** in spaced review scores Hard; **Next →** in unspaced practice moves a card to the retry pile without scoring it (Right Arrow or N). In unspaced practice, Hard and Uncertain return for another pass while Easy clears a card. Eight-month spaced review is on by default. It uses the Duff relaxed schedule: confidence-based interval growth (up to 60 days), in-session Hard requeue and relearning, a two-hour Uncertain review, and daily practice for repeatedly missed cards. Use the visible **Shuffle** switch in Vocabulary or Morphology to randomize upcoming cards or root families; turn it off to return remaining items to lesson order. The current root family stays in place until its questions are finished. In Morphology, use the visible mode button to switch between **Explain affixes** (Indonesian → English, choose an affix effect) and **Select a form** (English → Indonesian, choose among words from the same root). Use the first-class **Indonesian → English / English → Indonesian** control beside Shuffle to switch between recognition and active-production recall. Each direction keeps its own SRS schedule, confidence, streak, and review history while sharing the same canonical vocabulary card ID. Open **Settings** for spaced review, theme, and progress backups. Turn spaced review off for a full unspaced deck. Use **Vocabulary section** to focus the current deck on Lesson words, Affix families, Formal reading, or Everyday recognition; All words combines them. The selection is saved locally. Open **Vocabulary list** directly below the card in any study mode to browse selected words grouped by topic and section; PBWL additions are labeled Supplemental. Open **Progress** for direction-specific review counts and collapsible due-by-day and confidence histograms; lesson notes remain in their own disclosure. System, light, and dark color themes are available. With one lesson selected, morphology advances into the next lesson when the current lesson is exhausted. Card backs label part of speech, formal/informal/neutral register, and roots or affixed forms. Cards are curated for reading utility and are not a corpus-ranked frequency list. It stores progress in this browser's localStorage; Export JSON makes a portable backup.


## Personal focus vocabulary and study game

Vocabulary mode now has a **Vocabulary deck** selector in addition to the normal
lesson/section filters. **Struggling words** is a curated deck of vocabulary
that has caused difficulty in lessons, speaking/listening practice, or
formal/news reading. If a focus word already exists in a normal lesson, the
focus deck resolves to that exact card ID, so SRS history and per-card
statistics remain longitudinal instead of splitting into duplicate records.
**Completed focus words** is the archive for retired personal-only words that
would otherwise disappear from every lesson deck.

The app also restores Duff Study Tool's compact **Progress** experience rather
than keeping gamification permanently on the study screen. The Progress button
opens a modal with XP, Indonesian rank titles, current/longest streaks, today's
and lifetime review counts, a 28-day activity view, vocabulary due/confidence
analytics, an achievement grid, and the full title ladder. Achievements include
daily use, review milestones, study streaks, and card-mastery milestones. New
achievements and rank-ups trigger short Duff-style celebration banners.

Vocabulary cards still have an expandable **Card stats** panel showing the
stats for the currently selected direction: review count, Hard/Uncertain/Easy
breakdown, current streak, confidence, due time, and last-seen time.
Indonesian → English and English → Indonesian use separate progress stores and
SRS schedules while retaining the same canonical card ID. Pre-split vocabulary
history is preserved as Indonesian → English recognition history rather than
being duplicated into both directions. All of this stays inside the existing
local progress JSON.

See [custom vocabulary maintenance](docs/curriculum/custom-vocabulary.md) before
adding, rotating, or promoting a focus word. The central rule is that card IDs
are permanent: reuse the lesson card when one exists, and if a personal-only
word later becomes a lesson word, the lesson must reuse its existing
`id-focus-...` ID.


## GitHub Pages

Configure Pages to publish from `main` at the repository root (`/`). The project URL is `https://hutima.github.io/indonesian_study/`. All runtime URLs are relative to that project path, including the service worker scope and the content modules. The root `.nojekyll` file keeps the static files unprocessed. On each release that changes the app or a content pack, bump the `CACHE` version in `sw.js` so installed copies refresh. Wait for **Ready offline** before disconnecting. When an update is installed, the app offers a Refresh now dialog and waits for that choice before activating the new version. Installations from the original Stage 1 worker may need one manual reload or closing all open app tabs: an already cached old app cannot display a modal added later. New worker versions refresh the full offline shell from the network before activation. Progress remains in localStorage.

## Textbook-aligned study path

Use **Choose topics** to open the multi-select dialog. The selector follows all 15 Topik in Ulrich Kozok’s *Yang Tersirat dan Yang Tersurat*, in the supplied PDF order. Choose one or several Topik, or open Foundation practice for the earlier bridge units. In the dialog, choose a **Vocabulary focus** and open **See words** beneath any Topik to inspect its lesson and supplemental cards before selecting it. The focus also updates the study deck. There are 1,008 vocabulary cards in total, including 525 additional cards (35 per Topik) sourced from PBWL-listed forms. Each Topik has a selected vocabulary deck with a browsable list, affix recognition exercises, three contextual grammar questions, and newly written short readings with comprehension questions. The PBWL expansion offers topic-related recognition beyond the source textbook glossary; the reading passages and questions are original. The source PDFs and articles are not distributed with the app. See the [topic-by-topic curriculum map](docs/curriculum/textbook-roadmap.md).

The [PBWL vocabulary extension](docs/curriculum/pbwl-extension.md) draws on MsFixer’s *Pulau Bahasa Word Lists (2) Root*, v1.0b, under CC BY-NC-SA 4.0. Its added cards use selected forms, rewritten English glosses, and original examples; `sourceRootId` points back to the workbook row. Refer to the [official PBWL page](https://pulaubahasa.wordpress.com/vocab-builders/pbwl/) for the complete and latest workbook. The supplement is bundled locally; studying never fetches the spreadsheet. The adapted PBWL supplement, shortlist, and root-family selection are shared under the same CC BY-NC-SA 4.0 terms. The morphology families in `content/morphology-families.js` use PBWL RootIDs to connect curated sibling forms to the workbook; their question wording and affix explanations are newly written.

## Add content

Create `content/textbook/topikNN.js` (or a foundation module in `content/units/`) exporting an object with `id`, `bookTopic` for textbook lessons, `title`, `level`, `description`, optional `guide` for each mode, `vocabulary`, `morphology`, and `readings`. Register it in `content/manifest.js` in both the textbook/foundation list and `UNIT_URLS`. For a morphology extension, add a family with a stable ID, PBWL RootID, distinct sibling forms and English effects, and original affix explanations to `content/morphology-families.js`; each selected lesson has a family, and both directions derive separate stable question IDs. For a vocabulary-only extension, add curated cards to `content/vocab/pbwl-supplement.js` or one of the `content/vocab/expanded-*.js` topic groups with a source RootID, original example, and `section` (`families`, `reading`, or `everyday`). The aggregator in `content/vocab/expanded.js` generates stable IDs for its topic rows; keep the topic and RootID/form pairing stable once published. Register any new module in `UNIT_URLS` and the worker's allowed cache paths. IDs are permanent: do not reuse or change an existing item ID. Every vocabulary entry has `pos`, `register` (formal, informal, or neutral), and `kind` (root or derived); derived forms have `root`, and opaque or irregular forms can set `irregular: true`. Every morphology step, grammar question, and reading question has curated choices, one exact answer, and an explanation. Grammar questions also carry an original contextual sentence and a permanent ID. Include a semantic-effect question for each affixed morphology form so learners practice what the affix does in context. See existing units for examples.

Run `npm test` and `npm run validate` before committing content. Bump `CACHE` in `sw.js` when publishing changed runtime assets so previously installed copies receive a fresh cache. The app precaches any unit paths in `UNIT_URLS` after load, with an offline-ready acknowledgment.

## Source relationship

This repository includes an exact file copy of `hutima/duff_study_tool` as a reference during conversion. The Duff commit history remains in the original repository. The Greek code and assets remain in the tree, but `index.html` loads only `app.js`, `app.css`, and Indonesian content. See `docs/superpowers/specs/2026-09-24-indonesian-literacy-design.md` and the stage-one plan for scope and next steps. Existing third-party source and font licenses should be reviewed before any broader redistribution of the unused Greek corpus.
