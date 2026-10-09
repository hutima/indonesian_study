import { SUPPLEMENTAL_UNITS } from './content/manifest.js';

const foundationGrid = document.querySelector('#foundation-grid');
const supplementalGrid = document.querySelector('#supplemental-grid');
const wordListContent = document.querySelector('#word-list-content');
const selectionSummary = document.querySelector('#selection-summary');
const dialogSelectionSummary = document.querySelector('#dialog-selection-summary');

const supplementalById = new Map(SUPPLEMENTAL_UNITS.map(unit => [unit.id, unit]));
const supplementalTitles = new Set(SUPPLEMENTAL_UNITS.map(unit => unit.title));
let tileSyncQueued = false;

function relabelUnitText(root = document) {
  for (const heading of root.querySelectorAll?.('.word-list-group > h3') || []) {
    const match = [...supplementalTitles].find(title => heading.textContent === `Foundation · ${title}`);
    if (match) heading.textContent = `Supplemental · ${match}`;
  }
  for (const summary of [selectionSummary, dialogSelectionSummary]) {
    if (!summary) continue;
    const match = [...supplementalTitles].find(title => summary.textContent === `Foundation · ${title}`);
    if (match) summary.textContent = `Supplemental · ${match}`;
  }
}

function syncSupplementalTiles() {
  tileSyncQueued = false;
  if (!foundationGrid || !supplementalGrid) return;
  const wrappers = [...foundationGrid.querySelectorAll('.lesson-option')].filter(wrapper => {
    const id = wrapper.querySelector('.lesson-tile')?.dataset.lessonId;
    return supplementalById.has(id);
  });
  if (!wrappers.length) {
    relabelUnitText();
    return;
  }
  supplementalGrid.replaceChildren(...wrappers);
  for (const wrapper of wrappers) {
    const tile = wrapper.querySelector('.lesson-tile');
    const unit = supplementalById.get(tile?.dataset.lessonId);
    if (!tile || !unit) continue;
    const label = tile.querySelector('strong');
    const meta = tile.querySelector('small');
    if (label) label.textContent = 'Supplemental';
    if (meta) meta.textContent = `${unit.vocabulary.length} words · vocabulary only`;
  }
  relabelUnitText();
}

function queueTileSync() {
  if (tileSyncQueued) return;
  tileSyncQueued = true;
  queueMicrotask(syncSupplementalTiles);
}

if (foundationGrid && supplementalGrid) {
  new MutationObserver(queueTileSync).observe(foundationGrid, { childList: true });
  queueTileSync();
}
if (wordListContent) new MutationObserver(() => relabelUnitText(wordListContent)).observe(wordListContent, { childList: true, subtree: true });
for (const summary of [selectionSummary, dialogSelectionSummary]) {
  if (summary) new MutationObserver(() => relabelUnitText()).observe(summary, { childList: true, characterData: true, subtree: true });
}
