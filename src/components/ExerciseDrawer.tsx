import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { fetchAllExercises, searchExercises } from '../lib/wger'
import type { WgerExercise } from '../types'
import ExerciseCard from './ExerciseCard'

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Calves']

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (ex: WgerExercise) => void
  filterCategory?: string
  title?: string
}

export default function ExerciseDrawer({ open, onClose, onSelect, filterCategory, title = 'Add Exercise' }: Props) {
  const [exercises, setExercises] = useState<WgerExercise[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(filterCategory ?? 'All')
  const [loading, setLoading] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchAllExercises().then((data) => {
      setExercises(data)
      setLoading(false)
    })
  }, [open])

  useEffect(() => {
    if (!query.trim()) return
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      const results = await searchExercises(query)
      if (results.length > 0) setExercises(results)
    }, 400)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [query])

  const filtered = exercises.filter((ex) => {
    const matchQuery = !query.trim() || ex.name.toLowerCase().includes(query.toLowerCase())
    const matchCat = category === 'All' || ex.category === category
    return matchQuery && matchCat
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-[#F8F7F4] rounded-t-none flex flex-col max-h-[88vh] border-[0.5px] border-[#E5E3DD]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-[0.5px] border-[#E5E3DD]">
          <h2 className="text-[15px] font-medium text-[#0F0F0E] uppercase tracking-[0.2em]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-transparent flex items-center justify-center text-[#B5B2AA]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center gap-2 border-b-[0.5px] border-[#E5E3DD] px-0 py-3">
            <Search size={15} className="text-[#B5B2AA] flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search exercises…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] font-light text-[#0F0F0E] placeholder-[#B5B2AA] focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#B5B2AA]">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="px-5 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] px-3 py-1.5 rounded-[6px] transition-colors ${
                category === cat
                  ? 'bg-[#0F0F0E] text-white'
                  : 'bg-transparent border-[0.5px] border-[#E5E3DD] text-[#B5B2AA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={24} className="animate-spin text-[#22E8E0]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[#B5B2AA] text-[15px] font-light py-12">No exercises found</p>
          ) : (
            filtered.map((ex, i) => (
              <div
                key={ex.id}
                className={`py-3.5 ${i < filtered.length - 1 ? 'border-b-[0.5px] border-[#E5E3DD]' : ''}`}
              >
                <ExerciseCard
                  exercise={ex}
                  mode="library"
                  onSelect={(e) => { onSelect(e); onClose() }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
