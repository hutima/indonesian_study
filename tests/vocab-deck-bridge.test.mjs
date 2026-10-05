import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('vocab deck publishes the live deck bridge used by the Duff-style review panel', async () => {
  const source = await fs.readFile(new URL('../vocab-deck.js', import.meta.url), 'utf8');
  assert.match(source, /__indonesianVocabDeckBridge/);
  assert.match(source, /publishDeckBridge/);
});
