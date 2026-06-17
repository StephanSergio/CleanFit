import { Repeat2, X } from 'lucide-react'
import type { WgerExercise } from '../types'

interface Props {
  exercise: WgerExercise
  onSelect?: (ex: WgerExercise) => void
  onSwap?: () => void
  onRemove?: () => void
  mode?: 'library' | 'workout'
}

export default function ExerciseCard({ exercise, onSelect, onSwap, onRemove, mode = 'library' }: Props) {
  return (
    <div
      className={`flex items-center gap-3 ${
        mode === 'library' ? 'active:opacity-70 cursor-pointer' : ''
      }`}
      onClick={mode === 'library' ? () => onSelect?.(exercise) : undefined}
    >
      <div className="w-10 h-10 bg-[#1C1C1A] overflow-hidden flex-shrink-0 flex items-center justify-center">
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover grayscale contrast-110"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              el.parentElement!.innerHTML = `<span class="text-[14px] font-extralight text-[#4A4844]">${exercise.name.charAt(0)}</span>`
            }}
          />
        ) : (
          <span className="text-[14px] font-extralight text-[#4A4844]">{exercise.name.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-light text-[#0F0F0E] truncate">{exercise.name}</p>
        <span className="inline-block text-[9px] font-medium uppercase tracking-[0.14em] text-[#B5B2AA] border-[0.5px] border-[#E5E3DD] px-2 py-0.5 rounded-[6px] mt-0.5">
          {exercise.category}
        </span>
      </div>

      {mode === 'workout' && (
        <div className="flex gap-1.5 flex-shrink-0">
          {onSwap && (
            <button
              onClick={(e) => { e.stopPropagation(); onSwap() }}
              className="p-2 bg-transparent border-[0.5px] border-[#E5E3DD] text-[#B5B2AA]"
              aria-label="Swap exercise"
            >
              <Repeat2 size={16} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="p-2 bg-transparent border-[0.5px] border-[#22E8E0]/30 text-[#22E8E0]"
              aria-label="Remove exercise"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
