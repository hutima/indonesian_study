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

test('ambiguous focus forms explicitly select a canonical lesson identity', () => {
  const cards = UNITS.flatMap(unit => unit.vocabulary);
  for (const definition of [...ACTIVE_STRUGGLE_WORDS, ...COMPLETED_STRUGGLE_WORDS]) {
    const matches = cards.filter(card => normalize(card.form) === normalize(definition.form));
    if (definition.canonicalId) {
      assert.ok(matches.some(card => card.id === definition.canonicalId), `${definition.form}: canonical ID must match the form`);
    }
    if (new Set(matches.map(card => card.id)).size > 1) {
      assert.ok(definition.canonicalId || definition.preferredUnitId, `${definition.form}: disambiguate lesson identities`);
    }
  }
});

test('completed focus words remain reviewable without duplicating active or lesson cards', () => {
  const active = resolveCustomVocabulary(UNITS, 'active');
  const completed = resolveCustomVocabulary(UNITS, 'completed');
  const activeIds = new Set(active.map(card => card.id));
  const lessonForms = new Set(UNITS.flatMap(unit => unit.vocabulary).map(card => normalize(card.form)));
  assert.equal(completed.length, COMPLETED_STRUGGLE_WORDS.length);
  assert.equal(new Set(completed.map(card => card.id)).size, completed.length);
  for (const card of completed) {
    assert.ok(!activeIds.has(card.id), `${card.form} cannot be active and completed`);
    assert.ok(!lessonForms.has(normalize(card.form)), `${card.form} remains reviewable in its normal lesson`);
    assert.ok(card.id.startsWith('id-focus-'), `${card.form} keeps its personal focus identity`);
  }
});
