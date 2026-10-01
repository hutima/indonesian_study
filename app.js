import { UNITS, FOUNDATION_UNITS, TEXTBOOK_UNITS, UNIT_URLS } from './content/manifest.js';
import { loadProgress, normalizeProgress, saveProgress, recordAnswer, dueVocab, getGamificationSummary, getCardStats, getVocabProgressEntry, getAchievements, syncGamificationCelebrations, STUDY_LEVELS } from './progress.js';
import { createDeck, reviewVocab, nextVocabRound, orderDeck } from './vocab-deck.js';
import { dueBuckets, confidenceBuckets, proficiencyBands } from './vocab-charts.js';
import { SELECTION_KEY, normalizeLessonIds, selectedUnits, itemsForMode, nextLessonId } from './lesson-selection.js';
import { VOCAB_SECTIONS, filterVocabSection, vocabSectionCounts, topicVocabularyPreview } from './vocab-sections.js';
import { orderMorphology } from './morphology-order.js';
import { selectMorphologyFamilies, familyQuestions } from './content/morphology-families.js';
import { resolveCustomVocabulary, customVocabularyCounts } from './content/vocab/custom-focus.js';

const panel = document.querySelector('#study-panel');
const lessonGrid = document.querySelector('#lesson-grid');
const foundationGrid = document.querySelector('#foundation-grid');
const lessonDialog = document.querySelector('#lesson-dialog');
const openLessons = document.querySelector('#open-lessons');
const selectionSummary = document.querySelector('#selection-summary');
const dialogSelectionSummary = document.querySelector('#dialog-selection-summary');
const description = document.querySelector('#unit-description');
const guide = document.querySelector('#lesson-guide');
const wordList = document.querySelector('#word-list');
const wordListContent = document.querySelector('#word-list-content');
const status = document.querySelector('#offline-status');
const analytics = document.querySelector('#vocab-analytics');
const toolbar = document.querySelector('#vocab-toolbar');
const vocabSectionWrap = document.querySelector('#vocab-section-wrap');
const vocabSectionSelect = document.querySelector('#vocab-section');
const lessonVocabSectionSelect = document.querySelector('#lesson-vocab-section');
const vocabDeckSelect = document.querySelector('#vocab-deck');
const vocabDeckWrap = document.querySelector('#vocab-deck-wrap');
const progressDialog = document.querySelector('#progress-dialog');
const openProgress = document.querySelector('#open-progress');
const progressHero = document.querySelector('#progress-hero');
const achievementGrid = document.querySelector('#achievement-grid');
const achievementCount = document.querySelector('#achievement-count');
const activityGrid = document.querySelector('#activity-grid');
const activitySummary = document.querySelector('#activity-summary');
const vocabProgressSummary = document.querySelector('#vocab-progress-summary');
const titleLadder = document.querySelector('#title-ladder');
const spacedButton = document.querySelector('#spaced-toggle');
const directionButton = document.querySelector('#direction-toggle');
const shuffleButton = document.querySelector('#shuffle-button');
const morphDirectionButton = document.querySelector('#morph-direction-button');
let progress = loadProgress(localStorage);
let mode = 'vocabulary';
let lessonIds;
try { lessonIds = normalizeLessonIds(JSON.parse(localStorage.getItem(SELECTION_KEY) || 'null'), UNITS, [TEXTBOOK_UNITS[0].id]); }
catch { lessonIds = [TEXTBOOK_UNITS[0].id]; }
let itemIndex = 0;
let stepIndex = 0;
let revealed = false;
let chosen = null;
let translationShown = false;
let spaced = true;
const VOCAB_DIRECTION_KEY = 'indonesian-study-vocab-direction-v1';
let reverse = localStorage.getItem(VOCAB_DIRECTION_KEY) === 'e2i';
const MORPH_DIRECTION_KEY = 'indonesian-study-morph-direction-v1';
let morphReverse = localStorage.getItem(MORPH_DIRECTION_KEY) === 'select';
const SHUFFLE_KEY = 'indonesian-study-shuffle-v1';
let shuffle = localStorage.getItem(SHUFFLE_KEY) === 'true';
const VOCAB_SECTION_KEY = 'indonesian-study-vocab-section-v1';
let vocabSection = VOCAB_SECTIONS.some(([key]) => key === localStorage.getItem(VOCAB_SECTION_KEY)) ? localStorage.getItem(VOCAB_SECTION_KEY) : 'all';
const VOCAB_DECK_KEY = 'indonesian-study-vocab-deck-v1';
let vocabDeckMode = ['lesson', 'active', 'completed'].includes(localStorage.getItem(VOCAB_DECK_KEY)) ? localStorage.getItem(VOCAB_DECK_KEY) : 'lesson';
const currentVocabDirection = () => reverse ? 'e2i' : 'i2e';
let deck;
let reviewHistory = [];
let morphOrder = null;

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
const pool = () => {
  if (mode !== 'morphology') return itemsForMode(UNITS, lessonIds, mode);
  const families = selectMorphologyFamilies(lessonIds);
  if (!morphOrder) morphOrder = orderMorphology(families, null, -1, shuffle);
  const byId = new Map(families.map(item => [item.id, item]));
  return morphOrder.map(id => byId.get(id)).filter(Boolean);
};
const countLabel = (index, total) => `${index + 1} of ${total}`;

