import { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { fetchAllExercises, searchExercises } from '../lib/wger'
import type { WgerExercise } from '../types'
import ExerciseCard from '../components/ExerciseCard'

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Calves']

export default function Exercises() {
  const [all, setAll] = useState<WgerExercise[]>([])
  const [results, setResults] = useState<WgerExercise[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchAllExercises().then((data) => {
      setAll(data)
      setResults(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults(all)
      return
    }
    const timeout = setTimeout(async () => {
      setSearching(true)
      const found = await searchExercises(query)
      setResults(found.length > 0 ? found : all.filter(e => e.name.toLowerCase().includes(query.toLowerCase())))
      setSearching(false)
    }, 400)
    return () => clearTimeout(timeout)
  }, [query, all])

  const filtered = results.filter(
    (ex) => category === 'All' || ex.category === category
  )

  return (
    <div className="min-h-screen pb-nav apex-page">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur px-6 pt-14 pb-3">
        <h1 className="text-[44px] font-extralight text-ink lowercase mb-4">exercises</h1>

        {/* Search */}
        <div className="flex items-center gap-2 border-b-[0.5px] border-border bg-transparent px-0 py-3 mb-4">
          <Search size={15} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search exercises…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] font-light text-ink placeholder-ink-muted focus:outline-none"
          />
          {(searching || loading) && <Loader2 size={14} className="animate-spin text-ink-muted" />}
          {query && !searching && (
            <button onClick={() => setQuery('')} className="text-ink-muted">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] px-3 py-1.5 rounded-[6px] transition-colors ${
                category === cat
                  ? 'bg-accent text-white'
                  : 'border-[0.5px] border-border text-ink-muted bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="flex flex-col gap-[0.5px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-border animate-pulse h-12 rounded-none" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-muted text-[13px] font-light lowercase py-12">no exercises found</p>
        ) : (
          <div>
            {filtered.map((ex, i) => (
              <ScrollReveal key={ex.id} delay={Math.min(i, 6) * 30}>
                <div className={`py-3.5 ${i < filtered.length - 1 ? 'border-b-[0.5px] border-border' : ''}`}>
                  <ExerciseCard exercise={ex} mode="library" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
