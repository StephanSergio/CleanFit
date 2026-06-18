import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWorkouts } from '../hooks/useWorkouts'
import { useWorkout } from '../contexts/WorkoutContext'
import { useProgramProgress, useCompletedSessions, totalSessions } from '../hooks/useProgramProgress'
import { PROGRAMS, getProgram } from '../data/programs'

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const SCHEDULE_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default function Dashboard() {
  const { user } = useAuth()
  const { workouts } = useWorkouts()
  const { dispatch } = useWorkout()
  const { progress } = useProgramProgress()
  const { completedFor, isComplete } = useCompletedSessions()
  const navigate = useNavigate()

  const name = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const activeProgram = getProgram(progress?.programId) ?? PROGRAMS[0]
  const done = completedFor(activeProgram.id)
  const total = totalSessions(activeProgram.id)
  const pct = total ? Math.round((done / total) * 100) : null

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

  function startToday() {
    if (progress) navigate(`/program/${progress.programId}/${progress.phaseId}/w/${progress.week}/d/${progress.dayNum}`)
    else if (phase) navigate(`/program/${activeProgram.id}/${phase.id}/w/1/d/${phase.days[0].day}`)
    else navigate('/programs')
  }

  function startFreeSession() {
    dispatch({ type: 'START' })
    navigate('/workout')
  }

  return (
    <div className="min-h-screen bg-bg pb-nav apex-page">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-baseline justify-between border-b-[0.5px] border-border">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink">FitLog</span>
        <span className="text-[11px] font-light text-ink-muted capitalize">{name}</span>
      </div>

      {/* Program */}
      <div className="px-6 pt-8 pb-6 border-b-[0.5px] border-border">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-3">Current Program</p>
        <h1 className="text-[44px] font-extralight text-ink lowercase tracking-[0.01em] leading-[1.05]">
          {activeProgram.name.toLowerCase()}
        </h1>
        {activeProgram.fullName && activeProgram.fullName !== activeProgram.name && (
          <p className="text-[13px] font-extralight text-ink-mid lowercase mt-1">{activeProgram.fullName.toLowerCase()}</p>
        )}

        {/* indigo progress bar */}
        <div className="mt-5">
          <div className="h-[1px] bg-border relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-[1px] bg-accent"
              style={{ width: `${pct ?? 0}%`, transition: 'width 0.8s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-light text-ink-muted tracking-[0.05em]">{done} sessions</span>
            {pct !== null
              ? <span className="text-[10px] font-medium text-ink-mid tracking-[0.05em]">{pct}%</span>
              : <span className="text-[10px] font-light text-ink-muted">ongoing</span>}
          </div>
        </div>
      </div>

      {/* This week */}
      <div className="px-6 pt-6 pb-2 border-b-[0.5px] border-border">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-3">This Week</p>
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
              className={`w-full flex items-center py-3 border-b-[0.5px] border-border last:border-b-0 text-left active:scale-[0.97] transition-transform duration-100 ${row.isRest ? 'cursor-default' : ''}`}
              style={isToday && !isDone
                ? { borderLeft: '3px solid var(--color-accent)', paddingLeft: 12, background: 'var(--color-accent-bg)' }
                : { paddingLeft: 16 }}
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted w-10 flex-shrink-0">
                {row.dayLabel}
              </span>
              {/* Single indigo dot for all non-rest days */}
              {!row.isRest && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-2.5"
                  style={{ background: 'var(--color-accent)', opacity: isDone ? 0.3 : 1 }}
                />
              )}
              <span className={`flex-1 text-[15px] font-light lowercase tracking-[0.01em] ${
                isDone ? 'text-ink-muted' : row.isRest ? 'text-ink-muted' : 'text-ink'
              }`}>
                {row.focus.toLowerCase()}
              </span>
              <span
                className="text-[13px] flex-shrink-0 w-4 text-right"
                style={{ color: isDone ? 'var(--color-accent)' : isToday && !row.isRest ? 'var(--color-accent)' : 'var(--color-ink-muted)' }}
              >
                {isDone ? '✓' : isToday && !row.isRest ? '·' : row.isRest ? '–' : '○'}
              </span>
            </button>
          )
        })}
        </div>
      </div>

      {/* Single primary CTA */}
      <div className="px-6 pt-6 pb-3">
        <button
          onClick={startToday}
          className="w-full bg-accent text-white py-[18px] t-cta active:opacity-80 active:scale-[0.97] transition-all duration-100"
        >
          Start Today's Workout
        </button>
      </div>

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
        <div className="px-6 pt-2 border-t-[0.5px] border-border">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted pt-6 mb-3">Recent</p>
          {workouts.slice(0, 4).map((w) => (
            <div key={w.id} className="flex items-center py-3.5 border-b-[0.5px] border-border last:border-b-0">
              <span className="text-[11px] font-light text-ink-muted w-12 flex-shrink-0">
                {new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
              <span className="flex-1 text-[14px] font-light text-ink lowercase truncate px-4">{w.name.toLowerCase()}</span>
              {w.durationMinutes && <span className="text-[11px] font-light text-ink-muted flex-shrink-0">{w.durationMinutes}m</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
