<template>
  <transition name="fade">
    <div
      v-show="isOpen"
      class="fixed top-24 portrait:top-20 sm:top-36 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 sm:self-start z-20 flex flex-col bg-gray-200 dark:bg-slate-800 p-4 portrait:p-4 sm:p-8 gap-2 rounded-lg shadow-lg w-[min(24rem,calc(100vw-1rem))] max-h-[85dvh] portrait:max-h-[calc(100dvh-6rem)] overflow-y-auto"
    >
      <div class="flex flex-row gap-2 justify-end items-baseline">
        <h2 class="text-3xl sm:text-5xl text-black dark:text-white font-bold mb-4 w-full">
          Pengaturan
        </h2>
        <button
          @click="$emit('close')"
          class="absolute bg-gray-800 dark:bg-slate-700 text-white px-3 py-2 rounded-lg"
          aria-label="Tutup pengaturan"
        >
          &#10006;
        </button>
      </div>

      <nav class="flex flex-wrap gap-1 text-sm">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-3 py-1 rounded-lg touch-manipulation',
            activeTab === tab
              ? 'bg-gray-800 dark:bg-slate-600 text-white font-bold'
              : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200'
          ]"
        >
          {{ tab }}
        </button>
      </nav>

      <!-- ---------- Skor ---------- -->
      <div v-show="activeTab === 'Skor'" class="flex flex-col gap-3 text-left">
        <span class="text-black dark:text-white font-bold">
          Tombol Skor (nilai 0 akan disembunyikan)
        </span>
        <ul class="flex flex-col gap-2">
          <li
            v-for="(button, index) in scoreButtons"
            :key="button.id"
            class="flex flex-row items-center gap-1.5"
          >
            <input
              type="color"
              :value="swatch(button).swatch"
              :title="`Warna tombol ${index + 1} (${swatch(button).label})`"
              :aria-label="`Warna tombol ${index + 1}`"
              class="w-8 h-8 shrink-0 rounded border cursor-pointer bg-white"
              @input="patchButton(index, { color: pickColor($event.target.value) })"
            />
            <input
              :value="button.value"
              type="number"
              :aria-label="`Nilai tombol skor ${index + 1}`"
              class="w-20 sm:w-24 text-lg sm:text-xl text-center p-2 min-w-0 rounded-lg border"
              placeholder="Nilai"
              @input="patchButton(index, { value: toNumber($event.target.value) })"
            />
            <input
              :value="button.label"
              type="text"
              maxlength="12"
              :aria-label="`Label tombol skor ${index + 1}`"
              class="w-full text-base p-2 min-w-0 rounded-lg border"
              placeholder="Label (opsional)"
              @input="patchButton(index, { label: $event.target.value })"
            />
            <button
              @click="$emit('move-button', { index, delta: -1 })"
              :disabled="index === 0"
              class="px-2 py-1 rounded-lg bg-gray-300 dark:bg-slate-600 text-sm disabled:opacity-40 touch-manipulation min-h-[2.25rem] min-w-[2.25rem]"
              aria-label="Geser tombol ke atas"
            >
              &#9650;
            </button>
            <button
              @click="$emit('move-button', { index, delta: 1 })"
              :disabled="index === scoreButtons.length - 1"
              class="px-2 py-1 rounded-lg bg-gray-300 dark:bg-slate-600 text-sm disabled:opacity-40 touch-manipulation min-h-[2.25rem] min-w-[2.25rem]"
              aria-label="Geser tombol ke bawah"
            >
              &#9660;
            </button>
            <button
              @click="$emit('remove-button', index)"
              :disabled="scoreButtons.length <= 1"
              class="px-2 py-1 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40 touch-manipulation min-h-[2.25rem] min-w-[2.25rem]"
              aria-label="Hapus tombol skor"
            >
              &#10006;
            </button>
          </li>
        </ul>
        <div class="flex flex-wrap gap-2">
          <button
            @click="$emit('add-button')"
            :disabled="scoreButtons.length >= maxButtons"
            class="flex-1 bg-cc-accent text-white px-3 py-2 rounded-lg text-sm disabled:opacity-40 touch-manipulation"
          >
            + Tambah Tombol
          </button>
          <button
            @click="$emit('reset-buttons')"
            class="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm touch-manipulation"
          >
            Setel Ulang
          </button>
        </div>
      </div>

      <!-- ---------- Tampilan ---------- -->
      <div v-show="activeTab === 'Tampilan'" class="flex flex-col gap-3 text-left">
        <span class="text-black dark:text-white font-bold">Tema</span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="choice in themeChoices"
            :key="choice.value"
            @click="$emit('update-theme', choice.value)"
            :class="[
              'flex-1 px-3 py-2 rounded-lg text-sm touch-manipulation',
              appearance.theme === choice.value
                ? 'bg-gray-800 dark:bg-slate-600 text-white font-bold'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200'
            ]"
          >
            {{ choice.label }}
          </button>
        </div>

        <span class="text-black dark:text-white font-bold">Warna</span>
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="field in colorFields"
            :key="field.key"
            class="flex flex-row items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
          >
            <input
              type="color"
              :value="resolvedColors[field.key]"
              :aria-label="field.label"
              class="w-8 h-8 shrink-0 rounded border cursor-pointer bg-white"
              @input="$emit('update-color', { key: field.key, value: $event.target.value })"
            />
            <span class="flex-1">{{ field.label }}</span>
            <button
              @click="$emit('clear-color', field.key)"
              :disabled="!appearance.overrides?.[field.key]"
              class="px-2 py-1 rounded-lg bg-gray-300 dark:bg-slate-600 text-xs disabled:opacity-40 touch-manipulation min-h-[2rem]"
              title="Kembalikan ke bawaan tema"
            >
              &#8635;
            </button>
          </li>
        </ul>

        <label class="text-black dark:text-white font-bold" for="score-scale">
          Ukuran angka skor: {{ appearance.scoreScale.toFixed(2) }}&times;
        </label>
        <input
          id="score-scale"
          :value="appearance.scoreScale"
          type="range"
          :min="scoreScaleRange.min"
          :max="scoreScaleRange.max"
          :step="scoreScaleRange.step"
          class="w-full touch-manipulation"
          @input="$emit('update-score-scale', Number($event.target.value))"
        />

        <button
          @click="$emit('reset-appearance')"
          class="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm touch-manipulation"
        >
          Setel Ulang Tampilan
        </button>
      </div>

      <!-- ---------- Identitas ---------- -->
      <div v-show="activeTab === 'Identitas'" class="flex flex-col gap-2 text-left">
        <label class="text-black dark:text-white font-bold" for="brand-app-name"
          >Nama Aplikasi</label
        >
        <input
          id="brand-app-name"
          :value="branding.appName"
          type="text"
          maxlength="60"
          class="text-base p-2 rounded-lg border"
          @input="updateBranding('appName', $event.target.value)"
        />

        <label class="text-black dark:text-white font-bold" for="brand-title"> Judul Bawaan </label>
        <input
          id="brand-title"
          :value="branding.defaultTitle"
          type="text"
          maxlength="60"
          class="text-base p-2 rounded-lg border"
          @input="updateBranding('defaultTitle', $event.target.value)"
        />

        <label class="text-black dark:text-white font-bold" for="brand-description">
          Deskripsi
        </label>
        <input
          id="brand-description"
          :value="branding.description"
          type="text"
          maxlength="160"
          class="text-base p-2 rounded-lg border"
          @input="updateBranding('description', $event.target.value)"
        />

        <label class="text-black dark:text-white font-bold" for="brand-theme-color">
          Warna Browser
        </label>
        <input
          id="brand-theme-color"
          :value="branding.themeColor"
          type="color"
          class="w-16 h-9 rounded border cursor-pointer bg-white"
          @input="updateBranding('themeColor', $event.target.value)"
        />

        <label class="text-black dark:text-white font-bold" for="brand-logo">URL Logo</label>
        <input
          id="brand-logo"
          :value="branding.logoUrl"
          type="text"
          maxlength="500"
          class="text-base p-2 rounded-lg border"
          placeholder="https://... (opsional)"
          @input="updateBranding('logoUrl', $event.target.value)"
        />

        <button
          @click="$emit('reset-branding')"
          class="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm touch-manipulation"
        >
          Setel Ulang Identitas
        </button>
      </div>

      <!-- ---------- Umum ---------- -->
      <div v-show="activeTab === 'Umum'" class="flex flex-col gap-2 text-left">
        <button
          @click="$emit('clear-teams')"
          class="bg-red-600 text-white text-center p-2 rounded-lg"
        >
          Hapus Semua Tim
        </button>
        <button
          @click="$emit('test-sound')"
          class="bg-slate-600 text-white text-center p-2 rounded-lg"
        >
          &#128266; Tes Suara
        </button>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          Riwayat perubahan skor tersimpan otomatis di perangkat ini.
        </p>
      </div>
    </div>
  </transition>
