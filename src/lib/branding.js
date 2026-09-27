import { BRANDING_DEFAULTS } from '../config'

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export function isHexColor(value) {
  return typeof value === 'string' && HEX.test(value.trim())
}

export function sanitizeBranding(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    appName: pick(source.appName, BRANDING_DEFAULTS.appName),
    description: pick(source.description, BRANDING_DEFAULTS.description),
    defaultTitle: pick(source.defaultTitle, BRANDING_DEFAULTS.defaultTitle),
    themeColor: isHexColor(source.themeColor) ? source.themeColor : BRANDING_DEFAULTS.themeColor,
    logoUrl: pickUrl(source.logoUrl)
  }
}

function pick(value, fallback) {
  return typeof value === 'string' ? value : fallback
}

function pickUrl(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  // Only same-origin-ish references: a data/blob URL or an http(s)/relative path.
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed
  if (/^(data:|blob:|\/|\.\/|\.\.\/)/i.test(trimmed)) return trimmed
  return ''
}

function setMeta(selector, content) {
  if (!content) return
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute('content', content)
}

/** Keeps <title>, theme-color and the social meta tags in sync with the organiser's settings. */
export function applyBranding({ branding, title }) {
  if (typeof document === 'undefined') return
  const appName = branding.appName.trim()
  const boardTitle = (title ?? '').trim()
  document.title = boardTitle || appName || BRANDING_DEFAULTS.appName

  setMeta('meta[name="description"]', branding.description)
  setMeta('meta[name="theme-color"]', branding.themeColor)
  setMeta('meta[property="og:title"]', boardTitle || appName)
  setMeta('meta[property="og:description"]', branding.description)
  setMeta('meta[property="og:site_name"]', appName)
}
