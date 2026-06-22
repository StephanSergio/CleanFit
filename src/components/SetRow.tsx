import { Check, Minus, Plus } from 'lucide-react'
import type { WorkoutSet } from '../types'
import NumField from './NumField'

interface Props {
  setNumber: number
  set: WorkoutSet
  onChange: (patch: Partial<WorkoutSet>) => void
  onToggle: () => void
}

export default function SetRow({ setNumber, set, onChange, onToggle }: Props) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 transition-colors ${
        set.completed
          ? 'bg-accent/5 border-[0.5px] border-accent/30'
          : 'bg-[#1C1C1A] border-[0.5px] border-[#2A2A28]'
      }`}
    >
      <span className="w-4 text-center text-[10px] font-light text-[#4A4844] flex-shrink-0">
        {setNumber}
      </span>

      {/* Reps stepper */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-1.5 w-full justify-center">
          <button
            type="button"
            aria-label="Decrease reps"
            onClick={() => onChange({ reps: Math.max(1, set.reps - 1) })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid flex-shrink-0"
          >
            <Minus size={13} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <NumField
              value={set.reps}
              integer
              min={1}
              ariaLabel="reps"
              onCommit={(reps) => onChange({ reps })}
              className="w-10 text-center text-[16px] font-extralight bg-transparent text-white focus:outline-none border-b-[0.5px] border-[#2A2A28] focus:border-accent py-0.5"
            />
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#4A4844] mt-1">reps</span>
          </div>
          <button
            type="button"
            aria-label="Increase reps"
            onClick={() => onChange({ reps: set.reps + 1 })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid flex-shrink-0"
          >
            <Plus size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="w-px h-8 bg-[#2A2A28] flex-shrink-0" />

      {/* Weight stepper */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-1.5 w-full justify-center">
          <button
            type="button"
            aria-label="Decrease weight"
            onClick={() => onChange({ weightKg: Math.max(0, set.weightKg - 2.5) })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid flex-shrink-0"
          >
            <Minus size={13} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <NumField
              value={set.weightKg}
              min={0}
              step={2.5}
              ariaLabel="weight in kg"
              onCommit={(weightKg) => onChange({ weightKg })}
              className="w-12 text-center text-[16px] font-extralight bg-transparent text-white focus:outline-none border-b-[0.5px] border-[#2A2A28] focus:border-accent py-0.5"
            />
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#4A4844] mt-1">kg</span>
          </div>
          <button
            type="button"
            aria-label="Increase weight"
            onClick={() => onChange({ weightKg: set.weightKg + 2.5 })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid flex-shrink-0"
          >
            <Plus size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <button
        onClick={onToggle}
        aria-label={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
        className={`w-7 h-7 border-[0.5px] flex items-center justify-center flex-shrink-0 active:scale-110 transition-all duration-150 ${
          set.completed
            ? 'border-accent bg-accent text-white'
            : 'border-[#2A2A28] bg-transparent text-[#4A4844]'
        }`}
        style={set.completed ? { animation: 'apex-check 0.25s ease-out' } : {}}
      >
        <Check size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