</template>

<script>
import { MAX_SCORE_BUTTONS, SCORE_SCALE_RANGE } from '../config'
import { colorClasses, matchColorKey } from '../lib/scoreButtons'

const TABS = ['Skor', 'Tampilan', 'Identitas', 'Umum']

export default {
  name: 'SettingsPanel',
  props: {
    isOpen: { type: Boolean, default: false },
    scoreButtons: { type: Array, required: true },
    branding: { type: Object, required: true },
    appearance: { type: Object, required: true },
    resolvedColors: { type: Object, required: true },
    colorFields: { type: Array, required: true },
    themeChoices: { type: Array, required: true }
  },
  emits: [
    'close',
    'add-button',
    'remove-button',
    'move-button',
    'update-button',
    'reset-buttons',
    'update-theme',
    'update-color',
    'clear-color',
    'update-score-scale',
    'reset-appearance',
    'update-branding',
    'reset-branding',
    'clear-teams',
    'test-sound'
  ],
  data() {
    return {
      activeTab: TABS[0],
      tabs: TABS,
      maxButtons: MAX_SCORE_BUTTONS,
      scoreScaleRange: SCORE_SCALE_RANGE
    }
  },
  methods: {
    swatch(button) {
      return colorClasses(button.color)
    },
    pickColor(hex) {
      return matchColorKey(hex) ?? hex
    },
    toNumber(value) {
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : 0
    },
    patchButton(index, patch) {
      this.$emit('update-button', { index, patch })
    },
    updateBranding(key, value) {
      this.$emit('update-branding', { key, value })
    }
  }
}
</script>
