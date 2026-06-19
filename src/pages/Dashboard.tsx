import { useVTNavigate } from '../hooks/useVTNavigate'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWorkouts } from '../hooks/useWorkouts'
import { useWorkout } from '../contexts/WorkoutContext'
import { useProgramProgress, useCompletedSessions, totalSessions, getNextSession } from '../hooks/useProgramProgress'
import { PROGRAMS, getProgram } from '../data/programs'
import ScrollReveal from '../components/ScrollReveal'

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const SCHEDULE_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default function Dashboard() {
  const { user } = useAuth()
  const { workouts } = useWorkouts()
  const { dispatch } = useWorkout()
  const { progress } = useProgramProgress()
  const { completedFor, isComplete } = useCompletedSessions()
  const navigate = useVTNavigate()

  const name = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  const activeProgram = getProgram(progress?.programId) ?? PROGRAMS[0]
  const done = completedFor(activeProgram.id)
  const total = totalSessions(activeProgram.id)
  const pct = total ? Math.round((done / total) * 100) : null
  const left = total != null ? Math.max(0, total - done) : null

  const phase = progress?.programId === activeProgram.id
    ? activeProgram.phases.find((p) => p.id === progress.phaseId)
    : activeProgram.phases[0]
  const curWeek = progress?.programId === activeProgram.id ? progress.week : 1
  const todayIndex = new Date().getDay()

  const weekRows = activeProgram.schedule
    ? SCHEDULE_KEYS.slice(1, 6).map((key, i) => {
        const dayId = activeProgram.schedule![key]
        const isRest = !dayId || dayId === 'rest'
        const day = isRest ? null : phase?.days.find(
          (d) => `day_${d.day}` === dayId || d.day.toString() === dayId.replace('day_', '')
        )
        return { dayLabel: WEEK_DAYS[i + 1], dayIndex: i + 1, dayNum: day?.day ?? null, focus: day?.focus ?? 'Rest', isRest }
      })
    : (phase?.days ?? []).slice(0, 5).map((day, i) => ({
        dayLabel: WEEK_DAYS[i + 1], dayIndex: i + 1, dayNum: day.day, focus: day.focus, isRest: false,
      }))

  const sessionCount = weekRows.filter((r) => !r.isRest).length

  // Where "Resume" should take you: your current in-progress day, or — if that
  // day is already finished — the next scheduled day/week/phase.
  const resume = (() => {
    if (!progress) return null
    const complete = isComplete(progress.programId, progress.phaseId, progress.week, progress.dayNum)
    if (!complete) return { ...progress, isNext: false }
    const next = getNextSession(progress.programId, progress.phaseId, progress.week, progress.dayNum)
    if (!next) return null
    const ph = getProgram(next.programId)?.phases.find((p) => p.id === next.phaseId)
    const d = ph?.days.find((dd) => dd.day === next.dayNum)
    return { ...next, focus: d?.focus ?? '', isNext: true }
  })()

  const ctaLabel = resume
    ? `${resume.isNext ? 'Next' : 'Resume'}: ${resume.focus}`
    : "Start today's workout"

  function startToday() {
    if (resume) navigate(`/program/${resume.programId}/${resume.phaseId}/w/${resume.week}/d/${resume.dayNum}`)
    else if (phase) navigate(`/program/${activeProgram.id}/${phase.id}/w/1/d/${phase.days[0].day}`)
    else navigate('/programs')
  }

  function startFreeSession() {
    dispatch({ type: 'START' })
    navigate('/workout')
  }

  return (
    <div className="min-h-screen pb-nav apex-page">
      {/* Masthead */}
      <div className="px-6 pt-14">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[15px] font-bold uppercase tracking-[0.18em] text-ink">CleanFit</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">{name}</span>
        </div>
        <div className="mt-3 h-[2px] bg-ink" />
      </div>

      {/* Hero — current program */}
      <ScrollReveal>
      <div className="px-6 pt-7 pb-7">
        <div className="flex items-baseline justify-between mb-3">
          <span className="t-eyebrow">Current Program</span>
          <span className="font-display text-[11px] font-medium tracking-[0.06em] text-ink-mid tabular-nums">
            WK {String(curWeek).padStart(2, '0')}
          </span>
        </div>
        <h1
          className="font-display font-medium ink-tint leading-[0.92] tracking-[-0.035em] head-rise"
          style={{ fontSize: 'clamp(46px, 14vw, 66px)', animationDelay: '60ms' }}
        >
          {activeProgram.name}
        </h1>
        {activeProgram.fullName && activeProgram.fullName !== activeProgram.name && (
          <p className="font-display text-[15px] font-light text-ink-mid mt-2 tracking-[-0.01em]">
            {activeProgram.fullName}
          </p>
        )}

        {/* Progress */}
        <div className="mt-7">
          <div className="flex items-baseline justify-between mb-2">
            <span className="t-eyebrow">Progress</span>
            <span className="font-display text-[13px] font-medium text-ink tabular-nums">
              {pct !== null ? `${pct}%` : 'ongoing'}
            </span>
          </div>
          <div className="h-[2px] bg-border relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-[2px] bg-accent"
              style={{ width: `${pct ?? 0}%`, transition: 'width 0.8s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted tabular-nums">
            <span>{done} done</span>
            {left !== null && <span>{left} left</span>}
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* This week — numbered index */}
      <ScrollReveal delay={60}>
      <div className="px-6 pb-1">
        <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-2.5 mb-1">
          <span className="t-eyebrow">This Week</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted tabular-nums">
            {sessionCount} sessions
          </span>
        </div>
        <div className="apex-stagger">
          {weekRows.map((row, i) => {
            const isDone = row.dayNum !== null && phase
              ? isComplete(activeProgram.id, phase.id, curWeek, row.dayNum)
              : false
            const isToday = row.dayIndex === todayIndex

            return (
              <button
                key={i}
                onClick={() => !row.isRest && row.dayNum && phase && navigate(`/program/${activeProgram.id}/${phase.id}/w/${curWeek}/d/${row.dayNum}`)}
                disabled={row.isRest}
                className={`w-full flex items-center gap-3.5 py-3.5 border-b-[0.5px] border-border last:border-b-0 text-left active:scale-[0.99] transition-transform duration-100 ${row.isRest ? 'cursor-default' : ''}`}
                style={isToday && !row.isRest
                  ? {
                      borderLeft: '2px solid var(--color-accent)',
                      paddingLeft: 14,
                      background: 'linear-gradient(90deg, color-mix(in oklab, var(--color-accent) 13%, transparent) 0%, transparent 72%)',
                    }
                  : { paddingLeft: 16 }}
              >
                <span className="font-display text-[13px] font-medium text-ink-muted tabular-nums w-6 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted w-9 flex-shrink-0">
                  {row.dayLabel}
                </span>
                <span className={`font-display flex-1 text-[17px] tracking-[-0.01em] leading-tight ${
                  isDone ? 'font-light text-ink-muted line-through decoration-[0.5px]' : row.isRest ? 'font-light text-ink-muted' : 'font-medium text-ink'
                }`}>
                  {row.focus}
                </span>
                {row.isRest
                  ? <span className="text-[11px] text-ink-muted flex-shrink-0">rest</span>
                  : isDone
                  ? <span className="text-[14px] text-accent flex-shrink-0 w-4 text-right">✓</span>
                  : <ArrowRight size={15} className={`flex-shrink-0 ${isToday ? 'text-accent' : 'text-ink-muted'}`} />}
              </button>
            )
          })}
        </div>
      </div>
      </ScrollReveal>

      {/* Primary CTA */}
      <ScrollReveal delay={120}>
      <div className="px-6 pt-6 pb-3">
        <button
          onClick={startToday}
          className="w-full bg-accent text-white py-[18px] px-5 flex items-center justify-between gap-3 active:opacity-80 active:scale-[0.98] transition-all duration-100"
        >
          <span className="t-cta truncate text-left">{ctaLabel}</span>
          <ArrowRight size={16} className="flex-shrink-0" />
        </button>
      </div>

      </ScrollReveal>

      {/* Secondary actions */}
      <div className="px-6 pb-6 flex items-center gap-6">
        <button onClick={() => navigate('/history')} className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted active:text-ink-mid">
          History
        </button>
        <span className="text-border">·</span>
        <button onClick={() => navigate('/progress')} className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted active:text-ink-mid">
          Progress
        </button>
        <span className="text-border">·</span>
        <button onClick={startFreeSession} className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted active:text-ink-mid">
          Free Session
        </button>
      </div>

      {/* Recent */}
      {workouts.length > 0 && (
        <ScrollReveal delay={180}>
        <div className="px-6 pt-2 border-t-[0.5px] border-border">
          <p className="t-eyebrow pt-6 mb-3">Recent</p>
          {workouts.slice(0, 4).map((w) => (
            <div key={w.id} className="flex items-center py-3.5 border-b-[0.5px] border-border last:border-b-0">
              <span className="text-[11px] font-light text-ink-muted w-12 flex-shrink-0 tabular-nums">
                {new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
              <span className="flex-1 text-[14px] font-light text-ink lowercase truncate px-4">{w.name.toLowerCase()}</span>
              {w.durationMinutes && <span className="text-[11px] font-light text-ink-muted flex-shrink-0 tabular-nums">{w.durationMinutes}m</span>}
            </div>
          ))}
        </div>
        </ScrollReveal>
      )}
    </div>
  )
}
