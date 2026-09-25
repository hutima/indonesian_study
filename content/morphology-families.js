// Curated sibling forms. Keep family IDs and form order stable for saved progress.
const family = (unitId, root, pbwlRootId, rows) => ({
  id: `${unitId}-family-${root}`, unitId, root, pbwlRootId,
  forms: rows.map(([word, effect, affix, explanation]) => ({ word, effect, affix, explanation }))
});

export const MORPH_FAMILIES = [
  family('id-stage1-unit01', 'makan', 192, [
    ['memakan', 'actively eats something', 'meN-', 'meN- makes an active verb; makan keeps its initial m.'],
    ['dimakan', 'is eaten by someone', 'di-', 'di- makes the eating passive: the food receives the action.'],
    ['makanan', 'food; something to eat', '-an', '-an makes a noun for what is eaten.']
  ]),
  family('id-stage1-unit02', 'tulis', 190, [
    ['menulis', 'actively writes', 'meN-', 'meN- makes an active verb; the initial t of tulis drops after men-.'],
    ['ditulis', 'is written', 'di-', 'di- makes the text the passive subject.'],
    ['penulis', 'a person who writes', 'peN-', 'peN- makes an agent noun; the initial t drops after pen-.'],
    ['tulisan', 'written text or writing', '-an', '-an makes a noun for the result of writing.']
  ]),
  family('id-stage1-unit03', 'ajar', 131, [
    ['belajar', 'learns or studies', 'ber- (bel-)', 'The irregular bel- variant makes belajar mean to study.'],
    ['mengajar', 'teaches someone', 'meN-', 'meN- makes an active teaching verb.'],
    ['pelajaran', 'a lesson or school subject', 'pel-...-an', 'The pel-...-an form names the lesson or subject being studied.'],
    ['pembelajaran', 'the learning process', 'peN-...-an', 'peN-...-an names the process of learning or teaching.']
  ]),
  family('id-stage2-unit04', 'kurang', 165, [
    ['mengurangi', 'reduces something', 'meN-...-i', 'meN-...-i takes an object; the initial k of kurang drops.'],
    ['dikurangi', 'is reduced by someone', 'di-...-i', 'di- makes the reduction passive; -i stays.'],
    ['berkurang', 'becomes less', 'ber-', 'ber- expresses a decrease without an object.'],
    ['kekurangan', 'a shortage or lack', 'ke-...-an', 'ke-...-an names a state of having too little.']
  ]),
  family('id-stage2-unit05', 'kirim', 272, [
    ['mengirim', 'sends something', 'meN-', 'meN- makes an active verb; initial k drops.'],
    ['mengirimkan', 'sends something to a recipient', 'meN-...-kan', '-kan can highlight the transfer to a recipient; initial k drops.'],
    ['dikirim', 'is sent', 'di-', 'di- makes the thing sent the passive subject.'],
    ['pengiriman', 'shipping or the sending process', 'peN-...-an', 'peN-...-an names the process of sending; initial k drops.']
  ]),
  family('id-textbook-topik-01', 'jaga', 654, [
    ['menjaga', 'looks after something', 'meN-', 'meN- makes jaga an active verb.'],
    ['dijaga', 'is looked after', 'di-', 'di- makes the protected thing the passive subject.'],
    ['penjaga', 'a guard or caretaker', 'peN-', 'peN- names the person who guards.'],
    ['penjagaan', 'guarding or protection', 'peN-...-an', 'peN-...-an names the guarding activity.']
  ]),
  family('id-textbook-topik-02', 'tempat', 137, [
    ['menempati', 'occupies a place', 'meN-...-i', 'meN-...-i takes a place as object; initial t drops.'],
    ['menempatkan', 'places someone or something somewhere', 'meN-...-kan', 'meN-...-kan makes an active placing verb; initial t drops.'],
    ['ditempatkan', 'is placed somewhere', 'di-...-kan', 'di- makes the placed person or thing the passive subject.'],
    ['penempatan', 'a placement or assignment', 'peN-...-an', 'peN-...-an names the placement action or result; t drops.']
  ]),
  family('id-textbook-topik-02', 'diri', 114, [
    ['berdiri', 'stands upright', 'ber-', 'ber- makes a verb meaning to stand.'],
    ['terdiri', 'consists of (with dari)', 'ter-', 'Terdiri dari is a lexicalized expression meaning consists of; do not read ter- here as accidental.'],
    ['mendirikan', 'establishes or erects something', 'meN-...-kan', 'meN-...-kan makes a transitive verb: someone causes a building or organization to stand.'],
    ['pendiri', 'a founder', 'peN-', 'peN- makes an agent noun for the person who establishes something.']
  ]),
  family('id-textbook-topik-03', 'kenal', 195, [
    ['mengenal', 'knows or recognizes someone', 'meN-', 'meN- makes an active verb; initial k drops.'],
    ['berkenalan', 'gets acquainted', 'ber-...-an', 'ber-...-an expresses becoming acquainted.'],
    ['terkenal', 'is famous or well known', 'ter-', 'ter- marks a recognized state: someone is widely known.'],
    ['memperkenalkan', 'introduces someone or something', 'memper-...-kan', 'memper-...-kan makes an active verb of making someone known.']
  ]),
  family('id-textbook-topik-04', 'kontrak', 1746, [
    ['mengontrak', 'rents a property for use', 'meN-', 'meN- makes an active renting verb; k drops.'],
    ['mengontrakkan', 'rents a property out to someone', 'meN-...-kan', '-kan shifts the relationship to renting the property out.'],
    ['dikontrakkan', 'is rented out to someone', 'di-...-kan', 'di- makes the property rented out the passive subject.'],
    ['kontrakan', 'a rented house or room', '-an', '-an names a rented place in everyday usage.']
  ]),
  family('id-textbook-topik-05', 'kunjung', 630, [
    ['berkunjung', 'pays a visit', 'ber-', 'ber- expresses going to visit without a direct object.'],
    ['mengunjungi', 'visits someone or somewhere', 'meN-...-i', 'meN-...-i takes the visited person or place as object; k drops.'],
    ['pengunjung', 'a visitor', 'peN-', 'peN- names the person who visits; k drops.'],
    ['kunjungan', 'a visit', '-an', '-an names the visit itself.']
  ]),
  family('id-textbook-topik-06', 'tetap', 146, [
    ['menetapkan', 'sets or determines something', 'meN-...-kan', 'meN-...-kan makes an active verb; initial t drops.'],
    ['ditetapkan', 'is set or determined', 'di-...-kan', 'di- makes the decision or rule the passive subject.'],
    ['penetapan', 'the act of setting or determining', 'peN-...-an', 'peN-...-an names the action; t drops.']
  ]),
  family('id-textbook-topik-07', 'beli', 230, [
    ['membeli', 'buys something', 'meN-', 'meN- makes the buying active; mem- precedes b.'],
    ['dibeli', 'is bought', 'di-', 'di- makes the purchased thing the passive subject.'],
    ['pembeli', 'a buyer', 'peN-', 'peN- names the person who buys.'],
    ['pembelian', 'a purchase or purchasing', 'peN-...-an', 'peN-...-an names the buying action or transaction.']
  ]),
  family('id-textbook-topik-08', 'tuju', 1094, [
    ['menuju', 'heads toward a place', 'meN-', 'meN- makes a directional verb; initial t drops.'],
    ['dituju', 'is aimed at or headed for', 'di-', 'di- makes the destination the passive focus.'],
    ['tujuan', 'a destination or purpose', '-an', '-an makes a noun for the goal.'],
    ['bertujuan', 'has a purpose or aims to', 'ber-', 'ber- expresses having a goal.']
  ]),
  family('id-textbook-topik-09', 'terbit', 1750, [
    ['menerbitkan', 'publishes something', 'meN-...-kan', 'meN-...-kan means to cause publication; initial t drops.'],
    ['diterbitkan', 'is published', 'di-...-kan', 'di- makes the publication the passive subject.'],
    ['penerbit', 'a publisher', 'peN-', 'peN- names the publisher; initial t drops.'],
    ['penerbitan', 'publication or the publishing process', 'peN-...-an', 'peN-...-an names the activity or result.']
  ]),
  family('id-textbook-topik-10', 'jadwal', 782, [
    ['menjadwalkan', 'schedules something', 'meN-...-kan', 'meN-...-kan expresses actively putting an event on a schedule.'],
    ['dijadwalkan', 'is scheduled', 'di-...-kan', 'di- makes the scheduled event the passive subject.'],
    ['penjadwalan', 'scheduling as an activity', 'peN-...-an', 'peN-...-an names the scheduling process.']
  ]),
  family('id-textbook-topik-11', 'buru', 1335, [
    ['memburu', 'hunts or pursues a target', 'meN-', 'meN- makes an active verb taking the target as object.'],
    ['berburu', 'goes hunting', 'ber-', 'ber- expresses the hunting activity without an object.'],
    ['pemburu', 'a hunter', 'peN-', 'peN- names the person who hunts.'],
    ['perburuan', 'a hunt or pursuit', 'per-...-an', 'per-...-an names the hunting activity.']
  ]),
  family('id-textbook-topik-12', 'lihat', 121, [
    ['melihat', 'sees something', 'meN-', 'meN- makes an active verb of seeing.'],
    ['terlihat', 'is visible or appears', 'ter-', 'ter- marks being visible or coming into view.'],
    ['kelihatan', 'looks or appears visible', 'ke-...-an', 'ke-...-an describes how something appears to an observer.']
  ]),
  family('id-textbook-topik-13', 'serang', 1713, [
    ['menyerang', 'attacks someone', 'meN-', 'meN- makes an active verb; initial s drops after meny-.'],
    ['diserang', 'is attacked', 'di-', 'di- makes the attacked target the passive subject.'],
    ['serangan', 'an attack', '-an', '-an names a single attack.'],
    ['penyerangan', 'the act of attacking', 'peN-...-an', 'peN-...-an names the action; initial s drops.']
  ]),
  family('id-textbook-topik-14', 'rusak', 669, [
    ['merusak', 'damages something', 'meN-', 'meN- makes an active verb causing damage.'],
    ['dirusak', 'is damaged by someone', 'di-', 'di- makes the damaged thing the passive subject.'],
    ['kerusakan', 'damage or a state of disrepair', 'ke-...-an', 'ke-...-an names the damaged state or result.'],
    ['perusakan', 'the deliberate act of damaging', 'per-...-an', 'per-...-an names the action of causing damage.']
  ]),
  family('id-textbook-topik-15', 'selenggara', 1717, [
    ['menyelenggarakan', 'organizes an event', 'meN-...-kan', 'meN-...-kan makes an active verb; initial s drops.'],
    ['diselenggarakan', 'is organized or held', 'di-...-kan', 'di- makes the organized event the passive subject.'],
    ['penyelenggara', 'an organizer', 'peN-', 'peN- names the person or group organizing; s drops.'],
    ['penyelenggaraan', 'the organizing of an event', 'peN-...-an', 'peN-...-an names the organizing process; s drops.']
  ])
];

export function selectMorphologyFamilies(unitIds) {
  const selected = new Set(unitIds);
  return MORPH_FAMILIES.filter(family => selected.has(family.unitId));
}

export function familyQuestions(family, direction) {
  const choices = family.forms.map(form => direction === 'select' ? form.word : form.effect);
  return family.forms.map((form, index) => ({
    id: `${family.id}.${direction}.${index + 1}`,
    prompt: direction === 'select'
      ? `From ${family.root}, which form means “${form.effect}”?`
      : `From ${family.root}, what does the affix in “${form.word}” express?`,
    choices,
    answer: direction === 'select' ? form.word : form.effect,
    explanation: `${form.word} (${family.root} + ${form.affix}): ${form.explanation}`
  }));
}
