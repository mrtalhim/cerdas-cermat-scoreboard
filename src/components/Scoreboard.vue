<template>
  <!-- Full-bleed background layer so flashes fill the whole screen, not just the content column -->
  <div
    class="min-h-screen min-h-dvh w-full relative overflow-x-clip bg-cc-board text-cc-board-ink bg-transition"
    :style="isFlashing ? { backgroundColor: 'var(--cc-negative)' } : undefined"
  >
    <div
      class="flex flex-col items-center mx-auto text-center p-2 portrait:p-2 sm:p-4 gap-1.5 portrait:gap-1.5 sm:gap-2 w-full max-w-7xl min-h-screen min-h-dvh pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div class="flex flex-row items-center justify-center gap-2 w-full">
        <img
          v-if="branding.logoUrl"
          :src="branding.logoUrl"
          :alt="`Logo ${branding.appName}`"
          class="h-8 sm:h-12 w-auto object-contain"
        />
        <input
          v-if="!isPresenting"
          v-model="title"
          :placeholder="branding.defaultTitle"
          aria-label="Judul papan skor"
          class="w-full font-bold text-xl portrait:text-xl sm:text-3xl lg:text-4xl text-center text-pretty bg-transparent px-2 py-1 text-current placeholder:opacity-60"
        />
        <h1
          v-else
          class="w-full font-bold text-xl portrait:text-xl sm:text-3xl lg:text-4xl text-center text-pretty px-2 py-1 truncate"
        >
          {{ title || branding.defaultTitle }}
        </h1>
      </div>

      <AppToolbar
        v-if="!isPresenting"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :has-teams="teams.length > 0"
        :history-count="history.length"
        :is-counting-down="isCountingDown"
        :is-muted="isMuted"
        :minutes="minutes"
        :seconds="seconds"
        @open-settings="togglePanel"
        @add-team="addTeam"
        @open-history="toggleHistory"
        @undo="undo"
        @redo="redo"
        @celebrate="celebrateWinner"
        @present="togglePresent"
        @toggle-mute="toggleMute"
        @start-countdown="startCountdown"
        @update:minutes="setMinutes"
        @update:seconds="setSeconds"
      />

      <MiniControls
        v-if="isPresenting"
        :can-undo="canUndo"
        :is-counting-down="isCountingDown"
        @undo="undo"
        @start-countdown="startCountdown"
        @close="togglePresent"
      />

      <LeaderBanner :names="leaderNames" />

      <SettingsPanel
        :is-open="isPanelOpen"
        :score-buttons="scoreButtons"
        :branding="branding"
        :appearance="appearance"
        :resolved-colors="resolvedColors"
        :color-fields="colorFields"
        :theme-choices="themeChoices"
        @close="togglePanel"
        @add-button="addScoreButton"
        @remove-button="removeScoreButton"
        @move-button="moveButton"
        @update-button="updateButton"
        @reset-buttons="resetScoreButtons"
        @update-theme="setTheme"
        @update-color="setColorOverride"
        @clear-color="clearColorOverride"
        @update-score-scale="setScoreScale"
        @reset-appearance="resetAppearance"
        @update-branding="updateBranding"
        @reset-branding="resetBranding"
        @clear-teams="resetAll"
        @test-sound="testSound"
      />

      <HistoryPanel
        :is-open="isHistoryOpen"
        :entries="historyReversed"
        :can-undo="canUndo"
        :can-redo="canRedo"
        @close="toggleHistory"
        @undo="undo"
        @redo="redo"
        @clear="clearHistory"
      />

      <CountdownOverlay
        :formatted="formattedCountdown"
        :is-counting-down="isCountingDown"
        :is-paused="isPaused"
        @pause="pauseCountdown"
        @resume="resumeCountdown"
        @reset="resetCountdown"
      />

      <transition-group
        ref="teamGrid"
        name="fade"
        tag="div"
        :class="[
          'grid gap-2 portrait:gap-2 sm:gap-4 w-full flex-1 min-h-0 px-1 sm:px-4 lg:px-8 pb-2 portrait:pb-2 sm:pb-8 auto-rows-fr',
          teamGridClass
        ]"
      >
        <TeamCard
          v-for="team in teams"
          :key="team.id"
          :team="team"
          :score-buttons="scoreButtons"
          :is-leader="leaders.includes(team.id)"
          :is-presenting="isPresenting"
          @score="changeScore"
          @remove="removeTeam"
          @rename="renameTeam"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
import AppToolbar from './AppToolbar.vue'
import CountdownOverlay from './CountdownOverlay.vue'
import HistoryPanel from './HistoryPanel.vue'
import LeaderBanner from './LeaderBanner.vue'
import MiniControls from './MiniControls.vue'
import SettingsPanel from './SettingsPanel.vue'
import TeamCard from './TeamCard.vue'

