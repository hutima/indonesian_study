import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSelection } from '../navigation.js';

test('one-form first morphology unit advances to a new unit rather than repeating makan', () => {
  assert.deepEqual(advanceSelection(0, 1, 0, 3), { index: 1, unitIndex: 1 });
  assert.deepEqual(advanceSelection(6, 7, 1, 3), { index: 7, unitIndex: 2 });
  assert.deepEqual(advanceSelection(13, 14, 2, 3), { index: 0, unitIndex: 2 });
});
