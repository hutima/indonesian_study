// Selectors panel: builds the Sessions / Chapters / Supplementals / Advanced
// buttons inside the Study Selector overlay, and owns the toggle/deselect/load
// flow that drives runtime.selectedKeys → runtime.deck.
//
// The module reads/writes runtime state directly. Host callbacks cover the
// deck-building primitives and rendering hooks that still live in main.js
// (saveState, buildStudyDeck, getSelectedCards, etc.). Window globals
// (window.SETS, MORPHOLOGY_SETS, GRAMMAR_SETS, getMorphologyCountForKey,
// getGrammarCountForKey) come from legacy <script defer> data files and are
// read defensively in case those files haven't finished loading yet.

import { runtime } from '../state/runtime.js';
import { shuffleArray } from '../utils/helpers.js';
import { SESSION_IDLE_RESET_MS } from '../domain/srs/constants.js';
import {
  isChapterKey,
  isAdvancedKey,
  isBookKey,
  sortSetKeys,
  expandSessionSets
} from '../domain/deck/ordering.js';
import { CHAPTER_TITLES, WEEK_FIRST_CHAPTER } from '../data/setMeta.js';
import { filterHardVocabCards } from '../domain/deck/filters.js';
import { renderCard, renderChooseSessionEmptyState } from './render.js';
import { renderProgress, renderReview } from './progress.js';

let host = {
  getSessions: () => [],
  getSelectedCards: () => [],
  getDirectionalMarksStore: () => ({}),
  getDirectionalProgressStore: () => ({}),
  resetMorphAnswerState: () => {},
  getDeckStateKey: () => '',
  reorderDeckFromIds: () => null,
  buildStudyDeck: () => [],
  getDueCount: () => 0,
  resetUnspacedCycleState: () => {},
  resetStudyState: () => {},
  resetParsingShowCounts: () => {},
  syncToggleButtons: () => {},
  clearSpacedUndoSnapshot: () => {},
  saveCurrentDeckStateToBank: () => {},
  markActiveDeckRef: () => {},
  saveState: () => {},
  canAccessGrammarUi: () => true,
  isMorphStepByStepActive: () => false,
  getFocusedParadigmCards: () => null
};

export function configureSelectors(deps) {
  host = { ...host, ...deps };
}

export function isSessionFullySelected(session, keys = runtime.selectedKeys) {
  const sessionKeys = expandSessionSets(session);
  return sessionKeys.length > 0 && sessionKeys.every(key => keys.includes(String(key)));
}

export function findExactSessionMatch(keys = runtime.selectedKeys) {
  const normalizedKeys = sortSetKeys((keys || []).map(String));
  return host.getSessions().find(session => {
    const sessionKeys = expandSessionSets(session);
    return sessionKeys.length === normalizedKeys.length && sessionKeys.every((key, idx) => key === normalizedKeys[idx]);
  }) || null;
}

export function setActiveSessionButton() {
  document.querySelectorAll('.session-btn').forEach(btn => {
    const session = host.getSessions().find(s => s.id === btn.dataset.sessionId);
    btn.classList.toggle('active', !!session && isSessionFullySelected(session));
  });
}

export function setActiveSetButtons() {
  document.querySelectorAll('.chapter-btn').forEach(btn => {
    const key = btn.dataset.key;
    btn.classList.toggle('active', runtime.selectedKeys.includes(key));
  });
}

export function buildSessions() {
  const grid = document.getElementById('sessionsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  host.getSessions().forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'session-btn' + (s.special ? ' special' : '');
    btn.id = 'sess-' + s.id;
    btn.dataset.sessionId = s.id;
    const summaryHtml = (host.canAccessGrammarUi() && s.summary)
      ? `<br><span class="session-chapters">${s.summary}</span>`
      : '';
    btn.innerHTML = `<span class="session-tag">${s.tag}</span>${s.label}${summaryHtml}`;
    btn.onclick = () => toggleSession(s);
    grid.appendChild(btn);
  });

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all sessions';
  deselectBtn.onclick = () => deselectAllChapters();
  grid.appendChild(deselectBtn);

  setActiveSessionButton();
}

