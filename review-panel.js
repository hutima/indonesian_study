import { UNITS, TEXTBOOK_UNITS } from './content/manifest.js';
import { loadProgress, normalizeProgress, saveProgress, getCardStats } from './progress.js';
import { createDeck } from './vocab-deck.js';
import { SELECTION_KEY, normalizeLessonIds, itemsForMode } from './lesson-selection.js';
import { VOCAB_SECTIONS, filterVocabSection } from './vocab-sections.js';
import { resolveCustomVocabulary } from './content/vocab/custom-focus.js';
import {
  buildReviewPanelModel,
  sortReviewedCards,
  returnCardToDeck,
  advanceVocabSchedule,
  returnCardProgressNow
} from './vocab-review.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const VOCAB_DIRECTION_KEY = 'indonesian-study-vocab-direction-v1';
const VOCAB_SECTION_KEY = 'indonesian-study-vocab-section-v1';
const VOCAB_DECK_KEY = 'indonesian-study-vocab-deck-v1';
const SHUFFLE_KEY = 'indonesian-study-shuffle-v1';

const shell = document.querySelector('#review-shell');
const panel = document.querySelector('#review-panel');
const deckTag = document.querySelector('#review-deck-tag');
const statsHost = document.querySelector('#review-stats');
const sortHost = document.querySelector('#review-sort-row');
const listHost = document.querySelector('#review-list');
const ffRow = document.querySelector('#ff-row');
const studyPanel = document.querySelector('#study-panel');

let sortMode = 'lastSeen';
let renderQueued = false;

function node(tag, className = '', text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = String(text);
  return element;
}

function currentDirection() {
  return localStorage.getItem(VOCAB_DIRECTION_KEY) === 'e2i' ? 'e2i' : 'i2e';
}

function currentSection() {
  const stored = localStorage.getItem(VOCAB_SECTION_KEY);
  return VOCAB_SECTIONS.some(([key]) => key === stored) ? stored : 'all';
}

function currentDeckMode() {
  const stored = localStorage.getItem(VOCAB_DECK_KEY);
  return ['lesson', 'active', 'completed'].includes(stored) ? stored : 'lesson';
}

function currentLessonIds() {
  try {
    return normalizeLessonIds(JSON.parse(localStorage.getItem(SELECTION_KEY) || 'null'), UNITS, [TEXTBOOK_UNITS[0].id]);
  } catch {
    return [TEXTBOOK_UNITS[0].id];
  }
}

function selectedCards() {
  const mode = currentDeckMode();
  if (mode !== 'lesson') return resolveCustomVocabulary(UNITS, mode);
  return filterVocabSection(itemsForMode(UNITS, currentLessonIds(), 'vocabulary'), currentSection());
}

function isVocabularyMode() {
  return document.querySelector('[data-mode="vocabulary"]')?.getAttribute('aria-current') === 'page';
}

function isSpaced() {
  return document.querySelector('#spaced-toggle')?.getAttribute('aria-pressed') !== 'false';
}

function deckLabel() {
  const mode = currentDeckMode();
  if (mode === 'active') return 'Struggling words';
  if (mode === 'completed') return 'Completed focus';
  const section = currentSection();
  if (section === 'all') return 'Full deck';
  return VOCAB_SECTIONS.find(([key]) => key === section)?.[1] || 'Lesson deck';
}

function formatWhen(timestamp, now = Date.now()) {
  if (!timestamp || timestamp <= now) return 'due now';
  const delta = timestamp - now;
  if (delta < HOUR_MS) return `due in ${Math.max(1, Math.ceil(delta / 60000))}m`;
  if (delta < 12 * HOUR_MS) return `due in ${Math.max(1, Math.ceil(delta / HOUR_MS))}h`;
  return `due in ${Math.max(1, Math.ceil(delta / DAY_MS))}d`;
}

