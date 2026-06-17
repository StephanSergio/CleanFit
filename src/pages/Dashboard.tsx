import { useNavigate } from 'react-router-dom'
import { Dumbbell, Play, RotateCcw, Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWorkouts } from '../hooks/useWorkouts'
import { useWorkout } from '../contexts/WorkoutContext'
import { useProgramProgress, useCompletedSessions, totalSessions } from '../hooks/useProgramProgress'
import CircleRing from '../components/CircleRing'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const { workouts, loading } = useWorkouts()
  const { dispatch } = useWorkout()
  const { progress } = useProgramProgress()
  const { completedCount } = useCompletedSessions()
  const navigate = useNavigate()

  const name = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  const thisWeek = workouts.filter((w) => {
    const diff = (Date.now() - new Date(w.date).getTime()) / 86400000
    return diff <= 7
  }).length

  const completedProgramDays = completedCount
  const programTotal = totalSessions()
  const weeklyGoal = 4
  const ringPct = Math.min(100, (thisWeek / weeklyGoal) * 100)

  function startFreeSession() {
    dispatch({ type: 'START' })
    navigate('/workout')
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="px-5 pt-14 pb-6">
        <p className="text-[13px] text-[#8E8E93] mb-1">{greeting()}</p>
        <h1 className="text-[38px] font-bold text-[#1C1C1E] tracking-tight leading-none capitalize">
          {name}
        </h1>
      </div>

      {/* Weekly ring + stats */}
      <div className="px-5 mb-6 flex items-center gap-4">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <CircleRing
            percent={ringPct}
            color="#F4845F"
            trackColor="#E5E5EA"
            size={110}
            stroke={9}
          />
          <div className="absolute text-center">
            <p className="text-[28px] font-bold text-[#1C1C1E] leading-none">{thisWeek}</p>
            <p className="text-[11px] text-[#8E8E93]">/ {weeklyGoal}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="bg-white shadow-sm rounded-[16px] px-4 py-3">
            <p className="text-[24px] font-bold text-[#1C1C1E] leading-none">{workouts.length}</p>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">Total sessions</p>
          </div>
          <div className="bg-white shadow-sm rounded-[16px] px-4 py-3">
            <p className="text-[24px] font-bold text-[#1C1C1E] leading-none">{completedProgramDays}<span className="text-[15px] text-[#C7C7CC]">/{programTotal}</span></p>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">Program sessions done</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mb-6">
        {progress ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/program/${progress.phaseId}/w/${progress.week}/d/${progress.dayNum}`)}
              className="w-full bg-[#F4845F] text-white rounded-[16px] px-5 py-4 flex items-center gap-3 active:opacity-80 transition-opacity text-left"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Play size={18} fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80 mb-0.5">Continue Program</p>
                <p className="text-[16px] font-semibold truncate">{progress.focus}</p>
              </div>
            </button>
            <div className="flex gap-3">
              <button
                onClick={startFreeSession}
                className="flex-1 bg-white shadow-sm rounded-[16px] px-4 py-3.5 text-[14px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
              >
                <Dumbbell size={16} className="text-[#F4845F]" />
                Free Session
              </button>
              <button
                onClick={() => navigate('/program')}
                className="flex-1 bg-white shadow-sm rounded-[16px] px-4 py-3.5 text-[14px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
              >
                <RotateCcw size={16} className="text-[#F4845F]" />
                Full Program
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/program/phase_1/w/1/d/1')}
              className="w-full bg-[#F4845F] text-white rounded-[16px] px-5 py-4 flex items-center gap-3 active:opacity-80 transition-opacity text-left"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80 mb-0.5">Buff Dudes 12 Week</p>
                <p className="text-[16px] font-semibold">Begin Program</p>
              </div>
              <Play size={18} fill="white" className="flex-shrink-0" />
            </button>
            <button
              onClick={startFreeSession}
              className="w-full bg-white shadow-sm rounded-[16px] px-5 py-3.5 text-[15px] font-semibold text-[#1C1C1E] flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
            >
              <Dumbbell size={16} className="text-[#F4845F]" />
              Free Session
            </button>
          </div>
        )}
      </div>

      {/* Recent workouts */}
      {!loading && workouts.length > 0 && (
        <div className="px-5">
          <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Recent</p>
          <div className="bg-white shadow-sm rounded-[20px] overflow-hidden">
            {workouts.slice(0, 5).map((w, i) => (
              <div
                key={w.id}
                className={`px-4 py-3.5 flex items-center gap-3 ${i < Math.min(workouts.length, 5) - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
              >
                <div className="w-9 h-9 bg-[#ECECF1] rounded-full flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={15} className="text-[#F4845F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-[#1C1C1E] truncate">{w.name}</p>
                  <p className="text-[12px] text-[#8E8E93] mt-0.5">{formatDate(w.date)}</p>
                </div>
                {w.durationMinutes && (
                  <span className="text-[12px] text-[#8E8E93] flex-shrink-0">{w.durationMinutes}m</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
