<template>
  <div
    class="flex flex-row flex-wrap gap-1.5 portrait:gap-1.5 sm:gap-2 items-center justify-center m-1 sm:m-2 w-full max-w-4xl px-1"
  >
    <button
      @click="$emit('open-settings')"
      class="bg-gray-800 dark:bg-slate-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]"
    >
      Pengaturan
    </button>
    <button
      @click="$emit('add-team')"
      class="bg-cc-accent text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg transition-all duration-100 hover:scale-105 active:scale-105 touch-manipulation portrait:min-h-[2.75rem]"
    >
      Tambah Tim
    </button>
    <button
      @click="$emit('open-history')"
      class="bg-slate-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg relative touch-manipulation portrait:min-h-[2.75rem]"
      aria-label="Buka riwayat skor"
    >
      Riwayat
      <span
        v-if="historyCount"
        class="absolute -top-2 -right-2 bg-cc-leader text-black text-xs font-bold rounded-full px-2 py-0.5"
      >
        {{ historyCount }}
      </span>
    </button>
    <button
      @click="$emit('undo')"
      :disabled="!canUndo"
      title="Urungkan perubahan terakhir (Ctrl+Z)"
      class="bg-indigo-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation portrait:min-h-[2.75rem]"
    >
      Urungkan
    </button>
    <button
      @click="$emit('redo')"
      :disabled="!canRedo"
      title="Ulangi (Ctrl+Shift+Z)"
      class="bg-indigo-400 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation portrait:min-h-[2.75rem]"
    >
      Ulangi
    </button>
    <button
      @click="$emit('celebrate')"
      :disabled="!hasTeams"
      title="Rayakan tim yang memimpin"
      class="bg-cc-leader text-black font-bold text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100 hover:scale-105 touch-manipulation portrait:min-h-[2.75rem]"
    >
      &#127881; Pemenang
    </button>
    <button
      @click="$emit('present')"
      title="Mode presentasi: sembunyikan toolbar (F)"
      class="bg-slate-800 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]"
    >
      &#x26F6; Presentasi
    </button>
    <button
      @click="$emit('toggle-mute')"
      :title="isMuted ? 'Nyalakan suara' : 'Bisukan suara'"
      class="bg-slate-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]"
    >
      {{ isMuted ? '&#128263; Bisukan' : '&#128266; Suara' }}
    </button>
    <div
      v-if="!isCountingDown"
      class="flex flex-row flex-wrap gap-1.5 sm:gap-2 items-center justify-center portrait:w-full"
    >
      <label class="sr-only" for="timer-minutes">Menit</label>
      <input
        id="timer-minutes"
        :value="minutes"
        type="number"
        min="0"
        :max="maxMinutes"
        placeholder="Menit"
        class="w-16 sm:w-20 text-base text-black bg-white text-end p-2 border rounded-lg"
        @input="$emit('update:minutes', Number($event.target.value))"
      />
      <span aria-hidden="true">m</span>
      <label class="sr-only" for="timer-seconds">Detik</label>
      <input
        id="timer-seconds"
        :value="seconds"
        type="number"
        min="0"
        :max="maxSeconds"
        placeholder="Detik"
        class="w-16 sm:w-20 text-base text-black bg-white text-end p-2 border rounded-lg"
        @input="$emit('update:seconds', Number($event.target.value))"
      />
      <span aria-hidden="true">d</span>
      <button
        @click="$emit('start-countdown')"
        class="bg-cc-accent text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]"
      >
        Mulai
      </button>
    </div>
  </div>
</template>

<script>
import { MAX_MINUTES, MAX_SECONDS } from '../config'

export default {
  name: 'AppToolbar',
  props: {
    canUndo: { type: Boolean, default: false },
    canRedo: { type: Boolean, default: false },
    hasTeams: { type: Boolean, default: false },
    historyCount: { type: Number, default: 0 },
    isCountingDown: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    minutes: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 }
  },
  emits: [
    'open-settings',
    'add-team',
    'open-history',
    'undo',
    'redo',
    'celebrate',
    'present',
    'toggle-mute',
    'start-countdown',
    'update:minutes',
    'update:seconds'
  ],
  data() {
    return { maxMinutes: MAX_MINUTES, maxSeconds: MAX_SECONDS }
  }
}
</script>
