export type Lang = 'es' | 'en';

export interface Translations {
  round:          (current: number, total: number) => string;
  average:        (score: number) => string;
  averageEmpty:   string;
  target:         string;
  yourColor:      string;
  accuracy:       string;
  confirm:        string;
  nextRound:      string;
  seeResult:      string;
  finalScore:     string;
  playAgain:      string;
  share:          string;
  shareText:      (grade: string, avg: number, avgTime: number) => string;
  best:           string;
  newRecord:      string;
  easy:           string;
  hard:           string;
  history:        string;
  itWas:          (name: string) => string;
  tutTitle:       string;
  tut1:           string;
  tut2:           string;
  tut3:           string;
  tutBtn:         string;
  daily:          string;
  dailyDone:      string;
  dayN:           (n: number) => string;
  streak:         (n: number) => string;
  close:          string;
  timeAttack:     string;
  taRounds:       (n: number) => string;
  taScore:        string;
  taShare:        (grade: string, rounds: number, avg: number) => string;
  achTitle:       string;
  achUnlocked:    string;
}

const translations: Record<Lang, Translations> = {
  es: {
    round:        (c, total) => `Ronda ${c} de ${total}`,
    average:      s => `Media: ${s}`,
    averageEmpty: 'Media: —',
    target:       'Objetivo',
    yourColor:    'Tu color',
    accuracy:     'Precisión',
    confirm:      'Confirmar',
    nextRound:    'Siguiente ronda',
    seeResult:    'Ver resultado',
    finalScore:   'Puntuación final',
    playAgain:    'Jugar de nuevo',
    share:        'Compartir',
    shareText:    (g, a, t) => `Conseguí ${g} (${a}/100) en ${t}s de media en Color Match 🎨 ¿Puedes superarlo?`,
    best:         'Mejor marca',
    newRecord:    '¡Nuevo récord!',
    easy:         'FÁCIL',
    hard:         'DIFÍCIL',
    history:      'Últimas partidas',
    itWas:        n => `Era ${n}`,
    tutTitle:     'Cómo jugar',
    tut1:         'Toca la rueda para elegir un color',
    tut2:         'Imita el color objetivo lo mejor posible',
    tut3:         'Confirma antes de que se acabe el tiempo',
    tutBtn:       'Entendido',
    daily:        'DIARIO',
    dailyDone:    'DIARIO ✓',
    dayN:         n => `Día ${n}`,
    streak:       n => `🔥 ${n}`,
    close:        'Cerrar',
    timeAttack:   'TIEMPO',
    taRounds:     n => `${n} rondas`,
    taScore:      'Contrarreloj',
    taShare:      (g, r, a) => `Hice ${r} rondas en 60s en Color Match ⏱ Nota ${g}, media ${a}/100 ¿Puedes superarlo?`,
    achTitle:     'Logros',
    achUnlocked:  '¡Logro desbloqueado!',
  },
  en: {
    round:        (c, total) => `Round ${c} of ${total}`,
    average:      s => `Avg: ${s}`,
    averageEmpty: 'Avg: —',
    target:       'Target',
    yourColor:    'Your color',
    accuracy:     'Accuracy',
    confirm:      'Confirm',
    nextRound:    'Next round',
    seeResult:    'See result',
    finalScore:   'Final score',
    playAgain:    'Play again',
    share:        'Share',
    shareText:    (g, a, t) => `I scored ${g} (${a}/100) in ${t}s avg on Color Match 🎨 Can you beat it?`,
    best:         'Best',
    newRecord:    'New record!',
    easy:         'EASY',
    hard:         'HARD',
    history:      'Last games',
    itWas:        n => `It was ${n}`,
    tutTitle:     'How to play',
    tut1:         'Tap the wheel to pick a color',
    tut2:         'Match the target color as closely as you can',
    tut3:         'Confirm before the timer runs out',
    tutBtn:       'Got it',
    daily:        'DAILY',
    dailyDone:    'DAILY ✓',
    dayN:         n => `Day ${n}`,
    streak:       n => `🔥 ${n}`,
    close:        'Close',
    timeAttack:   'TIME',
    taRounds:     n => `${n} rounds`,
    taScore:      'Time attack',
    taShare:      (g, r, a) => `I played ${r} rounds in 60s on Color Match ⏱ Grade ${g}, avg ${a}/100. Can you beat it?`,
    achTitle:     'Achievements',
    achUnlocked:  'Achievement unlocked!',
  },
};

export function t(lang: Lang): Translations {
  return translations[lang];
}
