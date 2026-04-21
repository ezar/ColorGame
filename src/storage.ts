const KEY_BEST    = 'colormatch_best';
const KEY_HISTORY = 'colormatch_history';
const MAX_HISTORY = 10;

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

const KEY_TUTORIAL = 'colormatch_tutorial_done';
export function hasDoneTutorial(): boolean { return !!localStorage.getItem(KEY_TUTORIAL); }
export function markTutorialDone(): void   { localStorage.setItem(KEY_TUTORIAL, '1'); }

export function getHistory(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_HISTORY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushHistory(score: number): number[] {
  const h = getHistory();
  h.push(score);
  if (h.length > MAX_HISTORY) h.splice(0, h.length - MAX_HISTORY);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(h));
  return h;
}
