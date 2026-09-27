/**
 * Single source of truth for anything an organiser might reasonably want to change.
 * Runtime overrides live in localStorage (see lib/storage.js); the values here are
 * the defaults a fresh install starts from and the values "Reset to default" restores.
 */

export const STORAGE_KEY = 'cc-scoreboard-v2'
export const LEGACY_STORAGE_KEY = 'cc-scoreboard-v1'
export const STORAGE_VERSION = 2
export const MAX_HISTORY = 200

export const BRANDING_DEFAULTS = {
  appName: 'Papan Skor Cerdas Cermat',
  description: 'Papan skor langsung untuk lomba cerdas cermat.',
  defaultTitle: 'Papan Skor',
  themeColor: '#111827',
  logoUrl: ''
}

export const APPEARANCE_DEFAULTS = {
  theme: 'auto', // light | dark | auto
  accent: '#22c55e',
  card: '#f3f4f6',
  cardInk: '#111827',
  leader: '#fbbf24',
  board: '#ffffff',
  boardInk: '#111827',
  scoreScale: 1 // multiplier applied to the card score font size
}

export const TIMER_DEFAULTS = {
  minutes: 0,
  seconds: 5
}

export const SCORE_SCALE_RANGE = { min: 0.7, max: 1.8, step: 0.05 }
export const MAX_SCORE_BUTTONS = 6
export const MAX_SECONDS = 59
export const MAX_MINUTES = 999

/**
 * Score button palette. The full class strings are spelled out because Tailwind only
 * emits classes it can find as literal strings in the source — `bg-${key}-500` is dropped.
 */
export const SCORE_BUTTON_COLORS = {
  green: { label: 'Hijau', bg: 'bg-green-500', ink: 'text-white', swatch: '#22c55e' },
  blue: { label: 'Biru', bg: 'bg-blue-500', ink: 'text-white', swatch: '#3b82f6' },
  yellow: { label: 'Kuning', bg: 'bg-yellow-500', ink: 'text-white', swatch: '#eab308' },
  red: { label: 'Merah', bg: 'bg-red-500', ink: 'text-white', swatch: '#ef4444' },
  amber: { label: 'Amber', bg: 'bg-amber-500', ink: 'text-black', swatch: '#f59e0b' },
  indigo: { label: 'Indigo', bg: 'bg-indigo-500', ink: 'text-white', swatch: '#6366f1' },
  emerald: { label: 'Emerald', bg: 'bg-emerald-500', ink: 'text-white', swatch: '#10b981' },
  purple: { label: 'Ungu', bg: 'bg-purple-500', ink: 'text-white', swatch: '#a855f7' },
  pink: { label: 'Merah Muda', bg: 'bg-pink-500', ink: 'text-white', swatch: '#ec4899' },
  slate: { label: 'Slate', bg: 'bg-slate-500', ink: 'text-white', swatch: '#64748b' },
  cyan: { label: 'Cyan', bg: 'bg-cyan-500', ink: 'text-black', swatch: '#06b6d4' },
  white: { label: 'Putih', bg: 'bg-white', ink: 'text-black', swatch: '#ffffff' }
}

export const SCORE_BUTTON_COLOR_KEYS = Object.keys(SCORE_BUTTON_COLORS)

export const DEFAULT_SCORE_BUTTONS = [
  { id: 'score-1', label: '', value: 100, color: 'green' },
  { id: 'score-2', label: '', value: -50, color: 'blue' },
  { id: 'score-3', label: '', value: 50, color: 'yellow' }
]

export const AUDIO_FILES = {
  correct: 'correct.wav',
  alarm: 'buzz.wav',
  tick: 'tick.wav'
}

export const MOTION = {
  scoreTween: 600,
  cardPop: 500,
  cardEntrance: 500,
  cardEntranceStagger: 90,
  winnerPulse: 600,
  winnerStagger: 120,
  flash: 500,
  scoreFlash: 400,
  confetti: { particleCount: 120, spread: 75, origin: { y: 0.6 } },
  confettiSide: { particleCount: 80, spread: 60 },
  confettiSideDelay: 150
}
