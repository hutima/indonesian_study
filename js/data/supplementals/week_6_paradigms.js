(function () {
  window.registerSupplementalVocabSet('W6_LUO_PASSIVE_INDICATIVE', {
    label: 'λύω — passive indicative (4 tenses)',
    week: 6,
    chapter: 15,
    cards: [
      { g: 'λύομαι', e: 'Present: I am (being) untied (1st person sg.)', required: true },
      { g: 'λύῃ', e: 'Present: you are (being) untied (2nd person sg.)', required: true },
      { g: 'λύεται', e: 'Present: he/she/it is (being) untied (3rd person sg.)', required: true },
      { g: 'λυόμεθα', e: 'Present: we are (being) untied (1st person pl.)', required: true },
      { g: 'λύεσθε', e: 'Present: you are (being) untied (2nd person pl.)', required: true },
      { g: 'λύονται', e: 'Present: they are (being) untied (3rd person pl.)', required: true },
      { g: 'λυθήσομαι', e: 'Future: I will be untied (1st person sg.)', required: true },
      { g: 'λυθήσῃ', e: 'Future: you will be untied (2nd person sg.)', required: true },
      { g: 'λυθήσεται', e: 'Future: he/she/it will be untied (3rd person sg.)', required: true },
      { g: 'λυθησόμεθα', e: 'Future: we will be untied (1st person pl.)', required: true },
      { g: 'λυθήσεσθε', e: 'Future: you will be untied (2nd person pl.)', required: true },
      { g: 'λυθήσονται', e: 'Future: they will be untied (3rd person pl.)', required: true },
      { g: 'ἐλυόμην', e: 'Imperfect: I was being untied (1st person sg.)', required: true },
      { g: 'ἐλύου', e: 'Imperfect: you were being untied (2nd person sg.)', required: true },
      { g: 'ἐλύετο', e: 'Imperfect: he/she/it was being untied (3rd person sg.)', required: true },
      { g: 'ἐλυόμεθα', e: 'Imperfect: we were being untied (1st person pl.)', required: true },
      { g: 'ἐλύεσθε', e: 'Imperfect: you were being untied (2nd person pl.)', required: true },
      { g: 'ἐλύοντο', e: 'Imperfect: they were being untied (3rd person pl.)', required: true },
      { g: 'ἐλύθην', e: 'Aorist: I was untied (1st person sg.)', required: true },
      { g: 'ἐλύθης', e: 'Aorist: you were untied (2nd person sg.)', required: true },
      { g: 'ἐλύθη', e: 'Aorist: he/she/it was untied (3rd person sg.)', required: true },
      { g: 'ἐλύθημεν', e: 'Aorist: we were untied (1st person pl.)', required: true },
      { g: 'ἐλύθητε', e: 'Aorist: you were untied (2nd person pl.)', required: true },
      { g: 'ἐλύθησαν', e: 'Aorist: they were untied (3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W6_LUO_PASSIVE_OTHER_MOODS', {
    label: 'λύω — passive imperative, infinitive, participle (present & aorist)',
    week: 6,
    chapter: 15,
    cards: [
      { g: 'λύου', e: 'be (being) untied! (Present passive imperative, 2nd person sg.)', required: true },
      { g: 'λύεσθε', e: 'be (being) untied! (Present passive imperative, 2nd person pl.)', required: true },
      { g: 'λύεσθαι', e: 'to be (being) untied (Present passive infinitive)', required: true },
      { g: 'λυόμενος', e: 'being untied (Present passive participle, masc. Nom. sg.)', required: true },
      { g: 'λύθητι', e: 'be untied! (Aorist passive imperative, 2nd person sg.)', required: true },
      { g: 'λύθητε', e: 'be untied! (Aorist passive imperative, 2nd person pl.)', required: true },
      { g: 'λυθῆναι', e: 'to be untied (Aorist passive infinitive)', required: true },
      { g: 'λυθείς', e: 'having been untied (Aorist passive participle, masc. Nom. sg.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W6_LUTHEIS_PARTICIPLE', {
    label: 'λυθείς, λυθεῖσα, λυθέν — aorist passive participle',
    week: 6,
    // Duff teaches the aorist passive participle (-θείς) in Ch 14 with the
    // rest of the participle paradigm, not with the finite passive system
    // (Ch 15). Gate to Ch 14 and surface it under λύω like the active forms.
    chapter: 14,
    parsingLemma: 'λύω',
    cards: [
      { g: 'λυθείς', e: 'having been untied (masc. Nom. sg.)', required: true },
      { g: 'λυθέντα', e: 'having been untied (masc. Acc. sg.; neut. Nom./Acc. pl.)', required: true },
      { g: 'λυθέντος', e: 'of (one) having been untied (masc./neut. Gen. sg.)', required: true },
      { g: 'λυθέντι', e: 'to/for (one) having been untied (masc./neut. Dat. sg.)', required: true },
      { g: 'λυθέντες', e: 'having been untied (masc. Nom. pl.)', required: true },
      { g: 'λυθέντας', e: 'having been untied (masc. Acc. pl.)', required: true },
      { g: 'λυθέντων', e: 'of (those) having been untied (masc./neut. Gen. pl.)', required: true },
      { g: 'λυθεῖσιν', e: 'to/for (those) having been untied (masc./neut. Dat. pl.)', required: true },
      { g: 'λυθεῖσα', e: 'having been untied (fem. Nom. sg.)', required: true },
      { g: 'λυθεῖσαν', e: 'having been untied (fem. Acc. sg.)', required: true },
      { g: 'λυθείσης', e: 'of (one) having been untied (fem. Gen. sg.)', required: true },
      { g: 'λυθείσῃ', e: 'to/for (one) having been untied (fem. Dat. sg.)', required: true },
      { g: 'λυθεῖσαι', e: 'having been untied (fem. Nom. pl.)', required: true },
      { g: 'λυθείσας', e: 'having been untied (fem. Acc. pl.)', required: true },
      { g: 'λυθεισῶν', e: 'of (those) having been untied (fem. Gen. pl.)', required: true },
      { g: 'λυθείσαις', e: 'to/for (those) having been untied (fem. Dat. pl.)', required: true },
      { g: 'λυθέν', e: 'having been untied (neut. Nom./Acc. sg.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W6_LUO_MIDDLE_INDICATIVE', {
    label: 'λύω — middle indicative (future & aorist)',
    week: 6,
    // The middle voice arrives with the passive in Ch 15. λύω's present and
    // imperfect middle are identical in form to the passive (λύομαι, ἐλυόμην
    // — already drilled by W6_LUO_PASSIVE_INDICATIVE), so the only forms where
    // the middle is its own paradigm are the FUTURE (λύσομαι, vs future
    // passive λυθήσομαι) and the AORIST (ἐλυσάμην, vs aorist passive ἐλύθην).
    // Those two tenses are what this set adds. Surfaces under λύω via the
    // "λύω —" label prefix (see extractLemma in paradigm_morphology.js).
    chapter: 15,
    cards: [
      { g: 'λύσομαι', e: 'Future: I will loose for myself (1st person sg.)', required: true },
      { g: 'λύσῃ', e: 'Future: you will loose for yourself (2nd person sg.)', required: true },
      { g: 'λύσεται', e: 'Future: he/she/it will loose for him/herself (3rd person sg.)', required: true },
      { g: 'λυσόμεθα', e: 'Future: we will loose for ourselves (1st person pl.)', required: true },
      { g: 'λύσεσθε', e: 'Future: you will loose for yourselves (2nd person pl.)', required: true },
      { g: 'λύσονται', e: 'Future: they will loose for themselves (3rd person pl.)', required: true },
      { g: 'ἐλυσάμην', e: 'Aorist: I loosed for myself (1st person sg.)', required: true },
      { g: 'ἐλύσω', e: 'Aorist: you loosed for yourself (2nd person sg.)', required: true },
      { g: 'ἐλύσατο', e: 'Aorist: he/she/it loosed for him/herself (3rd person sg.)', required: true },
      { g: 'ἐλυσάμεθα', e: 'Aorist: we loosed for ourselves (1st person pl.)', required: true },
      { g: 'ἐλύσασθε', e: 'Aorist: you loosed for yourselves (2nd person pl.)', required: true },
      { g: 'ἐλύσαντο', e: 'Aorist: they loosed for themselves (3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W6_LUO_PERFECT', {
    label: 'λύω — perfect active indicative',
    week: 6,
    // Duff introduces the perfect tense in Ch 16, the second chapter of week
    // 6 (Ch 15–16). Without this the set would inherit the week's first
    // chapter (15) and unlock — and seed 'perfect'/'completed' parsing
    // distractors — a chapter early.
    chapter: 16,
    cards: [
      { g: 'λέλυκα', e: 'Perfect: I have untied (1st person sg.)', required: true },
      { g: 'λέλυκας', e: 'Perfect: you have untied (2nd person sg.)', required: true },
      { g: 'λέλυκε(ν)', e: 'Perfect: he/she/it has untied (3rd person sg.)', required: true },
      { g: 'λελύκαμεν', e: 'Perfect: we have untied (1st person pl.)', required: true },
      { g: 'λελύκατε', e: 'Perfect: you have untied (2nd person pl.)', required: true },
      { g: 'λελύκασι(ν)', e: 'Perfect: they have untied (3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W6_LUO_PLUPERFECT', {
    label: 'λύω — pluperfect active indicative',
    week: 6,
    // Same as the perfect: the pluperfect is part of the Ch 16 perfect
    // system, so pin it to 16 rather than letting it inherit week 6's first
    // chapter (15).
    chapter: 16,
    cards: [
      { g: 'ἐλελύκειν', e: 'Pluperfect: I had untied (1st person sg.)', required: true },
      { g: 'ἐλελύκεις', e: 'Pluperfect: you had untied (2nd person sg.)', required: true },
      { g: 'ἐλελύκει', e: 'Pluperfect: he/she/it had untied (3rd person sg.)', required: true },
      { g: 'ἐλελύκειμεν', e: 'Pluperfect: we had untied (1st person pl.)', required: true },
      { g: 'ἐλελύκειτε', e: 'Pluperfect: you had untied (2nd person pl.)', required: true },
      { g: 'ἐλελύκεισαν', e: 'Pluperfect: they had untied (3rd person pl.)', required: true }
    ]
  });

})();
