# Color Match

[![Play online](https://img.shields.io/badge/▶%20Play%20online-4ade80?style=for-the-badge&logoColor=white)](https://ezar.github.io/ColorGame/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/ezar/ColorGame/deploy.yml?branch=main&style=for-the-badge&label=deploy&logo=github)](https://github.com/ezar/ColorGame/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?style=for-the-badge&logo=pwa&logoColor=white)](https://ezar.github.io/ColorGame/)

A color perception game. Spin the wheel, match the target color as closely as you can, and see how good your eye really is.

Built for my daughter, who came up with most of the ideas. Inspired by color training tools seen around the web.

---

## How to play

1. A target color is shown on the left swatch.
2. Drag the color wheel to pick your best match.
3. Hit **Confirm** before the round timer runs out.
4. Your accuracy is scored 0–100 based on hue and saturation distance.
5. After 5 rounds you get a final grade (S / A / B / C / D / F).

---

## Features

| Feature | Details |
|---|---|
| **Color wheel** | Full HSL wheel on an HTML5 canvas — tap or drag to pick |
| **Scoring** | 0–100 per round; weighted by hue (70 %) and saturation (30 %) |
| **Grading** | S ≥ 95 · A ≥ 85 · B ≥ 70 · C ≥ 55 · D ≥ 40 · F otherwise |
| **Easy / Hard** | Hard mode hides the target after a 3-second countdown |
| **Daily challenge** | Same 5 colors for everyone each day, seeded by day number |
| **Streak counter** | Tracks consecutive days you play the daily challenge |
| **Shareable result** | One-tap share with grade, score and color emoji grid |
| **History chart** | Bar chart of your last 10 games |
| **Perfect score easter egg** | Hit 100/100 on a round → sparkles + unique sound |
| **Color names** | After each round, shows the nearest named color |
| **Dark / Light theme** | Toggle at any time |
| **Spanish / English** | Full UI translation |
| **PWA** | Installable, works fully offline |
| **Haptic feedback** | Vibration patterns on mobile for different score ranges |
| **Sound effects** | Web Audio API tones — no audio files |

---

## Grading scale

| Grade | Average score |
|---|---|
| S | 95 – 100 |
| A | 85 – 94 |
| B | 70 – 84 |
| C | 55 – 69 |
| D | 40 – 54 |
| F | 0 – 39 |

---

## Tech stack

- **Vite** + **TypeScript** — no framework, vanilla DOM
- **HTML5 Canvas** — color wheel rendering
- **Web Audio API** — procedural sound effects
- **Workbox** (via `vite-plugin-pwa`) — service worker + offline cache
- **localStorage** — highscore, history, daily record, streak, tutorial state
- **Mulberry32 PRNG** — deterministic daily color seeds from the day number

---

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:5173/ColorGame/
npm run build     # production build → dist/
npm run preview   # preview the production build
```

The app is deployed to GitHub Pages from the `dist/` output via the Actions workflow on every push to `main`.

---

## Project structure

```
src/
  main.ts        — app entry, game loop, event wiring
  game.ts        — Game state machine (idle → playing → scored → done)
  wheel.ts       — Canvas color wheel
  color.ts       — HSL math, scoring, grading
  colornames.ts  — Nearest named color lookup
  daily.ts       — Daily targets (seeded PRNG), share text
  storage.ts     — localStorage helpers (highscore, history, daily, streak)
  audio.ts       — Web Audio sound effects
  confetti.ts    — Confetti + sparkle canvas effects
  tutorial.ts    — First-run tutorial overlay
  ui.ts          — DOM manipulation layer
  i18n.ts        — English / Spanish translations
  types.ts       — Shared TypeScript types
```

---

## License

MIT
