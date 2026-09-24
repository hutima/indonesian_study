(function () {
  // Optative mood (Duff Ch 20). The optative is vanishingly rare in the NT
  // (~68 of 28,000+ verbs), so this REQUIRED set is deliberately tiny — but
  // it's built around the three PARSES that actually occur in the Greek New
  // Testament, then mirrors each of those parses onto the course's two model
  // verbs (λύω, ῥύομαι) so a student drills the same optative slots the NT
  // uses, on the paradigms they already know:
  //
  //   occurring parse              GNT form           λύω           ῥύομαι (mid/dep)
  //   present  · active · opt 3sg  εἴη   (εἰμί)        λύοι          ῥύοιτο
  //   aorist   · active · opt 3sg  δῴη   (δίδωμι)      λύσαι         ῥύσαιτο
  //   aorist   · middle · opt 3sg  γένοιτο (γίνομαι)   λύσαιτο       ῥύσαιτο
  //
  // ῥύομαι is deponent (no active voice), so the two active parses fall onto
  // its middle forms — the aorist active and aorist middle both land on
  // ῥύσαιτο, hence ῥύομαι contributes two distinct forms, not three. Every
  // occurring parse is 3rd singular, matching the GNT (the optative is almost
  // always a 3sg wish/benediction there). The FULL optative paradigm for each
  // model verb lives in the OPTIONAL pool (LEMMA_INVENTORY optative groups,
  // chapter 20) — turn on "Optional paradigm" in parsing to browse/drill it.
  //
  // Each card carries its own `lemma` so the auto-generated parsing cards
  // (paradigm_morphology.js) fold into the right paradigm. The parse
  // parenthetical drives canonicalization, so it names tense, voice, mood,
  // person, and number in full.
  window.registerSupplementalVocabSet('W8_OPTATIVE_NT_FORMS', {
    label: 'Optative — New Testament forms (λύω, ῥύομαι, εἰμί, γίνομαι, δίδωμι)',
    week: 8,
    chapter: 20,
    cards: [
      // The forms that actually occur in the GNT.
      { g: 'εἴη', e: 'he/she/it might be (Present active optative, 3rd person sg.) — the only optative of εἰμί in the GNT, always 3rd sg.', lemma: 'εἰμί', required: true },
      { g: 'δῴη', e: 'may he/she/it grant / give (Aorist active optative, 3rd person sg.) — “may the Lord grant”, 2 Tim 1:16', lemma: 'δίδωμι', required: true },
      { g: 'γένοιτο', e: 'may it be! / may it happen! (Aorist middle optative, 3rd person sg.) — Paul’s μὴ γένοιτο, “may it never be!”', lemma: 'γίνομαι', required: true },
      // λύω in the slot of each occurring parse.
      { g: 'λύοι', e: 'he/she/it might untie / loose (Present active optative, 3rd person sg.) — λύω in the slot of εἴη', lemma: 'λύω', required: true },
      { g: 'λύσαι', e: 'he/she/it might untie / loose (Aorist active optative, 3rd person sg.) — λύω in the slot of δῴη; acute accent, unlike the infinitive λῦσαι', lemma: 'λύω', required: true },
      { g: 'λύσαιτο', e: 'he/she/it might untie for him/herself (Aorist middle optative, 3rd person sg.) — λύω in the slot of γένοιτο', lemma: 'λύω', required: true },
      // ῥύομαι (deponent middle) in the same slots; the two aorist parses
      // both land on the middle ῥύσαιτο.
      { g: 'ῥύοιτο', e: 'he/she/it might rescue (Present middle optative, 3rd person sg.) — ῥύομαι in the slot of εἴη', lemma: 'ῥύομαι', required: true },
      { g: 'ῥύσαιτο', e: 'he/she/it might rescue (Aorist middle optative, 3rd person sg.) — ῥύομαι in the slot of δῴη / γένοιτο', lemma: 'ῥύομαι', required: true }
    ]
  });
})();