import { MAX_HISTORY, MAX_MINUTES, MAX_SECONDS, MOTION, TIMER_DEFAULTS } from '../config'
import {
  applyAppearance,
  COLOR_FIELDS,
  onSystemThemeChange,
  resolveColors,
  sanitizeAppearance,
  THEME_CHOICES
} from '../lib/appearance'
import { applyBranding, sanitizeBranding } from '../lib/branding'
import { createMotion } from '../lib/motion'
import { createScoreButton, moveScoreButton, normalizeScoreButtons } from '../lib/scoreButtons'
import { createSfx } from '../lib/sfx'
import { readSnapshot, saveSnapshot } from '../lib/storage'
import { uid } from '../lib/uid'

// Kept outside the component so Vue never proxies the WebAudio context or the tween map.
const sfx = createSfx()
const motion = createMotion()

export default {
  name: 'Scoreboard',
  components: {
    AppToolbar,
    CountdownOverlay,
    HistoryPanel,
    LeaderBanner,
    MiniControls,
    SettingsPanel,
    TeamCard
  },
  data() {
    return {
      title: '',
      teams: [],
      scoreButtons: normalizeScoreButtons(),
      branding: sanitizeBranding(),
      appearance: sanitizeAppearance(),
      history: [],
      redoStack: [],
      isPanelOpen: false,
      isHistoryOpen: false,
      isPresenting: false,
      isMuted: false,
      minutes: TIMER_DEFAULTS.minutes,
      seconds: TIMER_DEFAULTS.seconds,
      originalMinutes: 0,
      originalSeconds: 0,
      isCountingDown: false,
      isPaused: false,
      countdown: null,
      isFlashing: false,
      saveTimer: null,
      stopWatchingSystemTheme: null
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
    },
    resolvedColors() {
      return resolveColors(this.appearance)
    },
    colorFields() {
      return COLOR_FIELDS
    },
    themeChoices() {
      return THEME_CHOICES
    }
  },
  watch: {
    title() {
      this.syncBranding()
      this.save()
    },
    branding: {
      deep: true,
      handler() {
        this.syncBranding()
        this.save()
      }
    },
    appearance: {
      deep: true,
      handler() {
        this.syncLook()
        this.save()
      }
    },
    teams: {
      deep: true,
      handler() {
        this.save()
      }
    },
    scoreButtons: {
      deep: true,
      handler() {
        this.save()
      }
    }
  },
  mounted() {
    this.load()
    this.syncLook()
    sfx.init()
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('beforeunload', this.flushSave)
    this.animateEntrance()
    this.stopWatchingSystemTheme = onSystemThemeChange(this.handleSystemThemeChange)
  },
  beforeUnmount() {
    this.stopTicking()
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('beforeunload', this.flushSave)
    this.stopWatchingSystemTheme?.()
    this.flushSave()
  },
  methods: {
    // ---------- persistence ----------
    // localStorage writes are synchronous, and the appearance slider fires on every
    // frame of a drag — so coalesce bursts of watcher calls into one write.
    save() {
      clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(this.flushSave, 150)
    },
    flushSave() {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
      saveSnapshot(this)
    },
    load() {
      const snapshot = readSnapshot()
      if (!snapshot) {
        this.isPanelOpen = true
        return
      }
      this.title = snapshot.title
      this.teams = snapshot.teams
      this.scoreButtons = snapshot.scoreButtons
      this.branding = snapshot.branding
      this.appearance = snapshot.appearance
      this.history = snapshot.history
      this.minutes = snapshot.minutes
      this.seconds = snapshot.seconds
      this.isMuted = snapshot.isMuted
      // Don't cover the board with settings when there's already a saved game
      this.isPanelOpen = this.teams.length === 0
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

    // ---------- branding & appearance ----------
    syncBranding() {
      applyBranding({ branding: this.branding, title: this.title })
    },
    syncLook() {
      applyAppearance(this.appearance)
    },
    handleSystemThemeChange() {
      if (this.appearance.theme === 'auto') this.syncLook()
    },
    updateBranding({ key, value }) {
      // Assigned raw (not re-sanitized) so partially-typed values survive each keystroke;
      // sanitizeBranding() runs on load instead.
      this.branding = { ...this.branding, [key]: value }
    },
    resetBranding() {
      this.branding = sanitizeBranding()
    },
    setTheme(theme) {
      this.appearance = sanitizeAppearance({ ...this.appearance, theme })
    },
    setColorOverride({ key, value }) {
      const overrides = { ...this.appearance.overrides, [key]: value }
      this.appearance = sanitizeAppearance({ ...this.appearance, overrides })
    },
    clearColorOverride(key) {
      const overrides = { ...this.appearance.overrides }
      delete overrides[key]
      this.appearance = sanitizeAppearance({ ...this.appearance, overrides })
    },
    setScoreScale(value) {
      this.appearance = sanitizeAppearance({ ...this.appearance, scoreScale: value })
    },
    resetAppearance() {
      this.appearance = sanitizeAppearance()
    },

    // ---------- score buttons ----------
    addScoreButton() {
      this.scoreButtons = [...this.scoreButtons, createScoreButton(this.scoreButtons)]
    },
    removeScoreButton(index) {
      if (this.scoreButtons.length <= 1) return
      this.scoreButtons = this.scoreButtons.filter((_, i) => i !== index)
    },
    moveButton({ index, delta }) {
      this.scoreButtons = moveScoreButton(this.scoreButtons, index, index + delta)
    },
    updateButton({ index, patch }) {
      const next = this.scoreButtons.map((button, i) => {
        if (i !== index) return button
        return normalizeScoreButtons([{ ...button, ...patch }])[0]
      })
      this.scoreButtons = next
    },
    resetScoreButtons() {
      this.scoreButtons = normalizeScoreButtons()
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
      motion.cancelTeam(teamId)
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
    renameTeam(teamId, name) {
      const team = this.teams.find((t) => t.id === teamId)
      if (team) team.name = name
    },
    changeScore(teamId, amount) {
      const team = this.teams.find((t) => t.id === teamId)
      if (!team || typeof amount !== 'number' || Number.isNaN(amount)) return
      const prevScore = team.score
      const nextScore = prevScore + amount
      team.score = nextScore
      team.lastChange = amount
      // v1 behavior: correct.wav on +, buzzer on − (wrong.wav was never wired up)
      sfx.play(amount >= 0 ? 'correct' : 'alarm', { isMuted: this.isMuted })
      motion.tweenScore(team, nextScore)
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
      }, MOTION.scoreFlash)
    },

    // ---------- history / undo ----------
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
            motion.tweenScore(team, entry.prevScore)
            setTimeout(() => {
              team.lastChange = 0
            }, MOTION.scoreFlash)
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
            motion.tweenScore(team, entry.nextScore)
            setTimeout(() => {
              team.lastChange = 0
            }, MOTION.scoreFlash)
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
    toggleMute() {
      this.isMuted = !this.isMuted
      this.save()
    },
    testSound() {
      // explicit sound check — plays even when muted
      sfx.play('tick', { isMuted: this.isMuted, force: true })
    },

    // ---------- motion ----------
    flashBackground() {
      this.isFlashing = true
      setTimeout(() => {
        this.isFlashing = false
      }, MOTION.flash)
    },
    celebrateWinner() {
      motion.fireConfetti()
      const cards = this.leaders.map((id) => this.cardElement(id)).filter(Boolean)
      motion.pulseCards(cards)
    },
    cardElement(teamId) {
      return this.$refs.teamGrid?.querySelector(`[data-team-id="${teamId}"]`) ?? null
    },
    popCard(teamId) {
      motion.popCard(this.cardElement(teamId))
    },
    animateEntrance() {
      motion.animateEntrance(this.$refs.teamGrid?.querySelectorAll('.team-card'))
    },

    // ---------- timer ----------
    // Only coerce non-numeric input here; clamping happens in normalizeTimer() so that
    // typing "65" into the seconds field is not fought mid-keystroke.
    setMinutes(value) {
      this.minutes = Number.isFinite(value) ? Math.floor(value) : 0
    },
    setSeconds(value) {
      this.seconds = Number.isFinite(value) ? Math.floor(value) : 0
    },
    normalizeTimer() {
      this.setMinutes(Math.min(Math.max(0, this.minutes), MAX_MINUTES))
      this.setSeconds(Math.min(Math.max(0, this.seconds), MAX_SECONDS))
    },
    stopTicking() {
      if (this.countdown) {
        clearInterval(this.countdown)
        this.countdown = null
      }
    },
    startCountdown() {
      this.stopTicking()
      this.normalizeTimer()
      if (this.minutes === 0 && this.seconds === 0) return

      this.originalMinutes = this.minutes
      this.originalSeconds = this.seconds
      this.isCountingDown = true
      this.isPaused = false
      sfx.play('tick', { isMuted: this.isMuted })
      this.countdown = setInterval(this.tickOnce, 1000)
      this.save()
    },
    tickOnce() {
      if (this.seconds === 1 && this.minutes === 0) {
        this.seconds = 0
        sfx.play('alarm', { isMuted: this.isMuted })
        this.stopTicking()
        this.isCountingDown = false
        this.isPaused = false
        this.flashBackground()
        this.minutes = this.originalMinutes
        this.seconds = this.originalSeconds
      } else {
        sfx.play('tick', { isMuted: this.isMuted })
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
      if (
        !window.confirm(
          `Hapus semua ${this.teams.length} tim? Anda bisa mengurungkan tepat setelah ini.`
        )
      ) {
        return
      }
      this.stopTicking()
      this.isCountingDown = false
      this.isPaused = false
      const snapshot = this.teams.map((t) => ({
        id: t.id,
        name: t.name,
        score: t.score,
        displayScore: t.displayScore ?? t.score
      }))
      motion.cancelAll(this.teams.map((t) => t.id))
      this.teams = []
      this.minutes = TIMER_DEFAULTS.minutes
      this.seconds = TIMER_DEFAULTS.seconds
      this.pushHistory({ type: 'reset', teams: snapshot })
    }
  }
}
</script>
