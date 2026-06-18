import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

// Last-used weights (and reps) per exercise, remembered across programs so the
// next time you do an exercise its sets are pre-filled with what you lifted last.
// Stored separately from workout history — history is never overwritten.
export interface ExercisePreset {
  weights: number[]
  reps: number[]
}

interface PresetsCtx {
  presets: Record<string, ExercisePreset>
  getPreset: (name: string) => ExercisePreset | undefined
  savePreset: (name: string, weights: number[], reps: number[]) => void
}

const Ctx = createContext<PresetsCtx | null>(null)

// Stable, filesystem-safe doc id from an exercise name (case/spacing-insensitive).
export function presetKey(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown'
}

export function PresetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [presets, setPresets] = useState<Record<string, ExercisePreset>>({})

  useEffect(() => {
    if (!user) { setPresets({}); return }
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'exercisePresets'), (snap) => {
      const map: Record<string, ExercisePreset> = {}
      snap.docs.forEach((d) => {
        const data = d.data()
        map[d.id] = { weights: data.weights ?? [], reps: data.reps ?? [] }
      })
      setPresets(map)
    })
    return unsub
  }, [user])

  const getPreset = useCallback(
    (name: string) => presets[presetKey(name)],
    [presets],
  )

  const savePreset = useCallback((name: string, weights: number[], reps: number[]) => {
    if (!user || weights.length === 0) return
    const key = presetKey(name)
    // Optimistic local update so the next exercise pre-fills instantly even offline.
    setPresets((prev) => ({ ...prev, [key]: { weights, reps } }))
    setDoc(doc(db, 'users', user.uid, 'exercisePresets', key), {
      name, weights, reps, updatedAt: Date.now(),
    }).catch(() => {})
  }, [user])

  return (
    <Ctx.Provider value={{ presets, getPreset, savePreset }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePresets() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePresets must be inside PresetsProvider')
  return ctx
}

// Apply a preset's weights onto a set count, repeating the last known weight for
// any extra sets. Used when a program prescribes the set count but we want to
// pre-fill weights from last time.
export function applyPresetWeights(preset: ExercisePreset | undefined, setCount: number, fallback: number): number[] {
  return Array.from({ length: setCount }, (_, i) => {
    if (!preset || preset.weights.length === 0) return fallback
    return preset.weights[i] ?? preset.weights[preset.weights.length - 1]
  })
}
