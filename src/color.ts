import type { HslColor } from './types';

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export function hslString({ h, s, l }: HslColor): string {
  return `hsl(${h},${s}%,${l}%)`;
}

export function calcScore(target: HslColor, picked: HslColor): number {
  const dh = Math.min(Math.abs(target.h - picked.h), 360 - Math.abs(target.h - picked.h)) / 180;
  const ds = Math.abs(target.s - picked.s) / 100;
  return Math.max(0, Math.round((1 - dh * 0.7 - ds * 0.3) * 100));
}

export function calcGrade(avg: number): string {
  if (avg >= 95) return 'S';
  if (avg >= 85) return 'A';
  if (avg >= 70) return 'B';
  if (avg >= 55) return 'C';
  if (avg >= 40) return 'D';
  return 'F';
}

export function randomTarget(): HslColor {
  return { h: Math.random() * 360, s: 40 + Math.random() * 60, l: 50 };
}
