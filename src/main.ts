import './style.css';
import { ColorWheel } from './wheel';
import { Game } from './game';
import { UI } from './ui';

const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement;
const wheel  = new ColorWheel(canvas);
const game   = new Game({ totalRounds: 5 });
const ui     = new UI();

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

wheel.onColorChange(color => ui.setPickedColor(color));
ui.onAction(handleAction);
ui.onRestart(restart);

game.startRound();
wheel.reset();
beginRound();
