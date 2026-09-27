<template>
  <div
    class="flex flex-row flex-wrap gap-1.5 portrait:gap-1.5 sm:gap-2 items-center justify-center m-1 sm:m-2 w-full max-w-4xl px-1"
  >
    <button @click="$emit('open-settings')" class="btn bg-cc-control text-cc-control-ink">
      Pengaturan
    </button>
    <button @click="$emit('add-team')" class="btn bg-cc-accent text-cc-accent-ink font-bold">
      Tambah Tim
    </button>
    <button
      @click="$emit('open-history')"
      class="btn bg-cc-control text-cc-control-ink relative"
      aria-label="Buka riwayat skor"
    >
      Riwayat
      <span
        v-if="historyCount"
        class="absolute -top-2 -right-2 bg-cc-leader text-cc-leader-ink text-xs font-bold rounded-full px-2 py-0.5"
      >
        {{ historyCount }}
      </span>
    </button>
    <button
      @click="$emit('undo')"
      :disabled="!canUndo"
      title="Urungkan perubahan terakhir (Ctrl+Z)"
      class="btn bg-cc-control text-cc-control-ink"
    >
      Urungkan
    </button>
    <button
      @click="$emit('redo')"
      :disabled="!canRedo"
      title="Ulangi (Ctrl+Shift+Z)"
      class="btn bg-cc-control text-cc-control-ink"
    >
      Ulangi
    </button>
    <button
      @click="$emit('celebrate')"
      :disabled="!hasTeams"
      title="Rayakan tim yang memimpin"
      class="btn bg-cc-leader text-cc-leader-ink font-bold"
    >
      <AppIcon name="trophy" />
      Pemenang
    </button>
    <button
      @click="$emit('present')"
      title="Mode presentasi: sembunyikan toolbar (F)"
      class="btn bg-cc-control text-cc-control-ink"
    >
      <AppIcon name="presentation" />
      Presentasi
    </button>
    <button
      @click="$emit('toggle-mute')"
      :title="isMuted ? 'Nyalakan suara' : 'Bisukan suara'"
      class="btn bg-cc-control text-cc-control-ink"
    >
      <AppIcon :name="isMuted ? 'volume-x' : 'volume-2'" />
      {{ isMuted ? 'Bisukan' : 'Suara' }}
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
        inputmode="numeric"
        pattern="[0-9]*"
        min="0"
        :max="maxMinutes"
        placeholder="Menit"
        class="w-16 sm:w-20 text-base text-cc-surface-ink bg-cc-surface-2 text-end p-2 border rounded-lg"
        @focus="$event.target.select()"
        @input="$emit('update:minutes', Number($event.target.value))"
      />
      <span aria-hidden="true">m</span>
      <label class="sr-only" for="timer-seconds">Detik</label>
      <input
        id="timer-seconds"
        :value="seconds"
        type="number"
        inputmode="numeric"
        pattern="[0-9]*"
        min="0"
        :max="maxSeconds"
        placeholder="Detik"
        class="w-16 sm:w-20 text-base text-cc-surface-ink bg-cc-surface-2 text-end p-2 border rounded-lg"
        @focus="$event.target.select()"
        @input="$emit('update:seconds', Number($event.target.value))"
      />
      <span aria-hidden="true">d</span>
      <button @click="$emit('start-countdown')" class="btn bg-cc-surface-2 text-cc-surface-ink">
        Mulai
      </button>
    </div>
  </div>
</template>

<script>
import { MAX_MINUTES, MAX_SECONDS } from '../config'
import AppIcon from './AppIcon.vue'

export default {
  name: 'AppToolbar',
  components: { AppIcon },
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
