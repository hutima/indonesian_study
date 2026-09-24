// μι-verb principal-parts flashcards: present ↔ aorist (or other principal
// part) for the major μι-verbs introduced in Week 8 (Duff chapters 19-20),
// plus the common compounds that share each base verb's stem (ἀποδίδωμι /
// παραδίδωμι, ἐπιτίθημι, ἀνίστημι / παρίστημι, συνίημι). μι-verbs reduplicate
// the initial consonant + ι in the present (δίδωμι, τίθημι, ἵστημι), then drop
// the reduplication and become much shorter in the aorist (ἔδωκα, ἔθηκα,
// ἔστησα/ἔστην) — the stem changes are dramatic and worth dedicated recall
// practice. Compounds carry the augment after the prefix (ἀπέδωκα, ἐπέθηκα).
// Each card prints the verbal stem the principal part is built on after a
// comma, the same anchor the second-aorist set uses.

(function () {
  if (typeof window.registerSupplementalVocabSet !== 'function') return;

  function entry(present, presentGloss, target, targetGloss, label, stem, note) {
    return {
      stemFlip: true,
      stemFlipAorist: label,
      g: present,
      e: presentGloss,
      aorist: target,
      aoristGloss: targetGloss,
      // Verbal stem the target principal part is built on (augment dropped),
      // printed after the form the same way the second-aorist set anchors its
      // pairs (e.g. ἔδωκα, δω-). Flows through to the derived "μι-verbs as
      // cards" headword via card.derivedStem.
      stem: stem || '',
      stemNote: note || '',
      required: true
    };
  }

  window.registerSupplementalVocabSet('W8_MI_VERB_PRINCIPAL_PARTS_FLIP', {
    label: 'μι-verb principal parts — present ↔ aorist / perfect flashcards',
    week: 8,
    chapter: 19,
    cards: [
      // δίδωμι
      entry('δίδωμι', 'I give',                          'ἔδωκα', 'I gave',                       'aorist active (1st sg.)',   'δω-', 'reduplication lost; k-aorist (-κα)'),
      entry('δίδωμι', 'I give',                          'δώσω', 'I will give',                   'future active (1st sg.)',   'δω-', 'reduplication lost; -σω future on δω-stem'),
      entry('δίδωμι', 'I give',                          'δέδωκα', 'I have given',                'perfect active (1st sg.)',  'δω-', 'standard δε- reduplication on δω-stem'),
      entry('δίδωμι', 'I give',                          'ἐδόθην', 'I was given',                 'aorist passive (1st sg.)',  'δο-', 'short stem δο- + θη'),
      // ἀποδίδωμι (compound of δίδωμι)
      entry('ἀποδίδωμι', 'I give back / pay',            'ἀπέδωκα', 'I gave back / paid',          'aorist active (1st sg.)',   'ἀποδω-', 'compound of δίδωμι; augment after ἀπο-'),
      entry('ἀποδίδωμι', 'I give back / pay',            'ἀποδώσω', 'I will give back / pay',      'future active (1st sg.)',   'ἀποδω-', 'compound of δίδωμι'),
      entry('ἀποδίδωμι', 'I give back / pay',            'ἀποδέδωκα', 'I have given back',         'perfect active (1st sg.)',  'ἀποδω-', 'compound of δίδωμι'),
      entry('ἀποδίδωμι', 'I give back / pay',            'ἀπεδόθην', 'I was given back',           'aorist passive (1st sg.)',  'ἀποδο-', 'compound of δίδωμι; augment after ἀπο-'),
      // παραδίδωμι (compound of δίδωμι)
      entry('παραδίδωμι', 'I hand over / betray',        'παρέδωκα', 'I handed over / betrayed',   'aorist active (1st sg.)',   'παραδω-', 'compound of δίδωμι; augment after παρα-'),
      entry('παραδίδωμι', 'I hand over / betray',        'παραδώσω', 'I will hand over',           'future active (1st sg.)',   'παραδω-', 'compound of δίδωμι'),
      entry('παραδίδωμι', 'I hand over / betray',        'παραδέδωκα', 'I have handed over',       'perfect active (1st sg.)',  'παραδω-', 'compound of δίδωμι'),
      entry('παραδίδωμι', 'I hand over / betray',        'παρεδόθην', 'I was handed over',         'aorist passive (1st sg.)',  'παραδο-', 'compound of δίδωμι; augment after παρα-'),
      // τίθημι
      entry('τίθημι', 'I put / place',                   'ἔθηκα', 'I put / placed',               'aorist active (1st sg.)',   'θη-', 'reduplication lost; k-aorist on θη-stem'),
      entry('τίθημι', 'I put / place',                   'θήσω', 'I will put / place',            'future active (1st sg.)',   'θη-', 'reduplication lost; -σω future on θη-stem'),
      entry('τίθημι', 'I put / place',                   'τέθεικα', 'I have put / placed',        'perfect active (1st sg.)',  'θει-', 'τε- reduplication; θει-stem'),
      entry('τίθημι', 'I put / place',                   'ἐτέθην', 'I was put / placed',          'aorist passive (1st sg.)',  'θε-', 'short stem θε- + θη (τε- by dissimilation)'),
      // ἐπιτίθημι (compound of τίθημι)
      entry('ἐπιτίθημι', 'I place upon',                 'ἐπέθηκα', 'I placed upon',               'aorist active (1st sg.)',   'ἐπιθη-', 'compound of τίθημι; augment after ἐπι-'),
      entry('ἐπιτίθημι', 'I place upon',                 'ἐπιθήσω', 'I will place upon',           'future active (1st sg.)',   'ἐπιθη-', 'compound of τίθημι'),
      entry('ἐπιτίθημι', 'I place upon',                 'ἐπιτέθεικα', 'I have placed upon',       'perfect active (1st sg.)',  'ἐπιθει-', 'compound of τίθημι'),
      entry('ἐπιτίθημι', 'I place upon',                 'ἐπετέθην', 'I was placed upon',          'aorist passive (1st sg.)',  'ἐπιθε-', 'compound of τίθημι; augment after ἐπι-'),
      // ἵστημι
      entry('ἵστημι', 'I make stand / stand',            'ἔστησα', 'I made stand (1st aor.)',     'aorist active (1st sg.)',   'στη-', 'transitive 1st aorist on στη-stem'),
      entry('ἵστημι', 'I make stand / stand',            'ἔστην', 'I stood (2nd aor.)',           'aorist active 2nd (1st sg.)', 'στη-', 'intransitive 2nd aorist; athematic -ην ending'),
      entry('ἵστημι', 'I make stand / stand',            'στήσω', 'I will make stand',            'future active (1st sg.)',   'στη-', 'reduplication lost; στη-stem + -σω'),
      entry('ἵστημι', 'I make stand / stand',            'ἕστηκα', 'I stand (perfect-as-present)', 'perfect active (1st sg.)', 'στη-', 'rough-breathing reduplication; perfect carries present sense'),
      entry('ἵστημι', 'I make stand / stand',            'ἐστάθην', 'I was made to stand',        'aorist passive (1st sg.)',  'στα-', 'short stem στα- + θη'),
      // ἀνίστημι (compound of ἵστημι)
      entry('ἀνίστημι', 'I raise / rise',                'ἀνέστησα', 'I raised (1st aor., trans.)', 'aorist active (1st sg.)',   'ἀναστη-', 'compound of ἵστημι; transitive 1st aorist; augment after ἀνα-'),
      entry('ἀνίστημι', 'I raise / rise',                'ἀνέστην', 'I rose (2nd aor., intrans.)',  'aorist active 2nd (1st sg.)', 'ἀναστη-', 'compound of ἵστημι; intransitive 2nd aorist'),
      entry('ἀνίστημι', 'I raise / rise',                'ἀναστήσω', 'I will raise',               'future active (1st sg.)',   'ἀναστη-', 'compound of ἵστημι'),
      entry('ἀνίστημι', 'I raise / rise',                'ἀνέστηκα', 'I have risen / stand',        'perfect active (1st sg.)',  'ἀναστη-', 'compound of ἵστημι'),
      // παρίστημι (compound of ἵστημι)
      entry('παρίστημι', 'I present / stand by',         'παρέστησα', 'I presented (1st aor., trans.)', 'aorist active (1st sg.)', 'παραστη-', 'compound of ἵστημι; transitive 1st aorist; augment after παρα-'),
      entry('παρίστημι', 'I present / stand by',         'παρέστην', 'I stood by (2nd aor., intrans.)', 'aorist active 2nd (1st sg.)', 'παραστη-', 'compound of ἵστημι; intransitive 2nd aorist'),
      entry('παρίστημι', 'I present / stand by',         'παραστήσω', 'I will present',            'future active (1st sg.)',   'παραστη-', 'compound of ἵστημι'),
      entry('παρίστημι', 'I present / stand by',         'παρέστηκα', 'I stand by (perfect-as-present)', 'perfect active (1st sg.)', 'παραστη-', 'compound of ἵστημι'),
      // ἀφίημι (compound of ἵημι)
      entry('ἀφίημι', 'I send away / forgive',           'ἀφῆκα', 'I sent away / forgave',        'aorist active (1st sg.)',   'ἀφη-', 'k-aorist on -η stem; ε-augment after prefix'),
      entry('ἀφίημι', 'I send away / forgive',           'ἀφήσω', 'I will send away / forgive',   'future active (1st sg.)',   'ἀφη-', 'reduplication lost; -η + -σω future'),
      entry('ἀφίημι', 'I send away / forgive',           'ἀφεῖκα', 'I have sent away / forgiven', 'perfect active (1st sg.)',  'ἀφε-', 'irregular ει-reduplication'),
      entry('ἀφίημι', 'I send away / forgive',           'ἀφέθην', 'I was sent away / forgiven',  'aorist passive (1st sg.)',  'ἀφε-', 'short ε-stem + θη'),
      // συνίημι (compound of ἵημι)
      entry('συνίημι', 'I understand',                   'συνῆκα', 'I understood',                'aorist active (1st sg.)',   'συνη-', 'compound of ἵημι; k-aorist on -η stem'),
      entry('συνίημι', 'I understand',                   'συνήσω', 'I will understand',           'future active (1st sg.)',   'συνη-', 'compound of ἵημι'),
      // δείκνυμι
      entry('δείκνυμι', 'I show',                        'ἔδειξα', 'I showed',                    'aorist active (1st sg.)',   'δεικ-', 'loses -νυ- suffix; κ → ξ before σ in 1st aorist'),
      entry('δείκνυμι', 'I show',                        'δείξω', 'I will show',                  'future active (1st sg.)',   'δεικ-', 'loses -νυ- suffix; -ξω future'),
      entry('δείκνυμι', 'I show',                        'δέδειχα', 'I have shown',               'perfect active (1st sg.)',  'δεικ-', 'δε- reduplication; κ → χ before -α'),
      entry('δείκνυμι', 'I show',                        'ἐδείχθην', 'I was shown',               'aorist passive (1st sg.)',  'δεικ-', 'κ → χ before θ'),
      // δύναμαι — deponent athematic (-μαι) verb (Duff ch 18). No active forms;
      // its principal parts build on the δυνη- stem (future middle, deponent
      // aorist in the passive form). Grouped with the μι-verbs since it is
      // athematic and shares their middle endings.
      entry('δύναμαι', 'I am able',                      'δυνήσομαι', 'I will be able',          'future (1st sg., deponent)', 'δυνη-', 'deponent future middle on δυνη- stem'),
      entry('δύναμαι', 'I am able',                      'ἠδυνήθην', 'I was able',               'aorist (1st sg., deponent)', 'δυνη-', 'deponent; aorist passive in form (η-augment + -θη-)')
    ]
  });
})();
