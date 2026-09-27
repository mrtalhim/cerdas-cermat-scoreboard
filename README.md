# Cerdas Cermat Scoreboard

A no-nonsense scoreboard app built with Vue 3 and Tailwind CSS. Manage teams, scores, a countdown timer, and a full change history — built for live quizzes (Cerdas Cermat) on a big screen.

## Features

- **Teams**: add / remove / rename teams, scores update with flash + bounce animations.
- **Animated scores**: numbers count up/down via Anime.js (`outExpo`), new cards spring in (`outBack`), board cascades in with a stagger on load, leaders pulse on celebration. Honors `prefers-reduced-motion` (values snap instantly).
- **History + undo**: every score change, add, remove, and clear-all is logged. Undo (`Ctrl+Z`), redo (`Ctrl+Shift+Z` / `Ctrl+Y`), per-event log with timestamps, clear-history with confirm. "Clear All Teams" is itself undoable.
- **Persistence**: title, teams, score buttons, branding, appearance, timer defaults, and history survive a page refresh via `localStorage` (`cc-scoreboard-v2`, migrated automatically from `-v1`). Safe to refresh mid-show.
- **Timer**: minutes/seconds input, pause / resume / reset, tick + buzzer sounds, red flash when time is up.
- **Winner celebration**: 👑 leader detection (hidden on ties / fresh board) with `canvas-confetti` shower via the 🎉 Winner button.
- **Leader highlight**: current leader card gets an amber ring + crown.
- **Flexible score buttons**: add, remove, reorder, rename, recolor, and revalue the score buttons (up to 6). A value of `0` hides its button.
- **Appearance**: light / dark / auto theme, plus overridable accent, card, leader and board colors, and a score-size slider.
- **Background image**: upload a photo or paste a URL under *Settings → Latar*, with a dim slider so text stays readable. Uploads are downscaled to 1920px and re-encoded as WebP/JPEG in the browser before being stored, because a raw data URL would not fit in `localStorage`.
- **Branding**: app name, default title, description, browser theme color, and an optional logo shown in the header — all reflected in `<title>` and the social meta tags.

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
- **Settings** (⚙️): four tabs — *Skor* (score buttons), *Tampilan* (theme, colors, score size), *Identitas* (app name, title, description, theme color, logo URL), *Umum* (clear teams, test sound).
- **Scoring**: `+100` / `-50` / `+50` buttons per team by default, editable to up to 6. Scores flash green/red.
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

- `src/config.js` — every default in one place: storage keys, branding, appearance, score-button palette, SFX filenames, motion timings.
- `src/lib/` — framework-free logic: `scoreButtons` (normalize/migrate/reorder), `storage` (v1→v2 migration), `appearance` (theme + CSS variable application), `branding` (document head), `image` (upload validation, downscale, re-encode, URL sanitising), `sfx` (WebAudio + HTMLAudio), `motion` (anime.js + confetti), `historyLog`, `uid`.
- `src/components/Scoreboard.vue` — orchestrator: owns the state, wires the children, keeps undo/redo and the timer.
- `src/components/` — `TeamCard`, `AppToolbar`, `MiniControls`, `LeaderBanner`, `SettingsPanel`, `HistoryPanel`, `CountdownOverlay`, `BoardBackground` (props + emits only).
- `src/assets/base.css` — the `--cc-*` design tokens plus the transitions shared across components.
- `src/App.vue` — renders `Scoreboard` directly (no router; single-screen app).
- `public/*.wav` — sounds, loaded relative to `import.meta.env.BASE_URL` so they work under the `/cerdas-cermat-scoreboard` base path.

### Customizing

- **Score buttons, defaults, sounds** — edit `src/config.js`.
- **Colors** — either pick them at runtime under *Settings → Tampilan* (stored per device) or change the token defaults in `src/assets/base.css` and the `cc.*` aliases in `tailwind.config.js`.
- **Background image limits** — `BACKGROUND_MAX_UPLOAD_BYTES` (8 MB) refuses oversized files before decoding, `BACKGROUND_MAX_DIMENSION` (1920px) caps the downscale, and `BACKGROUND_DIM_RANGE` sets the dim slider. Anything above `BACKGROUND_LARGE_BYTES` triggers a "use a URL instead" hint, because `localStorage` is capped at roughly 5 MB in total.
- **Page head / favicon** — `index.html` holds the static defaults; the saved branding settings overwrite `<title>`, `theme-color`, and the `og:*` tags at runtime. Drop a replacement `public/favicon.svg` in place.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`: it runs `npm ci` + `npm run build` and publishes `dist/` to the `gh-pages` branch, which is what GitHub Pages serves. No manual `dist/` handling needed (the folder is git-ignored). You can also run the workflow manually from the Actions tab (`workflow_dispatch`).

Note: the Vite `base` is `/cerdas-cermat-scoreboard`, matching the project-pages URL. If you fork under a different repo name, update `base` in `vite.config.js`.

## Notes / roadmap

- Dependencies are kept on their current majors (Vue 3.5, Vite 5.4, Tailwind 3.4, ESLint 8) via `npm update`. Jumping to Tailwind v4 / Vite 7+ / ESLint v9 flat config is deliberately left as a separate migration — each changes config-file formats.
- `dist/` is git-ignored and untracked; don't commit build output.
- History is capped at 200 entries to bound `localStorage` usage.

## License

MIT
