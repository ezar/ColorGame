import './style.css';
import { ColorWheel } from './wheel';
import { Game } from './game';
import { UI } from './ui';
import { type Lang, t } from './i18n';
import { getHighscore, saveHighscore, pushHistory, getDailyRecord, saveDailyRecord, getStreak, updateStreak, getTABest, saveTABest, getPerfectCount, incrementPerfect, getGamesPlayed, incrementGames, getDailyCount, incrementDaily } from './storage';
import { checkAchievements, type Achievement } from './achievements';
import { playConfirm, playScoreHigh, playScoreLow, playPerfect, isMuted, toggleMute } from './audio';
import { launchConfetti, burstSparkles } from './confetti';
import { maybeShowTutorial } from './tutorial';
import { getDailyTargets, getTodayKey, getDayNumber, buildDailyShareText } from './daily';
import { calcGrade } from './color';

const GRADE_COLORS: Record<string, string> = {
  S: '#f59e0b', A: '#4ade80', B: '#38bdf8', C: '#fb923c', D: '#f87171', F: '#ef4444',
};

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
  if (footer) footer.innerHTML = `© ${d.getFullYear()} <a href="https://github.com/ezar/ColorGame" target="_blank" rel="noopener">ezar</a> · v${v}`;
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
const TA_SECS         = 60;
const TA_NEXT_DELAY   = 1_200;
const mainEl          = document.querySelector('main')!;

let hideTimer:  ReturnType<typeof setTimeout> | null = null;
let roundTimer: ReturnType<typeof setTimeout> | null = null;
let roundStart  = 0;
let roundTimes: number[] = [];

// ── Time-attack state ─────────────────────────────────────────────────────
let isTA            = false;
let taSecondsLeft   = TA_SECS;
let taInterval:     ReturnType<typeof setInterval> | null = null;
let taNextTimer:    ReturnType<typeof setTimeout>  | null = null;
let taResults:      import('./types').RoundResult[] = [];
let lastModeTA      = false;
let finalShareText  = '';

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
  wheel.setLightness(game.currentTarget.l);
  ui.showRound();
  ui.setTargetColor(game.currentTarget);
  roundStart = Date.now();

  if (isTA) {
    ui.updateTAInfo(taSecondsLeft, taResults.length);
    roundTimer = setTimeout(confirmPick, ROUND_DURATION);
  } else {
    const avg = game.roundResults.length > 0 ? game.averageScore : undefined;
    ui.updateRoundInfo(game.currentRound, game.totalRounds, avg,
      isDailyMode ? t(lang).dayN(getDayNumber()) : undefined);
    ui.startRoundTimer(ROUND_DURATION);
    roundTimer = setTimeout(confirmPick, ROUND_DURATION);
  }

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
  ui.showRoundScore(result, game.isLastRound(), isTA);
  if (result.score === 100) {
    playPerfect();
    navigator.vibrate?.([40, 30, 40, 30, 80]);
    burstSparkles(document.getElementById('scoreNumber')!);
    incrementPerfect();
    notifyAch(checkAchievements(buildAchCtx()));
  } else if (result.score >= 80) {
    playScoreHigh(); navigator.vibrate?.([30, 60, 60]);
  } else if (result.score < 40) {
    playScoreLow();  navigator.vibrate?.(80);
  } else {
    navigator.vibrate?.(30);
  }
  if (isTA) {
    taResults.push(result);
    ui.updateTAInfo(taSecondsLeft, taResults.length);
    taNextTimer = setTimeout(taAdvanceRound, TA_NEXT_DELAY);
  } else {
    ui.updateRoundInfo(game.currentRound, game.totalRounds, game.averageScore);
  }
}

