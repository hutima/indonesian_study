import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck, markDeck, reviewVocab, nextVocabRound } from '../vocab-deck.js';

const cards = [{ id: 'a' }, { id: 'b' }];

test('Again returns after remaining cards; Know clears a card for this round', () => {
  let deck = createDeck(cards, { items: {} }, false);
  assert.equal(deck.active[0], 'a');
  deck = markDeck(deck, 'again');
  assert.equal(deck.active[0], 'b');
  deck = markDeck(deck, 'know');
  assert.equal(deck.active[0], 'a');
  deck = markDeck(deck, 'know');
  assert.deepEqual(deck.active, []);
});

test('spaced deck selects due cards only', () => {
  const state = { items: { a: { dueAt: 2000 }, b: { dueAt: 0 } } };
  assert.deepEqual(createDeck(cards, state, true, 1000).active, ['b']);
});

test('Duff review keeps Next separate from Easy scoring', () => {
  const cards = [{ id: 'one' }, { id: 'two' }];
  const state = { version: 1, items: {} };
  const start = createDeck(cards, state, true);
  const next = reviewVocab(start, state, 'next', true, 1_700_000_000_000);
  assert.equal(next.progress.items.one.correct, 0);
  assert.equal(next.progress.items.one.wrong, 1);
  assert.equal(next.progress.items.one.confidenceHistory[0], 0);
  assert.equal(next.deck.active[0], 'two');
  const easy = reviewVocab(start, state, 'know', true, 1_700_000_000_000);
  assert.equal(easy.progress.items.one.correct, 1);
  assert.equal(easy.deck.completed, 1);
  assert.deepEqual(state, { version: 1, items: {} });
  assert.deepEqual(start.active, ['one', 'two']); // Undo can restore these snapshots.
});

test('unspaced Next is neutral and Uncertain returns for another pass', () => {
  const cards = [{ id: 'one' }, { id: 'two' }];
  const state = { version: 1, items: {} };
  const start = createDeck(cards, state, false);
  const next = reviewVocab(start, state, 'next', false, 1_700_000_000_000);
  assert.deepEqual(next.progress, state);
  assert.equal(next.deck.active[0], 'two');
  assert.equal(next.deck.completed, 0);
  const uncertain = reviewVocab(start, state, 'unsure', false, 1_700_000_000_000);
  assert.equal(uncertain.progress.items.one.confidenceHistory[0], .5);
  assert.deepEqual(uncertain.deck.middle, ['one']);
  assert.equal(uncertain.deck.completed, 0);
  const easy = reviewVocab(uncertain.deck, uncertain.progress, 'know', false, 1_700_000_000_000);
  assert.deepEqual(easy.deck.active, []);
  assert.deepEqual(easy.deck.middle, ['one']);
  assert.deepEqual(nextVocabRound(easy.deck).active, ['one']);
});
