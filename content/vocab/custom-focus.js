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

  { form: 'kegiatan', meaning: 'activity; activities', pos: 'noun', register: 'neutral', kind: 'derived', root: 'giat', section: 'everyday', source: 'lesson / listening' },
  { form: 'menikmati', meaning: 'to enjoy', pos: 'verb', register: 'neutral', kind: 'derived', root: 'nikmat', section: 'everyday', source: 'lesson / listening', note: 'Nikmati! = Enjoy it! / Enjoy!' },
  { form: 'sadar', meaning: 'aware; to realize', pos: 'adjective / verb', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'ongkos', meaning: 'fare; cost; expense', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'bahan', meaning: 'material; ingredient', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'sempat', meaning: 'to have/get the chance or time to', pos: 'auxiliary verb', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'tadinya', meaning: 'originally; at first; previously', pos: 'adverb', register: 'neutral', kind: 'derived', root: 'tadi', section: 'everyday', source: 'production lesson' },
  { form: 'pengeluaran', meaning: 'spending; expenditure; expenses', pos: 'noun', register: 'neutral', kind: 'derived', root: 'keluar', section: 'everyday', source: 'production lesson' },
  { form: 'lega', meaning: 'relieved; at ease; spacious', pos: 'adjective', register: 'neutral', kind: 'root', section: 'everyday', source: 'speaking / listening lesson' },
  { form: 'trotoar', meaning: 'sidewalk; pavement', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'speaking lesson' },
  { form: 'halte', meaning: 'bus stop; transit stop', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'peron', meaning: 'platform (station)', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'jadwal', meaning: 'schedule; timetable', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'rapat', meaning: 'meeting', pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'ternyata', meaning: 'it turns out; actually (contrary to expectation)', pos: 'discourse marker', register: 'neutral', kind: 'derived', root: 'nyata', section: 'everyday', source: 'production lesson' },
  { form: 'akhirnya', meaning: 'finally; eventually', pos: 'adverb', register: 'neutral', kind: 'derived', root: 'akhir', section: 'everyday', source: 'production lesson' },
  { form: 'supaya', meaning: 'so that; in order that', pos: 'conjunction', register: 'neutral', kind: 'root', section: 'everyday', source: 'production lesson' },
  { form: 'jadinya', meaning: 'so; as a result; what it became', pos: 'discourse marker', register: 'informal', kind: 'derived', root: 'jadi', section: 'everyday', source: 'production lesson' }
];

// Retired focus words that do not live in any normal lesson go here so they
// remain reviewable. This starts empty; rotation is a deliberate maintenance
// action, not an automatic “mastery = delete” rule.
export const COMPLETED_STRUGGLE_WORDS = [];

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
