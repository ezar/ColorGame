export interface HslColor {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

export type GamePhase = 'idle' | 'playing' | 'scored' | 'done';

export interface RoundResult {
  target: HslColor;
  picked: HslColor;
  score: number;
}

export interface GameConfig {
  totalRounds: number;
}
