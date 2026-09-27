import confetti from 'canvas-confetti'
import { animate, stagger } from 'animejs'

import { MOTION } from '../config'

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * anime.js + confetti helpers. One running score tween per team so rapid clicks retarget
 * instead of stacking. Every animation no-ops when the user prefers reduced motion.
 */
export function createMotion() {
  const scoreAnims = new Map()

  function tweenScore(team, to) {
    scoreAnims.get(team.id)?.cancel()
    scoreAnims.delete(team.id)
    if (prefersReducedMotion()) {
      team.displayScore = to
      return
    }
    // anime mutates the reactive property each tick — Vue re-renders the count
    scoreAnims.set(
      team.id,
      animate(team, { displayScore: to, duration: MOTION.scoreTween, ease: 'outExpo' })
    )
  }

  function cancelTeam(teamId) {
    scoreAnims.get(teamId)?.cancel()
    scoreAnims.delete(teamId)
  }

  function cancelAll(teamIds) {
    for (const teamId of teamIds) cancelTeam(teamId)
  }

  /** CSS fade handles opacity concurrently; anime owns the springy scale. */
  function popCard(el) {
    if (!el || prefersReducedMotion()) return
    animate(el, { scale: [0.6, 1], duration: MOTION.cardPop, ease: 'outBack' })
  }

  /** Initial render has no CSS enter transition (no `appear`), so anime owns it. */
  function animateEntrance(cards) {
    if (!cards?.length || prefersReducedMotion()) return
    animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: stagger(MOTION.cardEntranceStagger),
      duration: MOTION.cardEntrance,
      ease: 'outExpo'
    })
  }

  function pulseCards(cards) {
    if (!cards?.length || prefersReducedMotion()) return
    animate(cards, {
      scale: [1, 1.08, 1],
      duration: MOTION.winnerPulse,
      delay: stagger(MOTION.winnerStagger),
      ease: 'inOutQuad'
    })
  }

  function fireConfetti() {
    const fire = (options) => {
      try {
        confetti(options)
      } catch {
        // confetti needs a canvas-capable browser; the board keeps working without it
      }
    }
    fire({ ...MOTION.confetti, origin: { ...MOTION.confetti.origin } })
    const side = MOTION.confettiSide
    setTimeout(() => fire({ ...side, angle: 60, origin: { x: 0 } }), MOTION.confettiSideDelay)
    setTimeout(() => fire({ ...side, angle: 120, origin: { x: 1 } }), MOTION.confettiSideDelay * 2)
  }

  return { tweenScore, cancelTeam, cancelAll, popCard, animateEntrance, pulseCards, fireConfetti }
}
