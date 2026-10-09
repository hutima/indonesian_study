// Vocabulary-only supplemental lessons. These are selectable alongside normal
// lessons, but they deliberately add no morphology, grammar, or reading tasks.
// Existing surface forms reuse the canonical lesson card ID so SRS history stays
// longitudinal across decks. Personal-only fallback IDs are permanent.

const normalizeForm = value => String(value || '')
  .toLocaleLowerCase('id')
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const slug = value => normalizeForm(value).replace(/\s+/g, '-');

const setPhrase = (form, meaning, pos = 'set phrase', register = 'formal', extra = {}) => ({
  form, meaning, pos, register, kind: 'phrase', section: 'reading', ...extra
});

export const SET_PHRASE_DEFINITIONS = [
  setPhrase('salah satu', 'one of'),
  setPhrase('salah seorang', 'one person; one of the people'),
  setPhrase('pihak berwenang', 'the authorities'),
  setPhrase('lepas pantai', 'offshore'),
  setPhrase('pemungutan suara', 'voting; the vote'),
  setPhrase('hak suara', 'voting rights'),
  setPhrase('pengambilan keputusan', 'decision-making'),
  setPhrase('dengan sendirinya', 'by itself; automatically'),
  setPhrase('sejauh ini', 'so far; thus far'),
  setPhrase('dengan demikian', 'therefore; thus', 'discourse connector'),
  setPhrase('sementara itu', 'meanwhile', 'discourse connector'),
  setPhrase('untuk sementara waktu', 'temporarily; for the time being'),
  setPhrase('pada saat', 'at the time when'),
  setPhrase('dalam negeri', 'domestic; internal'),
  setPhrase('urusan dalam negeri', 'internal; domestic affairs'),
  setPhrase('hubungan diplomatik', 'diplomatic relations'),
  setPhrase('keadaan darurat', 'state of emergency'),
  setPhrase('mencapai daratan', 'reach land; make landfall'),
  setPhrase('mengalami resesi', 'experience a recession'),
  setPhrase('mengalami penurunan', 'experience a decline'),
  setPhrase('mengalami peningkatan', 'experience an increase'),
  setPhrase('menurut laporan', 'according to the report'),
  setPhrase('berdasarkan laporan', 'based on the report'),
  setPhrase('belum dapat dipastikan', 'cannot yet be confirmed or determined'),
  setPhrase('sudah dipastikan', 'has been confirmed'),
  setPhrase('masih merupakan usulan', 'is still only a proposal'),
  setPhrase('sudah berlaku', 'is already in force; has taken effect'),
  setPhrase('mulai berlaku', 'take effect; come into force'),
  setPhrase('tidak berlaku', 'does not apply; is not in force'),
  setPhrase('memiliki wewenang untuk', 'have the authority to'),
  setPhrase('melanggar hak', 'violate rights'),
  setPhrase('mengajukan permintaan', 'submit; make a request'),
  setPhrase('menolak permintaan', 'reject a request'),
  setPhrase('mempertimbangkan permintaan', 'consider a request'),
  setPhrase('perselisihan hukum', 'legal dispute'),
  setPhrase('rancangan undang-undang', 'bill; draft law'),
  setPhrase('menurut ketentuan yang berlaku', 'according to the rules currently in force'),
  setPhrase('sesuai ketentuan yang berlaku', 'in accordance with current rules'),
  setPhrase('menjadi salah satu penyebab', 'be one of the causes'),
  setPhrase('tidak terbatas pada', 'not limited to'),
  setPhrase('bertujuan untuk', 'aim to'),
  setPhrase('berkaitan dengan', 'relate to; concern'),
  setPhrase('terkait dengan', 'related to'),
  setPhrase('sebagai bagian dari', 'as part of'),
  setPhrase('sejumlah', 'a number of; several', 'quantifier', 'formal', { id: 'id-focus-sejumlah', kind: 'derived', root: 'jumlah' }),
  setPhrase('sedikitnya', 'at least', 'adverb', 'formal', { kind: 'derived', root: 'sedikit' }),
  setPhrase('sekitar', 'approximately; around', 'adverb / preposition', 'neutral', { kind: 'root' }),
  setPhrase('lebih dari', 'more than', 'comparison phrase', 'neutral'),
  setPhrase('kurang dari', 'less than', 'comparison phrase', 'neutral')
];

