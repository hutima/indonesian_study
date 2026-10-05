import { UNITS, TEXTBOOK_UNITS } from './content/manifest.js';
import {
  loadProgress,
  normalizeProgress,
  saveProgress,
  dueVocab,
  getCardStats,
  getVocabProgressEntry
} from './progress.js';
import { dueBuckets } from './vocab-charts.js';
import { SELECTION_KEY, normalizeLessonIds, itemsForMode } from './lesson-selection.js';
import { VOCAB_SECTIONS, filterVocabSection } from './vocab-sections.js';
import { resolveCustomVocabulary } from './content/vocab/custom-focus.js';
import { msFromDays, daysFromMs } from './js/domain/srs/scheduler.js';

const VOCAB_DIRECTION_KEY = 'indonesian-study-vocab-direction-v1';
const VOCAB_SECTION_KEY = 'indonesian-study-vocab-section-v1';
const VOCAB_DECK_KEY = 'indonesian-study-vocab-deck-v1';
const REVIEW_SORT_KEY = 'indonesian-study-review-sort-v1';
const SORT_MODES = new Set(['lastSeen', 'alphabetical', 'confidence']);

function directionKey(direction) {
  return direction === 'e2i' ? 'e2i' : 'i2e';
}

function cloneEntryIntoDirection(state, id, direction) {
  const dir = directionKey(direction);
  const prior = getVocabProgressEntry(state, id, dir);
  if (!prior) return null;
  const copy = { ...prior };
  if (Array.isArray(prior.confidenceHistory)) copy.confidenceHistory = [...prior.confidenceHistory];
  state.vocabDirections[dir][id] = copy;
  return copy;
}

/**
 * Duff-style developer control: pull selected scheduled cards closer by a fixed
 * amount without changing review history. Only the active vocabulary direction
 * is touched; the other direction remains independent.
 */
export function advanceVocabScheduling(state, cards, advanceMs, now = Date.now(), direction = 'i2e') {
  const next = normalizeProgress(state);
  const shift = Math.max(0, Number(advanceMs) || 0);
  if (!shift) return next;
  for (const card of cards || []) {
    if (!card?.id) continue;
    const entry = cloneEntryIntoDirection(next, card.id, direction);
    if (!entry?.dueAt || entry.dueAt <= now) continue;
    entry.dueAt = Math.max(now, entry.dueAt - shift);
    entry.intervalDays = Math.max(0, daysFromMs(entry.dueAt - now));
  }
  return next;
}

/**
 * Duff-style “return to circulation” action. It preserves historical attempts
 * and confidence while making this direction immediately due again.
 */
export function returnVocabToDue(state, id, now = Date.now(), direction = 'i2e') {
  const next = normalizeProgress(state);
  const entry = cloneEntryIntoDirection(next, id, direction);
  if (!entry) return next;
  entry.dueAt = now;
  entry.intervalDays = 0;
  entry.streak = 0;
  entry.easyStreak = 0;
  entry.srsStage = Math.max(0, (Number(entry.srsStage) || 0) - 1);
  return next;
}

export function sortReviewCards(cards, state, direction = 'i2e', mode = 'lastSeen', now = Date.now()) {
  const selectedMode = SORT_MODES.has(mode) ? mode : 'lastSeen';
  const rows = (cards || []).filter(card => getCardStats(state, card.id, now, direction).seen > 0);
  const alpha = (a, b) => String(a.form || '').localeCompare(String(b.form || ''), 'id', { sensitivity: 'base' });
  rows.sort((a, b) => {
    const aStats = getCardStats(state, a.id, now, direction);
    const bStats = getCardStats(state, b.id, now, direction);
    if (selectedMode === 'confidence') {
      const av = aStats.confidencePct == null ? -1 : aStats.confidencePct;
      const bv = bStats.confidencePct == null ? -1 : bStats.confidencePct;
      return av === bv ? alpha(a, b) : av - bv;
    }
    if (selectedMode === 'alphabetical') return alpha(a, b);
    return aStats.last === bStats.last ? alpha(a, b) : bStats.last - aStats.last;
  });
  return rows;
}

function currentDirection() {
  return localStorage.getItem(VOCAB_DIRECTION_KEY) === 'e2i' ? 'e2i' : 'i2e';
}

