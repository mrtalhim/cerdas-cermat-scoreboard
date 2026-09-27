<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <!-- Board color first, then the image, then the dim scrim: all below the flash -->
    <div class="absolute inset-0" :style="imageStyle" />
    <div
      v-if="hasImage"
      class="absolute inset-0 bg-black"
      :style="{ opacity: appearance.backgroundDim }"
    />
    <!-- Always mounted so the flash can fade both in and out; a v-if would just pop. -->
    <div class="absolute inset-0" :style="flashStyle" />
  </div>
</template>

<script>
import { MOTION } from '../config'
import { toCssUrl } from '../lib/image'

export default {
  name: 'BoardBackground',
  props: {
    appearance: { type: Object, required: true },
    isFlashing: { type: Boolean, default: false }
  },
  computed: {
    hasImage() {
      return Boolean(this.appearance.backgroundImage)
    },
    imageStyle() {
      if (!this.hasImage) return { backgroundColor: 'var(--cc-board)' }
      return {
        backgroundColor: 'var(--cc-board)',
        backgroundImage: toCssUrl(this.appearance.backgroundImage),
        backgroundSize: this.appearance.backgroundFit,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }
    },
    // Always applied to a mounted element so the flash fades in AND back out.
    // A v-if would pop in with no transition at all.
    flashStyle() {
      return {
        backgroundColor: 'var(--cc-negative)',
        opacity: this.isFlashing ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: `${MOTION.flash}ms`,
        transitionTimingFunction: 'ease'
      }
    }
  }
}
</script>
