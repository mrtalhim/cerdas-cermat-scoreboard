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
      &#8617; Urungkan
    </button>
    <button
      v-if="!isCountingDown"
      @click="$emit('start-countdown')"
      title="Mulai pewaktu"
      class="btn btn-pill shadow-lg bg-cc-surface-2 text-cc-surface-ink"
    >
      &#9201; Mulai
    </button>
    <button
      @click="$emit('close')"
      title="Keluar mode presentasi (Esc)"
      class="btn btn-pill shadow-lg bg-cc-control text-cc-control-ink"
    >
      &#10005; Keluar
    </button>
  </div>
</template>

<script>
export default {
  name: 'MiniControls',
  props: {
    canUndo: { type: Boolean, default: false },
    isCountingDown: { type: Boolean, default: false }
  },
  emits: ['undo', 'start-countdown', 'close']
}
</script>
