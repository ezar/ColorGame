const KEY = 'colormatch_best';

export function getHighscore(): number | null {
  const v = localStorage.getItem(KEY);
  return v !== null ? Number(v) : null;
}

export function saveHighscore(score: number): boolean {
  const prev = getHighscore();
  if (prev === null || score > prev) {
    localStorage.setItem(KEY, String(score));
    return true;
  }
  return false;
}
