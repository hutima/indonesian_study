(function () {
  window.registerSupplementalVocabSet('W7_RHUOMAI_PRESENT_MIDDLE_SUBJUNCTIVE', {
    label: 'ῥύομαι — present middle subjunctive',
    week: 7,
    chapter: 17,
    cards: [
      { g: 'ῥύωμαι', e: '(that) I may rescue (Present middle subjunctive, 1st person sg.)', required: true },
      { g: 'ῥύῃ', e: '(that) you may rescue (Present middle subjunctive, 2nd person sg.)', required: true },
      { g: 'ῥύηται', e: '(that) he/she/it may rescue (Present middle subjunctive, 3rd person sg.)', required: true },
      { g: 'ῥυώμεθα', e: '(that) we may rescue (Present middle subjunctive, 1st person pl.)', required: true },
      { g: 'ῥύησθε', e: '(that) you may rescue (Present middle subjunctive, 2nd person pl.)', required: true },
      { g: 'ῥύωνται', e: '(that) they may rescue (Present middle subjunctive, 3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_LUO_PRESENT_PASSIVE_SUBJUNCTIVE', {
    label: 'λύω — present passive subjunctive',
    week: 7,
    chapter: 17,
    cards: [
      { g: 'λύωμαι', e: '(that) I may be untied (Present passive subjunctive, 1st person sg.)', required: true },
      { g: 'λύῃ', e: '(that) you may be untied (Present passive subjunctive, 2nd person sg.)', required: true },
      { g: 'λύηται', e: '(that) he/she/it may be untied (Present passive subjunctive, 3rd person sg.)', required: true },
      { g: 'λυώμεθα', e: '(that) we may be untied (Present passive subjunctive, 1st person pl.)', required: true },
      { g: 'λύησθε', e: '(that) you may be untied (Present passive subjunctive, 2nd person pl.)', required: true },
      { g: 'λύωνται', e: '(that) they may be untied (Present passive subjunctive, 3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_RHUOMAI_AORIST_MIDDLE_SUBJUNCTIVE', {
    label: 'ῥύομαι — 1st aorist middle subjunctive',
    week: 7,
    chapter: 17,
    cards: [
      { g: 'ῥύσωμαι', e: '(that) I may rescue (1st aorist middle subjunctive, 1st person sg.)', required: true },
      { g: 'ῥύσῃ', e: '(that) you may rescue (1st aorist middle subjunctive, 2nd person sg.)', required: true },
      { g: 'ῥύσηται', e: '(that) he/she/it may rescue (1st aorist middle subjunctive, 3rd person sg.)', required: true },
      { g: 'ῥυσώμεθα', e: '(that) we may rescue (1st aorist middle subjunctive, 1st person pl.)', required: true },
      { g: 'ῥύσησθε', e: '(that) you may rescue (1st aorist middle subjunctive, 2nd person pl.)', required: true },
      { g: 'ῥύσωνται', e: '(that) they may rescue (1st aorist middle subjunctive, 3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_GINOMAI_AORIST_MIDDLE_SUBJUNCTIVE', {
    label: 'γίνομαι — 2nd aorist middle subjunctive',
    week: 7,
    chapter: 17,
    cards: [
      { g: 'γένωμαι', e: '(that) I may become (2nd aorist middle subjunctive, 1st person sg.)', required: true },
      { g: 'γένῃ', e: '(that) you may become (2nd aorist middle subjunctive, 2nd person sg.)', required: true },
      { g: 'γένηται', e: '(that) he/she/it may become (2nd aorist middle subjunctive, 3rd person sg.)', required: true },
      { g: 'γενώμεθα', e: '(that) we may become (2nd aorist middle subjunctive, 1st person pl.)', required: true },
      { g: 'γένησθε', e: '(that) you may become (2nd aorist middle subjunctive, 2nd person pl.)', required: true },
      { g: 'γένωνται', e: '(that) they may become (2nd aorist middle subjunctive, 3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_INDEFINITE_CONSTRUCTIONS', {
    label: 'Indefinite constructions (ἄν + subjunctive)',
    week: 7,
    chapter: 17,
    cards: [
      { g: 'ὅς', e: 'who (relative pronoun, masc. Nom. sg.)', required: true },
      { g: 'ὅς ἄν + subjunctive', e: 'whoever (indefinite construction)', required: true },
      { g: 'ὅπου', e: 'where (place)', required: true },
      { g: 'ὅπου ἄν + subjunctive', e: 'wherever (indefinite construction)', required: true },
      { g: 'ὅτε', e: 'when (time)', required: true },
      { g: 'ὅταν + subjunctive', e: 'whenever (indefinite construction)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_THIRD_PERSON_IMPERATIVE', {
    label: 'Third-person imperative (5 voice/tense combos)',
    week: 7,
    chapter: 18,
    // Each form carries its own `lemma` so parsing folds the 3rd-person
    // imperatives into the λύω and ῥύομαι paradigms (rather than a standalone
    // combined "Third-person imperative" paradigm, which would both hide them
    // from a focused λύω walk and let the form lookup cross between λύω and
    // ῥύομαι). λυθήτω is λύω's aorist passive imperative.
    cards: [
      { g: 'λυέτω', e: 'let him/her/it untie (Present active imperative, 3rd person sg.)', lemma: 'λύω', required: true },
      { g: 'λυέτωσαν', e: 'let them untie (Present active imperative, 3rd person pl.)', lemma: 'λύω', required: true },
      { g: 'λυσάτω', e: 'let him/her/it untie (1st aorist active imperative, 3rd person sg.)', lemma: 'λύω', required: true },
      { g: 'λυσάτωσαν', e: 'let them untie (1st aorist active imperative, 3rd person pl.)', lemma: 'λύω', required: true },
      { g: 'ῥυέσθω', e: 'let him/her/it rescue / be rescued (Present middle/passive imperative, 3rd person sg.)', lemma: 'ῥύομαι', required: true },
      { g: 'ῥυέσθωσαν', e: 'let them rescue / be rescued (Present middle/passive imperative, 3rd person pl.)', lemma: 'ῥύομαι', required: true },
      { g: 'ῥυσάσθω', e: 'let him/her/it rescue (1st aorist middle imperative, 3rd person sg.)', lemma: 'ῥύομαι', required: true },
      { g: 'ῥυσάσθωσαν', e: 'let them rescue (1st aorist middle imperative, 3rd person pl.)', lemma: 'ῥύομαι', required: true },
      { g: 'λυθήτω', e: 'let him/her/it be untied (Aorist passive imperative, 3rd person sg.)', lemma: 'λύω', required: true },
      { g: 'λυθήτωσαν', e: 'let them be untied (Aorist passive imperative, 3rd person pl.)', lemma: 'λύω', required: true }
    ]
  });

  // ── Chapter 18 irregular verbs: δύναμαι and οἶδα ──────────────────────────
  // Duff introduces δύναμαι ("I am able") and οἶδα ("I know") in Ch 18 as
  // irregular/defective verbs. Neither was a parsing paradigm before, so these
  // sets give them full finite paradigms, chapter-gated to 18 (chapter: 18).
  //
  // δύναμαι is a deponent athematic (-μαι) verb — it conjugates like the middle
  // of ἵστημι (stem δυνα-), so every form is middle/passive in shape.
  window.registerSupplementalVocabSet('W7_DUNAMAI_PRESENT_INDICATIVE', {
    label: 'δύναμαι — present middle/passive indicative',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'δύναμαι', e: 'I am able (Present middle/passive indicative, 1st person sg.)', required: true },
      { g: 'δύνασαι', e: 'you are able (Present middle/passive indicative, 2nd person sg.)', required: true },
      { g: 'δύναται', e: 'he/she/it is able (Present middle/passive indicative, 3rd person sg.)', required: true },
      { g: 'δυνάμεθα', e: 'we are able (Present middle/passive indicative, 1st person pl.)', required: true },
      { g: 'δύνασθε', e: 'you are able (Present middle/passive indicative, 2nd person pl.)', required: true },
      { g: 'δύνανται', e: 'they are able (Present middle/passive indicative, 3rd person pl.)', required: true }
    ]
  });

  // Imperfect uses the regular ε-augment (ἐδυνάμην…); the NT also attests an
  // η-augment variant (ἠδυνάμην…). Listing the ε-augment keeps the paradigm
  // systematic for parsing.
  window.registerSupplementalVocabSet('W7_DUNAMAI_IMPERFECT_INDICATIVE', {
    label: 'δύναμαι — imperfect middle/passive indicative',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'ἐδυνάμην', e: 'I was able (Imperfect middle/passive indicative, 1st person sg.)', required: true },
      { g: 'ἐδύνασο', e: 'you were able (Imperfect middle/passive indicative, 2nd person sg.)', required: true },
      { g: 'ἐδύνατο', e: 'he/she/it was able (Imperfect middle/passive indicative, 3rd person sg.)', required: true },
      { g: 'ἐδυνάμεθα', e: 'we were able (Imperfect middle/passive indicative, 1st person pl.)', required: true },
      { g: 'ἐδύνασθε', e: 'you were able (Imperfect middle/passive indicative, 2nd person pl.)', required: true },
      { g: 'ἐδύναντο', e: 'they were able (Imperfect middle/passive indicative, 3rd person pl.)', required: true }
    ]
  });

  // δύναμαι's future is deponent middle (δυνήσομαι series, δυνη- stem + σ).
  window.registerSupplementalVocabSet('W7_DUNAMAI_FUTURE_INDICATIVE', {
    label: 'δύναμαι — future middle indicative',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'δυνήσομαι', e: 'I will be able (Future middle indicative, 1st person sg.)', required: true },
      { g: 'δυνήσῃ', e: 'you will be able (Future middle indicative, 2nd person sg.)', required: true },
      { g: 'δυνήσεται', e: 'he/she/it will be able (Future middle indicative, 3rd person sg.)', required: true },
      { g: 'δυνησόμεθα', e: 'we will be able (Future middle indicative, 1st person pl.)', required: true },
      { g: 'δυνήσεσθε', e: 'you will be able (Future middle indicative, 2nd person pl.)', required: true },
      { g: 'δυνήσονται', e: 'they will be able (Future middle indicative, 3rd person pl.)', required: true }
    ]
  });

  // δύναμαι's aorist is a PASSIVE-deponent: it takes the -θη- (aorist passive)
  // form ἠδυνήθην, parsed as aorist passive (like ἀπεκρίθην), even though the
  // sense is the same active "was able". (The NT also attests a middle-form
  // ἠδυνάσθην; the -θη- form is the more common and the one drilled here.)
  window.registerSupplementalVocabSet('W7_DUNAMAI_AORIST_INDICATIVE', {
    label: 'δύναμαι — aorist passive indicative (deponent)',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'ἠδυνήθην', e: 'I was able (Aorist passive indicative, 1st person sg.)', required: true },
      { g: 'ἠδυνήθης', e: 'you were able (Aorist passive indicative, 2nd person sg.)', required: true },
      { g: 'ἠδυνήθη', e: 'he/she/it was able (Aorist passive indicative, 3rd person sg.)', required: true },
      { g: 'ἠδυνήθημεν', e: 'we were able (Aorist passive indicative, 1st person pl.)', required: true },
      { g: 'ἠδυνήθητε', e: 'you were able (Aorist passive indicative, 2nd person pl.)', required: true },
      { g: 'ἠδυνήθησαν', e: 'they were able (Aorist passive indicative, 3rd person pl.)', required: true }
    ]
  });

  // δύναμαι present infinitive + participle (nom. masc.) — Duff's base
  // non-finite requirement for a verb. Rarer aorist non-finite forms
  // (δυνηθῆναι, δυνηθείς) and the full participle declension are optional —
  // see LEMMA_INVENTORY['δύναμαι'].
  window.registerSupplementalVocabSet('W7_DUNAMAI_PRESENT_INF_PART', {
    label: 'δύναμαι — present infinitive & participle',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'δύνασθαι', e: 'to be able (Present middle/passive infinitive)', required: true },
      { g: 'δυνάμενος', e: '(being) able (Present middle/passive participle, masc. Nom. sg.)', required: true },
      { g: 'δυνάμενοι', e: '(being) able (Present middle/passive participle, masc. Nom. pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_DUNAMAI_PRESENT_SUBJUNCTIVE', {
    label: 'δύναμαι — present middle/passive subjunctive',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'δύνωμαι', e: '(that) I may be able (Present middle/passive subjunctive, 1st person sg.)', required: true },
      { g: 'δύνῃ', e: '(that) you may be able (Present middle/passive subjunctive, 2nd person sg.)', required: true },
      { g: 'δύνηται', e: '(that) he/she/it may be able (Present middle/passive subjunctive, 3rd person sg.)', required: true },
      { g: 'δυνώμεθα', e: '(that) we may be able (Present middle/passive subjunctive, 1st person pl.)', required: true },
      { g: 'δύνησθε', e: '(that) you may be able (Present middle/passive subjunctive, 2nd person pl.)', required: true },
      { g: 'δύνωνται', e: '(that) they may be able (Present middle/passive subjunctive, 3rd person pl.)', required: true }
    ]
  });

  // οἶδα is a second perfect that functions as a PRESENT ("I know"). It is
  // parsed morphologically as perfect active indicative; its pluperfect
  // (ᾔδειν…) functions as a past ("I knew"). Gloss avoids the word "present"
  // so the set-label tense default resolves cleanly to "perfect".
  window.registerSupplementalVocabSet('W7_OIDA_PERFECT_INDICATIVE', {
    label: 'οἶδα — perfect active indicative (I know)',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'οἶδα', e: 'I know (Perfect active indicative, 1st person sg.)', required: true },
      { g: 'οἶδας', e: 'you know (Perfect active indicative, 2nd person sg.)', required: true },
      { g: 'οἶδεν', e: 'he/she/it knows (Perfect active indicative, 3rd person sg.)', required: true },
      { g: 'οἴδαμεν', e: 'we know (Perfect active indicative, 1st person pl.)', required: true },
      { g: 'οἴδατε', e: 'you know (Perfect active indicative, 2nd person pl.)', required: true },
      { g: 'οἴδασιν', e: 'they know (Perfect active indicative, 3rd person pl.)', required: true }
    ]
  });

  window.registerSupplementalVocabSet('W7_OIDA_PLUPERFECT_INDICATIVE', {
    label: 'οἶδα — pluperfect active indicative (I knew)',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'ᾔδειν', e: 'I knew (Pluperfect active indicative, 1st person sg.)', required: true },
      { g: 'ᾔδεις', e: 'you knew (Pluperfect active indicative, 2nd person sg.)', required: true },
      { g: 'ᾔδει', e: 'he/she/it knew (Pluperfect active indicative, 3rd person sg.)', required: true },
      { g: 'ᾔδειμεν', e: 'we knew (Pluperfect active indicative, 1st person pl.)', required: true },
      { g: 'ᾔδειτε', e: 'you knew (Pluperfect active indicative, 2nd person pl.)', required: true },
      { g: 'ᾔδεισαν', e: 'they knew (Pluperfect active indicative, 3rd person pl.)', required: true }
    ]
  });

  // οἶδα's participle εἰδώς ("knowing") — Duff's base nom. masc. participle
  // requirement. Morphologically a perfect active participle (εἰδώς, εἰδυῖα,
  // εἰδός); the rest of its declension and the other moods are optional —
  // see LEMMA_INVENTORY['οἶδα'].
  // οἶδα's infinitive εἰδέναι ("to know") + participle εἰδώς ("knowing") —
  // both morphologically perfect active, Duff's base non-finite requirement.
  // (Kept in one set: the parsing-card auto-generator needs ≥2 forms per set.)
  window.registerSupplementalVocabSet('W7_OIDA_INF_PART', {
    label: 'οἶδα — perfect active infinitive & participle',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'εἰδέναι', e: 'to know (Perfect active infinitive)', required: true },
      { g: 'εἰδώς', e: 'knowing (Perfect active participle, masc. Nom. sg.)', required: true },
      { g: 'εἰδότες', e: 'knowing (Perfect active participle, masc. Nom. pl.)', required: true }
    ]
  });

  // ── Chapter 18 noun: μάρτυς (3rd declension, masculine) ───────────────────
  // Stem μαρτυρ-; the ρ drops before ς in the nom. sg. (μάρτυς) and dat. pl.
  // (μάρτυσι). Modelled on the other 3rd-decl. noun paradigms (σάρξ, ἀστήρ).
  window.registerSupplementalVocabSet('W7_MARTUS', {
    label: 'μάρτυς — 3rd-decl. masculine (witness)',
    week: 7,
    chapter: 18,
    cards: [
      { g: 'μάρτυς', e: 'witness (masc. Nom. sg.)', required: true },
      { g: 'μάρτυρα', e: 'witness (masc. Acc. sg.)', required: true },
      { g: 'μάρτυρος', e: 'of a witness (masc. Gen. sg.)', required: true },
      { g: 'μάρτυρι', e: 'to/for a witness (masc. Dat. sg.)', required: true },
      { g: 'μάρτυρες', e: 'witnesses (masc. Nom. pl.)', required: true },
      { g: 'μάρτυρας', e: 'witnesses (masc. Acc. pl.)', required: true },
      { g: 'μαρτύρων', e: 'of witnesses (masc. Gen. pl.)', required: true },
      { g: 'μάρτυσι(ν)', e: 'to/for witnesses (masc. Dat. pl.)', required: true }
    ]
  });

})();
