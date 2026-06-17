import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { getProgram } from '../data/programs'
import { useCompletedSessions } from '../hooks/useProgramProgress'
import ScrollReveal from '../components/ScrollReveal'
import type { ProgramDay } from '../data/buffDudes'

export default function PhaseDetail() {
  const { programId, phaseId } = useParams()
  const navigate = useNavigate()
  const { isComplete, completedFor } = useCompletedSessions()
  const program = getProgram(programId)
  const phase = program?.phases.find((p) => p.id === phaseId)

  if (!program || !phase) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-[15px] font-light text-[#B5B2AA]">Not found.</p>
      </div>
    )
  }

  const phaseIndex = program.phases.findIndex((p) => p.id === phaseId) + 1
  const ongoing = phase.weeks === null

  const currentWeek = ongoing ? Math.floor(completedFor(program.id) / phase.days.length) + 1 : 1
  const weeksToShow: number[] = ongoing ? [currentWeek] : (phase.weeks as number[])

  function dayRow(week: number, day: ProgramDay, isLast: boolean, idx: number) {
    const done = isComplete(program!.id, phase!.id, week, day.day)
    return (
      <ScrollReveal key={day.day} delay={idx * 40}>
        <button
          onClick={() => navigate(`/program/${program!.id}/${phase!.id}/w/${week}/d/${day.day}`)}
          className={`w-full text-left py-4 flex items-center gap-3.5 ${
            !isLast ? 'border-b-[0.5px] border-[#E5E3DD]' : ''
          } ${done ? 'opacity-40' : ''}`}
        >
        {/* Day number circle */}
        <div
          className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
            done
              ? 'bg-[#22E8E0] border-[0.5px] border-[#22E8E0]'
              : 'border-[0.5px] border-[#0F0F0E]'
          }`}
        >
          {done
            ? <Check size={13} className="text-[#0F0F0E]" strokeWidth={2} />
            : <span className="text-[12px] font-light text-[#0F0F0E]">{day.day}</span>
          }
        </div>

        {/* Day info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-light text-[#0F0F0E] lowercase tracking-[0.01em] leading-tight">
              {day.focus}
            </p>
            {day.type && (
              <span className="border-[0.5px] border-[#E5E3DD] text-[9px] font-medium uppercase tracking-[0.14em] text-[#B5B2AA] px-2 py-0.5 rounded-[6px]">
                {day.type}
              </span>
            )}
          </div>
          <p className="text-[11px] font-light text-[#636158] mt-0.5">
            {day.exercises.length} exercises{done ? ' · done' : ''}
          </p>
        </div>

          <ArrowRight size={14} className="text-[#B5B2AA] flex-shrink-0" />
        </button>
      </ScrollReveal>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-nav apex-page">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#F8F7F4] px-6 pt-14 pb-5 border-b-[0.5px] border-[#E5E3DD]">
        <button
          onClick={() => navigate(`/program/${program.id}`)}
          className="flex items-center gap-1.5 text-[#B5B2AA] text-[11px] font-medium uppercase tracking-[0.14em] mb-4"
        >
          <ArrowLeft size={14} />
          {program.name.toLowerCase()}
        </button>

        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#636158] mb-1">
          {program.phases.length > 1
            ? `Phase ${phaseIndex} of ${program.phases.length}`
            : 'Weekly Cycle'}
        </p>
        <h1 className="text-[28px] font-light text-[#0F0F0E] lowercase">
          {phase.name}
        </h1>
        <p className="text-[13px] font-light text-[#636158] mt-1">
          {ongoing
            ? `${phase.days.length} days/week · repeats indefinitely`
            : `Weeks ${(phase.weeks as number[])[0]}–${(phase.weeks as number[])[(phase.weeks as number[]).length - 1]} · ${phase.days.length} days/week`}
        </p>
      </div>

      {/* Phase note */}
      {phase.note && (
        <div className="px-6 py-4 border-b-[0.5px] border-[#E5E3DD]">
          <p className="text-[13px] font-light text-[#636158] leading-relaxed">{phase.note}</p>
        </div>
      )}

      {/* Weeks */}
      {weeksToShow.map((week) => (
        <div key={week} className="px-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#636158] pt-6 pb-2">
            Week {week}
          </p>
          <div className="apex-stagger">
            {phase.days.map((day, i) => dayRow(week, day, i === phase.days.length - 1, i))}
          </div>
        </div>
      ))}

      <div className="h-4" />
    </div>
  )
}