function makeHistogram(histogram, total) {
  const details = node('details', 'review-due-histogram');
  details.open = true;
  const summary = node('summary', 'review-due-summary');
  summary.append(node('span', '', 'Due by day'), node('span', 'review-due-total', total));
  details.append(summary);

  const lastNonZero = histogram.findLastIndex(bucket => bucket.count > 0);
  const last = Math.max(1, lastNonZero);
  const visible = histogram.slice(0, last + 1);
  const max = Math.max(1, ...visible.map(bucket => bucket.count));
  const bars = node('div', 'review-due-bars');
  for (const bucket of visible) {
    const column = node('div', 'review-due-column');
    column.title = bucket.label === 'now'
      ? `Due now: ${bucket.count}`
      : bucket.label === 'today'
        ? `Due later today: ${bucket.count}`
        : bucket.label === '14d+'
          ? `Due in 14 or more days: ${bucket.count}`
          : `Due in ${bucket.label} day${bucket.label === '1' ? '' : 's'}: ${bucket.count}`;
    const count = node('span', 'review-due-count', bucket.count || '');
    const bar = node('span', 'review-due-bar');
    bar.style.height = `${bucket.count ? Math.max(4, Math.round(bucket.count / max * 48)) : 2}px`;
    column.append(count, bar, node('span', 'review-due-label', bucket.label));
    bars.append(column);
  }
  details.append(bars);
  return details;
}

function syncBridgeProgress(next, before) {
  const bridge = globalThis.__indonesianVocabDeckBridge;
  if (!bridge?.progress) return false;
  const live = normalizeProgress(bridge.progress);
  if (JSON.stringify(live) !== JSON.stringify(before)) return false;
  Object.assign(bridge.progress, next);
  return true;
}

function nudgeAppRender() {
  const shuffle = document.querySelector('#shuffle-button');
  if (!shuffle || shuffle.hidden) {
    document.querySelector('[data-mode="vocabulary"]')?.click();
    return;
  }
  shuffle.click();
  shuffle.click();
}

function returnToCirculation(cardId) {
  const direction = currentDirection();
  const now = Date.now();
  const before = loadProgress(localStorage);
  const next = returnCardProgressNow(before, cardId, now, direction);
  saveProgress(localStorage, next);

  const bridge = globalThis.__indonesianVocabDeckBridge;
  const synced = syncBridgeProgress(next, before);
  if (synced && bridge?.deck) {
    Object.assign(bridge.deck, returnCardToDeck(bridge.deck, cardId));
    nudgeAppRender();
    queueRender();
    return;
  }
  location.reload();
}

function fastForward(advanceMs) {
  if (!isVocabularyMode() || !isSpaced()) return;
  const cards = selectedCards();
  const direction = currentDirection();
  const now = Date.now();
  const before = loadProgress(localStorage);
  const next = advanceVocabSchedule(before, cards, advanceMs, now, direction);
  saveProgress(localStorage, next);

  const bridge = globalThis.__indonesianVocabDeckBridge;
  const liveDeck = bridge?.deck;
  const synced = syncBridgeProgress(next, before);
  if (synced && liveDeck) {
    const shuffle = localStorage.getItem(SHUFFLE_KEY) === 'true';
    const rebuilt = createDeck(cards, next, true, now, shuffle, Math.random, direction);
    Object.assign(liveDeck, rebuilt);
    globalThis.__indonesianVocabDeckBridge.deck = liveDeck;
    globalThis.__indonesianVocabDeckBridge.progress = bridge.progress;
    nudgeAppRender();
    queueRender();
    return;
  }
  location.reload();
}

