import { APPEARANCE_DEFAULTS, SCORE_SCALE_RANGE } from '../config'

export const THEME_CHOICES = [
  { value: 'auto', label: 'Otomatis' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' }
]

/** Baseline palette per theme. Any field can be overridden per organiser. */
export const THEME_PRESETS = {
  light: {
    accent: '#22c55e',
    card: '#f3f4f6',
    cardInk: '#111827',
    leader: '#fbbf24',
    board: '#ffffff',
    boardInk: '#111827'
  },
  dark: {
    accent: '#22c55e',
    card: '#1f2937',
    cardInk: '#f9fafb',
    leader: '#fbbf24',
    board: '#0b1220',
    boardInk: '#e5e7eb'
  }
}

export const COLOR_FIELDS = [
  { key: 'accent', label: 'Aksen' },
  { key: 'card', label: 'Kartu tim' },
  { key: 'cardInk', label: 'Teks kartu' },
  { key: 'leader', label: 'Pemimpin' },
  { key: 'board', label: 'Latar papan' },
  { key: 'boardInk', label: 'Teks papan' }
]

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function isHexColor(value) {
  return typeof value === 'string' && HEX.test(value.trim())
}

function kebab(key) {
  return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
}

// Snap in integer hundredths so the stored value never picks up float noise
// (0.7 / 0.05 is not exactly 14 in binary floating point).
const SCALE_MIN = Math.round(SCORE_SCALE_RANGE.min * 100)
const SCALE_MAX = Math.round(SCORE_SCALE_RANGE.max * 100)
const SCALE_STEP = Math.round(SCORE_SCALE_RANGE.step * 100)

function clampScale(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return APPEARANCE_DEFAULTS.scoreScale
  const hundredths = Math.round(numeric * 100)
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, hundredths))
  return (Math.round(clamped / SCALE_STEP) * SCALE_STEP) / 100
}

export function sanitizeAppearance(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const theme = THEME_PRESETS[source.theme] ? source.theme : APPEARANCE_DEFAULTS.theme
  const overrides = {}
  const rawOverrides =
    source.overrides && typeof source.overrides === 'object' ? source.overrides : {}
  for (const { key } of COLOR_FIELDS) {
    if (isHexColor(rawOverrides[key])) overrides[key] = rawOverrides[key].trim()
  }
  return {
    theme,
    scoreScale: clampScale(source.scoreScale ?? APPEARANCE_DEFAULTS.scoreScale),
    overrides
  }
}

export function prefersDarkScheme() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function resolveTheme(theme) {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return prefersDarkScheme() ? 'dark' : 'light'
}

export function onSystemThemeChange(handler) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  if (typeof query.addEventListener !== 'function') return () => {}
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}

/** Overrides win over the active theme preset, so `null` means "follow the preset". */
export function resolveColors(appearance) {
  const preset = THEME_PRESETS[resolveTheme(appearance.theme)]
  const colors = {}
  for (const { key } of COLOR_FIELDS) {
    colors[key] = appearance.overrides?.[key] || preset[key]
  }
  return colors
}

export function applyAppearance(appearance, root) {
  const target = root ?? (typeof document !== 'undefined' ? document.documentElement : null)
  if (!target) return
  const isDark = resolveTheme(appearance.theme) === 'dark'
  target.classList.toggle('dark', isDark)
  target.style.colorScheme = isDark ? 'dark' : 'light'
  const colors = resolveColors(appearance)
  for (const [key, value] of Object.entries(colors)) {
    target.style.setProperty(`--cc-${kebab(key)}`, value)
  }
  target.style.setProperty('--cc-score-scale', String(appearance.scoreScale))
}
