// Per-lemma morphological knowledge for the parse-feedback lookup and the
// optional-forms drill extension.
//
// `impossibleTenses` / `impossibleVoices` / `impossibleMoods` are the
// "negative" inventory: combinations that CAN'T exist in real Greek for
// this lemma. When the student's picked parse violates one of these, the
// summary's YOUR PARSE line says "[no morph exists]" — a confident
// statement that the form doesn't exist in the language, not just that
// we lack data for it. Combinations that ARE possible but aren't in our
// data still render as "—" (data gap), so the negative lists should only
// enumerate genuine morphological gaps, never just-not-covered-yet ones.
//
// `extraForms` is positive form data, read as a last-resort pool by
// resolveFormForPickedDims when no card carries the form the student's
// picks resolve to. Each entry maps a Greek form to a canonical answer
// string (e.g. "future middle participle genitive singular masc./neut.")
// in the same shape `parseAnswerDimensions` consumes. The lookup is
// ALWAYS consulted regardless of any user toggle — wrong picks deserve a
// canonical-form hint even when the form isn't part of the student's
// drill rotation.
//
// `optionalFormGroups` is the drillable counterpart: each group is a
// `{ chapter, family, forms }` bundle that becomes a set of synthetic
// parsing-drill cards when the "Optional paradigm extensions" toggle is
// ON in the settings panel. `chapter` is the gate (only injected when
// the student's max selected effective chapter ≥ this value), `family`
// labels the group in the parsing UI, and `forms` is the same flat
// `{ form: parsedAnswer }` shape as extraForms. The toggle defaults OFF
// so the standard Duff-aligned card set is the baseline; opting in
// expands a paradigm with morphologically real forms the textbook
// skips.
//
// Convention: build a `forms` map once at top of file, then reference it
// from BOTH `extraForms` (so fallback always works) AND
// `optionalFormGroups` (so the drill toggle picks it up too). This
// keeps the two consumers in sync — adding a form means it appears in
// fallback AND becomes drillable on opt-in.
//
// Lemmas not listed default to "all standard combinations possible."
// Add entries here as new defective lemmas show up in the paradigm
// data, and add `optionalFormGroups` entries for any paradigm exemplar
// (λύω, λόγος, ἀγαθός, …) whose paradigm has slots Duff doesn't drill.
// Keep the bar high on `impossible*` lists: only mark something
// impossible when it genuinely doesn't exist in Greek, not when Duff
// hasn't introduced it yet.

