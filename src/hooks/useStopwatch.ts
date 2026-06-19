import { useState, useEffect, useCallback } from 'react'

// A pausable, resettable stopwatch whose state survives reloads. State is two
// fields: `baseMs` (time banked from previous running stretches) plus `startedAt`
// (when the current stretch began, or null when paused). Elapsed is derived, so
// the clock stays accurate across backgrounding without an always-on interval.
interface Persisted {
  baseMs: number
  startedAt: number | null
}

function fmt(totalMs: number): string {
  const total = Math.max(0, Math.floor(totalMs / 1000))
  const m = Math.floor(total / 60).toString().padStart(2, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function useStopwatch(storageKey: string) {
  const [state, setState] = useState<Persisted>(() => {
    try {
      const r = localStorage.getItem(storageKey)
      if (r) return JSON.parse(r) as Persisted
    } catch {/* fall through */}
    return { baseMs: 0, startedAt: Date.now() }
  })
  // A throwaway counter purely to re-render once per second while running.
  const [, tick] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch {/* ignore */}
  }, [state, storageKey])

  useEffect(() => {
    if (state.startedAt === null) return
    const id = setInterval(() => tick((n) => n + 1), 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') tick((n) => n + 1) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [state.startedAt])

  const elapsedMs = state.baseMs + (state.startedAt !== null ? Date.now() - state.startedAt : 0)
  const running = state.startedAt !== null

  const toggle = useCallback(() => setState((s) => s.startedAt === null
    ? { ...s, startedAt: Date.now() }
    : { baseMs: s.baseMs + (Date.now() - s.startedAt), startedAt: null }
  ), [])

  // Reset to zero. Keeps running if it was running, stays paused if it was paused.
  const reset = useCallback(() => setState((s) => ({
    baseMs: 0,
    startedAt: s.startedAt === null ? null : Date.now(),
  })), [])

  const clear = useCallback(() => {
    try { localStorage.removeItem(storageKey) } catch {/* ignore */}
  }, [storageKey])

  return { display: fmt(elapsedMs), elapsedMs, running, toggle, reset, clear }
}