function currentCards() {
  let lessonIds;
  try {
    lessonIds = normalizeLessonIds(JSON.parse(localStorage.getItem(SELECTION_KEY) || 'null'), UNITS, [TEXTBOOK_UNITS[0].id]);
  } catch {
    lessonIds = [TEXTBOOK_UNITS[0].id];
  }
  const deckMode = ['lesson', 'active', 'completed'].includes(localStorage.getItem(VOCAB_DECK_KEY))
    ? localStorage.getItem(VOCAB_DECK_KEY)
    : 'lesson';
  if (deckMode !== 'lesson') return { cards: resolveCustomVocabulary(UNITS, deckMode), deckMode };
  const section = VOCAB_SECTIONS.some(([key]) => key === localStorage.getItem(VOCAB_SECTION_KEY))
    ? localStorage.getItem(VOCAB_SECTION_KEY)
    : 'all';
  return { cards: filterVocabSection(itemsForMode(UNITS, lessonIds, 'vocabulary'), section), deckMode };
}

function formatDue(dueAt, now) {
  if (!dueAt || dueAt <= now) return 'due now';
  const delta = dueAt - now;
  if (delta < 60 * 60 * 1000) return `due in ${Math.max(1, Math.ceil(delta / 60000))}m`;
  if (delta < 12 * 60 * 60 * 1000) return `due in ${Math.max(1, Math.ceil(delta / 3600000))}h`;
  return `due in ${Math.max(1, Math.ceil(daysFromMs(delta)))}d`;
}

function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = String(text);
  return el;
}

function reviewPanelHost() {
  let shell = document.querySelector('#duff-review-shell');
  if (shell) return shell;
  const studyPanel = document.querySelector('#study-panel');
  if (!studyPanel) return null;
  shell = make('section', 'duff-review-shell');
  shell.id = 'duff-review-shell';
  shell.setAttribute('aria-label', 'Vocabulary review progress');
  studyPanel.insertAdjacentElement('afterend', shell);
  return shell;
}

function histogram(counts) {
  const labels = ['now', 'today', ...Array.from({ length: 13 }, (_, i) => String(i + 1)), '14d+'];
  const details = make('details', 'duff-due-histogram');
  details.open = true;
  const summary = make('summary', '', `DUE BY DAY  ${counts.reduce((sum, n) => sum + n, 0)}`);
  const bars = make('div', 'duff-histogram-bars');
  const max = Math.max(...counts, 1);
  counts.forEach((value, index) => {
    const column = make('div', 'duff-histogram-column');
    column.title = `${labels[index]}: ${value} card${value === 1 ? '' : 's'}`;
    column.append(make('span', 'duff-histogram-count', value || ''));
    const bar = make('span', 'duff-histogram-bar');
    bar.style.height = `${Math.max(3, Math.round(value / max * 58))}px`;
    column.append(bar, make('span', 'duff-histogram-label', labels[index]));
    bars.append(column);
  });
  details.append(summary, bars);
  return details;
}

function reloadWithState(state) {
  saveProgress(localStorage, state);
  location.reload();
}