(function () {
  // Duff's dedicated participle chapter (Ch 14). Before it the textbook
  // shows participles only at recognition level — bare nominative-
  // singular stem shapes like ὤν or βαλών — so a full case/number
  // declension landing in the optional drill pool any earlier breaks the
  // chapter gate the toggle is supposed to respect.
  const PARTICIPLE_DECLENSION_CHAPTER = 14;

  // Splits a participle declension into chapter-gated groups:
  // the nominative-singular rows (all genders, incl. the syncretic
  // "nominative/accusative singular neuter" slot) stay drillable at the
  // early `introChapter`, while every other case/number form waits for
  // Ch 14 (or `introChapter` itself, whichever is later).
  //
  // By default these groups are tagged `core: true` — the present/aorist
  // active & middle participle declensions are required curriculum (Duff
  // teaches the participle paradigm in Ch 14), so parsing pulls them into
  // the pool regardless of the "Optional paradigm" toggle. Pass
  // `{ core: false }` for genuinely off-textbook participles (e.g. εἰμί's
  // deponent future participle) that should stay behind the toggle.
  function participleOptionalGroups(introChapter, familyBase, forms, opts = {}) {
    const core = opts.core !== false;
    const tag = core ? 'required' : 'optional';
    const nomSg = {};
    const rest = {};
    Object.entries(forms).forEach(([form, parse]) => {
      if (/nominative(?:\/accusative)? singular/.test(parse)) nomSg[form] = parse;
      else rest[form] = parse;
    });
    const groups = [];
    if (Object.keys(nomSg).length) {
      groups.push({
        chapter: introChapter,
        family: `${familyBase} — nominative singular (${tag})`,
        core,
        forms: nomSg
      });
    }
    if (Object.keys(rest).length) {
      groups.push({
        chapter: Math.max(introChapter, PARTICIPLE_DECLENSION_CHAPTER),
        family: `${familyBase} — full declension (${tag})`,
        core,
        forms: rest
      });
    }
    return groups;
  }

  // εἰμί's future middle participle (ἐσόμενος, -ομένη, -όμενον). Declines
  // like λυόμενος. Pedagogically rare — Duff drills only the present
  // participle (ὤν / ὄντες) — but the future participle exists in Koine,
  // so a student picking "future participle ..." on εἰμί should see the
  // canonical form (e.g. ἐσομένου for gen. sg. masc./neut.) instead of
  // either "[no morph exists]" or a wrong-class match like ἔσομαι. Forms
  // syncretic across genders (ἐσόμενον serves masc. acc. sg. + neut. nom./
  // acc. sg.; ἐσόμενα serves neut. nom./acc. pl.) take the parse string
  // that covers the most picks; rarer alternates can be added if a user
  // reports them missing.
  const EIMI_FUTURE_MIDDLE_PARTICIPLE = {
    'ἐσόμενος':  'future middle participle nominative singular masculine',
    'ἐσομένου':  'future middle participle genitive singular masculine/neuter',
    'ἐσομένῳ':   'future middle participle dative singular masculine/neuter',
    'ἐσόμενον':  'future middle participle accusative singular masculine/neuter',
    'ἐσόμενε':   'future middle participle vocative singular masculine',
    'ἐσόμενοι':  'future middle participle nominative plural masculine',
    'ἐσομένους': 'future middle participle accusative plural masculine',
    'ἐσομένων':  'future middle participle genitive plural masculine/feminine/neuter',
    'ἐσομένοις': 'future middle participle dative plural masculine/neuter',
    'ἐσομένη':   'future middle participle nominative singular feminine',
    'ἐσομένης':  'future middle participle genitive singular feminine',
    'ἐσομένῃ':   'future middle participle dative singular feminine',
    'ἐσομένην':  'future middle participle accusative singular feminine',
    'ἐσόμεναι':  'future middle participle nominative plural feminine',
    'ἐσομέναις': 'future middle participle dative plural feminine',
    'ἐσομένας':  'future middle participle accusative plural feminine',
    'ἐσόμενα':   'future middle participle nominative/accusative plural neuter'
  };

  // εἰμί's future middle infinitive. Duff drills only the present
  // infinitive (εἶναι), but ἔσεσθαι is real Koine, so a student picking
  // "future infinitive" on εἰμί should see it instead of falling through
  // to "—". Voice is middle for the same reason as the future participle:
  // εἰμί's future is deponent.
  const EIMI_FUTURE_MIDDLE_INFINITIVE = {
    'ἔσεσθαι': 'future middle infinitive'
  };

  // εἰμί's present active imperative. Duff introduces the imperative mood
  // in Ch 7 but doesn't drill εἰμί's imperative paradigm — students who
  // pick "imperative" for εἰμί otherwise see blank (no form lookup
  // matched). ἔστων is the older classical alternate for 3pl alongside
  // the standard Koine ἔστωσαν; both are real and should resolve cleanly.
  const EIMI_PRESENT_ACTIVE_IMPERATIVE = {
    'ἴσθι':     'present active imperative second person singular',
    'ἔστω':     'present active imperative third person singular',
    'ἔστε':     'present active imperative second person plural',
    'ἔστωσαν':  'present active imperative third person plural',
    'ἔστων':    'present active imperative third person plural'
  };

  // εἰμί's present (active) subjunctive — the reference grammar's Subjunctive
  // column (ὦ, ᾖς, ᾖ, ὦμεν, ἦτε, ὦσι(ν)). Duff introduces the subjunctive in
  // Ch 17 but doesn't drill εἰμί's, so it's optional here.
  const EIMI_PRESENT_ACTIVE_SUBJUNCTIVE = {
    'ὦ':       'present active subjunctive first person singular',
    'ᾖς':      'present active subjunctive second person singular',
    'ᾖ':       'present active subjunctive third person singular',
    'ὦμεν':    'present active subjunctive first person plural',
    'ἦτε':     'present active subjunctive second person plural',
    'ὦσι(ν)':  'present active subjunctive third person plural'
  };

  // εἰμί's present participle, feminine + neuter nominative singular. The
  // masculine ὤν (and ὄντες) is drilled in W3; οὖσα / ὄν complete the
  // reference grammar's ὤν / οὖσα / ὄν row. (Duff gives only the nominative
  // singular + the ὀντ- stem note for εἰμί's participle.)
  const EIMI_PRESENT_PARTICIPLE_NOM = {
    'οὖσα': 'present active participle nominative singular feminine',
    'ὄν':   'present active participle nominative/accusative singular neuter'
  };

  // εἰμί's optional-drill groups. Chapter gates:
  // - Ch 7: present imperative (imperative mood is introduced in Ch 7).
  // - Ch 8: future middle infinitive + the future participle's nominative
  //   singular (W3_EIMI_COMPLETE introduces the future at ch 8 and the
  //   student knows εἰμί's participle via W3_EIMI_INFINITIVE_PARTICIPLE
  //   from the same week — but only as ὤν / ὄντες recognition forms, so
  //   the participle's full declension waits for Ch 14 via
  //   participleOptionalGroups).
  const EIMI_OPTIONAL_GROUPS = [
    { chapter: 7, family: 'εἰμί — present active imperative (optional)',
      forms: EIMI_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 8, family: 'εἰμί — future middle infinitive (optional)',
      forms: EIMI_FUTURE_MIDDLE_INFINITIVE },
    { chapter: 8, family: 'εἰμί — present participle (feminine/neuter nom. sg.) (optional)',
      forms: EIMI_PRESENT_PARTICIPLE_NOM },
    { chapter: 17, family: 'εἰμί — present subjunctive (optional)',
      forms: EIMI_PRESENT_ACTIVE_SUBJUNCTIVE },
    ...participleOptionalGroups(8, 'εἰμί — future middle participle',
      EIMI_FUTURE_MIDDLE_PARTICIPLE, { core: false })
  ];

  // ─── λύω (model regular ω-verb) ────────────────────────────────────
  //
  // Duff drills present/imperfect/future/aorist active indicative (W2),
  // present/imperfect/future/aorist passive indicative + perfect/
  // pluperfect active (W6), present active imperative + infinitive (W2),
  // present/aorist active participles (W5), aorist passive participle
  // (W6 λυθείς), and present passive imperative + infinitive (W6). The
  // subjunctive is touched only with scattered single-person examples
  // in grammar.js ch 17 (λύῃ 3sg, λύσωσιν 3pl); the rest of the
  // subjunctive paradigm — every other person, every voice — is real
  // Koine but undrilled. Same with non-present infinitives (future
  // active/middle/passive, perfect active and middle/passive), the
  // aorist middle imperative paradigm, and the 3rd-person present
  // middle/passive imperative. These fill the gaps.
  //
  // Notes on syncretic forms: λύῃ is morphologically the 3sg present
  // active subjunctive AND the 2sg present middle/passive subjunctive/
  // imperative — extraForms keys are unique by Greek string, so we
  // pick the parse most pedagogically prominent (the active sub-
  // junctive 3sg form a student picking subjunctive will hit first).
  // λύσῃ has similar overload between aorist active subjunctive 3sg
  // and aorist middle subjunctive 2sg + future indicative 2sg/3sg
  // (the future indicative parse stays in the drilled card pool, so
  // the fallback claim here is the subjunctive reading). λῦσαι is
  // both aorist active infinitive (drilled in W2) and aorist middle
  // imperative 2sg — drilled card wins for the infinitive parse, so
  // the middle-imperative line below resolves only when picks land on
  // the imperative reading.

  const LUO_PRESENT_ACTIVE_SUBJUNCTIVE = {
    'λύω':      'present active subjunctive first person singular',
    'λύῃς':     'present active subjunctive second person singular',
    'λύῃ':      'present active subjunctive third person singular',
    'λύωμεν':   'present active subjunctive first person plural',
    'λύητε':    'present active subjunctive second person plural',
    'λύωσι':    'present active subjunctive third person plural',
    'λύωσιν':   'present active subjunctive third person plural'
  };

  const LUO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'λύσω':     'aorist active subjunctive first person singular',
    'λύσῃς':    'aorist active subjunctive second person singular',
    'λύσῃ':     'aorist active subjunctive third person singular',
    'λύσωμεν':  'aorist active subjunctive first person plural',
    'λύσητε':   'aorist active subjunctive second person plural',
    'λύσωσι':   'aorist active subjunctive third person plural',
    'λύσωσιν':  'aorist active subjunctive third person plural'
  };

  const LUO_AORIST_MIDDLE_SUBJUNCTIVE = {
    'λύσωμαι':   'aorist middle subjunctive first person singular',
    // 'λύσῃ' 2sg collides with the aorist active subjunctive 3sg key
    // above; the active reading is more pedagogically prominent, so we
    // don't shadow it here. A student picking "aorist middle subjunctive
    // 2sg" hits the data-gap "—" instead of a wrong-class match.
    'λύσηται':   'aorist middle subjunctive third person singular',
    'λυσώμεθα':  'aorist middle subjunctive first person plural',
    'λύσησθε':   'aorist middle subjunctive second person plural',
    'λύσωνται':  'aorist middle subjunctive third person plural'
  };

  const LUO_AORIST_PASSIVE_SUBJUNCTIVE = {
    'λυθῶ':     'aorist passive subjunctive first person singular',
    'λυθῇς':    'aorist passive subjunctive second person singular',
    'λυθῇ':     'aorist passive subjunctive third person singular',
    'λυθῶμεν':  'aorist passive subjunctive first person plural',
    'λυθῆτε':   'aorist passive subjunctive second person plural',
    'λυθῶσι':   'aorist passive subjunctive third person plural',
    'λυθῶσιν':  'aorist passive subjunctive third person plural'
  };

  const LUO_PRESENT_MIDDLE_PASSIVE_SUBJUNCTIVE = {
    'λύωμαι':   'present middle/passive subjunctive first person singular',
    // 'λύῃ' 2sg again collides with the present active subjunctive 3sg
    // entry; same reasoning — we don't shadow the active reading.
    'λύηται':   'present middle/passive subjunctive third person singular',
    'λυώμεθα':  'present middle/passive subjunctive first person plural',
    'λύησθε':   'present middle/passive subjunctive second person plural',
    'λύωνται':  'present middle/passive subjunctive third person plural'
  };

  // Non-present active/middle/passive infinitives. λύειν (present
  // active) and λύεσθαι (present m/p) and λῦσαι (aorist active) and
  // λυθῆναι (aorist passive) are drilled; future + perfect aren't.
  const LUO_NONPRESENT_INFINITIVES = {
    'λύσειν':       'future active infinitive',
    'λύσεσθαι':     'future middle infinitive',
    'λυθήσεσθαι':   'future passive infinitive',
    'λελυκέναι':    'perfect active infinitive',
    'λελύσθαι':     'perfect middle/passive infinitive',
    'λύσασθαι':     'aorist middle infinitive'
  };

  // Present middle/passive imperative 3rd person (the 2nd-person forms
  // are drilled in W6_LUO_PASSIVE_OTHER_MOODS). Voice tagged as the
  // syncretic m/p composite — Duff's drilled cards may say "passive"
  // only, so adding the composite covers both pickings.
  const LUO_PRESENT_MP_IMPERATIVE_3P = {
    'λυέσθω':     'present middle/passive imperative third person singular',
    'λυέσθωσαν':  'present middle/passive imperative third person plural'
  };

  // Aorist middle imperative — not drilled at all for λύω. 2sg λῦσαι
  // overlaps with the drilled aorist active infinitive; the drilled
  // card wins for the infinitive parse, but a student picking "aorist
  // middle imperative 2sg" lands on this entry via fallback.
  const LUO_AORIST_MIDDLE_IMPERATIVE = {
    'λῦσαι':       'aorist middle imperative second person singular',
    'λυσάσθω':     'aorist middle imperative third person singular',
    'λύσασθε':     'aorist middle imperative second person plural',
    'λυσάσθωσαν':  'aorist middle imperative third person plural'
  };

  // Perfect middle/passive indicative (λέλυμαι series). Duff's W6 set drills
  // only the perfect ACTIVE (λέλυκα); the middle/passive — the reference
  // grammar's Passive "Perfect" column — is real Koine but undrilled, so it
  // fills in here. Voice is the syncretic middle/passive composite (the
  // perfect doesn't spell the two apart), matching how the present/imperfect
  // passive cards read.
  const LUO_PERFECT_MIDDLE_PASSIVE_INDICATIVE = {
    'λέλυμαι':   'perfect middle/passive indicative first person singular',
    'λέλυσαι':   'perfect middle/passive indicative second person singular',
    'λέλυται':   'perfect middle/passive indicative third person singular',
    'λελύμεθα':  'perfect middle/passive indicative first person plural',
    'λέλυσθε':   'perfect middle/passive indicative second person plural',
    'λέλυνται':  'perfect middle/passive indicative third person plural'
  };

  // Aorist passive imperative — 2nd/3rd person all drilled (W6 + W7);
  // nothing to add here. Aorist active imperative similarly complete
  // (W2 + W7).

  // Chapter gates: ω-verb subjunctive is introduced at Ch 17 (W7).
  // Future infinitives are reasonable from Ch 6 (when future indicative
  // is taught); middle/passive future infinitives need Ch 15 (W6
  // introduces the passive system + voice contrasts). Perfect
  // infinitives need Ch 15 (W6 introduces perfect). Middle imperatives
  // are introduced at Ch 7 for the mood + Ch 15 for the voice; gate
  // at max(7,15)=15. 3rd-person m/p imperative gates at Ch 15 (passive
  // intro).
  const LUO_OPTIONAL_GROUPS = [
    { chapter: 6,  family: 'λύω — future active infinitive (optional)',
      forms: { 'λύσειν': 'future active infinitive' } },
    { chapter: 15, family: 'λύω — future middle/passive + perfect infinitives (optional)',
      forms: {
        'λύσεσθαι':    'future middle infinitive',
        'λυθήσεσθαι':  'future passive infinitive',
        'λελυκέναι':   'perfect active infinitive',
        'λελύσθαι':    'perfect middle/passive infinitive',
        'λύσασθαι':    'aorist middle infinitive'
      } },
    { chapter: 15, family: 'λύω — present middle/passive imperative 3rd person (optional)',
      forms: LUO_PRESENT_MP_IMPERATIVE_3P },
    { chapter: 15, family: 'λύω — aorist middle imperative (optional)',
      forms: LUO_AORIST_MIDDLE_IMPERATIVE },
    { chapter: 16, family: 'λύω — perfect middle/passive indicative (optional)',
      forms: LUO_PERFECT_MIDDLE_PASSIVE_INDICATIVE },
    // λύω's subjunctive (all voices) is REQUIRED curriculum from Ch 17 — Duff
    // teaches the subjunctive there and it's a high-frequency NT parse — so
    // these groups are `core: true`: they enter the parsing deck unconditionally
    // (not gated behind the "Optional paradigm" toggle) once Ch 17 is in scope.
    { chapter: 17, core: true, family: 'λύω — present active subjunctive (required)',
      forms: LUO_PRESENT_ACTIVE_SUBJUNCTIVE },
    { chapter: 17, core: true, family: 'λύω — aorist active subjunctive (required)',
      forms: LUO_AORIST_ACTIVE_SUBJUNCTIVE },
    { chapter: 17, core: true, family: 'λύω — aorist middle subjunctive (required)',
      forms: LUO_AORIST_MIDDLE_SUBJUNCTIVE },
    { chapter: 17, core: true, family: 'λύω — aorist passive subjunctive (required)',
      forms: LUO_AORIST_PASSIVE_SUBJUNCTIVE },
    { chapter: 17, core: true, family: 'λύω — present middle/passive subjunctive (required)',
      forms: LUO_PRESENT_MIDDLE_PASSIVE_SUBJUNCTIVE },
    // Required principal part (1sg) + present infinitive. λύω's other five
    // principal parts (λύω, λύσω, ἔλυσα, λέλυκα, ἐλύθην) are already required
    // via its W-drill paradigms; only the perfect m/p was optional-only.
    { chapter: 7,  core: true, family: 'λύω — present infinitive (required)',
      forms: { 'λύειν': 'present active infinitive' } },
    { chapter: 16, core: true, family: 'λύω — perfect middle/passive principal part (required)',
      forms: { 'λέλυμαι': 'perfect middle/passive indicative first person singular' } }
  ];

  // Flat extraForms map for the fallback lookup. Duplicate-key
  // collisions (e.g. λύῃ across active sub + m/p sub) resolve to the
  // last spread wins — order the spreads so the most pedagogically
  // prominent reading sits last for any colliding form.
  const LUO_EXTRA_FORMS = {
    ...LUO_AORIST_MIDDLE_SUBJUNCTIVE,
    ...LUO_PRESENT_MIDDLE_PASSIVE_SUBJUNCTIVE,
    ...LUO_AORIST_PASSIVE_SUBJUNCTIVE,
    ...LUO_NONPRESENT_INFINITIVES,
    ...LUO_PRESENT_MP_IMPERATIVE_3P,
    ...LUO_AORIST_MIDDLE_IMPERATIVE,
    ...LUO_PERFECT_MIDDLE_PASSIVE_INDICATIVE,
    // Active subjunctive last so λύῃ resolves to "present active
    // subjunctive 3sg" (and λύσῃ to "aorist active subjunctive 3sg"),
    // the most common single-form readings for those Greek strings.
    ...LUO_PRESENT_ACTIVE_SUBJUNCTIVE,
    ...LUO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── ῥύομαι (model middle/deponent) ───────────────────────────────
  //
  // Duff drills present/future/imperfect/aorist middle indicative (W3),
  // present + aorist middle subjunctive (W7), present + aorist middle
  // imperative 2nd person + middle infinitives (W3), and the full
  // present + aorist middle participle declensions (W5). Gaps are
  // narrow: 3rd-person imperatives (Duff stops at 2nd person for
  // ῥύομαι) and the future middle infinitive.

  const RHUOMAI_FUTURE_INFINITIVE = {
    'ῥύσεσθαι': 'future middle infinitive'
  };

  const RHUOMAI_IMPERATIVE_3RD = {
    'ῥυέσθω':      'present middle imperative third person singular',
    'ῥυέσθωσαν':   'present middle imperative third person plural',
    'ῥυσάσθω':     'aorist middle imperative third person singular',
    'ῥυσάσθωσαν':  'aorist middle imperative third person plural'
  };

  const RHUOMAI_OPTIONAL_GROUPS = [
    { chapter: 8, family: 'ῥύομαι — future middle infinitive (optional)',
      forms: RHUOMAI_FUTURE_INFINITIVE },
    { chapter: 8, family: 'ῥύομαι — 3rd-person middle imperative (optional)',
      forms: RHUOMAI_IMPERATIVE_3RD }
  ];

  const RHUOMAI_EXTRA_FORMS = {
    ...RHUOMAI_FUTURE_INFINITIVE,
    ...RHUOMAI_IMPERATIVE_3RD
  };

  // ─── βάλλω (second-aorist model) ──────────────────────────────────
  //
  // Duff drills βάλλω only for aorist active (W4: indicative all 6,
  // imperative 2sg/2pl, infinitive βαλεῖν, masc-nom-only participle
  // βαλών/βαλόντες) and uses it as a stem-pair recall verb everywhere
  // else. Real Koine has the full present/imperfect/future/aorist
  // (passive!)/perfect paradigm for βάλλω — it's an extremely common
  // verb in the NT (throw, cast, put). These fill the indicative
  // gaps, the aorist active subjunctive, the aorist passive, and the
  // perfect active. Liquid-stem future (βαλῶ, contracted) and
  // 2nd-aorist passive (ἐβλήθην with stem shift β/λ) are the
  // pedagogically tricky bits to flag.

  const BALLO_PRESENT_ACTIVE_INDICATIVE = {
    'βάλλω':     'present active indicative first person singular',
    'βάλλεις':   'present active indicative second person singular',
    'βάλλει':    'present active indicative third person singular',
    'βάλλομεν':  'present active indicative first person plural',
    'βάλλετε':   'present active indicative second person plural',
    'βάλλουσι':  'present active indicative third person plural',
    'βάλλουσιν': 'present active indicative third person plural'
  };

  const BALLO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἔβαλλον':    'imperfect active indicative first person singular',
    // ἔβαλλον is also 3rd person plural (1sg/3pl syncretism in ω-verb
    // imperfect). The 1sg reading takes the unique key; 3pl picks
    // resolve via the drilled-card / fallback walk against any other
    // available pool. Documented to avoid silent overwrite confusion.
    'ἔβαλλες':    'imperfect active indicative second person singular',
    'ἔβαλλε':     'imperfect active indicative third person singular',
    'ἔβαλλεν':    'imperfect active indicative third person singular',
    'ἐβάλλομεν':  'imperfect active indicative first person plural',
    'ἐβάλλετε':   'imperfect active indicative second person plural'
  };

  const BALLO_FUTURE_ACTIVE_INDICATIVE = {
    'βαλῶ':     'future active indicative first person singular',
    'βαλεῖς':   'future active indicative second person singular',
    'βαλεῖ':    'future active indicative third person singular',
    'βαλοῦμεν': 'future active indicative first person plural',
    'βαλεῖτε':  'future active indicative second person plural',
    'βαλοῦσι':  'future active indicative third person plural',
    'βαλοῦσιν': 'future active indicative third person plural'
  };

  const BALLO_AORIST_PASSIVE_INDICATIVE = {
    'ἐβλήθην':   'aorist passive indicative first person singular',
    'ἐβλήθης':   'aorist passive indicative second person singular',
    'ἐβλήθη':    'aorist passive indicative third person singular',
    'ἐβλήθημεν': 'aorist passive indicative first person plural',
    'ἐβλήθητε':  'aorist passive indicative second person plural',
    'ἐβλήθησαν': 'aorist passive indicative third person plural'
  };

  const BALLO_PERFECT_ACTIVE_INDICATIVE = {
    'βέβληκα':    'perfect active indicative first person singular',
    'βέβληκας':   'perfect active indicative second person singular',
    'βέβληκε':    'perfect active indicative third person singular',
    'βέβληκεν':   'perfect active indicative third person singular',
    'βεβλήκαμεν': 'perfect active indicative first person plural',
    'βεβλήκατε':  'perfect active indicative second person plural',
    'βεβλήκασι':  'perfect active indicative third person plural',
    'βεβλήκασιν': 'perfect active indicative third person plural'
  };

  const BALLO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'βάλω':    'aorist active subjunctive first person singular',
    'βάλῃς':   'aorist active subjunctive second person singular',
    'βάλῃ':    'aorist active subjunctive third person singular',
    'βάλωμεν': 'aorist active subjunctive first person plural',
    'βάλητε':  'aorist active subjunctive second person plural',
    'βάλωσι':  'aorist active subjunctive third person plural',
    'βάλωσιν': 'aorist active subjunctive third person plural'
  };

  const BALLO_PRESENT_INFINITIVE = {
    'βάλλειν': 'present active infinitive'
  };

  // 3rd-person aorist active imperative for βάλλω. The 2sg βάλε / 2pl
  // βάλετε are drilled (W4_BALLO_SECOND_AORIST); 3rd person is not.
  const BALLO_AORIST_IMPERATIVE_3RD = {
    'βαλέτω':     'aorist active imperative third person singular',
    'βαλέτωσαν':  'aorist active imperative third person plural'
  };

  // Present active imperative — the present-system imperative keeps the
  // doubled λλ (stem βαλλ-), distinct from the drilled 2nd-aorist βάλε /
  // βάλετε (single λ, stem βαλ-). That λλ/λ contrast is the whole point of
  // the verb, so parsing the aorist βάλε as a present now reconstructs to
  // βάλλε instead of a blank "—". (2pl βάλλετε is syncretic with the
  // present indicative; the indicative keeps the shared lookup key.)
  const BALLO_PRESENT_ACTIVE_IMPERATIVE = {
    'βάλλε':       'present active imperative second person singular',
    'βαλλέτω':     'present active imperative third person singular',
    'βάλλετε':     'present active imperative second person plural',
    'βαλλέτωσαν':  'present active imperative third person plural'
  };

  // Chapter gates: βάλλω is introduced as a vocab word early but its
  // full paradigm depends on the broader tense/voice system. Gate
  // present/imperfect at ch 10 (W4 — when βάλλω itself becomes a focus
  // via second-aorist); future at ch 10; aorist subjunctive at ch 17;
  // aorist passive + perfect at ch 15 (W6 — passive + perfect intro);
  // 3rd-person aorist imperative at ch 10 (the 2sg/2pl are drilled
  // there, so the 3rd person rounds out the paradigm at the same
  // time).
  const BALLO_OPTIONAL_GROUPS = [
    { chapter: 10, family: 'βάλλω — present active indicative (optional)',
      forms: BALLO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'βάλλω — imperfect active indicative (optional)',
      forms: BALLO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'βάλλω — future active indicative (liquid stem, optional)',
      forms: BALLO_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'βάλλω — present active infinitive (optional)',
      forms: BALLO_PRESENT_INFINITIVE },
    { chapter: 10, family: 'βάλλω — 3rd-person aorist active imperative (optional)',
      forms: BALLO_AORIST_IMPERATIVE_3RD },
    { chapter: 10, family: 'βάλλω — present active imperative (optional)',
      forms: BALLO_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 15, family: 'βάλλω — aorist passive indicative (optional)',
      forms: BALLO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'βάλλω — perfect active indicative (optional)',
      forms: BALLO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'βάλλω — aorist active subjunctive (optional)',
      forms: BALLO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const BALLO_EXTRA_FORMS = {
    ...BALLO_PRESENT_ACTIVE_IMPERATIVE,
    ...BALLO_PRESENT_ACTIVE_INDICATIVE,
    ...BALLO_IMPERFECT_ACTIVE_INDICATIVE,
    ...BALLO_FUTURE_ACTIVE_INDICATIVE,
    ...BALLO_PRESENT_INFINITIVE,
    ...BALLO_AORIST_IMPERATIVE_3RD,
    ...BALLO_AORIST_PASSIVE_INDICATIVE,
    ...BALLO_PERFECT_ACTIVE_INDICATIVE,
    ...BALLO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── γίνομαι (second-aorist deponent — ubiquitous in NT) ──────────
  //
  // Per the audit γίνομαι is drilled only for the aorist middle
  // subjunctive (W7) and as a stem-pair recall entry ("γίνομαι →
  // ἐγενόμην"). The actual indicative paradigm — including the
  // famous aorist middle ἐγένετο, perfect active γέγονα, and aorist
  // middle infinitive γενέσθαι, all extremely common in the Greek
  // NT — has no drill cards. Filling these gaps is the highest-
  // pedagogical-value addition in this batch.
  //
  // Note on voice: γίνομαι is deponent middle in the present, future,
  // imperfect, and aorist; the perfect (γέγονα) is morphologically
  // active and meaning-active. The aorist passive (ἐγενήθην) is
  // genuinely passive in form, sometimes used with active meaning in
  // Koine. We tag voices per Greek-grammar convention.

  const GINOMAI_PRESENT_MIDDLE_INDICATIVE = {
    'γίνομαι':   'present middle indicative first person singular',
    'γίνῃ':      'present middle indicative second person singular',
    'γίνεται':   'present middle indicative third person singular',
    'γινόμεθα':  'present middle indicative first person plural',
    'γίνεσθε':   'present middle indicative second person plural',
    'γίνονται':  'present middle indicative third person plural'
  };

  const GINOMAI_IMPERFECT_MIDDLE_INDICATIVE = {
    'ἐγινόμην':  'imperfect middle indicative first person singular',
    'ἐγίνου':    'imperfect middle indicative second person singular',
    'ἐγίνετο':   'imperfect middle indicative third person singular',
    'ἐγινόμεθα': 'imperfect middle indicative first person plural',
    'ἐγίνεσθε':  'imperfect middle indicative second person plural',
    'ἐγίνοντο':  'imperfect middle indicative third person plural'
  };

  const GINOMAI_FUTURE_MIDDLE_INDICATIVE = {
    'γενήσομαι':  'future middle indicative first person singular',
    'γενήσῃ':     'future middle indicative second person singular',
    'γενήσεται':  'future middle indicative third person singular',
    'γενησόμεθα': 'future middle indicative first person plural',
    'γενήσεσθε':  'future middle indicative second person plural',
    'γενήσονται': 'future middle indicative third person plural'
  };

  const GINOMAI_AORIST_MIDDLE_INDICATIVE = {
    'ἐγενόμην':   'aorist middle indicative first person singular',
    'ἐγένου':     'aorist middle indicative second person singular',
    'ἐγένετο':    'aorist middle indicative third person singular',
    'ἐγενόμεθα':  'aorist middle indicative first person plural',
    'ἐγένεσθε':   'aorist middle indicative second person plural',
    'ἐγένοντο':   'aorist middle indicative third person plural'
  };

  const GINOMAI_AORIST_PASSIVE_INDICATIVE = {
    'ἐγενήθην':   'aorist passive indicative first person singular',
    'ἐγενήθης':   'aorist passive indicative second person singular',
    'ἐγενήθη':    'aorist passive indicative third person singular',
    'ἐγενήθημεν': 'aorist passive indicative first person plural',
    'ἐγενήθητε':  'aorist passive indicative second person plural',
    'ἐγενήθησαν': 'aorist passive indicative third person plural'
  };

  const GINOMAI_PERFECT_ACTIVE_INDICATIVE = {
    'γέγονα':    'perfect active indicative first person singular',
    'γέγονας':   'perfect active indicative second person singular',
    'γέγονε':    'perfect active indicative third person singular',
    'γέγονεν':   'perfect active indicative third person singular',
    'γεγόναμεν': 'perfect active indicative first person plural',
    'γεγόνατε':  'perfect active indicative second person plural',
    'γεγόνασι':  'perfect active indicative third person plural',
    'γεγόνασιν': 'perfect active indicative third person plural'
  };

  const GINOMAI_AORIST_MIDDLE_INFINITIVE = {
    'γενέσθαι': 'aorist middle infinitive'
  };

  const GINOMAI_PRESENT_MIDDLE_INFINITIVE = {
    'γίνεσθαι': 'present middle infinitive'
  };

  const GINOMAI_AORIST_MIDDLE_IMPERATIVE = {
    'γενοῦ':       'aorist middle imperative second person singular',
    'γενέσθω':     'aorist middle imperative third person singular',
    'γένεσθε':     'aorist middle imperative second person plural',
    'γενέσθωσαν':  'aorist middle imperative third person plural'
  };

  // Present middle imperative (γίνομαι is deponent middle in the present).
  // The aorist middle imperative above shifts to the 2nd-aorist stem γεν-;
  // the present keeps γιν-, so a "present imperative" parse of an aorist
  // form reconstructs to γίνου rather than a blank "—". (2pl γίνεσθε is
  // syncretic with the present indicative; the indicative keeps the key.)
  const GINOMAI_PRESENT_MIDDLE_IMPERATIVE = {
    'γίνου':       'present middle imperative second person singular',
    'γινέσθω':     'present middle imperative third person singular',
    'γίνεσθε':     'present middle imperative second person plural',
    'γινέσθωσαν':  'present middle imperative third person plural'
  };

  // Chapter gates: γίνομαι is a vocab introduction-era word (it appears
  // in early chapters as a deponent verb). The present/imperfect/
  // future middle indicatives gate at ch 8 (the chapter Duff
  // introduces middle/deponent verbs alongside the W3 ῥύομαι treatment).
  // 2nd-aorist forms (ἐγενόμην series, infinitive γενέσθαι, imperative
  // γενοῦ) gate at ch 10 (W4 — second aorist intro). Perfect active
  // and aorist passive gate at ch 15 (W6 — passive + perfect intro).
  const GINOMAI_OPTIONAL_GROUPS = [
    { chapter: 8,  family: 'γίνομαι — present middle indicative (optional)',
      forms: GINOMAI_PRESENT_MIDDLE_INDICATIVE },
    { chapter: 8,  family: 'γίνομαι — imperfect middle indicative (optional)',
      forms: GINOMAI_IMPERFECT_MIDDLE_INDICATIVE },
    { chapter: 8,  family: 'γίνομαι — future middle indicative (optional)',
      forms: GINOMAI_FUTURE_MIDDLE_INDICATIVE },
    { chapter: 8,  family: 'γίνομαι — present middle infinitive (optional)',
      forms: GINOMAI_PRESENT_MIDDLE_INFINITIVE },
    { chapter: 8,  family: 'γίνομαι — present middle imperative (optional)',
      forms: GINOMAI_PRESENT_MIDDLE_IMPERATIVE },
    { chapter: 10, family: 'γίνομαι — aorist middle indicative (2nd aorist, optional)',
      forms: GINOMAI_AORIST_MIDDLE_INDICATIVE },
    { chapter: 10, family: 'γίνομαι — aorist middle infinitive γενέσθαι (optional)',
      forms: GINOMAI_AORIST_MIDDLE_INFINITIVE },
    { chapter: 10, family: 'γίνομαι — aorist middle imperative (optional)',
      forms: GINOMAI_AORIST_MIDDLE_IMPERATIVE },
    { chapter: 15, family: 'γίνομαι — aorist passive indicative (optional)',
      forms: GINOMAI_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'γίνομαι — perfect active indicative γέγονα (optional)',
      forms: GINOMAI_PERFECT_ACTIVE_INDICATIVE }
  ];

  const GINOMAI_EXTRA_FORMS = {
    ...GINOMAI_PRESENT_MIDDLE_IMPERATIVE,
    ...GINOMAI_PRESENT_MIDDLE_INDICATIVE,
    ...GINOMAI_IMPERFECT_MIDDLE_INDICATIVE,
    ...GINOMAI_FUTURE_MIDDLE_INDICATIVE,
    ...GINOMAI_AORIST_MIDDLE_INDICATIVE,
    ...GINOMAI_AORIST_PASSIVE_INDICATIVE,
    ...GINOMAI_PERFECT_ACTIVE_INDICATIVE,
    ...GINOMAI_AORIST_MIDDLE_INFINITIVE,
    ...GINOMAI_PRESENT_MIDDLE_INFINITIVE,
    ...GINOMAI_AORIST_MIDDLE_IMPERATIVE
  };

  // ─── λαμβάνω (second-aorist active, future deponent middle) ───────
  //
  // λαμβάνω is the textbook 2nd-aorist example alongside βάλλω
  // (Mounce-style triad: γίνομαι, λαμβάνω, λείπω). Duff drills only
  // the stem-pair recall (W4_SECOND_AORIST_STEMS: λαμβάνω → ἔλαβον)
  // and uses the lemma as a stand-alone vocab word from ch 2 onward;
  // the full paradigm — present/imperfect, the middle future
  // λήμψομαι (Koine spelling with inserted μ; classical λήψομαι), the
  // 2nd-aorist indicative ἔλαβον, aorist passive ἐλήμφθην, perfect
  // active εἴληφα — is undrilled. These fill the gap and give the
  // student a full conjugation paired with the W4_LAMBANO_SECOND_AORIST
  // drill below.
  //
  // Voice note: future is middle/deponent (λήμψομαι series) but active
  // in meaning. Aorist active 2nd-aorist endings (ἔλαβον, ἔλαβες, …)
  // are syncretic between 1sg and 3pl — the 1sg reading takes the
  // unique map key, with 3pl resolving via the parsing walk against
  // the other available pool (same convention as βάλλω's imperfect).

  const LAMBANO_PRESENT_ACTIVE_INDICATIVE = {
    'λαμβάνω':     'present active indicative first person singular',
    'λαμβάνεις':   'present active indicative second person singular',
    'λαμβάνει':    'present active indicative third person singular',
    'λαμβάνομεν':  'present active indicative first person plural',
    'λαμβάνετε':   'present active indicative second person plural',
    'λαμβάνουσι':  'present active indicative third person plural',
    'λαμβάνουσιν': 'present active indicative third person plural'
  };

  const LAMBANO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἐλάμβανον':   'imperfect active indicative first person singular',
    // ἐλάμβανον is also 3pl (1sg/3pl syncretism); 1sg takes the unique key.
    'ἐλάμβανες':   'imperfect active indicative second person singular',
    'ἐλάμβανε':    'imperfect active indicative third person singular',
    'ἐλάμβανεν':   'imperfect active indicative third person singular',
    'ἐλαμβάνομεν': 'imperfect active indicative first person plural',
    'ἐλαμβάνετε':  'imperfect active indicative second person plural'
  };

  const LAMBANO_FUTURE_MIDDLE_INDICATIVE = {
    'λήμψομαι':   'future middle indicative first person singular',
    'λήμψῃ':      'future middle indicative second person singular',
    'λήμψεται':   'future middle indicative third person singular',
    'λημψόμεθα':  'future middle indicative first person plural',
    'λήμψεσθε':   'future middle indicative second person plural',
    'λήμψονται':  'future middle indicative third person plural'
  };

  const LAMBANO_AORIST_ACTIVE_INDICATIVE = {
    'ἔλαβον':    'aorist active indicative first person singular',
    // ἔλαβον = 3pl too — 1sg keeps the unique map key.
    'ἔλαβες':    'aorist active indicative second person singular',
    'ἔλαβε':     'aorist active indicative third person singular',
    'ἔλαβεν':    'aorist active indicative third person singular',
    'ἐλάβομεν':  'aorist active indicative first person plural',
    'ἐλάβετε':   'aorist active indicative second person plural'
  };

  const LAMBANO_AORIST_ACTIVE_IMPERATIVE = {
    'λάβε':       'aorist active imperative second person singular',
    'λάβετε':     'aorist active imperative second person plural',
    'λαβέτω':     'aorist active imperative third person singular',
    'λαβέτωσαν':  'aorist active imperative third person plural'
  };

  const LAMBANO_AORIST_ACTIVE_INFINITIVE = {
    'λαβεῖν': 'aorist active infinitive'
  };

  // Present active imperative + infinitive. The drilled cards and the
  // aorist forms above cover the βαλ-style 2nd-aorist stem (λαβ-); the
  // present keeps the full λαμβαν- stem, so a "present imperative" /
  // "present infinitive" parse reconstructs (λάμβανε / λαμβάνειν) rather
  // than a blank "—". (2pl λαμβάνετε is syncretic with the present
  // indicative; the indicative keeps the shared lookup key.)
  const LAMBANO_PRESENT_ACTIVE_IMPERATIVE = {
    'λάμβανε':       'present active imperative second person singular',
    'λαμβανέτω':     'present active imperative third person singular',
    'λαμβάνετε':     'present active imperative second person plural',
    'λαμβανέτωσαν':  'present active imperative third person plural'
  };

  const LAMBANO_PRESENT_ACTIVE_INFINITIVE = {
    'λαμβάνειν': 'present active infinitive'
  };

  const LAMBANO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'λάβω':    'aorist active subjunctive first person singular',
    'λάβῃς':   'aorist active subjunctive second person singular',
    'λάβῃ':    'aorist active subjunctive third person singular',
    'λάβωμεν': 'aorist active subjunctive first person plural',
    'λάβητε':  'aorist active subjunctive second person plural',
    'λάβωσι':  'aorist active subjunctive third person plural',
    'λάβωσιν': 'aorist active subjunctive third person plural'
  };

  const LAMBANO_AORIST_PASSIVE_INDICATIVE = {
    'ἐλήμφθην':   'aorist passive indicative first person singular',
    'ἐλήμφθης':   'aorist passive indicative second person singular',
    'ἐλήμφθη':    'aorist passive indicative third person singular',
    'ἐλήμφθημεν': 'aorist passive indicative first person plural',
    'ἐλήμφθητε':  'aorist passive indicative second person plural',
    'ἐλήμφθησαν': 'aorist passive indicative third person plural'
  };

  const LAMBANO_PERFECT_ACTIVE_INDICATIVE = {
    'εἴληφα':    'perfect active indicative first person singular',
    'εἴληφας':   'perfect active indicative second person singular',
    'εἴληφε':    'perfect active indicative third person singular',
    'εἴληφεν':   'perfect active indicative third person singular',
    'εἰλήφαμεν': 'perfect active indicative first person plural',
    'εἰλήφατε':  'perfect active indicative second person plural',
    'εἰλήφασι':  'perfect active indicative third person plural',
    'εἰλήφασιν': 'perfect active indicative third person plural'
  };

  // Chapter gates mirror βάλλω: present/imperfect/future at ch 10
  // (W4 — second-aorist intro and the lemma takes its place as a
  // paradigm verb), aorist active indicative + imperative + infinitive
  // at ch 10, aorist passive + perfect at ch 15 (W6), aorist
  // subjunctive at ch 17 (W7).
  const LAMBANO_OPTIONAL_GROUPS = [
    { chapter: 10, family: 'λαμβάνω — present active indicative (optional)',
      forms: LAMBANO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — imperfect active indicative (optional)',
      forms: LAMBANO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — future middle indicative λήμψομαι (optional, deponent)',
      forms: LAMBANO_FUTURE_MIDDLE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — aorist active indicative ἔλαβον (2nd aorist, optional)',
      forms: LAMBANO_AORIST_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λαμβάνω — aorist active imperative (optional)',
      forms: LAMBANO_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 10, family: 'λαμβάνω — aorist active infinitive λαβεῖν (optional)',
      forms: LAMBANO_AORIST_ACTIVE_INFINITIVE },
    { chapter: 10, family: 'λαμβάνω — present active imperative (optional)',
      forms: LAMBANO_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 10, family: 'λαμβάνω — present active infinitive λαμβάνειν (optional)',
      forms: LAMBANO_PRESENT_ACTIVE_INFINITIVE },
    { chapter: 15, family: 'λαμβάνω — aorist passive indicative ἐλήμφθην (optional)',
      forms: LAMBANO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'λαμβάνω — perfect active indicative εἴληφα (optional)',
      forms: LAMBANO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'λαμβάνω — aorist active subjunctive λάβω (optional)',
      forms: LAMBANO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const LAMBANO_EXTRA_FORMS = {
    ...LAMBANO_PRESENT_ACTIVE_IMPERATIVE,
    ...LAMBANO_PRESENT_ACTIVE_INFINITIVE,
    ...LAMBANO_PRESENT_ACTIVE_INDICATIVE,
    ...LAMBANO_IMPERFECT_ACTIVE_INDICATIVE,
    ...LAMBANO_FUTURE_MIDDLE_INDICATIVE,
    ...LAMBANO_AORIST_ACTIVE_INDICATIVE,
    ...LAMBANO_AORIST_ACTIVE_IMPERATIVE,
    ...LAMBANO_AORIST_ACTIVE_INFINITIVE,
    ...LAMBANO_AORIST_PASSIVE_INDICATIVE,
    ...LAMBANO_PERFECT_ACTIVE_INDICATIVE,
    ...LAMBANO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── λείπω (second-aorist active) ─────────────────────────────────
  //
  // Mounce's third 2nd-aorist paradigm verb (alongside γίνομαι and
  // λαμβάνω). In the NT the simple λείπω is rare — καταλείπω /
  // ὑπολείπω are more common — but Mounce uses the unprefixed root
  // because its stem-shift pattern (ει → ι in the aorist: λείπω →
  // ἔλιπον) is the cleanest example of "different stem" 2nd-aorist
  // formation. Curriculum drill currently lists only the stem pair
  // "καταλείπω → κατέλιπον" in W4_SECOND_AORIST_STEMS; the full
  // paradigm and chapter-gated drill set below give a parallel to
  // the λαμβάνω treatment above.
  //
  // The aorist passive is ἐλείφθην and the perfect active is λέλοιπα
  // (with ε → ει → οι stem grade alternation, classic for liquid +
  // labial stems).

  const LEIPO_PRESENT_ACTIVE_INDICATIVE = {
    'λείπω':     'present active indicative first person singular',
    'λείπεις':   'present active indicative second person singular',
    'λείπει':    'present active indicative third person singular',
    'λείπομεν':  'present active indicative first person plural',
    'λείπετε':   'present active indicative second person plural',
    'λείπουσι':  'present active indicative third person plural',
    'λείπουσιν': 'present active indicative third person plural'
  };

  const LEIPO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἔλειπον':   'imperfect active indicative first person singular',
    // ἔλειπον is also 3pl (1sg/3pl syncretism).
    'ἔλειπες':   'imperfect active indicative second person singular',
    'ἔλειπε':    'imperfect active indicative third person singular',
    'ἔλειπεν':   'imperfect active indicative third person singular',
    'ἐλείπομεν': 'imperfect active indicative first person plural',
    'ἐλείπετε':  'imperfect active indicative second person plural'
  };

  const LEIPO_FUTURE_ACTIVE_INDICATIVE = {
    'λείψω':     'future active indicative first person singular',
    'λείψεις':   'future active indicative second person singular',
    'λείψει':    'future active indicative third person singular',
    'λείψομεν':  'future active indicative first person plural',
    'λείψετε':   'future active indicative second person plural',
    'λείψουσι':  'future active indicative third person plural',
    'λείψουσιν': 'future active indicative third person plural'
  };

  const LEIPO_AORIST_ACTIVE_INDICATIVE = {
    'ἔλιπον':    'aorist active indicative first person singular',
    // ἔλιπον = 3pl too — 1sg keeps the unique map key.
    'ἔλιπες':    'aorist active indicative second person singular',
    'ἔλιπε':     'aorist active indicative third person singular',
    'ἔλιπεν':    'aorist active indicative third person singular',
    'ἐλίπομεν':  'aorist active indicative first person plural',
    'ἐλίπετε':   'aorist active indicative second person plural'
  };

  const LEIPO_AORIST_ACTIVE_IMPERATIVE = {
    'λίπε':       'aorist active imperative second person singular',
    'λίπετε':     'aorist active imperative second person plural',
    'λιπέτω':     'aorist active imperative third person singular',
    'λιπέτωσαν':  'aorist active imperative third person plural'
  };

  const LEIPO_AORIST_ACTIVE_INFINITIVE = {
    'λιπεῖν': 'aorist active infinitive'
  };

  // Present active imperative + infinitive. The aorist forms above use the
  // shifted 2nd-aorist stem λιπ- (ει → ι); the present keeps λειπ-, so a
  // "present imperative" / "present infinitive" parse reconstructs to
  // λεῖπε / λείπειν rather than a blank "—". (2pl λείπετε is syncretic with
  // the present indicative; the indicative keeps the shared lookup key.)
  const LEIPO_PRESENT_ACTIVE_IMPERATIVE = {
    'λεῖπε':       'present active imperative second person singular',
    'λειπέτω':     'present active imperative third person singular',
    'λείπετε':     'present active imperative second person plural',
    'λειπέτωσαν':  'present active imperative third person plural'
  };

  const LEIPO_PRESENT_ACTIVE_INFINITIVE = {
    'λείπειν': 'present active infinitive'
  };

  const LEIPO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'λίπω':    'aorist active subjunctive first person singular',
    'λίπῃς':   'aorist active subjunctive second person singular',
    'λίπῃ':    'aorist active subjunctive third person singular',
    'λίπωμεν': 'aorist active subjunctive first person plural',
    'λίπητε':  'aorist active subjunctive second person plural',
    'λίπωσι':  'aorist active subjunctive third person plural',
    'λίπωσιν': 'aorist active subjunctive third person plural'
  };

  const LEIPO_AORIST_PASSIVE_INDICATIVE = {
    'ἐλείφθην':   'aorist passive indicative first person singular',
    'ἐλείφθης':   'aorist passive indicative second person singular',
    'ἐλείφθη':    'aorist passive indicative third person singular',
    'ἐλείφθημεν': 'aorist passive indicative first person plural',
    'ἐλείφθητε':  'aorist passive indicative second person plural',
    'ἐλείφθησαν': 'aorist passive indicative third person plural'
  };

  const LEIPO_PERFECT_ACTIVE_INDICATIVE = {
    'λέλοιπα':    'perfect active indicative first person singular',
    'λέλοιπας':   'perfect active indicative second person singular',
    'λέλοιπε':    'perfect active indicative third person singular',
    'λέλοιπεν':   'perfect active indicative third person singular',
    'λελοίπαμεν': 'perfect active indicative first person plural',
    'λελοίπατε':  'perfect active indicative second person plural',
    'λελοίπασι':  'perfect active indicative third person plural',
    'λελοίπασιν': 'perfect active indicative third person plural'
  };

  const LEIPO_OPTIONAL_GROUPS = [
    { chapter: 10, family: 'λείπω — present active indicative (optional)',
      forms: LEIPO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — imperfect active indicative (optional)',
      forms: LEIPO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — future active indicative λείψω (optional)',
      forms: LEIPO_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — aorist active indicative ἔλιπον (2nd aorist, optional)',
      forms: LEIPO_AORIST_ACTIVE_INDICATIVE },
    { chapter: 10, family: 'λείπω — aorist active imperative (optional)',
      forms: LEIPO_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 10, family: 'λείπω — aorist active infinitive λιπεῖν (optional)',
      forms: LEIPO_AORIST_ACTIVE_INFINITIVE },
    { chapter: 10, family: 'λείπω — present active imperative (optional)',
      forms: LEIPO_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 10, family: 'λείπω — present active infinitive λείπειν (optional)',
      forms: LEIPO_PRESENT_ACTIVE_INFINITIVE },
    { chapter: 15, family: 'λείπω — aorist passive indicative ἐλείφθην (optional)',
      forms: LEIPO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'λείπω — perfect active indicative λέλοιπα (optional)',
      forms: LEIPO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'λείπω — aorist active subjunctive λίπω (optional)',
      forms: LEIPO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const LEIPO_EXTRA_FORMS = {
    ...LEIPO_PRESENT_ACTIVE_IMPERATIVE,
    ...LEIPO_PRESENT_ACTIVE_INFINITIVE,
    ...LEIPO_PRESENT_ACTIVE_INDICATIVE,
    ...LEIPO_IMPERFECT_ACTIVE_INDICATIVE,
    ...LEIPO_FUTURE_ACTIVE_INDICATIVE,
    ...LEIPO_AORIST_ACTIVE_INDICATIVE,
    ...LEIPO_AORIST_ACTIVE_IMPERATIVE,
    ...LEIPO_AORIST_ACTIVE_INFINITIVE,
    ...LEIPO_AORIST_PASSIVE_INDICATIVE,
    ...LEIPO_PERFECT_ACTIVE_INDICATIVE,
    ...LEIPO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── φιλέω (contract -έω verb) ────────────────────────────────────
  //
  // Duff drills present/imperfect/future/aorist active indicative (W2)
  // and the masculine-nominative present + aorist active participles
  // (W2). Everything else — passive system, subjunctive, imperative,
  // infinitives, full participle declensions — is undrilled. These
  // additions cover the most pedagogically critical contract-verb
  // forms (passive indicative for showing the -ε contraction across
  // voices, the active subjunctive/imperative for mood-vs-tense
  // contrast).

  const PHILEO_PRESENT_PASSIVE_INDICATIVE = {
    'φιλοῦμαι':   'present middle/passive indicative first person singular',
    'φιλῇ':       'present middle/passive indicative second person singular',
    'φιλεῖται':   'present middle/passive indicative third person singular',
    'φιλούμεθα':  'present middle/passive indicative first person plural',
    'φιλεῖσθε':   'present middle/passive indicative second person plural',
    'φιλοῦνται':  'present middle/passive indicative third person plural'
  };

  const PHILEO_IMPERFECT_PASSIVE_INDICATIVE = {
    'ἐφιλούμην':  'imperfect middle/passive indicative first person singular',
    'ἐφιλοῦ':     'imperfect middle/passive indicative second person singular',
    'ἐφιλεῖτο':   'imperfect middle/passive indicative third person singular',
    'ἐφιλούμεθα': 'imperfect middle/passive indicative first person plural',
    'ἐφιλεῖσθε':  'imperfect middle/passive indicative second person plural',
    'ἐφιλοῦντο':  'imperfect middle/passive indicative third person plural'
  };

  const PHILEO_AORIST_PASSIVE_INDICATIVE = {
    'ἐφιλήθην':   'aorist passive indicative first person singular',
    'ἐφιλήθης':   'aorist passive indicative second person singular',
    'ἐφιλήθη':    'aorist passive indicative third person singular',
    'ἐφιλήθημεν': 'aorist passive indicative first person plural',
    'ἐφιλήθητε':  'aorist passive indicative second person plural',
    'ἐφιλήθησαν': 'aorist passive indicative third person plural'
  };

  const PHILEO_PRESENT_ACTIVE_SUBJUNCTIVE = {
    'φιλῶ':      'present active subjunctive first person singular',
    'φιλῇς':     'present active subjunctive second person singular',
    'φιλῇ':      'present active subjunctive third person singular',
    'φιλῶμεν':   'present active subjunctive first person plural',
    'φιλῆτε':    'present active subjunctive second person plural',
    'φιλῶσι':    'present active subjunctive third person plural',
    'φιλῶσιν':   'present active subjunctive third person plural'
  };

  const PHILEO_AORIST_ACTIVE_SUBJUNCTIVE = {
    'φιλήσω':    'aorist active subjunctive first person singular',
    'φιλήσῃς':   'aorist active subjunctive second person singular',
    'φιλήσῃ':    'aorist active subjunctive third person singular',
    'φιλήσωμεν': 'aorist active subjunctive first person plural',
    'φιλήσητε':  'aorist active subjunctive second person plural',
    'φιλήσωσι':  'aorist active subjunctive third person plural',
    'φιλήσωσιν': 'aorist active subjunctive third person plural'
  };

  const PHILEO_PRESENT_ACTIVE_IMPERATIVE = {
    'φίλει':       'present active imperative second person singular',
    'φιλείτω':     'present active imperative third person singular',
    'φιλεῖτε':     'present active imperative second person plural',
    'φιλείτωσαν':  'present active imperative third person plural'
  };

  const PHILEO_AORIST_ACTIVE_IMPERATIVE = {
    'φίλησον':     'aorist active imperative second person singular',
    'φιλησάτω':    'aorist active imperative third person singular',
    'φιλήσατε':    'aorist active imperative second person plural',
    'φιλησάτωσαν': 'aorist active imperative third person plural'
  };

  const PHILEO_INFINITIVES = {
    'φιλεῖν':     'present active infinitive',
    'φιλῆσαι':    'aorist active infinitive',
    'φιλεῖσθαι':  'present middle/passive infinitive',
    'φιληθῆναι':  'aorist passive infinitive'
  };

  // φιλέω's present middle/passive participle (the reference grammar's
  // "Present Middle/Passive ... φιλούμενος"). Declines like ἀγαθός; Duff
  // gives only the masculine nominative singular, so that's what's added.
  const PHILEO_PRESENT_MP_PARTICIPLE = {
    'φιλούμενος': 'present middle/passive participle nominative singular masculine'
  };

  // Perfect active + perfect middle/passive indicative (reduplication πε- on the
  // long-vowel φιλη- stem). Full paradigms for the optional drill / wrong-pick
  // lookup; the 1sg principal parts (πεφίληκα, πεφίλημαι) are pulled in as
  // required via the core groups below.
  const PHILEO_PERFECT_ACTIVE_INDICATIVE = {
    'πεφίληκα':      'perfect active indicative first person singular',
    'πεφίληκας':     'perfect active indicative second person singular',
    'πεφίληκε(ν)':   'perfect active indicative third person singular',
    'πεφιλήκαμεν':   'perfect active indicative first person plural',
    'πεφιλήκατε':    'perfect active indicative second person plural',
    'πεφιλήκασι(ν)': 'perfect active indicative third person plural'
  };
  const PHILEO_PERFECT_MP_INDICATIVE = {
    'πεφίλημαι':   'perfect middle/passive indicative first person singular',
    'πεφίλησαι':   'perfect middle/passive indicative second person singular',
    'πεφίληται':   'perfect middle/passive indicative third person singular',
    'πεφιλήμεθα':  'perfect middle/passive indicative first person plural',
    'πεφίλησθε':   'perfect middle/passive indicative second person plural',
    'πεφίληνται':  'perfect middle/passive indicative third person plural'
  };

  const PHILEO_OPTIONAL_GROUPS = [
    // Required principal parts (1sg) + present infinitive — core groups enter
    // the deck unconditionally, each gated to where Duff teaches that part.
    { chapter: 7,  core: true, family: 'φιλέω — present infinitive (required)',
      forms: { 'φιλεῖν': 'present active infinitive' } },
    { chapter: 15, core: true, family: 'φιλέω — aorist passive principal part (required)',
      forms: { 'ἐφιλήθην': 'aorist passive indicative first person singular' } },
    { chapter: 16, core: true, family: 'φιλέω — perfect active principal part (required)',
      forms: { 'πεφίληκα': 'perfect active indicative first person singular' } },
    { chapter: 16, core: true, family: 'φιλέω — perfect middle/passive principal part (required)',
      forms: { 'πεφίλημαι': 'perfect middle/passive indicative first person singular' } },
    // Full perfect paradigms — optional (wrong-pick / lookup).
    { chapter: 16, family: 'φιλέω — perfect active indicative (optional)',
      forms: PHILEO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 16, family: 'φιλέω — perfect middle/passive indicative (optional)',
      forms: PHILEO_PERFECT_MP_INDICATIVE },
    { chapter: 7,  family: 'φιλέω — present active imperative (optional)',
      forms: PHILEO_PRESENT_ACTIVE_IMPERATIVE },
    { chapter: 7,  family: 'φιλέω — aorist active imperative (optional)',
      forms: PHILEO_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 7,  family: 'φιλέω — infinitives (optional)',
      forms: PHILEO_INFINITIVES },
    { chapter: 15, family: 'φιλέω — present middle/passive indicative (optional)',
      forms: PHILEO_PRESENT_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'φιλέω — imperfect middle/passive indicative (optional)',
      forms: PHILEO_IMPERFECT_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'φιλέω — aorist passive indicative (optional)',
      forms: PHILEO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 15, family: 'φιλέω — present middle/passive participle (optional)',
      forms: PHILEO_PRESENT_MP_PARTICIPLE },
    { chapter: 17, family: 'φιλέω — present active subjunctive (optional)',
      forms: PHILEO_PRESENT_ACTIVE_SUBJUNCTIVE },
    { chapter: 17, family: 'φιλέω — aorist active subjunctive (optional)',
      forms: PHILEO_AORIST_ACTIVE_SUBJUNCTIVE }
  ];

  const PHILEO_EXTRA_FORMS = {
    ...PHILEO_PRESENT_PASSIVE_INDICATIVE,
    ...PHILEO_IMPERFECT_PASSIVE_INDICATIVE,
    ...PHILEO_AORIST_PASSIVE_INDICATIVE,
    ...PHILEO_PRESENT_ACTIVE_IMPERATIVE,
    ...PHILEO_AORIST_ACTIVE_IMPERATIVE,
    ...PHILEO_INFINITIVES,
    ...PHILEO_PRESENT_MP_PARTICIPLE,
    ...PHILEO_PERFECT_ACTIVE_INDICATIVE,
    ...PHILEO_PERFECT_MP_INDICATIVE,
    // Subjunctive last so φιλῇ resolves to "present active subjunctive
    // 3sg" (the most common single-form reading) rather than the m/p
    // 2sg from the present passive indicative spread above.
    ...PHILEO_PRESENT_ACTIVE_SUBJUNCTIVE,
    ...PHILEO_AORIST_ACTIVE_SUBJUNCTIVE
  };

  // ─── δίδωμι (μι-verb, "to give") ──────────────────────────────────
  //
  // Per the audit Duff drills present/imperfect/future/aorist/perfect
  // active indicative (W8), present active subj/imperative/infinitive,
  // and a nominative-only present active participle stem. Aorist
  // active subj/imperative/infinitive — the slots a Greek student
  // hits constantly via ἔδωκα/δοῦναι/δός in the NT — aren't drilled.
  // Present m/p indicative is covered by δίδομαι below (a separate
  // lemma in the inventory); aorist passive (ἐδόθην) is genuinely
  // useful.
  //
  // δίδωμι's aorist is the κ-aorist ἔδωκα (athematic), distinct from
  // ω-verb σα-aorists.

  const DIDOMI_AORIST_ACTIVE_INDICATIVE = {
    'ἔδωκα':    'aorist active indicative first person singular',
    'ἔδωκας':   'aorist active indicative second person singular',
    'ἔδωκε':    'aorist active indicative third person singular',
    'ἔδωκεν':   'aorist active indicative third person singular',
    'ἐδώκαμεν': 'aorist active indicative first person plural',
    'ἐδώκατε':  'aorist active indicative second person plural',
    'ἔδωκαν':   'aorist active indicative third person plural'
  };

  const DIDOMI_AORIST_ACTIVE_SUBJUNCTIVE = {
    'δῶ':      'aorist active subjunctive first person singular',
    'δῷς':     'aorist active subjunctive second person singular',
    'δῷ':      'aorist active subjunctive third person singular',
    'δῶμεν':   'aorist active subjunctive first person plural',
    'δῶτε':    'aorist active subjunctive second person plural',
    'δῶσι':    'aorist active subjunctive third person plural',
    'δῶσιν':   'aorist active subjunctive third person plural'
  };

  const DIDOMI_AORIST_ACTIVE_IMPERATIVE = {
    'δός':       'aorist active imperative second person singular',
    'δότω':      'aorist active imperative third person singular',
    'δότε':      'aorist active imperative second person plural',
    'δότωσαν':   'aorist active imperative third person plural'
  };

  const DIDOMI_AORIST_ACTIVE_INFINITIVE = {
    'δοῦναι': 'aorist active infinitive'
  };

  const DIDOMI_AORIST_PASSIVE_INDICATIVE = {
    'ἐδόθην':    'aorist passive indicative first person singular',
    'ἐδόθης':    'aorist passive indicative second person singular',
    'ἐδόθη':     'aorist passive indicative third person singular',
    'ἐδόθημεν':  'aorist passive indicative first person plural',
    'ἐδόθητε':   'aorist passive indicative second person plural',
    'ἐδόθησαν':  'aorist passive indicative third person plural'
  };

  const DIDOMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'δίδωμι — aorist active indicative ἔδωκα (optional)',
      forms: DIDOMI_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'δίδωμι — aorist active infinitive δοῦναι (optional)',
      forms: DIDOMI_AORIST_ACTIVE_INFINITIVE },
    { chapter: 19, family: 'δίδωμι — aorist active imperative δός (optional)',
      forms: DIDOMI_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 19, family: 'δίδωμι — aorist active subjunctive δῶ (optional)',
      forms: DIDOMI_AORIST_ACTIVE_SUBJUNCTIVE },
    { chapter: 19, family: 'δίδωμι — aorist passive indicative ἐδόθην (optional)',
      forms: DIDOMI_AORIST_PASSIVE_INDICATIVE }
  ];

  const DIDOMI_EXTRA_FORMS = {
    ...DIDOMI_AORIST_ACTIVE_INDICATIVE,
    ...DIDOMI_AORIST_ACTIVE_INFINITIVE,
    ...DIDOMI_AORIST_ACTIVE_IMPERATIVE,
    ...DIDOMI_AORIST_ACTIVE_SUBJUNCTIVE,
    ...DIDOMI_AORIST_PASSIVE_INDICATIVE
  };

  // ─── τίθημι (μι-verb, "to put/place") ─────────────────────────────
  //
  // Duff drills only the present active system (W8). Adds imperfect/
  // future/aorist active indicative, the aorist active subjunctive/
  // imperative/infinitive (θεῖναι, θές, θῶ), and the aorist passive.
  // τίθημι's aorist is ἔθηκα (κ-aorist) but the non-indicative forms
  // use the bare θε- stem (θῶ, θές, θεῖναι). Aorist passive ἐτέθην
  // uses θε- + the standard passive marker -θη-.

  const TITHEMI_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἐτίθην':   'imperfect active indicative first person singular',
    'ἐτίθεις':  'imperfect active indicative second person singular',
    'ἐτίθει':   'imperfect active indicative third person singular',
    'ἐτίθεμεν': 'imperfect active indicative first person plural',
    'ἐτίθετε':  'imperfect active indicative second person plural',
    'ἐτίθεσαν': 'imperfect active indicative third person plural'
  };

  const TITHEMI_FUTURE_ACTIVE_INDICATIVE = {
    'θήσω':     'future active indicative first person singular',
    'θήσεις':   'future active indicative second person singular',
    'θήσει':    'future active indicative third person singular',
    'θήσομεν':  'future active indicative first person plural',
    'θήσετε':   'future active indicative second person plural',
    'θήσουσι':  'future active indicative third person plural',
    'θήσουσιν': 'future active indicative third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_INDICATIVE = {
    'ἔθηκα':    'aorist active indicative first person singular',
    'ἔθηκας':   'aorist active indicative second person singular',
    'ἔθηκε':    'aorist active indicative third person singular',
    'ἔθηκεν':   'aorist active indicative third person singular',
    'ἐθήκαμεν': 'aorist active indicative first person plural',
    'ἐθήκατε':  'aorist active indicative second person plural',
    'ἔθηκαν':   'aorist active indicative third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_SUBJUNCTIVE = {
    'θῶ':     'aorist active subjunctive first person singular',
    'θῇς':    'aorist active subjunctive second person singular',
    'θῇ':     'aorist active subjunctive third person singular',
    'θῶμεν':  'aorist active subjunctive first person plural',
    'θῆτε':   'aorist active subjunctive second person plural',
    'θῶσι':   'aorist active subjunctive third person plural',
    'θῶσιν':  'aorist active subjunctive third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_IMPERATIVE = {
    'θές':       'aorist active imperative second person singular',
    'θέτω':      'aorist active imperative third person singular',
    'θέτε':      'aorist active imperative second person plural',
    'θέτωσαν':   'aorist active imperative third person plural'
  };

  const TITHEMI_AORIST_ACTIVE_INFINITIVE = {
    'θεῖναι': 'aorist active infinitive'
  };

  const TITHEMI_AORIST_PASSIVE_INDICATIVE = {
    'ἐτέθην':    'aorist passive indicative first person singular',
    'ἐτέθης':    'aorist passive indicative second person singular',
    'ἐτέθη':     'aorist passive indicative third person singular',
    'ἐτέθημεν':  'aorist passive indicative first person plural',
    'ἐτέθητε':   'aorist passive indicative second person plural',
    'ἐτέθησαν':  'aorist passive indicative third person plural'
  };

  const TITHEMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'τίθημι — imperfect active indicative (optional)',
      forms: TITHEMI_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — future active indicative (optional)',
      forms: TITHEMI_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — aorist active indicative ἔθηκα (optional)',
      forms: TITHEMI_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — aorist active infinitive θεῖναι (optional)',
      forms: TITHEMI_AORIST_ACTIVE_INFINITIVE },
    { chapter: 19, family: 'τίθημι — aorist active imperative θές (optional)',
      forms: TITHEMI_AORIST_ACTIVE_IMPERATIVE },
    { chapter: 19, family: 'τίθημι — aorist active subjunctive θῶ (optional)',
      forms: TITHEMI_AORIST_ACTIVE_SUBJUNCTIVE },
    { chapter: 19, family: 'τίθημι — aorist passive indicative ἐτέθην (optional)',
      forms: TITHEMI_AORIST_PASSIVE_INDICATIVE }
  ];

  const TITHEMI_EXTRA_FORMS = {
    ...TITHEMI_IMPERFECT_ACTIVE_INDICATIVE,
    ...TITHEMI_FUTURE_ACTIVE_INDICATIVE,
    ...TITHEMI_AORIST_ACTIVE_INDICATIVE,
    ...TITHEMI_AORIST_ACTIVE_INFINITIVE,
    ...TITHEMI_AORIST_ACTIVE_IMPERATIVE,
    ...TITHEMI_AORIST_ACTIVE_SUBJUNCTIVE,
    ...TITHEMI_AORIST_PASSIVE_INDICATIVE
  };

  // ─── ἵστημι (μι-verb, "to stand/cause to stand") ──────────────────
  //
  // ἵστημι is the trickiest μι-verb because it has two distinct aorist
  // formations with different meanings:
  //   - 1st aorist ἔστησα (transitive: "I caused to stand / I set up")
  //   - 2nd aorist ἔστην (intransitive: "I stood")
  // Both are real Koine. Duff drills only the present active system
  // (W8); both aorist paradigms are absent. The intransitive 2nd
  // aorist is statistically more common in the NT.

  const HISTEMI_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἵστην':   'imperfect active indicative first person singular',
    'ἵστης':   'imperfect active indicative second person singular',
    'ἵστη':    'imperfect active indicative third person singular',
    'ἵσταμεν': 'imperfect active indicative first person plural',
    'ἵστατε':  'imperfect active indicative second person plural',
    'ἵστασαν': 'imperfect active indicative third person plural'
  };

  const HISTEMI_FUTURE_ACTIVE_INDICATIVE = {
    'στήσω':     'future active indicative first person singular',
    'στήσεις':   'future active indicative second person singular',
    'στήσει':    'future active indicative third person singular',
    'στήσομεν':  'future active indicative first person plural',
    'στήσετε':   'future active indicative second person plural',
    'στήσουσι':  'future active indicative third person plural',
    'στήσουσιν': 'future active indicative third person plural'
  };

  const HISTEMI_FIRST_AORIST_ACTIVE_INDICATIVE = {
    'ἔστησα':    'aorist active indicative first person singular',
    'ἔστησας':   'aorist active indicative second person singular',
    'ἔστησε':    'aorist active indicative third person singular',
    'ἔστησεν':   'aorist active indicative third person singular',
    'ἐστήσαμεν': 'aorist active indicative first person plural',
    'ἐστήσατε':  'aorist active indicative second person plural',
    'ἔστησαν':   'aorist active indicative third person plural'
  };

  const HISTEMI_SECOND_AORIST_ACTIVE_INDICATIVE = {
    'ἔστην':    'aorist active indicative first person singular',
    'ἔστης':    'aorist active indicative second person singular',
    'ἔστη':     'aorist active indicative third person singular',
    'ἔστημεν':  'aorist active indicative first person plural',
    'ἔστητε':   'aorist active indicative second person plural'
    // 'ἔστησαν' 3pl collides verbatim with the 1st aorist 3pl above;
    // since both 1st and 2nd aorist syncretize at 3pl, the 1st aorist
    // reading takes the key. Documented to avoid silent overwrite.
  };

  const HISTEMI_AORIST_INFINITIVES = {
    'στῆσαι': 'aorist active infinitive',  // 1st aorist (transitive)
    'στῆναι': 'aorist active infinitive'   // 2nd aorist (intransitive)
  };

  // 2nd aorist subjunctive (intransitive) — common in the NT.
  const HISTEMI_SECOND_AORIST_SUBJUNCTIVE = {
    'στῶ':    'aorist active subjunctive first person singular',
    'στῇς':   'aorist active subjunctive second person singular',
    'στῇ':    'aorist active subjunctive third person singular',
    'στῶμεν': 'aorist active subjunctive first person plural',
    'στῆτε':  'aorist active subjunctive second person plural',
    'στῶσι':  'aorist active subjunctive third person plural',
    'στῶσιν': 'aorist active subjunctive third person plural'
  };

  // 2nd aorist active imperative (intransitive).
  const HISTEMI_SECOND_AORIST_IMPERATIVE = {
    'στῆθι':     'aorist active imperative second person singular',
    'στήτω':     'aorist active imperative third person singular',
    'στῆτε':     'aorist active imperative second person plural',
    'στήτωσαν':  'aorist active imperative third person plural'
  };

  // Aorist passive (ἐστάθην, used for "I stood / was placed") is the
  // standard passive paradigm.
  const HISTEMI_AORIST_PASSIVE_INDICATIVE = {
    'ἐστάθην':   'aorist passive indicative first person singular',
    'ἐστάθης':   'aorist passive indicative second person singular',
    'ἐστάθη':    'aorist passive indicative third person singular',
    'ἐστάθημεν': 'aorist passive indicative first person plural',
    'ἐστάθητε':  'aorist passive indicative second person plural',
    'ἐστάθησαν': 'aorist passive indicative third person plural'
  };

  // Perfect active (ἕστηκα, with present meaning "I am standing" — a
  // distinctive ἵστημι quirk).
  const HISTEMI_PERFECT_ACTIVE_INDICATIVE = {
    'ἕστηκα':    'perfect active indicative first person singular',
    'ἕστηκας':   'perfect active indicative second person singular',
    'ἕστηκε':    'perfect active indicative third person singular',
    'ἕστηκεν':   'perfect active indicative third person singular',
    'ἑστήκαμεν': 'perfect active indicative first person plural',
    'ἑστήκατε':  'perfect active indicative second person plural',
    'ἑστήκασι':  'perfect active indicative third person plural',
    'ἑστήκασιν': 'perfect active indicative third person plural'
  };

  const HISTEMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'ἵστημι — imperfect active indicative (optional)',
      forms: HISTEMI_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — future active indicative στήσω (optional)',
      forms: HISTEMI_FUTURE_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — 1st aorist active ἔστησα (transitive, optional)',
      forms: HISTEMI_FIRST_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — 2nd aorist active ἔστην (intransitive, optional)',
      forms: HISTEMI_SECOND_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — aorist active infinitives στῆσαι / στῆναι (optional)',
      forms: HISTEMI_AORIST_INFINITIVES },
    { chapter: 19, family: 'ἵστημι — 2nd aorist active subjunctive στῶ (optional)',
      forms: HISTEMI_SECOND_AORIST_SUBJUNCTIVE },
    { chapter: 19, family: 'ἵστημι — 2nd aorist active imperative στῆθι (optional)',
      forms: HISTEMI_SECOND_AORIST_IMPERATIVE },
    { chapter: 19, family: 'ἵστημι — aorist passive indicative ἐστάθην (optional)',
      forms: HISTEMI_AORIST_PASSIVE_INDICATIVE },
    { chapter: 19, family: 'ἵστημι — perfect active indicative ἕστηκα (optional)',
      forms: HISTEMI_PERFECT_ACTIVE_INDICATIVE }
  ];

  const HISTEMI_EXTRA_FORMS = {
    ...HISTEMI_IMPERFECT_ACTIVE_INDICATIVE,
    ...HISTEMI_FUTURE_ACTIVE_INDICATIVE,
    ...HISTEMI_FIRST_AORIST_ACTIVE_INDICATIVE,
    ...HISTEMI_SECOND_AORIST_ACTIVE_INDICATIVE,
    ...HISTEMI_AORIST_INFINITIVES,
    ...HISTEMI_SECOND_AORIST_SUBJUNCTIVE,
    ...HISTEMI_SECOND_AORIST_IMPERATIVE,
    ...HISTEMI_AORIST_PASSIVE_INDICATIVE,
    ...HISTEMI_PERFECT_ACTIVE_INDICATIVE
  };

  // ─── δίδομαι (μι-verb middle/passive of δίδωμι) ───────────────────
  //
  // δίδομαι is the middle/passive complement of δίδωμι. Duff drills
  // only the present m/p indicative; everything else uses the δίδωμι
  // stem (the m/p paradigm is essentially "δίδωμι forms with passive
  // endings"). Common gaps: imperfect m/p, aorist passive (already
  // in δίδωμι's extras as ἐδόθην — duplicating here would create
  // confusion; we cross-reference instead), present m/p infinitive
  // (δίδοσθαι), present m/p imperative (δίδοσο), perfect m/p (δέδομαι).

  const DIDOMAI_IMPERFECT_INDICATIVE = {
    'ἐδιδόμην':   'imperfect middle/passive indicative first person singular',
    'ἐδίδοσο':    'imperfect middle/passive indicative second person singular',
    'ἐδίδοτο':    'imperfect middle/passive indicative third person singular',
    'ἐδιδόμεθα':  'imperfect middle/passive indicative first person plural',
    'ἐδίδοσθε':   'imperfect middle/passive indicative second person plural',
    'ἐδίδοντο':   'imperfect middle/passive indicative third person plural'
  };

  const DIDOMAI_PRESENT_INFINITIVE = {
    'δίδοσθαι': 'present middle/passive infinitive'
  };

  const DIDOMAI_PRESENT_IMPERATIVE = {
    'δίδοσο':      'present middle/passive imperative second person singular',
    'διδόσθω':     'present middle/passive imperative third person singular',
    'δίδοσθε':     'present middle/passive imperative second person plural',
    'διδόσθωσαν':  'present middle/passive imperative third person plural'
  };

  const DIDOMAI_PERFECT_INDICATIVE = {
    'δέδομαι':   'perfect middle/passive indicative first person singular',
    'δέδοσαι':   'perfect middle/passive indicative second person singular',
    'δέδοται':   'perfect middle/passive indicative third person singular',
    'δεδόμεθα':  'perfect middle/passive indicative first person plural',
    'δέδοσθε':   'perfect middle/passive indicative second person plural',
    'δέδονται':  'perfect middle/passive indicative third person plural'
  };

  const DIDOMAI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'δίδομαι — imperfect middle/passive indicative (optional)',
      forms: DIDOMAI_IMPERFECT_INDICATIVE },
    { chapter: 19, family: 'δίδομαι — present middle/passive infinitive δίδοσθαι (optional)',
      forms: DIDOMAI_PRESENT_INFINITIVE },
    { chapter: 19, family: 'δίδομαι — present middle/passive imperative (optional)',
      forms: DIDOMAI_PRESENT_IMPERATIVE },
    { chapter: 19, family: 'δίδομαι — perfect middle/passive indicative δέδομαι (optional)',
      forms: DIDOMAI_PERFECT_INDICATIVE }
  ];

  const DIDOMAI_EXTRA_FORMS = {
    ...DIDOMAI_IMPERFECT_INDICATIVE,
    ...DIDOMAI_PRESENT_INFINITIVE,
    ...DIDOMAI_PRESENT_IMPERATIVE,
    ...DIDOMAI_PERFECT_INDICATIVE
  };

  // ─── Distinct vocative singulars for noun paradigm exemplars ──────
  //
  // Audit finding: Duff intentionally skips vocatives across the noun
  // paradigms (only προφήτης gets its προφῆτα drilled explicitly).
  // For most nouns the vocative singular is syncretic with the
  // nominative singular (1st-decl fem, 2nd-decl neut, most 3rd-decl
  // stems), so a "vocative singular" pick on the drilled paradigm
  // resolves via the same Greek string under a different label —
  // worth adding to extraForms only where the syncretism would
  // confuse a student looking for explicit confirmation.
  //
  // The three lemmas below have DISTINCT vocative singular forms that
  // appear in the NT as direct addresses (κύριε is similar but its
  // lemma isn't in our paradigm list yet). Each entry is added to
  // extraForms only — no optionalFormGroups — because synthesizing a
  // single-form drill card for a vocative would clutter the deck.
  // Picks of "vocative singular" hit the fallback and resolve cleanly.

  const LOGOS_VOCATIVE = {
    'λόγε': 'vocative singular masculine'
  };
  // πόλις and βασιλεύς each carry one distinct vocative singular form
  // in the NT — kept separate now that the two lemmas are split into
  // their own paradigm entries (W5_POLIS / W5_BASILEUS).
  const POLIS_VOCATIVE = {
    'πόλι': 'vocative singular feminine'
  };
  const BASILEUS_VOCATIVE = {
    'βασιλεῦ': 'vocative singular masculine'
  };
  // 1st-decl masc. -ης nouns: vocative singular shortens to bare -α
  // (Mt 8:8 κύριε, ἐγὼ μαθητά … attested in NT). προφῆτα is drilled
  // in W1_PROPHETES_DECLENSION; μαθητά is the parallel form for
  // μαθητής and isn't drilled in the curriculum but appears in NT
  // direct address — surface it as an extra form so a "vocative
  // singular" pick resolves cleanly.
  const MATHETES_VOCATIVE = {
    'μαθητά': 'vocative singular masculine'
  };
  // Optional full-paradigm completions for the mixed-form / 3rd-decl.
  // ι-/ευ-stem nouns. Each group lists ONLY the forms the curriculum
  // doesn't already drill in its W*_*_DECLENSION set: the distinct
  // vocative singular for all four, plus the ν-less dative-plural
  // variant for the ι-/ευ-stems (πόλεσι alongside πόλεσι(ν);
  // βασιλεῦσι alongside βασιλεῦσι(ν)). The vocative PLURAL is omitted
  // intentionally — it's syncretic with the nominative plural already
  // drilled in the W set, so a "voc. pl." pick on προφῆται / μαθηταί
  // / πόλεις / βασιλεῖς resolves via the extraForms fallback below
  // without an extra drill card colliding with the existing nom-pl
  // one. The per-form dedup in getCardsForFocusedParadigm collapses
  // any other overlap with the curriculum cards.
  const PROPHETES_OPTIONAL_FORMS = {};
  const MATHETES_OPTIONAL_FORMS = {
    'μαθητά': 'vocative singular masculine'
  };
  const POLIS_OPTIONAL_FORMS = {
    'πόλι':   'vocative singular feminine',
    'πόλεσι': 'dative plural feminine'
  };
  const BASILEUS_OPTIONAL_FORMS = {
    'βασιλεῦ':   'vocative singular masculine',
    'βασιλεῦσι': 'dative plural masculine'
  };
  // Extra-forms-only entries (syncretic voc pl: same Greek string as
  // nom pl, so just an alternative reading of the same form — no need
  // to drill it as a separate card, but the fallback lookup should
  // resolve a "voc. pl." pick).
  const PROPHETES_VOC_PL_EXTRAS = {
    'προφῆται': 'vocative plural masculine'
  };
  const MATHETES_VOC_PL_EXTRAS = {
    'μαθηταί': 'vocative plural masculine'
  };
  const POLIS_VOC_PL_EXTRAS = {
    'πόλεις': 'vocative plural feminine'
  };
  const BASILEUS_VOC_PL_EXTRAS = {
    'βασιλεῖς': 'vocative plural masculine'
  };

  // ─── Participle full declensions ──────────────────────────────────
  //
  // Per the audit, Duff drills full declensions for λύω's present +
  // aorist active participles and ῥύομαι's present + aorist middle
  // participles, plus the aorist passive participle λυθείς. Several
  // other major participles get only their masculine nominative
  // singular as a stem-recall form (μι-verb participles, βαλών), or
  // aren't drilled at all (perfect active/middle-passive participles,
  // γίνομαι's aorist middle γενόμενος). These are all real Koine
  // forms commonly seen in the NT — γενόμενος especially is one of
  // the most frequent participles in the corpus.
  //
  // Form helpers: every participle paradigm declines on one of three
  // patterns:
  //   - Regular -ος/-η/-ον (m/p participles, future middle): like
  //     λυόμενος — 2nd-decl masc/neut, 1st-decl fem.
  //   - 3rd-decl ντ-stem masc/neut + 1st-decl fem in -ουσα/-ασα/
  //     -εῖσα/-υῖα: active participles. Masc gen sg in -οντος, dat
  //     pl in -ουσι(ν) etc. (with stem-specific vowel).
  //   - 3rd-decl κ-stem masc/neut + 1st-decl fem in -υῖα: perfect
  //     active participles (λελυκώς-type).
  //
  // Each declension below names every unique form once; truly
  // syncretic slots (masc acc sg = neut nom/acc sg for ντ-stems;
  // gen sg masc = gen sg neut, etc.) get a single entry with the
  // composite parse string ("masculine/neuter"). This mirrors how
  // EIMI_FUTURE_MIDDLE_PARTICIPLE handles its overlaps.

  // γίνομαι aorist middle participle γενόμενος — declines like
  // λυόμενος (regular -ος/-η/-ον adjectival). Extremely common in NT.
  const GINOMAI_AORIST_MIDDLE_PARTICIPLE = {
    'γενόμενος':  'aorist middle participle nominative singular masculine',
    'γενομένου':  'aorist middle participle genitive singular masculine/neuter',
    'γενομένῳ':   'aorist middle participle dative singular masculine/neuter',
    'γενόμενον':  'aorist middle participle accusative singular masculine/neuter',
    'γενόμενε':   'aorist middle participle vocative singular masculine',
    'γενόμενοι':  'aorist middle participle nominative plural masculine',
    'γενομένους': 'aorist middle participle accusative plural masculine',
    'γενομένων':  'aorist middle participle genitive plural masculine/feminine/neuter',
    'γενομένοις': 'aorist middle participle dative plural masculine/neuter',
    'γενομένη':   'aorist middle participle nominative singular feminine',
    'γενομένης':  'aorist middle participle genitive singular feminine',
    'γενομένῃ':   'aorist middle participle dative singular feminine',
    'γενομένην':  'aorist middle participle accusative singular feminine',
    'γενόμεναι':  'aorist middle participle nominative plural feminine',
    'γενομέναις': 'aorist middle participle dative plural feminine',
    'γενομένας':  'aorist middle participle accusative plural feminine',
    'γενόμενα':   'aorist middle participle nominative/accusative plural neuter'
  };

  // γίνομαι perfect active participle γεγονώς — declines like
  // λελυκώς (3rd-decl κ-stem masc/neut, 1st-decl fem in -υῖα). The
  // perfect of γίνομαι is active in form despite the present being
  // middle/deponent.
  const GINOMAI_PERFECT_ACTIVE_PARTICIPLE = {
    'γεγονώς':    'perfect active participle nominative singular masculine',
    'γεγονότος':  'perfect active participle genitive singular masculine/neuter',
    'γεγονότι':   'perfect active participle dative singular masculine/neuter',
    'γεγονότα':   'perfect active participle accusative singular masculine',
    // 'γεγονότα' also = nom/acc pl neuter; same key serves both. Take
    // the masculine sg acc reading (more common) and let neuter pl
    // picks fall to the data gap below.
    'γεγονότες':  'perfect active participle nominative plural masculine',
    'γεγονότων':  'perfect active participle genitive plural masculine/feminine/neuter',
    'γεγονόσι':   'perfect active participle dative plural masculine/neuter',
    'γεγονόσιν':  'perfect active participle dative plural masculine/neuter',
    'γεγονότας':  'perfect active participle accusative plural masculine',
    'γεγονυῖα':   'perfect active participle nominative singular feminine',
    'γεγονυίας':  'perfect active participle genitive singular feminine',
    'γεγονυίᾳ':   'perfect active participle dative singular feminine',
    'γεγονυῖαν':  'perfect active participle accusative singular feminine',
    'γεγονυῖαι':  'perfect active participle nominative plural feminine',
    'γεγονυιῶν':  'perfect active participle genitive plural feminine',
    'γεγονυίαις': 'perfect active participle dative plural feminine',
    'γεγονυίας_pl': 'perfect active participle accusative plural feminine', // SENTINEL — see below
    'γεγονός':    'perfect active participle nominative/accusative singular neuter'
  };
  // The synthetic 'γεγονυίας_pl' key above is a placeholder — Greek
  // syncretizes γεγονυίας between fem gen sg and fem acc pl, so the
  // gen-sg reading takes the real Greek key. Remove the placeholder
  // from the data shipped to consumers; the acc-pl-fem pick can fall
  // through to the data gap rather than be silently mislabeled.
  delete GINOMAI_PERFECT_ACTIVE_PARTICIPLE['γεγονυίας_pl'];

  // βάλλω present active participle βάλλων — present stem (doubled λλ),
  // recessive ντ-stem accent (like λύων), distinct from the ending-accented
  // 2nd-aorist βαλών below. Lookup-only: parsing the aorist βαλών as a
  // present participle now reconstructs βάλλων / βαλλόντων (the λλ/λ
  // contrast) instead of dashing. The dat-pl βάλλουσι(ν) is syncretic with
  // the present indicative 3pl, so this is spread BEFORE the indicative in
  // the entry's extraForms to keep that key's indicative reading.
  const BALLO_PRESENT_ACTIVE_PARTICIPLE = {
    'βάλλων':      'present active participle nominative singular masculine',
    'βάλλοντος':   'present active participle genitive singular masculine/neuter',
    'βάλλοντι':    'present active participle dative singular masculine/neuter',
    'βάλλοντα':    'present active participle accusative singular masculine',
    'βάλλοντες':   'present active participle nominative plural masculine',
    'βαλλόντων':   'present active participle genitive plural masculine/feminine/neuter',
    'βάλλουσι':    'present active participle dative plural masculine/neuter',
    'βάλλουσιν':   'present active participle dative plural masculine/neuter',
    'βάλλοντας':   'present active participle accusative plural masculine',
    'βάλλουσα':    'present active participle nominative singular feminine',
    'βαλλούσης':   'present active participle genitive singular feminine',
    'βαλλούσῃ':    'present active participle dative singular feminine',
    'βάλλουσαν':   'present active participle accusative singular feminine',
    'βάλλουσαι':   'present active participle nominative plural feminine',
    'βαλλουσῶν':   'present active participle genitive plural feminine',
    'βαλλούσαις':  'present active participle dative plural feminine',
    'βαλλούσας':   'present active participle accusative plural feminine',
    'βάλλον':      'present active participle nominative/accusative singular neuter'
  };

  // βάλλω aorist active participle βαλών — 2nd aorist active, ντ-stem
  // masc/neut + 1st-decl -οῦσα fem. Only the nominative is drilled
  // (W4_BALLO_SECOND_AORIST); the full declension is real and common.
  const BALLO_AORIST_ACTIVE_PARTICIPLE = {
    'βαλών':      'aorist active participle nominative singular masculine',
    'βαλόντος':   'aorist active participle genitive singular masculine/neuter',
    'βαλόντι':    'aorist active participle dative singular masculine/neuter',
    'βαλόντα':    'aorist active participle accusative singular masculine',
    'βαλόντες':   'aorist active participle nominative plural masculine',
    'βαλόντων':   'aorist active participle genitive plural masculine/feminine/neuter',
    'βαλοῦσι':    'aorist active participle dative plural masculine/neuter',
    'βαλοῦσιν':   'aorist active participle dative plural masculine/neuter',
    'βαλόντας':   'aorist active participle accusative plural masculine',
    'βαλοῦσα':    'aorist active participle nominative singular feminine',
    'βαλούσης':   'aorist active participle genitive singular feminine',
    'βαλούσῃ':    'aorist active participle dative singular feminine',
    'βαλοῦσαν':   'aorist active participle accusative singular feminine',
    'βαλοῦσαι':   'aorist active participle nominative plural feminine',
    'βαλουσῶν':   'aorist active participle genitive plural feminine',
    'βαλούσαις':  'aorist active participle dative plural feminine',
    'βαλούσας':   'aorist active participle accusative plural feminine',
    'βαλόν':      'aorist active participle nominative/accusative singular neuter'
  };

  // λύω perfect active participle λελυκώς — 3rd-decl κ-stem masc/neut
  // + 1st-decl -υῖα fem.
  const LUO_PERFECT_ACTIVE_PARTICIPLE = {
    'λελυκώς':    'perfect active participle nominative singular masculine',
    'λελυκότος':  'perfect active participle genitive singular masculine/neuter',
    'λελυκότι':   'perfect active participle dative singular masculine/neuter',
    'λελυκότα':   'perfect active participle accusative singular masculine',
    'λελυκότες':  'perfect active participle nominative plural masculine',
    'λελυκότων':  'perfect active participle genitive plural masculine/feminine/neuter',
    'λελυκόσι':   'perfect active participle dative plural masculine/neuter',
    'λελυκόσιν':  'perfect active participle dative plural masculine/neuter',
    'λελυκότας':  'perfect active participle accusative plural masculine',
    'λελυκυῖα':   'perfect active participle nominative singular feminine',
    'λελυκυίας':  'perfect active participle genitive singular feminine',
    'λελυκυίᾳ':   'perfect active participle dative singular feminine',
    'λελυκυῖαν':  'perfect active participle accusative singular feminine',
    'λελυκυῖαι':  'perfect active participle nominative plural feminine',
    'λελυκυιῶν':  'perfect active participle genitive plural feminine',
    'λελυκυίαις': 'perfect active participle dative plural feminine',
    'λελυκός':    'perfect active participle nominative/accusative singular neuter'
  };

  // λύω perfect middle/passive participle λελυμένος — regular -ος/-η/
  // -ον adjectival, like λυόμενος.
  const LUO_PERFECT_MP_PARTICIPLE = {
    'λελυμένος':  'perfect middle/passive participle nominative singular masculine',
    'λελυμένου':  'perfect middle/passive participle genitive singular masculine/neuter',
    'λελυμένῳ':   'perfect middle/passive participle dative singular masculine/neuter',
    'λελυμένον':  'perfect middle/passive participle accusative singular masculine/neuter',
    'λελυμένε':   'perfect middle/passive participle vocative singular masculine',
    'λελυμένοι':  'perfect middle/passive participle nominative plural masculine',
    'λελυμένους': 'perfect middle/passive participle accusative plural masculine',
    'λελυμένων':  'perfect middle/passive participle genitive plural masculine/feminine/neuter',
    'λελυμένοις': 'perfect middle/passive participle dative plural masculine/neuter',
    'λελυμένη':   'perfect middle/passive participle nominative singular feminine',
    'λελυμένης':  'perfect middle/passive participle genitive singular feminine',
    'λελυμένῃ':   'perfect middle/passive participle dative singular feminine',
    'λελυμένην':  'perfect middle/passive participle accusative singular feminine',
    'λελυμέναι':  'perfect middle/passive participle nominative plural feminine',
    'λελυμέναις': 'perfect middle/passive participle dative plural feminine',
    'λελυμένας':  'perfect middle/passive participle accusative plural feminine',
    'λελυμένα':   'perfect middle/passive participle nominative/accusative plural neuter'
  };

  // Optional groups for the participle additions. Chapter gates:
  // - Aorist participles (γενόμενος, βαλών): nominative singulars at
  //   ch 12 (W5 — when the participle stems first show up), the rest of
  //   each declension at ch 14 (Duff's participle chapter) via
  //   participleOptionalGroups.
  // - Perfect participles (γεγονώς, λελυκώς, λελυμένος): ch 15 (W6 —
  //   when the perfect system is introduced + ch 14 participles
  //   already in scope; max(14,15)=15).
  const GINOMAI_PARTICIPLE_OPTIONAL = [
    ...participleOptionalGroups(12, 'γίνομαι — aorist middle participle γενόμενος',
      GINOMAI_AORIST_MIDDLE_PARTICIPLE),
    { chapter: 15, family: 'γίνομαι — perfect active participle γεγονώς (optional)',
      forms: GINOMAI_PERFECT_ACTIVE_PARTICIPLE }
  ];
  const BALLO_PARTICIPLE_OPTIONAL =
    participleOptionalGroups(12, 'βάλλω — aorist active participle βαλών',
      BALLO_AORIST_ACTIVE_PARTICIPLE);
  const LUO_PARTICIPLE_OPTIONAL = [
    { chapter: 15, family: 'λύω — perfect active participle λελυκώς (optional)',
      forms: LUO_PERFECT_ACTIVE_PARTICIPLE },
    { chapter: 15, family: 'λύω — perfect middle/passive participle λελυμένος (optional)',
      forms: LUO_PERFECT_MP_PARTICIPLE }
  ];

  // 2nd-aorist active participle paradigm helper (-ών / -οῦσα / -όν,
  // ντ-stem masc/neut + 1st-decl fem). Built once from a bare stem so
  // each 2nd-aorist lemma gets a full declension without duplicating
  // the 19-form template. Mirrors aoristPassiveParticipleParadigm
  // below but for the active voice (βαλών/λαβών/λιπών-type).
  function aoristActiveParticipleParadigm(stem) {
    const s = stem;
    return {
      [`${s}ών`]:      'aorist active participle nominative singular masculine',
      [`${s}όντος`]:   'aorist active participle genitive singular masculine/neuter',
      [`${s}όντι`]:    'aorist active participle dative singular masculine/neuter',
      [`${s}όντα`]:    'aorist active participle accusative singular masculine',
      [`${s}όντες`]:   'aorist active participle nominative plural masculine',
      [`${s}όντων`]:   'aorist active participle genitive plural masculine/feminine/neuter',
      [`${s}οῦσι`]:    'aorist active participle dative plural masculine/neuter',
      [`${s}οῦσιν`]:   'aorist active participle dative plural masculine/neuter',
      [`${s}όντας`]:   'aorist active participle accusative plural masculine',
      [`${s}οῦσα`]:    'aorist active participle nominative singular feminine',
      [`${s}ούσης`]:   'aorist active participle genitive singular feminine',
      [`${s}ούσῃ`]:    'aorist active participle dative singular feminine',
      [`${s}οῦσαν`]:   'aorist active participle accusative singular feminine',
      [`${s}οῦσαι`]:   'aorist active participle nominative plural feminine',
      [`${s}ουσῶν`]:   'aorist active participle genitive plural feminine',
      [`${s}ούσαις`]:  'aorist active participle dative plural feminine',
      [`${s}ούσας`]:   'aorist active participle accusative plural feminine',
      [`${s}όν`]:      'aorist active participle nominative/accusative singular neuter'
    };
  }

  const LAMBANO_AORIST_ACTIVE_PARTICIPLE = aoristActiveParticipleParadigm('λαβ');
  const LEIPO_AORIST_ACTIVE_PARTICIPLE   = aoristActiveParticipleParadigm('λιπ');

  const LAMBANO_PARTICIPLE_OPTIONAL =
    participleOptionalGroups(12, 'λαμβάνω — aorist active participle λαβών',
      LAMBANO_AORIST_ACTIVE_PARTICIPLE);
  const LEIPO_PARTICIPLE_OPTIONAL =
    participleOptionalGroups(12, 'λείπω — aorist active participle λιπών',
      LEIPO_AORIST_ACTIVE_PARTICIPLE);

  // ─── μι-verb participle full declensions ──────────────────────────
  //
  // Duff drills only the bare stem form (masc nom sg + the -οῦσα/-όν
  // gender alternates) for each μι-verb participle. Full case/number
  // declensions exist and are common in the NT. All follow the same
  // ντ-stem pattern as λύων but with stem-specific vowel: ο/ου for
  // δίδωμι, ε/ει for τίθημι, α for ἵστημι.

  // δίδωμι present active participle διδούς (giving).
  const DIDOMI_PRESENT_ACTIVE_PARTICIPLE = {
    'διδούς':     'present active participle nominative singular masculine',
    'διδόντος':   'present active participle genitive singular masculine/neuter',
    'διδόντι':    'present active participle dative singular masculine/neuter',
    'διδόντα':    'present active participle accusative singular masculine',
    'διδόντες':   'present active participle nominative plural masculine',
    'διδόντων':   'present active participle genitive plural masculine/feminine/neuter',
    'διδοῦσι':    'present active participle dative plural masculine/neuter',
    'διδοῦσιν':   'present active participle dative plural masculine/neuter',
    'διδόντας':   'present active participle accusative plural masculine',
    'διδοῦσα':    'present active participle nominative singular feminine',
    'διδούσης':   'present active participle genitive singular feminine',
    'διδούσῃ':    'present active participle dative singular feminine',
    'διδοῦσαν':   'present active participle accusative singular feminine',
    'διδοῦσαι':   'present active participle nominative plural feminine',
    'διδουσῶν':   'present active participle genitive plural feminine',
    'διδούσαις':  'present active participle dative plural feminine',
    'διδούσας':   'present active participle accusative plural feminine',
    'διδόν':      'present active participle nominative/accusative singular neuter'
  };

  // δίδωμι aorist active participle δούς (having given).
  const DIDOMI_AORIST_ACTIVE_PARTICIPLE = {
    'δούς':     'aorist active participle nominative singular masculine',
    'δόντος':   'aorist active participle genitive singular masculine/neuter',
    'δόντι':    'aorist active participle dative singular masculine/neuter',
    'δόντα':    'aorist active participle accusative singular masculine',
    'δόντες':   'aorist active participle nominative plural masculine',
    'δόντων':   'aorist active participle genitive plural masculine/feminine/neuter',
    'δοῦσι':    'aorist active participle dative plural masculine/neuter',
    'δοῦσιν':   'aorist active participle dative plural masculine/neuter',
    'δόντας':   'aorist active participle accusative plural masculine',
    'δοῦσα':    'aorist active participle nominative singular feminine',
    'δούσης':   'aorist active participle genitive singular feminine',
    'δούσῃ':    'aorist active participle dative singular feminine',
    'δοῦσαν':   'aorist active participle accusative singular feminine',
    'δοῦσαι':   'aorist active participle nominative plural feminine',
    'δουσῶν':   'aorist active participle genitive plural feminine',
    'δούσαις':  'aorist active participle dative plural feminine',
    'δούσας':   'aorist active participle accusative plural feminine',
    'δόν':      'aorist active participle nominative/accusative singular neuter'
  };

  // τίθημι present active participle τιθείς (placing).
  const TITHEMI_PRESENT_ACTIVE_PARTICIPLE = {
    'τιθείς':     'present active participle nominative singular masculine',
    'τιθέντος':   'present active participle genitive singular masculine/neuter',
    'τιθέντι':    'present active participle dative singular masculine/neuter',
    'τιθέντα':    'present active participle accusative singular masculine',
    'τιθέντες':   'present active participle nominative plural masculine',
    'τιθέντων':   'present active participle genitive plural masculine/feminine/neuter',
    'τιθεῖσι':    'present active participle dative plural masculine/neuter',
    'τιθεῖσιν':   'present active participle dative plural masculine/neuter',
    'τιθέντας':   'present active participle accusative plural masculine',
    'τιθεῖσα':    'present active participle nominative singular feminine',
    'τιθείσης':   'present active participle genitive singular feminine',
    'τιθείσῃ':    'present active participle dative singular feminine',
    'τιθεῖσαν':   'present active participle accusative singular feminine',
    'τιθεῖσαι':   'present active participle nominative plural feminine',
    'τιθεισῶν':   'present active participle genitive plural feminine',
    'τιθείσαις':  'present active participle dative plural feminine',
    'τιθείσας':   'present active participle accusative plural feminine',
    'τιθέν':      'present active participle nominative/accusative singular neuter'
  };

  // τίθημι aorist active participle θείς (having placed).
  const TITHEMI_AORIST_ACTIVE_PARTICIPLE = {
    'θείς':     'aorist active participle nominative singular masculine',
    'θέντος':   'aorist active participle genitive singular masculine/neuter',
    'θέντι':    'aorist active participle dative singular masculine/neuter',
    'θέντα':    'aorist active participle accusative singular masculine',
    'θέντες':   'aorist active participle nominative plural masculine',
    'θέντων':   'aorist active participle genitive plural masculine/feminine/neuter',
    'θεῖσι':    'aorist active participle dative plural masculine/neuter',
    'θεῖσιν':   'aorist active participle dative plural masculine/neuter',
    'θέντας':   'aorist active participle accusative plural masculine',
    'θεῖσα':    'aorist active participle nominative singular feminine',
    'θείσης':   'aorist active participle genitive singular feminine',
    'θείσῃ':    'aorist active participle dative singular feminine',
    'θεῖσαν':   'aorist active participle accusative singular feminine',
    'θεῖσαι':   'aorist active participle nominative plural feminine',
    'θεισῶν':   'aorist active participle genitive plural feminine',
    'θείσαις':  'aorist active participle dative plural feminine',
    'θείσας':   'aorist active participle accusative plural feminine',
    'θέν':      'aorist active participle nominative/accusative singular neuter'
  };

  // ἵστημι present active participle ἱστάς (standing — transitive
  // "causing to stand").
  const HISTEMI_PRESENT_ACTIVE_PARTICIPLE = {
    'ἱστάς':     'present active participle nominative singular masculine',
    'ἱστάντος':  'present active participle genitive singular masculine/neuter',
    'ἱστάντι':   'present active participle dative singular masculine/neuter',
    'ἱστάντα':   'present active participle accusative singular masculine',
    'ἱστάντες':  'present active participle nominative plural masculine',
    'ἱστάντων':  'present active participle genitive plural masculine/feminine/neuter',
    'ἱστᾶσι':    'present active participle dative plural masculine/neuter',
    'ἱστᾶσιν':   'present active participle dative plural masculine/neuter',
    'ἱστάντας':  'present active participle accusative plural masculine',
    'ἱστᾶσα':    'present active participle nominative singular feminine',
    'ἱστάσης':   'present active participle genitive singular feminine',
    'ἱστάσῃ':    'present active participle dative singular feminine',
    'ἱστᾶσαν':   'present active participle accusative singular feminine',
    'ἱστᾶσαι':   'present active participle nominative plural feminine',
    'ἱστασῶν':   'present active participle genitive plural feminine',
    'ἱστάσαις':  'present active participle dative plural feminine',
    'ἱστάσας':   'present active participle accusative plural feminine',
    'ἱστάν':     'present active participle nominative/accusative singular neuter'
  };

  // ἵστημι 2nd aorist active participle στάς (having stood — intransitive).
  // Statistically more common in the NT than the 1st-aorist στήσας
  // (transitive "having set up"). 1st-aorist στήσας skipped for now —
  // a future addition if students hit gaps with it.
  const HISTEMI_SECOND_AORIST_ACTIVE_PARTICIPLE = {
    'στάς':     'aorist active participle nominative singular masculine',
    'στάντος':  'aorist active participle genitive singular masculine/neuter',
    'στάντι':   'aorist active participle dative singular masculine/neuter',
    'στάντα':   'aorist active participle accusative singular masculine',
    'στάντες':  'aorist active participle nominative plural masculine',
    'στάντων':  'aorist active participle genitive plural masculine/feminine/neuter',
    'στᾶσι':    'aorist active participle dative plural masculine/neuter',
    'στᾶσιν':   'aorist active participle dative plural masculine/neuter',
    'στάντας':  'aorist active participle accusative plural masculine',
    'στᾶσα':    'aorist active participle nominative singular feminine',
    'στάσης':   'aorist active participle genitive singular feminine',
    'στάσῃ':    'aorist active participle dative singular feminine',
    'στᾶσαν':   'aorist active participle accusative singular feminine',
    'στᾶσαι':   'aorist active participle nominative plural feminine',
    'στασῶν':   'aorist active participle genitive plural feminine',
    'στάσαις':  'aorist active participle dative plural feminine',
    'στάσας':   'aorist active participle accusative plural feminine',
    'στάν':     'aorist active participle nominative/accusative singular neuter'
  };

  // ἵστημι perfect active participle ἑστηκώς (standing — with present
  // meaning: "I am standing", matching the perfect indicative ἕστηκα).
  const HISTEMI_PERFECT_ACTIVE_PARTICIPLE = {
    'ἑστηκώς':    'perfect active participle nominative singular masculine',
    'ἑστηκότος':  'perfect active participle genitive singular masculine/neuter',
    'ἑστηκότι':   'perfect active participle dative singular masculine/neuter',
    'ἑστηκότα':   'perfect active participle accusative singular masculine',
    'ἑστηκότες':  'perfect active participle nominative plural masculine',
    'ἑστηκότων':  'perfect active participle genitive plural masculine/feminine/neuter',
    'ἑστηκόσι':   'perfect active participle dative plural masculine/neuter',
    'ἑστηκόσιν':  'perfect active participle dative plural masculine/neuter',
    'ἑστηκότας':  'perfect active participle accusative plural masculine',
    'ἑστηκυῖα':   'perfect active participle nominative singular feminine',
    'ἑστηκυίας':  'perfect active participle genitive singular feminine',
    'ἑστηκυίᾳ':   'perfect active participle dative singular feminine',
    'ἑστηκυῖαν':  'perfect active participle accusative singular feminine',
    'ἑστηκυῖαι':  'perfect active participle nominative plural feminine',
    'ἑστηκυιῶν':  'perfect active participle genitive plural feminine',
    'ἑστηκυίαις': 'perfect active participle dative plural feminine',
    'ἑστηκός':    'perfect active participle nominative/accusative singular neuter'
  };

  // Optional groups for the μι-verb participle additions. Chapter
  // gates: present + aorist participle nominative singulars at ch 12
  // (W5 — participle stems introduced), the rest of each declension at
  // ch 14 via participleOptionalGroups; perfect active participle at
  // ch 15 (perfect intro at W6).
  const DIDOMI_PARTICIPLE_OPTIONAL = [
    ...participleOptionalGroups(12, 'δίδωμι — present active participle διδούς',
      DIDOMI_PRESENT_ACTIVE_PARTICIPLE),
    ...participleOptionalGroups(12, 'δίδωμι — aorist active participle δούς',
      DIDOMI_AORIST_ACTIVE_PARTICIPLE)
  ];
  const TITHEMI_PARTICIPLE_OPTIONAL = [
    ...participleOptionalGroups(12, 'τίθημι — present active participle τιθείς',
      TITHEMI_PRESENT_ACTIVE_PARTICIPLE),
    ...participleOptionalGroups(12, 'τίθημι — aorist active participle θείς',
      TITHEMI_AORIST_ACTIVE_PARTICIPLE)
  ];
  const HISTEMI_PARTICIPLE_OPTIONAL = [
    ...participleOptionalGroups(12, 'ἵστημι — present active participle ἱστάς',
      HISTEMI_PRESENT_ACTIVE_PARTICIPLE),
    ...participleOptionalGroups(12, 'ἵστημι — 2nd aorist active participle στάς',
      HISTEMI_SECOND_AORIST_ACTIVE_PARTICIPLE),
    { chapter: 15, family: 'ἵστημι — perfect active participle ἑστηκώς full declension (optional)',
      forms: HISTEMI_PERFECT_ACTIVE_PARTICIPLE }
  ];

  // ─── φιλέω participle declensions ─────────────────────────────────
  //
  // Duff drills only the masc-nom forms (W2_PHILEO_ACTIVE_PARTICIPLE:
  // φιλῶν 1sg, φιλοῦντες 3pl, φιλήσας 1sg, φιλήσαντες 3pl). Full
  // declensions follow the standard contract -έω pattern: the ε
  // contracts with the participle suffix (ε+ο → ου, ε+α → α with
  // accent shift).

  const PHILEO_PRESENT_ACTIVE_PARTICIPLE = {
    'φιλῶν':       'present active participle nominative singular masculine',
    'φιλοῦντος':   'present active participle genitive singular masculine/neuter',
    'φιλοῦντι':    'present active participle dative singular masculine/neuter',
    'φιλοῦντα':    'present active participle accusative singular masculine',
    'φιλοῦντες':   'present active participle nominative plural masculine',
    'φιλούντων':   'present active participle genitive plural masculine/feminine/neuter',
    'φιλοῦσι':     'present active participle dative plural masculine/neuter',
    'φιλοῦσιν':    'present active participle dative plural masculine/neuter',
    'φιλοῦντας':   'present active participle accusative plural masculine',
    'φιλοῦσα':     'present active participle nominative singular feminine',
    'φιλούσης':    'present active participle genitive singular feminine',
    'φιλούσῃ':     'present active participle dative singular feminine',
    'φιλοῦσαν':    'present active participle accusative singular feminine',
    'φιλοῦσαι':    'present active participle nominative plural feminine',
    'φιλουσῶν':    'present active participle genitive plural feminine',
    'φιλούσαις':   'present active participle dative plural feminine',
    'φιλούσας':    'present active participle accusative plural feminine',
    'φιλοῦν':      'present active participle nominative/accusative singular neuter'
  };

  const PHILEO_AORIST_ACTIVE_PARTICIPLE = {
    'φιλήσας':       'aorist active participle nominative singular masculine',
    'φιλήσαντος':    'aorist active participle genitive singular masculine/neuter',
    'φιλήσαντι':     'aorist active participle dative singular masculine/neuter',
    'φιλήσαντα':     'aorist active participle accusative singular masculine',
    'φιλήσαντες':    'aorist active participle nominative plural masculine',
    'φιλησάντων':    'aorist active participle genitive plural masculine/feminine/neuter',
    'φιλήσασι':      'aorist active participle dative plural masculine/neuter',
    'φιλήσασιν':     'aorist active participle dative plural masculine/neuter',
    'φιλήσαντας':    'aorist active participle accusative plural masculine',
    'φιλήσασα':      'aorist active participle nominative singular feminine',
    'φιλησάσης':     'aorist active participle genitive singular feminine',
    'φιλησάσῃ':      'aorist active participle dative singular feminine',
    'φιλήσασαν':     'aorist active participle accusative singular feminine',
    'φιλήσασαι':     'aorist active participle nominative plural feminine',
    'φιλησασῶν':     'aorist active participle genitive plural feminine',
    'φιλησάσαις':    'aorist active participle dative plural feminine',
    'φιλησάσας':     'aorist active participle accusative plural feminine',
    'φιλῆσαν':       'aorist active participle nominative/accusative singular neuter'
  };

  const PHILEO_PARTICIPLE_OPTIONAL = [
    ...participleOptionalGroups(12, 'φιλέω — present active participle φιλῶν',
      PHILEO_PRESENT_ACTIVE_PARTICIPLE),
    ...participleOptionalGroups(12, 'φιλέω — aorist active participle φιλήσας',
      PHILEO_AORIST_ACTIVE_PARTICIPLE)
  ];

  // ─── λύω future participles (active, middle, passive) ─────────────
  //
  // Rare in NT but morphologically real. Future active follows the
  // λύων pattern (ντ-stem masc/neut + -οῦσα fem); future middle
  // follows λυόμενος (regular -ος/-η/-ον); future passive likewise
  // (-θησόμενος, basically the future middle of the passive stem).

  const LUO_FUTURE_ACTIVE_PARTICIPLE = {
    'λύσων':      'future active participle nominative singular masculine',
    'λύσοντος':   'future active participle genitive singular masculine/neuter',
    'λύσοντι':    'future active participle dative singular masculine/neuter',
    'λύσοντα':    'future active participle accusative singular masculine',
    'λύσοντες':   'future active participle nominative plural masculine',
    'λυσόντων':   'future active participle genitive plural masculine/feminine/neuter',
    'λύσουσι':    'future active participle dative plural masculine/neuter',
    'λύσουσιν':   'future active participle dative plural masculine/neuter',
    'λύσοντας':   'future active participle accusative plural masculine',
    'λύσουσα':    'future active participle nominative singular feminine',
    'λυσούσης':   'future active participle genitive singular feminine',
    'λυσούσῃ':    'future active participle dative singular feminine',
    'λύσουσαν':   'future active participle accusative singular feminine',
    'λύσουσαι':   'future active participle nominative plural feminine',
    'λυσουσῶν':   'future active participle genitive plural feminine',
    'λυσούσαις':  'future active participle dative plural feminine',
    'λυσούσας':   'future active participle accusative plural feminine',
    'λῦσον':      'future active participle nominative/accusative singular neuter'
  };

  const LUO_FUTURE_MIDDLE_PARTICIPLE = {
    'λυσόμενος':  'future middle participle nominative singular masculine',
    'λυσομένου':  'future middle participle genitive singular masculine/neuter',
    'λυσομένῳ':   'future middle participle dative singular masculine/neuter',
    'λυσόμενον':  'future middle participle accusative singular masculine/neuter',
    'λυσόμενοι':  'future middle participle nominative plural masculine',
    'λυσομένους': 'future middle participle accusative plural masculine',
    'λυσομένων':  'future middle participle genitive plural masculine/feminine/neuter',
    'λυσομένοις': 'future middle participle dative plural masculine/neuter',
    'λυσομένη':   'future middle participle nominative singular feminine',
    'λυσομένης':  'future middle participle genitive singular feminine',
    'λυσομένῃ':   'future middle participle dative singular feminine',
    'λυσομένην':  'future middle participle accusative singular feminine',
    'λυσόμεναι':  'future middle participle nominative plural feminine',
    'λυσομέναις': 'future middle participle dative plural feminine',
    'λυσομένας':  'future middle participle accusative plural feminine',
    'λυσόμενα':   'future middle participle nominative/accusative plural neuter'
  };

  const LUO_FUTURE_PASSIVE_PARTICIPLE = {
    'λυθησόμενος':  'future passive participle nominative singular masculine',
    'λυθησομένου':  'future passive participle genitive singular masculine/neuter',
    'λυθησομένῳ':   'future passive participle dative singular masculine/neuter',
    'λυθησόμενον':  'future passive participle accusative singular masculine/neuter',
    'λυθησόμενοι':  'future passive participle nominative plural masculine',
    'λυθησομένους': 'future passive participle accusative plural masculine',
    'λυθησομένων':  'future passive participle genitive plural masculine/feminine/neuter',
    'λυθησομένοις': 'future passive participle dative plural masculine/neuter',
    'λυθησομένη':   'future passive participle nominative singular feminine',
    'λυθησομένης':  'future passive participle genitive singular feminine',
    'λυθησομένῃ':   'future passive participle dative singular feminine',
    'λυθησομένην':  'future passive participle accusative singular feminine',
    'λυθησόμεναι':  'future passive participle nominative plural feminine',
    'λυθησομέναις': 'future passive participle dative plural feminine',
    'λυθησομένας':  'future passive participle accusative plural feminine',
    'λυθησόμενα':   'future passive participle nominative/accusative plural neuter'
  };

  const LUO_FUTURE_PARTICIPLE_OPTIONAL = [
    { chapter: 15, family: 'λύω — future active participle λύσων full declension (optional, rare)',
      forms: LUO_FUTURE_ACTIVE_PARTICIPLE },
    { chapter: 15, family: 'λύω — future middle participle λυσόμενος full declension (optional, rare)',
      forms: LUO_FUTURE_MIDDLE_PARTICIPLE },
    { chapter: 15, family: 'λύω — future passive participle λυθησόμενος full declension (optional, rare)',
      forms: LUO_FUTURE_PASSIVE_PARTICIPLE }
  ];

  // ─── Aorist passive participles ───────────────────────────────────
  //
  // Each major verb has an aorist passive participle following the
  // λυθείς paradigm (3rd-decl ντ-stem masc/neut with -θεις/-θεντος;
  // 1st-decl -θεῖσα fem). Stems shift per the verb's principal-part
  // formation: φιλη-θ-, βλη-θ-, γενη-θ-, δο-θ-, τε-θ-, στα-θ-. All
  // are real Koine and common in the NT (γενηθεὶς "having become",
  // δοθείς "having been given", σταθείς "having been placed/stood").
  //
  // Gated ch 15 (W6 — aorist passive system intro + ch 12 participles
  // already in scope; max gives 15).

  function aoristPassiveParticipleParadigm(stem) {
    // stem is the part before -θεις (e.g. 'φιλη', 'βλη', 'γενη', 'δο',
    // 'τε', 'στα'). Returns a flat forms object keyed by the inflected
    // Greek string, with the standard λυθείς pattern parses.
    const s = stem;
    return {
      [`${s}θείς`]:     'aorist passive participle nominative singular masculine',
      [`${s}θέντος`]:   'aorist passive participle genitive singular masculine/neuter',
      [`${s}θέντι`]:    'aorist passive participle dative singular masculine/neuter',
      [`${s}θέντα`]:    'aorist passive participle accusative singular masculine',
      [`${s}θέντες`]:   'aorist passive participle nominative plural masculine',
      [`${s}θέντων`]:   'aorist passive participle genitive plural masculine/feminine/neuter',
      [`${s}θεῖσι`]:    'aorist passive participle dative plural masculine/neuter',
      [`${s}θεῖσιν`]:   'aorist passive participle dative plural masculine/neuter',
      [`${s}θέντας`]:   'aorist passive participle accusative plural masculine',
      [`${s}θεῖσα`]:    'aorist passive participle nominative singular feminine',
      [`${s}θείσης`]:   'aorist passive participle genitive singular feminine',
      [`${s}θείσῃ`]:    'aorist passive participle dative singular feminine',
      [`${s}θεῖσαν`]:   'aorist passive participle accusative singular feminine',
      [`${s}θεῖσαι`]:   'aorist passive participle nominative plural feminine',
      [`${s}θεισῶν`]:   'aorist passive participle genitive plural feminine',
      [`${s}θείσαις`]:  'aorist passive participle dative plural feminine',
      [`${s}θείσας`]:   'aorist passive participle accusative plural feminine',
      [`${s}θέν`]:      'aorist passive participle nominative/accusative singular neuter'
    };
  }

  const PHILEO_AORIST_PASSIVE_PARTICIPLE  = aoristPassiveParticipleParadigm('φιλη');
  const BALLO_AORIST_PASSIVE_PARTICIPLE   = aoristPassiveParticipleParadigm('βλη');
  const GINOMAI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('γενη');
  const DIDOMI_AORIST_PASSIVE_PARTICIPLE  = aoristPassiveParticipleParadigm('δο');
  const TITHEMI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('τε');
  const HISTEMI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('στα');
  // λαμβάνω aorist passive participle λημφθείς (Koine; classical
  // ληφθείς), λείπω aorist passive participle λειφθείς.
  const LAMBANO_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('λημφ');
  const LEIPO_AORIST_PASSIVE_PARTICIPLE   = aoristPassiveParticipleParadigm('λειφ');

  // ─── Suppletive / 2nd-aorist participle declensions (lookup-only) ──
  //
  // λέγω (εἰπών), ὁράω (ἰδών), ἔρχομαι (ἐλθών), ἔχω (σχών), ἄγω (ἀγαγών),
  // γινώσκω (γνούς) and κρίνω (κρίνας) drill only the masc nom sg + nom pl
  // of their aorist participle (the W4_*_SECOND_AORIST sets). Every other
  // case/number therefore resolved to a blank "—" in the parsing
  // reconstruction ("Your parse"). These full declensions are added to
  // extraForms ONLY (no optionalFormGroups) so a wrong-case parse
  // reconstructs to the real form without injecting new quiz cards into
  // the deck — the same lookup-only treatment the distinct vocatives get.
  //
  // The active participles follow the βαλών pattern (3rd-decl ντ-stem
  // masc/neut + 1st-decl -οῦσα fem); γνούς overrides only the masc nom sg
  // (root-aorist -ούς), and κρίνας is the 1st-aorist -ας/-αντος type. The
  // aorist passive participles (ῥηθείς, ὀφθείς, …) are real Koine forms
  // (τὸ ῥηθέν, ὁ ὀφθείς) Duff doesn't drill — included so a passive parse
  // resolves rather than dashing. ἔρχομαι is deponent (no passive).

  function secondAoristActiveNtParticiple(stem, nomSgMasc) {
    const s = stem;
    return {
      [nomSgMasc || `${s}ών`]: 'aorist active participle nominative singular masculine',
      [`${s}όντος`]:  'aorist active participle genitive singular masculine/neuter',
      [`${s}όντι`]:   'aorist active participle dative singular masculine/neuter',
      [`${s}όντα`]:   'aorist active participle accusative singular masculine',
      [`${s}όντες`]:  'aorist active participle nominative plural masculine',
      [`${s}όντων`]:  'aorist active participle genitive plural masculine/feminine/neuter',
      [`${s}οῦσι`]:   'aorist active participle dative plural masculine/neuter',
      [`${s}οῦσιν`]:  'aorist active participle dative plural masculine/neuter',
      [`${s}όντας`]:  'aorist active participle accusative plural masculine',
      [`${s}οῦσα`]:   'aorist active participle nominative singular feminine',
      [`${s}ούσης`]:  'aorist active participle genitive singular feminine',
      [`${s}ούσῃ`]:   'aorist active participle dative singular feminine',
      [`${s}οῦσαν`]:  'aorist active participle accusative singular feminine',
      [`${s}οῦσαι`]:  'aorist active participle nominative plural feminine',
      [`${s}ουσῶν`]:  'aorist active participle genitive plural feminine',
      [`${s}ούσαις`]: 'aorist active participle dative plural feminine',
      [`${s}ούσας`]:  'aorist active participle accusative plural feminine',
      [`${s}όν`]:     'aorist active participle nominative/accusative singular neuter'
    };
  }

  const LEGO_AORIST_ACTIVE_PARTICIPLE     = secondAoristActiveNtParticiple('εἰπ');
  const HORAO_AORIST_ACTIVE_PARTICIPLE    = secondAoristActiveNtParticiple('ἰδ');
  const ERCHOMAI_AORIST_ACTIVE_PARTICIPLE = secondAoristActiveNtParticiple('ἐλθ');
  const ECHO_AORIST_ACTIVE_PARTICIPLE     = secondAoristActiveNtParticiple('σχ');
  const AGO_AORIST_ACTIVE_PARTICIPLE      = secondAoristActiveNtParticiple('ἀγαγ');
  const GINOSKO_AORIST_ACTIVE_PARTICIPLE  = secondAoristActiveNtParticiple('γν', 'γνούς');

  // κρίνω — 1st-aorist active participle κρίνας (-ας/-αντος), not the
  // ντ-stem -ών type (κρίνω forms a liquid 1st aorist ἔκρινα).
  const KRINO_AORIST_ACTIVE_PARTICIPLE = {
    'κρίνας':     'aorist active participle nominative singular masculine',
    'κρίναντος':  'aorist active participle genitive singular masculine/neuter',
    'κρίναντι':   'aorist active participle dative singular masculine/neuter',
    'κρίναντα':   'aorist active participle accusative singular masculine',
    'κρίναντες':  'aorist active participle nominative plural masculine',
    'κρινάντων':  'aorist active participle genitive plural masculine/feminine/neuter',
    'κρίνασι':    'aorist active participle dative plural masculine/neuter',
    'κρίνασιν':   'aorist active participle dative plural masculine/neuter',
    'κρίναντας':  'aorist active participle accusative plural masculine',
    'κρίνασα':    'aorist active participle nominative singular feminine',
    'κρινάσης':   'aorist active participle genitive singular feminine',
    'κρινάσῃ':    'aorist active participle dative singular feminine',
    'κρίνασαν':   'aorist active participle accusative singular feminine',
    'κρίνασαι':   'aorist active participle nominative plural feminine',
    'κρινασῶν':   'aorist active participle genitive plural feminine',
    'κρινάσαις':  'aorist active participle dative plural feminine',
    'κρινάσας':   'aorist active participle accusative plural feminine',
    'κρῖναν':     'aorist active participle nominative/accusative singular neuter'
  };

  const LEGO_AORIST_PASSIVE_PARTICIPLE    = aoristPassiveParticipleParadigm('ῥη');
  const HORAO_AORIST_PASSIVE_PARTICIPLE   = aoristPassiveParticipleParadigm('ὀφ');
  const ECHO_AORIST_PASSIVE_PARTICIPLE    = aoristPassiveParticipleParadigm('σχε');
  const AGO_AORIST_PASSIVE_PARTICIPLE     = aoristPassiveParticipleParadigm('ἀχ');
  const GINOSKO_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('γνωσ');
  const KRINO_AORIST_PASSIVE_PARTICIPLE   = aoristPassiveParticipleParadigm('κρι');

  // ─── Present active participles for the 2nd-aorist / suppletive verbs ──
  //
  // The aorist participles above resolve a "having Xed" mis-parse; their
  // PRESENT participles were still missing, so parsing an aorist participle
  // as a *present* one dashed (the βάλλω → βάλλων case, now generalised).
  // Lookup-only (extraForms), like the rest.
  //
  // Present active participles take the recessive ντ-stem accent (λύων
  // type), unlike the ending-accented 2nd-aorist βαλών. The helper takes an
  // accented stem (accent stays on the stem) and a bare stem (used where a
  // long ending ‑όντων/‑ούσης/‑ουσῶν pulls the accent off the stem); the
  // neuter nom/acc sg is passed explicitly since its accent depends on the
  // stem-vowel length (acute βάλλον vs circumflex λεῖπον).
  function presentActiveNtParticiple(accStem, bareStem, neuter) {
    const a = accStem, b = bareStem;
    return {
      [`${a}ων`]:     'present active participle nominative singular masculine',
      [`${a}οντος`]:  'present active participle genitive singular masculine/neuter',
      [`${a}οντι`]:   'present active participle dative singular masculine/neuter',
      [`${a}οντα`]:   'present active participle accusative singular masculine',
      [`${a}οντες`]:  'present active participle nominative plural masculine',
      [`${b}όντων`]:  'present active participle genitive plural masculine/feminine/neuter',
      [`${a}ουσι`]:   'present active participle dative plural masculine/neuter',
      [`${a}ουσιν`]:  'present active participle dative plural masculine/neuter',
      [`${a}οντας`]:  'present active participle accusative plural masculine',
      [`${a}ουσα`]:   'present active participle nominative singular feminine',
      [`${b}ούσης`]:  'present active participle genitive singular feminine',
      [`${b}ούσῃ`]:   'present active participle dative singular feminine',
      [`${a}ουσαν`]:  'present active participle accusative singular feminine',
      [`${a}ουσαι`]:  'present active participle nominative plural feminine',
      [`${b}ουσῶν`]:  'present active participle genitive plural feminine',
      [`${b}ούσαις`]: 'present active participle dative plural feminine',
      [`${b}ούσας`]:  'present active participle accusative plural feminine',
      [neuter]:       'present active participle nominative/accusative singular neuter'
    };
  }

  // -μενος middle/passive participle (regular 2-1-2 adjective, λυόμενος
  // pattern). accStem carries the accent on the connecting vowel for the
  // short-ultima cells (nom/acc, -οι/-αι/-α, voc), bareStem is unaccented for
  // the long-ultima cells where the accent shifts onto -μέν-. Works for plain
  // stems (accStem 'λυό' / bareStem 'λυο' → λυόμενος…) and for contract verbs
  // whose connecting vowel has already contracted (accStem 'ἀγαπώ' / bareStem
  // 'ἀγαπω' → ἀγαπώμενος, ἀγαπωμένου, …).
  function menosParticipleParadigm(accStem, bareStem, label) {
    const a = accStem, b = bareStem, L = label;
    return {
      [`${a}μενος`]:  `${L} nominative singular masculine`,
      [`${b}μένου`]:  `${L} genitive singular masculine/neuter`,
      [`${b}μένῳ`]:   `${L} dative singular masculine/neuter`,
      [`${a}μενον`]:  `${L} accusative singular masculine/neuter`,
      [`${a}μενε`]:   `${L} vocative singular masculine`,
      [`${a}μενοι`]:  `${L} nominative plural masculine`,
      [`${b}μένους`]: `${L} accusative plural masculine`,
      [`${b}μένων`]:  `${L} genitive plural masculine/feminine/neuter`,
      [`${b}μένοις`]: `${L} dative plural masculine/neuter`,
      [`${b}μένη`]:   `${L} nominative singular feminine`,
      [`${b}μένης`]:  `${L} genitive singular feminine`,
      [`${b}μένῃ`]:   `${L} dative singular feminine`,
      [`${b}μένην`]:  `${L} accusative singular feminine`,
      [`${a}μεναι`]:  `${L} nominative plural feminine`,
      [`${b}μέναις`]: `${L} dative plural feminine`,
      [`${b}μένας`]:  `${L} accusative plural feminine`,
      [`${a}μενα`]:   `${L} nominative/accusative plural neuter`
    };
  }

  // λύω present middle/passive participle (λυόμενος) and aorist middle
  // participle (λυσάμενος) — the -μενος (2-1-2 adjectival) declensions the
  // rest of this file repeatedly cites as the model ("declines like
  // λυόμενος"), yet λύω itself ships only the present passive nom sg masc
  // (λυόμενος, drilled in W6) and no aorist middle participle at all. Both
  // carry recessive accent, so menosParticipleParadigm applies — unlike the
  // persistent-penult perfect m/p λελυμένος above, which is spelled out by
  // hand. Gated at Ch 15 (middle/passive voice) and kept optional, matching
  // λύω's other participle extensions (perfect/future). The drilled W6
  // λυόμενος nom-sg card supersedes the duplicate here in getCardsFor-
  // FocusedParadigm's per-form dedup, so only the remaining slots surface.
  const LUO_PRESENT_MP_PARTICIPLE =
    menosParticipleParadigm('λυό', 'λυο', 'present middle/passive participle');
  const LUO_AORIST_MIDDLE_PARTICIPLE =
    menosParticipleParadigm('λυσά', 'λυσα', 'aorist middle participle');
  const LUO_PRESENT_AORIST_MID_PARTICIPLE_OPTIONAL = [
    { chapter: 15, family: 'λύω — present middle/passive participle λυόμενος full declension (optional)',
      forms: LUO_PRESENT_MP_PARTICIPLE },
    { chapter: 15, family: 'λύω — aorist middle participle λυσάμενος full declension (optional)',
      forms: LUO_AORIST_MIDDLE_PARTICIPLE }
  ];

  // 2nd-aorist passive participle (-είς, θ-less: γραφείς). Same endings as the
  // θ-type aoristPassiveParticipleParadigm but on the bare 2nd-aorist stem, so
  // it parses as a plain "aorist passive participle".
  function eisParticipleParadigm(stem) {
    const s = stem;
    return {
      [`${s}είς`]:    'aorist passive participle nominative singular masculine',
      [`${s}έντος`]:  'aorist passive participle genitive singular masculine/neuter',
      [`${s}έντι`]:   'aorist passive participle dative singular masculine/neuter',
      [`${s}έντα`]:   'aorist passive participle accusative singular masculine',
      [`${s}έντες`]:  'aorist passive participle nominative plural masculine',
      [`${s}έντων`]:  'aorist passive participle genitive plural masculine/feminine/neuter',
      [`${s}εῖσι`]:   'aorist passive participle dative plural masculine/neuter',
      [`${s}εῖσιν`]:  'aorist passive participle dative plural masculine/neuter',
      [`${s}έντας`]:  'aorist passive participle accusative plural masculine',
      [`${s}εῖσα`]:   'aorist passive participle nominative singular feminine',
      [`${s}είσης`]:  'aorist passive participle genitive singular feminine',
      [`${s}είσῃ`]:   'aorist passive participle dative singular feminine',
      [`${s}εῖσαν`]:  'aorist passive participle accusative singular feminine',
      [`${s}εῖσαι`]:  'aorist passive participle nominative plural feminine',
      [`${s}εισῶν`]:  'aorist passive participle genitive plural feminine',
      [`${s}είσαις`]: 'aorist passive participle dative plural feminine',
      [`${s}είσας`]:  'aorist passive participle accusative plural feminine',
      [`${s}έν`]:     'aorist passive participle nominative/accusative singular neuter'
    };
  }

  const LEIPO_PRESENT_ACTIVE_PARTICIPLE   = presentActiveNtParticiple('λείπ', 'λειπ', 'λεῖπον');
  const LAMBANO_PRESENT_ACTIVE_PARTICIPLE = presentActiveNtParticiple('λαμβάν', 'λαμβαν', 'λαμβάνον');
  const LEGO_PRESENT_ACTIVE_PARTICIPLE    = presentActiveNtParticiple('λέγ', 'λεγ', 'λέγον');
  const ECHO_PRESENT_ACTIVE_PARTICIPLE    = presentActiveNtParticiple('ἔχ', 'ἐχ', 'ἔχον');
  const AGO_PRESENT_ACTIVE_PARTICIPLE     = presentActiveNtParticiple('ἄγ', 'ἀγ', 'ἄγον');
  const GINOSKO_PRESENT_ACTIVE_PARTICIPLE = presentActiveNtParticiple('γινώσκ', 'γινωσκ', 'γινῶσκον');
  const KRINO_PRESENT_ACTIVE_PARTICIPLE   = presentActiveNtParticiple('κρίν', 'κριν', 'κρῖνον');

  // ὁράω — present active participle ὁρῶν, an ‑άω contract (all-circumflex
  // masc/neut ‑ῶν/‑ῶντος; fem ‑ῶσα/‑ώσης), so it can't use the ντ-stem
  // helper. masc nom sg and neut nom/acc sg are both ὁρῶν; the key carries
  // the masc reading.
  const ORAO_PRESENT_ACTIVE_PARTICIPLE = {
    'ὁρῶν':     'present active participle nominative singular masculine',
    'ὁρῶντος':  'present active participle genitive singular masculine/neuter',
    'ὁρῶντι':   'present active participle dative singular masculine/neuter',
    'ὁρῶντα':   'present active participle accusative singular masculine',
    'ὁρῶντες':  'present active participle nominative plural masculine',
    'ὁρώντων':  'present active participle genitive plural masculine/feminine/neuter',
    'ὁρῶσι':    'present active participle dative plural masculine/neuter',
    'ὁρῶσιν':   'present active participle dative plural masculine/neuter',
    'ὁρῶντας':  'present active participle accusative plural masculine',
    'ὁρῶσα':    'present active participle nominative singular feminine',
    'ὁρώσης':   'present active participle genitive singular feminine',
    'ὁρώσῃ':    'present active participle dative singular feminine',
    'ὁρῶσαν':   'present active participle accusative singular feminine',
    'ὁρῶσαι':   'present active participle nominative plural feminine',
    'ὁρωσῶν':   'present active participle genitive plural feminine',
    'ὁρώσαις':  'present active participle dative plural feminine',
    'ὁρώσας':   'present active participle accusative plural feminine'
  };

  // ἔρχομαι — deponent, so its present participle is MIDDLE: ἐρχόμενος,
  // declining like λυόμενος / γενόμενος (regular ‑ος/‑η/‑ον). No present
  // active form exists.
  const ERCHOMAI_PRESENT_MIDDLE_PARTICIPLE = {
    'ἐρχόμενος':  'present middle participle nominative singular masculine',
    'ἐρχομένου':  'present middle participle genitive singular masculine/neuter',
    'ἐρχομένῳ':   'present middle participle dative singular masculine/neuter',
    'ἐρχόμενον':  'present middle participle accusative singular masculine/neuter',
    'ἐρχόμενε':   'present middle participle vocative singular masculine',
    'ἐρχόμενοι':  'present middle participle nominative plural masculine',
    'ἐρχομένους': 'present middle participle accusative plural masculine',
    'ἐρχομένων':  'present middle participle genitive plural masculine/feminine/neuter',
    'ἐρχομένοις': 'present middle participle dative plural masculine/neuter',
    'ἐρχομένη':   'present middle participle nominative singular feminine',
    'ἐρχομένης':  'present middle participle genitive singular feminine',
    'ἐρχομένῃ':   'present middle participle dative singular feminine',
    'ἐρχομένην':  'present middle participle accusative singular feminine',
    'ἐρχόμεναι':  'present middle participle nominative plural feminine',
    'ἐρχομέναις': 'present middle participle dative plural feminine',
    'ἐρχομένας':  'present middle participle accusative plural feminine',
    'ἐρχόμενα':   'present middle participle nominative/accusative plural neuter'
  };

  // First/second personal pronouns: the 1st-person singular oblique cases have
  // an accented (ἐμέ, ἐμοῦ, ἐμοί) and an enclitic (με, μου, μοι) spelling. The
  // paradigm vocab cards store both ("ἐμέ / με") but the parsing pipeline keeps
  // only the first (accented) form, so the enclitics are surfaced here for the
  // lookup/fallback. Same parse as their accented twins (no gender on personal
  // pronouns).
  const PERSONAL_PRONOUN_ENCLITICS = {
    'με':  'first person accusative singular',
    'μου': 'first person genitive singular',
    'μοι': 'first person dative singular'
  };

  // ─── Hand-authored optional coverage (no source paradigm in duff yet) ──
  //
  // These six verbs aren't paradigm exemplars in duff's morphology data, so
  // the optional groups below don't surface as drill cards today — but the
  // entries are registered (keyed by bare lemma, exactly like every other
  // inventory entry) so the fallback form-lookup resolves them and the drill
  // is ready the moment any of these lemmas gains paradigm tables. Ported from
  // Mounce PR #86; chapters remapped from Mounce's numbering back to Duff/BBG
  // (present 8–10, participle 12/14, passive system 15, subjunctive 17, μι 19)
  // and participle declensions split via participleOptionalGroups (nom-sg early
  // + full declension at Ch 14), the duff convention, instead of Mounce's
  // single flat groups.

  // ─── Contract verbs ἀγαπάω / ποιέω / πληρόω (present system) ───────
  //
  // The present system carries the contractions; future/aorist/perfect build
  // on the lengthened uncontracted stem (ἀγαπήσω, ἐποίησα) so they're regular
  // and left to the standard machinery. The present mid/pas participle uses the
  // λυόμενος (-μενος) pattern; the present active participle ships recognition
  // nominatives only (its full contracted -ῶν/-οῦντος declension is accent-
  // dense and deferred).

  // α-contract — ἀγαπάω
  const AGAPAO_PRESENT_MP_INDICATIVE = {
    'ἀγαπῶμαι':   'present middle/passive indicative first person singular',
    'ἀγαπᾶται':   'present middle/passive indicative third person singular',
    'ἀγαπώμεθα':  'present middle/passive indicative first person plural',
    'ἀγαπᾶσθε':   'present middle/passive indicative second person plural',
    'ἀγαπῶνται':  'present middle/passive indicative third person plural'
  };
  const AGAPAO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἠγάπων':    'imperfect active indicative first person singular',
    'ἠγάπας':    'imperfect active indicative second person singular',
    'ἠγάπα':     'imperfect active indicative third person singular',
    'ἠγαπῶμεν':  'imperfect active indicative first person plural',
    'ἠγαπᾶτε':   'imperfect active indicative second person plural'
  };
  const AGAPAO_IMPERFECT_MP_INDICATIVE = {
    'ἠγαπώμην':   'imperfect middle/passive indicative first person singular',
    'ἠγαπῶ':      'imperfect middle/passive indicative second person singular',
    'ἠγαπᾶτο':    'imperfect middle/passive indicative third person singular',
    'ἠγαπώμεθα':  'imperfect middle/passive indicative first person plural',
    'ἠγαπᾶσθε':   'imperfect middle/passive indicative second person plural',
    'ἠγαπῶντο':   'imperfect middle/passive indicative third person plural'
  };
  const AGAPAO_PRESENT_ACTIVE_INFINITIVE = { 'ἀγαπᾶν': 'present active infinitive' };
  const AGAPAO_PRESENT_MP_INFINITIVE = { 'ἀγαπᾶσθαι': 'present middle/passive infinitive' };
  const AGAPAO_PRESENT_MP_PARTICIPLE = menosParticipleParadigm('ἀγαπώ', 'ἀγαπω', 'present middle/passive participle');
  const AGAPAO_PRESENT_ACTIVE_PARTICIPLE_NOM = {
    'ἀγαπῶν':  'present active participle nominative singular masculine',
    'ἀγαπῶσα': 'present active participle nominative singular feminine'
  };
  const AGAPAO_EXTRA_FORMS = {
    ...AGAPAO_PRESENT_MP_INDICATIVE,
    ...AGAPAO_IMPERFECT_ACTIVE_INDICATIVE,
    ...AGAPAO_IMPERFECT_MP_INDICATIVE,
    ...AGAPAO_PRESENT_ACTIVE_INFINITIVE,
    ...AGAPAO_PRESENT_MP_INFINITIVE,
    ...AGAPAO_PRESENT_MP_PARTICIPLE,
    ...AGAPAO_PRESENT_ACTIVE_PARTICIPLE_NOM
  };
  const AGAPAO_OPTIONAL_GROUPS = [
    { chapter: 15, family: 'ἀγαπάω — present middle/passive indicative (optional)',
      forms: AGAPAO_PRESENT_MP_INDICATIVE },
    { chapter: 10, family: 'ἀγαπάω — imperfect active indicative (optional)',
      forms: AGAPAO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 15, family: 'ἀγαπάω — imperfect middle/passive indicative (optional)',
      forms: AGAPAO_IMPERFECT_MP_INDICATIVE },
    { chapter: 7, family: 'ἀγαπάω — present active infinitive ἀγαπᾶν (optional)',
      forms: AGAPAO_PRESENT_ACTIVE_INFINITIVE },
    { chapter: 7, family: 'ἀγαπάω — present middle/passive infinitive ἀγαπᾶσθαι (optional)',
      forms: AGAPAO_PRESENT_MP_INFINITIVE },
    ...participleOptionalGroups(12, 'ἀγαπάω — present active participle ἀγαπῶν',
      AGAPAO_PRESENT_ACTIVE_PARTICIPLE_NOM, { core: false }),
    ...participleOptionalGroups(15, 'ἀγαπάω — present middle/passive participle ἀγαπώμενος',
      AGAPAO_PRESENT_MP_PARTICIPLE, { core: false })
  ];

  // ε-contract — ποιέω
  const POIEO_PRESENT_MP_INDICATIVE = {
    'ποιοῦμαι':   'present middle/passive indicative first person singular',
    'ποιῇ':       'present middle/passive indicative second person singular',
    'ποιεῖται':   'present middle/passive indicative third person singular',
    'ποιούμεθα':  'present middle/passive indicative first person plural',
    'ποιεῖσθε':   'present middle/passive indicative second person plural',
    'ποιοῦνται':  'present middle/passive indicative third person plural'
  };
  const POIEO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἐποίουν':   'imperfect active indicative first person singular',
    'ἐποίεις':   'imperfect active indicative second person singular',
    'ἐποίει':    'imperfect active indicative third person singular',
    'ἐποιοῦμεν': 'imperfect active indicative first person plural',
    'ἐποιεῖτε':  'imperfect active indicative second person plural'
  };
  const POIEO_IMPERFECT_MP_INDICATIVE = {
    'ἐποιούμην':   'imperfect middle/passive indicative first person singular',
    'ἐποιοῦ':      'imperfect middle/passive indicative second person singular',
    'ἐποιεῖτο':    'imperfect middle/passive indicative third person singular',
    'ἐποιούμεθα':  'imperfect middle/passive indicative first person plural',
    'ἐποιεῖσθε':   'imperfect middle/passive indicative second person plural',
    'ἐποιοῦντο':   'imperfect middle/passive indicative third person plural'
  };
  const POIEO_PRESENT_ACTIVE_INFINITIVE = { 'ποιεῖν': 'present active infinitive' };
  const POIEO_PRESENT_MP_INFINITIVE = { 'ποιεῖσθαι': 'present middle/passive infinitive' };
  const POIEO_PRESENT_MP_PARTICIPLE = menosParticipleParadigm('ποιού', 'ποιου', 'present middle/passive participle');
  const POIEO_PRESENT_ACTIVE_PARTICIPLE_NOM = {
    'ποιῶν':   'present active participle nominative singular masculine',
    'ποιοῦσα': 'present active participle nominative singular feminine',
    'ποιοῦν':  'present active participle nominative/accusative singular neuter'
  };
  const POIEO_EXTRA_FORMS = {
    ...POIEO_PRESENT_MP_INDICATIVE,
    ...POIEO_IMPERFECT_ACTIVE_INDICATIVE,
    ...POIEO_IMPERFECT_MP_INDICATIVE,
    ...POIEO_PRESENT_ACTIVE_INFINITIVE,
    ...POIEO_PRESENT_MP_INFINITIVE,
    ...POIEO_PRESENT_MP_PARTICIPLE,
    ...POIEO_PRESENT_ACTIVE_PARTICIPLE_NOM
  };
  const POIEO_OPTIONAL_GROUPS = [
    { chapter: 15, family: 'ποιέω — present middle/passive indicative (optional)',
      forms: POIEO_PRESENT_MP_INDICATIVE },
    { chapter: 10, family: 'ποιέω — imperfect active indicative (optional)',
      forms: POIEO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 15, family: 'ποιέω — imperfect middle/passive indicative (optional)',
      forms: POIEO_IMPERFECT_MP_INDICATIVE },
    { chapter: 7, family: 'ποιέω — present active infinitive ποιεῖν (optional)',
      forms: POIEO_PRESENT_ACTIVE_INFINITIVE },
    { chapter: 7, family: 'ποιέω — present middle/passive infinitive ποιεῖσθαι (optional)',
      forms: POIEO_PRESENT_MP_INFINITIVE },
    ...participleOptionalGroups(12, 'ποιέω — present active participle ποιῶν',
      POIEO_PRESENT_ACTIVE_PARTICIPLE_NOM, { core: false }),
    ...participleOptionalGroups(15, 'ποιέω — present middle/passive participle ποιούμενος',
      POIEO_PRESENT_MP_PARTICIPLE, { core: false })
  ];

  // ο-contract — πληρόω
  const PLEROO_PRESENT_MP_INDICATIVE = {
    'πληροῦμαι':   'present middle/passive indicative first person singular',
    'πληροῦται':   'present middle/passive indicative third person singular',
    'πληρούμεθα':  'present middle/passive indicative first person plural',
    'πληροῦσθε':   'present middle/passive indicative second person plural',
    'πληροῦνται':  'present middle/passive indicative third person plural'
  };
  const PLEROO_IMPERFECT_ACTIVE_INDICATIVE = {
    'ἐπλήρουν':   'imperfect active indicative first person singular',
    'ἐπλήρους':   'imperfect active indicative second person singular',
    'ἐπλήρου':    'imperfect active indicative third person singular',
    'ἐπληροῦμεν': 'imperfect active indicative first person plural',
    'ἐπληροῦτε':  'imperfect active indicative second person plural'
  };
  const PLEROO_IMPERFECT_MP_INDICATIVE = {
    'ἐπληρούμην':   'imperfect middle/passive indicative first person singular',
    'ἐπληροῦ':      'imperfect middle/passive indicative second person singular',
    'ἐπληροῦτο':    'imperfect middle/passive indicative third person singular',
    'ἐπληρούμεθα':  'imperfect middle/passive indicative first person plural',
    'ἐπληροῦσθε':   'imperfect middle/passive indicative second person plural',
    'ἐπληροῦντο':   'imperfect middle/passive indicative third person plural'
  };
  const PLEROO_PRESENT_ACTIVE_INFINITIVE = { 'πληροῦν': 'present active infinitive' };
  const PLEROO_PRESENT_MP_INFINITIVE = { 'πληροῦσθαι': 'present middle/passive infinitive' };
  const PLEROO_PRESENT_MP_PARTICIPLE = menosParticipleParadigm('πληρού', 'πληρου', 'present middle/passive participle');
  const PLEROO_PRESENT_ACTIVE_PARTICIPLE_NOM = {
    'πληρῶν':   'present active participle nominative singular masculine',
    'πληροῦσα': 'present active participle nominative singular feminine',
    'πληροῦν':  'present active participle nominative/accusative singular neuter'
  };
  const PLEROO_EXTRA_FORMS = {
    ...PLEROO_PRESENT_MP_INDICATIVE,
    ...PLEROO_IMPERFECT_ACTIVE_INDICATIVE,
    ...PLEROO_IMPERFECT_MP_INDICATIVE,
    ...PLEROO_PRESENT_ACTIVE_INFINITIVE,
    ...PLEROO_PRESENT_MP_INFINITIVE,
    ...PLEROO_PRESENT_MP_PARTICIPLE,
    ...PLEROO_PRESENT_ACTIVE_PARTICIPLE_NOM
  };
  const PLEROO_OPTIONAL_GROUPS = [
    { chapter: 15, family: 'πληρόω — present middle/passive indicative (optional)',
      forms: PLEROO_PRESENT_MP_INDICATIVE },
    { chapter: 10, family: 'πληρόω — imperfect active indicative (optional)',
      forms: PLEROO_IMPERFECT_ACTIVE_INDICATIVE },
    { chapter: 15, family: 'πληρόω — imperfect middle/passive indicative (optional)',
      forms: PLEROO_IMPERFECT_MP_INDICATIVE },
    { chapter: 7, family: 'πληρόω — present active infinitive πληροῦν (optional)',
      forms: PLEROO_PRESENT_ACTIVE_INFINITIVE },
    { chapter: 7, family: 'πληρόω — present middle/passive infinitive πληροῦσθαι (optional)',
      forms: PLEROO_PRESENT_MP_INFINITIVE },
    ...participleOptionalGroups(12, 'πληρόω — present active participle πληρῶν',
      PLEROO_PRESENT_ACTIVE_PARTICIPLE_NOM, { core: false }),
    ...participleOptionalGroups(15, 'πληρόω — present middle/passive participle πληρούμενος',
      PLEROO_PRESENT_MP_PARTICIPLE, { core: false })
  ];

  // ─── γράφω (2nd aorist passive ἐγράφην, "to write") ───────────────
  //
  // Fills the non-indicative 2nd-aorist passive (subj γραφῶ / impv γράφηθι /
  // inf γραφῆναι / ptc γραφείς — θ-less -είς type) plus the present active
  // indicative. The 2nd-aorist passive non-indicatives parse as plain
  // "aorist passive". (Aorist passive indicative ἐγράφην is already drilled.)
  const GRAPHO_PRESENT_ACTIVE_INDICATIVE = {
    'γράφω':     'present active indicative first person singular',
    'γράφεις':   'present active indicative second person singular',
    'γράφει':    'present active indicative third person singular',
    'γράφομεν':  'present active indicative first person plural',
    'γράφετε':   'present active indicative second person plural',
    'γράφουσι':  'present active indicative third person plural',
    'γράφουσιν': 'present active indicative third person plural'
  };
  const GRAPHO_AORIST_PASSIVE_SUBJUNCTIVE = {
    'γραφῶ':    'aorist passive subjunctive first person singular',
    'γραφῇς':   'aorist passive subjunctive second person singular',
    'γραφῇ':    'aorist passive subjunctive third person singular',
    'γραφῶμεν': 'aorist passive subjunctive first person plural',
    'γραφῆτε':  'aorist passive subjunctive second person plural',
    'γραφῶσι':  'aorist passive subjunctive third person plural',
    'γραφῶσιν': 'aorist passive subjunctive third person plural'
  };
  const GRAPHO_AORIST_PASSIVE_IMPERATIVE = {
    'γράφηθι':     'aorist passive imperative second person singular',
    'γραφήτω':     'aorist passive imperative third person singular',
    'γράφητε':     'aorist passive imperative second person plural',
    'γραφήτωσαν':  'aorist passive imperative third person plural'
  };
  const GRAPHO_AORIST_PASSIVE_INFINITIVE = { 'γραφῆναι': 'aorist passive infinitive' };
  const GRAPHO_AORIST_PASSIVE_PARTICIPLE = eisParticipleParadigm('γραφ');
  const GRAPHO_EXTRA_FORMS = {
    ...GRAPHO_PRESENT_ACTIVE_INDICATIVE,
    ...GRAPHO_AORIST_PASSIVE_SUBJUNCTIVE,
    ...GRAPHO_AORIST_PASSIVE_IMPERATIVE,
    ...GRAPHO_AORIST_PASSIVE_INFINITIVE,
    ...GRAPHO_AORIST_PASSIVE_PARTICIPLE
  };
  const GRAPHO_OPTIONAL_GROUPS = [
    { chapter: 8, family: 'γράφω — present active indicative (optional)',
      forms: GRAPHO_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 17, family: 'γράφω — aorist passive subjunctive γραφῶ (optional)',
      forms: GRAPHO_AORIST_PASSIVE_SUBJUNCTIVE },
    { chapter: 15, family: 'γράφω — aorist passive imperative γράφηθι (optional)',
      forms: GRAPHO_AORIST_PASSIVE_IMPERATIVE },
    { chapter: 15, family: 'γράφω — aorist passive infinitive γραφῆναι (optional)',
      forms: GRAPHO_AORIST_PASSIVE_INFINITIVE },
    ...participleOptionalGroups(15, 'γράφω — aorist passive participle γραφείς',
      GRAPHO_AORIST_PASSIVE_PARTICIPLE, { core: false })
  ];

  // ─── πορεύομαι (middle deponent, "to go") ─────────────────────────
  //
  // Fills the present + imperfect middle indicative, the (passive-form) aorist
  // deponent ἐπορεύθην, the present/aorist infinitives + imperatives, and the
  // present middle + aorist passive participles. (Future middle πορεύσομαι is
  // already drilled.)
  const POREUOMAI_PRESENT_MP_INDICATIVE = {
    'πορεύομαι':   'present middle indicative first person singular',
    'πορεύῃ':      'present middle indicative second person singular',
    'πορεύεται':   'present middle indicative third person singular',
    'πορευόμεθα':  'present middle indicative first person plural',
    'πορεύεσθε':   'present middle indicative second person plural',
    'πορεύονται':  'present middle indicative third person plural'
  };
  const POREUOMAI_IMPERFECT_MP_INDICATIVE = {
    'ἐπορευόμην':  'imperfect middle indicative first person singular',
    'ἐπορεύου':    'imperfect middle indicative second person singular',
    'ἐπορεύετο':   'imperfect middle indicative third person singular',
    'ἐπορευόμεθα': 'imperfect middle indicative first person plural',
    'ἐπορεύεσθε':  'imperfect middle indicative second person plural',
    'ἐπορεύοντο':  'imperfect middle indicative third person plural'
  };
  const POREUOMAI_AORIST_PASSIVE_INDICATIVE = {
    'ἐπορεύθην':   'aorist passive indicative first person singular',
    'ἐπορεύθης':   'aorist passive indicative second person singular',
    'ἐπορεύθη':    'aorist passive indicative third person singular',
    'ἐπορεύθημεν': 'aorist passive indicative first person plural',
    'ἐπορεύθητε':  'aorist passive indicative second person plural',
    'ἐπορεύθησαν': 'aorist passive indicative third person plural'
  };
  const POREUOMAI_PRESENT_MP_INFINITIVE = { 'πορεύεσθαι': 'present middle infinitive' };
  const POREUOMAI_AORIST_PASSIVE_INFINITIVE = { 'πορευθῆναι': 'aorist passive infinitive' };
  const POREUOMAI_PRESENT_MP_IMPERATIVE = {
    'πορεύου':       'present middle imperative second person singular',
    'πορευέσθω':     'present middle imperative third person singular',
    'πορεύεσθε':     'present middle imperative second person plural',
    'πορευέσθωσαν':  'present middle imperative third person plural'
  };
  const POREUOMAI_AORIST_PASSIVE_IMPERATIVE = {
    'πορεύθητι':     'aorist passive imperative second person singular',
    'πορευθήτω':     'aorist passive imperative third person singular',
    'πορεύθητε':     'aorist passive imperative second person plural',
    'πορευθήτωσαν':  'aorist passive imperative third person plural'
  };
  const POREUOMAI_PRESENT_MP_PARTICIPLE = menosParticipleParadigm('πορευό', 'πορευο', 'present middle participle');
  const POREUOMAI_AORIST_PASSIVE_PARTICIPLE = aoristPassiveParticipleParadigm('πορευ');
  const POREUOMAI_EXTRA_FORMS = {
    ...POREUOMAI_PRESENT_MP_INDICATIVE,
    ...POREUOMAI_IMPERFECT_MP_INDICATIVE,
    ...POREUOMAI_AORIST_PASSIVE_INDICATIVE,
    ...POREUOMAI_PRESENT_MP_INFINITIVE,
    ...POREUOMAI_AORIST_PASSIVE_INFINITIVE,
    ...POREUOMAI_PRESENT_MP_IMPERATIVE,
    ...POREUOMAI_AORIST_PASSIVE_IMPERATIVE,
    ...POREUOMAI_PRESENT_MP_PARTICIPLE,
    ...POREUOMAI_AORIST_PASSIVE_PARTICIPLE
  };
  const POREUOMAI_OPTIONAL_GROUPS = [
    { chapter: 8, family: 'πορεύομαι — present middle indicative (optional)',
      forms: POREUOMAI_PRESENT_MP_INDICATIVE },
    { chapter: 8, family: 'πορεύομαι — imperfect middle indicative (optional)',
      forms: POREUOMAI_IMPERFECT_MP_INDICATIVE },
    { chapter: 15, family: 'πορεύομαι — aorist (passive-form) indicative ἐπορεύθην (optional)',
      forms: POREUOMAI_AORIST_PASSIVE_INDICATIVE },
    { chapter: 8, family: 'πορεύομαι — present middle infinitive πορεύεσθαι (optional)',
      forms: POREUOMAI_PRESENT_MP_INFINITIVE },
    { chapter: 15, family: 'πορεύομαι — aorist passive infinitive πορευθῆναι (optional)',
      forms: POREUOMAI_AORIST_PASSIVE_INFINITIVE },
    { chapter: 8, family: 'πορεύομαι — present middle imperative (optional)',
      forms: POREUOMAI_PRESENT_MP_IMPERATIVE },
    { chapter: 15, family: 'πορεύομαι — aorist passive imperative (optional)',
      forms: POREUOMAI_AORIST_PASSIVE_IMPERATIVE },
    ...participleOptionalGroups(12, 'πορεύομαι — present middle participle πορευόμενος',
      POREUOMAI_PRESENT_MP_PARTICIPLE, { core: false }),
    ...participleOptionalGroups(15, 'πορεύομαι — aorist passive participle πορευθείς',
      POREUOMAI_AORIST_PASSIVE_PARTICIPLE, { core: false })
  ];

  // ─── δείκνυμι (μι-verb, no reduplication, "to show") ──────────────
  //
  // Fills out the present active indicative + infinitive, the 1st-aorist active
  // ἔδειξα + infinitive, and the recognition nominatives of the present
  // (δεικνύς) and aorist (δείξας) active participles. Full μι-/-ας participle
  // declensions deferred (accent-dense). Everything gates at Ch 19 (μι-verbs),
  // so it's all in scope whenever δείκνυμι is.
  const DEIKNYMI_PRESENT_ACTIVE_INDICATIVE = {
    'δείκνυμι':   'present active indicative first person singular',
    'δείκνυς':    'present active indicative second person singular',
    'δείκνυσι':   'present active indicative third person singular',
    'δείκνυσιν':  'present active indicative third person singular',
    'δείκνυμεν':  'present active indicative first person plural',
    'δείκνυτε':   'present active indicative second person plural',
    'δεικνύασι':  'present active indicative third person plural',
    'δεικνύασιν': 'present active indicative third person plural'
  };
  const DEIKNYMI_PRESENT_ACTIVE_INFINITIVE = { 'δεικνύναι': 'present active infinitive' };
  const DEIKNYMI_AORIST_ACTIVE_INDICATIVE = {
    'ἔδειξα':    'aorist active indicative first person singular',
    'ἔδειξας':   'aorist active indicative second person singular',
    'ἔδειξε':    'aorist active indicative third person singular',
    'ἔδειξεν':   'aorist active indicative third person singular',
    'ἐδείξαμεν': 'aorist active indicative first person plural',
    'ἐδείξατε':  'aorist active indicative second person plural',
    'ἔδειξαν':   'aorist active indicative third person plural'
  };
  const DEIKNYMI_AORIST_ACTIVE_INFINITIVE = { 'δεῖξαι': 'aorist active infinitive' };
  const DEIKNYMI_PRESENT_ACTIVE_PARTICIPLE_NOM = {
    'δεικνύς':  'present active participle nominative singular masculine',
    'δεικνῦσα': 'present active participle nominative singular feminine',
    'δεικνύν':  'present active participle nominative/accusative singular neuter'
  };
  const DEIKNYMI_AORIST_ACTIVE_PARTICIPLE_NOM = {
    'δείξας':  'aorist active participle nominative singular masculine',
    'δείξασα': 'aorist active participle nominative singular feminine',
    'δεῖξαν':  'aorist active participle nominative/accusative singular neuter'
  };
  const DEIKNYMI_EXTRA_FORMS = {
    ...DEIKNYMI_PRESENT_ACTIVE_INDICATIVE,
    ...DEIKNYMI_PRESENT_ACTIVE_INFINITIVE,
    ...DEIKNYMI_AORIST_ACTIVE_INDICATIVE,
    ...DEIKNYMI_AORIST_ACTIVE_INFINITIVE,
    ...DEIKNYMI_PRESENT_ACTIVE_PARTICIPLE_NOM,
    ...DEIKNYMI_AORIST_ACTIVE_PARTICIPLE_NOM
  };
  const DEIKNYMI_OPTIONAL_GROUPS = [
    { chapter: 19, family: 'δείκνυμι — present active indicative (optional)',
      forms: DEIKNYMI_PRESENT_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'δείκνυμι — present active infinitive δεικνύναι (optional)',
      forms: DEIKNYMI_PRESENT_ACTIVE_INFINITIVE },
    { chapter: 19, family: 'δείκνυμι — aorist active indicative ἔδειξα (optional)',
      forms: DEIKNYMI_AORIST_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'δείκνυμι — aorist active infinitive δεῖξαι (optional)',
      forms: DEIKNYMI_AORIST_ACTIVE_INFINITIVE },
    ...participleOptionalGroups(19, 'δείκνυμι — present active participle δεικνύς',
      DEIKNYMI_PRESENT_ACTIVE_PARTICIPLE_NOM, { core: false }),
    ...participleOptionalGroups(19, 'δείκνυμι — aorist active participle δείξας',
      DEIKNYMI_AORIST_ACTIVE_PARTICIPLE_NOM, { core: false })
  ];

  // ─── Optative mood (Duff Ch 20) ───────────────────────────────────────
  //
  // The optative is introduced in Ch 20 but is vanishingly rare in the NT
  // (~68 of 28,000+ verbs). Only a handful of forms actually occur in the
  // GNT — γένοιτο (γίνομαι, the "μὴ γένοιτο" of Paul), εἴη (εἰμί, always 3sg),
  // and δῴη (δίδωμι, the benediction "may the Lord grant") — plus a model
  // λύω / ῥύομαι form. Those required forms live as starred drill cards in
  // the W8_OPTATIVE_NT_FORMS supplemental set; everything below is the FULL
  // paradigm parked in the OPTIONAL pool (non-core groups, chapter 20), so a
  // student turning on "Optional paradigm" at Ch 20 can browse/drill the
  // complete optative without a NT class being forced to memorise it.
  //
  // No augment (like the subjunctive); the iota mood-sign is the tell —
  // ‑οι‑ (present/future), ‑αι‑ (1st aorist), ‑ει‑/‑ιη‑ (aorist passive,
  // athematic). Forms verbatim from the reference grammar's optative tables;
  // shorter/longer or thematic/athematic doublets keep the primary form in
  // the drill group and the alternate in extraForms (lookup resolves both).
  // No future/perfect non-indicative *gap* applies — the optative is the one
  // mood that keeps a future (λύσοιμι); only imperfect/pluperfect are barred
  // (handled in morph_steps.STRUCTURAL_TENSE_MOOD_IMPOSSIBILITIES).

  // λύω — model regular ω-verb, all voices.
  const LUO_PRESENT_ACTIVE_OPTATIVE = {
    'λύοιμι':   'present active optative first person singular',
    'λύοις':    'present active optative second person singular',
    'λύοι':     'present active optative third person singular',
    'λύοιμεν':  'present active optative first person plural',
    'λύοιτε':   'present active optative second person plural',
    'λύοιεν':   'present active optative third person plural'
  };
  const LUO_FUTURE_ACTIVE_OPTATIVE = {
    'λύσοιμι':   'future active optative first person singular',
    'λύσοις':    'future active optative second person singular',
    'λύσοι':     'future active optative third person singular',
    'λύσοιμεν':  'future active optative first person plural',
    'λύσοιτε':   'future active optative second person plural',
    'λύσοιεν':   'future active optative third person plural'
  };
  const LUO_AORIST_ACTIVE_OPTATIVE = {
    'λύσαιμι':   'aorist active optative first person singular',
    'λύσαις':    'aorist active optative second person singular',
    // λύσαι (acute) = aorist active optative 3sg; distinct in accent from the
    // drilled infinitive λῦσαι (circumflex) and the middle imperative λῦσαι.
    'λύσαι':     'aorist active optative third person singular',
    'λύσαιμεν':  'aorist active optative first person plural',
    'λύσαιτε':   'aorist active optative second person plural',
    'λύσαιεν':   'aorist active optative third person plural'
  };
  const LUO_PRESENT_MP_OPTATIVE = {
    'λυοίμην':   'present middle/passive optative first person singular',
    'λύοιο':     'present middle/passive optative second person singular',
    'λύοιτο':    'present middle/passive optative third person singular',
    'λυοίμεθα':  'present middle/passive optative first person plural',
    'λύοισθε':   'present middle/passive optative second person plural',
    'λύοιντο':   'present middle/passive optative third person plural'
  };
  const LUO_FUTURE_MIDDLE_OPTATIVE = {
    'λυσοίμην':   'future middle optative first person singular',
    'λύσοιο':     'future middle optative second person singular',
    'λύσοιτο':    'future middle optative third person singular',
    'λυσοίμεθα':  'future middle optative first person plural',
    'λύσοισθε':   'future middle optative second person plural',
    'λύσοιντο':   'future middle optative third person plural'
  };
  const LUO_AORIST_MIDDLE_OPTATIVE = {
    'λυσαίμην':   'aorist middle optative first person singular',
    'λύσαιο':     'aorist middle optative second person singular',
    'λύσαιτο':    'aorist middle optative third person singular',
    'λυσαίμεθα':  'aorist middle optative first person plural',
    'λύσαισθε':   'aorist middle optative second person plural',
    'λύσαιντο':   'aorist middle optative third person plural'
  };
  const LUO_FUTURE_PASSIVE_OPTATIVE = {
    'λυθησοίμην':   'future passive optative first person singular',
    'λυθήσοιο':     'future passive optative second person singular',
    'λυθήσοιτο':    'future passive optative third person singular',
    'λυθησοίμεθα':  'future passive optative first person plural',
    'λυθήσοισθε':   'future passive optative second person plural',
    'λυθήσοιντο':   'future passive optative third person plural'
  };
  const LUO_AORIST_PASSIVE_OPTATIVE = {
    'λυθείην':   'aorist passive optative first person singular',
    'λυθείης':   'aorist passive optative second person singular',
    'λυθείη':    'aorist passive optative third person singular',
    'λυθεῖμεν':  'aorist passive optative first person plural',
    'λυθεῖτε':   'aorist passive optative second person plural',
    'λυθεῖεν':   'aorist passive optative third person plural'
  };
  const LUO_PERFECT_ACTIVE_OPTATIVE = {
    'λελύκοιμι':   'perfect active optative first person singular',
    'λελύκοις':    'perfect active optative second person singular',
    'λελύκοι':     'perfect active optative third person singular',
    'λελύκοιμεν':  'perfect active optative first person plural',
    'λελύκοιτε':   'perfect active optative second person plural',
    'λελύκοιεν':   'perfect active optative third person plural'
  };
  // Aeolic/athematic doublets (lookup-only): the ‑ειας/‑ειε/‑ειαν 1st-aorist
  // active alternates and the longer ‑ίημεν/‑ίητε/‑ίησαν aorist passive forms.
  const LUO_OPTATIVE_EXTRA = {
    'λύσειας':     'aorist active optative second person singular',
    'λύσειε':      'aorist active optative third person singular',
    'λύσειεν':     'aorist active optative third person singular',
    'λύσειαν':     'aorist active optative third person plural',
    'λυθείημεν':   'aorist passive optative first person plural',
    'λυθείητε':    'aorist passive optative second person plural',
    'λυθείησαν':   'aorist passive optative third person plural'
  };
  const LUO_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'λύω — present active optative (optional)',  forms: LUO_PRESENT_ACTIVE_OPTATIVE },
    { chapter: 20, family: 'λύω — future active optative (optional)',   forms: LUO_FUTURE_ACTIVE_OPTATIVE },
    { chapter: 20, family: 'λύω — aorist active optative (optional)',   forms: LUO_AORIST_ACTIVE_OPTATIVE },
    { chapter: 20, family: 'λύω — present middle/passive optative (optional)', forms: LUO_PRESENT_MP_OPTATIVE },
    { chapter: 20, family: 'λύω — future middle optative (optional)',   forms: LUO_FUTURE_MIDDLE_OPTATIVE },
    { chapter: 20, family: 'λύω — aorist middle optative (optional)',   forms: LUO_AORIST_MIDDLE_OPTATIVE },
    { chapter: 20, family: 'λύω — future passive optative (optional)',  forms: LUO_FUTURE_PASSIVE_OPTATIVE },
    { chapter: 20, family: 'λύω — aorist passive optative (optional)',  forms: LUO_AORIST_PASSIVE_OPTATIVE },
    { chapter: 20, family: 'λύω — perfect active optative (optional)',  forms: LUO_PERFECT_ACTIVE_OPTATIVE }
  ];

  // ῥύομαι — model middle/deponent.
  const RHUOMAI_PRESENT_MIDDLE_OPTATIVE = {
    'ῥυοίμην':   'present middle optative first person singular',
    'ῥύοιο':     'present middle optative second person singular',
    'ῥύοιτο':    'present middle optative third person singular',
    'ῥυοίμεθα':  'present middle optative first person plural',
    'ῥύοισθε':   'present middle optative second person plural',
    'ῥύοιντο':   'present middle optative third person plural'
  };
  const RHUOMAI_AORIST_MIDDLE_OPTATIVE = {
    'ῥυσαίμην':   'aorist middle optative first person singular',
    'ῥύσαιο':     'aorist middle optative second person singular',
    'ῥύσαιτο':    'aorist middle optative third person singular',
    'ῥυσαίμεθα':  'aorist middle optative first person plural',
    'ῥύσαισθε':   'aorist middle optative second person plural',
    'ῥύσαιντο':   'aorist middle optative third person plural'
  };
  const RHUOMAI_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'ῥύομαι — present middle optative (optional)', forms: RHUOMAI_PRESENT_MIDDLE_OPTATIVE },
    { chapter: 20, family: 'ῥύομαι — aorist middle optative (optional)',  forms: RHUOMAI_AORIST_MIDDLE_OPTATIVE }
  ];

  // εἰμί — present active optative (εἴην series; the NT only ever shows the
  // 3sg εἴη) and the deponent future middle optative (ἐσοίμην series).
  const EIMI_PRESENT_ACTIVE_OPTATIVE = {
    'εἴην':   'present active optative first person singular',
    'εἴης':   'present active optative second person singular',
    'εἴη':    'present active optative third person singular',
    'εἶμεν':  'present active optative first person plural',
    'εἶτε':   'present active optative second person plural',
    'εἶεν':   'present active optative third person plural'
  };
  const EIMI_FUTURE_MIDDLE_OPTATIVE = {
    'ἐσοίμην':   'future middle optative first person singular',
    'ἔσοιο':     'future middle optative second person singular',
    'ἔσοιτο':    'future middle optative third person singular',
    'ἐσοίμεθα':  'future middle optative first person plural',
    'ἔσοισθε':   'future middle optative second person plural',
    'ἔσοιντο':   'future middle optative third person plural'
  };
  const EIMI_OPTATIVE_EXTRA = {
    'εἴημεν':  'present active optative first person plural',
    'εἴητε':   'present active optative second person plural',
    'εἴησαν':  'present active optative third person plural'
  };
  const EIMI_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'εἰμί — present optative (optional)',        forms: EIMI_PRESENT_ACTIVE_OPTATIVE },
    { chapter: 20, family: 'εἰμί — future middle optative (optional)',  forms: EIMI_FUTURE_MIDDLE_OPTATIVE }
  ];

  // δίδωμι — athematic present (διδοίην) + root-aorist (δοίην) optative. NT
  // attests the aorist 3sg δῴη ("may he grant"); the regular δοίη is below.
  const DIDOMI_PRESENT_ACTIVE_OPTATIVE = {
    'διδοίην':   'present active optative first person singular',
    'διδοίης':   'present active optative second person singular',
    'διδοίη':    'present active optative third person singular',
    'διδοῖμεν':  'present active optative first person plural',
    'διδοῖτε':   'present active optative second person plural',
    'διδοῖεν':   'present active optative third person plural'
  };
  const DIDOMI_AORIST_ACTIVE_OPTATIVE = {
    'δοίην':   'aorist active optative first person singular',
    'δοίης':   'aorist active optative second person singular',
    'δοίη':    'aorist active optative third person singular',
    'δοῖμεν':  'aorist active optative first person plural',
    'δοῖτε':   'aorist active optative second person plural',
    'δοῖεν':   'aorist active optative third person plural'
  };
  const DIDOMI_OPTATIVE_EXTRA = {
    'διδοῖ':  'present active optative third person singular'
  };
  const DIDOMI_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'δίδωμι — present active optative (optional)', forms: DIDOMI_PRESENT_ACTIVE_OPTATIVE },
    { chapter: 20, family: 'δίδωμι — aorist active optative (optional)',  forms: DIDOMI_AORIST_ACTIVE_OPTATIVE }
  ];

  // γίνομαι — aorist middle optative (stem γεν‑, the strong aorist ἐγενόμην);
  // the 3sg γένοιτο is the NT's most common optative (μὴ γένοιτο). Parsed as
  // plain 'aorist' — the drill collapses the first/second-aorist distinction.
  const GINOMAI_AORIST_MIDDLE_OPTATIVE = {
    'γενοίμην':   'aorist middle optative first person singular',
    'γένοιο':     'aorist middle optative second person singular',
    'γένοιτο':    'aorist middle optative third person singular',
    'γενοίμεθα':  'aorist middle optative first person plural',
    'γένοισθε':   'aorist middle optative second person plural',
    'γένοιντο':   'aorist middle optative third person plural'
  };
  const GINOMAI_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'γίνομαι — aorist middle optative (optional)', forms: GINOMAI_AORIST_MIDDLE_OPTATIVE }
  ];

  // ποιέω — contract (ε) model: present active/middle + future active optative.
  const POIEO_PRESENT_ACTIVE_OPTATIVE = {
    'ποιοίην':   'present active optative first person singular',
    'ποιοίης':   'present active optative second person singular',
    'ποιοίη':    'present active optative third person singular',
    'ποιοῖμεν':  'present active optative first person plural',
    'ποιοῖτε':   'present active optative second person plural',
    'ποιοῖεν':   'present active optative third person plural'
  };
  const POIEO_PRESENT_MP_OPTATIVE = {
    'ποιοίμην':   'present middle/passive optative first person singular',
    'ποιοῖο':     'present middle/passive optative second person singular',
    'ποιοῖτο':    'present middle/passive optative third person singular',
    'ποιοίμεθα':  'present middle/passive optative first person plural',
    'ποιοῖσθε':   'present middle/passive optative second person plural',
    'ποιοῖντο':   'present middle/passive optative third person plural'
  };
  const POIEO_FUTURE_ACTIVE_OPTATIVE = {
    'ποιήσοιμι':   'future active optative first person singular',
    'ποιήσοις':    'future active optative second person singular',
    'ποιήσοι':     'future active optative third person singular',
    'ποιήσοιμεν':  'future active optative first person plural',
    'ποιήσοιτε':   'future active optative second person plural',
    'ποιήσοιεν':   'future active optative third person plural'
  };
  const POIEO_OPTATIVE_EXTRA = {
    'ποιοῖ':  'present active optative third person singular'
  };
  const POIEO_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'ποιέω — present active optative (optional)',        forms: POIEO_PRESENT_ACTIVE_OPTATIVE },
    { chapter: 20, family: 'ποιέω — present middle/passive optative (optional)', forms: POIEO_PRESENT_MP_OPTATIVE },
    { chapter: 20, family: 'ποιέω — future active optative (optional)',         forms: POIEO_FUTURE_ACTIVE_OPTATIVE }
  ];

  // λαμβάνω — aorist active optative λάβοιμι (stem λαβ‑, the strong aorist
  // ἔλαβον; parsed as plain 'aorist').
  const LAMBANO_AORIST_ACTIVE_OPTATIVE = {
    'λάβοιμι':   'aorist active optative first person singular',
    'λάβοις':    'aorist active optative second person singular',
    'λάβοι':     'aorist active optative third person singular',
    'λάβοιμεν':  'aorist active optative first person plural',
    'λάβοιτε':   'aorist active optative second person plural',
    'λάβοιεν':   'aorist active optative third person plural'
  };
  const LAMBANO_OPTATIVE_GROUPS = [
    { chapter: 20, family: 'λαμβάνω — aorist active optative (optional)', forms: LAMBANO_AORIST_ACTIVE_OPTATIVE }
  ];

  // Flat optative maps spread into each lemma's extraForms so the fallback
  // form-lookup resolves an optative pick even when the "Optional paradigm"
  // toggle is off (mirrors how the subjunctive sits in both the groups and
  // extraForms). All keys are distinct Greek strings — the iota mood-sign
  // keeps them clear of the subjunctive (η/ω) and indicative forms.
  const LUO_OPTATIVE_ALL = {
    ...LUO_PRESENT_ACTIVE_OPTATIVE, ...LUO_FUTURE_ACTIVE_OPTATIVE, ...LUO_AORIST_ACTIVE_OPTATIVE,
    ...LUO_PRESENT_MP_OPTATIVE, ...LUO_FUTURE_MIDDLE_OPTATIVE, ...LUO_AORIST_MIDDLE_OPTATIVE,
    ...LUO_FUTURE_PASSIVE_OPTATIVE, ...LUO_AORIST_PASSIVE_OPTATIVE, ...LUO_PERFECT_ACTIVE_OPTATIVE,
    ...LUO_OPTATIVE_EXTRA
  };
  const RHUOMAI_OPTATIVE_ALL = { ...RHUOMAI_PRESENT_MIDDLE_OPTATIVE, ...RHUOMAI_AORIST_MIDDLE_OPTATIVE };
  const EIMI_OPTATIVE_ALL = { ...EIMI_PRESENT_ACTIVE_OPTATIVE, ...EIMI_FUTURE_MIDDLE_OPTATIVE, ...EIMI_OPTATIVE_EXTRA };
  const DIDOMI_OPTATIVE_ALL = { ...DIDOMI_PRESENT_ACTIVE_OPTATIVE, ...DIDOMI_AORIST_ACTIVE_OPTATIVE, ...DIDOMI_OPTATIVE_EXTRA };
  const GINOMAI_OPTATIVE_ALL = { ...GINOMAI_AORIST_MIDDLE_OPTATIVE };
  const POIEO_OPTATIVE_ALL = { ...POIEO_PRESENT_ACTIVE_OPTATIVE, ...POIEO_PRESENT_MP_OPTATIVE, ...POIEO_FUTURE_ACTIVE_OPTATIVE, ...POIEO_OPTATIVE_EXTRA };
  const LAMBANO_OPTATIVE_ALL = { ...LAMBANO_AORIST_ACTIVE_OPTATIVE };

  // ─── δύναμαι (deponent -μαι verb, Ch 18) optional / lookup forms ────
  // Required drill (W7_DUNAMAI_*): present/imperfect/future/aorist indicative,
  // present infinitive + participle (nom. masc.), present subjunctive. These
  // add the rest: the present participle's full declension, and the rarer
  // (passive-deponent) aorist infinitive / subjunctive / participle. Present
  // participle declines like λυόμενος; the aorist non-finite forms take the
  // -θη-/-θε- (aorist passive) shape, like δυνηθείς / δυνηθῆναι.
  const DUNAMAI_PRESENT_MP_PARTICIPLE = {
    'δυνάμενος':  'present middle/passive participle nominative singular masculine',
    'δυναμένου':  'present middle/passive participle genitive singular masculine/neuter',
    'δυναμένῳ':   'present middle/passive participle dative singular masculine/neuter',
    'δυνάμενον':  'present middle/passive participle accusative singular masculine/neuter',
    'δυνάμενε':   'present middle/passive participle vocative singular masculine',
    'δυνάμενοι':  'present middle/passive participle nominative plural masculine',
    'δυναμένους': 'present middle/passive participle accusative plural masculine',
    'δυναμένων':  'present middle/passive participle genitive plural masculine/feminine/neuter',
    'δυναμένοις': 'present middle/passive participle dative plural masculine/neuter',
    'δυναμένη':   'present middle/passive participle nominative singular feminine',
    'δυναμένης':  'present middle/passive participle genitive singular feminine',
    'δυναμένῃ':   'present middle/passive participle dative singular feminine',
    'δυναμένην':  'present middle/passive participle accusative singular feminine',
    'δυνάμεναι':  'present middle/passive participle nominative plural feminine',
    'δυναμέναις': 'present middle/passive participle dative plural feminine',
    'δυναμένας':  'present middle/passive participle accusative plural feminine',
    'δυνάμενα':   'present middle/passive participle nominative/accusative plural neuter'
  };
  const DUNAMAI_AORIST_PASSIVE_INFINITIVE = {
    'δυνηθῆναι': 'aorist passive infinitive'
  };
  const DUNAMAI_AORIST_PASSIVE_SUBJUNCTIVE = {
    'δυνηθῶ':      'aorist passive subjunctive first person singular',
    'δυνηθῇς':     'aorist passive subjunctive second person singular',
    'δυνηθῇ':      'aorist passive subjunctive third person singular',
    'δυνηθῶμεν':   'aorist passive subjunctive first person plural',
    'δυνηθῆτε':    'aorist passive subjunctive second person plural',
    'δυνηθῶσι(ν)': 'aorist passive subjunctive third person plural'
  };
  // Aorist passive participle δυνηθείς — nominative forms only (rare; the full
  // 3rd-decl. declension isn't worth the table for a form this scarce).
  const DUNAMAI_AORIST_PASSIVE_PARTICIPLE = {
    'δυνηθείς':  'aorist passive participle nominative singular masculine',
    'δυνηθεῖσα': 'aorist passive participle nominative singular feminine',
    'δυνηθέν':   'aorist passive participle nominative/accusative singular neuter'
  };
  const DUNAMAI_EXTRA_FORMS = {
    ...DUNAMAI_PRESENT_MP_PARTICIPLE,
    ...DUNAMAI_AORIST_PASSIVE_INFINITIVE,
    ...DUNAMAI_AORIST_PASSIVE_SUBJUNCTIVE,
    ...DUNAMAI_AORIST_PASSIVE_PARTICIPLE
  };
  const DUNAMAI_OPTIONAL_GROUPS = [
    { chapter: 18, family: 'δύναμαι — aorist passive infinitive (optional)',
      forms: DUNAMAI_AORIST_PASSIVE_INFINITIVE },
    { chapter: 18, family: 'δύναμαι — aorist passive subjunctive (optional)',
      forms: DUNAMAI_AORIST_PASSIVE_SUBJUNCTIVE },
    { chapter: 18, family: 'δύναμαι — aorist passive participle δυνηθείς (optional)',
      forms: DUNAMAI_AORIST_PASSIVE_PARTICIPLE },
    ...participleOptionalGroups(18, 'δύναμαι — present middle/passive participle',
      DUNAMAI_PRESENT_MP_PARTICIPLE, { core: false })
  ];

  // ─── οἶδα (defective second perfect, Ch 18) optional / lookup forms ─
  // Required drill (W7_OIDA_*): perfect + pluperfect indicative, the
  // infinitive (εἰδέναι), and the participle's nom. masc. (εἰδώς / εἰδότες).
  // These add the perfect subjunctive, imperative, and the participle's full
  // declension.
  // οἶδα is morphologically perfect throughout (present in meaning), active-
  // only, with no present/imperfect/aorist forms — see its impossible* lists.
  const OIDA_PERFECT_SUBJUNCTIVE = {
    'εἰδῶ':      'perfect active subjunctive first person singular',
    'εἰδῇς':     'perfect active subjunctive second person singular',
    'εἰδῇ':      'perfect active subjunctive third person singular',
    'εἰδῶμεν':   'perfect active subjunctive first person plural',
    'εἰδῆτε':    'perfect active subjunctive second person plural',
    'εἰδῶσι(ν)': 'perfect active subjunctive third person plural'
  };
  const OIDA_PERFECT_IMPERATIVE = {
    'ἴσθι':    'perfect active imperative second person singular',
    'ἴστω':    'perfect active imperative third person singular',
    'ἴστε':    'perfect active imperative second person plural',
    'ἴστωσαν': 'perfect active imperative third person plural'
  };
  const OIDA_PERFECT_INFINITIVE = {
    'εἰδέναι': 'perfect active infinitive'
  };
  // Perfect active participle εἰδώς / εἰδυῖα / εἰδός (stem εἰδοτ-), declining
  // like λελυκώς. Gen. pl. splits by gender (masc./neut. εἰδότων vs fem.
  // εἰδυιῶν). Syncretic keys (εἰδότα masc. acc. sg. = neut. nom./acc. pl.;
  // εἰδυίας fem. gen. sg. = fem. acc. pl.) carry the more common parse.
  const OIDA_PERFECT_ACTIVE_PARTICIPLE = {
    'εἰδώς':     'perfect active participle nominative singular masculine',
    'εἰδότα':    'perfect active participle accusative singular masculine',
    'εἰδότος':   'perfect active participle genitive singular masculine/neuter',
    'εἰδότι':    'perfect active participle dative singular masculine/neuter',
    'εἰδότες':   'perfect active participle nominative plural masculine',
    'εἰδότας':   'perfect active participle accusative plural masculine',
    'εἰδότων':   'perfect active participle genitive plural masculine/neuter',
    'εἰδόσι(ν)': 'perfect active participle dative plural masculine/neuter',
    'εἰδυῖα':    'perfect active participle nominative singular feminine',
    'εἰδυίας':   'perfect active participle genitive singular feminine',
    'εἰδυίᾳ':    'perfect active participle dative singular feminine',
    'εἰδυῖαν':   'perfect active participle accusative singular feminine',
    'εἰδυῖαι':   'perfect active participle nominative plural feminine',
    'εἰδυιῶν':   'perfect active participle genitive plural feminine',
    'εἰδυίαις':  'perfect active participle dative plural feminine',
    'εἰδός':     'perfect active participle nominative/accusative singular neuter'
  };
  const OIDA_EXTRA_FORMS = {
    ...OIDA_PERFECT_SUBJUNCTIVE,
    ...OIDA_PERFECT_IMPERATIVE,
    ...OIDA_PERFECT_INFINITIVE,
    ...OIDA_PERFECT_ACTIVE_PARTICIPLE
  };
  // The infinitive εἰδέναι is a REQUIRED drill form (W7_OIDA_INFINITIVE), so it
  // is NOT an optional group — but it stays in OIDA_EXTRA_FORMS above for the
  // lookup/fallback pool.
  const OIDA_OPTIONAL_GROUPS = [
    { chapter: 18, family: 'οἶδα — perfect subjunctive (optional)',
      forms: OIDA_PERFECT_SUBJUNCTIVE },
    { chapter: 18, family: 'οἶδα — perfect imperative ἴσθι (optional)',
      forms: OIDA_PERFECT_IMPERATIVE },
    ...participleOptionalGroups(18, 'οἶδα — perfect active participle εἰδώς',
      OIDA_PERFECT_ACTIVE_PARTICIPLE, { core: false })
  ];

  // ═══ Principal-parts sweep ═══════════════════════════════════════════
  // Full perfect / aorist-passive / etc. paradigms for verbs whose six
  // principal parts weren't all present in parsing. The 1sg principal parts +
  // present infinitive are wired into each lemma's entry as `core: true` groups
  // (required, chapter-gated); these full paradigms ride along as optional /
  // extraForms for wrong-pick feedback + lookup.

  // ── κρίνω (liquid; transitive, so all six parts exist) ──
  const KRINO_PERFECT_ACTIVE_INDICATIVE = {
    'κέκρικα':      'perfect active indicative first person singular',
    'κέκρικας':     'perfect active indicative second person singular',
    'κέκρικε(ν)':   'perfect active indicative third person singular',
    'κεκρίκαμεν':   'perfect active indicative first person plural',
    'κεκρίκατε':    'perfect active indicative second person plural',
    'κεκρίκασι(ν)': 'perfect active indicative third person plural'
  };
  const KRINO_PERFECT_MP_INDICATIVE = {
    'κέκριμαι':  'perfect middle/passive indicative first person singular',
    'κέκρισαι':  'perfect middle/passive indicative second person singular',
    'κέκριται':  'perfect middle/passive indicative third person singular',
    'κεκρίμεθα': 'perfect middle/passive indicative first person plural',
    'κέκρισθε':  'perfect middle/passive indicative second person plural',
    'κέκρινται': 'perfect middle/passive indicative third person plural'
  };
  const KRINO_AORIST_PASSIVE_INDICATIVE = {
    'ἐκρίθην':   'aorist passive indicative first person singular',
    'ἐκρίθης':   'aorist passive indicative second person singular',
    'ἐκρίθη':    'aorist passive indicative third person singular',
    'ἐκρίθημεν': 'aorist passive indicative first person plural',
    'ἐκρίθητε':  'aorist passive indicative second person plural',
    'ἐκρίθησαν': 'aorist passive indicative third person plural'
  };
  const KRINO_PP_CORE = [
    { chapter: 7,  core: true, family: 'κρίνω — present infinitive (required)',
      forms: { 'κρίνειν': 'present active infinitive' } },
    { chapter: 15, core: true, family: 'κρίνω — aorist passive principal part (required)',
      forms: { 'ἐκρίθην': 'aorist passive indicative first person singular' } },
    { chapter: 16, core: true, family: 'κρίνω — perfect active principal part (required)',
      forms: { 'κέκρικα': 'perfect active indicative first person singular' } },
    { chapter: 16, core: true, family: 'κρίνω — perfect middle/passive principal part (required)',
      forms: { 'κέκριμαι': 'perfect middle/passive indicative first person singular' } },
    { chapter: 15, family: 'κρίνω — aorist passive indicative (optional)', forms: KRINO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 16, family: 'κρίνω — perfect active indicative (optional)', forms: KRINO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 16, family: 'κρίνω — perfect middle/passive indicative (optional)', forms: KRINO_PERFECT_MP_INDICATIVE }
  ];
  const KRINO_PP_EXTRA = { ...KRINO_AORIST_PASSIVE_INDICATIVE, ...KRINO_PERFECT_ACTIVE_INDICATIVE, ...KRINO_PERFECT_MP_INDICATIVE };

  // ── μένω (liquid; intransitive → no perfect m/p, no aorist passive) ──
  const MENO_AORIST_ACTIVE_INDICATIVE = {
    'ἔμεινα':    'aorist active indicative first person singular',
    'ἔμεινας':   'aorist active indicative second person singular',
    'ἔμεινε(ν)': 'aorist active indicative third person singular',
    'ἐμείναμεν': 'aorist active indicative first person plural',
    'ἐμείνατε':  'aorist active indicative second person plural',
    'ἔμειναν':   'aorist active indicative third person plural'
  };
  const MENO_PERFECT_ACTIVE_INDICATIVE = {
    'μεμένηκα':      'perfect active indicative first person singular',
    'μεμένηκας':     'perfect active indicative second person singular',
    'μεμένηκε(ν)':   'perfect active indicative third person singular',
    'μεμενήκαμεν':   'perfect active indicative first person plural',
    'μεμενήκατε':    'perfect active indicative second person plural',
    'μεμενήκασι(ν)': 'perfect active indicative third person plural'
  };
  const MENO_PP_CORE = [
    { chapter: 7,  core: true, family: 'μένω — present infinitive (required)',
      forms: { 'μένειν': 'present active infinitive' } },
    { chapter: 11, core: true, family: 'μένω — aorist active principal part (required)',
      forms: { 'ἔμεινα': 'aorist active indicative first person singular' } },
    { chapter: 16, core: true, family: 'μένω — perfect active principal part (required)',
      forms: { 'μεμένηκα': 'perfect active indicative first person singular' } },
    { chapter: 11, family: 'μένω — aorist active indicative (optional)', forms: MENO_AORIST_ACTIVE_INDICATIVE },
    { chapter: 16, family: 'μένω — perfect active indicative (optional)', forms: MENO_PERFECT_ACTIVE_INDICATIVE }
  ];
  const MENO_PP_EXTRA = { ...MENO_AORIST_ACTIVE_INDICATIVE, ...MENO_PERFECT_ACTIVE_INDICATIVE };

  // ── μι-verbs (introduced Ch 19, so every part gates there) ──
  // Not deponent (‑μι), so perfect m/p and aorist passive parse normally.
  // Future / aorist-passive full paradigms already exist (optional); here we add
  // the missing perfect paradigms + the 1sg principal parts as required core.
  const DIDOMI_PERFECT_MP_INDICATIVE = {
    'δέδομαι':  'perfect middle/passive indicative first person singular',
    'δέδοσαι':  'perfect middle/passive indicative second person singular',
    'δέδοται':  'perfect middle/passive indicative third person singular',
    'δεδόμεθα': 'perfect middle/passive indicative first person plural',
    'δέδοσθε':  'perfect middle/passive indicative second person plural',
    'δέδονται': 'perfect middle/passive indicative third person plural'
  };
  const DIDOMI_PP_CORE = [
    { chapter: 19, core: true, family: 'δίδωμι — present infinitive (required)',
      forms: { 'διδόναι': 'present active infinitive' } },
    { chapter: 19, core: true, family: 'δίδωμι — aorist passive principal part (required)',
      forms: { 'ἐδόθην': 'aorist passive indicative first person singular' } },
    { chapter: 19, core: true, family: 'δίδωμι — perfect middle/passive principal part (required)',
      forms: { 'δέδομαι': 'perfect middle/passive indicative first person singular' } },
    { chapter: 19, family: 'δίδωμι — perfect middle/passive indicative (optional)', forms: DIDOMI_PERFECT_MP_INDICATIVE }
  ];

  const TITHEMI_PERFECT_ACTIVE_INDICATIVE = {
    'τέθεικα':      'perfect active indicative first person singular',
    'τέθεικας':     'perfect active indicative second person singular',
    'τέθεικε(ν)':   'perfect active indicative third person singular',
    'τεθείκαμεν':   'perfect active indicative first person plural',
    'τεθείκατε':    'perfect active indicative second person plural',
    'τεθείκασι(ν)': 'perfect active indicative third person plural'
  };
  const TITHEMI_PERFECT_MP_INDICATIVE = {
    'τέθειμαι':  'perfect middle/passive indicative first person singular',
    'τέθεισαι':  'perfect middle/passive indicative second person singular',
    'τέθειται':  'perfect middle/passive indicative third person singular',
    'τεθείμεθα': 'perfect middle/passive indicative first person plural',
    'τέθεισθε':  'perfect middle/passive indicative second person plural',
    'τέθεινται': 'perfect middle/passive indicative third person plural'
  };
  const TITHEMI_PP_CORE = [
    { chapter: 19, core: true, family: 'τίθημι — present infinitive (required)',
      forms: { 'τιθέναι': 'present active infinitive' } },
    { chapter: 19, core: true, family: 'τίθημι — future principal part (required)',
      forms: { 'θήσω': 'future active indicative first person singular' } },
    { chapter: 19, core: true, family: 'τίθημι — aorist passive principal part (required)',
      forms: { 'ἐτέθην': 'aorist passive indicative first person singular' } },
    { chapter: 19, core: true, family: 'τίθημι — perfect active principal part (required)',
      forms: { 'τέθεικα': 'perfect active indicative first person singular' } },
    { chapter: 19, core: true, family: 'τίθημι — perfect middle/passive principal part (required)',
      forms: { 'τέθειμαι': 'perfect middle/passive indicative first person singular' } },
    { chapter: 19, family: 'τίθημι — perfect active indicative (optional)', forms: TITHEMI_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 19, family: 'τίθημι — perfect middle/passive indicative (optional)', forms: TITHEMI_PERFECT_MP_INDICATIVE }
  ];
  const TITHEMI_PP_EXTRA = { ...TITHEMI_PERFECT_ACTIVE_INDICATIVE, ...TITHEMI_PERFECT_MP_INDICATIVE };

  // ἵστημι: perfect ἕστηκα is active-intransitive ("I stand") — no perfect m/p.
  // (Full paradigm reuses the existing HISTEMI_PERFECT_ACTIVE_INDICATIVE above.)
  const HISTEMI_PP_CORE = [
    { chapter: 19, core: true, family: 'ἵστημι — present infinitive (required)',
      forms: { 'ἱστάναι': 'present active infinitive' } },
    { chapter: 19, core: true, family: 'ἵστημι — future principal part (required)',
      forms: { 'στήσω': 'future active indicative first person singular' } },
    { chapter: 19, core: true, family: 'ἵστημι — aorist passive principal part (required)',
      forms: { 'ἐστάθην': 'aorist passive indicative first person singular' } },
    { chapter: 19, core: true, family: 'ἵστημι — perfect active principal part (required)',
      forms: { 'ἕστηκα': 'perfect active indicative first person singular' } },
    { chapter: 19, family: 'ἵστημι — perfect active indicative (optional)', forms: HISTEMI_PERFECT_ACTIVE_INDICATIVE }
  ];

  // δίδομαι is δίδωμι's middle/passive slice (ends ‑μαι → treated as deponent
  // middle). Give it the present m/p infinitive + perfect m/p principal part.
  const DIDOMAI_PP_CORE = [
    { chapter: 19, core: true, family: 'δίδομαι — present infinitive (required)',
      forms: { 'δίδοσθαι': 'present middle/passive infinitive' } },
    { chapter: 19, core: true, family: 'δίδομαι — perfect middle/passive principal part (required)',
      forms: { 'δέδομαι': 'perfect middle/passive indicative first person singular' } }
  ];

  // ── Second-aorist verbs (enter parsing at Ch 11 via their 2nd aorist) ──
  // Their 2nd-aorist active is already required; here we add the rest of the
  // six principal parts (1sg) + present infinitive as required core groups, and
  // full paradigms (regular-ending) on the optional/extraForms side. Principal
  // parts verified against standard NT/Koine principal-part charts.
  // Gates: present/future/infinitive 11 · aorist passive 15 · perfect 16.

  // Helper: a verb's principal-part core groups from a {part: [form, parse]} map.
  function ppCore(lemma, parts) {
    const out = [];
    parts.forEach(([chapter, form, parse, label]) => {
      out.push({ chapter, core: true, family: `${lemma} — ${label} (required)`, forms: { [form]: parse } });
    });
    return out;
  }

  // ἄγω (γ-stem). Aorist ἤγαγον already required.
  const AGO_AORIST_PASSIVE_INDICATIVE = {
    'ἤχθην': 'aorist passive indicative first person singular',
    'ἤχθης': 'aorist passive indicative second person singular',
    'ἤχθη':  'aorist passive indicative third person singular',
    'ἤχθημεν':'aorist passive indicative first person plural',
    'ἤχθητε': 'aorist passive indicative second person plural',
    'ἤχθησαν':'aorist passive indicative third person plural'
  };
  const AGO_PP_CORE = [
    ...ppCore('ἄγω', [
      [11, 'ἄγω',   'present active indicative first person singular', 'present principal part'],
      [11, 'ἄγειν', 'present active infinitive', 'present infinitive'],
      [11, 'ἄξω',   'future active indicative first person singular', 'future principal part'],
      [15, 'ἤχθην', 'aorist passive indicative first person singular', 'aorist passive principal part'],
      [16, 'ἦχα',   'perfect active indicative first person singular', 'perfect active principal part'],
      [16, 'ἦγμαι', 'perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
    ]),
    { chapter: 15, family: 'ἄγω — aorist passive indicative (optional)', forms: AGO_AORIST_PASSIVE_INDICATIVE }
  ];
  const AGO_PP_EXTRA = { 'ἄγω':'present active indicative first person singular', 'ἄξω':'future active indicative first person singular', 'ἦχα':'perfect active indicative first person singular', 'ἦγμαι':'perfect middle/passive indicative first person singular', ...AGO_AORIST_PASSIVE_INDICATIVE };

  // λέγω (suppletive: ἐρ-/εἰπ-/εἰρη- stems). Aorist εἶπον already required.
  const LEGO_AORIST_PASSIVE_INDICATIVE = {
    'ἐρρέθην': 'aorist passive indicative first person singular',
    'ἐρρέθης': 'aorist passive indicative second person singular',
    'ἐρρέθη':  'aorist passive indicative third person singular',
    'ἐρρέθημεν':'aorist passive indicative first person plural',
    'ἐρρέθητε': 'aorist passive indicative second person plural',
    'ἐρρέθησαν':'aorist passive indicative third person plural'
  };
  const LEGO_PP_CORE = [
    ...ppCore('λέγω', [
      [11, 'λέγω',   'present active indicative first person singular', 'present principal part'],
      [11, 'λέγειν', 'present active infinitive', 'present infinitive'],
      [11, 'ἐρῶ',    'future active indicative first person singular', 'future principal part'],
      [15, 'ἐρρέθην','aorist passive indicative first person singular', 'aorist passive principal part'],
      [16, 'εἴρηκα', 'perfect active indicative first person singular', 'perfect active principal part'],
      [16, 'εἴρημαι','perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
    ]),
    { chapter: 15, family: 'λέγω — aorist passive indicative (optional)', forms: LEGO_AORIST_PASSIVE_INDICATIVE }
  ];
  const LEGO_PP_EXTRA = { 'λέγω':'present active indicative first person singular', 'ἐρῶ':'future active indicative first person singular', 'εἴρηκα':'perfect active indicative first person singular', 'εἴρημαι':'perfect middle/passive indicative first person singular', ...LEGO_AORIST_PASSIVE_INDICATIVE };

  // ὁράω (suppletive: ὀπ-/ἰδ-/ὁρα- stems). Aorist εἶδον already required.
  // No common perfect middle/passive.
  const HORAO_AORIST_PASSIVE_INDICATIVE = {
    'ὤφθην': 'aorist passive indicative first person singular',
    'ὤφθης': 'aorist passive indicative second person singular',
    'ὤφθη':  'aorist passive indicative third person singular',
    'ὤφθημεν':'aorist passive indicative first person plural',
    'ὤφθητε': 'aorist passive indicative second person plural',
    'ὤφθησαν':'aorist passive indicative third person plural'
  };
  const HORAO_PP_CORE = [
    ...ppCore('ὁράω', [
      [11, 'ὁράω',   'present active indicative first person singular', 'present principal part'],
      [11, 'ὁρᾶν',   'present active infinitive', 'present infinitive'],
      [11, 'ὄψομαι', 'future middle indicative first person singular', 'future principal part'],
      [15, 'ὤφθην',  'aorist passive indicative first person singular', 'aorist passive principal part'],
      [16, 'ἑώρακα', 'perfect active indicative first person singular', 'perfect active principal part']
    ]),
    { chapter: 15, family: 'ὁράω — aorist passive indicative (optional)', forms: HORAO_AORIST_PASSIVE_INDICATIVE }
  ];
  const HORAO_PP_EXTRA = { 'ὁράω':'present active indicative first person singular', 'ὄψομαι':'future middle indicative first person singular', 'ἑώρακα':'perfect active indicative first person singular', ...HORAO_AORIST_PASSIVE_INDICATIVE };

  // ἔχω. Aorist ἔσχον already required. No common aorist passive / perfect m/p.
  const ECHO_PP_CORE = ppCore('ἔχω', [
    [11, 'ἔχω',   'present active indicative first person singular', 'present principal part'],
    [11, 'ἔχειν', 'present active infinitive', 'present infinitive'],
    [11, 'ἕξω',   'future active indicative first person singular', 'future principal part'],
    [16, 'ἔσχηκα','perfect active indicative first person singular', 'perfect active principal part']
  ]);
  const ECHO_PP_EXTRA = { 'ἔχω':'present active indicative first person singular', 'ἕξω':'future active indicative first person singular', 'ἔσχηκα':'perfect active indicative first person singular' };

  // γινώσκω (regular-ending perfect/passive on γνω-/γνωσ- stem).
  const GINOSKO_PERFECT_ACTIVE_INDICATIVE = {
    'ἔγνωκα':'perfect active indicative first person singular',
    'ἔγνωκας':'perfect active indicative second person singular',
    'ἔγνωκε(ν)':'perfect active indicative third person singular',
    'ἐγνώκαμεν':'perfect active indicative first person plural',
    'ἐγνώκατε':'perfect active indicative second person plural',
    'ἐγνώκασι(ν)':'perfect active indicative third person plural'
  };
  const GINOSKO_PERFECT_MP_INDICATIVE = {
    'ἔγνωσμαι':'perfect middle/passive indicative first person singular',
    'ἔγνωσαι':'perfect middle/passive indicative second person singular',
    'ἔγνωσται':'perfect middle/passive indicative third person singular',
    'ἐγνώσμεθα':'perfect middle/passive indicative first person plural',
    'ἔγνωσθε':'perfect middle/passive indicative second person plural',
    'ἔγνωνται':'perfect middle/passive indicative third person plural'
  };
  const GINOSKO_AORIST_PASSIVE_INDICATIVE = {
    'ἐγνώσθην':'aorist passive indicative first person singular',
    'ἐγνώσθης':'aorist passive indicative second person singular',
    'ἐγνώσθη':'aorist passive indicative third person singular',
    'ἐγνώσθημεν':'aorist passive indicative first person plural',
    'ἐγνώσθητε':'aorist passive indicative second person plural',
    'ἐγνώσθησαν':'aorist passive indicative third person plural'
  };
  const GINOSKO_PP_CORE = [
    ...ppCore('γινώσκω', [
      [11, 'γινώσκω',  'present active indicative first person singular', 'present principal part'],
      [11, 'γινώσκειν','present active infinitive', 'present infinitive'],
      [11, 'γνώσομαι', 'future middle indicative first person singular', 'future principal part'],
      [15, 'ἐγνώσθην', 'aorist passive indicative first person singular', 'aorist passive principal part'],
      [16, 'ἔγνωκα',   'perfect active indicative first person singular', 'perfect active principal part'],
      [16, 'ἔγνωσμαι', 'perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
    ]),
    { chapter: 15, family: 'γινώσκω — aorist passive indicative (optional)', forms: GINOSKO_AORIST_PASSIVE_INDICATIVE },
    { chapter: 16, family: 'γινώσκω — perfect active indicative (optional)', forms: GINOSKO_PERFECT_ACTIVE_INDICATIVE },
    { chapter: 16, family: 'γινώσκω — perfect middle/passive indicative (optional)', forms: GINOSKO_PERFECT_MP_INDICATIVE }
  ];
  const GINOSKO_PP_EXTRA = { 'γινώσκω':'present active indicative first person singular', 'γνώσομαι':'future middle indicative first person singular', ...GINOSKO_PERFECT_ACTIVE_INDICATIVE, ...GINOSKO_PERFECT_MP_INDICATIVE, ...GINOSKO_AORIST_PASSIVE_INDICATIVE };

  // ── Stage C2: ἔρχομαι, βάλλω, λαμβάνω, λείπω, γίνομαι ──
  // βάλλω/λαμβάνω/λείπω/γίνομαι already carry most parts (optional); we promote
  // their principal parts to required core + add the missing perfect m/p.
  // ἔρχομαι is a present-deponent with active aorist (ἦλθον) + active perfect
  // (ἐλήλυθα) and no passive — only its aorist existed, so we add the rest.
  const ERCHOMAI_PP_PF_ACT = {
    'ἐλήλυθα':    'perfect active indicative first person singular',
    'ἐλήλυθας':   'perfect active indicative second person singular',
    'ἐλήλυθε(ν)': 'perfect active indicative third person singular',
    'ἐληλύθαμεν': 'perfect active indicative first person plural',
    'ἐληλύθατε':  'perfect active indicative second person plural',
    'ἐληλύθασι(ν)':'perfect active indicative third person plural'
  };
  const ERCHOMAI_PP_CORE = [
    ...ppCore('ἔρχομαι', [
      [11, 'ἔρχομαι',  'present middle/passive indicative first person singular', 'present principal part'],
      [11, 'ἔρχεσθαι', 'present middle/passive infinitive', 'present infinitive'],
      [11, 'ἐλεύσομαι','future middle indicative first person singular', 'future principal part'],
      [16, 'ἐλήλυθα',  'perfect active indicative first person singular', 'perfect active principal part']
    ]),
    { chapter: 16, family: 'ἔρχομαι — perfect active indicative (optional)', forms: ERCHOMAI_PP_PF_ACT }
  ];
  const ERCHOMAI_PP_EXTRA = { 'ἔρχομαι':'present middle/passive indicative first person singular', 'ἐλεύσομαι':'future middle indicative first person singular', ...ERCHOMAI_PP_PF_ACT };

  const BALLO_PP_PF_MP = {
    'βέβλημαι':  'perfect middle/passive indicative first person singular',
    'βέβλησαι':  'perfect middle/passive indicative second person singular',
    'βέβληται':  'perfect middle/passive indicative third person singular',
    'βεβλήμεθα': 'perfect middle/passive indicative first person plural',
    'βέβλησθε':  'perfect middle/passive indicative second person plural',
    'βέβληνται': 'perfect middle/passive indicative third person plural'
  };
  const BALLO_PP_CORE = [
    ...ppCore('βάλλω', [
      [11, 'βάλλω',   'present active indicative first person singular', 'present principal part'],
      [11, 'βάλλειν', 'present active infinitive', 'present infinitive'],
      [11, 'βαλῶ',    'future active indicative first person singular', 'future principal part'],
      [15, 'ἐβλήθην', 'aorist passive indicative first person singular', 'aorist passive principal part'],
      [16, 'βέβληκα', 'perfect active indicative first person singular', 'perfect active principal part'],
      [16, 'βέβλημαι','perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
    ]),
    { chapter: 16, family: 'βάλλω — perfect middle/passive indicative (optional)', forms: BALLO_PP_PF_MP }
  ];

  const LAMBANO_PP_CORE = ppCore('λαμβάνω', [
    [11, 'λαμβάνω',  'present active indicative first person singular', 'present principal part'],
    [11, 'λαμβάνειν','present active infinitive', 'present infinitive'],
    [11, 'λήμψομαι', 'future middle indicative first person singular', 'future principal part'],
    [15, 'ἐλήμφθην', 'aorist passive indicative first person singular', 'aorist passive principal part'],
    [16, 'εἴληφα',   'perfect active indicative first person singular', 'perfect active principal part'],
    // εἴλημμαι: consonant-stem perfect m/p — 1sg principal part only (the full
    // paradigm's assimilated 2sg/3sg are rare and error-prone).
    [16, 'εἴλημμαι', 'perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
  ]);

  const LEIPO_PP_CORE = ppCore('λείπω', [
    [11, 'λείπω',   'present active indicative first person singular', 'present principal part'],
    [11, 'λείπειν', 'present active infinitive', 'present infinitive'],
    [11, 'λείψω',   'future active indicative first person singular', 'future principal part'],
    [15, 'ἐλείφθην','aorist passive indicative first person singular', 'aorist passive principal part'],
    [16, 'λέλοιπα', 'perfect active indicative first person singular', 'perfect active principal part'],
    [16, 'λέλειμμαι','perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
  ]);

  const GINOMAI_PP_PF_MP = {
    'γεγένημαι':  'perfect middle/passive indicative first person singular',
    'γεγένησαι':  'perfect middle/passive indicative second person singular',
    'γεγένηται':  'perfect middle/passive indicative third person singular',
    'γεγενήμεθα': 'perfect middle/passive indicative first person plural',
    'γεγένησθε':  'perfect middle/passive indicative second person plural',
    'γεγένηνται': 'perfect middle/passive indicative third person plural'
  };
  const GINOMAI_PP_CORE = [
    ...ppCore('γίνομαι', [
      [11, 'γίνομαι',   'present middle/passive indicative first person singular', 'present principal part'],
      [11, 'γίνεσθαι',  'present middle/passive infinitive', 'present infinitive'],
      [11, 'γενήσομαι', 'future middle indicative first person singular', 'future principal part'],
      [11, 'ἐγενόμην',  'aorist middle indicative first person singular', 'aorist (middle) principal part'],
      [15, 'ἐγενήθην',  'aorist passive indicative first person singular', 'aorist passive principal part'],
      [16, 'γέγονα',    'perfect active indicative first person singular', 'perfect active principal part'],
      [16, 'γεγένημαι', 'perfect middle/passive indicative first person singular', 'perfect middle/passive principal part']
    ]),
    { chapter: 16, family: 'γίνομαι — perfect middle/passive indicative (optional)', forms: GINOMAI_PP_PF_MP }
  ];

  const LEMMA_INVENTORY = {
    'First and second personal pronouns': {
      // Lookup/fallback only (not drill cards — the enclitics share the
      // accented forms' parse, so a separate drill card would be redundant).
      extraForms: { ...PERSONAL_PRONOUN_ENCLITICS }
    },
    'εἰμί': {
      // εἰμί is suppletive: it has no aorist or perfect family — Greek
      // uses other roots (γέγονα, ἐγενόμην) for those senses. Tenses
      // εἰμί does have: present, future, imperfect (and a rarely-
      // attested perfect that classical/Koine pedagogy treats as
      // absent). Voice: εἰμί is active in the present/imperfect but
      // deponent middle in the future (ἔσομαι, ἐσόμενος, ἔσεσθαι) — so
      // we can't blanket-block middle/passive at the lemma level; it'd
      // wrongly tag every future-middle pick as impossible. Until the
      // inventory shape supports tense-conditional voice gating, leave
      // voice open. Moods exist for some tenses (subjunctive ὦ,
      // imperative ἴσθι, infinitive εἶναι/ἔσεσθαι, participle ὤν/
      // ἐσόμενος) so don't blanket-mark moods here either.
      impossibleTenses: ['aorist', 'first aorist', 'second aorist', 'perfect', 'pluperfect'],
      extraForms: {
        ...EIMI_FUTURE_MIDDLE_PARTICIPLE,
        ...EIMI_FUTURE_MIDDLE_INFINITIVE,
        ...EIMI_PRESENT_ACTIVE_IMPERATIVE,
        ...EIMI_PRESENT_ACTIVE_SUBJUNCTIVE,
        ...EIMI_PRESENT_PARTICIPLE_NOM,
        ...EIMI_OPTATIVE_ALL
      },
      optionalFormGroups: [...EIMI_OPTIONAL_GROUPS, ...EIMI_OPTATIVE_GROUPS]
    },
    'λύω': {
      extraForms: {
        ...LUO_EXTRA_FORMS,
        ...LUO_PERFECT_ACTIVE_PARTICIPLE,
        ...LUO_PERFECT_MP_PARTICIPLE,
        ...LUO_FUTURE_ACTIVE_PARTICIPLE,
        ...LUO_FUTURE_MIDDLE_PARTICIPLE,
        ...LUO_FUTURE_PASSIVE_PARTICIPLE,
        ...LUO_PRESENT_MP_PARTICIPLE,
        ...LUO_AORIST_MIDDLE_PARTICIPLE,
        ...LUO_OPTATIVE_ALL
      },
      optionalFormGroups: [
        ...LUO_OPTIONAL_GROUPS,
        ...LUO_OPTATIVE_GROUPS,
        ...LUO_PARTICIPLE_OPTIONAL,
        ...LUO_PRESENT_AORIST_MID_PARTICIPLE_OPTIONAL,
        ...LUO_FUTURE_PARTICIPLE_OPTIONAL
      ]
    },
    'ῥύομαι': {
      extraForms: { ...RHUOMAI_EXTRA_FORMS, ...RHUOMAI_OPTATIVE_ALL },
      optionalFormGroups: [...RHUOMAI_OPTIONAL_GROUPS, ...RHUOMAI_OPTATIVE_GROUPS]
    },
    'δύναμαι': {
      // Deponent: middle/passive in form, no active forms. Aorist is the
      // passive-deponent -θη- type (ἠδυνήθην). No impossible* lists — like
      // ῥύομαι, leave voice open so the deponent-accepts handling applies.
      extraForms: { ...DUNAMAI_EXTRA_FORMS },
      optionalFormGroups: [...DUNAMAI_OPTIONAL_GROUPS]
    },
    'οἶδα': {
      // Defective second perfect: present in meaning, no present/imperfect/
      // aorist forms (the pluperfect ᾔδειν serves as the past), and active-
      // only — so a present/aorist or middle/passive pick is genuinely "[no
      // morph exists]", not just a data gap.
      impossibleTenses: ['present', 'imperfect', 'aorist', 'first aorist', 'second aorist'],
      impossibleVoices: ['middle', 'passive', 'middle/passive'],
      extraForms: { ...OIDA_EXTRA_FORMS },
      optionalFormGroups: [...OIDA_OPTIONAL_GROUPS]
    },
    'βάλλω': {
      extraForms: {
        ...BALLO_PRESENT_ACTIVE_PARTICIPLE,
        ...BALLO_EXTRA_FORMS,
        ...BALLO_AORIST_ACTIVE_PARTICIPLE,
        ...BALLO_AORIST_PASSIVE_PARTICIPLE,
        ...BALLO_PP_PF_MP
      },
      optionalFormGroups: [
        ...BALLO_OPTIONAL_GROUPS,
        ...BALLO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'βάλλω — aorist passive participle βληθείς (optional)',
          forms: BALLO_AORIST_PASSIVE_PARTICIPLE },
        ...BALLO_PP_CORE
      ]
    },
    'γίνομαι': {
      extraForms: {
        ...GINOMAI_EXTRA_FORMS,
        ...GINOMAI_AORIST_MIDDLE_PARTICIPLE,
        ...GINOMAI_PERFECT_ACTIVE_PARTICIPLE,
        ...GINOMAI_AORIST_PASSIVE_PARTICIPLE,
        ...GINOMAI_OPTATIVE_ALL,
        ...GINOMAI_PP_PF_MP
      },
      optionalFormGroups: [
        ...GINOMAI_OPTIONAL_GROUPS,
        ...GINOMAI_OPTATIVE_GROUPS,
        ...GINOMAI_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'γίνομαι — aorist passive participle γενηθείς (optional)',
          forms: GINOMAI_AORIST_PASSIVE_PARTICIPLE },
        ...GINOMAI_PP_CORE
      ]
    },
    'λαμβάνω': {
      extraForms: {
        ...LAMBANO_PRESENT_ACTIVE_PARTICIPLE,
        ...LAMBANO_EXTRA_FORMS,
        ...LAMBANO_AORIST_ACTIVE_PARTICIPLE,
        ...LAMBANO_AORIST_PASSIVE_PARTICIPLE,
        ...LAMBANO_OPTATIVE_ALL,
        'εἴλημμαι': 'perfect middle/passive indicative first person singular'
      },
      optionalFormGroups: [
        ...LAMBANO_OPTIONAL_GROUPS,
        ...LAMBANO_OPTATIVE_GROUPS,
        ...LAMBANO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'λαμβάνω — aorist passive participle λημφθείς (optional)',
          forms: LAMBANO_AORIST_PASSIVE_PARTICIPLE },
        ...LAMBANO_PP_CORE
      ]
    },
    'λείπω': {
      extraForms: {
        ...LEIPO_PRESENT_ACTIVE_PARTICIPLE,
        ...LEIPO_EXTRA_FORMS,
        ...LEIPO_AORIST_ACTIVE_PARTICIPLE,
        ...LEIPO_AORIST_PASSIVE_PARTICIPLE,
        'λέλειμμαι': 'perfect middle/passive indicative first person singular'
      },
      optionalFormGroups: [
        ...LEIPO_OPTIONAL_GROUPS,
        ...LEIPO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'λείπω — aorist passive participle λειφθείς (optional)',
          forms: LEIPO_AORIST_PASSIVE_PARTICIPLE },
        ...LEIPO_PP_CORE
      ]
    },
    // Suppletive / 2nd-aorist participle declensions — extraForms only,
    // so the reconstruction resolves any case/number of these participles
    // (and their lookup-only passives) without adding drill cards.
    'λέγω': {
      extraForms: {
        ...LEGO_PRESENT_ACTIVE_PARTICIPLE,
        ...LEGO_AORIST_ACTIVE_PARTICIPLE,
        ...LEGO_AORIST_PASSIVE_PARTICIPLE,
        ...LEGO_PP_EXTRA
      },
      optionalFormGroups: [...LEGO_PP_CORE]
    },
    'ὁράω': {
      extraForms: {
        ...ORAO_PRESENT_ACTIVE_PARTICIPLE,
        ...HORAO_AORIST_ACTIVE_PARTICIPLE,
        ...HORAO_AORIST_PASSIVE_PARTICIPLE,
        ...HORAO_PP_EXTRA
      },
      optionalFormGroups: [...HORAO_PP_CORE]
    },
    'ἔρχομαι': {
      extraForms: {
        ...ERCHOMAI_PRESENT_MIDDLE_PARTICIPLE,
        ...ERCHOMAI_AORIST_ACTIVE_PARTICIPLE,
        ...ERCHOMAI_PP_EXTRA
      },
      optionalFormGroups: [...ERCHOMAI_PP_CORE]
    },
    'ἔχω': {
      extraForms: {
        ...ECHO_PRESENT_ACTIVE_PARTICIPLE,
        ...ECHO_AORIST_ACTIVE_PARTICIPLE,
        ...ECHO_AORIST_PASSIVE_PARTICIPLE,
        ...ECHO_PP_EXTRA
      },
      optionalFormGroups: [...ECHO_PP_CORE]
    },
    'ἄγω': {
      extraForms: {
        ...AGO_PRESENT_ACTIVE_PARTICIPLE,
        ...AGO_AORIST_ACTIVE_PARTICIPLE,
        ...AGO_AORIST_PASSIVE_PARTICIPLE,
        ...AGO_PP_EXTRA
      },
      optionalFormGroups: [...AGO_PP_CORE]
    },
    'γινώσκω': {
      extraForms: {
        ...GINOSKO_PRESENT_ACTIVE_PARTICIPLE,
        ...GINOSKO_AORIST_ACTIVE_PARTICIPLE,
        ...GINOSKO_AORIST_PASSIVE_PARTICIPLE,
        ...GINOSKO_PP_EXTRA
      },
      optionalFormGroups: [...GINOSKO_PP_CORE]
    },
    'κρίνω': {
      extraForms: {
        ...KRINO_PRESENT_ACTIVE_PARTICIPLE,
        ...KRINO_AORIST_ACTIVE_PARTICIPLE,
        ...KRINO_AORIST_PASSIVE_PARTICIPLE,
        ...KRINO_PP_EXTRA
      },
      optionalFormGroups: [...KRINO_PP_CORE]
    },
    'μένω': {
      // Liquid verb, intransitive — no perfect middle/passive, no aorist
      // passive. Principal parts: μένω, μενῶ, ἔμεινα, μεμένηκα.
      extraForms: { ...MENO_PP_EXTRA },
      optionalFormGroups: [...MENO_PP_CORE]
    },
    'φιλέω': {
      extraForms: {
        ...PHILEO_EXTRA_FORMS,
        ...PHILEO_PRESENT_ACTIVE_PARTICIPLE,
        ...PHILEO_AORIST_ACTIVE_PARTICIPLE,
        ...PHILEO_AORIST_PASSIVE_PARTICIPLE
      },
      optionalFormGroups: [
        ...PHILEO_OPTIONAL_GROUPS,
        ...PHILEO_PARTICIPLE_OPTIONAL,
        { chapter: 15, family: 'φιλέω — aorist passive participle φιληθείς (optional)',
          forms: PHILEO_AORIST_PASSIVE_PARTICIPLE }
      ]
    },
    'δίδωμι': {
      extraForms: {
        ...DIDOMI_EXTRA_FORMS,
        ...DIDOMI_PRESENT_ACTIVE_PARTICIPLE,
        ...DIDOMI_AORIST_ACTIVE_PARTICIPLE,
        ...DIDOMI_AORIST_PASSIVE_PARTICIPLE,
        ...DIDOMI_OPTATIVE_ALL,
        ...DIDOMI_PERFECT_MP_INDICATIVE
      },
      optionalFormGroups: [
        ...DIDOMI_OPTIONAL_GROUPS,
        ...DIDOMI_OPTATIVE_GROUPS,
        ...DIDOMI_PARTICIPLE_OPTIONAL,
        { chapter: 19, family: 'δίδωμι — aorist passive participle δοθείς (optional)',
          forms: DIDOMI_AORIST_PASSIVE_PARTICIPLE },
        ...DIDOMI_PP_CORE
      ]
    },
    'τίθημι': {
      extraForms: {
        ...TITHEMI_EXTRA_FORMS,
        ...TITHEMI_PRESENT_ACTIVE_PARTICIPLE,
        ...TITHEMI_AORIST_ACTIVE_PARTICIPLE,
        ...TITHEMI_AORIST_PASSIVE_PARTICIPLE,
        ...TITHEMI_PP_EXTRA
      },
      optionalFormGroups: [
        ...TITHEMI_OPTIONAL_GROUPS,
        ...TITHEMI_PARTICIPLE_OPTIONAL,
        { chapter: 19, family: 'τίθημι — aorist passive participle τεθείς (optional)',
          forms: TITHEMI_AORIST_PASSIVE_PARTICIPLE },
        ...TITHEMI_PP_CORE
      ]
    },
    'ἵστημι': {
      extraForms: {
        ...HISTEMI_EXTRA_FORMS,
        ...HISTEMI_PRESENT_ACTIVE_PARTICIPLE,
        ...HISTEMI_SECOND_AORIST_ACTIVE_PARTICIPLE,
        ...HISTEMI_PERFECT_ACTIVE_PARTICIPLE,
        ...HISTEMI_AORIST_PASSIVE_PARTICIPLE,
        ...HISTEMI_PERFECT_ACTIVE_INDICATIVE
      },
      optionalFormGroups: [
        ...HISTEMI_OPTIONAL_GROUPS,
        ...HISTEMI_PARTICIPLE_OPTIONAL,
        { chapter: 19, family: 'ἵστημι — aorist passive participle σταθείς (optional)',
          forms: HISTEMI_AORIST_PASSIVE_PARTICIPLE },
        ...HISTEMI_PP_CORE
      ]
    },
    'δίδομαι': {
      extraForms: { ...DIDOMAI_EXTRA_FORMS, ...DIDOMI_PERFECT_MP_INDICATIVE },
      optionalFormGroups: [...DIDOMAI_OPTIONAL_GROUPS, ...DIDOMAI_PP_CORE]
    },
    // Hand-authored optional coverage (ported from Mounce #86). These verbs
    // aren't paradigm exemplars in duff's morphology data yet, so the optional
    // groups stay dormant (no base paradigm to extend) while the extraForms
    // back the fallback form-lookup; both go live the moment paradigm tables
    // for the lemma land. Keyed by bare lemma, like every other entry.
    'ἀγαπάω': {
      extraForms: AGAPAO_EXTRA_FORMS,
      optionalFormGroups: AGAPAO_OPTIONAL_GROUPS
    },
    'ποιέω': {
      extraForms: { ...POIEO_EXTRA_FORMS, ...POIEO_OPTATIVE_ALL },
      optionalFormGroups: [...POIEO_OPTIONAL_GROUPS, ...POIEO_OPTATIVE_GROUPS]
    },
    'πληρόω': {
      extraForms: PLEROO_EXTRA_FORMS,
      optionalFormGroups: PLEROO_OPTIONAL_GROUPS
    },
    'γράφω': {
      extraForms: GRAPHO_EXTRA_FORMS,
      optionalFormGroups: GRAPHO_OPTIONAL_GROUPS
    },
    'πορεύομαι': {
      extraForms: POREUOMAI_EXTRA_FORMS,
      optionalFormGroups: POREUOMAI_OPTIONAL_GROUPS
    },
    'δείκνυμι': {
      extraForms: DEIKNYMI_EXTRA_FORMS,
      optionalFormGroups: DEIKNYMI_OPTIONAL_GROUPS
    },
    'λόγος': {
      extraForms: LOGOS_VOCATIVE
    },
    'προφήτης': {
      extraForms: PROPHETES_VOC_PL_EXTRAS
    },
    'μαθητής': {
      extraForms: { ...MATHETES_VOCATIVE, ...MATHETES_VOC_PL_EXTRAS },
      optionalFormGroups: [
        { chapter: 8, family: 'μαθητής — vocative singular (optional)',
          forms: MATHETES_OPTIONAL_FORMS }
      ]
    },
    'πόλις': {
      extraForms: { ...POLIS_VOCATIVE, ...POLIS_OPTIONAL_FORMS, ...POLIS_VOC_PL_EXTRAS },
      optionalFormGroups: [
        { chapter: 12, family: 'πόλις — vocative sg. + ν-less dat. pl. (optional)',
          forms: POLIS_OPTIONAL_FORMS }
      ]
    },
    'βασιλεύς': {
      extraForms: { ...BASILEUS_VOCATIVE, ...BASILEUS_OPTIONAL_FORMS, ...BASILEUS_VOC_PL_EXTRAS },
      optionalFormGroups: [
        { chapter: 12, family: 'βασιλεύς — vocative sg. + ν-less dat. pl. (optional)',
          forms: BASILEUS_OPTIONAL_FORMS }
      ]
    }
    // Add more defective lemmas here (e.g. οἶδα — no present form, the
    // perfect serves as present; χρή — only third singular, etc.) when
    // the data grows to include them. For paradigm exemplars (λύω,
    // λόγος, ἀγαθός, …) whose paradigms have undrilled corners, add
    // both `extraForms` (always-on fallback) and `optionalFormGroups`
    // (toggle-gated drill cards) — reference a shared `forms` map so
    // the two stay in sync.
  };

  if (typeof window !== 'undefined') window.LEMMA_INVENTORY = LEMMA_INVENTORY;
})();
