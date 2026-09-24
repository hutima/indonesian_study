// A unit selection unlocks earlier units. At the end of its exercises,
// advance into the next unit so a one-form first unit cannot loop forever.
export function advanceSelection(index, count, unitIndex, unitCount) {
  if (index >= count - 1 && unitIndex < unitCount - 1) {
    return { index: count, unitIndex: unitIndex + 1 };
  }
  return { index: (index + 1) % count, unitIndex };
}
