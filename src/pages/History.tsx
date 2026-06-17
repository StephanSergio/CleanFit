import { useState } from 'react'
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-[38px] font-bold text-[#1C1C1E] tracking-tight">History</h1>
      </div>

      <div className="mx-5 mb-5 bg-white shadow-sm rounded-[20px] overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#8E8E93]"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-[16px] text-[#1C1C1E]">{MONTHS[month]} {year}</span>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-full bg-[#ECECF1] flex items-center justify-center text-[#8E8E93]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-[#C7C7CC] py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 pb-4">
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />
              const isToday = cell.dateStr === today
              return (
                <div
                  key={cell.dateStr}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-[13px] font-medium relative transition-colors ${
                    isToday
                      ? 'text-white'
                      : cell.hasWorkout
                      ? 'text-[#1C1C1E]'
                      : 'text-[#8E8E93]'
                  }`}
                  style={{
                    background: isToday
                      ? '#F4845F'
                      : cell.hasWorkout
                      ? 'rgba(244,132,95,0.25)'
                      : 'transparent'
                  }}
                >
                  {cell.day}
                  {cell.hasWorkout && !isToday && (
                    <div className="w-1 h-1 rounded-full bg-[#F4845F] absolute bottom-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-5">
        <p className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-wider mb-3">All Workouts</p>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow-sm rounded-[16px] h-16 animate-pulse" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-white shadow-sm rounded-[20px] p-10 text-center">
            <p className="text-[#8E8E93] text-[14px]">No workouts yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-[20px] overflow-hidden">
            {workouts.map((w, i) => (
              <div key={w.id} className={`px-4 py-3.5 flex items-center gap-3 ${i < workouts.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}>
                <div className="w-9 h-9 bg-[#ECECF1] rounded-full flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={15} className="text-[#F4845F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-[#1C1C1E] truncate">{w.name}</p>
                  <p className="text-[12px] text-[#8E8E93] mt-0.5">
                    {new Date(w.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    {w.durationMinutes ? ` · ${w.durationMinutes}m` : ''}
                  </p>
                </div>
                {w.exercises.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end max-w-[40%]">
                    {w.exercises.slice(0, 2).map((ex, ei) => (
                      <span key={ei} className="text-[10px] bg-[#ECECF1] text-[#8E8E93] px-2 py-0.5 rounded-full">
                        {ex.name}
                      </span>
                    ))}
                    {w.exercises.length > 2 && (
                      <span className="text-[10px] text-[#C7C7CC]">+{w.exercises.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
