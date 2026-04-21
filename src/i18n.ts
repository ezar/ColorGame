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
  shareText:      (grade: string, avg: number) => string;
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
    shareText:    (g, a) => `Conseguí ${g} (${a}/100) en Color Match 🎨 ¿Puedes superarlo?`,
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
    shareText:    (g, a) => `I scored ${g} (${a}/100) on Color Match 🎨 Can you beat it?`,
  },
};

export function t(lang: Lang): Translations {
  return translations[lang];
}
