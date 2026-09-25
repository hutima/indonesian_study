import test from 'node:test';
import assert from 'node:assert/strict';
import { orderMorphology } from '../morphology-order.js';

const forms = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

test('shuffles a fresh morphology selection and preserves the current form when toggled', () => {
  const shuffled = orderMorphology(forms, null, -1, true, () => 0);
  assert.deepEqual(shuffled, ['b', 'c', 'd', 'a']);
  assert.deepEqual(orderMorphology(forms, shuffled, 1, false), ['b', 'c', 'a', 'd']);
});

test('reshuffles only upcoming forms while keeping answered and current forms in place', () => {
  assert.deepEqual(orderMorphology(forms, ['a', 'b', 'c', 'd'], 1, true, () => 0), ['a', 'b', 'd', 'c']);
  assert.deepEqual(orderMorphology(forms, ['a', 'b', 'c', 'd'], 3, true, () => 0), ['a', 'b', 'c', 'd']);
});
