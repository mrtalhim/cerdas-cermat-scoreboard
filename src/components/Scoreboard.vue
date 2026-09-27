<template>
  <!-- Full-bleed background layer so flashes fill the whole screen, not just the content column -->
  <div :class="['min-h-screen min-h-dvh w-full relative overflow-x-clip', backgroundColorClass]">
    <div
      class="flex flex-col items-center mx-auto text-center p-2 portrait:p-2 sm:p-4 gap-1.5 portrait:gap-1.5 sm:gap-2 w-full max-w-7xl min-h-screen min-h-dvh pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
    <input
      v-if="!isPresenting"
      v-model="title"
      placeholder="Papan Skor"
      aria-label="Judul papan skor"
      class="w-full font-bold text-xl portrait:text-xl sm:text-3xl lg:text-4xl text-center text-pretty bg-transparent px-2 py-1"
    />
    <h1
      v-else
      class="w-full font-bold text-xl portrait:text-xl sm:text-3xl lg:text-4xl text-center text-pretty px-2 py-1 truncate"
    >
      {{ title || 'Papan Skor' }}
    </h1>

    <!-- Toolbar -->
    <div v-if="!isPresenting" class="flex flex-row flex-wrap gap-1.5 portrait:gap-1.5 sm:gap-2 items-center justify-center m-1 sm:m-2 w-full max-w-4xl px-1">
      <button @click="togglePanel" class="bg-gray-800 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]">
        Pengaturan
      </button>
      <button
        @click="addTeam"
        class="bg-green-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg transition-all duration-100 hover:scale-105 active:scale-105 touch-manipulation portrait:min-h-[2.75rem]"
      >
        Tambah Tim
      </button>
      <button
        @click="toggleHistory"
        class="bg-slate-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg relative touch-manipulation portrait:min-h-[2.75rem]"
        aria-label="Buka riwayat skor"
      >
        Riwayat
        <span
          v-if="history.length"
          class="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold rounded-full px-2 py-0.5"
        >
          {{ history.length }}
        </span>
      </button>
      <button
        @click="undo"
        :disabled="!canUndo"
        title="Urungkan perubahan terakhir (Ctrl+Z)"
        class="bg-indigo-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation portrait:min-h-[2.75rem]"
      >
        Urungkan
      </button>
      <button
        @click="redo"
        :disabled="!canRedo"
        title="Ulangi (Ctrl+Shift+Z)"
        class="bg-indigo-400 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation portrait:min-h-[2.75rem]"
      >
        Ulangi
      </button>
      <button
        @click="celebrateWinner"
        :disabled="teams.length === 0"
        title="Rayakan tim yang memimpin"
        class="bg-amber-500 text-black font-bold text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100 hover:scale-105 touch-manipulation portrait:min-h-[2.75rem]"
      >
        🎉 Pemenang
      </button>
      <button
        @click="togglePresent"
        title="Mode presentasi: sembunyikan toolbar (F)"
        class="bg-slate-800 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]"
      >
        ⛶ Presentasi
      </button>
      <button
        @click="toggleMute"
        :title="isMuted ? 'Nyalakan suara' : 'Bisukan suara'"
        class="bg-slate-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]"
      >
        {{ isMuted ? '🔇 Bisukan' : '🔊 Suara' }}
      </button>
      <div v-if="!isCountingDown" class="flex flex-row flex-wrap gap-1.5 sm:gap-2 items-center justify-center portrait:w-full">
        <label class="sr-only" for="timer-minutes">Menit</label>
        <input
          id="timer-minutes"
          v-model.number="minutes"
          type="number"
          min="0"
          max="999"
          placeholder="Menit"
          class="w-16 sm:w-20 text-base text-black text-end p-2 border rounded-lg"
        />
        <span aria-hidden="true">m</span>
        <label class="sr-only" for="timer-seconds">Detik</label>
        <input
          id="timer-seconds"
          v-model.number="seconds"
          type="number"
          min="0"
          max="59"
          placeholder="Detik"
          class="w-16 sm:w-20 text-base text-black text-end p-2 border rounded-lg"
        />
        <span aria-hidden="true">d</span>
        <button @click="startCountdown" class="bg-green-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem]">
          Mulai
        </button>
      </div>
    </div>

    <!-- Floating mini-controls while presenting (toolbar is hidden) -->
    <div
      v-if="isPresenting"
      class="fixed bottom-3 right-3 z-40 flex gap-2 opacity-70 hover:opacity-100 focus-within:opacity-100"
    >
      <button
        @click="undo"
        :disabled="!canUndo"
        title="Urungkan (Ctrl+Z)"
        class="bg-indigo-600 text-white text-sm px-3 py-2 rounded-full shadow-lg disabled:opacity-40 touch-manipulation min-h-[2.75rem]"
      >
        ↩ Urungkan
      </button>
      <button
        v-if="!isCountingDown"
        @click="startCountdown"
        title="Mulai pewaktu"
        class="bg-green-600 text-white text-sm px-3 py-2 rounded-full shadow-lg touch-manipulation min-h-[2.75rem]"
      >
        ⏱ Mulai
      </button>
      <button
        @click="togglePresent"
        title="Keluar mode presentasi (Esc)"
        class="bg-slate-800 text-white text-sm px-3 py-2 rounded-full shadow-lg touch-manipulation min-h-[2.75rem]"
      >
        ✕ Keluar
      </button>
    </div>

    <!-- Leader banner -->
    <div v-if="leaderNames" class="px-2" aria-live="polite">
      <span class="inline-block bg-amber-300 text-black text-base sm:text-lg font-semibold px-3 py-1 rounded-full shadow">
        👑 Memimpin: {{ leaderNames }}
      </span>
    </div>

    <!-- Settings panel -->
    <transition name="fade">
      <div
        v-show="isPanelOpen"
        class="fixed top-24 portrait:top-20 sm:top-36 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 sm:self-start z-20 flex flex-col bg-gray-200 p-4 portrait:p-4 sm:p-8 gap-2 rounded-lg shadow-lg w-[min(24rem,calc(100vw-1rem))] max-h-[85dvh] portrait:max-h-[calc(100dvh-6rem)] overflow-y-auto"
      >
        <div class="flex flex-row gap-2 justify-end items-baseline">
          <h2 class="text-3xl sm:text-5xl text-black font-bold mb-4 w-full">Pengaturan</h2>
          <button @click="togglePanel" class="absolute bg-gray-800 text-white px-3 py-2 rounded-lg" aria-label="Tutup pengaturan">
            &#10006;
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-black font-bold">Atur Tombol Skor (0 untuk sembunyikan)</span>
          <div class="flex flex-wrap gap-2 sm:gap-4 justify-center w-full">
            <input
              v-model.number="globalScores.score1"
              type="number"
              aria-label="Nilai tombol skor pertama"
              class="bg-green-500 text-lg sm:text-xl text-white font-bold text-center p-2 w-24 sm:w-32 min-w-0 rounded-lg"
              placeholder="Nilai Skor"
            />
            <input
              v-model.number="globalScores.score2"
              type="number"
              aria-label="Nilai tombol skor kedua"
              class="bg-blue-500 text-lg sm:text-xl text-white font-bold text-center p-2 w-24 sm:w-32 min-w-0 rounded-lg"
              placeholder="Nilai Skor"
            />
            <input
              v-model.number="globalScores.score3"
              type="number"
              aria-label="Nilai tombol skor ketiga"
              class="bg-yellow-500 text-lg sm:text-xl text-white font-bold text-center p-2 w-24 sm:w-32 min-w-0 rounded-lg"
              placeholder="Nilai Skor"
            />
          </div>
        </div>
        <button @click="resetAll" class="bg-red-600 text-white text-center p-2 rounded-lg w-auto">
          Hapus Semua Tim
        </button>
        <button @click="testSound" class="bg-slate-600 text-white text-center p-2 rounded-lg w-auto">
          🔊 Tes Suara
        </button>
      </div>
    </transition>

    <!-- History panel -->
    <transition name="fade">
      <div
        v-show="isHistoryOpen"
        class="fixed top-24 portrait:top-20 sm:top-36 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 sm:self-end z-20 flex flex-col bg-white p-4 sm:p-6 gap-2 rounded-lg shadow-lg w-[min(20rem,calc(100vw-1rem))] max-h-[70vh] max-h-[70dvh] portrait:max-h-[calc(100dvh-6rem)] overflow-hidden text-left"
      >
        <div class="flex flex-row gap-2 justify-between items-center">
          <h2 class="text-2xl text-black font-bold">Riwayat</h2>
          <button @click="toggleHistory" class="bg-gray-800 text-white px-3 py-1 rounded-lg" aria-label="Tutup riwayat">
            &#10006;
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="undo"
            :disabled="!canUndo"
            class="flex-1 bg-indigo-600 text-white px-2 py-1 rounded-lg disabled:opacity-40"
          >
            Urungkan
          </button>
          <button
            @click="redo"
            :disabled="!canRedo"
            class="flex-1 bg-indigo-400 text-white px-2 py-1 rounded-lg disabled:opacity-40"
          >
            Ulangi
          </button>
          <button
            @click="clearHistory"
            :disabled="history.length === 0 && redoStack.length === 0"
            class="flex-1 bg-gray-500 text-white px-2 py-1 rounded-lg disabled:opacity-40"
          >
            Hapus
          </button>
        </div>
        <p v-if="history.length === 0" class="text-gray-500 text-sm">
          Belum ada perubahan. Perubahan skor, tambah dan hapus tim akan muncul di sini.
        </p>
        <ol v-else class="overflow-y-auto min-h-0 flex flex-col gap-1 pr-1">
          <li
            v-for="entry in historyReversed"
            :key="entry.id"
            class="text-sm text-gray-800 border-b border-gray-100 py-1 flex justify-between gap-2"
          >
            <span>{{ describeEntry(entry) }}</span>
            <span class="text-gray-400 shrink-0">{{ formatEntryTime(entry.at) }}</span>
          </li>
        </ol>
      </div>
    </transition>

    <!-- Countdown overlay -->
    <div
      v-if="isCountingDown"
      class="fixed inset-0 z-30 bg-black bg-opacity-75 flex flex-col items-center justify-center gap-4 p-4"
    >
      <div class="text-white font-bold tabular-nums leading-none text-center text-[clamp(2.75rem,17vw,9rem)] portrait:text-[clamp(2.75rem,20vw,6.5rem)] animate-pulse" aria-live="assertive">
        {{ formattedCountdown }}
      </div>
      <div class="flex flex-wrap gap-2 justify-center portrait:gap-3">
        <button
          v-if="!isPaused"
          @click="pauseCountdown"
          class="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem] portrait:px-6"
        >
          Jeda
        </button>
        <button
          v-else
          @click="resumeCountdown"
          class="bg-green-600 text-white px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem] portrait:px-6"
        >
          Lanjut
        </button>
        <button @click="resetCountdown" class="bg-red-600 text-white px-4 py-2 rounded-lg touch-manipulation portrait:min-h-[2.75rem] portrait:px-6">
          Ulang
        </button>
      </div>
    </div>

    <!-- Team Panel -->
    <transition-group name="fade" tag="div" :class="['grid gap-2 portrait:gap-2 sm:gap-4 w-full flex-1 min-h-0 px-1 sm:px-4 lg:px-8 pb-2 portrait:pb-2 sm:pb-8 auto-rows-fr', teamGridClass]">
      <div
        v-for="team in teams"
        :key="team.id"
        :data-team-id="team.id"
        :class="[
          'team-card flex flex-col p-3 sm:p-4 gap-2 rounded-lg shadow transition-all duration-300 min-h-[9rem] portrait:min-h-[12rem] sm:min-h-[12rem] min-w-0',
          team.lastChange > 0
            ? 'bg-green-500 scale-[1.03]'
            : team.lastChange < 0
              ? 'bg-red-500 scale-[0.97]'
              : 'bg-gray-100',
          leaders.includes(team.id) ? 'ring-4 ring-amber-400' : ''
        ]"
      >
        <div class="flex flex-row gap-2 min-w-0">
          <input
            v-model="team.name"
            placeholder="Nama Tim"
            aria-label="Nama tim"
            class="text-base portrait:text-lg sm:text-xl lg:text-2xl text-gray-950 text-center font-bold p-2 w-full min-w-0 border rounded-lg uppercase transition-all duration-100"
          />
          <button
            v-if="!isPresenting"
            class="bg-red-600 text-white px-3 sm:px-4 rounded-lg shrink-0 touch-manipulation portrait:min-h-[2.75rem] portrait:min-w-[2.75rem] transition-all duration-100 hover:scale-105"
            @click="removeTeam(team.id)"
            aria-label="Hapus tim"
          >
            &#10006;
          </button>
        </div>

        <!-- Portrait phones: score on top, buttons in a 3-across row below.
             Landscape / wide: classic side-by-side with vertical buttons. -->
        <div class="flex flex-1 min-h-0 gap-2 portrait:flex-col portrait:justify-center landscape:flex-row landscape:justify-between">
          <transition name="bounce" mode="out-in">
            <div
              :key="team.score"
              :class="[
                'text-black font-bold tabular-nums leading-none subpixel-antialiased flex-1 min-w-0 flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis portrait:py-2 portrait:min-h-[4.5rem] text-[clamp(1.25rem,10cqw,6rem)] portrait:text-[clamp(2rem,14cqw,5rem)]'
              ]"
              aria-live="polite"
            >
              <span v-if="leaders.includes(team.id)" aria-hidden="true">👑&nbsp;</span>{{ Math.round(team.displayScore ?? team.score) }}
            </div>
          </transition>

          <div class="gap-2 portrait:grid portrait:grid-cols-3 portrait:w-full landscape:flex landscape:flex-col landscape:justify-center landscape:shrink-0 landscape:w-16 sm:landscape:w-24">
            <button
              v-if="globalScores.score1 !== 0"
              @click="changeScore(team.id, globalScores.score1)"
              class="bg-green-500 text-white text-sm portrait:text-base sm:text-base font-bold px-2 py-1 min-h-[2.25rem] portrait:min-h-[2.75rem] rounded-lg transition-all duration-100 hover:scale-105 touch-manipulation"
            >
              {{ globalScores.score1 >= 0 ? '+' : '' }}{{ globalScores.score1 }}
            </button>

            <button
              v-if="globalScores.score2 !== 0"
              @click="changeScore(team.id, globalScores.score2)"
              class="bg-blue-500 text-white text-sm portrait:text-base sm:text-base font-bold px-2 py-1 min-h-[2.25rem] portrait:min-h-[2.75rem] rounded-lg transition-all duration-100 hover:scale-105 touch-manipulation"
            >
              {{ globalScores.score2 >= 0 ? '+' : '' }}{{ globalScores.score2 }}
            </button>

            <button
              v-if="globalScores.score3 !== 0"
              @click="changeScore(team.id, globalScores.score3)"
              class="bg-yellow-500 text-white text-sm portrait:text-base sm:text-base font-bold px-2 py-1 min-h-[2.25rem] portrait:min-h-[2.75rem] rounded-lg transition-all duration-100 hover:scale-105 touch-manipulation"
            >
              {{ globalScores.score3 >= 0 ? '+' : '' }}{{ globalScores.score3 }}
            </button>
          </div>
        </div>
      </div>
    </transition-group>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti'
