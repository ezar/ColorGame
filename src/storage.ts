const KEY_BEST        = 'colormatch_best';
const KEY_HISTORY     = 'colormatch_history';
const KEY_TUTORIAL    = 'colormatch_tutorial_done';
const KEY_DAILY       = 'colormatch_daily';
const KEY_STREAK      = 'colormatch_streak';
const KEY_PERFECT     = 'colormatch_perfect';
const KEY_GAMES       = 'colormatch_games';
const KEY_DAILY_COUNT = 'colormatch_daily_count';
const KEY_GRADES      = 'colormatch_grade_counts';

export type GradeCounts = Record<string, number>;

export function getGradeCounts(): GradeCounts {
  try   { return JSON.parse(localStorage.getItem(KEY_GRADES) ?? '{}'); }
  catch { return {}; }
}

export function incrementGrade(grade: string): void {
  const counts = getGradeCounts();
  counts[grade] = (counts[grade] ?? 0) + 1;
  localStorage.setItem(KEY_GRADES, JSON.stringify(counts));
}
const MAX_HISTORY     = 10;

// ── Highscore ─────────────────────────────────────────────────────────────
export function getHighscore(): number | null {
  const v = localStorage.getItem(KEY_BEST);
  return v !== null ? Number(v) : null;
}

export function saveHighscore(score: number): boolean {
  const prev = getHighscore();
  if (prev === null || score > prev) {
    localStorage.setItem(KEY_BEST, String(score));
    return true;
  }
  return false;
}

// ── Tutorial ──────────────────────────────────────────────────────────────
export function hasDoneTutorial(): boolean { return !!localStorage.getItem(KEY_TUTORIAL); }
export function markTutorialDone(): void   { localStorage.setItem(KEY_TUTORIAL, '1'); }

// ── History ───────────────────────────────────────────────────────────────
export function getHistory(): number[] {
  try   { return JSON.parse(localStorage.getItem(KEY_HISTORY) ?? '[]'); }
  catch { return []; }
}

export function pushHistory(score: number): number[] {
  const h = getHistory();
  h.push(score);
  if (h.length > MAX_HISTORY) h.splice(0, h.length - MAX_HISTORY);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(h));
  return h;
}

// ── Daily record ──────────────────────────────────────────────────────────
export interface DailyResult { h: number; s: number; l: number; score: number; }
export interface DailyRecord { date: string; grade: string; avg: number; shareText: string; results?: DailyResult[]; }

export function getDailyRecord(): DailyRecord | null {
  try   { return JSON.parse(localStorage.getItem(KEY_DAILY) ?? 'null'); }
  catch { return null; }
}

export function saveDailyRecord(r: DailyRecord): void {
  localStorage.setItem(KEY_DAILY, JSON.stringify(r));
}

// ── Counters for achievements ─────────────────────────────────────────────
function counter(key: string): { get: () => number; inc: () => number } {
  return {
    get: ()  => Number(localStorage.getItem(key) ?? '0'),
    inc: ()  => { const n = Number(localStorage.getItem(key) ?? '0') + 1; localStorage.setItem(key, String(n)); return n; },
  };
}

const _perfect = counter(KEY_PERFECT);
const _games   = counter(KEY_GAMES);
const _daily   = counter(KEY_DAILY_COUNT);

export const getPerfectCount  = _perfect.get;
export const incrementPerfect = _perfect.inc;
export const getGamesPlayed   = _games.get;
export const incrementGames   = _games.inc;
export const getDailyCount    = _daily.get;
export const incrementDaily   = _daily.inc;

// ── Time Attack best ──────────────────────────────────────────────────────
const KEY_TA = 'colormatch_ta';
export interface TABest { rounds: number; avg: number; }

export function getTABest(): TABest | null {
  try   { return JSON.parse(localStorage.getItem(KEY_TA) ?? 'null'); }
  catch { return null; }
}

export function saveTABest(r: TABest): boolean {
  const prev = getTABest();
  if (!prev || r.rounds > prev.rounds || (r.rounds === prev.rounds && r.avg > prev.avg)) {
    localStorage.setItem(KEY_TA, JSON.stringify(r));
    return true;
  }
  return false;
}

// ── Streak ────────────────────────────────────────────────────────────────
interface StreakData { lastDate: string; count: number; }

export function getStreak(): number {
  try {
    const d: StreakData = JSON.parse(localStorage.getItem(KEY_STREAK) ?? '{"lastDate":"","count":0}');
    return d.count;
  } catch { return 0; }
}

export function updateStreak(todayKey: string): number {
  try {
    const d: StreakData = JSON.parse(localStorage.getItem(KEY_STREAK) ?? '{"lastDate":"","count":0}');
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const count = d.lastDate === todayKey   ? d.count
                : d.lastDate === yesterday  ? d.count + 1
                : 1;
    localStorage.setItem(KEY_STREAK, JSON.stringify({ lastDate: todayKey, count }));
    return count;
  } catch { return 1; }
}
