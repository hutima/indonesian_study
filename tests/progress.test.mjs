import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProgress, saveProgress, recordAnswer } from '../progress.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('progress follows stable IDs across content reordering', () => {
  const storage = memoryStorage();
  const state = recordAnswer(loadProgress(storage), 'u01.m03', 'correct');
  saveProgress(storage, state);
  assert.equal(loadProgress(storage).items['u01.m03'].correct, 1);
  assert.equal(loadProgress(storage).items['u01.m02'], undefined);
});

test('malformed data falls back safely and does not pollute prototypes', () => {
  const storage = memoryStorage({ 'indonesian-study-progress-v1': '{broken' });
  assert.deepEqual(loadProgress(storage).items, {});
  const state = recordAnswer(loadProgress(storage), '__proto__', 'correct');
  assert.equal(Object.hasOwn(state.items, '__proto__'), false);
});

test('imported counters are normalized', () => {
  const storage = memoryStorage({ 'indonesian-study-progress-v1': JSON.stringify({ version: 1, items: { 'u01.v01': { correct: -3, wrong: 2.7, last: 'oops' } } }) });
  assert.deepEqual(loadProgress(storage).items['u01.v01'], { correct: 0, wrong: 2, last: 0 });
});

test('an ID matching an inherited Object property records a finite mark', () => {
  const state = recordAnswer({ version: 1, items: {} }, 'toString', 'correct');
  assert.equal(state.items.toString.correct, 1);
});
