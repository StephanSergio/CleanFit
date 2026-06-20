import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

export interface StepEntry {
  id: string
  date: string
  steps: number
  createdAt: number
}

interface StepsCtx {
  entries: StepEntry[]
  loading: boolean
  logSteps: (date: string, steps: number) => Promise<void>
  removeEntry: (date: string) => Promise<void>
}

const Ctx = createContext<StepsCtx | null>(null)

export function StepsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<StepEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setEntries([]); setLoading(false); return }
    // Listen to the whole collection and sort client-side. We deliberately avoid
    // orderBy('date')/limit in the query: that makes reads depend on a field
    // index and silently drops any doc missing the field — the same class of bug
    // that hid workouts from Progress. Sorting in JS keeps every entry.
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'steps'),
      (snap) => {
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as StepEntry)
        )
        list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)) // date desc
        setEntries(list.slice(0, 90))
        setLoading(false)
      },
      (err) => {
        // Don't fail silently — a denied/erroring listener is exactly what makes
        // logged steps look like they "didn't save".
        console.error('steps onSnapshot failed', err)
        setLoading(false)
      }
    )
    return unsub
  }, [user])

  async function logSteps(date: string, steps: number) {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid, 'steps', date), {
      date,
      steps: Math.max(0, Math.round(steps)),
      createdAt: Date.now(),
    })
  }

  async function removeEntry(date: string) {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'steps', date))
  }

  return (
    <Ctx.Provider value={{ entries, loading, logSteps, removeEntry }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSteps() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSteps must be inside StepsProvider')
  return ctx
}
