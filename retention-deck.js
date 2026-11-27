import { dueVocab, recordVocabReview } from './progress.js';

export function retentionDayKey(now = Date.now()) {
  const date = new Date(now);
  if (date.getHours() < 5) date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function normalizeRetention(value, now = Date.now()) {
  const day = retentionDayKey(now);
  if (!value || value.day !== day || !value.sessions || typeof value.sessions !== 'object') return { day, sessions: {} };
  const sessions = Object.fromEntries(Object.entries(value.sessions).slice(-16).filter(([, session]) => session && typeof session === 'object').map(([key, session]) => {
    const ids = [...new Set((Array.isArray(session.ids) ? session.ids : []).filter(id => typeof id === 'string'))].slice(0, 20);
    const pending = [...new Set((Array.isArray(session.pending) ? session.pending : []).filter(id => ids.includes(id)))];
    const cleared = [...new Set((Array.isArray(session.cleared) ? session.cleared : []).filter(id => typeof id === 'string'))].slice(0, 10000);
    return [key, { ids, pending, cleared }];
  }));
  return { day, sessions };
}

function asDeck(session) {
  return { active: [...session.pending], middle: [], completed: session.ids.length - session.pending.length, total: session.ids.length };
}

export function retentionDeck(cards, progress, saved, key, spaced, direction = 'i2e', { replace = false, now = Date.now(), random = Math.random } = {}) {
  const state = normalizeRetention(saved, now);
  const byId = new Map(cards.map(card => [card.id, card]));
  let session = state.sessions[key];
  if (session) {
    session.ids = session.ids.filter(id => byId.has(id));
    session.pending = session.pending.filter(id => byId.has(id));
  }
  if (!session || replace || !session.ids.length) {
    const previous = new Set(session?.ids || []);
    const cleared = session?.cleared || [];
    const done = new Set(cleared);
    const eligible = (spaced ? dueVocab(cards, progress, now, direction) : cards).filter(card => !done.has(card.id));
    const pool = [...new Set(eligible.map(card => card.id))];
    const fresh = pool.filter(id => !previous.has(id));
    const old = pool.filter(id => previous.has(id));
    const ids = [];
    for (const group of [fresh, old]) {
      const size = Math.min(20 - ids.length, group.length);
      for (let i = 0; i < size; i++) {
        const j = i + Math.floor(random() * (group.length - i));
        [group[i], group[j]] = [group[j], group[i]];
      }
      ids.push(...group.slice(0, size));
    }
    session = state.sessions[key] = { ids, pending: [...ids], cleared };
  }
  // Keep a bounded number of independently resumable selections/directions.
  delete state.sessions[key]; state.sessions[key] = session;
  state.sessions = Object.fromEntries(Object.entries(state.sessions).slice(-16));
  return { state, deck: asDeck(session) };
}

export function reviewRetention(progress, saved, key, action, spaced, now = Date.now(), direction = 'i2e') {
  const state = normalizeRetention(saved, now);
  const session = state.sessions[key];
  if (!session?.pending.length) return { state, progress, deck: session ? asDeck(session) : null };
  const id = session.pending.shift();
  const nextProgress = action === 'next' ? progress : recordVocabReview(progress, id, action, spaced, now, direction);
  if (action === 'know') session.cleared = [...new Set([...session.cleared, id])];
  else session.pending.push(id);
  return { state, progress: nextProgress, deck: asDeck(session) };
}
