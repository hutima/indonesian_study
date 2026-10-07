import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck, markDeck, reviewVocab, nextVocabRound, orderDeck } from '../vocab-deck.js';
import { getVocabProgressEntry } from '../progress.js';

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
  assert.equal(getVocabProgressEntry(next.progress, 'one', 'i2e').correct, 0);
  assert.equal(getVocabProgressEntry(next.progress, 'one', 'i2e').wrong, 1);
  assert.equal(getVocabProgressEntry(next.progress, 'one', 'i2e').confidenceHistory[0], 0);
  assert.equal(next.deck.active[0], 'two');
  const easy = reviewVocab(start, state, 'know', true, 1_700_000_000_000);
  assert.equal(getVocabProgressEntry(easy.progress, 'one', 'i2e').correct, 1);
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
  assert.equal(getVocabProgressEntry(uncertain.progress, 'one', 'i2e').confidenceHistory[0], .5);
  assert.deepEqual(uncertain.deck.middle, ['one']);
  assert.equal(uncertain.deck.completed, 0);
  const easy = reviewVocab(uncertain.deck, uncertain.progress, 'know', false, 1_700_000_000_000);
  assert.deepEqual(easy.deck.active, []);
  assert.deepEqual(easy.deck.middle, ['one']);
  assert.deepEqual(nextVocabRound(easy.deck).active, ['one']);
});

test('persistent Shuffle changes the active order and Off restores lesson order', () => {
  const words = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const state = { version: 1, items: {} };
  const shuffled = createDeck(words, state, false, 1_700_000_000_000, true, () => 0);
  assert.deepEqual(shuffled.active, ['b', 'c', 'a']);
  assert.deepEqual(orderDeck(shuffled, words, false).active, ['a', 'b', 'c']);
  const afterOne = reviewVocab(shuffled, state, 'know', false);
  const toggledOff = orderDeck(afterOne.deck, words, false);
  assert.deepEqual(toggledOff.active, ['a', 'c']);
  assert.equal(toggledOff.completed, 1);
  const retry = { ...toggledOff, active: [], middle: ['a', 'c'] };
  assert.deepEqual(nextVocabRound(retry, true, () => 0).active, ['c', 'a']);
});


test('deck due selection is independent by vocabulary direction', () => {
  const now = 1_800_000_000_000;
  const state = reviewVocab(createDeck([{ id: 'one' }], { version: 1, items: {} }, false), { version: 1, items: {} }, 'know', true, now, 'i2e').progress;
  const recognition = createDeck([{ id: 'one' }], state, true, now + 1000, false, Math.random, 'i2e');
  const production = createDeck([{ id: 'one' }], state, true, now + 1000, false, Math.random, 'e2i');
  assert.deepEqual(recognition.active, []);
  assert.deepEqual(production.active, ['one']);
});


test('a card entering leech drill still goes through middle and repeats when active empties', () => {
  const now = 1_800_000_000_000;
  const id = 'one';
  const progress = {
    version: 1,
    items: {},
    vocabDirections: {
      i2e: {
        [id]: {
          correct: 5, wrong: 3, again: 3, unsure: 0, know: 5,
          first: now - 20 * 86400000, last: now - 86400000,
          streak: 5, easyStreak: 5, srsStage: 4, ease: 2.3,
          intervalDays: 14, lastEasyIntervalDays: 14,
          lapseCount: 3, inRelearn: false, relearnLeft: 0,
          preLapseIntervalDays: 14, leechDrill: false, leechStreak: 2,
          confidenceHistory: [1, 1, 1, 1, 1]
        }
      },
      e2i: {}
    }
  };
  const deck = { active: ['one', 'two'], middle: [], completed: 0, total: 2 };
  const hard = reviewVocab(deck, progress, 'again', true, now);
  assert.equal(getVocabProgressEntry(hard.progress, id, 'i2e').leechDrill, true);
  assert.deepEqual(hard.deck.active, ['two']);
  assert.deepEqual(hard.deck.middle, ['one']);
  const clearedOther = reviewVocab(hard.deck, hard.progress, 'know', true, now + 1000);
  assert.deepEqual(clearedOther.deck.active, ['one']);
  assert.deepEqual(clearedOther.deck.middle, []);
});
