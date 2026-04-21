import './style.css';
import { ColorWheel } from './wheel';
import { Game } from './game';
import { UI } from './ui';
import { type Lang, t } from './i18n';
import { getHighscore, saveHighscore, pushHistory } from './storage';
import { playConfirm, playScoreHigh, playScoreLow } from './audio';
import { launchConfetti } from './confetti';
import { maybeShowTutorial } from './tutorial';

declare const __BUILD_TIME__: number;
((): void => {
  const d  = new Date(__BUILD_TIME__);
  const yy = String(d.getFullYear()).slice(-2);
  const M  = d.getMonth() + 1;
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const v  = `${yy}.${M}.${dd}.${hh}${mm}`;
  const footer = document.getElementById('footer');
  if (footer) footer.textContent = `© ${d.getFullYear()} ezar · v${v}`;
})();

const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement;
const wheel  = new ColorWheel(canvas);
const game   = new Game({ totalRounds: 5 });
const ui     = new UI();

let theme: 'dark' | 'light' = 'dark';
let lang:  Lang              = 'en';
let diff:  'easy' | 'hard'  = 'easy';

const ROUND_DURATION = 10_000;
const HIDE_DELAY     = 3_000;

let hideTimer:  ReturnType<typeof setTimeout> | null = null;
let roundTimer: ReturnType<typeof setTimeout> | null = null;
let roundStart  = 0;
let roundTimes: number[] = [];

// ── Timer helpers ─────────────────────────────────────────────────────────

function clearTimers(): void {
  if (hideTimer  !== null) { clearTimeout(hideTimer);  hideTimer  = null; }
  if (roundTimer !== null) { clearTimeout(roundTimer); roundTimer = null; }
}

function avgRoundTime(): number {
  if (roundTimes.length === 0) return 0;
  const avg = roundTimes.reduce((s, v) => s + v, 0) / roundTimes.length;
  return Math.round(avg / 1000);
}

// ── Game flow ─────────────────────────────────────────────────────────────

function beginRound(): void {
  clearTimers();
  const avg = game.roundResults.length > 0 ? game.averageScore : undefined;
  wheel.setLightness(game.currentTarget.l);
  ui.showRound();
  ui.setTargetColor(game.currentTarget);
  ui.updateRoundInfo(game.currentRound, game.totalRounds, avg);

  roundStart = Date.now();
  ui.startRoundTimer(ROUND_DURATION);
  roundTimer = setTimeout(confirmPick, ROUND_DURATION);

  if (diff === 'hard') {
    ui.startTimerBar(HIDE_DELAY);
    hideTimer = setTimeout(() => ui.fadeTargetColor(), HIDE_DELAY);
  }
}

function confirmPick(): void {
  if (game.currentPhase !== 'playing') return;
  clearTimers();
  roundTimes.push(Date.now() - roundStart);
  const result = game.confirmPick(wheel.getColor());
  wheel.lock();
  playConfirm();
  ui.showRoundScore(result, game.isLastRound());
  if (result.score >= 80)      { playScoreHigh(); navigator.vibrate?.([30, 60, 60]); }
  else if (result.score < 40)  { playScoreLow();  navigator.vibrate?.(80); }
  else                         {                  navigator.vibrate?.(30); }
  ui.updateRoundInfo(game.currentRound, game.totalRounds, game.averageScore);
}

function handleAction(): void {
  if (game.currentPhase === 'playing') {
    confirmPick();
    return;
  }

  if (game.currentPhase === 'scored') {
    if (game.isLastRound()) {
      game.advance();
      const avg      = game.averageScore;
      const isNewRec = saveHighscore(avg);
      const best     = getHighscore() ?? avg;
      const history  = pushHistory(avg);
      ui.showFinalScreen(game.finalGrade, avg, best, isNewRec);
      ui.showHistory(history);
      if (isNewRec) launchConfetti();
    } else {
      game.advance();
      wheel.reset();
      beginRound();
    }
  }
}

function restart(): void {
  clearTimers();
  roundTimes = [];
  game.reset();
  game.startRound();
  wheel.reset();
  beginRound();
}

// ── Theme, language & difficulty ──────────────────────────────────────────

ui.onThemeToggle(() => {
  theme = theme === 'dark' ? 'light' : 'dark';
  ui.setTheme(theme);
});

ui.onLangToggle(() => {
  lang = lang === 'es' ? 'en' : 'es';
  ui.setLang(lang);
});

ui.onDiffToggle(() => {
  diff = diff === 'easy' ? 'hard' : 'easy';
  ui.setDiff(diff);
  restart();
});

// ── Wire-up ───────────────────────────────────────────────────────────────

wheel.onColorChange(color => ui.setPickedColor(color));
ui.onAction(handleAction);
ui.onRestart(restart);
ui.onShare(() => {
  const text = t(lang).shareText(game.finalGrade, game.averageScore, avgRoundTime());
  const url  = 'https://ezar.github.io/ColorGame/';
  if (navigator.share) {
    navigator.share({ text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => alert('Copied!')).catch(() => {});
  }
});

ui.setDiff(diff);
maybeShowTutorial(lang, () => {
  game.startRound();
  wheel.reset();
  beginRound();
});
