import './style.css';
import { ColorWheel } from './wheel';
import { Game } from './game';
import { UI } from './ui';
import { type Lang, t } from './i18n';
import { getHighscore, saveHighscore } from './storage';

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

let theme: 'dark' | 'light'  = 'dark';
let lang:  Lang               = 'en';
let diff:  'easy' | 'hard'   = 'easy';
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const HIDE_DELAY = 3000;

// ── Game flow ─────────────────────────────────────────────────────────────

function clearHideTimer(): void {
  if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null; }
}

function beginRound(): void {
  clearHideTimer();
  const avg = game.roundResults.length > 0 ? game.averageScore : undefined;
  ui.showRound();
  ui.setTargetColor(game.currentTarget);
  ui.updateRoundInfo(game.currentRound, game.totalRounds, avg);

  if (diff === 'hard') {
    ui.startTimerBar(HIDE_DELAY);
    hideTimer = setTimeout(() => ui.fadeTargetColor(), HIDE_DELAY);
  }
}

function handleAction(): void {
  if (game.currentPhase === 'playing') {
    clearHideTimer();
    const result = game.confirmPick(wheel.getColor());
    wheel.lock();
    ui.showRoundScore(result, game.isLastRound());
    ui.updateRoundInfo(game.currentRound, game.totalRounds, game.averageScore);
    return;
  }

  if (game.currentPhase === 'scored') {
    if (game.isLastRound()) {
      game.advance();
      const avg      = game.averageScore;
      const isNewRec = saveHighscore(avg);
      const best     = getHighscore() ?? avg;
      ui.showFinalScreen(game.finalGrade, avg, best, isNewRec);
    } else {
      game.advance();
      wheel.reset();
      beginRound();
    }
  }
}

function restart(): void {
  clearHideTimer();
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
  const text = t(lang).shareText(game.finalGrade, game.averageScore);
  const url  = 'https://ezar.github.io/ColorGame/';
  if (navigator.share) {
    navigator.share({ text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => alert('Copied!')).catch(() => {});
  }
});

ui.setDiff(diff);
game.startRound();
wheel.reset();
beginRound();
