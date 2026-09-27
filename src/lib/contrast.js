const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

const INK_HEX = { white: '#ffffff', black: '#000000' }

export function isHexColor(value) {
  return typeof value === 'string' && HEX.test(value.trim())
}

export function expandHex(hex) {
  const trimmed = hex.trim()
  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
  }
  return trimmed
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((p, q) => q - p)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Tailwind's 500 shades are all too light for white label text at 16px, which is below
 * WCAG's "large text" threshold and so needs 4.5:1 rather than 3:1. Slate is the only
 * palette entry where white wins.
 */
export function bestInkFor(backgroundHex) {
  if (!isHexColor(backgroundHex)) return 'text-black'
  const hex = expandHex(backgroundHex)
  return contrastRatio(hex, INK_HEX.white) >= contrastRatio(hex, INK_HEX.black)
    ? 'text-white'
    : 'text-black'
}
