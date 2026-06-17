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
      className={`flex items-center gap-2 px-2.5 py-2 transition-colors ${
        set.completed
          ? 'bg-[#22E8E0]/5 border-[0.5px] border-[#22E8E0]/30'
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
            onClick={() => onChange({ reps: Math.max(1, set.reps - 1) })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-[#636158] flex-shrink-0"
          >
            <Minus size={13} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <input
              type="number"
              inputMode="numeric"
              value={set.reps}
              min={1}
              onChange={(e) => onChange({ reps: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-10 text-center text-[16px] font-extralight bg-transparent text-white focus:outline-none border-b-[0.5px] border-[#2A2A28] focus:border-[#22E8E0] py-0.5"
            />
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#4A4844] mt-1">reps</span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ reps: set.reps + 1 })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-[#636158] flex-shrink-0"
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
            onClick={() => onChange({ weightKg: Math.max(0, set.weightKg - 2.5) })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-[#636158] flex-shrink-0"
          >
            <Minus size={13} strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center">
            <input
              type="number"
              inputMode="decimal"
              value={set.weightKg}
              min={0}
              step={2.5}
              onChange={(e) => onChange({ weightKg: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-12 text-center text-[16px] font-extralight bg-transparent text-white focus:outline-none border-b-[0.5px] border-[#2A2A28] focus:border-[#22E8E0] py-0.5"
            />
            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#4A4844] mt-1">kg</span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ weightKg: set.weightKg + 2.5 })}
            className="w-7 h-7 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] flex items-center justify-center text-[#636158] flex-shrink-0"
          >
            <Plus size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`w-7 h-7 border-[0.5px] flex items-center justify-center transition-colors flex-shrink-0 ${
          set.completed
            ? 'border-[#22E8E0] bg-[#22E8E0] text-[#0F0F0E]'
            : 'border-[#2A2A28] bg-transparent text-[#4A4844]'
        }`}
      >
        <Check size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
