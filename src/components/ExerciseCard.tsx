import { Repeat2, X } from 'lucide-react'
import type { WgerExercise } from '../types'

const categoryColors: Record<string, string> = {
  Chest: 'bg-blue-50 text-blue-600',
  Back: 'bg-purple-50 text-purple-600',
  Legs: 'bg-green-50 text-green-600',
  Arms: 'bg-orange-50 text-orange-600',
  Shoulders: 'bg-pink-50 text-pink-600',
  Abs: 'bg-yellow-50 text-yellow-700',
  Calves: 'bg-teal-50 text-teal-600',
  Other: 'bg-[#ECECF1] text-[#8E8E93]',
}

interface Props {
  exercise: WgerExercise
  onSelect?: (ex: WgerExercise) => void
  onSwap?: () => void
  onRemove?: () => void
  mode?: 'library' | 'workout'
}

export default function ExerciseCard({ exercise, onSelect, onSwap, onRemove, mode = 'library' }: Props) {
  const colorClass = categoryColors[exercise.category] ?? categoryColors.Other

  return (
    <div
      className={`flex items-center gap-3 ${
        mode === 'library' ? 'active:opacity-70 cursor-pointer' : ''
      }`}
      onClick={mode === 'library' ? () => onSelect?.(exercise) : undefined}
    >
      <div className="w-11 h-11 rounded-[12px] bg-[#ECECF1] overflow-hidden flex-shrink-0 flex items-center justify-center">
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover grayscale contrast-110"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              el.parentElement!.innerHTML = `<span class="text-base font-bold text-[#8E8E93]">${exercise.name.charAt(0)}</span>`
            }}
          />
        ) : (
          <span className="text-base font-bold text-[#8E8E93]">{exercise.name.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-[#1C1C1E] truncate">{exercise.name}</p>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 uppercase tracking-wide ${colorClass}`}>
          {exercise.category}
        </span>
      </div>

      {mode === 'workout' && (
        <div className="flex gap-1.5 flex-shrink-0">
          {onSwap && (
            <button
              onClick={(e) => { e.stopPropagation(); onSwap() }}
              className="p-2 rounded-[12px] bg-[#ECECF1] text-[#8E8E93]"
              aria-label="Swap exercise"
            >
              <Repeat2 size={16} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="p-2 rounded-[12px] bg-[#ECECF1] text-[#FF453A]"
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
