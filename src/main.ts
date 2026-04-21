import './style.css';
import { ColorWheel } from './wheel';
import { Game } from './game';
import { UI } from './ui';
import type { Lang } from './i18n';

const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement;
const wheel  = new ColorWheel(canvas);
const game   = new Game({ totalRounds: 5 });
const ui     = new UI();

let theme: 'dark' | 'light' = 'dark';
let lang: Lang = 'es';

// ── Game flow ─────────────────────────────────────────────────────────────

function beginRound(): void {
  const avg = game.roundResults.length > 0 ? game.averageScore : undefined;
  ui.showRound();
  ui.setTargetColor(game.currentTarget);
  ui.updateRoundInfo(game.currentRound, game.totalRounds, avg);
}

function handleAction(): void {
  if (game.currentPhase === 'playing') {
    const result = game.confirmPick(wheel.getColor());
    wheel.lock();
    ui.showRoundScore(result, game.isLastRound());
    ui.updateRoundInfo(game.currentRound, game.totalRounds, game.averageScore);
    return;
  }

  if (game.currentPhase === 'scored') {
    if (game.isLastRound()) {
      game.advance();
      ui.showFinalScreen(game.finalGrade, game.averageScore);
    } else {
      game.advance();
      wheel.reset();
      beginRound();
    }
  }
}

function restart(): void {
  game.reset();
  game.startRound();
  wheel.reset();
  beginRound();
}

// ── Theme & language ──────────────────────────────────────────────────────

ui.onThemeToggle(() => {
  theme = theme === 'dark' ? 'light' : 'dark';
  ui.setTheme(theme);
});

ui.onLangToggle(() => {
  lang = lang === 'es' ? 'en' : 'es';
  ui.setLang(lang);
});

// ── Wire-up ───────────────────────────────────────────────────────────────

wheel.onColorChange(color => ui.setPickedColor(color));
ui.onAction(handleAction);
ui.onRestart(restart);

game.startRound();
wheel.reset();
beginRound();
