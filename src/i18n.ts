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
  },
};

export function t(lang: Lang): Translations {
  return translations[lang];
}
