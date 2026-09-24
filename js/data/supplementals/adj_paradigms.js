(function () {
  const KEY = 'W1_ADJ_PARADIGMS';

  window.registerSupplementalVocabSet(KEY, {
    label: 'πολύς / μέγας-paradigm',
    week: 1,
    chapter: 5,
    cards: [
      // πολύς — irregular adj. Distinct masc.-only forms first, then the
      // 2nd-decl. forms shared between masc. and neut. (gen./dat. sg. and
      // dat. pl.) and the gen. pl. shared across all three genders.
      // Each card carries its own `lemma` so parsing keeps πολύς and μέγας as
      // two separate paradigms — they share a declension pattern but are
      // different words, and a single merged paradigm let the form lookup
      // resolve a μέγας card's feminine to πολύς's πολλή.
      { g: 'πολύς', e: 'much / many (masc. Nom. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολύν', e: 'much / many (masc. Acc. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλοῦ', e: 'of much / of many (masc./neut. Gen. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλῷ', e: 'to/for much / many (masc./neut. Dat. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλοί', e: 'many (masc. Nom. pl.)', lemma: 'πολύς', required: true },
      { g: 'πολλούς', e: 'many (masc. Acc. pl.)', lemma: 'πολύς', required: true },
      { g: 'πολλῶν', e: 'of many (masc./fem./neut. Gen. pl.)', lemma: 'πολύς', required: true },
      { g: 'πολλοῖς', e: 'to/for many (masc./neut. Dat. pl.)', lemma: 'πολύς', required: true },
      // πολύς — fem.
      { g: 'πολλή', e: 'much / many (fem. Nom. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλήν', e: 'much / many (fem. Acc. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλῆς', e: 'of much / of many (fem. Gen. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλῇ', e: 'to/for much / many (fem. Dat. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλαί', e: 'many (fem. Nom. pl.)', lemma: 'πολύς', required: true },
      { g: 'πολλάς', e: 'many (fem. Acc. pl.)', lemma: 'πολύς', required: true },
      { g: 'πολλαῖς', e: 'to/for many (fem. Dat. pl.)', lemma: 'πολύς', required: true },
      // πολύς — neut. (the distinct forms; gen./dat. sg. and gen./dat. pl.
      // are syncretic with masc. and are tagged above).
      { g: 'πολύ', e: 'much (neut. Nom./Acc. sg.)', lemma: 'πολύς', required: true },
      { g: 'πολλά', e: 'many (neut. Nom./Acc. pl.)', lemma: 'πολύς', required: true },
      // μέγας — same pattern as πολύς for syncretism.
      { g: 'μέγας', e: 'great (masc. Nom. sg.)', lemma: 'μέγας', required: true },
      { g: 'μέγαν', e: 'great (masc. Acc. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλου', e: 'of great (masc./neut. Gen. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλῳ', e: 'to/for great (masc./neut. Dat. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλοι', e: 'great (masc. Nom. pl.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλους', e: 'great (masc. Acc. pl.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλων', e: 'of great (masc./fem./neut. Gen. pl.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλοις', e: 'to/for great (masc./neut. Dat. pl.)', lemma: 'μέγας', required: true },
      // μέγας — fem.
      { g: 'μεγάλη', e: 'great (fem. Nom. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλην', e: 'great (fem. Acc. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλης', e: 'of great (fem. Gen. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλῃ', e: 'to/for great (fem. Dat. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλαι', e: 'great (fem. Nom. pl.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλας', e: 'great (fem. Acc. pl.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλαις', e: 'to/for great (fem. Dat. pl.)', lemma: 'μέγας', required: true },
      // μέγας — neut. (only the distinct neut. forms).
      { g: 'μέγα', e: 'great (neut. Nom./Acc. sg.)', lemma: 'μέγας', required: true },
      { g: 'μεγάλα', e: 'great (neut. Nom./Acc. pl.)', lemma: 'μέγας', required: true }
    ]
  });

  window.registerSupplementalGrammarSet(KEY, {
    label: 'πολύς / μέγας-paradigm',
    notes: 'Paradigm: irregular adjectives πολύς and μέγας.',
    items: [
      {
        family: 'Irregular adjective recognition',
        lemma: 'πολύς',
        gloss: 'much / many',
        questions: [
          {
            form: 'πολύς',
            prompt: 'Why is this form irregular?',
            answer: 'πολύς/πολύ use short stems in nom./acc. sg. masc./neut.; all other forms use πολλ-',
            choices: [
              'πολύς/πολύ use short stems in nom./acc. sg. masc./neut.; all other forms use πολλ-',
              'It follows the 3rd declension throughout',
              'It is a contract adjective',
              'It lacks a feminine form'
            ]
          }
        ]
      },
      {
        family: 'Irregular adjective recognition',
        lemma: 'μέγας',
        gloss: 'great',
        questions: [
          {
            form: 'μέγας',
            prompt: 'Why is this form irregular?',
            answer: 'μέγας/μέγα use short stems in nom./acc. sg. masc./neut.; all other forms use μεγαλ-',
            choices: [
              'μέγας/μέγα use short stems in nom./acc. sg. masc./neut.; all other forms use μεγαλ-',
              'It is a 3rd declension adjective throughout',
              'It contracts like a verb',
              'It lacks a neuter form'
            ]
          }
        ]
      }
    ]
  });
})();
