import test from 'node:test';
import assert from 'node:assert/strict';
import { UNITS } from '../content/manifest.js';
import { ACTIVE_STRUGGLE_WORDS, COMPLETED_STRUGGLE_WORDS, resolveCustomVocabulary } from '../content/vocab/custom-focus.js';

const normalize = value => String(value || '')
  .toLocaleLowerCase('id')
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

test('personal focus vocabulary resolves to one stable card identity per word', () => {
  const resolved = resolveCustomVocabulary(UNITS, 'active');
  assert.equal(resolved.length, ACTIVE_STRUGGLE_WORDS.length);
  assert.equal(new Set(resolved.map(card => card.id)).size, resolved.length);

  const lessonByForm = new Map();
  for (const card of UNITS.flatMap(unit => unit.vocabulary)) {
    const key = normalize(card.form);
    if (!lessonByForm.has(key)) lessonByForm.set(key, []);
    lessonByForm.get(key).push(card);
  }

  ACTIVE_STRUGGLE_WORDS.forEach((definition, index) => {
    const matches = lessonByForm.get(normalize(definition.form)) || [];
    const card = resolved[index];
    if (matches.length) {
      assert.ok(matches.some(match => match.id === card.id), `${definition.form} should reuse a lesson card ID`);
      assert.equal(card.focusCanonical, true);
    } else {
      assert.ok(card.id.startsWith('id-focus-'), `${definition.form} should get a stable personal focus ID`);
      assert.equal(card.focusCanonical, false);
    }
  });
});

test('completed focus deck is separately resolvable and starts empty', () => {
  assert.deepEqual(COMPLETED_STRUGGLE_WORDS, []);
  assert.deepEqual(resolveCustomVocabulary(UNITS, 'completed'), []);
});
