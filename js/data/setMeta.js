// Set metadata — chapter-to-week mapping and session week groupings

export const CHAPTER_TO_WEEK = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
  6: 2, 7: 2,
  8: 3, 9: 3,
  10: 4, 11: 4,
  12: 5, 13: 5, 14: 5,
  15: 6, 16: 6,
  17: 7, 18: 7,
  19: 8, 20: 8
};

// First (earliest) chapter of each course week — the inverse of
// CHAPTER_TO_WEEK. Used as the fallback "chapter" for a supplemental set that
// carries only a `week` tag (no explicit `chapter`).
export const WEEK_FIRST_CHAPTER = (() => {
  const map = {};
  Object.keys(CHAPTER_TO_WEEK).forEach((chapStr) => {
    const ch = Number(chapStr);
    const wk = CHAPTER_TO_WEEK[chapStr];
    if (map[wk] == null || ch < map[wk]) map[wk] = ch;
  });
  return map;
})();

// Duff chapter titles (from eontg_concepts_by_chapter.txt — the Cambridge UP
// table of contents). Shown as the subject subtitle under each chapter button
// in the study selector, and as the chapter-group subtitle in paradigm
// practice. A couple of the longer titles are trimmed to fit a button.
export const CHAPTER_TITLES = {
  0: 'The Greek alphabet',
  1: 'The alphabet',
  2: 'Basic sentences',
  3: 'Cases and gender',
  4: 'Prepositions',
  5: 'Adjectives',
  6: 'The tenses',
  7: 'Moods',
  8: 'Other noun & verb patterns',
  9: 'Pronouns and conjunctions',
  10: 'Complex sentences',
  11: 'Special verbs',
  12: 'Third declension I',
  13: 'Third declension II',
  14: 'Participles',
  15: 'The passive and voices',
  16: 'The perfect',
  17: 'The subjunctive',
  18: 'Using verbs',
  19: 'Extra verbs',
  20: 'Final pieces'
};

export const SESSION_WEEK_META = {
  wk0: [],
  wk1: [1],
  wk2: [2],
  wk3: [3],
  wk4: [4],
  mt: [1, 2, 3, 4],
  wk5: [5],
  wk6: [6],
  wk7: [7],
  wk8: [8],
  all: [1, 2, 3, 4, 5, 6, 7, 8]
};
