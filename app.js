import { UNITS, UNIT_URLS } from './content/manifest.js';
import { loadProgress, normalizeProgress, saveProgress, recordAnswer, recordVocabReview, dueVocab } from './progress.js';
import { createDeck, markDeck } from './vocab-deck.js';

const panel = document.querySelector('#study-panel');
const select = document.querySelector('#unit-select');
const description = document.querySelector('#unit-description');
const summary = document.querySelector('#progress-summary');
const status = document.querySelector('#offline-status');
const analytics = document.querySelector('#vocab-analytics');
const toolbar = document.querySelector('#vocab-toolbar');
const spacedButton = document.querySelector('#spaced-toggle');
const directionButton = document.querySelector('#direction-toggle');
let progress = loadProgress(localStorage);
let mode = 'vocabulary';
let unitIndex = UNITS.length - 1;
let itemIndex = 0;
let stepIndex = 0;
let revealed = false;
let chosen = null;
let translationShown = false;
let spaced = false;
let reverse = false;
let deck;

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
  const cards = poolVocab();
  const reviewed = cards.filter(card => progress.items[card.id]);
  const mastered = reviewed.filter(card => (progress.items[card.id].streak || 0) >= 3).length;
  const due = dueVocab(cards, progress).length;
  analytics.replaceChildren(
    node('strong', '', 'Vocabulary'),
    node('span', '', `${reviewed.length} / ${cards.length} practiced`),
    node('span', '', `${mastered} at 3+ spaced Know reviews`),
    node('span', '', `${due} ready for spaced review`)
  );
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

