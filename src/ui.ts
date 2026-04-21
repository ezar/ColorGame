import type { HslColor, RoundResult } from './types';
import { hslString } from './color';
import { type Lang, t } from './i18n';

function el<T extends HTMLElement>(id: string): T {
  const elem = document.getElementById(id);
  if (!elem) throw new Error(`#${id} not found`);
  return elem as T;
}

type ActionState = 'confirm' | 'nextRound' | 'seeResult';

export class UI {
  private readonly infoBar       = el('infoBar');
  private readonly swatchPanel   = el('swatches');
  private readonly targetSwatch  = el('targetSwatch');
  private readonly pickedSwatch  = el('pickedSwatch');
  private readonly scoreDisplay  = el('scoreDisplay');
  private readonly scoreNumber   = el('scoreNumber');
  private readonly scoreBarFill  = el('scoreBarFill');
  private readonly avgScore      = el('avgScore');
  private readonly roundLabel    = el('roundLabel');
  private readonly actionBtn     = el<HTMLButtonElement>('actionBtn');
  private readonly finalScreen   = el('finalScreen');
  private readonly finalGrade    = el('finalGrade');
  private readonly finalAvg      = el('finalAvg');
  private readonly finalBest     = el('finalBest');
  private readonly wheelCanvas   = el<HTMLCanvasElement>('wheelCanvas');
  private readonly themeBtn      = el<HTMLButtonElement>('themeBtn');
  private readonly langBtn       = el<HTMLButtonElement>('langBtn');
  private readonly diffBtn       = el<HTMLButtonElement>('diffBtn');
  private readonly timerFill       = el('timerFill');
  private readonly roundTimerFill  = el('roundTimerFill');
  private readonly targetLabel   = el('targetLabel');
  private readonly pickedLabel   = el('pickedLabel');
  private readonly accuracyLabel = el('accuracyLabel');
  private readonly finalScoreLbl = el('finalScoreLabel');
  private readonly restartBtn    = el<HTMLButtonElement>('restartBtn');
  private readonly shareBtn      = el<HTMLButtonElement>('shareBtn');

  private lang: Lang = 'en';
  private actionState: ActionState = 'confirm';
  private roundInfo = { round: 0, total: 0, avg: undefined as number | undefined };

  // ── Color ───────────────────────────────────────────────────────────────

  setPickedColor(color: HslColor): void {
    this.pickedSwatch.style.background = hslString(color);
  }

  setTargetColor(color: HslColor): void {
    this.targetSwatch.style.background = hslString(color);
    this.targetSwatch.classList.remove('faded');
  }

  fadeTargetColor(): void {
    this.targetSwatch.classList.add('faded');
  }

  revealTargetColor(color: HslColor): void {
    this.targetSwatch.style.background = hslString(color);
    this.targetSwatch.classList.remove('faded');
  }

  // ── Timer bar (hard mode) ────────────────────────────────────────────────

