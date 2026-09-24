import { UNITS } from '../content/manifest.js';

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

function checkQuestion(question, path, unitId, ids, issues) {
  if (!question || typeof question !== 'object') {
    issues.push(`${path}: question must be an object`);
    return;
  }
  addId(question.id, `${path}.id`, ids, issues);
  if (question.unitId !== unitId) issues.push(`${path}.unitId: must reference ${unitId}`);
  for (const key of ['prompt', 'answer', 'explanation']) {
    if (!isNonEmptyString(question[key])) issues.push(`${path}.${key}: expected non-empty string`);
  }
  checkChoices(question.choices, question.answer, path, issues);
}

function addId(id, path, ids, issues) {
  if (!isNonEmptyString(id)) {
    issues.push(`${path}: expected non-empty stable ID`);
  } else if (ids.has(id)) {
    issues.push(`Duplicate ID: ${id}`);
  } else {
    ids.add(id);
  }
}

function checkChoices(choices, answer, path, issues) {
  if (!Array.isArray(choices) || choices.length < 2 || choices.length > 4) {
    issues.push(`${path}.choices: expected 2–4 choices`);
    return;
  }
  if (choices.some(choice => !isNonEmptyString(choice))) issues.push(`${path}.choices: each choice must be a non-empty string`);
  if (new Set(choices).size !== choices.length) issues.push(`${path}.choices: choices must be distinct`);
  if (typeof answer === 'string' && choices.filter(choice => choice === answer).length !== 1) {
    issues.push(`${path}.answer: answer must occur exactly once in choices`);
  }
}

