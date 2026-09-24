import test from 'node:test';
import assert from 'node:assert/strict';
import { UNITS, FOUNDATION_UNITS, TEXTBOOK_UNITS, UNIT_URLS } from '../content/manifest.js';
import { validateContent } from '../scripts/validate-content.mjs';

test('curated units have unique stable IDs and complete vocabulary and question data', () => {
  const issues = validateContent(UNITS);
  assert.deepEqual(issues, []);
  assert.equal(FOUNDATION_UNITS.length, 5);
  assert.equal(TEXTBOOK_UNITS.length, 15);
  assert.equal(UNITS.length, 20);
  assert.equal(UNIT_URLS.length, UNITS.length + 1); // one shared vocabulary supplement module
  assert.deepEqual(TEXTBOOK_UNITS.map(unit => unit.bookTopic), Array.from({ length: 15 }, (_, i) => i + 1));
  for (const unit of UNITS) {
    assert.ok(unit.vocabulary.length > 0);
    for (const item of [...unit.vocabulary, ...unit.morphology, ...unit.readings]) assert.equal(item.unitId, unit.id);
    assert.ok(unit.morphology.length > 0);
    assert.ok(unit.readings.length > 0);
  }
  const newVocabulary = UNITS[2].vocabulary;
  assert.ok(newVocabulary.length >= 30);
  assert.ok(newVocabulary.every(item => item.pos && item.register && item.kind && (item.kind !== 'derived' || item.root)));
  assert.ok(UNITS[2].morphology.some(card => card.steps.some(step => step.focus === 'semantic')));
  assert.ok(UNITS[2].morphology.every(card => card.steps.some(step => step.focus === 'semantic')));
  for (const unit of FOUNDATION_UNITS.slice(3)) {
    assert.ok(unit.guide.vocabulary && unit.guide.morphology && unit.guide.reading);
    assert.ok(unit.vocabulary.length >= 12);
    assert.ok(unit.morphology.every(card => card.steps.some(step => step.focus === 'semantic')));
  }
  for (const unit of TEXTBOOK_UNITS) {
    assert.ok(unit.vocabulary.length >= 20);
    assert.ok(unit.readings.every(reading => reading.questions.length >= 2));
    assert.ok(unit.vocabulary.every(card => card.pos && card.register && card.kind));
    assert.ok(unit.grammar.length >= 3);
    assert.ok(unit.grammar.every(question => question.unitId === unit.id));
  }
  const supplemented = TEXTBOOK_UNITS.flatMap(unit => unit.vocabulary.filter(card => card.sourceRootId));
  assert.ok(supplemented.length >= 40);
  assert.ok(supplemented.every(card => Number.isInteger(card.sourceRootId) && card.example.toLowerCase().includes(card.form.toLowerCase())));
});

test('validator rejects grammar answers missing from choices and duplicate question IDs', () => {
  const units = structuredClone(UNITS);
  units[5].grammar[0].answer = 'not an option';
  units[5].grammar[1].id = units[5].grammar[0].id;
  const issues = validateContent(units);
  assert.ok(issues.some(issue => issue.includes('.grammar[0].answer')));
  assert.ok(issues.some(issue => issue.includes('Duplicate ID')));
});

test('validator rejects duplicate IDs and incorrect answer choice sets', () => {
  const invalid = [{
    id: 'unit-x', title: 'x', level: 1, description: 'x',
    vocabulary: [{ id: 'same', form: 'x', meaning: 'x', example: 'x' }],
    morphology: [{
      id: 'same', form: 'x', context: 'x', root: 'x', affixes: [], process: 'x', meaning: 'x',
      steps: [{ prompt: 'x', choices: ['a', 'b'], answer: 'missing', explanation: 'x' }]
    }],
    readings: [{ id: 'r', title: 'r', text: 'x', translation: 'x', questions: [{
      id: 'q', prompt: 'x', choices: ['a', 'a'], answer: 'a', explanation: 'x'
    }] }]
  }];
  const issues = validateContent(invalid);
  assert.ok(issues.some(issue => issue.includes('Duplicate ID')));
  assert.ok(issues.some(issue => issue.includes('answer')));
  assert.ok(issues.some(issue => issue.includes('distinct')));
});

test('validator rejects reading questions without passage context', () => {
  const invalid = [{
    id: 'unit-x', title: 'x', level: 1, description: 'x', vocabulary: [], morphology: [],
    readings: [{ id: 'r', title: 'r', text: '', translation: '', questions: [{
      id: 'q', prompt: 'x', choices: ['a', 'b'], answer: 'a', explanation: 'x'
    }] }]
  }];
  assert.ok(validateContent(invalid).some(issue => issue.includes('reading text')));
});

test('validator rejects a question attached to the wrong unit', () => {
  const units = structuredClone(UNITS);
  units[0].readings[0].questions[0].unitId = 'nonexistent';
  assert.ok(validateContent(units).some(issue => issue.includes('must reference')));
});
