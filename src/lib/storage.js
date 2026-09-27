import {
  LEGACY_STORAGE_KEY,
  MAX_HISTORY,
  MAX_MINUTES,
  MAX_SECONDS,
  STORAGE_KEY,
  STORAGE_VERSION,
  TIMER_DEFAULTS
} from '../config'
import { sanitizeAppearance } from './appearance'
import { sanitizeBranding } from './branding'
import { migrateLegacyScores, normalizeScoreButtons } from './scoreButtons'
import { uid } from './uid'

function clampInt(value, min, max, fallback) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(numeric)))
}

function normalizeTeam(raw) {
  if (!raw || typeof raw !== 'object') return null
  const score = Number(raw.score)
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    name: typeof raw.name === 'string' ? raw.name : '',
    score: Number.isFinite(score) ? score : 0,
    displayScore: Number.isFinite(score) ? score : 0,
    lastChange: 0
  }
}

export function buildSnapshot(state) {
  return {
    v: STORAGE_VERSION,
    title: state.title,
    teams: state.teams.map((team) => ({ id: team.id, name: team.name, score: team.score })),
    scoreButtons: state.scoreButtons,
    branding: state.branding,
    appearance: state.appearance,
    history: state.history.slice(-MAX_HISTORY),
    minutes: state.minutes,
    seconds: state.seconds,
    isMuted: state.isMuted
  }
}

export function saveSnapshot(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSnapshot(state)))
  } catch {
    // storage full / private mode — scoreboard keeps working in-memory
  }
}

function parsePayload(data) {
  const teams = (Array.isArray(data.teams) ? data.teams : []).map(normalizeTeam).filter(Boolean)
  return {
    title: typeof data.title === 'string' ? data.title : '',
    teams,
    scoreButtons: Array.isArray(data.scoreButtons)
      ? normalizeScoreButtons(data.scoreButtons)
      : migrateLegacyScores(data.globalScores),
    branding: sanitizeBranding(data.branding),
    appearance: sanitizeAppearance(data.appearance),
    history: (Array.isArray(data.history) ? data.history : [])
      .filter((entry) => entry && typeof entry === 'object')
      .slice(-MAX_HISTORY),
    minutes: clampInt(data.minutes, 0, MAX_MINUTES, TIMER_DEFAULTS.minutes),
    seconds: clampInt(data.seconds, 0, MAX_SECONDS, TIMER_DEFAULTS.seconds),
    isMuted: data.isMuted === true
  }
}

/** Reads the v2 payload, transparently upgrading a v1 save on first run. */
export function readSnapshot() {
  let raw = null
  try {
    raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return null
  try {
    return parsePayload(JSON.parse(raw))
  } catch {
    return null
  }
}
