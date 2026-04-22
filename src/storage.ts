const KEY_BEST     = 'colormatch_best';
const KEY_HISTORY  = 'colormatch_history';
const KEY_TUTORIAL = 'colormatch_tutorial_done';
const KEY_DAILY    = 'colormatch_daily';
const KEY_STREAK   = 'colormatch_streak';
const MAX_HISTORY  = 10;

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
