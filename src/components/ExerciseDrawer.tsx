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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-[28px] flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E5E5EA]">
          <h2 className="text-[17px] font-bold text-[#1C1C1E] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#8E8E93]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-[#ECECF1] rounded-[14px] px-3 py-2.5">
            <Search size={15} className="text-[#C7C7CC] flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search exercises…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[#C7C7CC]">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                category === cat
                  ? 'bg-[#F4845F] text-white'
                  : 'bg-[#ECECF1] text-[#8E8E93]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={24} className="animate-spin text-[#F4845F]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[#C7C7CC] text-[14px] py-12">No exercises found</p>
          ) : (
            filtered.map((ex, i) => (
              <div
                key={ex.id}
                className={`py-3 ${i < filtered.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
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
