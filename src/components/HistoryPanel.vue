<template>
  <transition name="fade">
    <div
      v-show="isOpen"
      class="fixed top-24 portrait:top-20 sm:top-36 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 sm:self-end z-20 flex flex-col bg-cc-surface text-cc-surface-ink p-4 sm:p-6 gap-2 rounded-lg shadow-lg w-[min(20rem,calc(100vw-1rem))] max-h-[70vh] max-h-[70dvh] portrait:max-h-[calc(100dvh-6rem)] overflow-hidden text-left"
    >
      <div class="flex flex-row gap-2 justify-between items-center">
        <h2 class="text-2xl font-bold">Riwayat</h2>
        <button
          @click="$emit('close')"
          class="btn bg-cc-control text-cc-control-ink"
          aria-label="Tutup riwayat"
        >
          <AppIcon name="x" />
        </button>
      </div>
      <div class="flex gap-2">
        <button
          @click="$emit('undo')"
          :disabled="!canUndo"
          class="btn btn-block bg-cc-control text-cc-control-ink"
        >
          Urutkan
        </button>
        <button
          @click="$emit('redo')"
          :disabled="!canRedo"
          class="btn btn-block bg-cc-control text-cc-control-ink"
        >
          Ulangi
        </button>
        <button
          @click="$emit('clear')"
          :disabled="!hasEntries"
          class="btn btn-block bg-cc-danger text-cc-danger-ink"
        >
          Hapus
        </button>
      </div>
      <p v-if="entries.length === 0" class="text-cc-muted text-sm">
        Belum ada perubahan. Perubahan skor, tambah dan hapus tim akan muncul di sini.
      </p>
      <ol v-else class="selectable overflow-y-auto min-h-0 flex flex-col gap-1 pr-1">
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="text-sm border-b border-cc-surface-2 py-1 flex justify-between gap-2"
        >
          <span>{{ describeEntry(entry) }}</span>
          <span class="text-cc-muted shrink-0">{{ formatEntryTime(entry.at) }}</span>
        </li>
      </ol>
    </div>
  </transition>
</template>

<script>
import { describeEntry, formatEntryTime } from '../lib/historyLog'
import AppIcon from './AppIcon.vue'

export default {
  name: 'HistoryPanel',
  components: { AppIcon },
  props: {
    isOpen: { type: Boolean, default: false },
    entries: { type: Array, required: true },
    canUndo: { type: Boolean, default: false },
    canRedo: { type: Boolean, default: false }
  },
  emits: ['close', 'undo', 'redo', 'clear'],
  computed: {
    hasEntries() {
      return this.entries.length > 0 || this.canRedo
    }
  },
  methods: { describeEntry, formatEntryTime }
}
</script>
