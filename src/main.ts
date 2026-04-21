import './style.css';
import { ColorWheel } from './wheel';
import { Game } from './game';
import { UI } from './ui';
import { type Lang, t } from './i18n';
import { getHighscore, saveHighscore, pushHistory, getDailyRecord, saveDailyRecord, getStreak, updateStreak } from './storage';
import { playConfirm, playScoreHigh, playScoreLow, playPerfect } from './audio';
import { launchConfetti, burstSparkles } from './confetti';
import { maybeShowTutorial } from './tutorial';
import { getDailyTargets, getTodayKey, getDayNumber, buildDailyShareText } from './daily';

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
const ui     = new UI();

let theme:        'dark' | 'light' = 'dark';
let lang:         Lang             = 'en';
let diff:         'easy' | 'hard' = 'easy';
let isDailyMode   = false;
let game          = new Game({ totalRounds: 5 });

const ROUND_DURATION  = 10_000;
const HIDE_DELAY      = 3_000;
const FADE_DURATION   = 150;
const mainEl          = document.querySelector('main')!;

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
  ui.updateRoundInfo(game.currentRound, game.totalRounds, avg,
    isDailyMode ? t(lang).dayN(getDayNumber()) : undefined);

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
  if (result.score === 100) {
    playPerfect();
    navigator.vibrate?.([40, 30, 40, 30, 80]);
    burstSparkles(document.getElementById('scoreNumber')!);
  } else if (result.score >= 80) {
    playScoreHigh(); navigator.vibrate?.([30, 60, 60]);
  } else if (result.score < 40) {
    playScoreLow();  navigator.vibrate?.(80);
  } else {
    navigator.vibrate?.(30);
  }
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
      const grade    = game.finalGrade;
      const isNewRec = saveHighscore(avg);
      const best     = getHighscore() ?? avg;
      const history  = pushHistory(avg);
      ui.showFinalScreen(grade, avg, best, isNewRec);
      ui.showFinalPalette(game.roundResults);
      ui.showHistory(history);
      if (isNewRec) launchConfetti();

      if (isDailyMode) {
        const today   = getTodayKey();
        const streak  = updateStreak(today);
        const shareText = buildDailyShareText(grade, avg, game.roundResults, lang);
        saveDailyRecord({ date: today, grade, avg, shareText });
        ui.showStreak(streak);
        ui.setDailyBtn(true);
      } else {
        ui.showStreak(getStreak());
      }
    } else {
      game.advance();
      wheel.reset();
      mainEl.classList.add('fading');
      setTimeout(() => {
        beginRound();
        mainEl.classList.remove('fading');
      }, FADE_DURATION);
    }
  }
}

function restart(daily = false): void {
  clearTimers();
  roundTimes  = [];
  isDailyMode = daily;
  game = daily
    ? new Game({ totalRounds: 5, targets: getDailyTargets() })
    : new Game({ totalRounds: 5 });
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
  restart(isDailyMode);
});

ui.onDailyToggle(() => {
  const rec = getDailyRecord();
  const alreadyToday = rec?.date === getTodayKey();
  if (alreadyToday) {
    // show previous result via share
    if (navigator.share) navigator.share({ text: rec!.shareText }).catch(() => {});
    else navigator.clipboard.writeText(rec!.shareText).catch(() => {});
    return;
  }
  ui.setDailyBtn(false);
  restart(true);
});

// ── Wire-up ───────────────────────────────────────────────────────────────

wheel.onColorChange(color => ui.setPickedColor(color));
ui.onAction(handleAction);
ui.onRestart(restart);
ui.onShare(() => {
  const text = isDailyMode
    ? buildDailyShareText(game.finalGrade, game.averageScore, game.roundResults, lang)
    : `${t(lang).shareText(game.finalGrade, game.averageScore, avgRoundTime())}\nhttps://ezar.github.io/ColorGame/`;
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Copied!')).catch(() => {});
  }
});

ui.setDiff(diff);
ui.setDailyBtn(getDailyRecord()?.date === getTodayKey());
maybeShowTutorial(lang, () => {
  game.startRound();
  wheel.reset();
  beginRound();
});
