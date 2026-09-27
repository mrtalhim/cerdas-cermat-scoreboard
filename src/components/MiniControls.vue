<template>
  <div
    class="fixed bottom-3 right-3 z-40 flex gap-2 opacity-70 hover:opacity-100 focus-within:opacity-100"
  >
    <button
      @click="$emit('undo')"
      :disabled="!canUndo"
      title="Urungkan (Ctrl+Z)"
      class="btn btn-pill shadow-lg bg-cc-control text-cc-control-ink"
    >
      <AppIcon name="undo" />
      Urungkan
    </button>
    <button
      v-if="!isCountingDown"
      @click="$emit('start-countdown')"
      title="Mulai pewaktu"
      class="btn btn-pill shadow-lg bg-cc-surface-2 text-cc-surface-ink"
    >
      <AppIcon name="timer" />
      Mulai
    </button>
    <button
      @click="$emit('close')"
      title="Keluar mode presentasi (Esc)"
      class="btn btn-pill shadow-lg bg-cc-control text-cc-control-ink"
    >
      <AppIcon name="x" />
      Keluar
    </button>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'

export default {
  name: 'MiniControls',
  components: { AppIcon },
  props: {
    canUndo: { type: Boolean, default: false },
    isCountingDown: { type: Boolean, default: false }
  },
  emits: ['undo', 'start-countdown', 'close']
}
</script>
