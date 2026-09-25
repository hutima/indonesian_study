import { dueVocab, recordVocabReview } from './progress.js';

export function createDeck(cards, progress, spaced, now = Date.now()) {
  const selected = spaced ? dueVocab(cards, progress, now) : cards;
  return { active: selected.map(card => card.id), middle: [], completed: 0, total: selected.length };
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

export function nextVocabRound(deck) {
  return { ...deck, active: [...deck.middle], middle: [] };
}

export function reviewVocab(deck, progress, action, spaced, now = Date.now()) {
  if (!deck.active.length) return { deck, progress };
  const rating = action === 'next' && spaced ? 'again' : action;
  const nextProgress = rating === 'next' ? progress : recordVocabReview(progress, deck.active[0], rating, spaced, now);
  const leech = spaced && rating === 'again' && nextProgress.items[deck.active[0]]?.leechDrill;
  return { deck: markDeck(deck, leech ? 'unsure' : rating, spaced), progress: nextProgress };
}
