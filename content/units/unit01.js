export const unit01 = {
  id: 'id-stage1-unit01',
  title: 'Kata sehari-hari',
  level: 1,
  description: 'Kenali kata umum, orang, benda, dan kalimat sederhana.',
  vocabulary: [
    { id: 'id-u01-voc-saya', unitId: 'id-stage1-unit01', form: 'saya', meaning: 'I; me', example: 'Saya makan nasi.', note: 'Polite or neutral first-person pronoun.' },
    { id: 'id-u01-voc-dia', unitId: 'id-stage1-unit01', form: 'dia', meaning: 'he; she; they (singular)', example: 'Dia di rumah.' },
    { id: 'id-u01-voc-ini', unitId: 'id-stage1-unit01', form: 'ini', meaning: 'this', example: 'Buku ini baru.' },
    { id: 'id-u01-voc-itu', unitId: 'id-stage1-unit01', form: 'itu', meaning: 'that', example: 'Rumah itu besar.' },
    { id: 'id-u01-voc-ada', unitId: 'id-stage1-unit01', form: 'ada', meaning: 'there is; exist; have (in context)', example: 'Ada buku di meja.' },
    { id: 'id-u01-voc-di', unitId: 'id-stage1-unit01', form: 'di', meaning: 'at; in; on (location)', example: 'Buku ada di meja.', note: 'The location word di is written separately.' },
    { id: 'id-u01-voc-ke', unitId: 'id-stage1-unit01', form: 'ke', meaning: 'to; toward', example: 'Dia pergi ke rumah.' },
    { id: 'id-u01-voc-dan', unitId: 'id-stage1-unit01', form: 'dan', meaning: 'and', example: 'Ibu dan Rina di rumah.' },
    { id: 'id-u01-voc-tidak', unitId: 'id-stage1-unit01', form: 'tidak', meaning: 'not (before verbs or adjectives)', example: 'Saya tidak makan.' },
    { id: 'id-u01-voc-bukan', unitId: 'id-stage1-unit01', form: 'bukan', meaning: 'not (often before nouns)', example: 'Ini bukan buku.' },
    { id: 'id-u01-voc-makan', unitId: 'id-stage1-unit01', form: 'makan', meaning: 'eat', example: 'Saya makan nasi.' },
    { id: 'id-u01-voc-rumah', unitId: 'id-stage1-unit01', form: 'rumah', meaning: 'house; home', example: 'Dia di rumah.' },
    { id: 'id-u01-voc-buku', unitId: 'id-stage1-unit01', form: 'buku', meaning: 'book', example: 'Buku ini baru.' },
    { id: 'id-u01-voc-nasi', unitId: 'id-stage1-unit01', form: 'nasi', meaning: 'cooked rice', example: 'Saya makan nasi.' },
    { id: 'id-u01-voc-besar', unitId: 'id-stage1-unit01', form: 'besar', meaning: 'big; large', example: 'Rumah itu besar.' }
  ],
  morphology: [
    {
      id: 'id-u01-morph-makan', unitId: 'id-stage1-unit01', form: 'makan', context: 'Saya makan nasi.', root: 'makan', affixes: [],
      process: 'Bare verb form; no added affix.', meaning: 'eat',
      steps: [{
        prompt: 'Dalam kalimat “Saya makan nasi,” apa arti “makan”?',
        choices: ['eat', 'sleep', 'write'], answer: 'eat',
        explanation: '“Makan” is the verb “eat”; “nasi” means cooked rice.'
      }]
    }
  ],
  readings: [{
    id: 'id-u01-reading-rumah', unitId: 'id-stage1-unit01', title: 'Di rumah',
    text: 'Saya di rumah. Ada buku di meja. Saya makan nasi. Rumah itu besar.',
    translation: 'I am at home. There is a book on the table. I eat rice. That house is big.',
    questions: [
      { id: 'id-u01-readq-book', unitId: 'id-stage1-unit01', prompt: 'Di mana buku itu?', choices: ['Di meja.', 'Di pasar.', 'Di sekolah.'], answer: 'Di meja.', explanation: 'The passage says “Ada buku di meja.”' },
      { id: 'id-u01-readq-food', unitId: 'id-stage1-unit01', prompt: 'Apa yang dimakan?', choices: ['Nasi.', 'Buku.', 'Rumah.'], answer: 'Nasi.', explanation: '“Saya makan nasi” means “I eat rice.”' }
    ]
  }]
};
