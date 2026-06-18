import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function History() {
  const { workouts, loading } = useWorkouts()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const workoutDates = new Set(workouts.map((w) => w.date))

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null
    const day = i - firstDay + 1
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return { day, dateStr, hasWorkout: workoutDates.has(dateStr) }
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen pb-nav apex-page">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-[44px] font-display font-light tracking-[-0.02em] text-ink lowercase">history</h1>
      </div>

      {/* Calendar card */}
      <div className="mx-6 mb-5 bg-surface border-[0.5px] border-border overflow-hidden apex-fade">
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex items-center justify-center text-ink-muted bg-transparent active:scale-[0.9] transition-transform duration-100"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[15px] font-light text-ink">{MONTHS[month]} {year}</span>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex items-center justify-center text-ink-muted bg-transparent active:scale-[0.9] transition-transform duration-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 pb-4">
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />
              const isToday = cell.dateStr === today
              return (
                <div
                  key={cell.dateStr}
                  className="aspect-square flex items-center justify-center rounded-none text-[13px] font-light relative"
                  style={
                    isToday
                      ? { background: 'var(--color-accent)', color: '#ffffff', fontWeight: 500 }
                      : cell.hasWorkout
                      ? { background: 'var(--color-ink)', color: 'var(--color-bg)' }
                      : { color: 'var(--color-ink)' }
                  }
                >
                  {cell.day}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Workout list */}
      {!loading && (
      <div className="px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-3">All Workouts</p>
        {workouts.length === 0 ? (
          <p className="text-[13px] font-light text-ink-muted lowercase">no workouts yet.</p>
        ) : (
          <div className="apex-stagger">
            {workouts.map((w, i) => {
              const totalSets = w.exercises.reduce((n, ex) => n + ex.sets.length, 0)
              const doneSets = w.exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0)
              const allDone = totalSets > 0 && doneSets === totalSets
              const partialDone = doneSets > 0 && !allDone

              return (
                <div
                  key={w.id}
                  className={`flex items-start py-4 gap-3 ${i < workouts.length - 1 ? 'border-b-[0.5px] border-border' : ''}`}
                >
                  {/* Completion symbol */}
                  <div className="w-5 flex-shrink-0 pt-0.5 text-center">
                    {allDone
                      ? <span className="text-[12px] text-accent">✓</span>
                      : partialDone
                      ? <span className="text-[12px] text-ink-muted">·</span>
                      : <span className="text-[12px] text-border">○</span>}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <p className="text-[14px] font-light text-ink lowercase truncate flex-1">{w.name.toLowerCase()}</p>
                      <span className="text-[11px] font-light text-ink-muted flex-shrink-0">
                        {new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {w.durationMinutes && (
                        <span className="text-[11px] font-light text-ink-muted">{w.durationMinutes}m</span>
                      )}
                      {totalSets > 0 && (
                        <span className={`text-[11px] font-light ${allDone ? 'text-ink-mid' : 'text-ink-muted'}`}>
                          {doneSets}/{totalSets} sets
                        </span>
                      )}
                      {w.exercises.slice(0, 2).map((ex, ei) => (
                        <span key={ei} className="text-[11px] font-light text-ink-muted truncate">{ex.name.toLowerCase()}</span>
                      ))}
                      {w.exercises.length > 2 && (
                        <span className="text-[11px] font-light text-ink-muted">+{w.exercises.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      )}
    </div>
  )
}
