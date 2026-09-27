<template>
  <transition name="fade">
    <div
      v-show="isOpen"
      class="fixed top-24 portrait:top-20 sm:top-36 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 sm:self-start z-20 flex flex-col bg-cc-surface text-cc-surface-ink p-4 portrait:p-4 sm:p-8 gap-2 rounded-lg shadow-lg w-[min(24rem,calc(100vw-1rem))] max-h-[85dvh] portrait:max-h-[calc(100dvh-6rem)] overflow-y-auto"
    >
      <div class="flex flex-row gap-2 justify-end items-baseline">
        <h2 class="text-3xl sm:text-5xl font-bold mb-4 w-full">Pengaturan</h2>
        <button
          @click="$emit('close')"
          class="absolute bg-cc-control text-cc-control-ink px-3 py-2 rounded-lg"
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
              ? 'bg-cc-control text-cc-control-ink font-bold'
              : 'bg-cc-surface-2 text-cc-surface-ink'
          ]"
        >
          {{ tab }}
        </button>
      </nav>

      <!-- ---------- Skor ---------- -->
      <div v-show="activeTab === 'Skor'" class="flex flex-col gap-3 text-left">
        <span class="font-bold"> Tombol Skor (nilai 0 akan disembunyikan) </span>
        <ul class="flex flex-col gap-2">
          <li
            v-for="(button, index) in scoreButtons"
            :key="button.id"
            class="flex flex-col gap-1.5 p-2 rounded-lg bg-cc-surface-2"
          >
            <div class="flex flex-row items-center gap-1.5">
              <input
                type="color"
                :value="buttonSwatch(button).swatch"
                :title="`Warna tombol ${index + 1} (${buttonSwatch(button).label})`"
                :aria-label="`Warna tombol ${index + 1}`"
                class="w-9 h-9 shrink-0 rounded border cursor-pointer bg-white"
                @input="patchButton(index, { color: pickColor($event.target.value) })"
              />
              <input
                :value="button.value"
                type="number"
                :aria-label="`Nilai tombol skor ${index + 1}`"
                class="w-20 shrink-0 text-lg sm:text-xl font-bold text-center p-2 min-w-0 rounded-lg border"
                placeholder="Nilai"
                @input="patchButton(index, { value: toNumber($event.target.value) })"
              />
              <input
                :value="button.label"
                type="text"
                maxlength="12"
                :aria-label="`Label tombol skor ${index + 1}`"
                class="flex-1 text-base p-2 min-w-0 rounded-lg border"
                placeholder="Label (opsional)"
                @input="patchButton(index, { label: $event.target.value })"
              />
            </div>
            <div class="flex flex-row items-center gap-1.5">
              <input
                type="color"
                :value="inkSwatch(button)"
                :title="`Warna teks tombol ${index + 1} (${inkLabel(button)})`"
                :aria-label="`Warna teks tombol skor ${index + 1}`"
                class="w-8 h-8 shrink-0 rounded border cursor-pointer bg-white"
                @input="patchButton(index, { textColor: pickInk($event.target.value) })"
              />
              <button
                @click="patchButton(index, { textColor: '' })"
                :disabled="!button.textColor"
                class="px-2 py-1 rounded-lg bg-cc-control text-cc-control-ink text-xs disabled:opacity-40 touch-manipulation min-h-[2rem] min-w-[2rem] shrink-0"
                title="Biarkan otomatis (pilih hitam atau putih yang paling kontras)"
              >
                &#8635;
              </button>
              <button
                :class="[
                  'flex-1 min-w-0 truncate text-sm font-bold px-2 py-1 rounded-lg',
                  buttonSwatch(button).bg,
                  buttonInkClass(button)
                ]"
                :style="[buttonStyle(button.color), buttonInkStyle(button)]"
                disabled
              >
                {{ previewText(button) }}
              </button>
              <button
                @click="$emit('move-button', { index, delta: -1 })"
                :disabled="index === 0"
                class="px-2 py-1 rounded-lg bg-cc-control text-cc-control-ink text-sm disabled:opacity-40 touch-manipulation min-h-[2.25rem] min-w-[2.25rem] shrink-0"
                aria-label="Geser tombol ke atas"
              >
                &#9650;
              </button>
              <button
                @click="$emit('move-button', { index, delta: 1 })"
                :disabled="index === scoreButtons.length - 1"
                class="px-2 py-1 rounded-lg bg-cc-control text-cc-control-ink text-sm disabled:opacity-40 touch-manipulation min-h-[2.25rem] min-w-[2.25rem] shrink-0"
                aria-label="Geser tombol ke bawah"
              >
                &#9660;
              </button>
              <button
                @click="$emit('remove-button', index)"
                :disabled="scoreButtons.length <= 1"
                class="px-2 py-1 rounded-lg bg-cc-danger text-cc-danger-ink text-sm disabled:opacity-40 touch-manipulation min-h-[2.25rem] min-w-[2.25rem] shrink-0"
                aria-label="Hapus tombol skor"
              >
                &#10006;
              </button>
            </div>
          </li>
        </ul>
        <div class="flex flex-wrap gap-2">
          <button
            @click="$emit('add-button')"
            :disabled="scoreButtons.length >= maxButtons"
            class="flex-1 bg-cc-accent text-cc-accent-ink px-3 py-2 rounded-lg text-sm disabled:opacity-40 touch-manipulation"
          >
            + Tambah Tombol
          </button>
          <button
            @click="$emit('reset-buttons')"
            class="flex-1 bg-cc-control text-cc-control-ink px-3 py-2 rounded-lg text-sm touch-manipulation"
          >
            Setel Ulang
          </button>
        </div>
      </div>

      <!-- ---------- Tampilan ---------- -->
      <div v-show="activeTab === 'Tampilan'" class="flex flex-col gap-3 text-left">
        <span class="font-bold">Tema</span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="choice in themeChoices"
            :key="choice.value"
            @click="$emit('update-theme', choice.value)"
            :class="[
              'flex-1 px-3 py-2 rounded-lg text-sm touch-manipulation',
              appearance.theme === choice.value
                ? 'bg-cc-control text-cc-control-ink font-bold'
                : 'bg-cc-surface-2 text-cc-surface-ink'
            ]"
          >
            {{ choice.label }}
          </button>
        </div>

        <span class="font-bold">Warna</span>
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="field in colorFields"
            :key="field.key"
            class="flex flex-row items-center gap-2 text-sm text-cc-muted"
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
              class="px-2 py-1 rounded-lg bg-cc-control text-cc-control-ink text-xs disabled:opacity-40 touch-manipulation min-h-[2rem]"
              title="Kembalikan ke bawaan tema"
            >
              &#8635;
            </button>
          </li>
        </ul>

        <label class="font-bold" for="score-scale">
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
          class="bg-cc-control text-cc-control-ink px-3 py-2 rounded-lg text-sm touch-manipulation"
        >
          Setel Ulang Tampilan
        </button>
      </div>

      <!-- ---------- Latar ---------- -->
      <div v-show="activeTab === 'Latar'" class="flex flex-col gap-3 text-left">
        <p
          v-if="storageError"
          class="bg-cc-danger text-cc-danger-ink text-sm p-2 rounded-lg"
          role="alert"
        >
          Penyimpanan penuh — pengaturan terbaru tidak tersimpan. Kurangi ukuran gambar latar atau
          hapus riwayatnya.
        </p>

        <div
          v-if="backgroundError"
          class="bg-cc-danger text-cc-danger-ink text-sm p-2 rounded-lg"
          role="alert"
        >
          {{ backgroundError }}
        </div>

        <div
          v-if="backgroundInfo"
          class="bg-cc-surface-2 text-cc-surface-ink text-sm p-2 rounded-lg"
          role="status"
        >
          {{ backgroundInfo }}
        </div>

        <div class="border-2 border-dashed border-cc-muted rounded-lg p-3 text-center">
          <input
            id="background-file"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="pickFile"
          />
          <label
            for="background-file"
            class="block cursor-pointer bg-cc-accent text-cc-accent-ink text-sm px-3 py-2 rounded-lg touch-manipulation"
          >
            {{ isUploading ? 'Memproses…' : 'Pilih Gambar' }}
          </label>
          <p class="text-xs text-cc-muted mt-2">
            Disimpan di perangkat ini. Gambar besar otomatis dikecilkan agar muat.
          </p>
        </div>

        <span class="font-bold">Atau pakai URL</span>
        <input
          v-model="backgroundUrlDraft"
          type="url"
          maxlength="1000"
          class="text-base p-2 rounded-lg border"
          placeholder="https://… (opsional)"
          @change="commitBackgroundUrl"
          @keyup.enter="commitBackgroundUrl"
        />

        <template v-if="appearance.backgroundImage">
          <div class="flex gap-2">
            <button
              @click="$emit('remove-background')"
              class="flex-1 bg-cc-danger text-cc-danger-ink px-3 py-2 rounded-lg text-sm touch-manipulation"
            >
              Hapus Latar
            </button>
            <span class="flex-1 self-center text-xs text-cc-muted text-end">
              {{ backgroundSizeLabel }}
            </span>
          </div>

          <span class="font-bold">Bentuk gambar</span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="choice in fitChoices"
              :key="choice.value"
              @click="$emit('update-background-fit', choice.value)"
              :class="[
                'flex-1 px-3 py-2 rounded-lg text-sm touch-manipulation',
                appearance.backgroundFit === choice.value
                  ? 'bg-cc-control text-cc-control-ink font-bold'
                  : 'bg-cc-surface-2 text-cc-surface-ink'
              ]"
            >
              {{ choice.label }}
            </button>
          </div>

          <label class="font-bold" for="background-dim">
            Gelapkan gambar: {{ Math.round(appearance.backgroundDim * 100) }}%
          </label>
          <input
            id="background-dim"
            :value="appearance.backgroundDim"
            type="range"
            :min="dimRange.min"
            :max="dimRange.max"
            :step="dimRange.step"
            class="w-full touch-manipulation"
            @input="$emit('update-background-dim', Number($event.target.value))"
          />
        </template>
      </div>

      <!-- ---------- Identitas ---------- -->
      <div v-show="activeTab === 'Identitas'" class="flex flex-col gap-2 text-left">
        <label class="font-bold" for="brand-app-name">Nama Aplikasi</label>
        <input
          id="brand-app-name"
          :value="branding.appName"
          type="text"
          maxlength="60"
          class="text-base p-2 rounded-lg border"
          @input="updateBranding('appName', $event.target.value)"
        />

        <label class="font-bold" for="brand-title"> Judul Bawaan </label>
        <input
          id="brand-title"
          :value="branding.defaultTitle"
          type="text"
          maxlength="60"
          class="text-base p-2 rounded-lg border"
          @input="updateBranding('defaultTitle', $event.target.value)"
        />

        <label class="font-bold" for="brand-description"> Deskripsi </label>
        <input
          id="brand-description"
          :value="branding.description"
          type="text"
          maxlength="160"
          class="text-base p-2 rounded-lg border"
          @input="updateBranding('description', $event.target.value)"
        />

        <label class="font-bold" for="brand-theme-color"> Warna Browser </label>
        <input
          id="brand-theme-color"
          :value="branding.themeColor"
          type="color"
          class="w-16 h-9 rounded border cursor-pointer bg-white"
          @input="updateBranding('themeColor', $event.target.value)"
        />

        <label class="font-bold" for="brand-logo">URL Logo</label>
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
          class="bg-cc-control text-cc-control-ink px-3 py-2 rounded-lg text-sm touch-manipulation"
        >
          Setel Ulang Identitas
        </button>
      </div>

      <!-- ---------- Umum ---------- -->
      <div v-show="activeTab === 'Umum'" class="flex flex-col gap-2 text-left">
        <button
          @click="$emit('clear-teams')"
          class="bg-cc-danger text-cc-danger-ink text-center p-2 rounded-lg"
        >
          Hapus Semua Tim
        </button>
        <button
          @click="$emit('test-sound')"
          class="bg-cc-control text-cc-control-ink text-center p-2 rounded-lg"
        >
          &#128266; Tes Suara
        </button>
        <p class="text-xs text-cc-muted">
          Riwayat perubahan skor tersimpan otomatis di perangkat ini.
        </p>
      </div>
    </div>
  </transition>