function handleAction(): void {
  if (game.currentPhase === 'playing') {
    confirmPick();
    return;
  }

  if (game.currentPhase === 'scored') {
    if (isTA) {
      if (taNextTimer) { clearTimeout(taNextTimer); taNextTimer = null; }
      taAdvanceRound();
      return;
    }
    if (game.isLastRound()) {
      game.advance();
      const avg      = game.averageScore;
      const grade    = game.finalGrade;
      const isNewRec = saveHighscore(avg);
      const best     = getHighscore() ?? avg;
      const history  = pushHistory(avg);
      incrementGames();
      ui.showFinalScreen(grade, avg, best, isNewRec);
      ui.showFinalPalette(game.roundResults);
      ui.showHistory(history);
      if (isNewRec) launchConfetti();

      if (isDailyMode) {
        const today     = getTodayKey();
        const streak    = updateStreak(today);
        const shareText = buildDailyShareText(grade, avg, game.roundResults, lang);
        saveDailyRecord({
          date: today, grade, avg, shareText,
          results: game.roundResults.map(r => ({ h: r.target.h, s: r.target.s, l: r.target.l, score: r.score })),
        });
        incrementDaily();
        ui.showStreak(streak);
        ui.setDailyBtn(true);
        finalShareText = shareText;
      } else {
        ui.showStreak(getStreak());
        finalShareText = `${t(lang).shareText(grade, avg, avgRoundTime())}\nhttps://ezar.github.io/ColorGame/`;
      }
      notifyAch(checkAchievements(buildAchCtx()));
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
  ui.closeSettings();
  clearTimers();
  lastModeTA  = false;
  roundTimes  = [];
  isDailyMode = daily;
  game = daily
    ? new Game({ totalRounds: 5, targets: getDailyTargets() })
    : new Game({ totalRounds: 5 });
  game.startRound();
  wheel.reset();
  beginRound();
}

// ── Achievements ─────────────────────────────────────────────────────────

function buildAchCtx() {
  return {
    gamesPlayed:  getGamesPlayed(),
    perfectCount: getPerfectCount(),
    bestAvg:      getHighscore(),
    streak:       getStreak(),
    dailyCount:   getDailyCount(),
    taBestRounds: getTABest()?.rounds ?? 0,
  };
}

function notifyAch(newOnes: Achievement[]): void {
  newOnes.forEach(a => ui.showAchToast(a));
}

// ── Time-attack flow ──────────────────────────────────────────────────────

function startTimeAttack(): void {
  ui.closeSettings();
  clearTimers();
  if (taInterval)  { clearInterval(taInterval);  taInterval  = null; }
  if (taNextTimer) { clearTimeout(taNextTimer);  taNextTimer = null; }
  isTA        = true;
  isDailyMode = false;
  lastModeTA  = true;
  taSecondsLeft = TA_SECS;
  taResults     = [];
  roundTimes    = [];
  game = new Game({ totalRounds: 999 });
  game.startRound();
  wheel.reset();
  ui.setTABtn(true);
  ui.startRoundTimer(TA_SECS * 1000);
  beginRound();
  taInterval = setInterval(tickTA, 1000);
}

function tickTA(): void {
  taSecondsLeft--;
  ui.updateTAInfo(taSecondsLeft, taResults.length);
  if (taSecondsLeft <= 0) endTimeAttack();
}

function taAdvanceRound(): void {
  taNextTimer = null;
  if (!isTA) return;
  game.advance();
  game.startRound();
  wheel.reset();
  mainEl.classList.add('fading');
  setTimeout(() => {
    if (!isTA) return;
    beginRound();
    mainEl.classList.remove('fading');
  }, FADE_DURATION);
}

function endTimeAttack(): void {
  if (taInterval)  { clearInterval(taInterval);  taInterval  = null; }
  if (taNextTimer) { clearTimeout(taNextTimer);  taNextTimer = null; }
  clearTimers();
  isTA = false;
  const rounds = taResults.length;
  const avg    = rounds > 0
    ? Math.round(taResults.reduce((s, r) => s + r.score, 0) / rounds) : 0;
  const grade  = calcGrade(avg);
  const isNew  = rounds > 0 && saveTABest({ rounds, avg });
  const best   = getTABest();
  finalShareText = `${t(lang).taShare(grade, rounds, avg)}\nhttps://ezar.github.io/ColorGame/`;
  incrementGames();
  ui.showTAFinalScreen(grade, rounds, avg, isNew, best?.rounds ?? rounds);
  ui.showFinalPalette(taResults);
  ui.setTABtn(false);
  if (isNew) launchConfetti();
  notifyAch(checkAchievements(buildAchCtx()));
}

// ── Theme, language, sound & difficulty ───────────────────────────────────

ui.onSoundToggle(() => ui.setSoundBtn(toggleMute()));
ui.setSoundBtn(isMuted());

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
  if (lastModeTA) startTimeAttack(); else restart(isDailyMode);
});

