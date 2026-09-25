export function orderMorphology(items, order, currentIndex, shuffle, random = Math.random) {
  const ids = items.map(item => item.id);
  const position = order ? currentIndex + 1 : 0;
  const prefix = order ? order.slice(0, position) : [];
  const pending = new Set(ids.filter(id => !prefix.includes(id)));
  const remaining = shuffle && order ? order.slice(position).filter(id => pending.has(id)) : ids.filter(id => pending.has(id));
  if (shuffle) {
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
  }
  return [...prefix, ...remaining];
}
