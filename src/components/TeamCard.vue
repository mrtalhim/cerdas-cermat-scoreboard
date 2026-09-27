<template>
  <div
    :data-team-id="team.id"
    :class="[
      'team-card flex flex-col p-3 sm:p-4 gap-2 rounded-lg shadow transition-all duration-300 min-h-[9rem] portrait:min-h-[12rem] sm:min-h-[12rem] min-w-0',
      cardClass,
      isLeader ? 'ring-4 ring-cc-leader' : ''
    ]"
  >
    <div class="flex flex-row gap-2 min-w-0">
      <input
        v-model="name"
        placeholder="Nama Tim"
        aria-label="Nama tim"
        class="text-base portrait:text-lg sm:text-xl lg:text-2xl text-center font-bold p-2 w-full min-w-0 border rounded-lg uppercase transition-all duration-100 bg-transparent text-current placeholder:opacity-60"
      />
      <button
        v-if="!isPresenting"
        class="bg-red-600 text-white px-3 sm:px-4 rounded-lg shrink-0 touch-manipulation portrait:min-h-[2.75rem] portrait:min-w-[2.75rem] transition-all duration-100 hover:scale-105"
        @click="$emit('remove', team.id)"
        aria-label="Hapus tim"
      >
        &#10006;
      </button>
    </div>

    <!-- Score on top (full card width), buttons in a row at the bottom -->
    <div class="flex flex-col flex-1 min-h-0 gap-2">
      <transition name="bounce" mode="out-in">
        <div
          :key="team.score"
          class="font-bold tabular-nums leading-none subpixel-antialiased flex-1 min-w-0 flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis py-2 min-h-[4.5rem] text-cc-score"
          aria-live="polite"
        >
          <span v-if="isLeader" aria-hidden="true">&#9813;&nbsp;</span
          >{{ Math.round(team.displayScore ?? team.score) }}
        </div>
      </transition>

      <div v-if="visibleButtons.length" class="flex flex-wrap gap-2 w-full">
        <button
          v-for="button in visibleButtons"
          :key="button.id"
          :class="[
            'flex-1 basis-[4rem] min-w-[4rem] text-base font-bold px-2 py-1 min-h-[2.75rem] rounded-lg transition-all duration-100 hover:scale-105 touch-manipulation',
            buttonSwatch(button).bg,
            buttonSwatch(button).ink
          ]"
          :style="buttonStyle(button.color)"
          :title="`${buttonSwatch(button).label} · ${buttonText(button)}`"
          :aria-label="`Tambah ${buttonText(button)} poin`"
          @click="$emit('score', team.id, button.value)"
        >
          {{ buttonText(button) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { buttonStyle, buttonSwatch, buttonText, isButtonVisible } from '../lib/scoreButtons'

export default {
  name: 'TeamCard',
  props: {
    team: { type: Object, required: true },
    scoreButtons: { type: Array, required: true },
    isLeader: { type: Boolean, default: false },
    isPresenting: { type: Boolean, default: false }
  },
  emits: ['score', 'remove', 'rename'],
  computed: {
    // The team object is owned by Scoreboard, so rename is emitted instead of mutated.
    name: {
      get() {
        return this.team.name
      },
      set(value) {
        this.$emit('rename', this.team.id, value)
      }
    },
    visibleButtons() {
      return this.scoreButtons.filter(isButtonVisible)
    },
    cardClass() {
      if (this.team.lastChange > 0) return 'bg-cc-positive scale-[1.03]'
      if (this.team.lastChange < 0) return 'bg-cc-negative scale-[0.97]'
      return 'bg-cc-card text-cc-card-ink'
    }
  },
  methods: {
    buttonStyle,
    buttonSwatch,
    buttonText
  }
}
</script>

<style scoped>
/* Card is a size container so the score font (cqw units) scales with card width */
.team-card {
  container-type: inline-size;
}
</style>