const poolVocab = () => UNITS.slice(0, unitIndex + 1).flatMap(unit => unit.vocabulary);
function startVocabDeck() {
  deck = createDeck(poolVocab(), progress, spaced);
  revealed = false;
}
function markVocab(id, rating) {
  progress = recordVocabReview(progress, id, rating, spaced);
  saveProgress(localStorage, progress);
  deck = markDeck(deck, spaced && rating === 'again' ? 'unsure' : rating);
  revealed = false;
  renderProgress(); render();
}
function metadata(item) {
  const meta = node('div', 'card-meta');
  for (const value of [item.pos, item.register, item.kind === 'derived' ? 'Affixed form' : 'Root / base', item.irregular ? 'Irregular meaning or form' : null].filter(Boolean)) {
    meta.append(node('span', 'meta-chip', value));
  }
  return meta;
}
function flipCard() {
  const card = document.querySelector('.flashcard');
  if (!card) return;
  revealed = !revealed;
  card.classList.toggle('flipped', revealed);
  card.setAttribute('aria-pressed', String(revealed));
  card.setAttribute('aria-label', `${revealed ? 'Hide' : 'Show'} ${reverse ? 'Indonesian' : 'English'} meaning`);
  document.querySelectorAll('.review-actions button').forEach(action => { action.disabled = !revealed; });
}
function renderVocab() {
  const items = poolVocab();
  if (!deck) startVocabDeck();
  head('VOCABULARY · FLIP CARDS', `${deck.completed} of ${deck.total} completed`);
  if (!deck.active.length) {
    add(panel, node('h2', '', spaced ? 'All caught up' : 'Deck complete'), node('p', 'subtitle', spaced ? 'No cards are due right now. Turn off spaced review to practice the full deck.' : 'You finished this practice deck. Start again to review.'));
    panel.append(button(spaced ? 'Check due cards' : 'Practice again', 'primary', () => { startVocabDeck(); render(); }));
    return;
  }
  const item = items.find(card => card.id === deck.active[0]);
  if (!item) { startVocabDeck(); render(); return; }
  panel.append(node('p', 'card-instruction', 'Tap the card to flip · Space or Enter also flips'));
  const card = button('', `flashcard${revealed ? ' flipped' : ''}`, flipCard);
  card.setAttribute('aria-label', `${revealed ? 'Hide' : 'Show'} ${reverse ? 'Indonesian' : 'English'} for ${reverse ? item.meaning : item.form}`);
  card.setAttribute('aria-pressed', String(revealed));
  const inner = node('span', 'flashcard-inner');
  const front = node('span', 'flashcard-face face-front');
  add(front, node('span', 'card-side', reverse ? 'ENGLISH · WHAT IS THE INDONESIAN?' : 'INDONESIAN · WHAT DOES IT MEAN?'), node('span', 'card-word', reverse ? item.meaning : item.form), metadata(item), node('span', 'card-hint', 'Tap to flip ↻'));
  const back = node('span', 'flashcard-face face-back');
  add(back, node('span', 'card-side', reverse ? 'INDONESIAN' : 'ENGLISH'), node('span', 'card-word', reverse ? item.form : item.meaning), metadata(item));
  if (item.root) back.append(node('span', 'card-note', `Root: ${item.root}`));
  if (item.example) back.append(node('span', 'card-example', item.example));
  if (item.note) back.append(node('span', 'card-note', item.note));
  inner.append(front, back); card.append(inner); panel.append(card);
  const actions = node('div', 'actions review-actions');
  for (const [label, rating, hint] of [['Again', 'again', '1'], ['Unsure', 'unsure', '2'], ['Know', 'know', '3']]) {
    const action = button(`${label}  ${hint}`, rating === 'know' ? 'primary' : 'secondary', () => markVocab(item.id, rating));
    action.disabled = !revealed;
    actions.append(action);
  }
  panel.append(actions);
  panel.append(node('p', 'review-hint', spaced ? 'Again: 5 min · Unsure: 6 hr · Know: 1 day, then longer intervals' : 'Again returns later in this deck · Unsure and Know complete this round'));
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
  for (const [key, value] of [['Root', item.root], ['Affixes', item.affixes.length ? item.affixes.join(' + ') : 'none'], ['Affix effect / form', item.process], ['In context', item.meaning]]) {
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
  toolbar.hidden = mode !== 'vocabulary';
  analytics.hidden = mode !== 'vocabulary';
  if (mode === 'vocabulary') { renderVocab(); return; }
  const items = pool();
  if (!items.length) { panel.append(node('p', 'empty', 'No exercises in this selection yet.')); return; }
  itemIndex %= items.length;
  const item = items[itemIndex];
  if (mode === 'morphology') {
    if (stepIndex >= item.steps.length) renderMorphSummary(item, items);
    else renderMorphology(item, items);
  } else renderReading(item, items);
}

UNITS.forEach((unit, index) => { const option = node('option', '', `${index + 1}. ${unit.title}`); option.value = String(index); select.append(option); });
select.value = String(unitIndex);
function updateUnit() { description.textContent = UNITS[unitIndex].description + ' Includes earlier units for review.'; itemIndex = startOfSelectedUnit(); stepIndex = 0; chosen = null; revealed = false; translationShown = false; startVocabDeck(); renderProgress(); render(); }
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
    progress = normalizeProgress(imported); saveProgress(localStorage, progress); startVocabDeck(); renderProgress(); render();
    alert('Progress imported.');
  } catch { alert('Could not read this progress file.'); }
  event.target.value = '';
});
document.querySelector('#reset-button').addEventListener('click', () => {
  if (!confirm('Clear all Indonesian Study progress in this browser?')) return;
  progress = normalizeProgress(null); saveProgress(localStorage, progress); startVocabDeck(); renderProgress(); render();
});
spacedButton.addEventListener('click', () => { spaced = !spaced; spacedButton.setAttribute('aria-pressed', String(spaced)); spacedButton.textContent = `Spaced review: ${spaced ? 'On' : 'Off'}`; startVocabDeck(); render(); });
directionButton.addEventListener('click', () => { reverse = !reverse; directionButton.setAttribute('aria-pressed', String(reverse)); directionButton.textContent = reverse ? 'English → Indonesian' : 'Indonesian → English'; revealed = false; render(); });
document.querySelector('#shuffle-button').addEventListener('click', () => {
  if (!deck) startVocabDeck();
  const active = [...deck.active];
  for (let i = active.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [active[i], active[j]] = [active[j], active[i]]; }
  deck = { ...deck, active }; revealed = false; render();
});
document.addEventListener('keydown', event => {
  if (mode !== 'vocabulary' || !deck?.active.length || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('button, input, select, textarea, summary, dialog')) return;
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); flipCard(); }
  if (revealed && ['Digit1', 'Digit2', 'Digit3'].includes(event.code)) {
    event.preventDefault(); markVocab(deck.active[0], { Digit1: 'again', Digit2: 'unsure', Digit3: 'know' }[event.code]);
  }
});
renderProgress(); updateUnit();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const dialog = document.querySelector('#update-dialog');
  let waiting = null;
  let refreshRequested = false;
  const showUpdate = registration => {
    if (!navigator.serviceWorker.controller || !registration.waiting) return;
    waiting = registration.waiting;
    if (!dialog.open) dialog.showModal();
  };
  document.querySelector('#update-later').addEventListener('click', () => dialog.close());
  document.querySelector('#update-now').addEventListener('click', () => {
    if (!waiting) return;
    refreshRequested = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshRequested) location.reload();
  });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(async registration => {
    showUpdate(registration);
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed') showUpdate(registration);
      });
    });
    const checkForUpdate = () => { registration.update().then(() => showUpdate(registration)).catch(() => {}); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkForUpdate(); });
    checkForUpdate();
    const active = (await navigator.serviceWorker.ready).active;
    if (!active) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = event => { status.textContent = event.data?.ready ? 'Ready offline' : 'Offline setup incomplete'; };
    active.postMessage({ type: 'CACHE_CONTENT', urls: UNIT_URLS }, [channel.port2]);
  }).catch(() => { status.textContent = 'Offline setup unavailable'; });
} else status.textContent = 'Use a local server for offline installation';
