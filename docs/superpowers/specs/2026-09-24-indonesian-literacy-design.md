# Indonesian Literacy Study App — Stage 1 Design

## Goal and audience

An offline study app for a heritage Indonesian listener who understands everyday speech better than formal writing. The app develops recognition of common roots, affixes, derived meanings, and progressively more formal prose. It requires no account, network service, audio, speech recognition, or free-text grading.

## Relationship to Duff

The repository includes a complete file copy of `hutima/duff_study_tool` as a reference implementation. The GitHub connector copied files into the new repository but did not transfer Duff's commit history; the original repository remains the history source. Stage 1 replaces the entry page with a small Indonesian app. Greek content and UI remain as reference files and are not loaded by the Indonesian entry page. A later stage can adapt the pure SRS scheduler if spaced review is warranted and remove unused Greek assets after parity decisions have been made.

## Study flow

Three tabs: Vocabulary, Morphology, Reading. A unit selector limits content cumulatively. Vocabulary cards reveal English meaning and a contextual example, then accept Again / Unsure / Know. Morphology presents a prewritten Indonesian form in a sentence, asks one multiple-choice question at a time (root, affixes, sound change, contextual meaning, or contrast), explains the selected answer, and summarizes the analysis. Reading presents original graded passages with optional translation and one prewritten multiple-choice comprehension question at a time. No answer is generated at runtime.

## Content contract

Content lives in independent ES modules under `content/units/`. Each exports a unit object with stable `id`, title, level, vocabulary, morphology and reading arrays. Each item has a globally unique, stable `id`, `unitId`, and explicit display/answer content. A validation script checks IDs, referenced unit IDs, choice counts, exact correct-answer inclusion, and reading-question links. Adding a new unit requires adding a module to a manifest and supplying curated entries; it does not require changing the renderer or scheduler. Existing IDs must never be repurposed, and progress is keyed by ID rather than array position.

Morphology items explicitly encode `root`, `form`, `affixes`, `process`, and a short contextual meaning. Each has `steps` with a prompt, 2–4 curated choices, an answer, and explanation. A surface form may have different senses or analyses in different contexts; the authored context and explanation decide the card's intended answer. The interface never fabricates a family by applying an affix algorithm to arbitrary roots.

## Offline and persistence

Only relative local assets and bundled content are loaded. No analytics, CDN, external images, remote fonts, fetch to a service, or service-worker runtime network calls after installation. A service worker precaches the app shell and content and serves them offline; opening `index.html` directly in a local filesystem remains possible where module security permits, and a local static server is the development path. Progress uses versioned localStorage with export/import JSON; unknown future fields are ignored safely. A reset action is explicit.

## Stage boundary

Stage 1 provides a modest, carefully checked starter set and one graded passage. It demonstrates the extensible format and offline flow rather than claiming a complete textbook-equivalent curriculum. Later stages add larger curated packs, formal register progression, and editorial review without changing stored IDs or core UI contracts.

## Verification

Run content validation and focused domain tests; serve locally, navigate all three tabs and a complete drill; verify saved progress across reload; confirm every referenced app asset is local and available from the service worker cache with network disconnected.
