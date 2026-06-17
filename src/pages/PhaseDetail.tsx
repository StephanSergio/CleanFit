import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { BUFF_DUDES } from '../data/buffDudes'
import { useCompletedSessions } from '../hooks/useProgramProgress'

export default function PhaseDetail() {
  const { phaseId } = useParams()
  const navigate = useNavigate()
  const { isComplete } = useCompletedSessions()
  const phase = BUFF_DUDES.phases.find((p) => p.id === phaseId)

  if (!phase) return null

  const phaseIndex = BUFF_DUDES.phases.findIndex((p) => p.id === phaseId) + 1
  const totalForPhase = phase.weeks.length * phase.days.length

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="sticky top-0 z-10 bg-[#F2F2F7]/95 backdrop-blur-xl px-6 pt-14 pb-4 border-b border-[#E5E5EA]">
        <button
          onClick={() => navigate('/program')}
          className="flex items-center gap-1.5 text-[#8E8E93] text-[14px] mb-3"
        >
          <ArrowLeft size={16} />Program
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#F4845F] mb-1">
          Phase {phaseIndex} of {BUFF_DUDES.phases.length}
        </p>
        <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight">{phase.name}</h1>
        <p className="text-[13px] text-[#8E8E93] mt-1">
          Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]} · {phase.days.length} days/week · {totalForPhase} sessions
        </p>
      </div>

      <div className="px-6 pt-4 pb-2 border-b border-[#E5E5EA]">
        <p className="text-[13px] text-[#8E8E93] leading-relaxed">{phase.note}</p>
      </div>

      {phase.weeks.map((week) => (
        <div key={week} className="px-5 pt-5">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-[#8E8E93] mb-2.5">
            Week {week}
          </p>
          <div className="bg-white shadow-sm rounded-[20px] overflow-hidden">
            {phase.days.map((day, i) => {
              const done = isComplete(phaseId!, week, day.day)
              return (
                <button
                  key={day.day}
                  onClick={() => navigate(`/program/${phaseId}/w/${week}/d/${day.day}`)}
                  className={`w-full text-left px-4 py-4 flex items-center gap-3.5 active:bg-[#F2F2F7] transition-colors ${
                    i < phase.days.length - 1 ? 'border-b border-[#E5E5EA]' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#30D158]' : 'bg-[#F4845F]'}`}>
                    {done
                      ? <Check size={15} className="text-white" strokeWidth={2.5} />
                      : <span className="text-[13px] font-bold text-white">{day.day}</span>
                    }
                  </div>
                  <div className={`flex-1 min-w-0 ${done ? 'opacity-50' : ''}`}>
                    <p className="text-[15px] font-bold text-[#1C1C1E] tracking-tight leading-tight">{day.focus}</p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">
                      Day {day.day} · {day.exercises.length} exercises{done ? ' · Done' : ''}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-[#C7C7CC] flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="h-4" />
    </div>
  )
}
