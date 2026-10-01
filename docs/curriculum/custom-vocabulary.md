# Personal focus vocabulary

The personal focus vocabulary lives in `content/vocab/custom-focus.js`. It is a
small, curated layer for words that have actually caused difficulty in lessons,
speaking/listening practice, or formal/news reading. It is **not** a replacement
for the normal lesson/PBWL vocabulary sets.

## Decks

- `ACTIVE_STRUGGLE_WORDS`: the current rotation of words worth extra attention.
- `COMPLETED_STRUGGLE_WORDS`: retired personal-only words kept for optional
  review after they leave the active rotation.
- The UI exposes both as Vocabulary decks. Normal lesson vocabulary remains a
  separate deck.

## Identity and longitudinal statistics

A word must have one study identity across every deck in which it appears.

1. Before adding a focus word, check whether the same Indonesian form already
   exists in any normal unit vocabulary.
2. If there is one unambiguous existing card, reuse it. The resolver does this
   automatically by normalized Indonesian form, so the focus deck inherits that
   card's permanent `id`, SRS schedule, confidence history, and per-card stats.
3. If more than one normal card has the same form, add `canonicalId` to the
   focus definition (or `preferredUnitId` only when that is genuinely the
   intended disambiguator). Never guess between homographs.
4. If the word does not exist elsewhere, it is a personal-only card. Give it a
   permanent explicit `id` when there is any chance it will later move into a
   normal lesson; otherwise the resolver uses `id-focus-<slug>`.
5. **IDs are permanent.** Do not rename or recycle an ID after it has shipped.
6. If a personal-only word is later promoted into a normal lesson, the lesson
   card must reuse the personal card's existing `id-focus-...` ID. Do not give
   the lesson copy a new ID; that would split longitudinal statistics.

Changing deck membership must never reset or copy progress. Membership is just
another view of the same card identity.

## Adding words from lessons or news

Add a word to `ACTIVE_STRUGGLE_WORDS` when there is evidence that it is an
actual retrieval/comprehension bottleneck: a missed gloss, repeated hesitation,
meaning distortion, failed active recall, or repeated need for prompting. Do
not add every new word encountered, and do not treat an isolated typo as a
vocabulary failure.

Each entry should keep:

- `form`: the Indonesian form the learner should recognize/retrieve.
- `meaning`: concise English gloss appropriate to the observed context.
- `pos`, `register`, `kind`, and `root` when useful.
- `section`: normally `reading` for formal/news vocabulary or `everyday`
  for conversational/production vocabulary.
- `source`: short provenance such as `news reading`, `production lesson`,
  or `speaking / listening lesson`.
- `note`: only when a distinction, construction, or alternate form is useful.

Prefer lemmas/useful dictionary forms when that is the thing being learned, but
keep a salient encountered form in the note when necessary (for example,
`menikmati` with `Nikmati!` noted).

## Rotating words out

Rotation is deliberate; do not auto-delete a word merely because it currently
has a good SRS streak.

When a word no longer needs special focus:

1. Check whether it exists in another normal lesson deck.
2. If **yes**, remove its definition from `ACTIVE_STRUGGLE_WORDS`. Do **not**
   add it to `COMPLETED_STRUGGLE_WORDS`; the normal lesson already keeps it
   reviewable, and its stats remain on the same canonical ID.
3. If **no**, move the definition unchanged from `ACTIVE_STRUGGLE_WORDS` to
   `COMPLETED_STRUGGLE_WORDS`. Preserve its ID and metadata.
4. To reactivate a completed personal-only word, move the same definition back
   to the active array unchanged.
5. Never delete a completed personal-only definition simply to tidy the file;
   the archive exists specifically so old focus vocabulary remains reviewable.

## Validation checklist

After editing the focus file:

- no duplicate active definitions for the same intended word;
- canonical IDs still point to real lesson cards when explicitly supplied;
- personal-only IDs have not changed;
- active/completed membership follows the rotation rule above;
- `content/manifest.js` still lists `./content/vocab/custom-focus.js` in
  `UNIT_URLS`;
- `sw.js` still precaches/allows the focus module for offline use;
- changing words does not require a progress migration.

The current seed list is based on observed lesson/news difficulty and should be
updated as the learning project continues.
