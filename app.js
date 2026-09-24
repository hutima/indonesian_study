import { UNITS, UNIT_URLS } from './content/manifest.js';
import { loadProgress, normalizeProgress, saveProgress, recordAnswer, recordVocabReview, dueVocab } from './progress.js';
import { createDeck, markDeck } from './vocab-deck.js';
import { dueBuckets, confidenceBuckets } from './vocab-charts.js';
import { advanceSelection } from './navigation.js';

const panel = document.querySelector('#study-panel');
const select = document.querySelector('#unit-select');
const description = document.querySelector('#unit-description');
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
let spaced = true;
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
  const cards = poolVocab();
  const reviewed = cards.filter(card => progress.items[card.id]);
  const mastered = reviewed.filter(card => (progress.items[card.id].streak || 0) >= 3).length;
  const due = dueVocab(cards, progress).length;
  analytics.replaceChildren(
    node('strong', '', 'Vocabulary review'),
    node('span', '', `${reviewed.length} practiced · ${mastered} with 3+ Know reviews · ${due} due`),
    buildDueHistogram(cards, progress),
    buildConfidenceHistogram(cards, progress)
  );
}

function histogram(title, counts, labels) {
  const details = node('details', 'histogram');
  details.open = title === 'Due by day';
  const summary = node('summary', '', title);
  const bars = node('div', 'histogram-bars');
  const last = Math.max(2, counts.findLastIndex(n => n > 0));
  const max = Math.max(...counts, 1);
  counts.slice(0, last + 1).forEach((value, index) => {
    const column = node('div', 'histogram-column');
    column.title = `${labels[index]}: ${value} cards`;
    add(column, node('span', 'histogram-count', value || ''), node('span', 'histogram-bar'));
    column.querySelector('.histogram-bar').style.height = `${Math.max(3, Math.round(value / max * 56))}px`;
    column.append(node('span', 'histogram-label', labels[index]));
    bars.append(column);
  });
  details.append(summary, bars);
  return details;
}
function buildDueHistogram(cards, state) {
  const labels = ['now', 'today', ...Array.from({length:13}, (_, i) => `${i + 1}d`), '14d+'];
  return histogram('Due by day', dueBuckets(cards, state), labels);
}
function buildConfidenceHistogram(cards, state) {
  return histogram('Recognition confidence', confidenceBuckets(cards, state), ['new', '0–19', '20–39', '40–59', '60–79', '80–100']);
}

function head(label, count) {
  const header = node('div', 'study-head');
  add(header, node('span', 'kicker', label), node('span', 'count', count));
  panel.append(header);
}

function nextItem() {
  const items = pool();
  const next = advanceSelection(itemIndex, items.length, unitIndex, UNITS.length);
  if (next.unitIndex !== unitIndex) {
    itemIndex = next.index;
    unitIndex = next.unitIndex;
    select.value = String(unitIndex);
    description.textContent = UNITS[unitIndex].description + ' Includes earlier units for review.';
    renderProgress();
  } else itemIndex = next.index;
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
  deck = markDeck(deck, spaced && rating === 'again' && progress.items[id].leechDrill ? 'unsure' : rating);
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
  panel.append(node('p', 'card-instruction', 'Tap to flip · Space or Enter · Rate from either side'));
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
  for (const [label, rating, hint] of [['Again', 'again', '1'], ['Unsure', 'unsure', '2'], ['Next (Know)', 'know', '3']]) {
    const action = button(`${label}  ${hint}`, rating === 'know' ? 'primary' : 'secondary', () => markVocab(item.id, rating));
    actions.append(action);
  }
  panel.append(actions);
  panel.append(node('p', 'review-hint', spaced ? 'Duff 8-month SRS · Again: requeue · Unsure: 2 hr · Know: from 22 hr' : 'Again returns later in this deck · Unsure and Know complete this round'));
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
  panel.append(button(itemIndex === items.length - 1 && unitIndex < UNITS.length - 1 ? 'Skip to next unit' : 'Skip to next form', 'skip-link', nextItem));
}

function renderMorphSummary(item, items) {
  head('MORPHOLOGY · ANALYSIS', countLabel(itemIndex, items.length));
  panel.append(node('h2', '', item.form));
  const details = node('dl', 'analysis');
  for (const [key, value] of [['Root', item.root], ['Affixes', item.affixes.length ? item.affixes.join(' + ') : 'none'], ['Affix effect / form', item.process], ['In context', item.meaning]]) {
    add(details, node('dt', '', key), node('dd', '', value));
  }
  panel.append(details, button(itemIndex === items.length - 1 && unitIndex < UNITS.length - 1 ? 'Next unit' : 'Next form', 'primary', nextItem));
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
  if (event.target.closest('input, select, textarea, dialog')) return;
  if (['Digit1', 'Digit2', 'Digit3'].includes(event.code)) {
    event.preventDefault(); markVocab(deck.active[0], { Digit1: 'again', Digit2: 'unsure', Digit3: 'know' }[event.code]);
    return;
  }
  if (event.target.closest('button, summary')) return;
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); flipCard(); }
});
const themeSelect = document.querySelector('#theme-select');
const THEME_KEY = 'indonesian-study-theme';
let theme = ['system','light','dark'].includes(localStorage.getItem(THEME_KEY)) ? localStorage.getItem(THEME_KEY) : 'system';
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const dark = theme === 'dark' || theme === 'system' && systemTheme.matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#29141c' : '#63303a';
  themeSelect.value = theme;
}
themeSelect.addEventListener('change', () => { theme = themeSelect.value; localStorage.setItem(THEME_KEY, theme); applyTheme(); });
systemTheme.addEventListener?.('change', applyTheme);
applyTheme();
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
    window.addEventListener('pageshow', checkForUpdate);
    window.addEventListener('focus', checkForUpdate);
    checkForUpdate();
    const active = (await navigator.serviceWorker.ready).active;
    if (!active) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = event => { status.textContent = event.data?.ready ? 'Ready offline' : 'Offline setup incomplete'; };
    active.postMessage({ type: 'CACHE_CONTENT', urls: UNIT_URLS }, [channel.port2]);
  }).catch(() => { status.textContent = 'Offline setup unavailable'; });
} else status.textContent = 'Use a local server for offline installation';
