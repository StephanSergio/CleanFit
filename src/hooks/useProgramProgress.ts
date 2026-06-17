import { useState } from 'react'
import { BUFF_DUDES } from '../data/buffDudes'

interface CurrentProgress {
  phaseId: string
  week: number
  dayNum: number
  phaseName: string
  focus: string
}

const CURRENT_KEY = 'programCurrent_v2'
const COMPLETED_KEY = 'programCompletedSessions_v2'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function sessionKey(phaseId: string, week: number, day: number) {
  return `${phaseId}|${week}|${day}`
}

export function useProgramProgress() {
  const [progress, setProgress] = useState<CurrentProgress | null>(() => load(CURRENT_KEY, null))

  function saveSession(phaseId: string, week: number, dayNum: number, phaseName: string, focus: string) {
    const p = { phaseId, week, dayNum, phaseName, focus }
    setProgress(p)
    save(CURRENT_KEY, p)
  }

  function clear() {
    setProgress(null)
    try { localStorage.removeItem(CURRENT_KEY) } catch {}
  }

  return { progress, saveSession, clear }
}

export function useCompletedSessions() {
  const [keys, setKeys] = useState<string[]>(() => load(COMPLETED_KEY, []))

  function markComplete(phaseId: string, week: number, day: number) {
    const k = sessionKey(phaseId, week, day)
    if (keys.includes(k)) return
    const next = [...keys, k]
    setKeys(next)
    save(COMPLETED_KEY, next)
  }

  function isComplete(phaseId: string, week: number, day: number) {
    return keys.includes(sessionKey(phaseId, week, day))
  }

  return { markComplete, isComplete, completedCount: keys.length }
}

// Next session in schedule order: next day in the same week → first day of the
// next week in this phase → first day/week of the next phase → null (finished).
export function getNextSession(phaseId: string, week: number, day: number) {
  const phase = BUFF_DUDES.phases.find((p) => p.id === phaseId)
  if (!phase) return null

  const dayIdx = phase.days.findIndex((d) => d.day === day)
  if (dayIdx >= 0 && dayIdx < phase.days.length - 1) {
    return { phaseId, week, dayNum: phase.days[dayIdx + 1].day }
  }

  const weekIdx = phase.weeks.indexOf(week)
  if (weekIdx >= 0 && weekIdx < phase.weeks.length - 1) {
    return { phaseId, week: phase.weeks[weekIdx + 1], dayNum: phase.days[0].day }
  }

  const phaseIdx = BUFF_DUDES.phases.findIndex((p) => p.id === phaseId)
  const nextPhase = BUFF_DUDES.phases[phaseIdx + 1]
  if (nextPhase) return { phaseId: nextPhase.id, week: nextPhase.weeks[0], dayNum: nextPhase.days[0].day }

  return null
}

export function totalSessions() {
  return BUFF_DUDES.phases.reduce((n, p) => n + p.weeks.length * p.days.length, 0)
}