import { animate, stagger } from 'animejs'

const STORAGE_KEY = 'cc-scoreboard-v1'
const MAX_HISTORY = 200

// One running score tween per team so rapid clicks retarget instead of stacking
const scoreAnims = new Map()

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export default {
  data() {
    return {
      title: '',
      teams: [],
      globalScores: {
        score1: 100,
        score2: -50,
        score3: 50
      },
      history: [],
      redoStack: [],
      isPanelOpen: false,
      isHistoryOpen: false,
      isPresenting: false,
      isMuted: false,
      minutes: 0,
      seconds: 5,
      originalMinutes: 0,
      originalSeconds: 0,
      isCountingDown: false,
      isPaused: false,
      countdown: null,
      backgroundColorClass: '',
      alarm: null,
      tick: null,
      correct: null
    }
  },
  computed: {
    formattedCountdown() {
      const minutes = String(this.minutes).padStart(2, '0')
      const seconds = String(this.seconds).padStart(2, '0')
      return `${minutes}:${seconds}`
    },
    teamGridClass() {
      // Mobile-first, capped by team count so a lone team never sits in half a row.
      // Narrow / side-by-side windows (<640px) always stack to a single column.
      const teamCount = this.teams.length
      if (teamCount <= 1) return 'grid-cols-1'
      if (teamCount === 2) return 'grid-cols-1 sm:grid-cols-2'
      if (teamCount === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      if (teamCount === 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
      if (teamCount <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    },
    leaders() {
      if (this.teams.length < 2) return []
      const scores = this.teams.map((t) => t.score)
      const max = Math.max(...scores)
      const min = Math.min(...scores)
      if (max === min) return []
      return this.teams.filter((t) => t.score === max).map((t) => t.id)
    },
    leaderNames() {
      if (!this.leaders.length) return ''
      const names = this.teams
        .filter((t) => this.leaders.includes(t.id))
        .map((t) => t.name?.trim() || 'Tim tanpa nama')
      return names.join(', ')
    },
    canUndo() {
      return this.history.length > 0
    },
    canRedo() {
      return this.redoStack.length > 0
    },
    historyReversed() {
      return [...this.history].reverse()
    }
  },
  watch: {
    title() {
      this.save()
    },
    teams: {
      deep: true,
      handler() {
        this.save()
      }
    },
    globalScores: {
      deep: true,
      handler() {
        this.save()
      }
    }
  },
  mounted() {
    this.load()
    this.initAudio()
    window.addEventListener('keydown', this.handleKeydown)
    this.animateEntrance()
  },
  beforeUnmount() {
    this.stopTicking()
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    // ---------- persistence ----------
    save() {
      try {
        const payload = {
          v: 1,
          title: this.title,
          teams: this.teams.map((t) => ({ id: t.id, name: t.name, score: t.score })),
          globalScores: this.globalScores,
          history: this.history.slice(-MAX_HISTORY),
          minutes: this.minutes,
          seconds: this.seconds,
          isMuted: this.isMuted
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch {
        // storage full / private mode — scoreboard keeps working in-memory
      }
    },
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          this.isPanelOpen = true
          return
        }
        const data = JSON.parse(raw)
        this.title = data.title ?? ''
        this.teams = (data.teams ?? []).map((t) => ({ ...t, lastChange: 0, displayScore: t.score }))
        this.globalScores = { score1: 100, score2: -50, score3: 50, ...(data.globalScores ?? {}) }
        this.history = data.history ?? []
        if (typeof data.minutes === 'number') this.minutes = data.minutes
        if (typeof data.seconds === 'number') this.seconds = data.seconds
        if (typeof data.isMuted === 'boolean') this.isMuted = data.isMuted
        // Don't cover the board with settings when there's already a saved game
        this.isPanelOpen = this.teams.length === 0
      } catch {
        this.isPanelOpen = true
      }
    },
    pushHistory(entry) {
      this.history.push({ id: uid(), at: Date.now(), ...entry })
      if (this.history.length > MAX_HISTORY) {
        this.history = this.history.slice(-MAX_HISTORY)
      }
      // any new action invalidates the redo stack
      this.redoStack = []
      this.save()
    },

    // ---------- teams ----------
    addTeam() {
      const team = { id: uid(), name: '', score: 0, displayScore: 0, lastChange: 0 }
      this.teams.push(team)
      this.pushHistory({ type: 'add', teamId: team.id, team: { ...team, lastChange: 0 } })
      this.$nextTick(() => this.popCard(team.id))
    },
    removeTeam(teamId) {
      const index = this.teams.findIndex((t) => t.id === teamId)
      if (index === -1) return
      const [removed] = this.teams.splice(index, 1)
      scoreAnims.get(teamId)?.cancel()
      scoreAnims.delete(teamId)
      this.pushHistory({
        type: 'remove',
        teamId: removed.id,
        team: {
          id: removed.id,
          name: removed.name,
          score: removed.score,
          displayScore: removed.displayScore ?? removed.score
        },
        index
      })
    },
    changeScore(teamId, amount) {
      const team = this.teams.find((t) => t.id === teamId)
      if (!team || typeof amount !== 'number' || Number.isNaN(amount)) return
      const prevScore = team.score
      const nextScore = prevScore + amount
      team.score = nextScore
      team.lastChange = amount
      // v1 behavior: correct.wav on +, buzzer on − (wrong.wav was never wired up)
      this.safePlay(amount >= 0 ? this.correct : this.alarm)
      this.tweenScore(team, nextScore)
      this.pushHistory({
        type: 'score',
        teamId: team.id,
        teamName: team.name,
        amount,
        prevScore,
        nextScore
      })
      // capture the object, not the index — safe if the team is removed mid-timeout
      setTimeout(() => {
        team.lastChange = 0
      }, 400)
    },

    // ---------- history / undo ----------
    describeEntry(entry) {
      const name = (entry.teamName ?? entry.team?.name ?? '').trim() || 'Tim tanpa nama'
      switch (entry.type) {
        case 'score':
          return `${name}: ${entry.amount >= 0 ? '+' : ''}${entry.amount} (${entry.prevScore} → ${entry.nextScore})`
        case 'add':
          return `Menambah ${((entry.team?.name ?? '')).trim() || 'tim baru'}`
        case 'remove':
          return `Menghapus ${name} (${entry.team?.score ?? 0} poin)`
        case 'reset':
          return `Menghapus ${(entry.teams ?? []).length} tim`
        default:
          return 'Mengubah papan skor'
      }
    },
    formatEntryTime(at) {
      try {
        return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } catch {
        return ''
      }
    },
    undo() {
      const entry = this.history.pop()
      if (!entry) return
      this.redoStack.push(entry)
      switch (entry.type) {
        case 'score': {
          let team = this.teams.find((t) => t.id === entry.teamId)
          if (team) {
            team.score = entry.prevScore
            team.lastChange = -entry.amount
            this.tweenScore(team, entry.prevScore)
            setTimeout(() => {
              team.lastChange = 0
            }, 400)
          } else {
            // team was deleted after scoring — bring it back so undo is lossless
            this.teams.push({
              id: entry.teamId,
              name: entry.teamName ?? '',
              score: entry.prevScore,
              displayScore: entry.prevScore,
              lastChange: 0
            })
          }
          break
        }
        case 'add': {
          const i = this.teams.findIndex((t) => t.id === entry.teamId)
          if (i !== -1) this.teams.splice(i, 1)
          break
        }
        case 'remove': {
          const snapshot = entry.team
          if (snapshot && !this.teams.some((t) => t.id === snapshot.id)) {
            const index = Math.min(Math.max(entry.index ?? this.teams.length, 0), this.teams.length)
            this.teams.splice(index, 0, { ...snapshot, lastChange: 0 })
          }
          break
        }
        case 'reset': {
          this.teams = (entry.teams ?? []).map((t) => ({ ...t, lastChange: 0 }))
          break
        }
      }
      this.save()
    },
    redo() {
      const entry = this.redoStack.pop()
      if (!entry) return
      this.history.push(entry)
      switch (entry.type) {
        case 'score': {
          let team = this.teams.find((t) => t.id === entry.teamId)
          if (team) {
            team.score = entry.nextScore
            team.lastChange = entry.amount
            this.tweenScore(team, entry.nextScore)
            setTimeout(() => {
              team.lastChange = 0
            }, 400)
          } else {
            this.teams.push({
              id: entry.teamId,
              name: entry.teamName ?? '',
              score: entry.nextScore,
              displayScore: entry.nextScore,
              lastChange: 0
            })
          }
          break
        }
        case 'add': {
          if (entry.team && !this.teams.some((t) => t.id === entry.team.id)) {
            this.teams.push({ ...entry.team, lastChange: 0 })
          }
          break
        }
        case 'remove': {
          const i = this.teams.findIndex((t) => t.id === entry.teamId)
          if (i !== -1) this.teams.splice(i, 1)
          break
        }
        case 'reset': {
          this.teams = []
          break
        }
      }
      this.save()
    },
    clearHistory() {
      if (!this.history.length && !this.redoStack.length) return
      if (!window.confirm('Hapus riwayat? Tindakan ini tidak dapat dibatalkan.')) return
      this.history = []
      this.redoStack = []
      this.save()
    },
    handleKeydown(e) {
      const target = e.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && !typing) {
        const key = e.key.toLowerCase()
        if (key === 'z' && !e.shiftKey) {
          e.preventDefault()
          this.undo()
        } else if ((key === 'z' && e.shiftKey) || key === 'y') {
          e.preventDefault()
          this.redo()
        }
        return
      }
      if (e.key === 'Escape') {
        if (this.isPresenting) {
          this.togglePresent()
          return
        }
        this.isPanelOpen = false
        this.isHistoryOpen = false
      }
      if ((e.key === 'f' || e.key === 'F') && !typing && !e.ctrlKey && !e.metaKey) {
        this.togglePresent()
      }
    },

    // ---------- panels ----------
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen
    },
    toggleHistory() {
      this.isHistoryOpen = !this.isHistoryOpen
    },
    // ---------- present mode (sembunyikan toolbar saja, tanpa fullscreen) ----------
    togglePresent() {
      this.isPresenting = !this.isPresenting
      if (this.isPresenting) {
        this.isPanelOpen = false
        this.isHistoryOpen = false
      }
    },
    // ---------- anime.js motion ----------
    highlightBackground(colorClass) {
      this.backgroundColorClass = colorClass + ' bg-transition'
      setTimeout(() => {
        this.backgroundColorClass = 'bg-transition'
      }, 500)
    },
    celebrateWinner() {
      const fire = (opts) => {
        try {
          confetti(opts)
        } catch {
          // confetti needs a canvas-capable browser; scoreboard keeps working without it
        }
      }
      fire({ particleCount: 120, spread: 75, origin: { y: 0.6 } })
      setTimeout(() => fire({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } }), 150)
      setTimeout(() => fire({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } }), 300)
      if (!this.leaders.length || prefersReducedMotion()) return
      const cards = this.leaders
        .map((id) => this.$el.querySelector(`[data-team-id="${id}"]`))
        .filter(Boolean)
      if (!cards.length) return
      animate(cards, {
        scale: [1, 1.08, 1],
        duration: 600,
        delay: stagger(120),
        ease: 'inOutQuad'
      })
    },
    // ---------- anime.js motion ----------
    tweenScore(team, to) {
      scoreAnims.get(team.id)?.cancel()
      scoreAnims.delete(team.id)
      if (prefersReducedMotion()) {
        team.displayScore = to
        return
      }
      // anime mutates the reactive property each tick — Vue re-renders the count
      scoreAnims.set(
        team.id,
        animate(team, {
          displayScore: to,
          duration: 600,
          ease: 'outExpo'
        })
      )
    },
    popCard(teamId) {
      if (prefersReducedMotion()) return
      const el = this.$el.querySelector(`[data-team-id="${teamId}"]`)
      if (!el) return
      // CSS fade handles opacity concurrently; anime owns the springy scale
      animate(el, { scale: [0.6, 1], duration: 500, ease: 'outBack' })
    },
    animateEntrance() {
      // initial render has no CSS enter transition (no `appear`), so anime owns it
      if (!this.teams.length || prefersReducedMotion()) return
      animate(this.$el.querySelectorAll('.team-card'), {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(90),
        duration: 500,
        ease: 'outExpo'
      })
    },

    // ---------- timer ----------
    initAudio() {
      try {
        // import.meta.env.BASE_URL has no trailing slash on prod
        // (e.g. "/cerdas-cermat-scoreboard"), so normalize before joining.
        const rawBase = import.meta.env.BASE_URL || '/'
        const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
        this.alarm = new Audio(`${base}buzz.wav`)
        this.tick = new Audio(`${base}tick.wav`)
        this.correct = new Audio(`${base}correct.wav`)
        this.alarm.preload = 'auto'
        this.tick.preload = 'auto'
        this.correct.preload = 'auto'
      } catch {
        this.alarm = null
        this.tick = null
        this.correct = null
      }
    },
    testSound() {
      // explicit sound check — plays even when muted
      const audio = this.tick
      if (!audio) return
      try {
        audio.currentTime = 0
        const p = audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch {
        // audio unavailable — board keeps working
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted
      this.save()
    },
    safePlay(audio) {
      if (!audio || this.isMuted) return
      try {
        audio.currentTime = 0
        const p = audio.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch {
        // autoplay blocked — timer still runs visually
      }
    },
    stopTicking() {
      if (this.countdown) {
        clearInterval(this.countdown)
        this.countdown = null
      }
    },
    startCountdown() {
      this.stopTicking()
      if (!this.minutes) this.minutes = 0
      if (!this.seconds) this.seconds = 0
      this.minutes = Math.max(0, Math.floor(this.minutes))
      this.seconds = Math.max(0, Math.min(59, Math.floor(this.seconds)))
      if (this.minutes === 0 && this.seconds === 0) return

      this.originalMinutes = this.minutes
      this.originalSeconds = this.seconds
      this.isCountingDown = true
      this.isPaused = false
      this.safePlay(this.tick)
      this.countdown = setInterval(this.tickOnce, 1000)
      this.save()
    },
    tickOnce() {
      if (this.seconds === 1 && this.minutes === 0) {
        this.seconds = 0
        this.safePlay(this.alarm)
        this.stopTicking()
        this.isCountingDown = false
        this.isPaused = false
        this.highlightBackground('bg-red-500')
        this.minutes = this.originalMinutes
        this.seconds = this.originalSeconds
      } else {
        this.safePlay(this.tick)
        if (this.seconds === 0) {
          this.minutes--
          this.seconds = 59
        } else {
          this.seconds--
        }
      }
    },
    pauseCountdown() {
      this.stopTicking()
      this.isPaused = true
    },
    resumeCountdown() {
      if (!this.isCountingDown || !this.isPaused) return
      this.isPaused = false
      this.stopTicking()
      this.countdown = setInterval(this.tickOnce, 1000)
    },
    resetCountdown() {
      this.stopTicking()
      this.isCountingDown = false
      this.isPaused = false
      this.minutes = this.originalMinutes
      this.seconds = this.originalSeconds
    },
    resetAll() {
      if (!this.teams.length) return
      if (!window.confirm(`Hapus semua ${this.teams.length} tim? Anda bisa mengurungkan tepat setelah ini.`)) return
      this.stopTicking()
      this.isCountingDown = false
      this.isPaused = false
      const snapshot = this.teams.map((t) => ({
        id: t.id,
        name: t.name,
        score: t.score,
        displayScore: t.displayScore ?? t.score
      }))
      for (const t of this.teams) {
        scoreAnims.get(t.id)?.cancel()
        scoreAnims.delete(t.id)
      }
      this.teams = []
      this.minutes = 0
      this.seconds = 5
      this.pushHistory({ type: 'reset', teams: snapshot })
    }
  }
}
</script>

<style scoped>
/* Card is a size container so the score font (cqw units) scales with card width */
.team-card {
  container-type: inline-size;
}

.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.1s;
}

.bg-transition {
  transition: background-color 0.5s ease;
}

/* Countdown animation */
.animate-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  10% {
    transform: scale(2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.5);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>