  startTimerBar(durationMs: number): void {
    this.timerFill.style.transition = 'none';
    this.timerFill.style.width      = '100%';
    // next frame: animate drain
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.timerFill.style.transition = `width ${durationMs}ms linear`;
        this.timerFill.style.width      = '0%';
      });
    });
  }

  stopTimerBar(): void {
    this.timerFill.style.transition = 'none';
    this.timerFill.style.width      = '0%';
  }

  // ── Round timer bar ──────────────────────────────────────────────────────

  startRoundTimer(durationMs: number): void {
    this.roundTimerFill.style.transition = 'none';
    this.roundTimerFill.style.width      = '100%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.roundTimerFill.style.transition = `width ${durationMs}ms linear`;
        this.roundTimerFill.style.width      = '0%';
      });
    });
  }

  stopRoundTimer(): void {
    this.roundTimerFill.style.transition = 'none';
    this.roundTimerFill.style.width      = '0%';
  }

  // ── Round info ──────────────────────────────────────────────────────────

  updateRoundInfo(round: number, total: number, avg?: number): void {
    this.roundInfo = { round, total, avg };
    this.renderRoundInfo();
  }

  private renderRoundInfo(): void {
    const tr = t(this.lang);
    const { round, total, avg } = this.roundInfo;
    this.roundLabel.textContent = tr.round(round, total);
    this.avgScore.textContent   = avg !== undefined ? tr.average(avg) : tr.averageEmpty;
  }

  // ── Screens ─────────────────────────────────────────────────────────────

  showRound(): void {
    this.actionState = 'confirm';
    this.pickedSwatch.style.background = 'var(--swatch-empty)';
    this.scoreDisplay.style.display    = 'none';
    this.scoreBarFill.style.width      = '0%';
    this.actionBtn.textContent         = t(this.lang).confirm;

    this.infoBar.style.display     = 'flex';
    this.swatchPanel.style.display = 'flex';
    this.wheelCanvas.style.display = 'block';
    this.actionBtn.style.display   = 'block';
    this.finalScreen.style.display = 'none';
  }

  showRoundScore(result: RoundResult, isLastRound: boolean): void {
    this.actionState = isLastRound ? 'seeResult' : 'nextRound';
    this.revealTargetColor(result.target);
    this.stopTimerBar();
    this.stopRoundTimer();
    this.pickedSwatch.style.background = hslString(result.picked);
    this.scoreDisplay.style.display    = 'flex';
    this.scoreNumber.textContent       = String(result.score);
    setTimeout(() => { this.scoreBarFill.style.width = `${result.score}%`; }, 30);
    this.actionBtn.textContent = this.actionBtnText();
  }

  showFinalScreen(grade: string, avg: number, best: number, isNewRecord: boolean): void {
    this.infoBar.style.display      = 'none';
    this.swatchPanel.style.display  = 'none';
    this.scoreDisplay.style.display = 'none';
    this.wheelCanvas.style.display  = 'none';
    this.actionBtn.style.display    = 'none';
    this.finalScreen.style.display  = 'flex';
    this.finalGrade.textContent = grade;
    this.finalAvg.textContent   = `${avg} / 100`;
    const tr = t(this.lang);
    this.finalBest.textContent = isNewRecord
      ? tr.newRecord
      : `${tr.best}: ${best}`;
    this.finalBest.classList.toggle('record', isNewRecord);
  }

  // ── Theme, language & difficulty ────────────────────────────────────────

  setTheme(theme: 'dark' | 'light'): void {
    document.body.classList.toggle('light', theme === 'light');
    this.themeBtn.textContent = theme === 'dark' ? '☽' : '☀';
  }

  setLang(lang: Lang): void {
    this.lang = lang;
    this.langBtn.textContent       = lang === 'es' ? 'EN' : 'ES';
    this.targetLabel.textContent   = t(lang).target;
    this.pickedLabel.textContent   = t(lang).yourColor;
    this.accuracyLabel.textContent = t(lang).accuracy;
    this.finalScoreLbl.textContent = t(lang).finalScore;
    this.restartBtn.textContent    = t(lang).playAgain;
    this.shareBtn.textContent      = t(lang).share;
    this.actionBtn.textContent     = this.actionBtnText();
    this.renderRoundInfo();
    // re-render diff button with new lang
    const isDiff = this.diffBtn.dataset.diff as 'easy' | 'hard' | undefined;
    if (isDiff) this.setDiff(isDiff);
  }

  setDiff(diff: 'easy' | 'hard'): void {
    this.diffBtn.dataset.diff     = diff;
    this.diffBtn.textContent      = t(this.lang)[diff];
    this.diffBtn.classList.toggle('diff-hard', diff === 'hard');
  }

  // ── Events ──────────────────────────────────────────────────────────────

  onAction(handler: () => void): void {
    this.actionBtn.addEventListener('click', handler);
  }

  onRestart(handler: () => void): void {
    this.restartBtn.addEventListener('click', handler);
  }

  onShare(handler: () => void): void {
    this.shareBtn.addEventListener('click', handler);
  }

  onThemeToggle(handler: () => void): void {
    this.themeBtn.addEventListener('click', handler);
  }

  onLangToggle(handler: () => void): void {
    this.langBtn.addEventListener('click', handler);
  }

  onDiffToggle(handler: () => void): void {
    this.diffBtn.addEventListener('click', handler);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private actionBtnText(): string {
    const tr = t(this.lang);
    if (this.actionState === 'confirm')   return tr.confirm;
    if (this.actionState === 'nextRound') return tr.nextRound;
    return tr.seeResult;
  }
}