</template>

<script>
import { BACKGROUND_DIM_RANGE, MAX_SCORE_BUTTONS, SCORE_SCALE_RANGE } from '../config'
import { formatBytes } from '../lib/image'
import {
  buttonInkClass,
  buttonInkStyle,
  buttonStyle,
  buttonSwatch,
  buttonText,
  isButtonVisible,
  matchColorKey,
  matchInkKey,
  normalizeTextColor
} from '../lib/scoreButtons'
import { isHexColor } from '../lib/branding'

const TABS = ['Skor', 'Tampilan', 'Latar', 'Identitas', 'Umum']

export default {
  name: 'SettingsPanel',
  props: {
    isOpen: { type: Boolean, default: false },
    scoreButtons: { type: Array, required: true },
    branding: { type: Object, required: true },
    appearance: { type: Object, required: true },
    resolvedColors: { type: Object, required: true },
    colorFields: { type: Array, required: true },
    themeChoices: { type: Array, required: true },
    fitChoices: { type: Array, required: true },
    backgroundError: { type: String, default: '' },
    backgroundInfo: { type: String, default: '' },
    backgroundBytes: { type: Number, default: 0 },
    isUploading: { type: Boolean, default: false },
    storageError: { type: Boolean, default: false }
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
    'background-file',
    'update-background-url',
    'update-background-dim',
    'update-background-fit',
    'remove-background',
    'clear-teams',
    'test-sound'
  ],
  data() {
    return {
      activeTab: TABS[0],
      tabs: TABS,
      maxButtons: MAX_SCORE_BUTTONS,
      scoreScaleRange: SCORE_SCALE_RANGE,
      dimRange: BACKGROUND_DIM_RANGE,
      // Kept local and committed on change: sanitising on every keystroke would reject
      // half-typed URLs and make the field look frozen.
      backgroundUrlDraft: ''
    }
  },
  watch: {
    'appearance.backgroundImage': {
      immediate: true,
      handler(value) {
        this.backgroundUrlDraft =
          typeof value === 'string' && !value.startsWith('data:') ? value : ''
      }
    }
  },
  computed: {
    backgroundSizeLabel() {
      return this.backgroundBytes ? `Tersimpan ${formatBytes(this.backgroundBytes)}` : ''
    }
  },
  methods: {
    buttonInkClass,
    buttonInkStyle,
    buttonStyle,
    buttonSwatch,
    buttonText,
    // The live preview doubles as the "value 0 hides this" signal, and makes an
    // invisible-button regression obvious without having to open a team card.
    previewText(button) {
      return isButtonVisible(button) ? buttonText(button) : 'disembunyikan'
    },
    inkSwatch(button) {
      const choice = normalizeTextColor(button.textColor)
      if (choice === 'white') return '#ffffff'
      if (choice === 'black') return '#000000'
      if (isHexColor(choice)) return choice
      return buttonInkClass(button) === 'text-white' ? '#ffffff' : '#000000'
    },
    inkLabel(button) {
      if (!button.textColor) return 'otomatis'
      return button.textColor === 'white' || button.textColor === 'black'
        ? button.textColor
        : 'kustom'
    },
    pickInk(hex) {
      return matchInkKey(hex) ?? hex
    },
    pickFile(event) {
      const [file] = event.target.files ?? []
      // Reset first so picking the same file twice still fires a change event.
      event.target.value = ''
      if (file) this.$emit('background-file', file)
    },
    commitBackgroundUrl() {
      this.$emit('update-background-url', this.backgroundUrlDraft)
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
