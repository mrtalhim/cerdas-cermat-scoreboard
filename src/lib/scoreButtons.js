import {
  DEFAULT_SCORE_BUTTONS,
  MAX_SCORE_BUTTONS,
  SCORE_BUTTON_COLOR_KEYS,
  SCORE_BUTTON_COLORS
} from '../config'
import { bestInkFor, isHexColor } from './contrast'

export { bestInkFor, isHexColor }

export function isCustomColor(color) {
  return !SCORE_BUTTON_COLORS[color] && isHexColor(color)
}

/** Maps a hex back to a palette name so a picked colour stays recognisable. */
export function matchColorKey(hex) {
  if (!isHexColor(hex)) return null
  const target = hex.trim().toLowerCase()
  return SCORE_BUTTON_COLOR_KEYS.find((key) => SCORE_BUTTON_COLORS[key].swatch === target) ?? null
}

/** '#ffffff' -> 'white', '#000000' -> 'black', anything else stays a custom hex. */
export function matchInkKey(hex) {
  const target = String(hex ?? '')
    .trim()
    .toLowerCase()
  if (target === '#ffffff') return 'white'
  if (target === '#000000') return 'black'
  return null
}

/**
 * Palette entries ship their literal Tailwind classes (Tailwind cannot see interpolated
 * class names). A colour that is not in the palette is a custom hex, applied inline.
 */
export function colorClasses(color) {
  const known = SCORE_BUTTON_COLORS[color]
  if (known) return { ...known, custom: null }
  const custom = isCustomColor(color) ? color.trim() : null
  return {
    label: 'Kustom',
    bg: '',
    ink: 'text-white',
    swatch: custom ?? SCORE_BUTTON_COLORS.green.swatch,
    custom
  }
}

/**
 * Button -> swatch. Components must use this rather than colorClasses(button): passing
 * the object makes colorClasses miss the palette lookup and silently return no `bg`
 * class, which renders the button invisible.
 */
export function buttonSwatch(button) {
  return colorClasses(button?.color)
}

export function normalizeTextColor(value) {
  if (value === 'white' || value === 'black') return value
  if (isHexColor(value)) return value.trim()
  return '' // '' means auto: pick whichever of white/black reads better
}

/** Tailwind class for the label ink. Empty when a custom hex is applied inline instead. */
export function buttonInkClass(button) {
  const choice = normalizeTextColor(button?.textColor)
  if (choice === 'white') return 'text-white'
  if (choice === 'black') return 'text-black'
  if (isHexColor(choice)) return ''
  return bestInkFor(buttonSwatch(button).swatch)
}

export function buttonInkStyle(button) {
  const choice = normalizeTextColor(button?.textColor)
  return isHexColor(choice) ? { color: choice } : null
}

export function buttonStyle(color) {
  const { custom } = colorClasses(color)
  return custom ? { backgroundColor: custom } : null
}

export function formatScoreValue(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  return `${value >= 0 ? '+' : ''}${value}`
}

/** Buttons with a value of 0 are hidden — that is how the organiser disables one. */
export function isButtonVisible(button) {
  return button.value !== 0
}

export function buttonText(button) {
  const custom = (button.label ?? '').trim()
  return custom || formatScoreValue(button.value)
}

function cloneDefaults() {
  return DEFAULT_SCORE_BUTTONS.map((button) => ({ ...button }))
}

function dedupeId(rawId, used) {
  const base = typeof rawId === 'string' && rawId.trim() ? rawId.trim() : 'score'
  let candidate = base
  let suffix = 2
  while (used.has(candidate)) candidate = `${base}-${suffix++}`
  used.add(candidate)
  return candidate
}

function normalizeColor(raw) {
  if (SCORE_BUTTON_COLORS[raw]) return raw
  return isCustomColor(raw) ? raw.trim() : 'green'
}

function normalizeButton(raw, used) {
  const value = Number(raw.value)
  return {
    id: dedupeId(raw.id, used),
    label: typeof raw.label === 'string' ? raw.label : '',
    value: Number.isFinite(value) ? Math.trunc(value) : 0,
    color: normalizeColor(raw.color),
    textColor: normalizeTextColor(raw.textColor)
  }
}

/** Accepts a v2 `scoreButtons` array and always returns a usable list. */
export function normalizeScoreButtons(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return cloneDefaults()
  const used = new Set()
  const buttons = raw
    .filter((button) => button && typeof button === 'object')
    .slice(0, MAX_SCORE_BUTTONS)
    .map((button) => normalizeButton(button, used))
  return buttons.length ? buttons : cloneDefaults()
}

/** Upgrades a v1 `globalScores: { score1, score2, score3 }` payload. */
export function migrateLegacyScores(legacy) {
  if (!legacy || typeof legacy !== 'object') return cloneDefaults()
  const used = new Set()
  return DEFAULT_SCORE_BUTTONS.map((button, index) =>
    normalizeButton({ ...button, value: legacy[`score${index + 1}`] ?? button.value }, used)
  )
}

export function createScoreButton(existing) {
  const list = existing ?? []
  const used = new Set(list.map((button) => button.id))
  const usedColors = new Set(list.map((button) => button.color))
  const color = SCORE_BUTTON_COLOR_KEYS.find((key) => !usedColors.has(key)) ?? 'green'
  return { id: dedupeId('score', used), label: '', value: 10, color, textColor: '' }
}

export function moveScoreButton(buttons, from, to) {
  const next = [...buttons]
  if (from < 0 || from >= next.length || to < 0 || to >= next.length || from === to) return next
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
