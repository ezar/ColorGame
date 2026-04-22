export interface Achievement {
  id:     string;
  emoji:  string;
  nameEn: string;
  nameEs: string;
  descEn: string;
  descEs: string;
}

export interface AchCtx {
  gamesPlayed:   number;
  perfectCount:  number;
  bestAvg:       number | null;
  streak:        number;
  dailyCount:    number;
  taBestRounds:  number;
}

const KEY = 'colormatch_ach';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game',  emoji: '🎮', nameEn: 'First game',    nameEs: 'Primera partida',  descEn: 'Complete your first game',          descEs: 'Completa tu primera partida'     },
  { id: 'grade_b',     emoji: '🌟', nameEn: 'B or better',   nameEs: 'Nota B',           descEn: 'Achieve grade B or higher',         descEs: 'Consigue nota B o superior'      },
  { id: 'grade_a',     emoji: '⭐', nameEn: 'A grade',       nameEs: 'Nota A',           descEn: 'Achieve grade A or higher',         descEs: 'Consigue nota A o superior'      },
  { id: 'grade_s',     emoji: '👁️', nameEn: 'Perfect eye',   nameEs: 'Ojo perfecto',     descEn: 'Achieve the legendary S grade',     descEs: 'Consigue la nota S legendaria'   },
  { id: 'perfect_1',   emoji: '💯', nameEn: 'Pixel perfect', nameEs: 'Pixel perfecto',   descEn: 'Score 100/100 on a round',          descEs: 'Saca 100/100 en una ronda'       },
  { id: 'perfect_5',   emoji: '🔮', nameEn: 'Sharp eye',     nameEs: 'Ojo de lince',     descEn: 'Score 100/100 five times',          descEs: 'Saca 100/100 cinco veces'        },
  { id: 'daily_first', emoji: '📅', nameEn: 'Daily player',  nameEs: 'Jugadora diaria',  descEn: 'Complete a daily challenge',        descEs: 'Completa un reto diario'         },
  { id: 'streak_3',    emoji: '🔥', nameEn: 'On fire',       nameEs: 'En racha',         descEn: '3-day streak',                      descEs: 'Racha de 3 días'                 },
  { id: 'streak_7',    emoji: '🌈', nameEn: 'Week streak',   nameEs: 'Racha semanal',    descEn: 'Play 7 days in a row',              descEs: 'Juega 7 días seguidos'           },
  { id: 'ta_5',        emoji: '⚡', nameEn: 'Speed runner',  nameEs: 'Veloz',            descEn: '5+ rounds in time attack',          descEs: '5+ rondas en contrarreloj'       },
  { id: 'ta_10',       emoji: '🚀', nameEn: 'Speedster',     nameEs: 'Cohete',           descEn: '10+ rounds in time attack',         descEs: '10+ rondas en contrarreloj'      },
  { id: 'games_10',    emoji: '🎯', nameEn: 'Dedicated',     nameEs: 'Dedicada',         descEn: 'Play 10 games',                     descEs: 'Juega 10 partidas'               },
];

export function getUnlocked(): Set<string> {
  try   { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); }
  catch { return new Set(); }
}

export function unlockAchievement(id: string): boolean {
  const set = getUnlocked();
  if (set.has(id)) return false;
  set.add(id);
  localStorage.setItem(KEY, JSON.stringify([...set]));
  return true;
}

export function checkAchievements(ctx: AchCtx): Achievement[] {
  const checks: Array<[string, boolean]> = [
    ['first_game',  ctx.gamesPlayed  >= 1],
    ['grade_b',     (ctx.bestAvg ?? 0) >= 70],
    ['grade_a',     (ctx.bestAvg ?? 0) >= 85],
    ['grade_s',     (ctx.bestAvg ?? 0) >= 95],
    ['perfect_1',   ctx.perfectCount >= 1],
    ['perfect_5',   ctx.perfectCount >= 5],
    ['daily_first', ctx.dailyCount   >= 1],
    ['streak_3',    ctx.streak       >= 3],
    ['streak_7',    ctx.streak       >= 7],
    ['ta_5',        ctx.taBestRounds >= 5],
    ['ta_10',       ctx.taBestRounds >= 10],
    ['games_10',    ctx.gamesPlayed  >= 10],
  ];
  const newOnes: Achievement[] = [];
  for (const [id, cond] of checks) {
    if (cond && unlockAchievement(id)) {
      newOnes.push(ACHIEVEMENTS.find(a => a.id === id)!);
    }
  }
  return newOnes;
}