export function buildChapterSelector() {
  const grid = document.getElementById('chaptersGrid');
  if (!grid) return;
  grid.innerHTML = '';
  grid.classList.add('chapters-grid');

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const chapterKeys = Object.keys(sets).filter(isChapterKey).sort((a, b) => Number(a) - Number(b));

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all chapters';
  deselectBtn.onclick = () => deselectAllChapters();
  grid.appendChild(deselectBtn);

  chapterKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    const morphCount = window.getMorphologyCountForKey ? window.getMorphologyCountForKey(key) : 0;
    const grammarCount = window.getGrammarCountForKey ? window.getGrammarCountForKey(key) : 0;
    const studyCount = morphCount + grammarCount;
    const vocabCount = Array.isArray(set.cards) ? set.cards.length : 0;
    if (!vocabCount && !studyCount) return;
    if (!host.canAccessGrammarUi() && !vocabCount) return;

    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.dataset.key = key;
    // The count tracks the "Starred words only" toggle: when it's on, only the
    // starred (required) cards are actually loaded into the deck, so the chapter
    // button should advertise that narrowed number rather than the full vocab.
    const shownVocab = runtime.requiredOnly && Array.isArray(set.cards)
      ? set.cards.filter(card => card.required).length
      : vocabCount;
    const countLabel = `${shownVocab} vocab`;
    const subject = CHAPTER_TITLES[Number(key)] || '';
    const subtitleHtml = subject ? `<span class="chapter-subtitle">${subject}</span>` : '';
    btn.innerHTML = `${set.label}${subtitleHtml}<span class="chapter-count">${countLabel}</span>`;
    btn.onclick = () => toggleSet(key);
    grid.appendChild(btn);
  });

  setActiveSetButtons();
}

function getSupplementalParadigmsForKey(key) {
  const raw = String(key);
  const paradigms = [];
  const morphSet = window.MORPHOLOGY_SETS?.[raw];
  if (morphSet && Array.isArray(morphSet.items)) {
    morphSet.items.forEach((item, idx) => {
      paradigms.push({
        key: `${raw}::morph::${idx}`,
        type: 'Morphology',
        label: item.family || item.lemma || `Morphology ${idx + 1}`,
        count: Array.isArray(item.questions) ? item.questions.length : 0
      });
    });
  }

  // Grammar tied to a paradigm-practice set (legacy lecture-week questions,
  // re-homed in grammar.js) rides along when the set is selected — it is NOT
  // surfaced as a separate selectable sub-paradigm, so a set that already has a
  // morph paradigm stays a single button instead of becoming a collapsible.
  // (Grammar-only supplemental sets no longer exist.)
  return paradigms.filter(paradigm => paradigm.count > 0);
}

// Selecting the flat set key for every set in a week pulls in that set's
// vocab plus all of its grammar/morph paradigms — including multi-paradigm
// sets that are otherwise only reachable via split sub-keys. Pressing the
// button a second time (when every set in the week is already flat-selected)
// clears all selections for the week, including any sub-key remnants.
function toggleAllWeekSupplementals(weekKeys) {
  const keys = (weekKeys || []).map(String);
  if (!keys.length) return;
  const allAlreadySelected = keys.every(k => runtime.selectedKeys.includes(k));
  const weekKeySet = new Set(keys);
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  const retained = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !weekKeySet.has(base);
  });
  if (allAlreadySelected) {
    runtime.selectedKeys = retained;
    if (!runtime.selectedKeys.length) {
      clearAndRenderEmpty();
      return;
    }
    loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
    return;
  }
  const nextKeys = sortSetKeys([...new Set([...retained, ...keys])]);
  loadDeckFromKeys(nextKeys, null, { clearUnspacedMarks: true });
}

// Sets registered as stem-flip flashcards (present ↔ aorist/future/perfect)
// are pulled out of chapter-grouped "Paradigm practice" and shown in their own
// "Irregular practice" section. Detect by the stemFlip card flag so new flip
// sets are picked up automatically.
function isFlipSet(set) {
  return !!(set && Array.isArray(set.cards) && set.cards.some(c => c && c.stemFlip));
}

// Sets kept registered (so their data still feeds a stem-change drill) but
// hidden from the selector and removed from study decks. W4_SECOND_AORIST_STEMS
// duplicated the highlighted W4_SECOND_AORIST_FLIP flashcards; its "present →
// aorist" pairs still generate the second-aorist stem-change recall drill.
const HIDDEN_SUPPLEMENTAL_KEYS = new Set(['W4_SECOND_AORIST_STEMS']);

// The chapter a supplemental set belongs to: its explicit `chapter` tag, or
// the first chapter of its course `week` as a fallback.
function chapterForSet(set) {
  if (set && Number.isInteger(set.chapter)) return set.chapter;
  const wk = Number(set && set.week);
  if (Number.isFinite(wk) && WEEK_FIRST_CHAPTER[wk] != null) return WEEK_FIRST_CHAPTER[wk];
  return null;
}

// True for keys that belong to chapter-grouped "Paradigm practice" — i.e.
// supplemental sets that aren't chapters, advanced buckets, book vocab, flip
// (irregular practice) sets, or hidden drill-only sets.
function isParadigmPracticeKey(key) {
  const base = getParadigmBaseKey(key) || String(key);
  if (isChapterKey(base) || isAdvancedKey(base) || isBookKey(base)) return false;
  if (HIDDEN_SUPPLEMENTAL_KEYS.has(base)) return false;
  return !isFlipSet((window.SETS || {})[base]);
}

export function deselectAllSupplementals() {
  const remaining = runtime.selectedKeys.filter(k => !isParadigmPracticeKey(k));
  if (remaining.length === runtime.selectedKeys.length) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

export function deselectAllIrregular() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !isFlipSet((window.SETS || {})[base]);
  });
  if (remaining.length === runtime.selectedKeys.length) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

