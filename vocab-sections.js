export const VOCAB_SECTIONS = [
  ['all', 'All words'],
  ['lesson', 'Lesson words'],
  ['families', 'Affix families'],
  ['reading', 'Formal reading'],
  ['everyday', 'Everyday recognition']
];

export function vocabSectionFor(card) {
  return card.section || (card.sourceRootId ? 'families' : 'lesson');
}

export function filterVocabSection(cards, section) {
  return section === 'all' ? cards : cards.filter(card => vocabSectionFor(card) === section);
}

export function vocabSectionCounts(cards) {
  return Object.fromEntries(VOCAB_SECTIONS.map(([key]) => [key, filterVocabSection(cards, key).length]));
}

export function topicVocabularyPreview(unit, section) {
  const focused = filterVocabSection(unit.vocabulary, section);
  const added = unit.vocabulary.filter(card => card.id.startsWith('id-pbwl2-'));
  return { focused, addedCount: added.length, sample: (section === 'all' && added.length ? added : focused).slice(0, 3) };
}
