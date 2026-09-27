<template>
  <!-- eslint-disable-next-line vue/no-v-html -- static literals from lib/icons.js, see the note there -->
  <svg
    v-html="markup"
    :class="['shrink-0', sizeClass]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  />
</template>

<script>
import { ICONS, ICON_SIZES, ICON_STROKE_WIDTH } from '../lib/icons'

export default {
  name: 'AppIcon',
  props: {
    name: { type: String, required: true },
    size: { type: String, default: 'md' }
  },
  computed: {
    markup() {
      return ICONS[this.name] ?? ''
    },
    sizeClass() {
      return ICON_SIZES[this.size] ?? ICON_SIZES.md
    },
    strokeWidth() {
      return ICON_STROKE_WIDTH
    }
  }
}
</script>
