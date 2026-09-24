export const SELECTION_KEY = 'indonesian-study-lessons-v1';

export function normalizeLessonIds(ids, units, fallback = []) {
  const allowed = new Set(units.map(unit => unit.id));
  if (!Array.isArray(ids)) return fallback.filter(id => allowed.has(id));
  const chosen = new Set(ids.filter(id => typeof id === 'string' && allowed.has(id)));
  return units.filter(unit => chosen.has(unit.id)).map(unit => unit.id);
}
export function selectedUnits(units, ids) {
  const chosen = new Set(ids);
  return units.filter(unit => chosen.has(unit.id));
}
export function itemsForMode(units, ids, mode) {
  return selectedUnits(units, ids).flatMap(unit => mode === 'reading' ? unit.readings : unit[mode] || []);
}
export function nextLessonId(units, ids) {
  if (ids.length !== 1) return null;
  const index = units.findIndex(unit => unit.id === ids[0]);
  return index >= 0 && index < units.length - 1 ? units[index + 1].id : null;
}