// The count shown on a paradigm-practice entry: the number of paradigm
// tables in the set. Sets with no tables (vocab-only supplements, the
// stem-flip irregular sets) fall back to their vocab count so the number
// isn't a meaningless "0 paradigms".
function paradigmCount(key) {
  return host.canAccessGrammarUi() ? getSupplementalParadigmsForKey(key).length : 0;
}
function entryCountLabel(key, vocabCount) {
  const n = paradigmCount(key);
  // "set" instead of "paradigm" here: the per-entry count sits in a narrow
  // right-hand column where "paradigm(s)" wraps mid-word ("paradig / m").
  return n > 0 ? `${n} set${n === 1 ? '' : 's'}` : `${vocabCount} vocab`;
}

// Renders one selectable supplemental set into `container` — a flat button
// when the set has 0–1 parsing paradigms, or an expandable <details> listing
// each paradigm when it has more than one. Shared by the chapter groups.
// `labelOverride` lets a flattened single-set chapter prefix the chapter name.
function renderSupplementalEntry(container, key, set, vocabCount, studyCount, labelOverride) {
  const label = labelOverride || set.label;
  const countLabel = entryCountLabel(key, vocabCount);
  const paradigmList = host.canAccessGrammarUi() ? getSupplementalParadigmsForKey(key) : [];

  if (paradigmList.length <= 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chapter-btn supplemental-set-flat';
    btn.dataset.key = key;
    btn.innerHTML = `<span>${label}</span><span class="chapter-count">${countLabel}</span>`;
    btn.onclick = () => toggleSet(key);
    container.appendChild(btn);
    return;
  }

  const details = document.createElement('details');
  details.className = 'supplemental-set';
  details.open = runtime.selectedKeys.includes(String(key)) || paradigmList.some(paradigm => runtime.selectedKeys.includes(paradigm.key));

  const summary = document.createElement('summary');
  summary.className = 'supplemental-summary';
  summary.innerHTML = `<span>${label}</span><span class="chapter-count">${countLabel}</span>`;
  details.appendChild(summary);

  const controls = document.createElement('div');
  controls.className = 'supplemental-paradigm-list';

  const allBtn = document.createElement('button');
  allBtn.className = 'chapter-btn supplemental-all-btn';
  allBtn.dataset.key = key;
  allBtn.innerHTML = `All ${label}<span class="chapter-count">${countLabel}</span>`;
  allBtn.onclick = () => toggleSet(key);
  controls.appendChild(allBtn);

  paradigmList.forEach(paradigm => {
    const btn = document.createElement('button');
    btn.className = 'chapter-btn supplemental-paradigm-btn';
    btn.dataset.key = paradigm.key;
    btn.innerHTML = `${paradigm.label}<span class="chapter-count">${paradigm.type} · ${paradigm.count} card${paradigm.count === 1 ? '' : 's'}</span>`;
    btn.onclick = () => toggleSet(paradigm.key);
    controls.appendChild(btn);
  });

  details.appendChild(controls);
  container.appendChild(details);
}

// Shared visibility test for a supplemental set in the current mode/split.
function supplementalEntryVisible(key, set) {
  const vocabCount = Array.isArray(set.cards) ? set.cards.length : 0;
  const morphCount = window.getMorphologyCountForKey ? window.getMorphologyCountForKey(key) : 0;
  const grammarCount = window.getGrammarCountForKey ? window.getGrammarCountForKey(key) : 0;
  const studyCount = morphCount + grammarCount;
  if (!vocabCount && !studyCount) return null;
  if (!host.canAccessGrammarUi() && !vocabCount) return null;
  const splitVocabOnly = runtime.splitSelection && runtime.studyMode === 'vocab';
  const splitGrammarOnly = runtime.splitSelection && runtime.studyMode === 'morph';
  if (splitVocabOnly && !vocabCount) return null;
  if (splitGrammarOnly && !studyCount) return null;
  return { vocabCount, studyCount };
}