export function validateContent(units) {
  const issues = [];
  if (!Array.isArray(units) || units.length === 0) return ['manifest: expected a non-empty array of units'];
  const ids = new Set();
  const bookTopics = new Set();
  for (const [unitIndex, unit] of units.entries()) {
    const path = `units[${unitIndex}]`;
    if (!unit || typeof unit !== 'object') {
      issues.push(`${path}: expected unit object`);
      continue;
    }
    addId(unit.id, `${path}.id`, ids, issues);
    for (const key of ['title', 'description']) {
      if (!isNonEmptyString(unit[key])) issues.push(`${path}.${key}: expected non-empty string`);
    }
    if (!Number.isInteger(unit.level) || unit.level < 1) issues.push(`${path}.level: expected positive integer`);
    if (unit.bookTopic !== undefined) {
      if (!Number.isInteger(unit.bookTopic) || unit.bookTopic < 1 || unit.bookTopic > 15) issues.push(`${path}.bookTopic: expected Topik number 1–15`);
      if (bookTopics.has(unit.bookTopic)) issues.push(`${path}.bookTopic: duplicate textbook lesson`);
      bookTopics.add(unit.bookTopic);
    }
    if (unit.guide !== undefined) {
      for (const mode of ['vocabulary', 'morphology', 'reading']) {
        if (!isNonEmptyString(unit.guide?.[mode])) issues.push(`${path}.guide.${mode}: expected lesson focus`);
      }
    }
    const vocabularyForms = new Set();
    if (unit.bookTopic !== undefined && (!Array.isArray(unit.grammar) || unit.grammar.length < 3)) {
      issues.push(`${path}.grammar: expected at least three questions for textbook topics`);
    }
    if (unit.grammar !== undefined) {
      if (!Array.isArray(unit.grammar)) issues.push(`${path}.grammar: expected array`);
      else unit.grammar.forEach((question, index) => {
        const questionPath = `${path}.grammar[${index}]`;
        checkQuestion(question, questionPath, unit.id, ids, issues);
        if (!isNonEmptyString(question?.context)) issues.push(`${questionPath}.context: expected an original contextual sentence`);
      });
    }
    for (const kind of ['vocabulary', 'morphology', 'readings']) {
      if (!Array.isArray(unit[kind])) {
        issues.push(`${path}.${kind}: expected array`);
        continue;
      }
      for (const [itemIndex, item] of unit[kind].entries()) {
        const itemPath = `${path}.${kind}[${itemIndex}]`;
        if (!item || typeof item !== 'object') {
          issues.push(`${itemPath}: expected item object`);
          continue;
        }
        addId(item.id, `${itemPath}.id`, ids, issues);
        if (item.unitId !== unit.id) issues.push(`${itemPath}.unitId: must reference ${unit.id}`);
        if (kind === 'vocabulary') {
          for (const key of ['form', 'meaning', 'example']) if (!isNonEmptyString(item[key])) issues.push(`${itemPath}.${key}: expected non-empty string`);
          if (isNonEmptyString(item.form)) {
            const key = item.form.toLocaleLowerCase('id');
            if (vocabularyForms.has(key)) issues.push(`${itemPath}.form: duplicate vocabulary form in unit`);
            vocabularyForms.add(key);
          }
          if (!['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'determiner', 'preposition', 'conjunction', 'modal', 'interrogative', 'interjection', 'particle'].includes(item.pos)) issues.push(`${itemPath}.pos: expected supported part-of-speech label`);
          if (!['neutral', 'formal', 'informal'].includes(item.register)) issues.push(`${itemPath}.register: expected neutral, formal, or informal`);
          if (!['root', 'derived'].includes(item.kind)) issues.push(`${itemPath}.kind: expected root or derived`);
          if (item.kind === 'derived' && !isNonEmptyString(item.root)) issues.push(`${itemPath}.root: derived vocabulary must identify its root`);
          if (item.irregular !== undefined && typeof item.irregular !== 'boolean') issues.push(`${itemPath}.irregular: expected boolean when provided`);
          if (item.sourceRootId !== undefined && (!Number.isInteger(item.sourceRootId) || item.sourceRootId < 1)) issues.push(`${itemPath}.sourceRootId: expected a positive PBWL RootID`);
          if (item.section !== undefined && !['families', 'reading', 'everyday'].includes(item.section)) issues.push(`${itemPath}.section: expected a vocabulary section`);
          if (item.sourceRootId !== undefined && isNonEmptyString(item.form) && isNonEmptyString(item.example) && !item.example.toLocaleLowerCase('id').includes(item.form.toLocaleLowerCase('id'))) issues.push(`${itemPath}.example: must contain the sourced form`);
        } else if (kind === 'morphology') {
          for (const key of ['form', 'context', 'root', 'process', 'meaning']) if (!isNonEmptyString(item[key])) issues.push(`${itemPath}.${key}: expected non-empty string`);
          if (!Array.isArray(item.affixes) || item.affixes.some(affix => !isNonEmptyString(affix))) issues.push(`${itemPath}.affixes: expected array of strings`);
          if (!Array.isArray(item.steps) || item.steps.length === 0) {
            issues.push(`${itemPath}.steps: expected at least one step`);
          } else {
            item.steps.forEach((step, stepIndex) => {
              const stepPath = `${itemPath}.steps[${stepIndex}]`;
              for (const key of ['prompt', 'answer', 'explanation']) if (!isNonEmptyString(step?.[key])) issues.push(`${stepPath}.${key}: expected non-empty string`);
              checkChoices(step?.choices, step?.answer, stepPath, issues);
            });
          }
        } else {
          for (const key of ['title', 'text', 'translation']) if (!isNonEmptyString(item[key])) issues.push(`${itemPath}.${key}: expected non-empty string (reading text required for linked questions)`);
          if (!Array.isArray(item.questions) || item.questions.length === 0) {
            issues.push(`${itemPath}.questions: expected at least one question`);
          } else {
            item.questions.forEach((question, questionIndex) => checkQuestion(question, `${itemPath}.questions[${questionIndex}]`, unit.id, ids, issues));
          }
        }
      }
    }
  }
  return issues;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const issues = validateContent(UNITS);
  if (issues.length) {
    console.error(`Content validation failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log(`Content valid: ${UNITS.length} units.`);
  }
}
