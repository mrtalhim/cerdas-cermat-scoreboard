<template>
  <div
    v-if="isCountingDown"
    class="fixed inset-0 z-30 bg-cc-overlay flex flex-col items-center justify-center gap-4 p-4"
  >
    <div
      class="text-white font-bold tabular-nums leading-none text-center text-[clamp(2.75rem,17vw,9rem)] portrait:text-[clamp(2.75rem,20vw,6.5rem)] countdown-pulse"
      aria-live="assertive"
    >
      {{ formatted }}
    </div>
    <div class="flex flex-wrap gap-2 justify-center portrait:gap-3">
      <button
        v-if="!isPaused"
        @click="$emit('pause')"
        class="bg-cc-leader text-black font-bold px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem] portrait:px-6"
      >
        Jeda
      </button>
      <button
        v-else
        @click="$emit('resume')"
        class="bg-cc-accent text-white px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem] portrait:px-6"
      >
        Lanjut
      </button>
      <button
        @click="$emit('reset')"
        class="bg-red-600 text-white px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem] portrait:px-6"
      >
        Ulang
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CountdownOverlay',
  props: {
    formatted: { type: String, required: true },
    isCountingDown: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false }
  },
  emits: ['pause', 'resume', 'reset']
}
</script>
