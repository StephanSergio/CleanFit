import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { BUFF_DUDES } from '../data/buffDudes'

const PHASE_COLORS = ['#F4A58A', '#E8916A', '#D97C55', '#C96840']

export default function Program() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="px-6 pt-14 pb-8">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#F4845F] mb-3">
          Training Program
        </p>
        <h1 className="text-[38px] font-bold text-[#1C1C1E] tracking-tight leading-none mb-1">
          Buff Dudes
        </h1>
        <h2 className="text-[38px] font-bold text-[#1C1C1E] tracking-tight leading-none">
          12 Week
        </h2>
        <p className="text-[13px] text-[#8E8E93] mt-3">{BUFF_DUDES.edition}</p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {BUFF_DUDES.phases.map((phase, i) => (
          <button
            key={phase.id}
            onClick={() => navigate(`/program/${phase.id}`)}
            className="w-full text-left rounded-[20px] overflow-hidden active:opacity-80 transition-opacity"
            style={{ background: PHASE_COLORS[i] }}
          >
            <div className="px-5 py-5 flex items-center gap-4">
              <span className="text-[52px] font-bold leading-none tabular-nums text-white/20">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">
                  Phase {i + 1}
                </p>
                <p className="text-[18px] font-bold text-white tracking-tight">{phase.name}</p>
                <p className="text-[13px] text-white/60 mt-0.5">
                  Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]} · {phase.days.length} days
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight size={16} className="text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-6 py-8 text-center">
        <p className="text-[12px] text-[#C7C7CC]">Select a phase to view workouts</p>
      </div>
    </div>
  )
}
