import { dueVocab } from './progress.js';

export function createDeck(cards, progress, spaced, now = Date.now()) {
  const selected = spaced ? dueVocab(cards, progress, now) : cards;
  return { active: selected.map(card => card.id), middle: [], completed: 0, total: selected.length };
}

export function markDeck(deck, rating) {
  if (!deck.active.length) return deck;
  const [current, ...remaining] = deck.active;
  const middle = rating === 'again' ? [...deck.middle, current] : [...deck.middle];
  return {
    ...deck,
    active: remaining.length ? remaining : middle,
    middle: remaining.length ? middle : [],
    completed: deck.completed + (rating === 'again' ? 0 : 1)
  };
}
