import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck, markDeck } from '../vocab-deck.js';

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
