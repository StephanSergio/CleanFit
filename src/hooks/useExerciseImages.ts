import { useState, useEffect, useCallback } from 'react'
import { loadImageDb, matchImage } from '../lib/exerciseImages'
import type { ImageEntry } from '../lib/exerciseImages'

type IndexedEntry = Awaited<ReturnType<typeof loadImageDb>>[number]

export function useExerciseImages() {
  const [db, setDb] = useState<IndexedEntry[]>([])

  useEffect(() => {
    let active = true
    loadImageDb().then((entries) => {
      if (active) setDb(entries)
    })
    return () => { active = false }
  }, [])

  const getImage = useCallback((name: string) => matchImage(name, db), [db])

  return { getImage }
}

export type { ImageEntry }
