import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Smoothly interpolates a numeric value toward its target using
 * requestAnimationFrame. When the target changes (e.g. a new pipeline
 * response arrives), the displayed value eases to the new target instead
 * of jumping, giving the dashboard a "living" feel.
 *
 * Respects prefers-reduced-motion by snapping instantly.
 */
export function useAnimatedValue(target: number, durationMs = 700): number {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef<number | null>(null)
  const displayRef = useRef(target)

  useEffect(() => {
    if (prefersReducedMotion()) {
      displayRef.current = target
      setDisplay(target)
      return
    }
    const from = displayRef.current
    if (from === target) return
    const start = performance.now()
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      const pct = Math.min((now - start) / durationMs, 1)
      const value = from + (target - from) * easeOutCubic(pct)
      displayRef.current = value
      setDisplay(value)
      if (pct < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, durationMs])

  return display
}

export default useAnimatedValue
