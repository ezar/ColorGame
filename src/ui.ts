import type { HslColor, RoundResult } from './types';
import { hslString } from './color';
import { type Lang, t } from './i18n';
import { nearestColorName } from './colornames';
import { ACHIEVEMENTS, getUnlocked, type Achievement } from './achievements';

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
  private readonly colorName     = el('colorName');
  private readonly avgScore      = el('avgScore');
  private readonly roundLabel    = el('roundLabel');
  private readonly actionBtn     = el<HTMLButtonElement>('actionBtn');
  private readonly finalScreen   = el('finalScreen');
  private readonly finalGrade    = el('finalGrade');
  private readonly finalAvg      = el('finalAvg');
  private readonly finalBest     = el('finalBest');
  private readonly historyChart  = el('historyChart');
  private readonly historyLabel  = el('historyLabel');
  private readonly finalPalette  = el('finalPalette');
  private readonly wheelCanvas   = el<HTMLCanvasElement>('wheelCanvas');
  private readonly soundBtn      = el<HTMLButtonElement>('soundBtn');
  private readonly themeBtn      = el<HTMLButtonElement>('themeBtn');
  private readonly langBtn       = el<HTMLButtonElement>('langBtn');
  private readonly diffBtn       = el<HTMLButtonElement>('diffBtn');
  private readonly dailyBtn      = el<HTMLButtonElement>('dailyBtn');
  private readonly taBtn         = el<HTMLButtonElement>('taBtn');
  private readonly achBtn        = el<HTMLButtonElement>('achBtn');
  private readonly historyWrap   = el('historyWrap');
  private toastQueue: Array<{ emoji: string; name: string; label: string }> = [];
  private toastRunning = false;
  private readonly finalStreak   = el('finalStreak');
  private readonly hideCountdown   = el('hideCountdown');
  private readonly roundTimerFill  = el('roundTimerFill');
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private readonly targetLabel   = el('targetLabel');
  private readonly pickedLabel   = el('pickedLabel');
  private readonly accuracyLabel = el('accuracyLabel');
  private readonly finalScoreLbl = el('finalScoreLabel');
  private readonly restartBtn    = el<HTMLButtonElement>('restartBtn');
  private readonly shareBtn      = el<HTMLButtonElement>('shareBtn');

  private lang: Lang = 'en';
  private actionState: ActionState = 'confirm';
  private roundInfo = { round: 0, total: 0, avg: undefined as number | undefined, dayLabel: undefined as string | undefined };

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

  // ── Countdown overlay (hard mode) ────────────────────────────────────────

  startTimerBar(durationMs: number): void {
    this.stopTimerBar();
    let remaining = Math.round(durationMs / 1000);
    const show = (): void => {
      this.hideCountdown.hidden = false;
      this.hideCountdown.textContent = String(remaining);
      this.hideCountdown.classList.remove('tick');
      void this.hideCountdown.offsetWidth;
      this.hideCountdown.classList.add('tick');
    };
    show();
    this.countdownTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) { this.stopTimerBar(); } else { show(); }
    }, 1000);
  }

  stopTimerBar(): void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.hideCountdown.hidden = true;
    this.hideCountdown.classList.remove('tick');
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

  updateRoundInfo(round: number, total: number, avg?: number, dayLabel?: string): void {
    this.roundInfo = { round, total, avg, dayLabel };
    this.renderRoundInfo();
  }

  private renderRoundInfo(): void {
    const tr = t(this.lang);
    const { round, total, avg, dayLabel } = this.roundInfo;
    this.roundLabel.textContent = dayLabel
      ? `${dayLabel} · ${tr.round(round, total)}`
      : tr.round(round, total);
    this.avgScore.textContent = avg !== undefined ? tr.average(avg) : tr.averageEmpty;
  }

  // ── Screens ─────────────────────────────────────────────────────────────

  showRound(): void {
    this.actionState = 'confirm';
    this.pickedSwatch.style.background = 'var(--swatch-empty)';
    this.scoreDisplay.style.display    = 'none';
    this.scoreBarFill.style.width      = '0%';
    this.colorName.textContent = '';
    this.scoreNumber.classList.remove('high', 'low', 'perfect');
    this.actionBtn.textContent         = t(this.lang).confirm;

    this.infoBar.style.display     = 'flex';
    this.swatchPanel.style.display = 'flex';
    this.wheelCanvas.style.display = 'block';
    this.actionBtn.style.display   = 'block';
    this.finalScreen.style.display = 'none';
  }

  showRoundScore(result: RoundResult, isLastRound: boolean, keepTimer = false): void {
    this.actionState = isLastRound ? 'seeResult' : 'nextRound';
    this.revealTargetColor(result.target);
    this.stopTimerBar();
    if (!keepTimer) this.stopRoundTimer();
    this.pickedSwatch.style.background = hslString(result.picked);
    this.scoreDisplay.style.display    = 'flex';
    this.scoreNumber.textContent = String(result.score);
    this.scoreNumber.classList.toggle('perfect', result.score === 100);
    this.scoreNumber.classList.toggle('high',    result.score >= 80 && result.score < 100);
    this.scoreNumber.classList.toggle('low',     result.score < 40);
    this.colorName.textContent = t(this.lang).itWas(nearestColorName(result.target, this.lang));
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
    this.historyWrap.style.display  = '';
    this.finalGrade.classList.remove('pop');
    void this.finalGrade.offsetWidth;
    this.finalGrade.classList.add('pop');
    this.finalGrade.textContent = grade;
    this.finalAvg.textContent   = `${avg} / 100`;
    const tr = t(this.lang);
    this.finalBest.textContent = isNewRecord
      ? tr.newRecord
      : `${tr.best}: ${best}`;
    this.finalBest.classList.toggle('record', isNewRecord);
  }

  showTAFinalScreen(grade: string, rounds: number, avg: number, isNew: boolean, bestRounds: number): void {
    this.infoBar.style.display      = 'none';
    this.swatchPanel.style.display  = 'none';
    this.scoreDisplay.style.display = 'none';
    this.wheelCanvas.style.display  = 'none';
    this.actionBtn.style.display    = 'none';
    this.finalScreen.style.display  = 'flex';
    this.historyWrap.style.display  = 'none';
    this.finalGrade.classList.remove('pop');
    void this.finalGrade.offsetWidth;
    this.finalGrade.classList.add('pop');
    this.finalGrade.textContent = grade;
    const tr = t(this.lang);
    this.finalScoreLbl.textContent = tr.taScore;
    this.finalAvg.textContent      = tr.taRounds(rounds);
    this.finalBest.textContent     = isNew ? tr.newRecord : `${tr.best}: ${tr.taRounds(bestRounds)}`;
    this.finalBest.classList.toggle('record', isNew);
    this.finalStreak.textContent   = avg > 0 ? `avg ${avg}` : '';
  }

  updateTAInfo(seconds: number, rounds: number): void {
    this.roundLabel.textContent = `⏱ ${seconds}s`;
    this.avgScore.textContent   = t(this.lang).taRounds(rounds);
  }

  setTABtn(active: boolean): void {
    this.taBtn.textContent = t(this.lang).timeAttack;
    this.taBtn.classList.toggle('ta-active', active);
  }

  onTAToggle(handler: () => void): void {
    this.taBtn.addEventListener('click', handler);
  }

  // ── Achievements ─────────────────────────────────────────────────────────

  showAchOverlay(): void {
    const unlocked = getUnlocked();
    const grid = el('achGrid');
    grid.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
      const card = document.createElement('div');
      const isUnlocked = unlocked.has(a.id);
      card.className = 'ach-item' + (isUnlocked ? ' unlocked' : '');
      card.innerHTML = `<div class="ach-item-emoji">${a.emoji}</div>`
        + `<div class="ach-item-name">${this.lang === 'es' ? a.nameEs : a.nameEn}</div>`
        + (isUnlocked ? `<div class="ach-item-desc">${this.lang === 'es' ? a.descEs : a.descEn}</div>` : '');
      grid.appendChild(card);
    });
    el('achTitle').textContent = t(this.lang).achTitle;
    el('achCloseBtn').textContent = t(this.lang).close;
    el('achOverlay').hidden = false;
    el('achCloseBtn').onclick = () => { el('achOverlay').hidden = true; };
    el('achOverlay').onclick = (e: MouseEvent) => { if (e.target === el('achOverlay')) el('achOverlay').hidden = true; };
  }

  onAchToggle(handler: () => void): void {
    this.achBtn.addEventListener('click', handler);
  }

  showAchToast(achievement: Achievement): void {
    const label = t(this.lang).achUnlocked;
    const name  = this.lang === 'es' ? achievement.nameEs : achievement.nameEn;
    this.toastQueue.push({ emoji: achievement.emoji, name, label });
    if (!this.toastRunning) this.runToast();
  }

  private runToast(): void {
    if (this.toastQueue.length === 0) { this.toastRunning = false; return; }
    this.toastRunning = true;
    const { emoji, name, label } = this.toastQueue.shift()!;
    const toast = el('achToast');
    el('achToastEmoji').textContent = emoji;
    el('achToastName').textContent  = name;
    el('achToastLabel').textContent = label;
    toast.hidden = false;
    toast.classList.add('show');
    setTimeout(() => {
      toast.hidden = true;
      toast.classList.remove('show');
      setTimeout(() => this.runToast(), 300);
    }, 3000);
  }

  // ── Theme, language & difficulty ────────────────────────────────────────

  setTheme(theme: 'dark' | 'light'): void {
    document.body.classList.toggle('light', theme === 'light');
    this.themeBtn.textContent = theme === 'dark' ? '☽' : '☀';
  }

  showFinalPalette(results: readonly RoundResult[]): void {
    this.finalPalette.innerHTML = '';
    results.forEach(r => {
      const s = document.createElement('div');
      s.className = 'palette-swatch'
        + (r.score >= 80 ? ' good' : r.score < 40 ? ' bad' : '');
      s.style.background = hslString(r.target);
      this.finalPalette.appendChild(s);
    });
  }

  showHistory(history: number[]): void {
    const SLOTS = 10;
    this.historyChart.innerHTML = '';
    for (let i = 0; i < SLOTS; i++) {
      const offset   = i - (SLOTS - history.length);
      const bar      = document.createElement('div');
      const isCurrent = offset === history.length - 1;
      if (offset < 0) {
        bar.className = 'h-bar h-bar-empty';
      } else {
        bar.className = 'h-bar' + (isCurrent ? ' current' : '');
        bar.style.height = `${history[offset]}%`;
      }
      this.historyChart.appendChild(bar);
    }
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
    this.historyLabel.textContent  = t(lang).history;
    this.actionBtn.textContent     = this.actionBtnText();
    this.renderRoundInfo();
    const isDiff = this.diffBtn.dataset.diff as 'easy' | 'hard' | undefined;
    if (isDiff) this.setDiff(isDiff);
    this.dailyBtn.textContent = this.dailyBtn.classList.contains('daily-active')
      ? t(lang).dailyDone : t(lang).daily;
    this.taBtn.textContent = t(lang).timeAttack;
    if (!el('achOverlay').hidden) this.showAchOverlay();
  }

  setDailyBtn(done: boolean): void {
    const tr = t(this.lang);
    this.dailyBtn.textContent = done ? tr.dailyDone : tr.daily;
    this.dailyBtn.classList.toggle('daily-active', done);
  }

  showStreak(count: number): void {
    this.finalStreak.textContent = count > 0 ? t(this.lang).streak(count) : '';
  }

  onDailyToggle(handler: () => void): void {
    this.dailyBtn.addEventListener('click', handler);
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

  setSoundBtn(muted: boolean): void {
    this.soundBtn.textContent = muted ? '🔇' : '🔊';
  }

  onSoundToggle(handler: () => void): void {
    this.soundBtn.addEventListener('click', handler);
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
