import { useState } from 'react'
import { BUFF_DUDES } from '../data/buffDudes'

interface CurrentProgress {
  phaseId: string
  dayNum: number
  phaseName: string
  focus: string
}

interface CompletedEntry {
  date: string // YYYY-MM-DD
}

type CompletedMap = Record<string, CompletedEntry> // `${phaseId}-${dayNum}`

const CURRENT_KEY = 'programCurrent_v1'
const COMPLETED_KEY = 'programCompleted_v1'

function getISOWeekKey(dateStr: string): string {
  const date = new Date(dateStr)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

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

export function useProgramProgress() {
  const [progress, setProgress] = useState<CurrentProgress | null>(() => load(CURRENT_KEY, null))

  function saveDay(phaseId: string, dayNum: number, phaseName: string, focus: string) {
    const p = { phaseId, dayNum, phaseName, focus }
    setProgress(p)
    save(CURRENT_KEY, p)
  }

  function clear() {
    setProgress(null)
    try { localStorage.removeItem(CURRENT_KEY) } catch {}
  }

  return { progress, saveDay, clear }
}

export function useCompletedDays() {
  const [completedMap, setCompletedMap] = useState<CompletedMap>(() => load(COMPLETED_KEY, {}))

  const todayWeek = getISOWeekKey(new Date().toISOString().split('T')[0])

  function markComplete(phaseId: string, dayNum: number) {
    const key = `${phaseId}-${dayNum}`
    const entry: CompletedEntry = { date: new Date().toISOString().split('T')[0] }
    const next = { ...completedMap, [key]: entry }
    setCompletedMap(next)
    save(COMPLETED_KEY, next)
  }

  function isCompletedThisWeek(phaseId: string, dayNum: number): boolean {
    const entry = completedMap[`${phaseId}-${dayNum}`]
    if (!entry) return false
    return getISOWeekKey(entry.date) === todayWeek
  }

  function getCompletedDate(phaseId: string, dayNum: number): string | null {
    return completedMap[`${phaseId}-${dayNum}`]?.date ?? null
  }

  return { markComplete, isCompletedThisWeek, getCompletedDate }
}

export function getNextDay(phaseId: string, dayNum: number): { phaseId: string; dayNum: number } | null {
  const phase = BUFF_DUDES.phases.find((p) => p.id === phaseId)
  if (!phase) return null

  const nextDayInPhase = phase.days.find((d) => d.day === dayNum + 1)
  if (nextDayInPhase) return { phaseId, dayNum: dayNum + 1 }

  const phaseIdx = BUFF_DUDES.phases.findIndex((p) => p.id === phaseId)
  const nextPhase = BUFF_DUDES.phases[phaseIdx + 1]
  if (nextPhase) return { phaseId: nextPhase.id, dayNum: 1 }

  return null
}