// "Paradigm practice" — supplemental paradigm/vocab sets grouped by the Duff
// chapter where their material is taught (was: grouped by course week).
export function buildSupplementalSelector() {
  const list = document.getElementById('supplementalGrid');
  if (!list) return;
  list.innerHTML = '';

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const supplementalKeys = sortSetKeys(Object.keys(sets).filter(k => !isChapterKey(k) && !isAdvancedKey(k)));

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all paradigm practice';
  deselectBtn.onclick = () => deselectAllSupplementals();
  list.appendChild(deselectBtn);

  const chapterGroups = new Map();
  supplementalKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    if (HIDDEN_SUPPLEMENTAL_KEYS.has(key)) return; // drill-only, hidden
    if (isFlipSet(set)) return;                    // shown under Irregular practice
    const vis = supplementalEntryVisible(key, set);
    if (!vis) return;
    const chapter = chapterForSet(set);
    if (!chapterGroups.has(chapter)) chapterGroups.set(chapter, []);
    chapterGroups.get(chapter).push({ key, set, vocabCount: vis.vocabCount, studyCount: vis.studyCount });
  });

  const orderedChapters = [...chapterGroups.keys()].sort((a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return a - b;
  });

  const meta = document.getElementById('supplementalSectionMeta');
  if (meta) {
    const totalSets = orderedChapters.reduce((n, c) => n + (chapterGroups.get(c)?.length || 0), 0);
    meta.textContent = totalSets
      ? `${orderedChapters.length} chapter${orderedChapters.length === 1 ? '' : 's'} · ${totalSets} set${totalSets === 1 ? '' : 's'}`
      : '';
  }

  orderedChapters.forEach(chapter => {
    const entries = chapterGroups.get(chapter);
    if (!entries || !entries.length) return;
    const chapterLabel = chapter == null ? 'Other paradigms' : `Chapter ${chapter}`;

    // Every chapter renders as a consistent group — even single-paradigm
    // chapters (e.g. 10, 12) get the same "Chapter N" header + Select-all as
    // the rest, rather than a bare inline button.
    const chapterDetails = document.createElement('details');
    chapterDetails.className = 'supplemental-week';
    chapterDetails.open = entries.some(({ key }) =>
      runtime.selectedKeys.includes(String(key)) ||
      getSupplementalParadigmsForKey(key).some(p => runtime.selectedKeys.includes(p.key))
    );
    const chapterSummary = document.createElement('summary');
    chapterSummary.className = 'supplemental-week-summary';
    const totalVocab = entries.reduce((s, e) => s + e.vocabCount, 0);
    const totalParadigms = entries.reduce((s, e) => s + paradigmCount(e.key), 0);
    const subject = chapter != null ? (CHAPTER_TITLES[chapter] || '') : '';
    const titleHtml = subject
      ? `<span class="supplemental-week-title"><span>${chapterLabel}</span><span class="supplemental-week-subtitle">${subject}</span></span>`
      : `<span>${chapterLabel}</span>`;
    const setsLabel = `${entries.length} set${entries.length === 1 ? '' : 's'}`;
    // The per-paradigm-table count was dropped here (now folded into the
    // per-entry "N set(s)" labels); the header just names how many sets the
    // chapter holds, falling back to a vocab total for table-less chapters.
    const chapterCount = totalParadigms > 0
      ? setsLabel
      : `${setsLabel} · ${totalVocab} vocab`;
    chapterSummary.innerHTML = `${titleHtml}<span class="chapter-count">${chapterCount}</span>`;
    chapterDetails.appendChild(chapterSummary);

    const chapterBody = document.createElement('div');
    chapterBody.className = 'supplemental-week-body';

    const chapterEntryKeys = entries.map(e => String(e.key));
    const allSelected = chapterEntryKeys.length > 0
      && chapterEntryKeys.every(k => runtime.selectedKeys.includes(k));
    const selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.className = 'chapter-btn supplemental-select-all-week';
    if (allSelected) selectAllBtn.classList.add('active');
    selectAllBtn.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    const groupName = chapter == null ? 'other paradigms' : `Chapter ${chapter}`;
    selectAllBtn.textContent = allSelected ? `Deselect all ${groupName}` : `Select all ${groupName}`;
    selectAllBtn.onclick = () => toggleAllWeekSupplementals(chapterEntryKeys);
    chapterBody.appendChild(selectAllBtn);

    entries.forEach(({ key, set, vocabCount, studyCount }) => {
      renderSupplementalEntry(chapterBody, key, set, vocabCount, studyCount);
    });

    chapterDetails.appendChild(chapterBody);
    list.appendChild(chapterDetails);
  });

  // The Irregular-practice section is rebuilt alongside paradigm practice so
  // every refresh path (mode switch, data load, restore) keeps both in sync.
  buildIrregularPracticeSelector();

  setActiveSetButtons();
}

// "Irregular practice" — the stem-flip flashcard sets (present ↔ aorist /
// future / perfect), shown together in their own section above paradigm
// practice. Ordered by chapter.
export function buildIrregularPracticeSelector() {
  const list = document.getElementById('irregularGrid');
  if (!list) return;
  list.innerHTML = '';

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const flipKeys = sortSetKeys(Object.keys(sets).filter(k => isFlipSet(sets[k]) && !HIDDEN_SUPPLEMENTAL_KEYS.has(k)));

  const entries = [];
  flipKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    const vis = supplementalEntryVisible(key, set);
    if (!vis) return;
    entries.push({ key, set, chapter: chapterForSet(set), vocabCount: vis.vocabCount, studyCount: vis.studyCount });
  });
  entries.sort((a, b) => (a.chapter ?? 99) - (b.chapter ?? 99) || a.key.localeCompare(b.key));

  const meta = document.getElementById('irregularSectionMeta');
  if (meta) {
    meta.textContent = entries.length
      ? `${entries.length} set${entries.length === 1 ? '' : 's'}`
      : '';
  }

  if (!entries.length) return;

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all irregular practice';
  deselectBtn.onclick = () => deselectAllIrregular();
  list.appendChild(deselectBtn);

  const body = document.createElement('div');
  body.className = 'supplemental-week-body irregular-practice-body';
  entries.forEach(({ key, set, vocabCount, studyCount }) => {
    renderSupplementalEntry(body, key, set, vocabCount, studyCount);
  });
  list.appendChild(body);

  setActiveSetButtons();
}

