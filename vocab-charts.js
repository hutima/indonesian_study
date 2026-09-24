import { dueVocab } from './progress.js';

export function dueBuckets(cards, state, now = Date.now()) {
  const counts = new Array(16).fill(0); // now, today, 1–13 days, 14+
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  for (const card of cards) {
    const due = state.items?.[card.id]?.dueAt || 0;
    if (!due || due <= now) { counts[0]++; continue; }
    const day = new Date(due); day.setHours(0, 0, 0, 0);
    const delta = Math.round((day - start) / 86400000);
    counts[delta <= 0 ? 1 : Math.min(delta + 1, 15)]++;
  }
  return counts;
}
export function confidenceBuckets(cards, state) {
  const counts = new Array(6).fill(0); // unseen, 0–19, 20–39, 40–59, 60–79, 80–100
  for (const card of cards) {
    const item = state.items?.[card.id];
    if (!item || !item.correct && !item.wrong) { counts[0]++; continue; }
    const history = item.confidenceHistory;
    const fraction = Array.isArray(history) && history.length
      ? history.reduce((sum, n) => sum + n, 0) / history.length
      : item.correct / (item.correct + item.wrong);
    counts[Math.min(5, Math.floor(fraction * 5) + 1)]++;
  }
  return counts;
}