const day = (form, meaning) => ({ form, meaning, pos: 'noun', register: 'neutral', kind: 'root', section: 'everyday' });
const number = (form, meaning) => ({ form, meaning, pos: 'number', register: 'neutral', kind: 'root', section: 'everyday' });

export const DAYS_AND_NUMBERS_DEFINITIONS = [
  day('Senin', 'Monday'), day('Selasa', 'Tuesday'), day('Rabu', 'Wednesday'),
  day('Kamis', 'Thursday'), day('Jumat', 'Friday'), day('Sabtu', 'Saturday'), day('Minggu', 'Sunday'),
  number('satu', 'one; 1'), number('dua', 'two; 2'), number('tiga', 'three; 3'), number('empat', 'four; 4'),
  number('lima', 'five; 5'), number('enam', 'six; 6'), number('tujuh', 'seven; 7'), number('delapan', 'eight; 8'),
  number('sembilan', 'nine; 9'), number('sepuluh', 'ten; 10'), number('sebelas', 'eleven; 11'),
  number('dua belas', 'twelve; 12'), number('tiga belas', 'thirteen; 13'), number('empat belas', 'fourteen; 14'),
  number('lima belas', 'fifteen; 15'), number('enam belas', 'sixteen; 16'), number('tujuh belas', 'seventeen; 17'),
  number('delapan belas', 'eighteen; 18'), number('sembilan belas', 'nineteen; 19'), number('dua puluh', 'twenty; 20')
];

function indexCards(units) {
  const byForm = new Map();
  for (const unit of units || []) {
    for (const card of unit.vocabulary || []) {
      const key = normalizeForm(card.form);
      if (!key) continue;
      if (!byForm.has(key)) byForm.set(key, []);
      byForm.get(key).push(card);
    }
  }
  return byForm;
}

function resolveDefinition(definition, unitId, prefix, byForm) {
  const matches = byForm.get(normalizeForm(definition.form)) || [];
  const canonical = matches.length ? matches[0] : null;
  return {
    ...(canonical || {}),
    id: canonical?.id || definition.id || `${prefix}-${slug(definition.form)}`,
    unitId,
    form: definition.form,
    meaning: definition.meaning,
    pos: definition.pos || canonical?.pos || 'word',
    register: definition.register || canonical?.register || 'neutral',
    kind: definition.kind || canonical?.kind || 'root',
    section: definition.section || canonical?.section || 'everyday',
    ...(definition.root ? { root: definition.root } : canonical?.root ? { root: canonical.root } : {}),
    supplemental: true
  };
}

function vocabularyOnlyUnit(id, title, description, vocabulary) {
  return {
    id, title, level: 'Supplemental', supplemental: true, description,
    guide: { vocabulary: description },
    vocabulary,
    morphology: [], grammar: [], readings: []
  };
}

export function buildSupplementalUnits(coreUnits) {
  const byForm = indexCards(coreUnits);
  const phraseId = 'id-supplemental-set-phrases';
  const basicsId = 'id-supplemental-days-numbers';
  return [
    vocabularyOnlyUnit(
      phraseId,
      'Set phrases',
      'High-frequency formal/news chunks and reusable multiword expressions for recognition and production.',
      SET_PHRASE_DEFINITIONS.map(definition => resolveDefinition(definition, phraseId, 'id-supp-set', byForm))
    ),
    vocabularyOnlyUnit(
      basicsId,
      'Days & numbers',
      'Core weekdays and the numbers one through twenty.',
      DAYS_AND_NUMBERS_DEFINITIONS.map(definition => resolveDefinition(definition, basicsId, 'id-supp-basic', byForm))
    )
  ];
}