function getAdvancedSubGroups(set) {
  const cards = Array.isArray(set?.cards) ? set.cards : [];
  if (!cards.length) return [];
  const groups = new Map();
  cards.forEach((card, index) => {
    const sub = card && card.sub ? String(card.sub) : 'group';
    if (!groups.has(sub)) groups.set(sub, { sub, count: 0, firstIndex: index });
    groups.get(sub).count += 1;
  });
  return [...groups.values()].sort((a, b) => a.firstIndex - b.firstIndex);
}

export function buildAdvancedSelector() {
  const list = document.getElementById('advancedGrid');
  if (!list) return;
  list.innerHTML = '';

  const sets = window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
  const advancedKeys = sortSetKeys(Object.keys(sets).filter(isAdvancedKey));

  const meta = document.getElementById('advancedSectionMeta');
  if (meta) {
    if (!advancedKeys.length) {
      meta.textContent = '';
    } else {
      const totalCards = advancedKeys.reduce((sum, key) => sum + (Array.isArray(sets[key]?.cards) ? sets[key].cards.length : 0), 0);
      meta.textContent = `${advancedKeys.length} buckets · ${totalCards.toLocaleString()} lemmas`;
    }
  }

  if (!advancedKeys.length) {
    const empty = document.createElement('div');
    empty.className = 'advanced-empty';
    empty.textContent = 'Advanced vocabulary data has not loaded yet.';
    list.appendChild(empty);
    return;
  }

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all advanced';
  deselectBtn.onclick = () => deselectAllAdvanced();
  list.appendChild(deselectBtn);

  const body = document.createElement('div');
  body.className = 'advanced-week-body';

  advancedKeys.forEach(key => {
    const set = sets[key];
    if (!set) return;
    const cardCount = Array.isArray(set.cards) ? set.cards.length : 0;
    if (!cardCount) return;
    const subGroups = getAdvancedSubGroups(set);
    const countLabel = `${cardCount} lemmas${set.notes ? '' : ''}`;

    const details = document.createElement('details');
    details.className = 'supplemental-set advanced-set';
    details.open = runtime.selectedKeys.includes(String(key));

    const summary = document.createElement('summary');
    summary.className = 'supplemental-summary advanced-summary';
    summary.innerHTML = `<span>${set.label || key}</span><span class="chapter-count">${countLabel}</span>`;
    details.appendChild(summary);

    if (set.notes) {
      const notes = document.createElement('div');
      notes.className = 'advanced-notes';
      notes.textContent = set.notes;
      details.appendChild(notes);
    }

    const controls = document.createElement('div');
    controls.className = 'supplemental-paradigm-list advanced-sub-list';

    const allBtn = document.createElement('button');
    allBtn.className = 'chapter-btn supplemental-all-btn';
    allBtn.dataset.key = key;
    allBtn.innerHTML = `All of ${set.label || key}<span class="chapter-count">${cardCount} lemmas</span>`;
    allBtn.onclick = () => toggleSet(key);
    controls.appendChild(allBtn);

    subGroups.forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'chapter-btn supplemental-paradigm-btn advanced-sub-btn';
      btn.dataset.key = `${key}::sub::${group.sub}`;
      btn.innerHTML = `Sub ${group.sub}<span class="chapter-count">${group.count} lemmas</span>`;
      btn.onclick = () => toggleAdvancedSubGroup(key, group.sub);
      controls.appendChild(btn);
    });

    details.appendChild(controls);
    body.appendChild(details);
  });

  list.appendChild(body);
  setActiveSetButtons();
}

// Shared empty-state path used when a deselect leaves no selected keys.
function clearAndRenderEmpty() {
  // Deselecting everything is a "new session" event for the unspaced flow:
  // wipe the archive marks for the cards we were just studying so the next
  // selection starts fresh.
  if (!runtime.spacedRepetition) {
    const directionalMarks = host.getDirectionalMarksStore();
    (runtime.originalDeck || []).forEach(card => {
      if (card && card.id) delete directionalMarks[card.id];
    });
  }
  setActiveSessionButton();
  setActiveSetButtons();
  runtime.deck = [];
  runtime.originalDeck = [];
  runtime.activeDeckRef = null;
  runtime.marks = {};
  runtime.currentIdx = 0;
  runtime.unspacedRoundSize = 0;
  runtime.unspacedRoundMarks = 0;
  renderChooseSessionEmptyState();
  host.clearSpacedUndoSnapshot();
  host.syncToggleButtons();
  renderReview();
  host.saveState();
}

