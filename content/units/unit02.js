export const unit02 = {
  id: 'id-stage1-unit02',
  title: 'Akar kata dan bentuk berimbuhan',
  level: 2,
  description: 'Hubungkan kata dasar dengan bentuk meN-, di-, dan -an dalam kalimat pendek.',
  vocabulary: [
    { id: 'id-u02-voc-tulis', unitId: 'id-stage1-unit02', form: 'tulis', meaning: 'write (root)', example: 'Rina menulis surat.' },
    { id: 'id-u02-voc-baca', unitId: 'id-stage1-unit02', form: 'baca', meaning: 'read (root)', example: 'Rina membaca buku.' },
    { id: 'id-u02-voc-kirim', unitId: 'id-stage1-unit02', form: 'kirim', meaning: 'send (root)', example: 'Ibu mengirim pesan.' },
    { id: 'id-u02-voc-selesai', unitId: 'id-stage1-unit02', form: 'selesai', meaning: 'finish; complete', example: 'Rina menyelesaikan tugas.' },
    { id: 'id-u02-voc-surat', unitId: 'id-stage1-unit02', form: 'surat', meaning: 'letter', example: 'Rina menulis surat.' },
    { id: 'id-u02-voc-pesan', unitId: 'id-stage1-unit02', form: 'pesan', meaning: 'message', example: 'Ibu mengirim pesan.' },
    { id: 'id-u02-voc-tugas', unitId: 'id-stage1-unit02', form: 'tugas', meaning: 'task; assignment', example: 'Tugas itu sudah selesai.' },
    { id: 'id-u02-voc-oleh', unitId: 'id-stage1-unit02', form: 'oleh', meaning: 'by (introduces an agent in passive clauses)', example: 'Surat itu ditulis oleh Rina.' }
  ],
  morphology: [
    {
      id: 'id-u02-morph-menulis', unitId: 'id-stage1-unit02', form: 'menulis', context: 'Rina menulis surat.', root: 'tulis', affixes: ['meN-'],
      process: 'The active prefix meN- surfaces as men- before tulis; the initial t is omitted.', meaning: 'write; Rina is the writer',
      steps: [
        { prompt: 'Apa kata dasarnya?', choices: ['tulis', 'surat', 'kirim'], answer: 'tulis', explanation: 'The root is “tulis” (write). In this form, meN- appears as men- and the initial t is omitted.' },
        { prompt: 'Apa yang berubah dari “tulis” menjadi “menulis”?', choices: ['The t drops and men- is added.', 'The t stays and di- is added.', 'The word becomes a noun.'], answer: 'The t drops and men- is added.', explanation: 'Before this root, meN- takes the men- shape and the initial t is omitted.' },
        { prompt: 'Siapa yang menulis?', choices: ['Rina', 'Surat', 'Tidak disebutkan'], answer: 'Rina', explanation: 'In “Rina menulis surat,” Rina is the subject and writer.' }
      ]
    },
    {
      id: 'id-u02-morph-ditulis', unitId: 'id-stage1-unit02', form: 'ditulis', context: 'Surat itu ditulis oleh Rina.', root: 'tulis', affixes: ['di-'],
      process: 'di- is attached to the verb to form a passive; it is separate only when di marks a location.', meaning: 'is written; the letter is what is written',
      steps: [
        { prompt: 'Dalam kalimat ini, apa arti “ditulis”?', choices: ['is written', 'writes', 'writing (a piece of writing)'], answer: 'is written', explanation: 'The attached prefix di- marks a passive verb: the letter is written by Rina.' },
        { prompt: 'Mana yang menunjukkan lokasi?', choices: ['di rumah', 'ditulis', 'menulis'], answer: 'di rumah', explanation: 'The location word “di” is separate: “di rumah.” The passive prefix is attached: “ditulis.”' }
      ]
    },
    {
      id: 'id-u02-morph-membaca', unitId: 'id-stage1-unit02', form: 'membaca', context: 'Rina membaca buku.', root: 'baca', affixes: ['meN-'],
      process: 'The active prefix meN- surfaces as mem- before baca; b is retained.', meaning: 'read; Rina is the reader',
      steps: [
        { prompt: 'Apa kata dasar “membaca”?', choices: ['baca', 'buku', 'tulis'], answer: 'baca', explanation: '“Membaca” is formed from “baca” with the active meN- prefix.' },
        { prompt: 'Apa yang dibaca Rina?', choices: ['Buku.', 'Surat.', 'Pesan.'], answer: 'Buku.', explanation: 'The sentence says “Rina membaca buku.”' }
      ]
    },
    {
      id: 'id-u02-morph-bacaan', unitId: 'id-stage1-unit02', form: 'bacaan', context: 'Bacaan itu pendek.', root: 'baca', affixes: ['-an'],
      process: '-an forms a noun here: something to read, or reading material.', meaning: 'reading material; a text to read',
      steps: [
        { prompt: 'Dalam “Bacaan itu pendek,” apakah “bacaan” kata kerja atau kata benda?', choices: ['Kata benda.', 'Kata kerja.', 'Kata ganti.'], answer: 'Kata benda.', explanation: '“Bacaan” names reading material; “pendek” describes it.' },
        { prompt: '“Bacaan” di sini paling dekat artinya dengan apa?', choices: ['Reading material.', 'A person who reads.', 'The act of sending.'], answer: 'Reading material.', explanation: 'The noun suffix -an creates “bacaan,” a text or material to read.' }
      ]
    },
    {
      id: 'id-u02-morph-mengirim', unitId: 'id-stage1-unit02', form: 'mengirim', context: 'Ibu mengirim pesan.', root: 'kirim', affixes: ['meN-'],
      process: 'The active prefix meN- surfaces as meng- before kirim; initial k is omitted.', meaning: 'send; Ibu is the sender',
      steps: [
        { prompt: 'Apa kata dasarnya?', choices: ['kirim', 'pesan', 'selesai'], answer: 'kirim', explanation: '“Mengirim” comes from “kirim”; the initial k is omitted in this meN- form.' },
        { prompt: 'Apa yang dikirim Ibu?', choices: ['Pesan.', 'Surat.', 'Buku.'], answer: 'Pesan.', explanation: 'The sentence says “Ibu mengirim pesan.”' }
      ]
    },
    {
      id: 'id-u02-morph-diselesaikan', unitId: 'id-stage1-unit02', form: 'diselesaikan', context: 'Tugas itu diselesaikan oleh Rina.', root: 'selesai', affixes: ['di-', '-kan'],
      process: 'Passive di- plus -kan on selesai; learn this common whole form in context rather than as a universal suffix rule.', meaning: 'is completed; the task is what gets completed',
      steps: [
        { prompt: 'Dalam kalimat ini, apa arti “diselesaikan”?', choices: ['is completed', 'completes', 'completion (a text)'], answer: 'is completed', explanation: 'With the task as subject and “oleh Rina” as agent, “diselesaikan” means “is completed.”' },
        { prompt: 'Apa tambahan pada kata dasar “selesai”?', choices: ['di- and -kan', 'meN- only', '-an only'], answer: 'di- and -kan', explanation: 'The written form is di- + selesai + -kan. Here it describes a task being completed.' },
        { prompt: 'Siapa yang menyelesaikan tugas?', choices: ['Rina.', 'Tugas itu.', 'Tidak disebutkan.'], answer: 'Rina.', explanation: 'The phrase “oleh Rina” names the agent.' }
      ]
    }
  ],
  readings: [{
    id: 'id-u02-reading-tugas', unitId: 'id-stage1-unit02', title: 'Surat dan tugas',
    text: 'Rina membaca surat dari Ibu. Ibu mengirim surat itu pada pagi hari. Rina menulis jawaban. Setelah itu, tugasnya diselesaikan.',
    translation: 'Rina reads a letter from Mother. Mother sends the letter in the morning. Rina writes a reply. After that, her task is completed.',
    questions: [
      { id: 'id-u02-readq-sender', unitId: 'id-stage1-unit02', prompt: 'Siapa yang mengirim surat?', choices: ['Ibu.', 'Rina.', 'Tugas.'], answer: 'Ibu.', explanation: 'The passage says “Ibu mengirim surat itu.”' },
      { id: 'id-u02-readq-after', unitId: 'id-stage1-unit02', prompt: 'Apa yang dilakukan Rina setelah membaca surat?', choices: ['Menulis jawaban.', 'Mengirim tugas.', 'Membaca buku.'], answer: 'Menulis jawaban.', explanation: 'The passage says “Rina menulis jawaban.”' }
    ]
  }]
};
