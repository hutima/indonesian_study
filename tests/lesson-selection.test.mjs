import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLessonIds, selectedUnits, itemsForMode, nextLessonId } from '../lesson-selection.js';

const units = [
  { id: 'foundation', vocabulary: [{ id: 'f' }], morphology: [], grammar: [], readings: [] },
  { id: 'topic01', vocabulary: [{ id: 'one' }], morphology: [], grammar: [{ id: 'g1' }], readings: [] },
  { id: 'topic02', vocabulary: [{ id: 'two' }], morphology: [], grammar: [{ id: 'g2' }], readings: [] }
];
test('topic selection orders multiple choices by book sequence and excludes foundations', () => {
  const ids = normalizeLessonIds(['topic02', 'missing', 'topic01', 'topic02'], units, ['topic01']);
  assert.deepEqual(ids, ['topic01', 'topic02']);
  assert.deepEqual(itemsForMode(units, ids, 'vocabulary').map(x => x.id), ['one', 'two']);
  assert.deepEqual(itemsForMode(units, ids, 'grammar').map(x => x.id), ['g1', 'g2']);
  assert.deepEqual(selectedUnits(units, ['topic01']).map(x => x.id), ['topic01']);
});
test('missing stored choice defaults to first textbook topic and single selection can advance', () => {
  assert.deepEqual(normalizeLessonIds(null, units, ['topic01']), ['topic01']);
  assert.equal(nextLessonId(units, ['topic01']), 'topic02');
  assert.equal(nextLessonId(units, ['topic01', 'topic02']), null);
  assert.equal(nextLessonId(units, ['topic02']), null);
});
