import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getProgram } from '../data/programs'
import { useAuth } from './useAuth'

export interface CurrentProgress {
  programId: string
  programName: string
  phaseId: string
  week: number
  dayNum: number
  focus: string
}

// localStorage keys — kept as a fast-read cache so the UI loads instantly,
// then Firestore is the source of truth that survives everything else.
const LS_CURRENT = 'programCurrent_v3'
const LS_COMPLETED = 'programCompletedSessions_v3'

function lsRead<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function lsWrite(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
}

function sessionKey(programId: string, phaseId: string, week: number, day: number) {
  return `${programId}|${phaseId}|${week}|${day}`
}

// ─── Current program position ─────────────────────────────────────────────────

export function useProgramProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<CurrentProgress | null>(() => lsRead(LS_CURRENT, null))

  // On mount, sync from Firestore (overwrites stale localStorage cache).
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid, 'programMeta', 'current'))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as CurrentProgress
          setProgress(data)
          lsWrite(LS_CURRENT, data)
        }
      })
      .catch(() => {/* offline — use localStorage cache */})
  }, [user])

  function saveSession(p: CurrentProgress) {
    setProgress(p)
    lsWrite(LS_CURRENT, p)
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'programMeta', 'current'), p)
        .catch(() => {/* will sync next time they're online */})
    }
  }

  function clear() {
    setProgress(null)
    lsWrite(LS_CURRENT, null)
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'programMeta', 'current'))
        .catch(() => {})
    }
  }

  return { progress, saveSession, clear }
}

// ─── Completed sessions ───────────────────────────────────────────────────────

export function useCompletedSessions() {
  const { user } = useAuth()
  // Store as a Set internally for O(1) lookup; serialise to/from array for storage.
  const [keySet, setKeySet] = useState<Set<string>>(
    () => new Set<string>(lsRead(LS_COMPLETED, []))
  )

  // Sync from Firestore on mount.
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid, 'programMeta', 'completed'))
      .then((snap) => {
        if (snap.exists()) {
          const data = (snap.data().keys ?? []) as string[]
          setKeySet(new Set(data))
          lsWrite(LS_COMPLETED, data)
        }
      })
      .catch(() => {})
  }, [user])

  function markComplete(programId: string, phaseId: string, week: number, day: number) {
    const k = sessionKey(programId, phaseId, week, day)
    if (keySet.has(k)) return
    const next = new Set(keySet)
    next.add(k)
    setKeySet(next)
    const arr = Array.from(next)
    lsWrite(LS_COMPLETED, arr)
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'programMeta', 'completed'), { keys: arr })
        .catch(() => {})
    }
  }

  function isComplete(programId: string, phaseId: string, week: number, day: number) {
    return keySet.has(sessionKey(programId, phaseId, week, day))
  }

  function completedFor(programId: string) {
    let count = 0
    keySet.forEach((k) => { if (k.startsWith(`${programId}|`)) count++ })
    return count
  }

  return { markComplete, isComplete, completedCount: keySet.size, completedFor }
}

// ─── Schedule helpers (no storage) ───────────────────────────────────────────

export function getNextSession(programId: string, phaseId: string, week: number, day: number) {
  const program = getProgram(programId)
  const phase = program?.phases.find((p) => p.id === phaseId)
  if (!program || !phase) return null

  const dayIdx = phase.days.findIndex((d) => d.day === day)
  if (dayIdx >= 0 && dayIdx < phase.days.length - 1) {
    return { programId, phaseId, week, dayNum: phase.days[dayIdx + 1].day }
  }

  // Ongoing cycle (no fixed weeks): just roll to the next week in place.
  if (phase.weeks === null) {
    return { programId, phaseId, week: week + 1, dayNum: phase.days[0].day }
  }

  // Otherwise advance by ABSOLUTE week number: jump to whichever phase owns
  // week N+1. This makes alternating programs (e.g. Build Muscle: Plan A on
  // odd weeks, Plan B on even) flow chronologically 1 → 2 → 3 → … without the
  // user thinking about phases, and still works for sequential phases.
  // Optional ongoing/bonus phases (weeks === null) are not auto-entered.
  const targetWeek = week + 1
  const nextPhase = program.phases.find(
    (p) => Array.isArray(p.weeks) && p.weeks.includes(targetWeek)
  )
  if (nextPhase) {
    return { programId, phaseId: nextPhase.id, week: targetWeek, dayNum: nextPhase.days[0].day }
  }

  return null
}

export function totalSessions(programId: string): number | null {
  const program = getProgram(programId)
  if (!program) return 0
  let total = 0
  let counted = false
  for (const p of program.phases) {
    // Skip optional ongoing/bonus phases — they're not part of the planned count.
    if (p.weeks === null) continue
    total += p.weeks.length * p.days.length
    counted = true
  }
  // If every phase is an ongoing cycle (e.g. PHUL), there's no fixed total.
  return counted ? total : null
}
