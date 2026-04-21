import type { HslColor, RoundResult } from './types';
import { hslString } from './color';

function el<T extends HTMLElement>(id: string): T {
  const elem = document.getElementById(id);
  if (!elem) throw new Error(`#${id} not found`);
  return elem as T;
}

export class UI {
  private readonly infoBar      = el('infoBar');
  private readonly swatchPanel  = el('swatches');
  private readonly targetSwatch = el('targetSwatch');
  private readonly pickedSwatch = el('pickedSwatch');
  private readonly scoreDisplay = el('scoreDisplay');
  private readonly scoreNumber  = el('scoreNumber');
  private readonly scoreBarFill = el('scoreBarFill');
  private readonly avgScore     = el('avgScore');
  private readonly roundLabel   = el('roundLabel');
  private readonly actionBtn    = el<HTMLButtonElement>('actionBtn');
  private readonly finalScreen  = el('finalScreen');
  private readonly finalGrade   = el('finalGrade');
  private readonly finalAvg     = el('finalAvg');
  private readonly wheelCanvas  = el<HTMLCanvasElement>('wheelCanvas');

  setPickedColor(color: HslColor): void {
    this.pickedSwatch.style.background = hslString(color);
  }

  setTargetColor(color: HslColor): void {
    this.targetSwatch.style.background = hslString(color);
  }

  updateRoundInfo(round: number, total: number, avg?: number): void {
    this.roundLabel.textContent = `Ronda ${round} de ${total}`;
    this.avgScore.textContent   = avg !== undefined ? `Media: ${avg}` : 'Media: —';
  }

  showRound(): void {
    this.pickedSwatch.style.background = '#1f2937';
    this.scoreDisplay.style.display    = 'none';
    this.scoreBarFill.style.width      = '0%';
    this.actionBtn.textContent         = 'Confirmar';

    this.infoBar.style.display     = 'flex';
    this.swatchPanel.style.display = 'flex';
    this.wheelCanvas.style.display = 'block';
    this.actionBtn.style.display   = 'block';
    this.finalScreen.style.display = 'none';
  }

  showRoundScore(result: RoundResult, isLastRound: boolean): void {
    this.pickedSwatch.style.background = hslString(result.picked);
    this.scoreDisplay.style.display    = 'flex';
    this.scoreNumber.textContent       = String(result.score);
    setTimeout(() => { this.scoreBarFill.style.width = `${result.score}%`; }, 30);
    this.actionBtn.textContent = isLastRound ? 'Ver resultado' : 'Siguiente ronda';
  }

  showFinalScreen(grade: string, avg: number): void {
    this.infoBar.style.display      = 'none';
    this.swatchPanel.style.display  = 'none';
    this.scoreDisplay.style.display = 'none';
    this.wheelCanvas.style.display  = 'none';
    this.actionBtn.style.display    = 'none';
    this.finalScreen.style.display  = 'flex';
    this.finalGrade.textContent = grade;
    this.finalAvg.textContent   = `${avg} / 100`;
  }

  onAction(handler: () => void): void {
    this.actionBtn.addEventListener('click', handler);
  }

  onRestart(handler: () => void): void {
    el<HTMLButtonElement>('restartBtn').addEventListener('click', handler);
  }
}
