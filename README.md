# Cerdas Cermat Scoreboard

A no-nonsense scoreboard app built with Vue 3 and Tailwind CSS. Manage teams, scores, a countdown timer, and a full change history — built for live quizzes (Cerdas Cermat) on a big screen.

## Features

- **Teams**: add / remove / rename teams, scores update with flash + bounce animations.
- **History + undo**: every score change, add, remove, and clear-all is logged. Undo (`Ctrl+Z`), redo (`Ctrl+Shift+Z` / `Ctrl+Y`), per-event log with timestamps, clear-history with confirm. "Clear All Teams" is itself undoable.
- **Persistence**: title, teams, score-button settings, timer defaults, and history survive a page refresh via `localStorage` (`cc-scoreboard-v1`). Safe to refresh mid-show.
- **Timer**: minutes/seconds input, pause / resume / reset, tick + buzzer sounds, red flash when time is up.
- **Winner celebration**: 👑 leader detection (hidden on ties / fresh board) with `canvas-confetti` shower via the 🎉 Winner button.
- **Leader highlight**: current leader card gets an amber ring + crown.

## Getting started

1. Clone the repository:

   `git clone https://github.com/mrtalhim/cerdas-cermat-scoreboard.git`

2. Enter the project:

   `cd cerdas-cermat-scoreboard`

3. Install dependencies:

   `npm install`

4. Run the dev server:

   `npm run dev`

5. Open `http://localhost:5173` in your browser.

Other scripts:

- `npm run build` — production build to `dist/` (untracked in git; deployed from CI / `gh-pages` branch).
- `npm run preview` — preview the production build.
- `npm run lint` — ESLint (v8 config in `.eslintrc.cjs`).
- `npm run format` — Prettier over `src/`.

## Usage

- **Title**: edit the big input at the top — it auto-saves.
- **Setting**: adjust the three global score buttons (set one to `0` to hide it), or clear all teams.
- **Scoring**: `+100` / `-50` / `+50` buttons per team (configurable). Scores flash green/red.
- **History**: button with a count badge opens the log panel. Undo/redo work from the toolbar, the panel, or the keyboard.
- **Timer**: enter minutes + seconds, press Timer. Pause/Resume/Reset from the overlay. `Esc` closes panels.
- **Winner**: press 🎉 Winner to shower confetti over the current leader.

Keyboard shortcuts (ignored while typing in an input):

| Keys | Action |
| ---- | ------ |
| `Ctrl/⌘ + Z` | Undo last change |
| `Ctrl/⌘ + Shift + Z` or `Ctrl/⌘ + Y` | Redo |
| `Esc` | Close settings / history panels |

## Project structure

- `src/components/Scoreboard.vue` — the whole board (state, history, timer, persistence).
- `src/views/HomeView.vue` — renders `Scoreboard` at `/`.
- `src/App.vue` — `<RouterView />` shell.
- `src/router/index.js` — single `/` route (the old `/about` scaffold was removed).
- `public/buzz.wav`, `public/tick.wav` — timer sounds, loaded relative to `import.meta.env.BASE_URL` so they work under the `/cerdas-cermat-scoreboard` base path.

## Notes / roadmap

- Dependencies are kept on their current majors (Vue 3.5, Vite 5.4, Tailwind 3.4, ESLint 8) via `npm update`. Jumping to Tailwind v4 / Vite 7+ / ESLint v9 flat config is deliberately left as a separate migration — each changes config-file formats.
- `dist/` is git-ignored and untracked; don't commit build output.
- History is capped at 200 entries to bound `localStorage` usage.

## License

MIT
