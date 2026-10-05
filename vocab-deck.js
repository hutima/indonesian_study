import { dueVocab, recordVocabReview, getVocabProgressEntry } from './progress.js';

function getDeckBridge() {
  if (typeof globalThis === 'undefined') return null;
  const bridge = globalThis.__indonesianVocabDeckBridge || { history: [] };
  if (!Array.isArray(bridge.history)) bridge.history = [];
  globalThis.__indonesianVocabDeckBridge = bridge;
  return bridge;
}

function publishDeckBridge(deck, progress) {
  const bridge = getDeckBridge();
  if (bridge) {
    bridge.deck = deck;
    if (progress !== undefined) bridge.progress = progress;
  }
  return deck;
}

function resetBridgeHistory() {
  const bridge = getDeckBridge();
  if (bridge) bridge.history = [];
}

function pushBridgeSnapshot(deck) {
  const bridge = getDeckBridge();
  if (!bridge) return;
  bridge.history.push(deck);
  if (bridge.history.length > 40) bridge.history.shift();
}

function shuffleIds(ids, random = Math.random) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeck(cards, progress, spaced, now = Date.now(), shuffle = false, random = Math.random, direction = 'i2e') {
  const selected = spaced ? dueVocab(cards, progress, now, direction) : cards;
  const ids = selected.map(card => card.id);
  resetBridgeHistory();
  return publishDeckBridge({ active: shuffle ? shuffleIds(ids, random) : ids, middle: [], completed: 0, total: selected.length }, progress);
}

export function orderDeck(deck, cards, shuffle, random = Math.random) {
  const pending = new Set(deck.active);
  const active = shuffle ? shuffleIds(deck.active, random) : cards.map(card => card.id).filter(id => pending.has(id));
  resetBridgeHistory();
  return publishDeckBridge({ ...deck, active });
}

export function markDeck(deck, rating, spaced = true) {
  if (!deck.active.length) return deck;
  const [current, ...remaining] = deck.active;
  const retry = rating === 'again' || !spaced && (rating === 'unsure' || rating === 'next');
  const middle = retry ? [...deck.middle, current] : [...deck.middle];
  return {
    ...deck,
    active: remaining.length ? remaining : spaced ? middle : [],
    middle: remaining.length || !spaced ? middle : [],
    completed: deck.completed + (retry ? 0 : 1)
  };
}

export function nextVocabRound(deck, shuffle = false, random = Math.random) {
  pushBridgeSnapshot(deck);
  return publishDeckBridge({ ...deck, active: shuffle ? shuffleIds(deck.middle, random) : [...deck.middle], middle: [] });
}

export function reviewVocab(deck, progress, action, spaced, now = Date.now(), direction = 'i2e') {
  if (!deck.active.length) { publishDeckBridge(deck, progress); return { deck, progress }; }
  pushBridgeSnapshot(deck);
  const rating = action === 'next' && spaced ? 'again' : action;
  const nextProgress = rating === 'next' ? progress : recordVocabReview(progress, deck.active[0], rating, spaced, now, direction);
  const leech = spaced && rating === 'again' && getVocabProgressEntry(nextProgress, deck.active[0], direction)?.leechDrill;
  const nextDeck = markDeck(deck, leech ? 'unsure' : rating, spaced);
  publishDeckBridge(nextDeck, nextProgress);
  return { deck: nextDeck, progress: nextProgress };
}
