import { getCadencePreset, SRS_AGAIN_MS, SRS_UNCERTAIN_MIN_MS, SRS_HARD_RELEARN_STEPS, SRS_RELEARN_STEP_DAYS, LEECH_LAPSE_THRESHOLD, LEECH_UNPIN_STREAK, LEECH_DRILL_DAYS } from './js/domain/srs/constants.js';
import { getNextEasyIntervalDays, msFromDays, getSrsEase, getSrsStage } from './js/domain/srs/scheduler.js';

const KEY = 'indonesian-study-progress-v1';
const safeId = id => typeof id === 'string' && /^[a-z0-9][a-z0-9._-]{1,80}$/i.test(id) && id !== '__proto__' && id !== 'constructor';
const count = n => Number.isFinite(n) && n > 0 ? Math.min(1000000, Math.floor(n)) : 0;
const timestamp = n => Number.isFinite(n) && n > 0 ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)) : 0;
const days = n => Number.isFinite(n) && n > 0 ? Math.min(60, n) : 0;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const STUDY_LEVELS = [
  { level: 1, threshold: 0, title: 'Pemula', flavor: 'Mulai dari kata yang kepakai.' },
  { level: 2, threshold: 25, title: 'Pendengar', flavor: 'Mulai menangkap lebih dari sekadar gist.' },
  { level: 3, threshold: 75, title: 'Pencari Kata', flavor: 'Masih cari kata — tapi makin cepat ketemu.' },
  { level: 4, threshold: 175, title: 'Perangkai Kalimat', flavor: 'Klausa mulai nyambung tanpa banyak macet.' },
  { level: 5, threshold: 400, title: 'Pembaca', flavor: 'Teks pendek sudah terasa seperti bahasa, bukan teka-teki.' },
  { level: 6, threshold: 800, title: 'Penjelajah Bahasa', flavor: 'Keluar dari bahasa rumah, masuk ke topik yang lebih luas.' },
  { level: 7, threshold: 1500, title: 'Pencerita', flavor: 'Bisa terus ngomong walau belum selalu mulus.' },
  { level: 8, threshold: 2800, title: 'Pemburu Makna', flavor: 'Konteks, afiks, dan nuansa mulai bekerja sama.' },
  { level: 9, threshold: 5000, title: 'Pecinta Kata', flavor: 'Koleksi kosakata sudah mulai agak tidak sehat.' },
  { level: 10, threshold: 7500, title: 'Penghubung Andal', flavor: 'Karena, ternyata, akhirnya — kalimatnya mulai punya tulang.' },
  { level: 11, threshold: 10500, title: 'Pembaca Berita', flavor: 'Bahasa formal tidak lagi langsung bikin panik.' },
  { level: 12, threshold: 14000, title: 'Penutur', flavor: 'Bukan cuma tahu; mulai bisa mengambil kata saat dibutuhkan.' },
  { level: 13, threshold: 18000, title: 'Peramu Kata', flavor: 'Bisa menyiasati lubang kosakata tanpa berhenti total.' },
  { level: 14, threshold: 23000, title: 'Penerjemah Nuansa', flavor: 'Mulai peduli bukan cuma arti, tapi kenapa bentuk itu dipakai.' },
  { level: 15, threshold: 29000, title: 'Mahir', flavor: 'Belum tamat — bahasa memang tidak punya final boss.' }
];

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
function localDayKey(now = Date.now()) {
  const d = new Date(now);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function previousDayKey(dayKey) {
  if (!DAY_RE.test(dayKey)) return '';
  const [year, month, day] = dayKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  return localDayKey(d.getTime());
}
function normalizeGamification(value) {
  const dailyReviews = {};
  if (value?.dailyReviews && typeof value.dailyReviews === 'object' && !Array.isArray(value.dailyReviews)) {
    for (const [key, n] of Object.entries(value.dailyReviews)) {
      if (DAY_RE.test(key)) dailyReviews[key] = count(n);
    }
  }
  return {
    xp: count(value?.xp),
    totalReviews: count(value?.totalReviews),
    lastStudyDay: DAY_RE.test(value?.lastStudyDay || '') ? value.lastStudyDay : '',
    currentStreak: count(value?.currentStreak),
    longestStreak: count(value?.longestStreak),
    dailyReviews,
    celebrationsInitialized: value?.celebrationsInitialized === true,
    lastCelebratedLevel: count(value?.lastCelebratedLevel),
    celebratedAchievementIds: Array.isArray(value?.celebratedAchievementIds)
      ? [...new Set(value.celebratedAchievementIds.filter(id => typeof id === 'string' && /^[a-z0-9_-]{1,80}$/i.test(id)))]
      : [],
    lastCelebratedBadgeDay: DAY_RE.test(value?.lastCelebratedBadgeDay || '') ? value.lastCelebratedBadgeDay : ''
  };
}
function applyStudyCredit(state, xp, now = Date.now()) {
  const game = normalizeGamification(state.gamification);
  const today = localDayKey(now);
  if (game.lastStudyDay !== today) {
    game.currentStreak = game.lastStudyDay === previousDayKey(today) ? Math.max(1, game.currentStreak + 1) : 1;
    game.longestStreak = Math.max(game.longestStreak, game.currentStreak);
    game.lastStudyDay = today;
  }
  game.xp = Math.min(1000000, game.xp + Math.max(0, Math.floor(Number(xp) || 0)));
  game.totalReviews = Math.min(1000000, game.totalReviews + 1);
  game.dailyReviews[today] = Math.min(1000000, (game.dailyReviews[today] || 0) + 1);
  state.gamification = game;
  return state;
}
export function getGamificationSummary(state, now = Date.now()) {
  const game = normalizeGamification(state?.gamification);
  let currentLevel = STUDY_LEVELS[0];
  let nextLevel = STUDY_LEVELS[1] || null;
  for (let i = STUDY_LEVELS.length - 1; i >= 0; i--) {
    if (game.xp >= STUDY_LEVELS[i].threshold) {
      currentLevel = STUDY_LEVELS[i];
      nextLevel = STUDY_LEVELS[i + 1] || null;
      break;
    }
  }
  const levelProgress = nextLevel
    ? (game.xp - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)
    : 1;
  const today = localDayKey(now);
  const liveCurrentStreak = !game.lastStudyDay ? 0
    : game.lastStudyDay === today || game.lastStudyDay === previousDayKey(today) ? game.currentStreak
    : 0;
  return {
    ...game,
    currentStreak: liveCurrentStreak,
    currentLevel,
    nextLevel,
    levelProgress: clamp(levelProgress, 0, 1),
    todayReviews: game.dailyReviews[today] || 0
  };
}
export function getAchievements(state, now = Date.now()) {
  const game = getGamificationSummary(state, now);
  const i2e = state?.vocabDirections?.i2e || {};
  const e2i = state?.vocabDirections?.e2i || {};
  const directionalStrong = [...Object.values(i2e), ...Object.values(e2i)].filter(item => count(item.streak) >= 3).length;
  const legacyStrong = Object.entries(state?.items || {}).filter(([id, item]) => !i2e[id] && count(item.streak) >= 3).length;
  const strongCards = directionalStrong + legacyStrong;
  const achievements = [];
  const check = (id, icon, name, desc, earned, group = 'milestone') => {
    achievements.push({ id, icon, name, desc, earned: !!earned, group });
  };

  check('daily_first_review', '★', 'First Review Today', 'Complete your first scored review today', game.todayReviews >= 1, 'daily');

  check('first_review', '✦', 'Mulai!', 'Complete your first scored review', game.totalReviews >= 1);
  check('ten_reviews', '★', 'Pemanasan', 'Complete 10 scored reviews', game.totalReviews >= 10);
  check('fifty_reviews', '♢', 'Rajin', 'Complete 50 scored reviews', game.totalReviews >= 50);
  check('hundred_reviews', '✶', 'Seratus', 'Complete 100 scored reviews', game.totalReviews >= 100);
  check('twofifty_reviews', '❁', 'Tekun', 'Complete 250 scored reviews', game.totalReviews >= 250);
  check('fivehundred_reviews', '❃', 'Setengah Ribu', 'Complete 500 scored reviews', game.totalReviews >= 500);
  check('thousand_reviews', '✹', 'Seribu', 'Complete 1,000 scored reviews', game.totalReviews >= 1000);

  check('streak_3', '♨', 'Tiga Hari', 'Reach a 3-day study streak', game.longestStreak >= 3, 'streak');
  check('streak_7', '☄', 'Seminggu', 'Reach a 7-day study streak', game.longestStreak >= 7, 'streak');
  check('streak_14', '⚝', 'Dua Minggu', 'Reach a 14-day study streak', game.longestStreak >= 14, 'streak');
  check('streak_30', '☀', 'Sebulan', 'Reach a 30-day study streak', game.longestStreak >= 30, 'streak');
  check('streak_60', '✺', 'Dua Bulan', 'Reach a 60-day study streak', game.longestStreak >= 60, 'streak');

  check('strong_10', '◆', 'Mulai Melekat', 'Build a 3+ review streak on 10 cards', strongCards >= 10, 'mastery');
  check('strong_50', '◇', 'Makin Melekat', 'Build a 3+ review streak on 50 cards', strongCards >= 50, 'mastery');
  check('strong_100', '✧', 'Kosakata Kuat', 'Build a 3+ review streak on 100 cards', strongCards >= 100, 'mastery');

  return achievements;
}

export function syncGamificationCelebrations(state, now = Date.now()) {
  const next = normalizeProgress(state);
  const game = next.gamification;
  const summary = getGamificationSummary(next, now);
  const achievements = getAchievements(next, now);
  const today = localDayKey(now);

  if (!game.celebrationsInitialized) {
    game.celebrationsInitialized = true;
    game.lastCelebratedLevel = summary.currentLevel.level;
    game.celebratedAchievementIds = achievements.filter(a => a.earned).map(a => a.id);
    game.lastCelebratedBadgeDay = today;
    return { state: next, level: null, achievements: [] };
  }

  if (game.lastCelebratedBadgeDay && game.lastCelebratedBadgeDay !== today) {
    game.celebratedAchievementIds = game.celebratedAchievementIds.filter(id => id !== 'daily_first_review');
  }

  const prior = new Set(game.celebratedAchievementIds);
  const newlyEarned = achievements.filter(a => a.earned && !prior.has(a.id));
  const level = summary.currentLevel.level > (game.lastCelebratedLevel || 1) ? summary.currentLevel : null;

  if (level) game.lastCelebratedLevel = summary.currentLevel.level;
  game.celebratedAchievementIds = achievements.filter(a => a.earned).map(a => a.id);
  game.lastCelebratedBadgeDay = today;

  return { state: next, level, achievements: newlyEarned };
}

const VOCAB_DIRECTIONS = new Set(['i2e', 'e2i']);
function vocabDirection(direction) {
  return VOCAB_DIRECTIONS.has(direction) ? direction : 'i2e';
}
function normalizeItem(value) {
  if (!value || typeof value !== 'object') return null;
  const item = {
    correct: count(value.correct),
    wrong: count(value.wrong),
    last: timestamp(value.last),
    first: timestamp(value.first),
    again: count(value.again),
    unsure: count(value.unsure),
    know: count(value.know)
  };
  if (Object.hasOwn(value, 'dueAt')) item.dueAt = timestamp(value.dueAt);
  for (const key of ['streak', 'easyStreak', 'srsStage', 'relearnLeft', 'lapseCount', 'leechStreak']) {
    if (Object.hasOwn(value, key)) item[key] = count(value[key]);
  }
  for (const key of ['intervalDays', 'lastEasyIntervalDays', 'preLapseIntervalDays']) {
    if (Object.hasOwn(value, key)) item[key] = days(value[key]);
  }
  if (Object.hasOwn(value, 'ease')) item.ease = Number.isFinite(value.ease) ? clamp(value.ease, 1.3, 3) : 2.3;
  if (Array.isArray(value.confidenceHistory)) item.confidenceHistory = value.confidenceHistory.filter(n => Number.isFinite(n) && n >= 0 && n <= 1).slice(-10);
  if (Object.hasOwn(value, 'inRelearn')) item.inRelearn = value.inRelearn === true;
  if (Object.hasOwn(value, 'leechDrill')) item.leechDrill = value.leechDrill === true;
  return item;
}
function normalizeItemStore(input) {
  const store = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return store;
  for (const [id, value] of Object.entries(input)) {
    if (!safeId(id)) continue;
    const item = normalizeItem(value);
    if (item) store[id] = item;
  }
  return store;
}
export function getVocabProgressEntry(state, id, direction = 'i2e') {
  const dir = vocabDirection(direction);
  const directional = state?.vocabDirections?.[dir]?.[id];
  if (directional) return directional;
  // Progress created before directional tracking was introduced is treated as
  // recognition history. It is intentionally NOT copied into English →
  // Indonesian, where production starts with a clean history.
  if (dir === 'i2e') return state?.items?.[id];
  return undefined;
}
export function getCardStats(state, id, now = Date.now(), direction = 'i2e') {
  const item = getVocabProgressEntry(state, id, direction);
  if (!item) return { seen: 0, easy: 0, unsure: 0, hard: 0, correct: 0, wrong: 0, streak: 0, confidencePct: null, dueAt: 0, last: 0, first: 0, legacyUnclassified: 0, hasRatingBreakdown: false };
  const hard = count(item.again), unsure = count(item.unsure), easy = count(item.know);
  const rated = hard + unsure + easy;
  const seen = Math.max(rated, count(item.correct) + count(item.wrong));
  const history = Array.isArray(item.confidenceHistory) ? item.confidenceHistory : [];
  const confidence = history.length
    ? history.reduce((sum, n) => sum + n, 0) / history.length
    : seen ? count(item.correct) / Math.max(1, count(item.correct) + count(item.wrong)) : null;
  return {
    seen, easy, unsure, hard,
    correct: count(item.correct), wrong: count(item.wrong),
    streak: count(item.streak),
    confidencePct: confidence == null ? null : Math.round(confidence * 100),
    dueAt: timestamp(item.dueAt),
    dueInMs: item.dueAt ? item.dueAt - now : null,
    last: timestamp(item.last), first: timestamp(item.first),
    legacyUnclassified: Math.max(0, seen - rated),
    hasRatingBreakdown: rated > 0
  };
}

export function normalizeProgress(input) {
  const items = input && input.version === 1 ? normalizeItemStore(input.items) : {};
  const sourceDirections = input && input.version === 1 && input.vocabDirections && typeof input.vocabDirections === 'object'
    ? input.vocabDirections
    : {};
  const vocabDirections = {
    i2e: normalizeItemStore(sourceDirections.i2e),
    e2i: normalizeItemStore(sourceDirections.e2i)
  };
  return { version: 1, items, vocabDirections, gamification: normalizeGamification(input?.gamification) };
}

export function loadProgress(storage) {
  try { return normalizeProgress(JSON.parse(storage.getItem(KEY))); }
  catch { return normalizeProgress(null); }
}
export function saveProgress(storage, state) { storage.setItem(KEY, JSON.stringify(normalizeProgress(state))); }

export function recordAnswer(state, id, result, options = {}) {
  const next = normalizeProgress(state);
  if (!safeId(id) || !['correct', 'wrong'].includes(result)) return next;
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const previous = Object.hasOwn(next.items, id) ? next.items[id] : { correct: 0, wrong: 0, last: 0 };
  next.items[id] = {
    ...previous,
    first: previous.first || now,
    [result]: Math.min(1000000, previous[result] + 1),
    last: now
  };
  const xp = Number.isFinite(options.xp) ? options.xp : result === 'correct' ? 6 : 2;
  return applyStudyCredit(next, xp, now);
}

// Duff's relaxed (8-month) cadence: the same stabilization, confidence/ease
// growth, short relearn ladders, and leech drill, applied to Indonesian words.
const cadence = getCadencePreset('relaxed');
function schedule(item, interval, now) {
  item.intervalDays = interval;
  item.dueAt = now + msFromDays(interval);
}
function resume(item, now) {
  const interval = clamp((item.preLapseIntervalDays || 0) / 2, SRS_RELEARN_STEP_DAYS, cadence.lapseResumeCapDays);
  item.inRelearn = false; item.relearnLeft = 0;
  item.streak = count(item.streak) + 1;
  item.easyStreak = count(item.easyStreak) + 1;
  item.lastEasyIntervalDays = interval;
  schedule(item, interval, now);
}
function grow(item, now) {
  const interval = getNextEasyIntervalDays(item, cadence);
  item.streak = count(item.streak) + 1;
  item.easyStreak = count(item.easyStreak) + 1;
  item.srsStage = getSrsStage(item) + 1;
  item.ease = clamp(getSrsEase(item) + .08, 1.3, 3);
  item.lastEasyIntervalDays = interval;
  schedule(item, interval, now);
}
export function recordVocabReview(state, id, rating, spaced = true, now = Date.now(), direction = 'i2e') {
  if (!['again', 'unsure', 'know'].includes(rating)) return normalizeProgress(state);
  const next = normalizeProgress(state);
  if (!safeId(id)) return next;
  const dir = vocabDirection(direction);
  const prior = getVocabProgressEntry(next, id, dir);
  const item = prior ? { ...prior } : { correct: 0, wrong: 0, last: 0, first: 0, again: 0, unsure: 0, know: 0 };
  item.first = item.first || now;
  item[rating === 'know' ? 'correct' : 'wrong'] = Math.min(1000000, count(item[rating === 'know' ? 'correct' : 'wrong']) + 1);
  item[rating] = Math.min(1000000, count(item[rating]) + 1);
  item.last = now;
  const history = Array.isArray(item.confidenceHistory) ? item.confidenceHistory : [];
  item.confidenceHistory = [...history, { again: 0, unsure: .5, know: 1 }[rating]].slice(-10);
  next.vocabDirections[dir][id] = item;
  applyStudyCredit(next, rating === 'know' ? 8 : rating === 'unsure' ? 4 : 2, now);
  if (!spaced) return next;
  if (rating === 'again') {
  const wasInRelearn = item.inRelearn === true;
  const wasLeech = item.leechDrill === true;
  const establishedDays = Math.max(days(item.lastEasyIntervalDays), days(item.intervalDays));
  // A lapse is a new failure episode of previously established spacing.
  // Fresh-card retries and repeated Again marks within one relearn
  // episode only recycle through middle; they do not repeatedly lower
  // ease/stage or inflate the lifetime lapse counter.
  const startsLapseEpisode = !wasInRelearn && !wasLeech && establishedDays > 0;
  item.streak = 0; item.easyStreak = 0;
  if (startsLapseEpisode) {
    item.srsStage = Math.max(0, getSrsStage(item) - 1);
    item.ease = clamp(getSrsEase(item) - .2, 1.3, 3);
    item.lapseCount = count(item.lapseCount) + 1;
    item.preLapseIntervalDays = establishedDays;
  }
  const shouldLeech = wasLeech || (startsLapseEpisode && item.lapseCount >= LEECH_LAPSE_THRESHOLD);
  if (shouldLeech) {
    item.leechDrill = true; item.leechStreak = 0;
    item.inRelearn = false; item.relearnLeft = 0;
    // Leech controls the schedule after a clean answer. A failed
    // attempt keeps the normal short Again timer and live middle loop.
    item.intervalDays = 0; item.dueAt = now + SRS_AGAIN_MS;
  } else {
    if (!wasInRelearn) item.preLapseIntervalDays = establishedDays;
    item.inRelearn = true; item.relearnLeft = SRS_HARD_RELEARN_STEPS;
    item.intervalDays = 0; item.dueAt = now + SRS_AGAIN_MS;
  }
  } else if (item.leechDrill) {
    item.leechStreak = count(item.leechStreak) + 1;
    if (item.leechStreak < LEECH_UNPIN_STREAK) {
      item.streak = count(item.streak) + 1;
      schedule(item, LEECH_DRILL_DAYS, now);
    } else {
      item.leechDrill = false; item.leechStreak = 0; item.lapseCount = 0;
      item.lastEasyIntervalDays = LEECH_DRILL_DAYS;
      grow(item, now);
    }
  } else if (item.inRelearn) {
    if (item.relearnLeft > 0) {
      item.relearnLeft -= 1; item.streak = count(item.streak) + 1;
      schedule(item, SRS_RELEARN_STEP_DAYS, now);
    } else resume(item, now);
  } else if (rating === 'unsure') {
    item.preLapseIntervalDays = Math.max(days(item.lastEasyIntervalDays), days(item.intervalDays));
    item.inRelearn = true; item.relearnLeft = 0;
    item.streak = count(item.streak) + 1; item.easyStreak = 0;
    item.intervalDays = 0; item.dueAt = now + SRS_UNCERTAIN_MIN_MS;
  } else grow(item, now);
  return next;
}
export function dueVocab(cards, state, now = Date.now(), direction = 'i2e') {
  return cards.filter(card => {
    const item = getVocabProgressEntry(state, card.id, direction);
    return !item?.dueAt || item.dueAt <= now;
  });
}
