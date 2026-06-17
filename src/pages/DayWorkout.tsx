import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer, CheckCircle2, Clock } from 'lucide-react'
import { getProgram } from '../data/programs'
import { useProgramProgress, useCompletedSessions, getNextSession } from '../hooks/useProgramProgress'
import { useExerciseImages } from '../hooks/useExerciseImages'
import { useWorkouts } from '../hooks/useWorkouts'
import RestTimer from '../components/RestTimer'
import type { WorkoutSet } from '../types'

function parseReps(setsCount: number, repsStr: string): WorkoutSet[] {
  const nums = (repsStr.match(/\d+/g) ?? ['10']).map(Number)
  const isList = repsStr.includes(',')
  return Array.from({ length: setsCount }, (_, i) => ({
    reps: isList ? (nums[i] ?? nums[nums.length - 1] ?? 10) : nums[0],
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

const STORE_PREFIX = 'sessionProgress_v1'
interface StoredSession { exercises: TrackingExercise[]; docId: string | null }

function loadStored(key: string): StoredSession | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null } catch { return null }
}
function saveStored(key: string, d: StoredSession) {
  try { localStorage.setItem(key, JSON.stringify(d)) } catch {}
}
function clearStored(key: string) {
  try { localStorage.removeItem(key) } catch {}
}

export default function DayWorkout() {
  const { programId, phaseId, week: weekParam, dayNum } = useParams()
  const week = Number(weekParam)
  const navigate = useNavigate()
  const { saveSession } = useProgramProgress()
  const { markComplete } = useCompletedSessions()
  const { getImage } = useExerciseImages()
  const { saveWorkout, updateWorkout } = useWorkouts()
  const docIdRef = useRef<string | null>(null)
  const creatingRef = useRef(false)

  const program = getProgram(programId)
  const phase = program?.phases.find((p) => p.id === phaseId)
  const day = phase?.days.find((d) => d.day === Number(dayNum))
  const storeKey = `${STORE_PREFIX}|${programId}|${phaseId}|${week}|${dayNum}`

  const [startTime] = useState(() => Date.now())
  const [tracking, setTracking] = useState(false)
  const [exercises, setExercises] = useState<TrackingExercise[]>([])
  const [saving, setSaving] = useState(false)
  const [restActive, setRestActive] = useState(false)
  const [restKey, setRestKey] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const timer = useElapsed(startTime)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!day) return
    const stored = loadStored(storeKey)
    if (stored?.exercises?.length) {
      setExercises(stored.exercises)
      docIdRef.current = stored.docId ?? null
      setTracking(true)
      return
    }
    const category = day.focus.split(/[&,]/)[0].trim()
    setExercises(day.exercises.map((ex) => ({
      name: ex.name, category, superset: !!ex.superset,
      prescription: `${ex.sets} sets · ${ex.reps}`,
      sets: parseReps(ex.sets, ex.reps),
    })))
  }, [storeKey, day])

  useEffect(() => {
    if (tracking && exercises.length) saveStored(storeKey, { exercises, docId: docIdRef.current })
  }, [exercises, tracking, storeKey])

  if (!program || !phase || !day) {
    return <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
      <p className="text-[#B5B2AA] text-[13px] uppercase tracking-[0.1em]">workout not found</p>
    </div>
  }

  const phaseIndex = program.phases.findIndex((p) => p.id === phaseId) + 1
  const totalSets = exercises.reduce((n, ex) => n + ex.sets.length, 0)
  const completedSets = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0)
  const allDone = totalSets > 0 && completedSets === totalSets
  const nextDay = getNextSession(program.id, phaseId!, week, day.day)

  function updateSet(exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) {
    setExercises((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, ...patch })
    }))
  }

  function toggleSet(exIdx: number, setIdx: number) {
    const wasCompleted = exercises[exIdx].sets[setIdx].completed
    const next = exercises.map((ex, i) => i !== exIdx ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, completed: !s.completed })
    })
    setExercises(next)
    if (!wasCompleted) { setRestKey((k) => k + 1); setRestActive(true) }
    saveSession({ programId: program!.id, programName: program!.name, phaseId: phase!.id, week, dayNum: day!.day, focus: day!.focus })
    persist(next)
    if (next.every((ex) => ex.sets.every((s) => s.completed))) markComplete(program!.id, phase!.id, week, day!.day)
  }

  function addSet(exIdx: number) {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex
      const last = ex.sets[ex.sets.length - 1]
      return { ...ex, sets: [...ex.sets, { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 10, completed: false }] }
    }))
  }

  async function persist(exs: TrackingExercise[]) {
    const payload = {
      name: `${program!.name} · W${week} D${day!.day} — ${day!.focus}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.round((Date.now() - startTime) / 60000),
      exercises: exs.map((ex) => ({
        exerciseId: `${programId}-w${week}-d${day!.day}-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: ex.name, category: ex.category, imageUrl: null, sets: ex.sets,
      })),
    }
    if (docIdRef.current) {
      await updateWorkout(docIdRef.current, payload)
    } else if (!creatingRef.current) {
      creatingRef.current = true
      const id = await saveWorkout(payload)
      docIdRef.current = id
      creatingRef.current = false
    }
  }

  async function finishAndNext() {
    setSaving(true)
    await persist(exercises)
    markComplete(program!.id, phase!.id, week, day!.day)
    clearStored(storeKey)
    if (nextDay) navigate(`/program/${nextDay.programId}/${nextDay.phaseId}/w/${nextDay.week}/d/${nextDay.dayNum}`)
    else navigate(`/program/${program!.id}`)
  }

  // ── Pre-workout overview (light APEX) ─────────────────────────
  if (!tracking) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] pb-32">
        <div className="px-6 pt-14 pb-5 border-b-[0.5px] border-[#E5E3DD]">
          <button onClick={() => navigate(`/program/${program.id}/${phaseId}`)}
            className="flex items-center gap-2 text-[#B5B2AA] text-[11px] uppercase tracking-[0.14em] mb-6">
            <ArrowLeft size={14} /> {program.name.toLowerCase()}
          </button>
          <p className="t-eyebrow mb-3">
            {program.phases.length > 1 ? `Phase ${phaseIndex} · ` : ''}Week {week} · Day {day.day}
            {day.type && <span className="ml-2 border-[0.5px] border-[#FF5500] text-[#FF5500] px-2 py-0.5 rounded-[6px]">{day.type}</span>}
          </p>
          <h1 className="t-hero text-[#0F0F0E]">{day.focus.toLowerCase()}</h1>
          <p className="text-[13px] font-light text-[#B5B2AA] mt-3">{day.exercises.length} exercises</p>
        </div>

        <div className="px-6 pt-4">
          {day.note && <p className="text-[13px] font-light text-[#636158] leading-relaxed mb-6 tracking-[0.01em]">{day.note}</p>}
          {day.exercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => setTracking(true)}
              className={`w-full text-left flex items-start py-4 border-b-[0.5px] border-[#E5E3DD] last:border-b-0 active:bg-[#F0EFEC] transition-colors ${ex.superset ? 'pl-4 border-l-[0.5px] border-l-[#FF5500]' : ''}`}
            >
              <span className="text-[11px] font-light text-[#B5B2AA] w-6 flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0 px-4">
                <p className="text-[15px] font-light text-[#0F0F0E] tracking-[0.01em] lowercase leading-snug">{ex.name.toLowerCase()}</p>
                <p className="text-[11px] font-light text-[#636158] mt-0.5 tracking-[0.03em]">
                  {ex.sets} sets · {ex.reps} reps{ex.homeAlt ? ` · alt: ${ex.homeAlt.toLowerCase()}` : ''}
                </p>
              </div>
              <ArrowLeft size={12} className="text-[#B5B2AA] flex-shrink-0 mt-1 rotate-180" />
            </button>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-6 pt-8 pb-6 bg-[#F8F7F4]"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button onClick={() => setTracking(true)}
            className="w-full bg-[#FF5500] text-white py-[18px] t-cta active:opacity-75 transition-opacity">
            Start Workout
          </button>
        </div>
      </div>
    )
  }

  // ── Active tracking (dark Tesla mode) ─────────────────────────
  return (
    <div className="min-h-screen bg-[#111110] pb-44">
      {scrolled && (
        <button onClick={() => setRestActive(true)}
          className="fixed right-6 z-20 flex items-center gap-1.5 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
          <Timer size={13} className="text-[#FF5500]" /> Rest
        </button>
      )}

      <div className="px-6 pt-14 pb-4 border-b-[0.5px] border-[#2A2A28]">
        <button onClick={() => navigate(`/program/${program.id}/${phaseId}`)}
          className="flex items-center gap-2 text-[#4A4844] text-[11px] uppercase tracking-[0.14em] mb-5">
          <ArrowLeft size={14} /> {program.name.toLowerCase()}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="t-eyebrow mb-1" style={{ color: '#4A4844' }}>
              {program.phases.length > 1 ? `Phase ${phaseIndex} · ` : ''}Week {week} · Day {day.day}
            </p>
            <h1 className="text-[22px] font-extralight text-white lowercase tracking-[0.01em] truncate">{day.focus.toLowerCase()}</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-[#4A4844] text-[11px] tracking-[0.05em]">
                <Clock size={11} />
                <span className="tabular-nums">{timer}</span>
              </div>
              <span className="text-[11px] text-[#4A4844] tracking-[0.05em]">{completedSets}/{totalSets} sets</span>
            </div>
          </div>
          <button onClick={() => setRestActive(true)}
            className="flex items-center gap-1.5 bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white flex-shrink-0">
            <Timer size={13} className="text-[#FF5500]" /> Rest
          </button>
        </div>
      </div>

      <div>
        {exercises.map((ex, exIdx) => {
          const exDone = ex.sets.every((s) => s.completed)
          const exDoneCount = ex.sets.filter((s) => s.completed).length
          const imgUrl = getImage(ex.name)

          return (
            <div key={exIdx} className={`flex border-b-[0.5px] border-[#2A2A28] transition-opacity ${exDone ? 'opacity-40' : ''}`}>
              {/* Left half — photo */}
              <div className="w-[44%] flex-shrink-0 min-h-[118px] bg-[#1C1C1A] overflow-hidden flex items-center justify-center">
                {imgUrl
                  ? <img src={imgUrl} alt={ex.name} loading="lazy" className="w-full h-full object-cover grayscale" />
                  : <span className="text-[28px] font-extralight text-[#636158]">{ex.name.charAt(0).toLowerCase()}</span>
                }
              </div>

              {/* Right half — title + sets */}
              <div className="flex-1 min-w-0 p-3 flex flex-col">
                {ex.superset && (
                  <p className="text-[9px] font-medium text-[#FF5500] uppercase tracking-[0.2em] mb-0.5">Superset</p>
                )}
                <div className="flex items-start gap-1 mb-0.5">
                  <p className={`text-[13px] font-light lowercase tracking-[0.01em] leading-tight flex-1 ${exDone ? 'text-[#4A4844]' : 'text-white'}`}>
                    {ex.name.toLowerCase()}
                  </p>
                  {exDone && <CheckCircle2 size={14} className="text-[#FF5500] flex-shrink-0 mt-0.5" />}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-light text-[#4A4844] tracking-[0.03em] truncate">{ex.prescription}</p>
                  <span className={`text-[10px] font-medium flex-shrink-0 ${exDone ? 'text-[#FF5500]' : 'text-[#636158]'}`}>
                    {exDoneCount}/{ex.sets.length}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx}
                      className={`flex items-center gap-1.5 px-2 py-1.5 border-[0.5px] ${set.completed ? 'border-[#FF5500]/20 bg-[#FF5500]/5' : 'border-[#2A2A28] bg-[#111110]'}`}>
                      <span className="text-[10px] font-light text-[#4A4844] w-3 flex-shrink-0">{setIdx + 1}</span>
                      <div className="flex flex-1 items-center gap-1.5">
                        <div className="flex-1 flex flex-col items-center">
                          <input
                            type="number" inputMode="numeric" value={set.reps} min={1}
                            onChange={(e) => updateSet(exIdx, setIdx, { reps: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full text-center text-[14px] font-extralight bg-transparent text-white focus:outline-none border-b-[0.5px] border-[#2A2A28] focus:border-[#FF5500] pb-0.5"
                          />
                          <span className="text-[8px] font-medium text-[#4A4844] uppercase tracking-[0.12em] mt-0.5">reps</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <input
                            type="number" inputMode="decimal" value={set.weightKg} min={0} step={2.5}
                            onChange={(e) => updateSet(exIdx, setIdx, { weightKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full text-center text-[14px] font-extralight bg-transparent text-white focus:outline-none border-b-[0.5px] border-[#2A2A28] focus:border-[#FF5500] pb-0.5"
                          />
                          <span className="text-[8px] font-medium text-[#4A4844] uppercase tracking-[0.12em] mt-0.5">kg</span>
                        </div>
                      </div>
                      <button onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-6 h-6 flex items-center justify-center flex-shrink-0 border-[0.5px] ${set.completed ? 'border-[#FF5500] bg-[#FF5500] text-white' : 'border-[#2A2A28] text-[#4A4844]'}`}>
                        <CheckCircle2 size={12} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSet(exIdx)}
                    className="mt-1 text-[9px] font-medium text-[#4A4844] uppercase tracking-[0.2em] py-0.5 text-left">
                    + set
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {restActive && <RestTimer key={restKey} onDismiss={() => setRestActive(false)} />}

      <div className="fixed left-0 right-0 px-6 pt-8 pointer-events-none"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(to top, #111110 70%, transparent)' }}>
        <button onClick={finishAndNext} disabled={!allDone || saving}
          className={`pointer-events-auto w-full py-[18px] t-cta transition-opacity ${allDone ? 'bg-[#FF5500] text-white active:opacity-75' : 'bg-[#1C1C1A] text-[#4A4844] cursor-default'}`}>
          {saving ? 'saving…' : allDone ? (nextDay ? 'Finish & Next Day' : 'Finish Workout') : `${completedSets} / ${totalSets} sets`}
        </button>
      </div>
    </div>
  )
}
