import { Check, Minus, Plus } from 'lucide-react'
import type { WorkoutSet } from '../types'

interface Props {
  setNumber: number
  set: WorkoutSet
  onChange: (patch: Partial<WorkoutSet>) => void
  onToggle: () => void
}

export default function SetRow({ setNumber, set, onChange, onToggle }: Props) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 rounded-[14px] transition-colors ${
        set.completed ? 'bg-[#F4845F]/15 border border-[#F4845F]/40' : 'bg-[#ECECF1] border border-transparent'
      }`}
    >
      <span className="w-5 text-center text-[13px] font-bold text-[#8E8E93] flex-shrink-0">
        {setNumber}
      </span>

      {/* Reps stepper */}
      <div className="flex-1 flex flex-col items-center">
        <span className="text-[9px] text-[#8E8E93] uppercase tracking-wide mb-1">Reps</span>
        <div className="flex items-center gap-1.5 w-full justify-center">
          <button
            type="button"
            onClick={() => onChange({ reps: Math.max(1, set.reps - 1) })}
            className="w-7 h-7 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#636366] active:bg-[#E0E0E6] flex-shrink-0"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={set.reps}
            min={1}
            onChange={(e) => onChange({ reps: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-10 text-center text-[16px] font-bold bg-transparent text-[#1C1C1E] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange({ reps: set.reps + 1 })}
            className="w-7 h-7 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#636366] active:bg-[#E0E0E6] flex-shrink-0"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="w-px h-8 bg-[#E5E5EA] flex-shrink-0" />

      {/* Weight stepper */}
      <div className="flex-1 flex flex-col items-center">
        <span className="text-[9px] text-[#8E8E93] uppercase tracking-wide mb-1">Kg</span>
        <div className="flex items-center gap-1.5 w-full justify-center">
          <button
            type="button"
            onClick={() => onChange({ weightKg: Math.max(0, set.weightKg - 2.5) })}
            className="w-7 h-7 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#636366] active:bg-[#E0E0E6] flex-shrink-0"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <input
            type="number"
            inputMode="decimal"
            value={set.weightKg}
            min={0}
            step={2.5}
            onChange={(e) => onChange({ weightKg: Math.max(0, parseFloat(e.target.value) || 0) })}
            className="w-12 text-center text-[16px] font-bold bg-transparent text-[#1C1C1E] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange({ weightKg: set.weightKg + 2.5 })}
            className="w-7 h-7 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#636366] active:bg-[#E0E0E6] flex-shrink-0"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
          set.completed
            ? 'bg-[#F4845F] text-white'
            : 'bg-[#ECECF1] border border-[#E5E5EA] text-[#C7C7CC]'
        }`}
      >
        <Check size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
