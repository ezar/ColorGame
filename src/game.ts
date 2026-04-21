import { calcScore, calcGrade, randomTarget } from './color';
import type { GameConfig, GamePhase, HslColor, RoundResult } from './types';

export class Game {
  private phase: GamePhase = 'idle';
  private round = 0;
  private results: RoundResult[] = [];
  private target: HslColor = { h: 0, s: 0, l: 50 };

  constructor(private readonly config: GameConfig) {}

  get currentRound(): number         { return this.round; }
  get totalRounds(): number          { return this.config.totalRounds; }
  get currentPhase(): GamePhase      { return this.phase; }
  get currentTarget(): HslColor      { return { ...this.target }; }
  get roundResults(): readonly RoundResult[] { return this.results; }

  get averageScore(): number {
    if (this.results.length === 0) return 0;
    return Math.round(this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length);
  }

  get finalGrade(): string {
    return calcGrade(this.averageScore);
  }

  isLastRound(): boolean {
    return this.round >= this.config.totalRounds;
  }

  startRound(): void {
    this.round++;
    this.target = randomTarget();
    this.phase = 'playing';
  }

  confirmPick(picked: HslColor): RoundResult {
    if (this.phase !== 'playing') throw new Error('Not in playing phase');
    const score = calcScore(this.target, picked);
    const result: RoundResult = {
      target: { ...this.target },
      picked: { ...picked },
      score,
    };
    this.results.push(result);
    this.phase = 'scored';
    return result;
  }

  advance(): void {
    if (this.phase !== 'scored') throw new Error('Not in scored phase');
    if (this.isLastRound()) {
      this.phase = 'done';
    } else {
      this.startRound();
    }
  }

  reset(): void {
    this.phase   = 'idle';
    this.round   = 0;
    this.results = [];
    this.target  = { h: 0, s: 0, l: 50 };
  }
}