function renderReviewPanel() {
  renderQueued = false;
  if (!shell || !panel || !statsHost || !sortHost || !listHost || !ffRow) return;
  const visible = isVocabularyMode();
  shell.hidden = !visible;
  if (!visible) {
    ffRow.hidden = true;
    return;
  }

  const spaced = isSpaced();
  ffRow.hidden = !spaced;
  const cards = selectedCards();
  const direction = currentDirection();
  const now = Date.now();
  const progress = loadProgress(localStorage);
  const statsById = Object.fromEntries(cards.map(card => [card.id, getCardStats(progress, card.id, now, direction)]));
  const bridgeDeck = globalThis.__indonesianVocabDeckBridge?.deck || { active: [], middle: [] };
  const model = buildReviewPanelModel(cards, statsById, bridgeDeck, { spaced, now });

  deckTag.textContent = deckLabel();
  deckTag.title = direction === 'e2i' ? 'English → Indonesian production progress' : 'Indonesian → English recognition progress';

  statsHost.replaceChildren();
  const first = node('div', 'review-stats-row');
  first.append(
    node('span', 'review-stat review-stat-deck', `▦ In deck: ${model.inDeckCount}`),
    node('span', 'review-stat review-stat-deck', `● ${spaced ? 'Due now' : 'Unconfirmed'}: ${model.dueNowCount}`),
    node('span', 'review-stat review-stat-muted', `⌛ ${spaced ? 'Due later' : 'Archived'}: ${model.dueLaterCount}`)
  );
  const second = node('div', 'review-stats-row');
  second.append(
    node('span', 'review-stat review-stat-high', `✓ High confidence: ${model.highConfidenceCount}`),
    node('span', 'review-stat review-stat-low', `○ Low confidence: ${model.lowConfidenceCount}`)
  );
  statsHost.append(first, second);
  if (spaced && model.histogram.length) statsHost.append(makeHistogram(model.histogram, model.totalCount));

  sortHost.replaceChildren(node('span', 'review-sort-label', 'Sort'));
  const group = node('div', 'review-sort-group');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Sort reviewed vocabulary cards');
  for (const [key, label] of [['lastSeen', 'Last seen'], ['alphabetical', 'A–Z'], ['confidence', 'Confidence']]) {
    const control = node('button', `review-sort-button${sortMode === key ? ' active' : ''}`, label);
    control.type = 'button';
    control.setAttribute('aria-pressed', String(sortMode === key));
    control.addEventListener('click', () => { sortMode = key; renderReviewPanel(); });
    group.append(control);
  }
  sortHost.append(group);

  listHost.replaceChildren();
  const reviewed = sortReviewedCards(cards, statsById, sortMode);
  if (!reviewed.length) {
    listHost.append(node('p', 'review-empty', 'Rate cards as you study to track progress in this direction.'));
    return;
  }

  for (const card of reviewed) {
    const stats = statsById[card.id];
    const row = node('div', 'review-item');
    const left = node('span', 'review-word');
    left.append(node('strong', '', card.form));
    const meta = [
      spaced ? formatWhen(stats.dueAt, now) : null,
      `seen ×${stats.seen}`,
      stats.confidencePct == null ? 'confidence —' : `confidence ${stats.confidencePct}%`
    ].filter(Boolean).join(' · ');
    left.append(node('small', '', meta));

    const right = node('span', 'review-meaning', card.meaning);
    const mark = node('span', `review-confidence-mark${stats.confidencePct != null && stats.confidencePct > 75 ? ' high' : ''}`, stats.confidencePct != null && stats.confidencePct > 75 ? '✓' : '○');
    mark.title = stats.confidencePct == null ? 'No confidence history yet' : `${stats.confidencePct}% confidence`;
    const returnButton = node('button', 'review-return', '×');
    returnButton.type = 'button';
    returnButton.title = 'Return this card to circulation now';
    returnButton.setAttribute('aria-label', `Return ${card.form} to circulation now`);
    returnButton.addEventListener('click', () => returnToCirculation(card.id));
    row.append(left, right, mark, returnButton);
    listHost.append(row);
  }
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(renderReviewPanel);
}

document.querySelector('#fast-forward-day')?.addEventListener('click', () => fastForward(DAY_MS));
document.querySelector('#fast-forward-week')?.addEventListener('click', () => fastForward(7 * DAY_MS));

studyPanel && new MutationObserver(queueRender).observe(studyPanel, { childList: true, subtree: true });
document.addEventListener('click', event => {
  if (event.target.closest('[data-mode], #direction-toggle, #spaced-toggle, #shuffle-button, #open-lessons, #done-lessons, #select-all-topics, #clear-lessons')) {
    setTimeout(queueRender, 0);
  }
});
document.addEventListener('change', event => {
  if (event.target.matches('#vocab-deck, #vocab-section, #lesson-vocab-section, #import-file')) setTimeout(queueRender, 0);
});

queueRender();
