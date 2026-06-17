import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Workout } from '../types'
import { useAuth } from '../hooks/useAuth'

interface WorkoutsCtx {
  workouts: Workout[]
  loading: boolean
  saveWorkout: (w: Omit<Workout, 'id'>) => Promise<string | null>
  updateWorkout: (id: string, w: Omit<Workout, 'id'>) => Promise<void>
  fetchWorkouts: () => Promise<void>
}

const Ctx = createContext<WorkoutsCtx | null>(null)

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)

  const ref = user ? collection(db, 'users', user.uid, 'workouts') : null

  const fetchWorkouts = useCallback(async () => {
    if (!ref) return
    setLoading(true)
    try {
      const snap = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(50)))
      setWorkouts(snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name,
          date: data.date,
          durationMinutes: data.durationMinutes,
          exercises: data.exercises ?? [],
          createdAt: data.createdAt?.seconds,
        } as Workout
      }))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  async function saveWorkout(workout: Omit<Workout, 'id'>) {
    if (!ref || !user) return null
    const docRef = await addDoc(ref, { ...workout, createdAt: serverTimestamp() })
    // Optimistically prepend so consumers see the new workout immediately.
    setWorkouts((prev) => [{ ...workout, id: docRef.id } as Workout, ...prev])
    return docRef.id
  }

  async function updateWorkout(id: string, workout: Omit<Workout, 'id'>) {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'workouts', id), { ...workout })
    // Update in-place so consumers reflect the change without a re-fetch.
    setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, ...workout } : w)))
  }

  return (
    <Ctx.Provider value={{ workouts, loading, saveWorkout, updateWorkout, fetchWorkouts }}>
      {children}
    </Ctx.Provider>
  )
}

export function useWorkouts() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWorkouts must be inside WorkoutsProvider')
  return ctx
}
