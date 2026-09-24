# Indonesian literacy roadmap from the user's textbook

Reference: Ulrich Kozok, *Yang Tersirat dan Yang Tersurat: Readings from the Contemporary Indonesian Media for Self-Study and Classroom Use*, Student Book 1 (15 topical PDFs supplied by the user). This roadmap uses its topic sequence and grammatical themes as a study aid. The app's examples, passages, and questions are newly written. Do not commit the supplied PDFs, their media articles, photographs, exercises, or answer keys to this repository.

## Learner and delivery constraints

- Primary goal: read Indonesian confidently, especially formal writing, while making everyday family language easier to recognize. Listening and speaking stay outside this offline literacy app.
- This book is built around authentic media texts and is a substantial jump from the app's first three units. Each step therefore begins with a short, original bridge passage and only later uses denser notice/article-style prose.
- Each lesson offers 12–20 curated vocabulary cards, root and derived form contrasts, at least three semantic morphology drills, and an original short reading with questions. Register and part of speech are recorded for every vocabulary item. New content is a separate `content/units/unitNN.js` module with permanent IDs and a `guide`; add its import and offline URL to `content/manifest.js`, validate, then bump the service-worker cache name.
- Prioritize recognition. A question should ask who acts on whom, what kind of thing a form denotes, or how a connector changes the relationship between clauses. A spelling alternation is a supporting question, not the only task.

## Sequence

| Stage | Book topics and context | Recognition targets | Vocabulary families to curate next |
| --- | --- | --- | --- |
| Bridge A, live as Units 4–5 | 1 health tips; 2 family dilemma; 3 relationships | Active meN- and imperative with dropped prefix; `di-` passive versus bare verb after `saya` in a `yang` clause; conversational `bilang` versus formal `mengatakan`; conversational particle `kan` | `jaga/menjaga`, `kurang/mengurangi`, `hindar/menghindari/hindari`, `saran/menyarankan`, `kata/mengatakan`, `undang/undangan`, `kirim/dikirim` |
| Bridge B | 4 renting a home; 5 agro-tourism | `kalau/jika`, `karena`, `agar`, `walaupun`, before/after clauses; requests and conditions in a simple notice | `sewa/menyewa`, `kontrak/mengontrak`, `harga`, `biaya`, `dekat`, `jauh`, `syarat`, `izin`, `fasilitas`, `tersedia`, `pengunjung` |
| Everyday institutions | 6 holidays; 7 train complaint | `ada` versus `adalah`; `di-` passives in notices; first-person patient-fronted clauses; time and sequence words | `raya/merayakan/perayaan`, `angkat/berangkat/keberangkatan`, `lambat/terlambat/keterlambatan`, `mohon/permohonan`, `jelas/penjelasan` |
| Formal news bridge | 8 holiday traffic; 9 transport changes; 10 cultural celebration | Cause `sehingga` versus purpose `agar/supaya`; event nominalization (`ditutupnya`); `ber-` verbs and embedded `yang` clauses | `macet/kemacetan`, `atur/pengaturan`, `jalan/perjalanan`, `ubah/perubahan`, `izin`, `luncur/diluncurkan`, `budaya/kebudayaan`, `ikut/keikutsertaan` |
| Compare and explain | 11 wildlife; 12 orangutans | `sementara/sedangkan` (contrast) versus `sambil` (same actor, parallel activity); several senses of `ke-...-an`, including adverse events; reciprocal `ber-...-an` | `selamat/keselamatan`, `hilang/kehilangan`, `hujan/kehujanan`, `hasil/keberhasilan`, `temu/bertemu`, `salam/bersalaman` |
| Dense written prose | 13 film review; 14 mangroves; 15 city cleanliness | `-an` result versus `peN-...-an` activity; abstract nominalization; paired constructions (`baik...maupun`, `bukan hanya...tetapi juga`) and review | `tulis/tulisan/penulisan`, `baca/bacaan/pembacaan`, `kirim/kiriman/pengiriman`, `lindung/pelindung/perlindungan`, `bersih/membersihkan/kebersihan` |

## Content choices

1. Keep both formal written forms and natural family alternatives, marked as such. In the bridge, explain a familiar form before introducing a less familiar formal counterpart.
2. Teach common lexicalized meanings explicitly: do not infer that every `-an` means the same thing or every `ke-...-an` is adverse. Ask for the sense supported by the sentence.
3. Use newly written home, transit, community, and family situations first. Old article facts and prices in the book are historical context, not current Indonesian usage data.
4. Expand in small reviewed units. If a card is ambiguous without context, add a note and a sentence. Avoid claiming the vocabulary is frequency-ranked; it is selected for usefulness and for the book's progression.
5. When adding a new unit, check `npm test`, `npm run validate`, offline precache, and app navigation from the preceding unit. Existing progress is keyed by stable IDs and must remain valid after expansion.
