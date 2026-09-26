<template>
  <div :class="['flex flex-col items-center mx-auto text-center p-4 gap-2 min-h-screen relative', backgroundColorClass]">
    <input
      v-model="title"
      placeholder="Scoreboard"
      aria-label="Scoreboard title"
      class="w-full font-bold text-4xl text-center text-pretty bg-transparent"
    />

    <!-- Toolbar -->
    <div class="flex flex-row flex-wrap gap-2 items-center justify-center m-2">
      <button @click="togglePanel" class="bg-gray-800 text-white px-4 py-2 rounded-lg">
        Setting
      </button>
      <button
        @click="addTeam"
        class="bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-100 hover:scale-105 active:scale-105"
      >
        Add Team
      </button>
      <button
        @click="toggleHistory"
        class="bg-slate-700 text-white px-4 py-2 rounded-lg relative"
        aria-label="Toggle score history"
      >
        History
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
        title="Undo last change (Ctrl+Z)"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Undo
      </button>
      <button
        @click="redo"
        :disabled="!canRedo"
        title="Redo (Ctrl+Shift+Z)"
        class="bg-indigo-400 text-white px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Redo
      </button>
      <button
        @click="celebrateWinner"
        :disabled="teams.length === 0"
        title="Celebrate current leader"
        class="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100 hover:scale-105"
      >
        🎉 Winner
      </button>
      <div v-if="!isCountingDown" class="flex gap-2 items-center">
        <label class="sr-only" for="timer-minutes">Minutes</label>
        <input
          id="timer-minutes"
          v-model.number="minutes"
          type="number"
          min="0"
          max="999"
          placeholder="Minutes"
          class="w-20 text-black text-end p-2 border rounded-lg"
        />
        <span aria-hidden="true">m</span>
        <label class="sr-only" for="timer-seconds">Seconds</label>
        <input
          id="timer-seconds"
          v-model.number="seconds"
          type="number"
          min="0"
          max="59"
          placeholder="Seconds"
          class="w-20 text-black text-end p-2 border rounded-lg"
        />
        <span aria-hidden="true">s</span>
        <button @click="startCountdown" class="bg-green-600 text-white px-4 py-2 rounded-lg">
          Timer
        </button>
      </div>
    </div>

    <!-- Leader banner -->
    <div v-if="leaderNames" class="text-lg font-semibold text-gray-800" aria-live="polite">
      👑 Leading: {{ leaderNames }}
    </div>

    <!-- Settings panel -->
    <transition name="fade">
      <div
        v-show="isPanelOpen"
        class="absolute self-start z-20 flex flex-col bg-gray-200 p-8 gap-2 rounded-lg shadow-lg"
      >
        <div class="flex flex-row gap-2 justify-end items-baseline">
          <h2 class="text-5xl text-black font-bold mb-4 w-full">Setting</h2>
          <button @click="togglePanel" class="absolute bg-gray-800 text-white px-3 py-2 rounded-lg" aria-label="Close settings">
            &#10006;
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-black font-bold">Set Score Button (0 to hide)</span>
          <div class="flex flex-wrap gap-4 justify-center w-auto">
            <input
              v-model.number="globalScores.score1"
              type="number"
              aria-label="First score button value"
              class="bg-green-500 text-xl text-white font-bold text-center p-2 max-w-32 rounded-lg"
              placeholder="Score Value"
            />
            <input
              v-model.number="globalScores.score2"
              type="number"
              aria-label="Second score button value"
              class="bg-blue-500 text-xl text-white font-bold text-center p-2 max-w-32 rounded-lg"
              placeholder="Score Value"
            />
            <input
              v-model.number="globalScores.score3"
              type="number"
              aria-label="Third score button value"
              class="bg-yellow-500 text-xl text-white font-bold text-center p-2 max-w-32 rounded-lg"
              placeholder="Score Value"
            />
          </div>
        </div>
        <button @click="resetAll" class="bg-red-600 text-white text-center p-2 rounded-lg w-auto">
          Clear All Teams
        </button>
      </div>
    </transition>

    <!-- History panel -->
    <transition name="fade">
      <div
        v-show="isHistoryOpen"
        class="absolute self-end z-20 flex flex-col bg-white p-6 gap-2 rounded-lg shadow-lg w-80 max-h-[70vh] text-left"
      >
        <div class="flex flex-row gap-2 justify-between items-center">
          <h2 class="text-2xl text-black font-bold">History</h2>
          <button @click="toggleHistory" class="bg-gray-800 text-white px-3 py-1 rounded-lg" aria-label="Close history">
            &#10006;
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="undo"
            :disabled="!canUndo"
            class="flex-1 bg-indigo-600 text-white px-2 py-1 rounded-lg disabled:opacity-40"
          >
            Undo
          </button>
          <button
            @click="redo"
            :disabled="!canRedo"
            class="flex-1 bg-indigo-400 text-white px-2 py-1 rounded-lg disabled:opacity-40"
          >
            Redo
          </button>
          <button
            @click="clearHistory"
            :disabled="history.length === 0 && redoStack.length === 0"
            class="flex-1 bg-gray-500 text-white px-2 py-1 rounded-lg disabled:opacity-40"
          >
            Clear
          </button>
        </div>
        <p v-if="history.length === 0" class="text-gray-500 text-sm">
          No changes yet. Score updates, adds and removes will show up here.
        </p>
        <ol v-else class="overflow-y-auto flex flex-col gap-1 pr-1">
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
      class="absolute inset-0 z-30 bg-black bg-opacity-75 flex flex-col items-center justify-center gap-4"
    >
      <div class="text-white text-9xl font-bold animate-pulse" aria-live="assertive">
        {{ formattedCountdown }}
      </div>
      <div class="flex gap-2">
        <button
          v-if="!isPaused"
          @click="pauseCountdown"
          class="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg"
        >
          Pause
        </button>
        <button
          v-else
          @click="resumeCountdown"
          class="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Resume
        </button>
        <button @click="resetCountdown" class="bg-red-600 text-white px-4 py-2 rounded-lg">
          Reset
        </button>
      </div>
    </div>

    <!-- Team Panel -->
    <transition-group name="fade" tag="div" :class="['grid gap-4 w-full h-4/6 flex-1 px-8 pb-8', teamGridClass]">
      <div
        v-for="team in teams"
        :key="team.id"
        :data-team-id="team.id"
        :class="[
          'team-card flex flex-col p-4 gap-2 rounded-lg shadow transition-all duration-300',
          team.lastChange > 0
            ? 'bg-green-500 scale-110'
            : team.lastChange < 0
              ? 'bg-red-500 scale-90'
              : 'bg-gray-100',
          leaders.includes(team.id) ? 'ring-4 ring-amber-400' : ''
        ]"
      >
        <div class="flex flex-row gap-2">
          <input
            v-model="team.name"
            placeholder="Team Name"
            :aria-label="`Team ${team.id} name`"
            class="text-2xl text-gray-950 text-center font-bold p-2 w-full border rounded-lg uppercase transition-all duration-100"
          />
          <button
            class="bg-red-600 text-white px-4 rounded-lg transition-all duration-100 hover:scale-105"
            @click="removeTeam(team.id)"
            aria-label="Remove team"
          >
            &#10006;
          </button>
        </div>

        <div class="flex flex-row flex-1 justify-between">
          <transition name="bounce" mode="out-in">
            <div
              :key="team.score"
              :class="[
                'text-black font-bold subpixel-antialiased flex-1 flex items-center justify-center',
                scoreClass
              ]"
              aria-live="polite"
            >
              <span v-if="leaders.includes(team.id)" aria-hidden="true">👑&nbsp;</span>{{ Math.round(team.displayScore ?? team.score) }}
            </div>
          </transition>

          <div class="flex flex-col justify-center gap-2">
            <button
              v-if="globalScores.score1 !== 0"
              @click="changeScore(team.id, globalScores.score1)"
              class="bg-green-500 text-white font-bold px-2 py-1 rounded-lg transition-all duration-100 hover:scale-105"
            >
              {{ globalScores.score1 >= 0 ? '+' : '' }}{{ globalScores.score1 }}
            </button>

            <button
              v-if="globalScores.score2 !== 0"
              @click="changeScore(team.id, globalScores.score2)"
              class="bg-blue-500 text-white font-bold px-2 py-1 rounded-lg transition-all duration-100 hover:scale-105"
            >
              {{ globalScores.score2 >= 0 ? '+' : '' }}{{ globalScores.score2 }}
            </button>

            <button
              v-if="globalScores.score3 !== 0"
              @click="changeScore(team.id, globalScores.score3)"
              class="bg-yellow-500 text-white font-bold px-2 py-1 rounded-lg transition-all duration-100 hover:scale-105"
            >
              {{ globalScores.score3 >= 0 ? '+' : '' }}{{ globalScores.score3 }}
            </button>
          </div>
        </div>
      </div>
    </transition-group>
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
      minutes: 0,
      seconds: 5,
      originalMinutes: 0,
      originalSeconds: 0,
      isCountingDown: false,
      isPaused: false,
      countdown: null,
      backgroundColorClass: '',
      alarm: null,
      tick: null
    }
  },
  computed: {
    formattedCountdown() {
      const minutes = String(this.minutes).padStart(2, '0')
      const seconds = String(this.seconds).padStart(2, '0')
      return `${minutes}:${seconds}`
    },
    teamGridClass() {
      const teamCount = this.teams.length
      if (teamCount < 2) return 'grid-cols-1'
      if (teamCount <= 4) return 'grid-cols-2'
      if (teamCount <= 6) return 'grid-cols-3'
      return 'grid-cols-4'
    },
    scoreClass() {
      const teamCount = this.teams.length
      if (teamCount <= 6) return 'text-8xl'
      return 'text-6xl'
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
        .map((t) => t.name?.trim() || 'Unnamed team')
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
          seconds: this.seconds
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
      const name = (entry.teamName ?? entry.team?.name ?? '').trim() || 'Unnamed team'
      switch (entry.type) {
        case 'score':
          return `${name}: ${entry.amount >= 0 ? '+' : ''}${entry.amount} (${entry.prevScore} → ${entry.nextScore})`
        case 'add':
          return `Added ${((entry.team?.name ?? '')).trim() || 'new team'}`
        case 'remove':
          return `Removed ${name} (${entry.team?.score ?? 0} pts)`
        case 'reset':
          return `Cleared ${(entry.teams ?? []).length} team(s)`
        default:
          return 'Changed scoreboard'
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
      if (!window.confirm('Clear score history? This cannot be undone.')) return
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
        this.isPanelOpen = false
        this.isHistoryOpen = false
      }
    },

    // ---------- panels ----------
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen
    },
    toggleHistory() {
      this.isHistoryOpen = !this.isHistoryOpen
    },
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
        const base = import.meta.env.BASE_URL || '/'
        this.alarm = new Audio(`${base}buzz.wav`)
        this.tick = new Audio(`${base}tick.wav`)
        this.alarm.preload = 'auto'
        this.tick.preload = 'auto'
      } catch {
        this.alarm = null
        this.tick = null
      }
    },
    safePlay(audio) {
      if (!audio) return
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
      if (!window.confirm(`Remove all ${this.teams.length} team(s)? You can Undo right after.`)) return
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