ui.onTAToggle(startTimeAttack);

ui.onDailyToggle(() => {
  const rec = getDailyRecord();
  if (rec?.date === getTodayKey()) {
    showDailyResult(rec);
    return;
  }
  ui.setDailyBtn(false);
  restart(true);
});

function showDailyResult(rec: ReturnType<typeof getDailyRecord> & {}): void {
  const tr     = t(lang);
  const overlay = document.getElementById('dailyResult')!;
  document.getElementById('drDayLabel')!.textContent = tr.dayN(getDayNumber());
  const gradeEl = document.getElementById('drGrade')!;
  gradeEl.textContent = rec.grade;
  gradeEl.style.color = GRADE_COLORS[rec.grade] ?? '';
  gradeEl.classList.remove('pop');
  void (gradeEl as HTMLElement).offsetWidth;
  gradeEl.classList.add('pop');
  (document.querySelector('#dailyResult .daily-card') as HTMLElement | null)
    ?.style.setProperty('--daily-accent', GRADE_COLORS[rec.grade] ?? 'rgba(255,255,255,0.18)');
  document.getElementById('drAvg')!.textContent      = `${rec.avg} / 100`;
  document.getElementById('drShareBtn')!.textContent = tr.share;
  document.getElementById('drCloseBtn')!.textContent = tr.close;

  const palette = document.getElementById('drPalette')!;
  palette.innerHTML = '';
  (rec.results ?? []).forEach(r => {
    const s = document.createElement('div');
    s.className = 'palette-swatch' + (r.score >= 80 ? ' good' : r.score < 40 ? ' bad' : '');
    s.style.background = `hsl(${r.h},${r.s}%,${r.l}%)`;
    palette.appendChild(s);
  });

  overlay.hidden = false;

  const close = (): void => { overlay.hidden = true; };
  document.getElementById('drCloseBtn')!.onclick  = close;
  overlay.onclick = (e: MouseEvent) => { if (e.target === overlay) close(); };
  document.getElementById('drShareBtn')!.onclick = () => {
    if (navigator.share) navigator.share({ text: rec.shareText }).catch(() => {});
    else navigator.clipboard.writeText(rec.shareText).catch(() => {});
  };
}

// ── Wire-up ───────────────────────────────────────────────────────────────

wheel.onColorChange(color => ui.setPickedColor(color));
ui.onAction(handleAction);
ui.onRestart(() => { if (lastModeTA) startTimeAttack(); else restart(); });
ui.onShare(() => {
  if (navigator.share) navigator.share({ text: finalShareText }).catch(() => {});
  else navigator.clipboard.writeText(finalShareText).then(() => alert('Copied!')).catch(() => {});
});

ui.onSettingsToggle(() => ui.showSettings());
ui.onAchToggle(() => ui.showAchOverlay());
ui.refreshAchBtn();

ui.setDiff(diff);
ui.setDailyBtn(getDailyRecord()?.date === getTodayKey());
maybeShowTutorial(lang, () => {
  game.startRound();
  wheel.reset();
  beginRound();
});
