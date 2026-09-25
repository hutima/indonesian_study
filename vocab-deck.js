import { dueVocab, recordVocabReview } from './progress.js';

function shuffleIds(ids, random = Math.random) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeck(cards, progress, spaced, now = Date.now(), shuffle = false, random = Math.random) {
  const selected = spaced ? dueVocab(cards, progress, now) : cards;
  const ids = selected.map(card => card.id);
  return { active: shuffle ? shuffleIds(ids, random) : ids, middle: [], completed: 0, total: selected.length };
}

export function orderDeck(deck, cards, shuffle, random = Math.random) {
  const pending = new Set(deck.active);
  const active = shuffle ? shuffleIds(deck.active, random) : cards.map(card => card.id).filter(id => pending.has(id));
  return { ...deck, active };
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
  return { ...deck, active: shuffle ? shuffleIds(deck.middle, random) : [...deck.middle], middle: [] };
}

export function reviewVocab(deck, progress, action, spaced, now = Date.now()) {
  if (!deck.active.length) return { deck, progress };
  const rating = action === 'next' && spaced ? 'again' : action;
  const nextProgress = rating === 'next' ? progress : recordVocabReview(progress, deck.active[0], rating, spaced, now);
  const leech = spaced && rating === 'again' && nextProgress.items[deck.active[0]]?.leechDrill;
  return { deck: markDeck(deck, leech ? 'unsure' : rating, spaced), progress: nextProgress };
}
