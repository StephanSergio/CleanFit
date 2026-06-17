import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Zap, Timer, CheckCircle2, Clock } from 'lucide-react'
import { BUFF_DUDES } from '../data/buffDudes'
import { useProgramProgress, useCompletedDays, getNextDay } from '../hooks/useProgramProgress'
import { useWorkouts } from '../hooks/useWorkouts'
import SetRow from '../components/SetRow'
import RestTimer from '../components/RestTimer'
import type { WorkoutSet } from '../types'

function parseReps(setsCount: number, repsStr: string): WorkoutSet[] {
  const nums = (repsStr.match(/\d+/g) ?? ['10']).map(Number)
  return Array.from({ length: setsCount }, (_, i) => ({
    reps: nums[i] ?? nums[0],
    weightKg: 10,
    completed: false,
  }))
}

function useElapsed(startTime: number | null) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startTime) return
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
  sets: WorkoutSet[]
}

export default function DayWorkout() {
  const { phaseId, dayNum } = useParams()
  const navigate = useNavigate()
  const { saveDay } = useProgramProgress()
  const { markComplete, isCompletedThisWeek } = useCompletedDays()
  const { saveWorkout } = useWorkouts()

  const phase = BUFF_DUDES.phases.find((p) => p.id === phaseId)
  const day = phase?.days.find((d) => d.day === Number(dayNum))

  const [tracking, setTracking] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [exercises, setExercises] = useState<TrackingExercise[]>([])
  const [saving, setSaving] = useState(false)
  const [restActive, setRestActive] = useState(false)
  const timer = useElapsed(startTime)

  if (!phase || !day) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <p className="text-[#8E8E93]">Workout not found.</p>
      </div>
    )
  }

  const phaseIndex = BUFF_DUDES.phases.findIndex((p) => p.id === phaseId) + 1
  const category = day.focus.split(/[&,]/)[0].trim()

  const totalSets = exercises.reduce((n, ex) => n + ex.sets.length, 0)
  const completedSets = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0)
  const allDone = totalSets > 0 && completedSets === totalSets

  const alreadyDoneThisWeek = isCompletedThisWeek(phaseId!, day.day)
  const nextDay = getNextDay(phaseId!, day.day)

  function startWorkout() {
    const exs: TrackingExercise[] = day!.exercises.map((ex) => ({
      name: ex.name,
      category,
      superset: !!ex.superset,
      sets: parseReps(ex.sets, ex.reps),
    }))
    setExercises(exs)
    setStartTime(Date.now())
    setTracking(true)
    saveDay(phaseId!, day!.day, phase!.name, day!.focus)
  }

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
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exIdx] }
      const sets = [...ex.sets]
      sets[setIdx] = { ...sets[setIdx], completed: !sets[setIdx].completed }
      ex.sets = sets
      next[exIdx] = ex
      return next
    })
  }

  function addSet(exIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exIdx] }
      const last = ex.sets[ex.sets.length - 1]
      ex.sets = [...ex.sets, { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 0, completed: false }]
      next[exIdx] = ex
      return next
    })
  }

  async function completeWorkout() {
    setSaving(true)
    const durationMinutes = startTime ? Math.round((Date.now() - startTime) / 60000) : 0
    await saveWorkout({
      name: `P${phaseIndex} D${day!.day} — ${day!.focus}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      exercises: exercises.map((ex) => ({
        exerciseId: `${phaseId}-d${day!.day}-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: ex.name,
        category: ex.category,
        imageUrl: null,
        sets: ex.sets,
      })),
    })
    markComplete(phaseId!, day!.day)
    if (nextDay) navigate(`/program/${nextDay.phaseId}/day/${nextDay.dayNum}`)
    else navigate('/program')
  }

  // ── Pre-workout view ──────────────────────────────────────────────
  if (!tracking) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] pb-32">
        <div className="sticky top-0 z-10 bg-[#F2F2F7]/95 backdrop-blur-xl px-6 pt-14 pb-4">
          <button
            onClick={() => navigate(`/program/${phaseId}`)}
            className="flex items-center gap-1.5 text-[#8E8E93] text-[14px] mb-3"
          >
            <ArrowLeft size={16} />
            {phase.name}
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#F4845F] mb-1">
            Phase {phaseIndex} · Day {day.day}
          </p>
          <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-tight leading-tight">{day.focus}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[13px] text-[#8E8E93]">{day.exercises.length} exercises</p>
            {alreadyDoneThisWeek && (
              <span className="text-[11px] font-semibold text-[#30D158] bg-[#30D158]/15 px-2 py-0.5 rounded-full">
                Done this week
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="bg-white shadow-sm rounded-[20px] overflow-hidden">
            {day.exercises.map((ex, i) => (
              <div
                key={i}
                className={`px-4 py-3.5 ${i < day.exercises.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
              >
                {ex.superset ? (
                  <div className="pl-3 border-l-2 border-[#F4845F]/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap size={11} className="text-[#F4845F]" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#F4845F]">Superset</span>
                    </div>
                    {ex.name.includes(' / ')
                      ? ex.name.split(' / ').map((part, pi) => (
                          <p key={pi} className="text-[15px] font-semibold text-[#1C1C1E] leading-snug">{part.trim()}</p>
                        ))
                      : <p className="text-[15px] font-semibold text-[#1C1C1E]">{ex.name}</p>
                    }
                    <p className="text-[12px] text-[#8E8E93] mt-1">{ex.sets} sets · {ex.reps} reps</p>
                    {ex.homeAlt && <p className="text-[11px] text-[#C7C7CC] mt-0.5 italic">Alt: {ex.homeAlt}</p>}
                    {ex.note && <p className="text-[11px] text-[#F4845F]/80 mt-0.5">{ex.note}</p>}
                  </div>
                ) : (
                  <div>
                    <p className="text-[15px] font-semibold text-[#1C1C1E]">{ex.name}</p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5">{ex.sets} sets · {ex.reps} reps</p>
                    {ex.homeAlt && <p className="text-[11px] text-[#C7C7CC] mt-0.5 italic">Alt: {ex.homeAlt}</p>}
                    {ex.note && <p className="text-[11px] text-[#8E8E93] mt-0.5">{ex.note}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 px-5 py-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', background: 'linear-gradient(to top, #F2F2F7 70%, transparent)' }}
        >
          <button
            onClick={startWorkout}
            className="w-full bg-[#F4845F] text-white rounded-[16px] py-4 flex items-center justify-center gap-2 text-[16px] font-semibold active:opacity-80 transition-opacity"
          >
            <Play size={18} fill="white" />
            {alreadyDoneThisWeek ? 'Repeat Workout' : 'Start Workout'}
          </button>
        </div>
      </div>
    )
  }

  // ── Active tracking view ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="sticky top-0 z-10 bg-[#F2F2F7]/95 backdrop-blur-xl px-5 pt-14 pb-3 border-b border-[#E5E5EA]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#F4845F]">
              Phase {phaseIndex} · Day {day.day}
            </p>
            <h1 className="text-[17px] font-bold text-[#1C1C1E] tracking-tight truncate">{day.focus}</h1>
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
          return (
            <div
              key={exIdx}
              className={`bg-white shadow-sm rounded-[20px] overflow-hidden transition-colors ${
                exDone ? 'ring-1 ring-[#F4845F]/40' : ''
              }`}
            >
              <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {ex.superset && (
                    <div className="flex items-center gap-1 mb-0.5">
                      <Zap size={10} className="text-[#F4845F]" />
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-[#F4845F]">Superset</span>
                    </div>
                  )}
                  <p className="text-[15px] font-bold text-[#1C1C1E] leading-tight">{ex.name}</p>
                </div>
                {exDone && <CheckCircle2 size={18} className="text-[#F4845F] flex-shrink-0" />}
              </div>

              <div className="px-3 pb-2 flex flex-col gap-1.5">
                {ex.sets.map((set, setIdx) => (
                  <SetRow
                    key={setIdx}
                    setNumber={setIdx + 1}
                    set={set}
                    onChange={(patch) => updateSet(exIdx, setIdx, patch)}
                    onToggle={() => toggleSet(exIdx, setIdx)}
                  />
                ))}
              </div>

              <div className="px-3 pb-3">
                <button
                  onClick={() => addSet(exIdx)}
                  className="w-full py-2 rounded-[12px] bg-[#ECECF1] text-[#636366] text-[12px] font-semibold"
                >
                  + Add Set
                </button>
              </div>
            </div>
          )
        })}

        <div className="pt-1 pb-6">
          <button
            onClick={completeWorkout}
            disabled={saving || !allDone}
            className={`w-full rounded-[16px] py-4 text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
              allDone
                ? 'bg-[#30D158] text-white active:opacity-80'
                : 'bg-[#ECECF1] text-[#AEAEB2]'
            } disabled:cursor-not-allowed`}
          >
            <CheckCircle2 size={18} />
            {saving
              ? 'Saving…'
              : !allDone
              ? `Complete all sets (${completedSets}/${totalSets})`
              : nextDay
              ? 'Complete & Go to Next Day'
              : 'Complete Workout'}
          </button>
          {allDone && nextDay && (
            <p className="text-center text-[12px] text-[#8E8E93] mt-2">
              Next: {BUFF_DUDES.phases.find((p) => p.id === nextDay.phaseId)?.days.find((d) => d.day === nextDay.dayNum)?.focus}
            </p>
          )}
        </div>
      </div>

      {restActive && <RestTimer onDismiss={() => setRestActive(false)} />}
    </div>
  )
}
