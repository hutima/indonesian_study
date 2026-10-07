import { UNITS, TEXTBOOK_UNITS } from './content/manifest.js';
import { loadProgress, saveProgress, dueVocab, getCardStats } from './progress.js';
import { dueBuckets } from './vocab-charts.js';
import { SELECTION_KEY, normalizeLessonIds, itemsForMode } from './lesson-selection.js';
import { VOCAB_SECTIONS, filterVocabSection } from './vocab-sections.js';
import { resolveCustomVocabulary } from './content/vocab/custom-focus.js';
import { msFromDays, daysFromMs } from './js/domain/srs/scheduler.js';
import { advanceVocabScheduling, returnVocabToDue, sortReviewCards, createReviewSession, advanceReviewSession } from './vocab-review-state.js';

const VOCAB_DIRECTION_KEY = 'indonesian-study-vocab-direction-v1';
const VOCAB_SECTION_KEY = 'indonesian-study-vocab-section-v1';
const VOCAB_DECK_KEY = 'indonesian-study-vocab-deck-v1';
const REVIEW_SORT_KEY = 'indonesian-study-review-sort-v1';
const SORT_MODES = new Set(['lastSeen', 'alphabetical', 'confidence']);
let liveSession = null;
let liveSessionHistory = [];
let liveSessionKey = '';

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

function spacedReviewOn() {
  return document.querySelector('#spaced-toggle')?.getAttribute('aria-pressed') !== 'false';
}

function sessionKey(cards, direction, spaced) {
  if (!spaced) return '';
  return `${direction}|${cards.map(card => card.id).join('|')}`;
}

function resetLiveSession() {
  liveSession = null;
  liveSessionHistory = [];
  liveSessionKey = '';
}

function ensureLiveSession(cards, state, now, direction, spaced) {
  if (!spaced) {
    resetLiveSession();
    return null;
  }
  const key = sessionKey(cards, direction, spaced);
  if (!liveSession || liveSessionKey !== key) {
    liveSession = createReviewSession(dueVocab(cards, state, now, direction).map(card => card.id));
    liveSessionHistory = [];
    liveSessionKey = key;
  }
  return liveSession;
}

function currentStudyCardId(cards, direction) {
  const flashcard = document.querySelector('#study-panel .flashcard');
  if (!flashcard) return null;
  const front = flashcard.querySelector('.face-front .card-word')?.textContent?.trim() || '';
  const back = flashcard.querySelector('.face-back .card-word')?.textContent?.trim() || '';
  if (!front && !back) return null;
  const card = cards.find(candidate => direction === 'e2i'
    ? String(candidate.meaning || '').trim() === front && String(candidate.form || '').trim() === back
    : String(candidate.form || '').trim() === front && String(candidate.meaning || '').trim() === back);
  return card?.id || null;
}

function captureReviewAction(action) {
  const spaced = spacedReviewOn();
  if (!spaced) return;
  const { cards } = currentCards();
  const direction = currentDirection();
  const now = Date.now();
  const state = loadProgress(localStorage);
  const session = ensureLiveSession(cards, state, now, direction, spaced);
  const cardId = currentStudyCardId(cards, direction);
  if (!session || !cardId || !session.active.includes(cardId)) return;
  liveSessionHistory.push({ ...session, active: [...session.active], middle: [...session.middle] });
  if (liveSessionHistory.length > 40) liveSessionHistory.shift();
  liveSession = advanceReviewSession(session, state, cardId, action, true, now, direction);
}

function captureUndo() {
  const previous = liveSessionHistory.pop();
  if (previous) liveSession = previous;
}

function reviewActionForButton(button) {
  if (!button) return null;
  if (button.classList.contains('review-hard')) return 'again';
  if (button.classList.contains('review-uncertain')) return 'unsure';
  if (button.classList.contains('review-easy')) return 'know';
  if (button.textContent.trim().startsWith('Again')) return 'next';
  return null;
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
  const spaced = spacedReviewOn();
  const session = ensureLiveSession(cards, state, now, direction, spaced);
  const sessionIds = session ? new Set([...session.active, ...session.middle]) : null;
  const scheduledDue = dueVocab(cards, state, now, direction).length;
  const inDeck = session ? session.active.length : scheduledDue;
  const dueNow = session ? sessionIds.size : scheduledDue;
  const dueLater = Math.max(cards.length - dueNow, 0);
  const dueCounts = dueBuckets(cards, state, now, direction, sessionIds);
  const stats = cards.map(card => getCardStats(state, card.id, now, direction));
  const high = stats.filter(stat => stat.confidencePct != null && stat.confidencePct >= 80).length;
  const low = Math.max(cards.length - high, 0);
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
    make('span', 'duff-stat-deck', `▦ In deck: ${inDeck}`),
    make('span', 'duff-stat-deck', `● Due now: ${dueNow}`),
    make('span', 'duff-stat-total', `⌛ Due later: ${dueLater}`)
  );
  const second = make('div', 'duff-review-stats-row');
  second.append(
    make('span', 'duff-stat-known', `✓ High confidence: ${high}`),
    make('span', 'duff-stat-unsure', `○ Low confidence: ${low}`)
  );
  statsWrap.append(first, second, histogram(dueCounts));

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
  const rows = sortReviewCards(cards, state, direction, sortMode);
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
    const dueText = sessionIds?.has(card.id) ? 'due now' : formatDue(cardStats.dueAt, now);
    left.append(make('span', 'duff-review-primary', prompt));
    left.append(make('span', 'duff-review-meta', `${spaced ? dueText + ' · ' : ''}seen ×${cardStats.seen} · ${confidence}`));
    right.append(make('span', 'duff-review-primary', answer));
    right.append(make('span', 'duff-review-meta', [card.pos, card.register].filter(Boolean).join(' · ')));
    const known = cardStats.confidencePct != null && cardStats.confidencePct >= 80;
    const badge = make('span', `duff-review-badge${known ? ' known' : ''}`, known ? '✓' : '○');
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
    const button = event.target.closest('#study-panel button');
    if (button?.textContent.trim().startsWith('↶ Undo')) captureUndo();
    else {
      const action = reviewActionForButton(button);
      if (action) captureReviewAction(action);
      if (button?.textContent.trim().startsWith('Check due cards')) resetLiveSession();
    }
    if (event.target.closest('#reset-button')) resetLiveSession();
  }, true);

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input, select, textarea, dialog, button, summary')) return;
    if ((event.key === 'z' || event.key === 'Z') && liveSessionHistory.length) { captureUndo(); return; }
    const action = ['Digit1', 'Digit2', 'Digit3'].includes(event.code)
      ? { Digit1: 'again', Digit2: 'unsure', Digit3: 'know' }[event.code]
      : event.code === 'ArrowRight' || event.key === 'n' || event.key === 'N' ? 'next' : null;
    if (action) captureReviewAction(action);
  }, true);

  document.addEventListener('click', event => {
    if (event.target.closest('#study-panel, .tabs, #direction-toggle, #spaced-toggle, #shuffle-button, #open-lessons, #done-lessons, #lesson-dialog')) scheduleRender();
  });
  document.addEventListener('change', event => {
    if (event.target.matches('#vocab-deck, #vocab-section, #lesson-vocab-section, #import-file')) {
      resetLiveSession();
      scheduleRender();
    }
  });
  const target = document.querySelector('#study-panel');
  if (target) new MutationObserver(scheduleRender).observe(target, { childList: true, subtree: true });
}