export function deselectAllAdvanced() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !isAdvancedKey(base);
  });
  if (remaining.length === runtime.selectedKeys.length) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

// ── NT Book Vocab selector ────────────────────────────────────────────────
// Mirrors the Advanced selector, but each entry is an NT book whose
// frequency-ordered lexemes are sliced into groups of 50. Selecting a book or
// a group loads the existing cards those lexemes link to (see
// resolveBookVocabCards in domain/deck/filters.js).
const BOOK_VOCAB_GROUP_SIZE = 50;

function getBookVocabData() {
  const data = window.NT_BOOK_VOCAB;
  const books = data && Array.isArray(data.books) ? data.books : [];
  const size = (data && Number(data.groupSize)) || BOOK_VOCAB_GROUP_SIZE;
  return { books, size };
}

function getBookGroups(refsLength, size) {
  const groups = [];
  for (let start = 0; start < refsLength; start += size) {
    const end = Math.min(start + size, refsLength);
    groups.push({ group: groups.length + 1, start, end, count: end - start });
  }
  return groups;
}

export function toggleBookGroup(bookKey, groupNum) {
  toggleSet(`NTB::${bookKey}::g::${groupNum}`);
}

export function deselectAllBooks() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !isBookKey(base);
  });
  if (remaining.length === runtime.selectedKeys.length) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

export function buildBookVocabSelector() {
  const list = document.getElementById('bookVocabGrid');
  if (!list) return;
  list.innerHTML = '';

  const { books, size } = getBookVocabData();
  const ordered = [...books].sort((a, b) => (a.order || 0) - (b.order || 0));

  const meta = document.getElementById('bookVocabSectionMeta');
  if (meta) {
    if (!ordered.length) {
      meta.textContent = '';
    } else {
      const totalLinks = ordered.reduce((sum, b) => sum + (Array.isArray(b.refs) ? b.refs.length : 0), 0);
      meta.textContent = `${ordered.length} books · ${totalLinks.toLocaleString()} links`;
    }
  }

  if (!ordered.length) {
    const empty = document.createElement('div');
    empty.className = 'advanced-empty';
    empty.textContent = 'NT book vocabulary data has not loaded yet.';
    list.appendChild(empty);
    return;
  }

  const deselectBtn = document.createElement('button');
  deselectBtn.type = 'button';
  deselectBtn.className = 'chapter-btn supplemental-deselect-all';
  deselectBtn.textContent = 'Deselect all book vocab';
  deselectBtn.onclick = () => deselectAllBooks();
  list.appendChild(deselectBtn);

  const body = document.createElement('div');
  body.className = 'advanced-week-body';

  ordered.forEach(book => {
    const refs = Array.isArray(book.refs) ? book.refs : [];
    const count = refs.length;
    if (!count) return;
    const bookKey = `NTB::${book.key}`;
    const groups = getBookGroups(count, size);

    const details = document.createElement('details');
    details.className = 'supplemental-set advanced-set book-vocab-set';
    details.open = runtime.selectedKeys.some(k => k === bookKey || (getParadigmBaseKey(k) === bookKey));

    const summary = document.createElement('summary');
    summary.className = 'supplemental-summary advanced-summary';
    summary.innerHTML = `<span>${book.name}</span><span class="chapter-count">${count.toLocaleString()} words</span>`;
    details.appendChild(summary);

    const controls = document.createElement('div');
    controls.className = 'supplemental-paradigm-list advanced-sub-list';

    const allBtn = document.createElement('button');
    allBtn.className = 'chapter-btn supplemental-all-btn';
    allBtn.dataset.key = bookKey;
    allBtn.innerHTML = `All of ${book.name}<span class="chapter-count">${count.toLocaleString()} words</span>`;
    allBtn.onclick = () => toggleSet(bookKey);
    controls.appendChild(allBtn);

    groups.forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'chapter-btn supplemental-paradigm-btn advanced-sub-btn';
      btn.dataset.key = `${bookKey}::g::${group.group}`;
      const label = `${group.start + 1}–${group.end}`;
      btn.innerHTML = `${label}<span class="chapter-count">${group.count} word${group.count === 1 ? '' : 's'}</span>`;
      btn.onclick = () => toggleBookGroup(book.key, group.group);
      controls.appendChild(btn);
    });

    details.appendChild(controls);
    body.appendChild(details);
  });

  list.appendChild(body);
  setActiveSetButtons();
}

export function deselectAllChapters() {
  const remaining = runtime.selectedKeys.filter(k => {
    const base = getParadigmBaseKey(k) || k;
    return !isChapterKey(base);
  });
  const sessionWasActive = !!runtime.currentSession;
  if (remaining.length === runtime.selectedKeys.length && !sessionWasActive) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = remaining;
  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }
  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}

