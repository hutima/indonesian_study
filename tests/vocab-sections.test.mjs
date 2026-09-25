import test from 'node:test';
import assert from 'node:assert/strict';
import { filterVocabSection, vocabSectionCounts, vocabSectionFor, topicVocabularyPreview } from '../vocab-sections.js';
import { TEXTBOOK_UNITS } from '../content/manifest.js';

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

test('topic picker previews new words and section focus from the merged vocabulary', () => {
  const topic = TEXTBOOK_UNITS[0];
  const all = topicVocabularyPreview(topic, 'all');
  const reading = topicVocabularyPreview(topic, 'reading');
  assert.equal(all.addedCount, 35);
  assert.equal(all.focused.length, topic.vocabulary.length);
  assert.ok(all.sample.every(card => card.id.startsWith('id-pbwl2-')));
  assert.ok(reading.focused.length > 0);
  assert.ok(reading.sample.every(card => card.section === 'reading'));
});
