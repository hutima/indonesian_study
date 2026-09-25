import test from 'node:test';
import assert from 'node:assert/strict';
import { UNITS } from '../content/manifest.js';
import { MORPH_FAMILIES, selectMorphologyFamilies, familyQuestions } from '../content/morphology-families.js';

test('every textbook and foundation topic has a distinct curated root family', () => {
  assert.ok(MORPH_FAMILIES.length >= UNITS.length);
  const allQuestionIds = new Set();
  const sourceRootIds = new Set();
  for (const unit of UNITS) {
    const families = selectMorphologyFamilies([unit.id]);
    assert.ok(families.length, `missing family in ${unit.id}`);
    for (const family of families) {
      assert.ok(Number.isInteger(family.pbwlRootId), `missing PBWL RootID for ${family.root}`);
      assert.ok(!sourceRootIds.has(family.pbwlRootId));
      sourceRootIds.add(family.pbwlRootId);
      assert.ok(family.forms.length >= 3);
      assert.equal(new Set(family.forms.map(form => form.word)).size, family.forms.length);
      assert.equal(new Set(family.forms.map(form => form.effect)).size, family.forms.length);
      assert.ok(family.forms.every(form => form.affix && form.explanation));
      for (const direction of ['understand', 'select']) {
        for (const question of familyQuestions(family, direction)) {
          assert.ok(!allQuestionIds.has(question.id));
          allQuestionIds.add(question.id);
          assert.equal(question.choices.filter(choice => choice === question.answer).length, 1);
          assert.ok(question.explanation.includes(family.root));
        }
      }
    }
  }
});

test('select a form uses only sibling words from the same root', () => {
  const family = MORPH_FAMILIES.find(family => family.root === 'tulis');
  assert.equal(family.pbwlRootId, 190);
  const questions = familyQuestions(family, 'select');
  const writer = questions.find(question => question.answer === 'penulis');
  assert.match(writer.prompt, /person who writes/);
  assert.deepEqual(writer.choices, ['menulis', 'ditulis', 'penulis', 'tulisan']);
  assert.match(writer.explanation, /peN-/);
});

test('affix effect recognition contrasts the meanings of sibling forms', () => {
  const family = MORPH_FAMILIES.find(family => family.root === 'tulis');
  const writer = familyQuestions(family, 'understand').find(question => question.prompt.includes('penulis'));
  assert.equal(writer.answer, 'a person who writes');
  assert.deepEqual(writer.choices, family.forms.map(form => form.effect));
  assert.match(writer.explanation, /peN-/);
  assert.notEqual(writer.id, familyQuestions(family, 'select').find(question => question.answer === 'penulis').id);
});

test('diri family contrasts standing, founding, founder, and the lexicalized terdiri dari', () => {
  const family = MORPH_FAMILIES.find(family => family.root === 'diri');
  assert.equal(family.pbwlRootId, 114);
  assert.deepEqual(family.forms.map(form => form.word), ['berdiri', 'terdiri', 'mendirikan', 'pendiri']);
  assert.ok(family.forms.find(form => form.word === 'terdiri').explanation.includes('lexicalized'));
});