export function deselectAll() {
  if (!runtime.selectedKeys.length && !runtime.currentSession) return;
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  runtime.selectedKeys = [];
  clearAndRenderEmpty();
}

export function toggleAdvancedSubGroup(setKey, subKey) {
  // Sub-groups load only the cards in that sub-bucket. We model this as a
  // pseudo-key that getAdvancedSubKeyCards expands at deck-build time.
  const pseudoKey = `${setKey}::sub::${subKey}`;
  toggleSet(pseudoKey);
}

export function loadDeckFromKeys(keys, sessionId = null, options = {}) {
  host.saveCurrentDeckStateToBank();
  host.clearSpacedUndoSnapshot();

  // "New session selected" path: clear unspaced archive marks for the cards
  // we were just studying so the next deck starts fresh. The first request
  // explicitly asked for marks to persist until reset or a new session, and
  // session-selection callers pass clearUnspacedMarks: true for that. Spaced
  // mode is intentionally exempt; it derives behaviour from SRS progress, not
  // these marks.
  if (options.clearUnspacedMarks && !runtime.spacedRepetition) {
    const directionalMarks = host.getDirectionalMarksStore();
    (runtime.originalDeck || []).forEach(card => {
      if (card && card.id) delete directionalMarks[card.id];
    });
    runtime.marks = directionalMarks;
  }

  runtime.selectedKeys = sortSetKeys(keys.map(String));
  runtime.currentSession = sessionId
    ? host.getSessions().find(s => s.id === sessionId) || findExactSessionMatch(runtime.selectedKeys)
    : findExactSessionMatch(runtime.selectedKeys);

  const selectedCards = host.getSelectedCards(runtime.selectedKeys);
  let scopedCards = runtime.requiredOnly ? selectedCards.filter(card => card.required) : selectedCards;
  if (runtime.hardVocabReviewMode && runtime.studyMode === 'vocab') {
    scopedCards = filterHardVocabCards(scopedCards, host.getDirectionalProgressStore());
  }
  // Step-by-step morphology drill: narrow the deck to the focused paradigm's
  // forms (lemma-matched, gated by max selected chapter/week). Falls through
  // to the standard scoped deck if nothing's focused yet.
  if (host.isMorphStepByStepActive()) {
    const focusedCards = host.getFocusedParadigmCards();
    if (Array.isArray(focusedCards)) scopedCards = focusedCards;
    // New parsing scope (paradigm / chapter / pool-toggle change all land
    // here) = a fresh run, so reset the per-session "shown at most twice"
    // budget before the deck is ordered below.
    host.resetParsingShowCounts();
  }
  runtime.originalDeck = scopedCards;
  host.resetMorphAnswerState();

  const savedDeckState = runtime.deckStates[host.getDeckStateKey(runtime.selectedKeys, runtime.requiredOnly)] || null;
  runtime.marks = host.getDirectionalMarksStore();
  const restoredDeck = savedDeckState ? host.reorderDeckFromIds(runtime.originalDeck, savedDeckState.deckIds) : null;
  // A bank entry whose ids don't line up with the current deck is a stale
  // cross-mode save — ignore its cursor rather than clamp a meaningless index.
  // Parsing deliberately resamples its deck on every load (it never resumes a
  // banked order), and it relies on buildStudyDeck's status-weighted ordering
  // to float unseen/wrong forms forward — so skip the resume/restore path
  // entirely and rebuild fresh through buildStudyDeck below.
  if (restoredDeck && !host.isMorphStepByStepActive()) {
    // Resume this deck's banked three-pile session when the user is merely
    // coming back to it — a mode switch or an option toggle — within the 5 h
    // session window. The due/middle pile then keeps waiting (it only joins
    // active when active drains, on a manual reshuffle, or after the idle
    // gap) instead of being reshuffled into active on every switch.
    // Three cases still start fresh:
    //  - an explicit session/chapter pick (clearUnspacedMarks) — choosing a
    //    session is a deliberate "new round" event,
    //  - parsing mode, which deliberately resamples its deck on every load,
    //  - a bank entry older than the idle window (stale session).
    const savedAtMs = Number(savedDeckState.savedAt) || 0;
    const resumeSession = options.clearUnspacedMarks !== true
      && !host.isMorphStepByStepActive()
      && savedAtMs > 0
      && (Date.now() - savedAtMs) <= SESSION_IDLE_RESET_MS;
    if (runtime.spacedRepetition) {
      // Hand buildStudyDeck the banked active pile (and the banked order via
      // runtime.deck): its continue-session branch preserves the active
      // section as-is, with everything else due waiting in middle. When not
      // resuming, the cleared id list makes freshStart fire naturally, which
      // collapses all due cards into active and honours the shuffle toggle.
      runtime.deck = restoredDeck;
      runtime.spacedActiveIds = resumeSession && Array.isArray(savedDeckState.spacedActiveIds)
        ? [...savedDeckState.spacedActiveIds]
        : [];
      runtime.deck = host.buildStudyDeck(runtime.originalDeck);
    } else {
      // Unspaced: partition into [active, middle, archived]. Within the
      // session window the banked middle membership and active order are
      // restored intact; otherwise the round resets — middle collapses back
      // into active and the unmarked pile reshuffles.
      runtime.unspacedMiddleIds = resumeSession && Array.isArray(savedDeckState.unspacedMiddleIds)
        ? new Set(savedDeckState.unspacedMiddleIds)
        : new Set();
      const middleIds = runtime.unspacedMiddleIds;
      const restoredActive = restoredDeck.filter(card => runtime.marks[card.id] !== 'known' && !middleIds.has(card.id));
      const restoredMiddle = restoredDeck.filter(card => runtime.marks[card.id] !== 'known' && middleIds.has(card.id));
      const restoredKnown = restoredDeck.filter(card => runtime.marks[card.id] === 'known');
      const orderedActive = (runtime.shuffled && !resumeSession) ? shuffleArray([...restoredActive]) : [...restoredActive];
      runtime.deck = [...orderedActive, ...restoredMiddle, ...restoredKnown];
      runtime.unspacedMiddleCount = restoredMiddle.length;
      runtime.activeDeckCount = restoredActive.length;
    }
    // The saved cursor only means something while the banked order survives;
    // against a fresh build it would just skip a random prefix of the pile.
    // A fresh start begins at 0 — except an unspaced deck whose active pile
    // is empty (everything archived), which parks at the end so renderCard
    // shows the "all confirmed" state instead of an archived card. (Spaced
    // parks naturally: 0 >= activeDeckCount when nothing is due.)
    const freshStartIdx = (!runtime.spacedRepetition && runtime.activeDeckCount === 0) ? runtime.deck.length : 0;
    runtime.currentIdx = resumeSession && Number.isInteger(savedDeckState.currentIdx)
      ? Math.min(Math.max(savedDeckState.currentIdx, 0), runtime.spacedRepetition ? runtime.activeDeckCount : runtime.deck.length)
      : freshStartIdx;
    runtime.unspacedPendingRecycle = resumeSession && !runtime.spacedRepetition && !!savedDeckState.unspacedPendingRecycle;
    host.resetUnspacedCycleState();
    runtime.isFlipped = false;
  } else {
    host.resetStudyState();
    runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  }
  host.markActiveDeckRef();

  setActiveSessionButton();
  setActiveSetButtons();

  host.syncToggleButtons();

  host.resetMorphAnswerState();
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function loadSession(session) {
  runtime.currentSession = session;
  loadDeckFromKeys(expandSessionSets(session), session.id, { clearUnspacedMarks: true });
}

export function toggleSession(session) {
  host.saveCurrentDeckStateToBank();

  const sessionKeys = expandSessionSets(session);
  if (!sessionKeys.length) return;

  const alreadySelected = isSessionFullySelected(session);
  const nextKeys = alreadySelected
    ? runtime.selectedKeys.filter(key => !sessionKeys.includes(key))
    : sortSetKeys([...new Set([...runtime.selectedKeys, ...sessionKeys])]);

  runtime.currentSession = null;

  if (!nextKeys.length) {
    runtime.selectedKeys = [];
    runtime.marks = host.getDirectionalMarksStore();
    clearAndRenderEmpty();
    return;
  }

  loadDeckFromKeys(nextKeys, null, { clearUnspacedMarks: true });
}

export function getParadigmBaseKey(key) {
  const match = String(key).match(/^(.+)::(grammar|morph)::\d+$/);
  if (match) return match[1];
  const subMatch = String(key).match(/^(.+)::sub::.+$/);
  if (subMatch) return subMatch[1];
  // NT Book Vocab frequency groups collapse to their whole-book key, so
  // selecting "All of <book>" replaces its groups (and vice-versa), the same
  // way an advanced "All" replaces its sub-buckets.
  const bookGroup = String(key).match(/^(NTB::[^:]+)::g::\d+$/);
  return bookGroup ? bookGroup[1] : null;
}

export function toggleSet(key) {
  host.saveCurrentDeckStateToBank();
  runtime.currentSession = null;
  const raw = String(key);
  const baseKey = getParadigmBaseKey(raw);
  if (runtime.selectedKeys.includes(raw)) {
    runtime.selectedKeys = runtime.selectedKeys.filter(k => k !== raw);
  } else if (baseKey) {
    runtime.selectedKeys = [...runtime.selectedKeys.filter(k => k !== baseKey), raw];
  } else {
    runtime.selectedKeys = [...runtime.selectedKeys.filter(k => getParadigmBaseKey(k) !== raw), raw];
  }

  if (!runtime.selectedKeys.length) {
    clearAndRenderEmpty();
    return;
  }

  loadDeckFromKeys(runtime.selectedKeys, null, { clearUnspacedMarks: true });
}