function saveMark(id, result) {
  progress = recordAnswer(progress, id, result);
  saveProgress(localStorage, progress);
  syncCelebrations();
  renderProgress();
}

let toastQueue = [];
let toastActive = false;
let toastTimer = null;

function showNextToast() {
  if (toastActive || !toastQueue.length) return;
  const toast = toastQueue.shift();
  let host = document.querySelector('#level-toast-host');
  if (!host) {
    host = node('div', 'level-toast-host');
    host.id = 'level-toast-host';
    document.body.append(host);
  }
  const notice = button('', `level-toast${toast.kind === 'achievement' ? ' level-toast-achievement' : ''}`, dismissToast);
  notice.setAttribute('aria-label', 'Dismiss notification');
  const badge = node('span', 'level-toast-badge');
  if (toast.kind === 'achievement') {
    add(badge, node('span', 'toast-achievement-icon', toast.icon || '★'), node('span', '', 'Badge'));
  } else badge.textContent = `Lv. ${toast.level}`;
  const copy = node('span', 'level-toast-copy');
  add(copy, node('span', 'level-toast-title', toast.title), node('span', 'level-toast-sub', toast.sub));
  add(notice, badge, copy, node('span', 'level-toast-close', '×'));
  host.replaceChildren(notice);
  toastActive = true;
  requestAnimationFrame(() => host.classList.add('show'));
  toastTimer = setTimeout(dismissToast, 2400);
}
function dismissToast() {
  const host = document.querySelector('#level-toast-host');
  if (!host || !toastActive) return;
  host.classList.remove('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    host.replaceChildren();
    toastActive = false;
    toastTimer = null;
    showNextToast();
  }, 220);
}
function queueCelebrations(result) {
  if (result.level) {
    toastQueue.push({
      kind: 'level', level: result.level.level,
      title: `New rank — ${result.level.title}`,
      sub: `${result.level.flavor} · ${getGamificationSummary(progress).xp.toLocaleString()} XP · Tap to dismiss`
    });
  }
  for (const achievement of result.achievements) {
    toastQueue.push({
      kind: 'achievement', icon: achievement.icon,
      title: `Achievement — ${achievement.name}`,
      sub: `${achievement.desc} · Tap to dismiss`
    });
  }
  showNextToast();
}
function syncCelebrations(show = true) {
  const result = syncGamificationCelebrations(progress);
  progress = result.state;
  saveProgress(localStorage, progress);
  if (show) queueCelebrations(result);
}
function metric(label, value) {
  const el = node('div', 'progress-metric');
  add(el, node('strong', '', value), node('small', '', label));
  return el;
}
function dateKey(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function renderActivity(game) {
  activityGrid.replaceChildren();
  const days = [];
  let activeDays = 0;
  let reviews = 0;
  for (let offset = 27; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const count = game.dailyReviews[dateKey(date)] || 0;
    if (count) activeDays++;
    reviews += count;
    days.push({ date, count });
  }
  const max = Math.max(1, ...days.map(day => day.count));
  for (const day of days) {
    const cell = node('span', 'activity-day');
    const ratio = day.count / max;
    cell.dataset.level = day.count === 0 ? '0' : ratio <= .25 ? '1' : ratio <= .5 ? '2' : ratio <= .75 ? '3' : '4';
    cell.title = `${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.count} scored review${day.count === 1 ? '' : 's'}`;
    activityGrid.append(cell);
  }
  activitySummary.textContent = `${activeDays} active day${activeDays === 1 ? '' : 's'} · ${reviews} reviews in the last 28 days`;
}
function renderAchievements() {
  const achievements = getAchievements(progress);
  const earned = achievements.filter(item => item.earned).length;
  achievementCount.textContent = `${earned} / ${achievements.length} earned`;
  achievementGrid.replaceChildren();
  const groups = [
    ['daily', 'Today'],
    ['milestone', 'Review milestones'],
    ['streak', 'Study streaks'],
    ['mastery', 'Card mastery']
  ];
  for (const [key, label] of groups) {
    const items = achievements.filter(item => item.group === key);
    if (!items.length) continue;
    achievementGrid.append(node('div', 'achievement-group-label', label));
    for (const item of items) {
      const badge = node('div', `achievement-badge ${item.earned ? 'earned' : 'locked'}`);
      badge.title = item.desc;
      const copy = node('div', 'achievement-copy');
      add(copy, node('strong', '', item.name), node('small', '', item.desc));
      add(badge, node('span', 'achievement-icon', item.earned ? item.icon : '·'), copy);
      achievementGrid.append(badge);
    }
  }
}
function renderTitleLadder(game) {
  titleLadder.replaceChildren();
  for (const level of STUDY_LEVELS) {
    const unlocked = game.xp >= level.threshold;
    const current = game.currentLevel.level === level.level;
    const row = node('div', `title-row${current ? ' current' : ''}${unlocked ? '' : ' locked'}`);
    const info = node('div');
    add(info, node('strong', '', level.title), node('small', '', level.flavor));
    add(row, node('strong', '', `Lv. ${level.level}`), info, node('span', 'title-xp', `${level.threshold.toLocaleString()} XP`));
    titleLadder.append(row);
  }
}
function renderProgress() {
  const game = getGamificationSummary(progress);
  progressHero.replaceChildren();

  const hero = node('div', 'progress-hero-main');
  const rank = node('div', 'progress-rank');
  add(rank, node('strong', '', `Lv. ${game.currentLevel.level} · ${game.currentLevel.title}`));
  const bar = node('span', 'game-xp-bar');
  const fill = node('span', 'game-xp-fill');
  fill.style.width = `${Math.round(game.levelProgress * 100)}%`;
  bar.append(fill);
  const xp = node('span', 'game-xp');
  add(xp, bar, node('small', '', game.nextLevel ? `${game.xp.toLocaleString()} XP · ${(game.nextLevel.threshold - game.xp).toLocaleString()} to ${game.nextLevel.title}` : `${game.xp.toLocaleString()} XP · highest title reached`));
  add(hero, rank, node('div', 'progress-level-flavor', game.currentLevel.flavor), xp);
  progressHero.append(
    hero,
    metric('Current streak', `${game.currentStreak} day${game.currentStreak === 1 ? '' : 's'}`),
    metric('Longest streak', `${game.longestStreak} day${game.longestStreak === 1 ? '' : 's'}`),
    metric('Today', game.todayReviews.toLocaleString()),
    metric('Total reviews', game.totalReviews.toLocaleString())
  );

  renderAchievements();
  renderActivity(game);
  renderTitleLadder(game);

  const cards = poolVocab();
  const direction = currentVocabDirection();
  const reviewed = cards.filter(card => getVocabProgressEntry(progress, card.id, direction));
  const mastered = reviewed.filter(card => (getVocabProgressEntry(progress, card.id, direction)?.streak || 0) >= 3).length;
  const due = dueVocab(cards, progress, Date.now(), direction).length;
  const deckLabel = vocabDeckMode === 'active' ? 'Struggling words'
    : vocabDeckMode === 'completed' ? 'Completed focus words'
    : 'Lesson vocabulary';
  const directionLabel = direction === 'e2i' ? 'English → Indonesian' : 'Indonesian → English';
  const selectionLabel = vocabDeckMode === 'lesson'
    ? `${lessonIds.length} selected topic${lessonIds.length === 1 ? '' : 's'}`
    : `${cards.length} selected focus word${cards.length === 1 ? '' : 's'}`;
  vocabProgressSummary.textContent = `${deckLabel} · ${selectionLabel} · ${directionLabel} · ${reviewed.length} practiced · ${due} due`;
  analytics.replaceChildren(
    buildProficiencyBar(cards, progress, direction),
    buildDueHistogram(cards, progress, direction)
  );
}

function buildProficiencyBar(cards, state, direction) {
  const bands = proficiencyBands(cards, state, direction);
  const total = cards.length;
  const directionLabel = direction === 'e2i' ? 'Production' : 'Recognition';
  const wrap = node('section', 'proficiency-card');
  const heading = node('div', 'proficiency-heading');
  add(heading,
    node('strong', '', `${directionLabel} proficiency`),
    node('span', '', total ? `${total} selected word${total === 1 ? '' : 's'}` : 'No selected words')
  );
  wrap.append(heading);

  const bar = node('div', 'stacked-bar');
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', bands.map(band => `${band.label}: ${band.count}`).join(', '));
  for (const band of bands) {
    if (!band.count) continue;
    const segment = node('span', `stacked-seg stacked-seg-${band.key}`);
    segment.style.width = `${band.fraction * 100}%`;
    segment.title = `${band.label} · ${band.count} word${band.count === 1 ? '' : 's'} · ${Math.round(band.fraction * 100)}%`;
    bar.append(segment);
  }
  wrap.append(bar);

  const legend = node('div', 'stacked-legend');
  for (const band of bands) {
    const item = node('span', 'stacked-legend-item');
    add(item,
      node('span', `stacked-legend-dot stacked-seg-${band.key}`),
      node('span', '', band.label),
      node('span', 'stacked-legend-pct', total ? `${Math.round(band.fraction * 100)}% · ${band.count}` : '0% · 0')
    );
    legend.append(item);
  }
  wrap.append(legend);
  return wrap;
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
function buildDueHistogram(cards, state, direction) {
  const labels = ['now', 'today', ...Array.from({length:13}, (_, i) => `${i + 1}d`), '14d+'];
  return histogram('Due by day', dueBuckets(cards, state, Date.now(), direction), labels);
}
function buildConfidenceHistogram(cards, state, direction) {
  const title = direction === 'e2i' ? 'Production confidence' : 'Recognition confidence';
  return histogram(title, confidenceBuckets(cards, state, direction), ['new', '0–19', '20–39', '40–59', '60–79', '80–100']);
}

function head(label, count) {
  const header = node('div', 'study-head');
  add(header, node('span', 'kicker', label), node('span', 'count', count));
  panel.append(header);
}

function renderGuide() {
  const units = selectedUnits(UNITS, lessonIds);
  const focus = mode === 'morphology' && units.length === 1
    ? `Compare forms of ${selectMorphologyFamilies(lessonIds).map(family => family.root).join(', ')}. Choose a form or explain an affix's effect; each choice comes from the same root.`
    : units.length === 1 ? (units[0].guide?.[mode] || (mode === 'grammar' && units[0].bookTopic ? `Choose the construction that fits the sentence and read why the other options change its meaning.` : null)) : null;
  guide.hidden = !focus;
  guide.replaceChildren();
  if (focus) add(guide, node('strong', '', 'LESSON FOCUS'), node('p', '', focus));
}
function renderWordList() {
  if (mode === 'vocabulary' && vocabDeckMode !== 'lesson') {
    const cards = poolVocab();
    wordList.hidden = false;
    const label = vocabDeckMode === 'active' ? 'Struggling words' : 'Completed focus words';
    wordList.querySelector('summary').textContent = `${label} · ${cards.length} words`;
    wordListContent.replaceChildren();
    if (!wordList.open) return;
    const group = node('section', 'word-list-group');
    group.append(node('h3', '', label));
    if (!cards.length) group.append(node('p', 'empty', 'No words in this deck yet.'));
    for (const card of cards) {
      const row = node('div', 'word-list-row');
      add(row, node('strong', '', card.form), node('span', '', card.meaning));
      row.append(node('small', '', [card.pos, card.register, card.focusSource].filter(Boolean).join(' · ')));
      group.append(row);
    }
    wordListContent.append(group);
    return;
  }

  wordList.hidden = mode === 'vocabulary' && vocabDeckMode !== 'lesson' ? false : !lessonIds.length;
  const cards = itemsForMode(UNITS, lessonIds, 'vocabulary');
  const supplemental = cards.filter(card => card.sourceRootId).length;
  wordList.querySelector('summary').textContent = `Vocabulary list · ${cards.length} words${supplemental ? ` (${supplemental} supplemental)` : ''}`;
  wordListContent.replaceChildren();
  if (!wordList.open) return;
  for (const unit of selectedUnits(UNITS, lessonIds)) {
    const group = node('section', 'word-list-group');
    group.append(node('h3', '', `${unit.bookTopic ? `Topik ${unit.bookTopic}` : 'Foundation'} · ${unit.title}`));
    for (const [key, label] of VOCAB_SECTIONS.slice(1)) {
      const vocabulary = filterVocabSection(unit.vocabulary, key);
      if (!vocabulary.length) continue;
      group.append(node('h4', '', `${label} · ${vocabulary.length}`));
      for (const card of vocabulary) {
        const row = node('div', 'word-list-row');
        add(row, node('strong', '', card.form), node('span', '', card.meaning));
        row.append(node('small', '', `${card.pos} · ${card.register}`));
        group.append(row);
      }
    }
    wordListContent.append(group);
  }
}

function renderVocabSectionSelector() {
  const counts = vocabSectionCounts(itemsForMode(UNITS, lessonIds, 'vocabulary'));
  for (const select of [vocabSectionSelect, lessonVocabSectionSelect]) {
    select.replaceChildren(...VOCAB_SECTIONS.map(([key, label]) => {
      const option = node('option', '', `${label} · ${counts[key]}`);
      option.value = key;
      return option;
    }));
    select.value = vocabSection;
  }
}
function renderVocabDeckSelector() {
  const counts = customVocabularyCounts(UNITS);
  const options = [
    ['lesson', 'Lesson vocabulary'],
    ['active', `Struggling words · ${counts.active}`],
    ['completed', `Completed focus words · ${counts.completed}`]
  ];
  vocabDeckSelect.replaceChildren(...options.map(([key, label]) => {
    const option = node('option', '', label);
    option.value = key;
    return option;
  }));
  vocabDeckSelect.value = vocabDeckMode;
  vocabDeckWrap.hidden = mode !== 'vocabulary';
}

function describeSelection() {
  const units = selectedUnits(UNITS, lessonIds);
  const label = !units.length ? 'No lessons selected'
    : units.length === 1 ? `${units[0].bookTopic ? `Topik ${units[0].bookTopic}` : 'Foundation'} · ${units[0].title}`
    : `${units.length} lessons selected`;
  selectionSummary.textContent = label;
  dialogSelectionSummary.textContent = label;
  description.textContent = !units.length ? 'Choose at least one lesson to begin.'
    : units.length === 1 ? units[0].description
    : `${units.length} lessons selected. Practice combines their exercises in book order.`;
}
function renderLessonSelector() {
  for (const [grid, units] of [[lessonGrid, TEXTBOOK_UNITS], [foundationGrid, FOUNDATION_UNITS]]) {
    grid.replaceChildren();
    for (const unit of units) {
      const selected = lessonIds.includes(unit.id);
      const name = unit.bookTopic ? `Topik ${unit.bookTopic}` : `Foundation ${unit.level}`;
      const { focused, addedCount, sample } = topicVocabularyPreview(unit, vocabSection);
      const wrapper = node('div', 'lesson-option');
      const tile = button('', 'lesson-tile' + (selected ? ' selected' : ''), () => {
        lessonIds = selected ? lessonIds.filter(id => id !== unit.id) : normalizeLessonIds([...lessonIds, unit.id], UNITS);
        saveLessonSelection();
        if (lessonDialog.open) [...grid.querySelectorAll('.lesson-tile')].find(candidate => candidate.dataset.lessonId === unit.id)?.focus();
      });
      tile.dataset.lessonId = unit.id;
      tile.setAttribute('aria-pressed', String(selected));
      const familyCount = selectMorphologyFamilies([unit.id]).length;
      add(tile, node('strong', '', name), node('span', 'lesson-title', unit.title), node('small', '', vocabSection === 'all' ? `${unit.vocabulary.length} words · ${addedCount} new PBWL · ${familyCount} root ${familyCount === 1 ? 'family' : 'families'}` : `${focused.length} in this focus · ${unit.vocabulary.length} total words`));
      if (sample.length) tile.append(node('span', 'lesson-word-preview', sample.map(card => card.form).join(' · ')));
      wrapper.append(tile);
      const details = node('details', 'lesson-words');
      details.append(node('summary', '', `See ${focused.length} words`));
      details.addEventListener('toggle', () => {
        if (!details.open || details.querySelector('.lesson-words-content')) return;
        const content = node('div', 'lesson-words-content');
        for (const [section, label] of VOCAB_SECTIONS.slice(1)) {
          if (vocabSection !== 'all' && vocabSection !== section) continue;
          const cards = filterVocabSection(unit.vocabulary, section);
          if (!cards.length) continue;
          content.append(node('h4', '', `${label} · ${cards.length}`));
          for (const card of cards) add(content, node('div', 'lesson-word-row', `${card.form} — ${card.meaning}`));
        }
        details.append(content);
      });
      wrapper.append(details);
      grid.append(wrapper);
    }
  }
}
function saveLessonSelection() {
  localStorage.setItem(SELECTION_KEY, JSON.stringify(lessonIds));
  renderLessonSelector(); describeSelection(); renderGuide(); renderWordList(); renderVocabSectionSelector(); renderVocabDeckSelector();
  itemIndex = 0; stepIndex = 0; chosen = null; translationShown = false;
  morphOrder = null;
  startVocabDeck(); renderProgress(); render();
}
function nextItem() {
  const items = pool();
  if (itemIndex >= items.length - 1) {
    const nextId = nextLessonId(UNITS, lessonIds);
    if (nextId) { lessonIds = [nextId]; saveLessonSelection(); return; }
    if (mode === 'morphology') morphOrder = null;
  }
  itemIndex = (itemIndex + 1) % items.length;
  stepIndex = 0; chosen = null; revealed = false; translationShown = false;
  render();
}
function nextLabel(items) {
  return itemIndex === items.length - 1 && nextLessonId(UNITS, lessonIds) ? 'Next lesson' : mode === 'grammar' ? 'Next question' : mode === 'morphology' ? 'Next root family' : 'Next item';
}

const poolVocab = () => vocabDeckMode === 'lesson'
  ? filterVocabSection(itemsForMode(UNITS, lessonIds, 'vocabulary'), vocabSection)
  : resolveCustomVocabulary(UNITS, vocabDeckMode);
function startVocabDeck() {
  deck = createDeck(poolVocab(), progress, spaced, Date.now(), shuffle, Math.random, currentVocabDirection());
  reviewHistory = [];
  revealed = false;
}
function markVocab(action) {
  if (!deck?.active.length) return;
  reviewHistory.push({ progress, deck });
  if (reviewHistory.length > 40) reviewHistory.shift();
  ({ progress, deck } = reviewVocab(deck, progress, action, spaced, Date.now(), currentVocabDirection()));
  saveProgress(localStorage, progress);
  syncCelebrations();
  revealed = false;
  renderProgress(); render();
}
function undoVocab() {
  const previous = reviewHistory.pop();
  if (!previous) return;
  const celebrationState = {
    celebrationsInitialized: progress.gamification?.celebrationsInitialized,
    lastCelebratedLevel: progress.gamification?.lastCelebratedLevel,
    celebratedAchievementIds: [...(progress.gamification?.celebratedAchievementIds || [])],
    lastCelebratedBadgeDay: progress.gamification?.lastCelebratedBadgeDay
  };
  ({ progress, deck } = previous);
  progress.gamification = { ...progress.gamification, ...celebrationState };
  saveProgress(localStorage, progress);
  revealed = false;
  renderProgress(); render();
}
function reviewNavigation() {
  const nav = node('div', 'actions review-nav');
  if (reviewHistory.length) nav.append(button('↶ Undo', 'secondary', undoVocab));
  if (deck.active.length) nav.append(button(spaced ? 'Again →' : 'Next →', 'secondary', () => markVocab('next')));
  if (!spaced) nav.append(button('↻ Reset', 'secondary', () => { startVocabDeck(); render(); }));
  return nav;
}
function metadata(item) {
  const meta = node('div', 'card-meta');
  for (const value of [item.pos, item.register, item.kind === 'derived' ? 'Affixed form' : 'Root / base', item.irregular ? 'Irregular meaning or form' : null].filter(Boolean)) {
    meta.append(node('span', 'meta-chip', value));
  }
  return meta;
}
function formatWhen(ts) {
  if (!ts) return '—';
  const delta = ts - Date.now();
  const abs = Math.abs(delta);
  if (abs < 60000) return delta > 0 ? 'in <1 min' : 'just now';
  if (abs < 3600000) return delta > 0 ? `in ${Math.ceil(abs / 60000)} min` : `${Math.floor(abs / 60000)} min ago`;
  if (abs < 86400000) return delta > 0 ? `in ${Math.ceil(abs / 3600000)} hr` : `${Math.floor(abs / 3600000)} hr ago`;
  return delta > 0 ? `in ${Math.ceil(abs / 86400000)} days` : `${Math.floor(abs / 86400000)} days ago`;
}
function renderCardStats(item) {
  const direction = currentVocabDirection();
  const stats = getCardStats(progress, item.id, Date.now(), direction);
  const directionLabel = direction === 'e2i' ? 'English → Indonesian' : 'Indonesian → English';
  const details = node('details', 'card-stats');
  details.append(node('summary', '', stats.seen ? `${directionLabel} stats · seen ${stats.seen}×` : `${directionLabel} stats · new`));
  const grid = node('div', 'card-stats-grid');
  const addStat = (label, value) => {
    const box = node('span', 'card-stat');
    add(box, node('strong', '', value), node('small', '', label));
    grid.append(box);
  };
  addStat('Seen', stats.seen);
  if (stats.hasRatingBreakdown) {
    addStat('Easy', stats.easy);
    addStat('Uncertain', stats.unsure);
    addStat('Hard', stats.hard);
    if (stats.legacyUnclassified) addStat('Earlier reviews', stats.legacyUnclassified);
  } else {
    addStat('Easy / correct', stats.correct);
    addStat('Needs work', stats.wrong);
  }
  addStat('Current streak', stats.streak);
  addStat('Confidence', stats.confidencePct == null ? '—' : `${stats.confidencePct}%`);
  addStat('Due', stats.dueAt ? formatWhen(stats.dueAt) : 'now');
  if (stats.last) addStat('Last seen', formatWhen(stats.last));
  details.append(grid);
  return details;
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
  if (!items.length) {
    const message = vocabDeckMode === 'completed' ? 'No retired focus words yet. Words moved out of the active focus deck will appear here when they are not already covered by another lesson.'
      : vocabDeckMode === 'active' ? 'No active struggling words are configured.'
      : lessonIds.length ? 'No words in this section. Choose another vocabulary section.' : 'Select a textbook lesson or foundation set to begin.';
    panel.append(node('p', 'empty', message)); return;
  }
  if (!deck) startVocabDeck();
  const headLabel = vocabDeckMode === 'active' ? 'VOCABULARY · STRUGGLING WORDS' : vocabDeckMode === 'completed' ? 'VOCABULARY · COMPLETED FOCUS' : 'VOCABULARY · FLIP CARDS';
  head(headLabel, `${deck.completed} of ${deck.total} completed`);
  if (!deck.active.length && !spaced && deck.middle.length) {
    add(panel, node('h2', '', 'End of round'), node('p', 'subtitle', `${deck.middle.length} unconfirmed card${deck.middle.length === 1 ? '' : 's'} ready for another pass.`));
    panel.append(reviewNavigation());
    panel.append(button('Next → Review remaining', 'primary', () => {
      reviewHistory.push({ progress, deck });
      if (reviewHistory.length > 40) reviewHistory.shift();
      deck = nextVocabRound(deck, shuffle);
      render();
    }));
    return;
  }
  if (!deck.active.length) {
    add(panel, node('h2', '', spaced ? 'All caught up' : 'Deck complete'), node('p', 'subtitle', spaced ? 'No cards are due right now. Turn off spaced review to practice the full deck.' : 'You finished this practice deck. Start again to review.'));
    panel.append(reviewNavigation());
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
  if (item.focusSource) back.append(node('span', 'card-focus-source', `Focus source: ${item.focusSource}${item.focusCanonical ? ' · shared lesson card' : ' · personal-only card'}`));
  if (item.focusNote && item.focusNote !== item.note) back.append(node('span', 'card-note', item.focusNote));
  inner.append(front, back); card.append(inner); panel.append(card, renderCardStats(item));
  panel.append(reviewNavigation());
  const actions = node('div', 'actions review-actions');
  for (const [label, rating, hint, style] of [['✗ Hard', 'again', '1', 'review-hard'], ['~ Uncertain', 'unsure', '2', 'review-uncertain'], ['✓ Easy', 'know', '3', 'review-easy']]) {
    actions.append(button(`${label}  ${hint}`, style, () => markVocab(rating)));
  }
  panel.append(actions);
  panel.append(node('p', 'review-hint', spaced ? 'Hard requeues · Uncertain: 2 hr · Easy: from 22 hr · Again → rates Hard' : 'Hard and Uncertain return later · Easy clears the card · Next → does not score'));
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
  const questions = familyQuestions(item, morphReverse ? 'select' : 'understand');
  const question = questions[stepIndex];
  head(morphReverse ? 'MORPHOLOGY · SELECT A FORM' : 'MORPHOLOGY · AFFIX EFFECT', `${countLabel(itemIndex, items.length)} · question ${stepIndex + 1} of ${questions.length}`);
  add(panel, node('span', 'family-label', 'ROOT FAMILY'), node('div', 'word', item.root));
  panel.append(node('p', 'subtitle', morphReverse ? 'Select the Indonesian form that carries the English meaning.' : 'Choose what this form contributes. The other answers describe forms of the same root.'));
  choices(question, question.id, () => {
    chosen = null;
    stepIndex++;
    render();
  });
  if (chosen !== null) panel.append(node('p', 'affix-detail', `Affix: ${item.forms[stepIndex].affix} · ${item.forms[stepIndex].word} = ${item.forms[stepIndex].effect}`));
  panel.append(button(`Skip to ${nextLabel(items).toLowerCase()}`, 'skip-link', nextItem));
}

function renderMorphSummary(item, items) {
  head('MORPHOLOGY · ROOT FAMILY', countLabel(itemIndex, items.length));
  panel.append(node('h2', '', item.root));
  const details = node('dl', 'family-analysis');
  for (const form of item.forms) {
    add(details, node('dt', '', form.word), node('dd', '', `${form.affix} · ${form.effect}`));
  }
  panel.append(details, button(nextLabel(items), 'primary', nextItem));
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

function renderGrammar(item, items) {
  head('GRAMMAR · IN CONTEXT', countLabel(itemIndex, items.length));
  panel.append(node('div', 'context', item.context));
  choices(item, item.id, nextItem);
  if (chosen === null) panel.append(button(`Skip to ${nextLabel(items).toLowerCase()}`, 'skip-link', nextItem));
}

function render() {
  panel.replaceChildren();
  toolbar.hidden = mode !== 'vocabulary';
  directionButton.hidden = mode !== 'vocabulary';
  directionButton.setAttribute('aria-pressed', String(reverse));
  directionButton.textContent = reverse ? 'English → Indonesian' : 'Indonesian → English';
  directionButton.title = reverse ? 'Production practice: recall the Indonesian form' : 'Recognition practice: recall the English meaning';
  morphDirectionButton.hidden = mode !== 'morphology';
  morphDirectionButton.setAttribute('aria-pressed', String(morphReverse));
  morphDirectionButton.textContent = morphReverse ? 'Mode: Select a form' : 'Mode: Explain affixes';
  shuffleButton.hidden = mode !== 'vocabulary' && mode !== 'morphology';
  vocabDeckWrap.hidden = mode !== 'vocabulary';
  vocabSectionWrap.hidden = mode !== 'vocabulary' || vocabDeckMode !== 'lesson';
  wordList.hidden = mode === 'vocabulary' && vocabDeckMode !== 'lesson' ? false : !lessonIds.length;
  if (mode === 'vocabulary') { renderVocab(); return; }
  const items = pool();
  if (!items.length) { panel.append(node('p', 'empty', 'No exercises in this selection yet.')); return; }
  itemIndex %= items.length;
  const item = items[itemIndex];
  if (mode === 'morphology') {
    if (stepIndex >= item.forms.length) renderMorphSummary(item, items);
    else renderMorphology(item, items);
  } else if (mode === 'grammar') renderGrammar(item, items);
  else renderReading(item, items);
}

openProgress.addEventListener('click', () => { renderProgress(); progressDialog.showModal(); });
progressDialog.addEventListener('close', () => openProgress.focus());
document.querySelector('#close-progress').addEventListener('click', () => progressDialog.close());
document.querySelector('#close-progress-footer').addEventListener('click', () => progressDialog.close());
progressDialog.addEventListener('click', event => {
  if (event.target === progressDialog) progressDialog.close();
});
openLessons.addEventListener('click', () => lessonDialog.showModal());
lessonDialog.addEventListener('close', () => openLessons.focus());
document.querySelector('#close-lessons').addEventListener('click', () => lessonDialog.close());
document.querySelector('#done-lessons').addEventListener('click', () => lessonDialog.close());
document.querySelector('#select-all-topics').addEventListener('click', () => {
  lessonIds = normalizeLessonIds([...lessonIds, ...TEXTBOOK_UNITS.map(unit => unit.id)], UNITS);
  saveLessonSelection();
});
document.querySelector('#clear-lessons').addEventListener('click', () => { lessonIds = []; saveLessonSelection(); });
wordList.addEventListener('toggle', () => { if (wordList.open) renderWordList(); });
function chooseVocabSection(value) {
  vocabSection = value;
  localStorage.setItem(VOCAB_SECTION_KEY, vocabSection);
  renderVocabSectionSelector(); renderLessonSelector();
  startVocabDeck(); renderProgress(); render();
}
vocabSectionSelect.addEventListener('change', () => chooseVocabSection(vocabSectionSelect.value));
vocabDeckSelect.addEventListener('change', () => {
  vocabDeckMode = vocabDeckSelect.value;
  localStorage.setItem(VOCAB_DECK_KEY, vocabDeckMode);
  itemIndex = 0; revealed = false;
  renderVocabDeckSelector(); renderWordList();
  startVocabDeck(); renderProgress(); render();
});
lessonVocabSectionSelect.addEventListener('change', () => chooseVocabSection(lessonVocabSectionSelect.value));
document.querySelectorAll('[data-mode]').forEach(tab => tab.addEventListener('click', () => {
  mode = tab.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(other => { if (other === tab) other.setAttribute('aria-current', 'page'); else other.removeAttribute('aria-current'); });
  itemIndex = 0; stepIndex = 0; chosen = null; revealed = false; translationShown = false;
  if (mode === 'morphology') morphOrder = null;
  renderGuide(); renderWordList(); render();
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
    progress = normalizeProgress(imported); saveProgress(localStorage, progress); syncCelebrations(false); startVocabDeck(); renderProgress(); render();
    alert('Progress imported.');
  } catch { alert('Could not read this progress file.'); }
  event.target.value = '';
});
document.querySelector('#reset-button').addEventListener('click', () => {
  if (!confirm('Clear all Indonesian Study progress in this browser?')) return;
  progress = normalizeProgress(null); saveProgress(localStorage, progress); syncCelebrations(false); startVocabDeck(); renderProgress(); render();
});
spacedButton.addEventListener('click', () => { spaced = !spaced; spacedButton.setAttribute('aria-pressed', String(spaced)); spacedButton.textContent = `Spaced review: ${spaced ? 'On' : 'Off'}`; startVocabDeck(); render(); });
directionButton.addEventListener('click', () => {
  reverse = !reverse;
  localStorage.setItem(VOCAB_DIRECTION_KEY, reverse ? 'e2i' : 'i2e');
  startVocabDeck();
  renderProgress();
  render();
});
morphDirectionButton.addEventListener('click', () => {
  morphReverse = !morphReverse;
  localStorage.setItem(MORPH_DIRECTION_KEY, morphReverse ? 'select' : 'understand');
  chosen = null;
  const current = pool()[itemIndex];
  if (current && stepIndex >= current.forms.length) stepIndex = 0;
  renderGuide(); render();
});
shuffleButton.addEventListener('click', () => {
  shuffle = !shuffle;
  localStorage.setItem(SHUFFLE_KEY, String(shuffle));
  shuffleButton.setAttribute('aria-pressed', String(shuffle));
  shuffleButton.textContent = `Shuffle: ${shuffle ? 'On' : 'Off'}`;
  if (mode === 'morphology') {
    const items = selectMorphologyFamilies(lessonIds);
    morphOrder = orderMorphology(items, morphOrder, itemIndex, shuffle);
  } else {
    if (!deck) startVocabDeck();
    reviewHistory = [];
    deck = orderDeck(deck, poolVocab(), shuffle);
    revealed = false;
  }
  render();
});
document.addEventListener('keydown', event => {
  if (mode !== 'vocabulary' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('input, select, textarea, dialog, button, summary')) return;
  if ((event.key === 'z' || event.key === 'Z') && reviewHistory.length) { event.preventDefault(); undoVocab(); return; }
  if (!deck?.active.length) return;
  if (['Digit1', 'Digit2', 'Digit3'].includes(event.code)) {
    event.preventDefault(); markVocab({ Digit1: 'again', Digit2: 'unsure', Digit3: 'know' }[event.code]);
    return;
  }
  if (event.code === 'ArrowRight' || event.key === 'n' || event.key === 'N') { event.preventDefault(); markVocab('next'); return; }
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
shuffleButton.setAttribute('aria-pressed', String(shuffle));
shuffleButton.textContent = `Shuffle: ${shuffle ? 'On' : 'Off'}`;
renderLessonSelector(); describeSelection(); renderGuide(); renderWordList(); renderVocabSectionSelector(); renderVocabDeckSelector(); startVocabDeck(); syncCelebrations(false); renderProgress(); render();

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
