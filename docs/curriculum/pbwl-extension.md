# PBWL vocabulary extension for textbook Topik 1–15

## Scope and source

This is a **curated intermediate recognition selection**, not a frequency ranking or a complete topic glossary. It uses the learner-provided [PBWL_2_Root_v1.0b Google Sheet](https://docs.google.com/spreadsheets/d/18ZimWkhGihwf4ALPOdx0KTVIaYLl184JBUhp-QQBmg0/edit), tabs **ReadMe** and **Root_v1.0b**. The ReadMe identifies 8,462 roots and up to three common lemmas per root. Root IDs, CEFR labels, and listed standard lemma forms were checked in the Root tab; `RootID` is column C, CEFR D, root E, and the lemma / shortened definition groups are J:M, N:Q, and R:U. CEFR tags below reproduce the sheet's labels (`B1L`, `B1U`, etc.), not an independent estimate.

PBWL credits MsFixer as primary author, version 1.0b dated 8 May 2025, under CC BY-NC-SA 4.0. Its ReadMe asks users to check the [official PBWL page](https://pulaubahasa.wordpress.com/vocab-builders/pbwl) for a newer release and directs users to download it there rather than redistribute the workbook. The app attributes and links to the source without bundling the workbook.

The initial 40 cards in `content/vocab/pbwl-supplement.js` grew out of the shortlist below. Additional source-linked cards live in `content/vocab/expanded-01-05.js`, `expanded-06-10.js`, and `expanded-11-15.js`, grouped by textbook topic. Their `section` marks an affix family, a formal reading word, or an everyday recognition word. The app combines these with lesson vocabulary while preserving the original card IDs and saved review records. A new card needs an exact PBWL RootID/form pairing, a distinct surface form, a natural original example, and a useful topic fit. A second meaning of the same surface form should usually be explained on one card rather than become a duplicate.

Meanings are paraphrased from PBWL's shortened KBBI-derived definitions, with context and register notes added as editorial guidance. **High** means the form and sense are represented among that root's listed lemmas; **Medium** means the suggested form is a useful contextual derivative but its precise sense or register needs a KBBI/editor check before it becomes a scored card. Forms already present as the same surface word in current Topik cards are omitted; closely related but distinct forms are retained and called out.

## Candidates

| Topik fit | PBWL root (RootID; CEFR) | Candidate form(s) | Recognition meaning / useful contrast | Meaning confidence |
| --- | --- | --- | --- | --- |
| 1 Health advice | `risiko` (2298; B1L) | risiko; berisiko | risk; risky / carrying risk (adjective-like verb) | High |
| 1 Health advice | `cerna` (3265; B1U) | mencerna; dicerna | digest/absorb; be digested. Metaphorical “take in/understand” can occur for ideas. | High |
| 1 Food and health | `masam` (5606; B2L) | masam; memasamkan | sour/acidic; make sour or pickle. Keep distinct from `asam` “sour/acid” in compounds such as `asam lambung`. | High |
| 2 Family disagreement | `tengkar` (2817; B1L) | pertengkaran; bertengkar; mempertengkarkan | quarrel/dispute (noun); argue; argue about/dispute something. Noun/verb and transitivity shift across the family. | High |
| 2–3 Relationship conflict | `rayu` (3910; B1U) | merayu; rayuan | persuade/flatter/cajole or woo; persuasion, appeal, or flirtatious words. Context selects the sense. | High |
| 2 Work and family conditions | `pesangon` (5416; B2L) | pesangon | severance pay; a formal employment term useful in a family/work dilemma. | High |
| 2 Work and family conditions | `buruh` (2370; B1L) | buruh; perburuhan; memburuh | laborer/worker; labor or employment as a field; work as a laborer. The latter two are lower priority than the root. | High |
| 4 Housing conditions | `syarat` (2290; B1L) | syarat; persyaratan; mensyaratkan | condition/requirement; requirements (set); require or make something a condition. | High |
| 4 Rental housing | `huni` (2324; B1L) | huni; penghuni; hunian | inhabit/live in; occupant/resident; dwelling/residence. The person and place nouns are not interchangeable. | High |
| 5 Agro-tourism | `botani` (6850; B2U) | botani | botany; a formal subject-area word for plant-focused visitor information. | High |
| 5 Conservation | `lestari` (3138; B1U) | lestari; melestarikan; pelestarian | enduring/sustainable; preserve/conserve; preservation/conservation. `Melestarikan` is the common action; `pelestarian` names the process. | High |
| 6 Cultural celebration | `etiket` (6963; B2U) | etiket; netiket | etiquette/social manners; online etiquette. Useful formal-to-digital sense extension. | High |
| 10 Cultural celebration | `adat` (2392; B1L) | adat; beradat | custom/tradition; be courteous or polite (a lexicalized sense, not simply “have customs”). The sheet flags `adat-istiadat` as a non-standard spelling; use `adat istiadat`. | High |
| 10 Cultural celebration | `himpun` (2413; B1L) | menghimpun; himpunan | gather/assemble; collection, body, or group. The existing deck already has `perhimpunan` “association.” | High |
| 7 Train service | `trayek` (5040; B2L) | trayek | fixed public-transport route or line; useful beside general `rute`/`perjalanan`. | High |
| 7 Schedule/complaint | `telat` (2898; B1L) | telat; ketelatan | late/overdue; lateness. `Telat` is colloquial recognition; map it to standard `terlambat` / `keterlambatan` in formal prose. | High |
| 8 Travel description | `panorama` (4734; B2L) | panorama; berpanorama | panoramic view; having a panorama. Treat `berpanorama` as lower-priority recognition; the noun is the useful target. | High |
| 9 Fable / being tricked | `jebak` (2570; B1L) | jebakan; menjebak | trap/snare (noun); trap or trick (verb). `Terjebak` is already present in Topik 8, so excluded. | High |
| 11 Wildlife | `spesies` (2594; B1L) | spesies | species; classification of plants or animals. More precise than a generic word for “animal.” | High |
| 11 Wildlife | `mangsa` (4646; B2L) | mangsa; memangsa; pemangsa | prey/victim/bait; prey on or victimize; predator. The derived verb also extends to human targets. | High |
| 11 Wildlife | `punah` (3664; B1U) | kepunahan; memunahkan | extinction; cause to become extinct/destroy. The base `punah` itself is already present in Topik 11. | High |
| 11 Wildlife | `jerat` (4442; B2L) | menjerat; jeratan | ensnare/trap; snare or trap. Also figurative “entrapment/deception”; the root `jerat` is already present. | High |
| 12 Conservation | `tebang` (4492; B2L) | tebang; menebang; ditebang | tree cutting/logging; cut/fell; be cut down. Pair active and passive examples to show who acts and what is affected. | High for `tebang`/`menebang`; Medium for passive form gloss |
| 14 Mangrove ecology | `surut` (2645; B1L) | surut; menyurut; menyurutkan | recede/subside or ebb; become less; make/reduce/recede. Contrast intransitive change with causative/transitive `menyurutkan`. | High |
| 14 Mangrove ecology | `abrasi` (5338; B2L) | abrasi; abrasif | abrasion/erosion; abrasive. A borrowed international word family; do not teach `-if` as a productive Indonesian affix. | High |
| 14 Coastal habitat | `laguna` (5638; B2L) | laguna | lagoon; geographic vocabulary for coastal descriptions. | High |
| 14 Habitat change | `rayap` (4036; B1U) | rayap | termite; useful environmental noun when explaining damage to trees or wooden structures. | High |
| 13 Disaster narrative | `tragedi` (3602; B1U) | pascatragedi | post-tragedy; the period after a tragic event. A useful formal time relation in historical or disaster accounts. | High |

The table contains **57 candidate surface forms** (counting a form once when it is named; repeated root/form strings across contrasting senses are not duplicated). Prioritize exact PBWL-listed lemmas first; keep the lower-priority forms as recognition notes unless the textbook passage supports them. Existing overlaps are intentional only where the proposed form differs from the current card (for example, `kepunahan` beside existing `punah`, or `melestarikan` beside existing `kelestarian`).

## Linguistic and editorial cautions

- PBWL's CEFR label belongs to the root entry; it does not certify that each listed derivative is equally frequent, transparent, or appropriate for a learner's active use.
- Affixes can change part of speech, argument structure, and lexical meaning. The existing `pencernaan` card names a process, while this shortlist adds `mencerna` for an action; `huni → penghuni` names a person and `hunian` a dwelling; `surut → menyurutkan` adds a causer.
- Do not mechanically generate cards from every possible affix. Some forms are conventional or have shifted meanings; `masam` and `memasamkan`, and `abrasi` / `abrasif`, should be checked as lexical families rather than presented as a universal derivation rule.
- Match register to the reading: `telat` is common colloquial usage, while standard formal writing favors `terlambat` and `keterlambatan`. Keep both visible for recognition without treating them as interchangeable in every context.
- The 1.0b source itself flags some spellings as non-standard. Do not adopt a flagged alternative as a standard target without checking current KBBI Daring.

## Attribution

Source: MsFixer, *Pulau Bahasa Word Lists (PBWL), (2) Root*, version 1.0b (8 May 2025), CC BY-NC-SA 4.0, sheet `Root_v1.0b`, rows identified by RootID in the table. Shortened definitions and the candidate selection are adapted for non-commercial educational use; this document should remain under the same license if redistributed. Latest-version check and source download: [PBWL official page](https://pulaubahasa.wordpress.com/vocab-builders/pbwl).
