import { UNITS, UNIT_URLS } from './content/manifest.js';
import { loadProgress, normalizeProgress, saveProgress, recordAnswer } from './progress.js';

const panel = document.querySelector('#study-panel');
const select = document.querySelector('#unit-select');
const description = document.querySelector('#unit-description');
const summary = document.querySelector('#progress-summary');
const status = document.querySelector('#offline-status');
let progress = loadProgress(localStorage);
let mode = 'vocabulary';
let unitIndex = UNITS.length - 1;
let itemIndex = 0;
let stepIndex = 0;
let revealed = false;
let chosen = null;
let translationShown = false;

const node = (tag, className, content) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = String(content);
  return element;
};
const add = (parent, ...children) => { children.forEach(child => parent.append(child)); return parent; };
const button = (label, className, action) => {
  const element = node('button', className, label);
  element.type = 'button'; element.addEventListener('click', action); return element;
};
const pool = () => UNITS.slice(0, unitIndex + 1).flatMap(unit => unit[mode] || (mode === 'reading' ? unit.readings : []));
const startOfSelectedUnit = () => UNITS.slice(0, unitIndex).reduce((sum, unit) => sum + (mode === 'reading' ? unit.readings.length : unit[mode].length), 0);
const countLabel = (index, total) => `${index + 1} of ${total}`;

function saveMark(id, result) {
  progress = recordAnswer(progress, id, result);
  saveProgress(localStorage, progress);
  renderProgress();
}

function renderProgress() {
  const all = UNITS.flatMap(unit => [...unit.vocabulary, ...unit.morphology, ...unit.readings.flatMap(reading => reading.questions)]);
  const seen = all.filter(item => {
    if (item.steps) return item.steps.some((_, index) => progress.items[`${item.id}.s${index + 1}`]);
    return !!progress.items[item.id];
  }).length;
  summary.replaceChildren(add(node('strong', '', `${seen} / ${all.length}`), document.createTextNode('items practiced across all units')));
}

function head(label, count) {
  const header = node('div', 'study-head');
  add(header, node('span', 'kicker', label), node('span', 'count', count));
  panel.append(header);
}

function nextItem() {
  itemIndex = (itemIndex + 1) % pool().length;
  stepIndex = 0; chosen = null; revealed = false; translationShown = false;
  render();
}

function renderVocab(item, items) {
  head('VOCABULARY', countLabel(itemIndex, items.length));
  add(panel, node('h2', '', 'What does this mean?'), node('div', 'word', item.form), node('div', 'context', item.example));
  if (!revealed) {
    panel.append(button('Show meaning', 'primary reveal', () => { revealed = true; render(); }));
    return;
  }
  const box = node('div', 'answer');
  add(box, node('strong', '', item.meaning));
  if (item.note) box.append(node('p', '', item.note));
  panel.append(box);
  const actions = node('div', 'actions');
  for (const [label, result] of [['Again', 'wrong'], ['Unsure', 'wrong'], ['Know', 'correct']]) {
    actions.append(button(label, result === 'correct' ? 'primary' : 'secondary', () => { saveMark(item.id, result); nextItem(); }));
  }
  panel.append(actions);
}

function choices(question, progressId, next) {
  panel.append(node('h2', '', question.prompt));
  const group = node('div', 'choices');
  for (const choice of question.choices) {
    const option = button(choice, 'choice', () => {
      if (chosen !== null) return;
      chosen = choice;
      saveMark(progressId, choice === question.answer ? 'correct' : 'wrong');
      render();
    });
    if (chosen !== null) {
      option.disabled = true;
      if (choice === question.answer) option.classList.add('correct');
      else if (choice === chosen) option.classList.add('incorrect');
    }
    group.append(option);
  }
  panel.append(group);
  if (chosen === null) return;
  const feedback = node('div', chosen === question.answer ? 'feedback' : 'feedback wrong');
  add(feedback, node('strong', '', chosen === question.answer ? 'Correct' : `Answer: ${question.answer}`), node('span', '', question.explanation));
  panel.append(feedback, button('Continue', 'primary', next));
}

