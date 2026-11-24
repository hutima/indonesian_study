// Personal focus vocabulary for words that surfaced as bottlenecks in lessons
// and formal/news reading. See docs/curriculum/custom-vocabulary.md before editing.
//
// IMPORTANT: entries are definitions, not a second copy of the canonical deck.
// resolveCustomVocabulary() reuses an existing lesson card (and therefore its
// permanent id / SRS history) whenever the Indonesian form already exists.

const normalizeForm = value => String(value || '')
  .toLocaleLowerCase('id')
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const slug = value => normalizeForm(value).replace(/\s+/g, '-');

export const ACTIVE_STRUGGLE_WORDS = [
  // November 2026 review: observed retrieval/comprehension gaps, not scheduled
  // lesson targets. Keep the most recent everyday contrasts together.
  { id: 'id-focus-menyiapkan', form: 'menyiapkan', meaning: 'to prepare; get something ready', pos: 'verb', register: 'neutral', kind: 'derived', root: 'siap', section: 'everyday', source: 'everyday lessons, Nov 14–23', example: 'Saya menyiapkan makan malam sebelum tamu datang.', note: 'Casual Jakarta: nyiapin. Menyiapkan sesuatu = prepare something; siap = ready. Saya siap = I am ready.' },
  { id: 'id-focus-cari-tahu', form: 'cari tahu', meaning: 'to find out; seek information', pos: 'verb phrase', register: 'neutral', kind: 'root', section: 'everyday', source: 'cold vocabulary retrieval, Nov 15–23', example: 'Saya mau cari tahu siapa yang ada di foto ini.', note: 'Active effort to find information. Baru tahu = just found out; baru sadar = just realized. Formal: mencari tahu.' },
  { form: 'mengubah', meaning: 'to change something', pos: 'verb', register: 'neutral', kind: 'derived', root: 'ubah', section: 'everyday', source: 'everyday lessons, Nov 14–23', note: 'Saya mengubah rencana = I change the plan; rencana diubah = the plan is changed. Standard form: mengubah. Casual: ganti/ngubah. Contrast berubah, where the subject itself changes.' },
  { form: 'berubah', meaning: 'to change; become different', pos: 'verb', register: 'neutral', kind: 'derived', root: 'ubah', section: 'everyday', source: 'verb-choice confusion, Nov 23', note: 'Rencananya berubah = the plan changes. Saya mengubah rencana = I change the plan. Berubah does not take the thing changed as a direct object.' },
  { id: 'id-focus-menunda', form: 'menunda', meaning: 'to postpone; put off', pos: 'verb', register: 'neutral', kind: 'derived', root: 'tunda', section: 'everyday', source: 'cold vocabulary retrieval, Nov 19', example: 'Kami menunda perjalanan sampai besok.', note: 'Move an activity to a later time; membatalkan = cancel it. Casual: nunda.' },
  { form: 'memutuskan', meaning: 'to decide', pos: 'verb', register: 'neutral', kind: 'derived', root: 'putus', section: 'everyday', source: 'sentence writing, Nov 19–23', note: 'Kami memutuskan untuk berangkat besok = we decided to leave tomorrow. Kami is the decision-maker; diputuskan = was decided. Membatalkan means cancel, not decide.' },
  { id: 'id-focus-membatalkan', form: 'membatalkan', meaning: 'to cancel something', pos: 'verb', register: 'neutral', kind: 'derived', root: 'batal', section: 'everyday', source: 'plan-change contrasts, Nov 19', example: 'Kami membatalkan perjalanan karena badai.', note: 'The activity will not happen as planned. Menunda = postpone; mengubah = change. Perjalanan dibatalkan = the trip was canceled. Casual: batalin.' },
  { id: 'id-focus-membalas', form: 'membalas', meaning: 'to reply to; respond to', pos: 'verb', register: 'neutral', kind: 'derived', root: 'balas', section: 'everyday', source: 'sentence writing, Nov 19', example: 'Saya belum membalas pesanmu.', note: 'Membalas pesan = reply to a message; mengirim pesan = send a message. Casual: bales (pesan).' },
  { id: 'id-focus-mengira', form: 'mengira', meaning: 'to think; suppose; expect', pos: 'verb', register: 'neutral', kind: 'derived', root: 'kira', section: 'everyday', source: 'comparative sentence writing, Nov 14–23', example: 'Tempat ini lebih kecil daripada yang saya kira.', note: 'Lebih ... daripada yang saya/kami kira = more ... than I/we thought. Casual: daripada yang aku kira.' },
  { id: 'id-focus-lebih-awal', form: 'lebih awal', meaning: 'earlier; ahead of time', pos: 'adverbial phrase', register: 'neutral', kind: 'root', section: 'everyday', source: 'reading and sentence writing, Nov 14–15', example: 'Kita perlu berangkat lebih awal supaya tiba tepat waktu.', note: 'Berangkat lebih awal = leave earlier; tepat waktu = on time.' },
  { id: 'id-focus-siap', form: 'siap', meaning: 'ready; prepared', pos: 'adjective', register: 'neutral', kind: 'root', section: 'everyday', source: 'sentence writing, Nov 23', example: 'Saya sudah siap, tetapi belum punya waktu luang.', note: 'Siap = ready; bebas / punya waktu luang = free / have free time. Menyiapkan makanan = prepare food. Sebelum berangkat = before leaving; belum siap = not ready yet.' },

  // News action verbs and procedural/connector meanings missed on Nov 23.
  { form: 'menolak', meaning: 'to reject; refuse', pos: 'verb', register: 'neutral', kind: 'derived', root: 'tolak', section: 'reading', source: 'news reading, Nov 23', note: 'Panitia menolak usulan itu = the committee rejected that proposal; usulan itu ditolak = that proposal was rejected. Identify who rejects what.' },
  { id: 'id-focus-menentang', form: 'menentang', meaning: 'to oppose; be against', pos: 'verb', register: 'neutral', kind: 'derived', root: 'tentang', section: 'reading', source: 'news reading, Nov 23', example: 'Beberapa anggota menentang persyaratan baru.', note: 'Menentang persyaratan = oppose requirements. Menolak rancangan = reject a draft; opposition alone does not establish the final outcome.' },
  { id: 'id-focus-mengalahkan', form: 'mengalahkan', meaning: 'to defeat; beat an opponent', pos: 'verb', register: 'neutral', kind: 'derived', root: 'kalah', section: 'reading', source: 'news reading, Nov 23', example: 'Tim A mengalahkan tim B.', note: 'A mengalahkan B = A defeats B; B kalah = B loses; A menang = A wins. The subject of mengalahkan is the winner.' },
  { id: 'id-focus-menguasai', form: 'menguasai', meaning: 'to control; have command of; master', pos: 'verb', register: 'neutral', kind: 'derived', root: 'kuasa', section: 'reading', source: 'news reading, Nov 23', example: 'Partai itu menguasai mayoritas kursi di parlemen.', note: 'In election reporting: control seats or a legislative chamber. Menguasai bahasa = master a language.' },
  { form: 'mengusulkan', meaning: 'to propose; suggest', pos: 'verb', register: 'formal', kind: 'derived', root: 'usul', section: 'reading', source: 'news reading, Nov 23', note: 'Pemimpin mengusulkan aturan baru = the leader proposes a new rule. Usulan = proposal; diusulkan = proposed. A proposal is not necessarily approved or in force.' },
  { form: 'meninjau', meaning: 'to review; inspect', pos: 'verb', register: 'neutral', kind: 'derived', root: 'tinjau', section: 'reading', source: 'news reading, Nov 13 and 23', note: 'Meninjau kebijakan = review a policy; kebijakan sedang ditinjau = the policy is being reviewed. Review does not itself mean change or approval.' },
  { id: 'id-focus-disetujui', form: 'disetujui', meaning: 'approved; agreed to', pos: 'verb', register: 'neutral', kind: 'derived', root: 'setuju', section: 'reading', source: 'news reading, Nov 23', example: 'Usulan itu belum disetujui oleh panitia.', note: 'Passive: the proposal receives approval. Panitia menyetujui usulan = the committee approves the proposal. Belum disetujui = not yet approved; approval, becoming law, and taking effect are distinct stages.' },
  { id: 'id-focus-berlangsung', form: 'berlangsung', meaning: 'to take place; continue; last', pos: 'verb', register: 'neutral', kind: 'derived', root: 'langsung', section: 'reading', source: 'news reading, Nov 23', example: 'Perundingan berlangsung dua hari lebih lama daripada rencana semula.', note: 'The negotiations lasted two days longer than planned. This describes duration; mulai dua hari terlambat would mean started two days late.' },
  { form: 'sementara itu', meaning: 'meanwhile', pos: 'discourse connector', register: 'formal', kind: 'root', section: 'reading', source: 'news reading, Nov 23', note: 'Introduces a parallel event or situation: meanwhile. Untuk sementara (waktu) = temporarily; sementara can also mean while.' },
  { id: 'id-focus-meskipun-demikian', form: 'meskipun demikian', meaning: 'nevertheless; even so', pos: 'discourse connector', register: 'formal', kind: 'root', section: 'reading', source: 'news reading, Nov 23', example: 'Usulan sudah diajukan. Meskipun demikian, usulan itu belum disetujui.', note: 'Signals concession or contrast. Meskipun = although; demikian = so. It does not express hope.' },
  { form: 'kesepakatan', meaning: 'agreement', pos: 'noun', register: 'neutral', kind: 'derived', root: 'sepakat', section: 'reading', source: 'news reading, Nov 23', note: 'Mencapai kesepakatan = reach an agreement; gagal mencapai kesepakatan = fail to reach an agreement. Sepakat untuk berangkat = agree to leave, without implying anyone has left yet.' },

  { form: 'ledakan', meaning: 'explosion; blast', pos: 'noun', register: 'neutral', kind: 'derived', root: 'ledak', section: 'reading', source: 'news reading', note: 'Formal/news: ledakan terdengar = an explosion was heard.' },
  { form: 'ibu kota', meaning: 'capital city', pos: 'noun phrase', register: 'neutral', kind: 'root', section: 'reading', source: 'news reading', note: 'Treat as one lexical unit; not “mother city”.' },
  { form: 'awal', meaning: 'beginning; start; early', pos: 'noun / adjective', register: 'neutral', kind: 'root', section: 'reading', source: 'news reading' },
  { form: 'sumber', meaning: 'source', pos: 'noun', register: 'neutral', kind: 'root', section: 'reading', source: 'news reading' },
  { form: 'penyebab', meaning: 'cause; cause of something', pos: 'noun', register: 'neutral', kind: 'derived', root: 'sebab', section: 'reading', source: 'news reading' },
  { form: 'dipastikan', meaning: 'confirmed; established with certainty', pos: 'verb', register: 'formal', kind: 'derived', root: 'pasti', section: 'reading', source: 'news reading', note: 'Passive di- form of memastikan.' },
  { form: 'berdasarkan', meaning: 'based on; on the basis of', pos: 'preposition / verb', register: 'formal', kind: 'derived', root: 'dasar', section: 'reading', source: 'news reading' },
  { form: 'saksi', meaning: 'witness', pos: 'noun', register: 'neutral', kind: 'root', section: 'reading', source: 'news reading' },
  { form: 'terdengar', meaning: 'to be heard; sound', pos: 'verb', register: 'neutral', kind: 'derived', root: 'dengar', section: 'reading', source: 'news reading' },
  { form: 'keahlian', meaning: 'expertise; skill', pos: 'noun', register: 'formal', kind: 'derived', root: 'ahli', section: 'reading', source: 'news reading' },
  { form: 'bidang', meaning: 'field; area; domain', pos: 'noun', register: 'neutral', kind: 'root', section: 'reading', source: 'news reading' },
  { form: 'menyatakan', meaning: 'to state; declare', pos: 'verb', register: 'formal', kind: 'derived', root: 'nyata', section: 'reading', source: 'news reading' },
  { form: 'lembaga', meaning: 'institution; agency; body', pos: 'noun', register: 'formal', kind: 'root', section: 'reading', source: 'news reading' },
  { form: 'terkait', meaning: 'related; connected; concerning', pos: 'adjective / verb', register: 'formal', kind: 'derived', root: 'kait', section: 'reading', source: 'news reading' },
  { form: 'sedangkan', meaning: 'whereas; while; meanwhile', pos: 'conjunction', register: 'neutral', kind: 'derived', root: 'sedang', section: 'reading', source: 'news reading' },
  { form: 'perselisihan', meaning: 'dispute; disagreement', pos: 'noun', register: 'formal', kind: 'derived', root: 'selisih', section: 'reading', source: 'news reading' },
  { form: 'secara', meaning: 'in a ... way; -ly; in terms of', pos: 'adverb', register: 'formal', kind: 'derived', root: 'cara', section: 'reading', source: 'news reading', note: 'High-frequency formal pattern: secara resmi = officially; secara umum = generally.' },
  { form: 'kawasan', meaning: 'area; region', pos: 'noun', register: 'formal', kind: 'root', canonicalId: 'id-t08-voc-01', section: 'reading', source: 'news reading' },
  { form: 'tingkat', meaning: 'level; rate; degree', pos: 'noun', register: 'formal', kind: 'root', section: 'reading', source: 'news reading', note: 'Common in news: tingkat pengangguran = unemployment rate.' },
  { form: 'sejumlah', meaning: 'a number of; several', pos: 'quantifier', register: 'formal', kind: 'derived', root: 'jumlah', section: 'reading', source: 'news reading', note: 'Sejumlah pejabat = several officials / a number of officials.' },
  { form: 'mengalami', meaning: 'to experience; undergo', pos: 'verb', register: 'formal', kind: 'derived', section: 'reading', source: 'news reading' },
  { form: 'memengaruhi', meaning: 'to affect; influence', pos: 'verb', register: 'formal', kind: 'derived', root: 'pengaruh', section: 'reading', source: 'news reading' },

  { form: 'kegiatan', meaning: 'activity; activities', pos: 'noun', register: 'neutral', kind: 'derived', root: 'giat', section: 'everyday', source: 'lesson / listening' },
  { form: 'menikmati', meaning: 'to enjoy', pos: 'verb', register: 'neutral', kind: 'derived', root: 'nikmat', section: 'everyday', source: 'lesson / listening', note: 'Nikmati! = Enjoy it! / Enjoy!' },
  { form: 'sadar', meaning: 'aware; to realize', pos: 'adjective / verb', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'ongkos', meaning: 'fare; cost; expense', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'bahan', meaning: 'material; ingredient', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'sempat', meaning: 'to have/get the chance or time to', pos: 'auxiliary verb', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'tadinya', meaning: 'originally; at first; previously', pos: 'adverb', register: 'neutral', kind: 'derived', root: 'tadi', section: 'everyday', source: 'production lesson' },
  { form: 'pengeluaran', meaning: 'spending; expenditure; expenses', pos: 'noun', register: 'neutral', kind: 'derived', root: 'keluar', section: 'everyday', source: 'production lesson' },
  { form: 'hampir', meaning: 'almost; nearly', pos: 'adverb', register: 'neutral', kind: 'root', section: 'everyday', source: 'lesson / reading', note: 'Hampir jam sembilan = almost/nearly nine, not exactly nine.' },
  { form: 'trotoar', meaning: 'sidewalk; pavement', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'speaking lesson' },
  { form: 'halte', meaning: 'bus stop; transit stop', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'peron', meaning: 'platform (station)', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'jadwal', meaning: 'schedule; timetable', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'rapat', meaning: 'meeting', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'ternyata', meaning: 'it turns out; actually (contrary to expectation)', pos: 'discourse marker', register: 'neutral', kind: 'derived', root: 'nyata', section: 'everyday', source: 'production lesson' },
  { form: 'akhirnya', meaning: 'finally; eventually', pos: 'adverb', register: 'neutral', kind: 'derived', root: 'akhir', section: 'everyday', source: 'production lesson' },
  { form: 'supaya', meaning: 'so that; in order that', pos: 'conjunction', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'agar', meaning: 'so that; in order to', pos: 'conjunction', register: 'formal', kind: 'root', canonicalId: 'id-u03-voc-agar', section: 'everyday', source: 'production lesson', note: 'Purpose connector; contrast sehingga, which normally introduces a result/consequence.' },
  { form: 'sambil', meaning: 'while; while doing something else at the same time', pos: 'conjunction / adverb', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson', note: 'Simultaneous actions; do not confuse with sampai = until.' },
  { form: 'sampai', meaning: 'until; up to; arrive/reach', pos: 'preposition / verb', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson', note: 'For a time endpoint: sampai jam sembilan = until nine.' },
  { form: 'sehingga', meaning: 'so; with the result that', pos: 'conjunction', register: 'formal', kind: 'root', section: 'everyday', source: 'production lesson', note: 'Result/consequence connector; contrast agar/supaya = purpose.' },
  { form: 'walaupun', meaning: 'although; even though', pos: 'conjunction', register: 'neutral', kind: 'derived', root: 'walau', canonicalId: 'id-t04-v23', section: 'everyday', source: 'production lesson', note: 'Concessive connector: walaupun X, (tetap) Y.' },
  { form: 'perubahan', meaning: 'change; alteration', pos: 'noun', register: 'neutral', kind: 'derived', root: 'ubah', canonicalId: 'id-u03-voc-perubahan', section: 'everyday', source: 'production lesson' },
  { form: 'longgar', meaning: 'loose; relaxed; not tight', pos: 'adjective', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'jadinya', meaning: 'so; as a result; what it became', pos: 'discourse marker', register: 'informal', kind: 'derived', root: 'jadi', section: 'everyday', source: 'production lesson' }
];

// Retired focus words that do not live in any normal lesson go here so they
// remain reviewable. Rotation is a deliberate maintenance
// action, not an automatic “mastery = delete” rule.
// Lega and paling lambat were independently retrieved across repeated lessons.
// Their unchanged definitions preserve their original id-focus-* identities.
export const COMPLETED_STRUGGLE_WORDS = [
  { form: 'lega', meaning: 'relieved; at ease; spacious', pos: 'adjective', register: 'neutral', kind: 'root', section: 'everyday', source: 'speaking / listening lesson' },
  { form: 'paling lambat', meaning: 'at the latest; no later than', pos: 'adverbial phrase', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' }
];

function allLessonCards(units) {
  return (units || []).flatMap(unit => Array.isArray(unit.vocabulary) ? unit.vocabulary : []);
}

function indexLessonCards(units) {
  const byId = new Map();
  const byForm = new Map();
  for (const card of allLessonCards(units)) {
    if (!card || !card.id) continue;
    byId.set(card.id, card);
    const key = normalizeForm(card.form);
    if (!key) continue;
    if (!byForm.has(key)) byForm.set(key, []);
    byForm.get(key).push(card);
  }
  return { byId, byForm };
}

function fallbackCard(definition) {
  return {
    id: definition.id || `id-focus-${slug(definition.form)}`,
    unitId: 'id-personal-focus',
    form: definition.form,
    meaning: definition.meaning,
    pos: definition.pos || 'word',
    register: definition.register || 'neutral',
    kind: definition.kind || 'root',
    section: definition.section || 'everyday',
    ...(definition.root ? { root: definition.root } : {}),
    ...(definition.example ? { example: definition.example } : {}),
    ...(definition.note ? { note: definition.note } : {})
  };
}

function resolveDefinition(definition, index) {
  let canonical = null;
  if (definition.canonicalId) canonical = index.byId.get(definition.canonicalId) || null;
  if (!canonical) {
    const matches = index.byForm.get(normalizeForm(definition.form)) || [];
    if (matches.length === 1) canonical = matches[0];
    else if (matches.length > 1) {
      canonical = definition.preferredUnitId
        ? matches.find(card => card.unitId === definition.preferredUnitId) || matches[0]
        : matches[0];
    }
  }
  const card = canonical || fallbackCard(definition);
  return {
    ...card,
    focusSource: definition.source || '',
    focusNote: definition.note || card.note || '',
    focusCanonical: Boolean(canonical)
  };
}

export function resolveCustomVocabulary(units, deck = 'active') {
  const definitions = deck === 'completed' ? COMPLETED_STRUGGLE_WORDS : ACTIVE_STRUGGLE_WORDS;
  const index = indexLessonCards(units);
  return definitions.map(definition => resolveDefinition(definition, index));
}

export function customVocabularyCounts(units) {
  return {
    active: resolveCustomVocabulary(units, 'active').length,
    completed: resolveCustomVocabulary(units, 'completed').length
  };
}
