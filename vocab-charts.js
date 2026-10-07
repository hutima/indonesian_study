import { getVocabProgressEntry } from './progress.js';

export function dueBuckets(cards, state, now = Date.now(), direction = 'i2e', sessionIds = null) {
  const counts = new Array(16).fill(0); // now, today, 1–13 days, 14+
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const hasLiveSession = sessionIds && typeof sessionIds.has === 'function';
  for (const card of cards) {
    if (hasLiveSession && sessionIds.has(card.id)) { counts[0]++; continue; }
    const due = getVocabProgressEntry(state, card.id, direction)?.dueAt || 0;
    if (!due || due <= now) { counts[0]++; continue; }
    const day = new Date(due); day.setHours(0, 0, 0, 0);
    const delta = Math.round((day - start) / 86400000);
    counts[delta <= 0 ? 1 : Math.min(delta + 1, 15)]++;
  }
  return counts;
}
export function confidenceBuckets(cards, state, direction = 'i2e') {
  const counts = new Array(6).fill(0); // unseen, 0–19, 20–39, 40–59, 60–79, 80–100
  for (const card of cards) {
    const item = getVocabProgressEntry(state, card.id, direction);
    if (!item || !item.correct && !item.wrong) { counts[0]++; continue; }
    const history = item.confidenceHistory;
    const fraction = Array.isArray(history) && history.length
      ? history.reduce((sum, n) => sum + n, 0) / history.length
      : item.correct / (item.correct + item.wrong);
    counts[Math.min(5, Math.floor(fraction * 5) + 1)]++;
  }
  return counts;
}


const PROFICIENCY_BAND_DEFS = [
  { key: 'b80', label: '80–100%', bucket: 5 },
  { key: 'b60', label: '60–79%', bucket: 4 },
  { key: 'b40', label: '40–59%', bucket: 3 },
  { key: 'b20', label: '20–39%', bucket: 2 },
  { key: 'b0', label: '0–19%', bucket: 1 },
  { key: 'unseen', label: 'Unstarted', bucket: 0 }
];

export function proficiencyBands(cards, state, direction = 'i2e') {
  const counts = confidenceBuckets(cards, state, direction);
  const total = cards.length;
  return PROFICIENCY_BAND_DEFS.map(def => ({
    key: def.key,
    label: def.label,
    count: counts[def.bucket] || 0,
    fraction: total ? (counts[def.bucket] || 0) / total : 0
  }));
}
