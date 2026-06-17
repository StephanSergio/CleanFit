import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Timer, CheckCircle2, Clock } from 'lucide-react'
import { BUFF_DUDES } from '../data/buffDudes'
import { useProgramProgress, useCompletedSessions, getNextSession } from '../hooks/useProgramProgress'
import { useExerciseImages } from '../hooks/useExerciseImages'
import { useWorkouts } from '../hooks/useWorkouts'
import RestTimer from '../components/RestTimer'
import ExercisePhoto from '../components/ExercisePhoto'
import type { WorkoutSet } from '../types'

function parseReps(setsCount: number, repsStr: string): WorkoutSet[] {
  const nums = (repsStr.match(/\d+/g) ?? ['10']).map(Number)
  return Array.from({ length: setsCount }, (_, i) => ({
    reps: nums[i] ?? nums[0],
    weightKg: 10,
    completed: false,
  }))
}

function useElapsed(startTime: number) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startTime])
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const s = (elapsed % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface TrackingExercise {
  name: string
  category: string
  superset: boolean
  prescription: string
  sets: WorkoutSet[]
}

export default function DayWorkout() {
  const { phaseId, week: weekParam, dayNum } = useParams()
  const week = Number(weekParam)
  const navigate = useNavigate()
  const { saveSession } = useProgramProgress()
  const { markComplete } = useCompletedSessions()
  const { getImage } = useExerciseImages()
  const { saveWorkout } = useWorkouts()

  const phase = BUFF_DUDES.phases.find((p) => p.id === phaseId)
  const day = phase?.days.find((d) => d.day === Number(dayNum))

  const [startTime] = useState(() => Date.now())
  const [exercises, setExercises] = useState<TrackingExercise[]>([])
  const [saving, setSaving] = useState(false)
  const [restActive, setRestActive] = useState(false)
  const [restKey, setRestKey] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const timer = useElapsed(startTime)

  // Collapse the header on scroll, leaving just a floating Rest button.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Initialise editable exercises straight from the program when the day loads.
  useEffect(() => {
    if (!day) return
    const category = day.focus.split(/[&,]/)[0].trim()
    setExercises(
      day.exercises.map((ex) => ({
        name: ex.name,
        category,
        superset: !!ex.superset,
        prescription: `${ex.sets} sets · ${ex.reps}`,
        sets: parseReps(ex.sets, ex.reps),
      }))
    )
  }, [phaseId, dayNum, day])

  if (!phase || !day) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <p className="text-[#8E8E93]">Workout not found.</p>
      </div>
    )
  }

  const phaseIndex = BUFF_DUDES.phases.findIndex((p) => p.id === phaseId) + 1

  const totalSets = exercises.reduce((n, ex) => n + ex.sets.length, 0)
  const completedSets = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0)
  const allDone = totalSets > 0 && completedSets === totalSets
  const nextDay = getNextSession(phaseId!, week, day.day)

  function updateSet(exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exIdx] }
      const sets = [...ex.sets]
      sets[setIdx] = { ...sets[setIdx], ...patch }
      ex.sets = sets
      next[exIdx] = ex
      return next
    })
  }

  function toggleSet(exIdx: number, setIdx: number) {
    const wasCompleted = exercises[exIdx].sets[setIdx].completed
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exIdx] }
      const sets = [...ex.sets]
      sets[setIdx] = { ...sets[setIdx], completed: !sets[setIdx].completed }
      ex.sets = sets
      next[exIdx] = ex
      return next
    })
    // Completing a set auto-starts the rest countdown.
    if (!wasCompleted) {
      setRestKey((k) => k + 1)
      setRestActive(true)
    }
  }

  function addSet(exIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exIdx] }
      const last = ex.sets[ex.sets.length - 1]
      ex.sets = [...ex.sets, { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 10, completed: false }]
      next[exIdx] = ex
      return next
    })
  }

  function removeSet(exIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exIdx] }
      if (ex.sets.length <= 1) return prev
      ex.sets = ex.sets.slice(0, -1)
      next[exIdx] = ex
      return next
    })
  }

  async function saveWorkoutSession() {
    setSaving(true)
    const durationMinutes = Math.round((Date.now() - startTime) / 60000)
    await saveWorkout({
      name: `P${phaseIndex} W${week} D${day!.day} — ${day!.focus}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      exercises: exercises.map((ex) => ({
        exerciseId: `${phaseId}-w${week}-d${day!.day}-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: ex.name,
        category: ex.category,
        imageUrl: null,
        sets: ex.sets,
      })),
    })
    saveSession(phaseId!, week, day!.day, phase!.name, day!.focus)
    markComplete(phaseId!, week, day!.day)
    if (nextDay) navigate(`/program/${nextDay.phaseId}/w/${nextDay.week}/d/${nextDay.dayNum}`)
    else navigate('/program')
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-40">
      {/* Floating Rest button — appears once the header scrolls away */}
      {scrolled && (
        <button
          onClick={() => setRestActive(true)}
          className="fixed right-4 z-20 flex items-center gap-1.5 bg-white shadow-lg border border-[#E5E5EA] px-3.5 py-2.5 rounded-full text-[13px] font-semibold text-[#1C1C1E]"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <Timer size={15} className="text-[#F4845F]" />
          Rest
        </button>
      )}

      <div className="bg-[#F2F2F7] px-5 pt-14 pb-3 border-b border-[#E5E5EA]">
        <button
          onClick={() => navigate(`/program/${phaseId}`)}
          className="flex items-center gap-1.5 text-[#8E8E93] text-[14px] mb-2"
        >
          <ArrowLeft size={16} />
          {phase.name}
        </button>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#F4845F]">
              Phase {phaseIndex} · Week {week} · Day {day.day}
            </p>
            <h1 className="text-[22px] font-bold text-[#1C1C1E] tracking-tight truncate">{day.focus}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1 text-[#8E8E93] text-[12px]">
                <Clock size={11} />
                <span className="tabular-nums">{timer}</span>
              </div>
              <span className="text-[12px] text-[#8E8E93]">{completedSets}/{totalSets} sets</span>
            </div>
          </div>
          <button
            onClick={() => setRestActive(true)}
            className="flex items-center gap-1.5 bg-white shadow-sm border border-[#E5E5EA] px-3 py-2 rounded-full text-[12px] font-semibold text-[#1C1C1E] flex-shrink-0"
          >
            <Timer size={14} className="text-[#F4845F]" />
            Rest
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        {exercises.map((ex, exIdx) => {
          const exDone = ex.sets.every((s) => s.completed)
          const exDoneCount = ex.sets.filter((s) => s.completed).length
          return (
            <div
              key={exIdx}
              className={`bg-white shadow-sm rounded-[20px] overflow-hidden flex transition-all ${
                exDone ? 'ring-1 ring-[#F4845F]/40' : ''
              }`}
            >
              {/* Left half — photo */}
              <div className="w-[44%] flex-shrink-0">
                <ExercisePhoto img={getImage(ex.name)} alt={ex.name} />
              </div>

              {/* Right half — title + sets + controls */}
              <div className="flex-1 min-w-0 p-2.5 flex flex-col">
                {ex.superset && (
                  <div className="flex items-center gap-1">
                    <Zap size={9} className="text-[#F4845F]" />
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-[#F4845F]">Superset</span>
                  </div>
                )}
                <div className="flex items-start gap-1">
                  <p className="text-[13px] font-bold text-[#1C1C1E] leading-tight flex-1">{ex.name}</p>
                  {exDone && <CheckCircle2 size={15} className="text-[#F4845F] flex-shrink-0" />}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5 mb-1.5">
                  <p className="text-[10px] text-[#8E8E93] truncate">Target: {ex.prescription}</p>
                  <span className={`text-[10px] font-bold flex-shrink-0 ${exDone ? 'text-[#F4845F]' : 'text-[#8E8E93]'}`}>
                    {exDoneCount}/{ex.sets.length} sets
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-1 pl-3.5">
                  <span className="flex-1 text-[8px] font-semibold uppercase tracking-wide text-[#C7C7CC]">Reps</span>
                  <span className="flex-1 text-[8px] font-semibold uppercase tracking-wide text-[#C7C7CC]">Kg</span>
                  <span className="w-6" />
                </div>

                <div className="flex flex-col gap-1">
                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`flex items-center gap-1 rounded-[9px] px-1.5 py-0.5 ${
                        set.completed ? 'bg-[#F4845F]/15' : 'bg-[#F2F2F7]'
                      }`}
                    >
                      <span className="w-2.5 text-center text-[10px] font-bold text-[#C7C7CC] flex-shrink-0">{setIdx + 1}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.reps}
                        min={1}
                        onChange={(e) => updateSet(exIdx, setIdx, { reps: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="flex-1 w-full min-w-0 text-center text-[13px] font-bold bg-white rounded-md py-0.5 border border-[#E5E5EA] focus:outline-none focus:border-[#F4845F] text-[#1C1C1E]"
                      />
                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.weightKg}
                        min={0}
                        step={2.5}
                        onChange={(e) => updateSet(exIdx, setIdx, { weightKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="flex-1 w-full min-w-0 text-center text-[13px] font-bold bg-white rounded-md py-0.5 border border-[#E5E5EA] focus:outline-none focus:border-[#F4845F] text-[#1C1C1E]"
                      />
                      <button
                        onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          set.completed ? 'bg-[#F4845F] text-white' : 'bg-white border border-[#E5E5EA] text-[#C7C7CC]'
                        }`}
                      >
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={() => addSet(exIdx)}
                    className="flex-1 py-1 rounded-[9px] bg-[#ECECF1] text-[#636366] text-[11px] font-semibold"
                  >
                    + Set
                  </button>
                  {ex.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(exIdx)}
                      className="px-2.5 py-1 rounded-[9px] bg-[#ECECF1] text-[#AEAEB2] text-[11px] font-semibold"
                    >
                      −
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {restActive && <RestTimer key={restKey} onDismiss={() => setRestActive(false)} />}

      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, #F2F2F7 75%, transparent)',
        }}
      >
        <button
          onClick={saveWorkoutSession}
          disabled={saving}
          className="w-full bg-[#F4845F] text-white rounded-[16px] py-4 flex items-center justify-center gap-2 text-[16px] font-semibold active:opacity-80 disabled:opacity-60 transition-opacity"
        >
          <CheckCircle2 size={18} />
          {saving ? 'Saving…' : allDone && nextDay ? 'Save & Go to Next Day' : 'Save Workout'}
        </button>
        {nextDay && (
          <p className="text-center text-[12px] text-[#8E8E93] mt-2">
            Next: Week {nextDay.week} · {BUFF_DUDES.phases.find((p) => p.id === nextDay.phaseId)?.days.find((d) => d.day === nextDay.dayNum)?.focus}
          </p>
        )}
      </div>
    </div>
  )
}
