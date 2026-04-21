import type { Lang } from './i18n';
import type { HslColor } from './types';

interface NamedColor { en: string; es: string; h: number; s: number; l: number; }

const COLORS: NamedColor[] = [
  // Reds
  { en: 'Red',          es: 'Rojo',           h: 0,   s: 100, l: 50 },
  { en: 'Crimson',      es: 'Carmesí',        h: 348, s: 83,  l: 47 },
  { en: 'Tomato',       es: 'Tomate',         h: 9,   s: 100, l: 64 },
  { en: 'Salmon',       es: 'Salmón',         h: 6,   s: 93,  l: 71 },
  { en: 'Coral',        es: 'Coral',          h: 16,  s: 100, l: 66 },
  { en: 'Brown',        es: 'Marrón',         h: 0,   s: 59,  l: 41 },
  { en: 'Sienna',       es: 'Siena',          h: 19,  s: 56,  l: 40 },
  // Pinks
  { en: 'Pink',         es: 'Rosa',           h: 350, s: 100, l: 88 },
  { en: 'Hot Pink',     es: 'Rosa intenso',   h: 330, s: 100, l: 71 },
  { en: 'Deep Pink',    es: 'Rosa fuerte',    h: 328, s: 100, l: 54 },
  { en: 'Rose',         es: 'Rosa pálido',    h: 350, s: 89,  l: 63 },
  // Oranges
  { en: 'Orange',       es: 'Naranja',        h: 30,  s: 100, l: 50 },
  { en: 'Dark Orange',  es: 'Naranja oscuro', h: 33,  s: 100, l: 40 },
  { en: 'Amber',        es: 'Ámbar',          h: 45,  s: 100, l: 50 },
  { en: 'Peach',        es: 'Melocotón',      h: 28,  s: 100, l: 80 },
  { en: 'Chocolate',    es: 'Chocolate',      h: 25,  s: 75,  l: 47 },
  { en: 'Tan',          es: 'Arena',          h: 34,  s: 44,  l: 69 },
  // Yellows
  { en: 'Yellow',       es: 'Amarillo',       h: 60,  s: 100, l: 50 },
  { en: 'Gold',         es: 'Dorado',         h: 51,  s: 100, l: 50 },
  { en: 'Lemon',        es: 'Limón',          h: 60,  s: 100, l: 70 },
  { en: 'Khaki',        es: 'Caqui',          h: 54,  s: 44,  l: 68 },
  { en: 'Olive',        es: 'Oliva',          h: 60,  s: 100, l: 25 },
  // Greens
  { en: 'Lime',         es: 'Lima',           h: 75,  s: 100, l: 50 },
  { en: 'Chartreuse',   es: 'Chartreuse',     h: 90,  s: 100, l: 50 },
  { en: 'Green',        es: 'Verde',          h: 120, s: 100, l: 38 },
  { en: 'Emerald',      es: 'Esmeralda',      h: 140, s: 52,  l: 47 },
  { en: 'Mint',         es: 'Menta',          h: 150, s: 60,  l: 70 },
  { en: 'Forest',       es: 'Verde bosque',   h: 120, s: 61,  l: 34 },
  { en: 'Sage',         es: 'Salvia',         h: 140, s: 25,  l: 60 },
  // Cyans / Teals
  { en: 'Teal',         es: 'Cerceta',        h: 180, s: 100, l: 25 },
  { en: 'Cyan',         es: 'Cian',           h: 180, s: 100, l: 50 },
  { en: 'Turquoise',    es: 'Turquesa',       h: 174, s: 72,  l: 56 },
  { en: 'Aqua',         es: 'Aguamarina',     h: 160, s: 100, l: 75 },
  // Blues
  { en: 'Sky Blue',     es: 'Azul cielo',     h: 197, s: 71,  l: 73 },
  { en: 'Powder Blue',  es: 'Azul pálido',    h: 187, s: 52,  l: 80 },
  { en: 'Cornflower',   es: 'Aciano',         h: 219, s: 79,  l: 66 },
  { en: 'Steel Blue',   es: 'Azul acero',     h: 207, s: 44,  l: 49 },
  { en: 'Dodger Blue',  es: 'Azul eléctrico', h: 210, s: 100, l: 56 },
  { en: 'Royal Blue',   es: 'Azul real',      h: 225, s: 73,  l: 57 },
  { en: 'Blue',         es: 'Azul',           h: 240, s: 100, l: 50 },
  { en: 'Navy',         es: 'Marino',         h: 240, s: 100, l: 27 },
  // Purples
  { en: 'Lavender',     es: 'Lavanda',        h: 240, s: 67,  l: 85 },
  { en: 'Violet',       es: 'Violeta',        h: 270, s: 76,  l: 72 },
  { en: 'Purple',       es: 'Morado',         h: 270, s: 50,  l: 40 },
  { en: 'Indigo',       es: 'Índigo',         h: 275, s: 100, l: 25 },
  { en: 'Orchid',       es: 'Orquídea',       h: 302, s: 59,  l: 65 },
  { en: 'Plum',         es: 'Ciruela',        h: 291, s: 47,  l: 38 },
  { en: 'Magenta',      es: 'Magenta',        h: 300, s: 100, l: 50 },
  { en: 'Fuchsia',      es: 'Fucsia',         h: 300, s: 100, l: 65 },
];

export function nearestColorName({ h, s, l }: HslColor, lang: Lang): string {
  let best = COLORS[0];
  let bestDist = Infinity;
  for (const c of COLORS) {
    const dh = Math.min(Math.abs(h - c.h), 360 - Math.abs(h - c.h)) / 180;
    const ds = (s - c.s) / 100;
    const dl = (l - c.l) / 100;
    const hw = 0.6 + (s / 100) * 0.4; // hue weight drops for unsaturated colors
    const dist = Math.sqrt(hw * dh * dh * 4 + ds * ds + dl * dl * 0.5);
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best[lang];
}