function renderReviewPanel() {
  const shell = reviewPanelHost();
  if (!shell) return;
  const vocabTab = document.querySelector('[data-mode="vocabulary"]');
  const vocabularyActive = vocabTab?.getAttribute('aria-current') === 'page';
  shell.hidden = !vocabularyActive;
  if (!vocabularyActive) return;

  const { cards, deckMode } = currentCards();
  const direction = currentDirection();
  const now = Date.now();
  const state = loadProgress(localStorage);
  const dueNow = dueVocab(cards, state, now, direction).length;
  const dueLater = Math.max(cards.length - dueNow, 0);
  const stats = cards.map(card => getCardStats(state, card.id, now, direction));
  const high = stats.filter(stat => stat.confidencePct != null && stat.confidencePct >= 80).length;
  const low = Math.max(cards.length - high, 0);
  const spaced = document.querySelector('#spaced-toggle')?.getAttribute('aria-pressed') !== 'false';
  const deckLabel = deckMode === 'active' ? 'Struggling words' : deckMode === 'completed' ? 'Completed focus' : 'Full deck';
  const sortMode = SORT_MODES.has(localStorage.getItem(REVIEW_SORT_KEY)) ? localStorage.getItem(REVIEW_SORT_KEY) : 'lastSeen';

  shell.replaceChildren();
  const ff = make('div', 'duff-ff-row');
  ff.hidden = !spaced;
  for (const [label, days] of [['FAST-FORWARD 1 DAY', 1], ['FAST-FORWARD 1 WEEK', 7]]) {
    const control = make('button', 'duff-ctrl-btn', label);
    control.type = 'button';
    control.addEventListener('click', () => reloadWithState(advanceVocabScheduling(state, cards, msFromDays(days), now, direction)));
    ff.append(control);
  }

  const panel = make('div', 'duff-review-panel');
  const header = make('div', 'duff-review-header');
  header.append(make('span', 'duff-review-deck-tag', deckLabel), make('span', 'duff-review-title', 'PROGRESS'));

  const statsWrap = make('div', 'duff-review-stats');
  const first = make('div', 'duff-review-stats-row');
  first.append(
    make('span', 'duff-stat-deck', `▦ In deck: ${dueNow}`),
    make('span', 'duff-stat-deck', `● Due now: ${dueNow}`),
    make('span', 'duff-stat-total', `⌛ Due later: ${dueLater}`)
  );
  const second = make('div', 'duff-review-stats-row');
  second.append(
    make('span', 'duff-stat-known', `✓ High confidence: ${high}`),
    make('span', 'duff-stat-unsure', `○ Low confidence: ${low}`)
  );
  statsWrap.append(first, second, histogram(dueBuckets(cards, state, now, direction)));

  const sortRow = make('div', 'duff-review-sort-row');
  sortRow.append(make('span', 'duff-review-sort-label', 'SORT'));
  const group = make('div', 'duff-review-sort-group');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Sort cards');
  for (const [mode, label] of [['lastSeen', 'LAST SEEN'], ['alphabetical', 'A–Z'], ['confidence', 'CONFIDENCE']]) {
    const control = make('button', `duff-ctrl-btn${sortMode === mode ? ' active-toggle' : ''}`, label);
    control.type = 'button';
    control.setAttribute('aria-pressed', String(sortMode === mode));
    control.addEventListener('click', () => {
      localStorage.setItem(REVIEW_SORT_KEY, mode);
      renderReviewPanel();
    });
    group.append(control);
  }
  sortRow.append(group);

  const list = make('div', 'duff-review-list');
  const rows = sortReviewCards(cards, state, direction, sortMode, now);
  if (!rows.length) {
    list.append(make('span', 'duff-review-empty', 'Mark cards as you study to track your progress in this direction.'));
  }
  for (const card of rows) {
    const cardStats = getCardStats(state, card.id, now, direction);
    const confidence = cardStats.confidencePct == null ? 'confidence —' : `confidence ${cardStats.confidencePct}%`;
    const row = make('div', 'duff-review-item');
    const left = make('span', 'duff-review-left');
    const right = make('span', 'duff-review-right');
    const prompt = direction === 'e2i' ? card.meaning : card.form;
    const answer = direction === 'e2i' ? card.form : card.meaning;
    left.append(make('span', 'duff-review-primary', prompt));
    left.append(make('span', 'duff-review-meta', `${spaced ? formatDue(cardStats.dueAt, now) + ' · ' : ''}seen ×${cardStats.seen} · ${confidence}`));
    right.append(make('span', 'duff-review-primary', answer));
    right.append(make('span', 'duff-review-meta', [card.pos, card.register].filter(Boolean).join(' · ')));
    const badge = make('span', `duff-review-badge${cardStats.confidencePct != null && cardStats.confidencePct >= 80 ? ' known' : ''}`, cardStats.confidencePct != null && cardStats.confidencePct >= 80 ? '✓' : '○');
    const returnButton = make('button', 'duff-return-btn', '×');
    returnButton.type = 'button';
    returnButton.title = 'Return this card to circulation now';
    returnButton.setAttribute('aria-label', `Return ${card.form} to circulation now`);
    returnButton.addEventListener('click', () => reloadWithState(returnVocabToDue(state, card.id, now, direction)));
    row.append(left, right, badge, returnButton);
    list.append(row);
  }

  panel.append(header, statsWrap, sortRow, list);
  shell.append(ff, panel);
}

function scheduleRender() {
  requestAnimationFrame(renderReviewPanel);
}

if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderReviewPanel, { once: true });
  else renderReviewPanel();

  document.addEventListener('click', event => {
    if (event.target.closest('#study-panel, .tabs, #direction-toggle, #spaced-toggle, #shuffle-button, #open-lessons, #done-lessons, #lesson-dialog')) scheduleRender();
  });
  document.addEventListener('change', event => {
    if (event.target.matches('#vocab-deck, #vocab-section, #lesson-vocab-section')) scheduleRender();
  });
  const target = document.querySelector('#study-panel');
  if (target) new MutationObserver(scheduleRender).observe(target, { childList: true, subtree: true });
}