function renderMorphology(item, items) {
  head('MORPHOLOGY · ROOT + AFFIX', `${countLabel(itemIndex, items.length)} · step ${stepIndex + 1} of ${item.steps.length}`);
  add(panel, node('div', 'word', item.form), node('div', 'context', item.context));
  choices(item.steps[stepIndex], `${item.id}.s${stepIndex + 1}`, () => {
    chosen = null;
    if (stepIndex + 1 < item.steps.length) { stepIndex++; render(); }
    else { stepIndex = item.steps.length; render(); }
  });
}

function renderMorphSummary(item, items) {
  head('MORPHOLOGY · ANALYSIS', countLabel(itemIndex, items.length));
  panel.append(node('h2', '', item.form));
  const details = node('dl', 'analysis');
  for (const [key, value] of [['Root', item.root], ['Affixes', item.affixes.length ? item.affixes.join(' + ') : 'none'], ['Change', item.process], ['In context', item.meaning]]) {
    add(details, node('dt', '', key), node('dd', '', value));
  }
  panel.append(details, button('Next form', 'primary', nextItem));
}

function renderReading(item, items) {
  const question = item.questions[stepIndex];
  head('GRADED READING', `${countLabel(itemIndex, items.length)} · question ${stepIndex + 1} of ${item.questions.length}`);
  add(panel, node('h2', '', item.title), node('div', 'passage', item.text));
  panel.append(button(translationShown ? 'Hide translation' : 'Show translation', 'secondary', () => { translationShown = !translationShown; render(); }));
  if (translationShown) panel.append(node('p', 'passage-translation', item.translation));
  choices(question, question.id, () => {
    chosen = null;
    if (stepIndex + 1 < item.questions.length) { stepIndex++; render(); }
    else nextItem();
  });
}

function render() {
  panel.replaceChildren();
  const items = pool();
  if (!items.length) { panel.append(node('p', 'empty', 'No exercises in this selection yet.')); return; }
  itemIndex %= items.length;
  const item = items[itemIndex];
  if (mode === 'vocabulary') renderVocab(item, items);
  else if (mode === 'morphology') {
    if (stepIndex >= item.steps.length) renderMorphSummary(item, items);
    else renderMorphology(item, items);
  } else renderReading(item, items);
}

UNITS.forEach((unit, index) => { const option = node('option', '', `${index + 1}. ${unit.title}`); option.value = String(index); select.append(option); });
select.value = String(unitIndex);
function updateUnit() { description.textContent = UNITS[unitIndex].description + ' Includes earlier units for review.'; itemIndex = startOfSelectedUnit(); stepIndex = 0; chosen = null; revealed = false; translationShown = false; render(); }
select.addEventListener('change', () => { unitIndex = Number(select.value); updateUnit(); });
document.querySelectorAll('[data-mode]').forEach(tab => tab.addEventListener('click', () => {
  mode = tab.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(other => { if (other === tab) other.setAttribute('aria-current', 'page'); else other.removeAttribute('aria-current'); });
  itemIndex = startOfSelectedUnit(); stepIndex = 0; chosen = null; revealed = false; translationShown = false; render();
}));
document.querySelector('#export-button').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'indonesian-study-progress.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('#import-file').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (imported?.version !== 1 || !imported.items || typeof imported.items !== 'object' || Array.isArray(imported.items)) throw new Error('Invalid progress file');
    progress = normalizeProgress(imported); saveProgress(localStorage, progress); renderProgress();
    alert('Progress imported.');
  } catch { alert('Could not read this progress file.'); }
  event.target.value = '';
});
document.querySelector('#reset-button').addEventListener('click', () => {
  if (!confirm('Clear all Indonesian Study progress in this browser?')) return;
  progress = normalizeProgress(null); saveProgress(localStorage, progress); renderProgress(); render();
});
renderProgress(); updateUnit();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').then(async () => {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active;
    if (!worker) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = event => { if (event.data?.ready) status.textContent = 'Ready offline'; else status.textContent = 'Offline setup incomplete'; };
    worker.postMessage({ type: 'CACHE_CONTENT', urls: UNIT_URLS }, [channel.port2]);
  }).catch(() => { status.textContent = 'Offline setup unavailable'; });
} else status.textContent = 'Use a local server for offline installation';
