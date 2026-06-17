import { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="sticky top-0 z-10 bg-[#F2F2F7]/95 backdrop-blur-xl px-5 pt-14 pb-3">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight mb-3">Exercises</h1>

        <div className="flex items-center gap-2 bg-white rounded-[14px] px-3 py-2.5 shadow-sm mb-3">
          <Search size={16} className="text-[#C7C7CC] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search exercises…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none"
          />
          {(searching || loading) && <Loader2 size={14} className="animate-spin text-[#F4845F]" />}
          {query && !searching && (
            <button onClick={() => setQuery('')} className="text-[#C7C7CC]">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                category === cat ? 'bg-[#F4845F] text-white' : 'bg-white text-[#8E8E93] shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[16px] h-16 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#8E8E93] py-12">No exercises found</p>
        ) : (
          <div className="bg-white shadow-sm rounded-[20px] overflow-hidden">
            {filtered.map((ex, i) => (
              <div
                key={ex.id}
                className={`px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
              >
                <ExerciseCard exercise={ex} mode="library" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
