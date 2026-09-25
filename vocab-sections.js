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
