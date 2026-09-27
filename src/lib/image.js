import {
  BACKGROUND_KEEP_AS_IS_BYTES,
  BACKGROUND_LARGE_BYTES,
  BACKGROUND_MAX_DIMENSION,
  BACKGROUND_MAX_UPLOAD_BYTES,
  BACKGROUND_REENCODE_QUALITY
} from '../config'

// Only same-origin-ish references reach the DOM. Protocol-relative `//host` is rejected
// on purpose: a background image is not worth opening a cross-origin hole for. The data
// URL form is restricted to raster types, which is all prepareBackgroundImage emits.
const DATA_IMAGE = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i
const MAX_URL_LENGTH = 12 * 1024 * 1024

export function sanitizeImageUrl(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return ''
  if (DATA_IMAGE.test(trimmed)) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^\/(?!\/)/.test(trimmed)) return trimmed
  return ''
}

/** Wraps a URL in a CSS `url()` token without letting quotes or parens break out. */
export function toCssUrl(value) {
  const safe = String(value).replace(/["'\\()]/g, '')
  return `url("${safe}")`
}

let webpSupport = null

function supportsWebp() {
  if (webpSupport !== null) return webpSupport
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    webpSupport = false
  }
  return webpSupport
}

export function dataUrlBytes(dataUrl) {
  const start = dataUrl.indexOf(',')
  if (start === -1) return dataUrl.length
  return Math.round(((dataUrl.length - start - 1) * 3) / 4)
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => viaElement(file))
  }
  return viaElement(file)
}

function viaElement(file) {
  const objectUrl = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('decode failed'))
    }
    image.src = objectUrl
  })
}

/**
 * Turns a picked file into a data URL that actually fits in localStorage: already-small
 * images are kept byte-for-byte, anything larger is downscaled to
 * BACKGROUND_MAX_DIMENSION and re-encoded (WebP when the browser supports it, else JPEG).
 *
 * @returns {Promise<{ok: true, dataUrl: string, bytes: number, width: number,
 *   height: number, reencoded: boolean} | {ok: false, error: string}>}
 */
export async function prepareBackgroundImage(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return { ok: false, error: 'File yang dipilih bukan gambar.' }
  }
  if (file.size > BACKGROUND_MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Gambar terlalu besar (${formatBytes(file.size)}). Maksimal ${formatBytes(
        BACKGROUND_MAX_UPLOAD_BYTES
      )}.`
    }
  }

  if (file.size <= BACKGROUND_KEEP_AS_IS_BYTES) {
    try {
      const dataUrl = await readAsDataUrl(file)
      return {
        ok: true,
        dataUrl,
        bytes: dataUrlBytes(dataUrl),
        width: 0,
        height: 0,
        reencoded: false
      }
    } catch {
      return { ok: false, error: 'Gagal membaca file.' }
    }
  }

  let source
  try {
    source = await loadBitmap(file)
  } catch {
    return { ok: false, error: 'Gagal membuka gambar. Formatnya mungkin tidak didukung.' }
  }

  const sourceWidth = source.width || source.naturalWidth || 0
  const sourceHeight = source.height || source.naturalHeight || 0
  if (!sourceWidth || !sourceHeight) {
    source.close?.()
    return { ok: false, error: 'Dimensi gambar tidak terbaca.' }
  }

  const longestEdge = Math.max(sourceWidth, sourceHeight)
  const scale = Math.min(1, BACKGROUND_MAX_DIMENSION / longestEdge)
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  try {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return { ok: false, error: 'Browser tidak mendukung olah gambar.' }
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(source, 0, 0, width, height)

    const mimeType = supportsWebp() ? 'image/webp' : 'image/jpeg'
    const dataUrl = canvas.toDataURL(mimeType, BACKGROUND_REENCODE_QUALITY)
    if (!dataUrl.startsWith('data:image/')) {
      return { ok: false, error: 'Browser gagal mengubah gambar.' }
    }
    return { ok: true, dataUrl, bytes: dataUrlBytes(dataUrl), width, height, reencoded: true }
  } catch {
    return { ok: false, error: 'Gagal menyimpan gambar.' }
  } finally {
    source.close?.()
  }
}

export function isLargeBackground(bytes) {
  return bytes > BACKGROUND_LARGE_BYTES
}
