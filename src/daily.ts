import type { HslColor } from './types';
import type { Lang } from './i18n';
import type { RoundResult } from './types';

// ── Deterministic PRNG (mulberry32) ───────────────────────────────────────
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Day numbering ─────────────────────────────────────────────────────────
const EPOCH_MS = new Date('2026-04-21').getTime();

export function getDayNumber(): number {
  return Math.max(1, Math.floor((Date.now() - EPOCH_MS) / 86_400_000) + 1);
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Seeded daily targets ──────────────────────────────────────────────────
export function getDailyTargets(count = 5): HslColor[] {
  const rand = mulberry32(getDayNumber() * 1_000_003);
  return Array.from({ length: count }, () => ({
    h: rand() * 360,
    s: 40 + rand() * 60,
    l: 30 + Math.round(rand() * 40),
  }));
}

// ── Hue → coloured square emoji ──────────────────────────────────────────
export function hueToEmoji(h: number): string {
  const n = ((h % 360) + 360) % 360;
  if (n < 20 || n >= 340) return '🟥';
  if (n < 55)             return '🟧';
  if (n < 80)             return '🟨';
  if (n < 165)            return '🟩';
  if (n < 275)            return '🟦';
  return '🟪';
}

// ── Share text ────────────────────────────────────────────────────────────
export function buildDailyShareText(
  grade: string, avg: number,
  results: readonly RoundResult[], lang: Lang,
): string {
  const day    = getDayNumber();
  const emojis = results.map(r => hueToEmoji(r.target.h)).join('');
  const url    = 'https://ezar.github.io/ColorGame/';
  return lang === 'es'
    ? `Color Match · Día ${day}\n${grade} · ${avg}/100\n${emojis}\n${url}`
    : `Color Match · Day ${day}\n${grade} · ${avg}/100\n${emojis}\n${url}`;
}
