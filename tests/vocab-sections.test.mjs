import test from 'node:test';
import assert from 'node:assert/strict';
import { filterVocabSection, vocabSectionCounts, vocabSectionFor } from '../vocab-sections.js';

test('lesson, prior PBWL, and expanded cards occupy predictable sections', () => {
  const cards = [
    { id: 'core' },
    { id: 'older-supplement', sourceRootId: 20 },
    { id: 'formal', sourceRootId: 30, section: 'reading' },
    { id: 'daily', sourceRootId: 40, section: 'everyday' }
  ];
  assert.deepEqual(cards.map(vocabSectionFor), ['lesson', 'families', 'reading', 'everyday']);
  assert.deepEqual(filterVocabSection(cards, 'families').map(card => card.id), ['older-supplement']);
  assert.deepEqual(vocabSectionCounts(cards), { all: 4, lesson: 1, families: 1, reading: 1, everyday: 1 });
});
