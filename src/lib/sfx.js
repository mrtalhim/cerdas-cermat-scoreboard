import { AUDIO_FILES } from '../config'

/**
 * SFX engine: one shared AudioContext plus pre-decoded buffers so sounds start instantly,
 * with HTMLAudio as a fallback when decoding fails or WebAudio is unavailable.
 */
export function createSfx() {
  const buffers = {}
  const elements = {}
  let context = null

  function ensureContext() {
    try {
      if (!context) {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext
        if (!AudioContextCtor) return null
        context = new AudioContextCtor()
      }
      return context
    } catch {
      return null
    }
  }

  function playElement(audio) {
    if (!audio) return
    try {
      audio.currentTime = 0
      const played = audio.play()
      if (played && typeof played.catch === 'function') played.catch(() => {})
    } catch {
      // autoplay blocked — the board keeps working silently
    }
  }

  function preload(base) {
    const ctx = ensureContext()
    if (!ctx) return
    for (const [key, file] of Object.entries(AUDIO_FILES)) {
      if (buffers[key]) continue
      fetch(`${base}${file}`)
        .then((response) => {
          if (!response.ok) throw new Error('sfx missing')
          return response.arrayBuffer()
        })
        .then((data) => ctx.decodeAudioData(data))
        .then((decoded) => {
          buffers[key] = decoded
        })
        .catch(() => {
          // keep the HTMLAudio fallback
        })
    }
  }

  function init() {
    // import.meta.env.BASE_URL has no trailing slash in production
    // (e.g. "/cerdas-cermat-scoreboard"), so normalize before joining.
    const rawBase = import.meta.env.BASE_URL || '/'
    const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
    for (const [key, file] of Object.entries(AUDIO_FILES)) {
      try {
        const audio = new Audio(`${base}${file}`)
        audio.preload = 'auto'
        elements[key] = audio
      } catch {
        elements[key] = null
      }
    }
    preload(base)
  }

  /**
   * @param {'correct'|'alarm'|'tick'} key
   * @param {{ isMuted?: boolean, force?: boolean }} options `force` plays even when muted
   */
  function play(key, { isMuted = false, force = false } = {}) {
    if (isMuted && !force) return
    const buffer = buffers[key]
    const ctx = ensureContext()
    if (buffer && ctx) {
      try {
        if (ctx.state === 'suspended') ctx.resume().catch(() => {})
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start(0)
        return
      } catch {
        // fall through to HTMLAudio
      }
    }
    playElement(elements[key])
  }

  return { init, play }
}
