import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useVTNavigate } from '../hooks/useVTNavigate'
import { ArrowLeft, Timer, CheckCircle2, Clock, Repeat2, Pause, Play, RotateCcw, Plus, X } from 'lucide-react'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { getProgram } from '../data/programs'
import { useProgramProgress, useCompletedSessions, getNextSession } from '../hooks/useProgramProgress'
import { useExerciseImages } from '../hooks/useExerciseImages'
import { useWorkouts } from '../hooks/useWorkouts'
import { usePresets, applyPresetWeights } from '../contexts/PresetsContext'
import RestTimer from '../components/RestTimer'
import ScrollReveal from '../components/ScrollReveal'
import ExerciseDrawer from '../components/ExerciseDrawer'
import PageGlow from '../components/PageGlow'
import { useStopwatch } from '../hooks/useStopwatch'
import NumField from '../components/NumField'
import type { WorkoutSet, WgerExercise } from '../types'

function parseReps(setsCount: number, repsStr: string): WorkoutSet[] {
  const nums = (repsStr.match(/\d+/g) ?? ['10']).map(Number)
  const isList = repsStr.includes(',')
  return Array.from({ length: setsCount }, (_, i) => ({
    reps: isList ? (nums[i] ?? nums[nums.length - 1] ?? 10) : nums[0],
    weightKg: 10,
    completed: false,
  }))
}


interface TrackingExercise {
  name: string
  category: string
  superset: boolean
  prescription: string
  sets: WorkoutSet[]
}

const STORE_PREFIX = 'sessionProgress_v1'
interface StoredSession { exercises: TrackingExercise[]; docId: string | null; startTime?: number }

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
  const navigate = useVTNavigate()
  const { saveSession } = useProgramProgress()
  const { markComplete } = useCompletedSessions()
  const { getImage } = useExerciseImages()
  const { saveWorkout, updateWorkout } = useWorkouts()
  const { getPreset, savePreset } = usePresets()
  const { user } = useAuth()
  const docIdRef = useRef<string | null>(null)
  const creatingRef = useRef(false)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buildKeyRef = useRef('')
  const didScrollRef = useRef(false)

  const program = getProgram(programId)
  const phase = program?.phases.find((p) => p.id === phaseId)
  const day = phase?.days.find((d) => d.day === Number(dayNum))
  const storeKey = `${STORE_PREFIX}|${programId}|${phaseId}|${week}|${dayNum}`
  // Firestore doc ids can't contain '/'; build a safe, unique key for this day.
  const draftId = `${programId}_${phaseId}_w${week}_d${dayNum}`
  const timerKey = `timer_v1|${programId}|${phaseId}|${week}|${dayNum}`

  const [startTime] = useState(() => loadStored(storeKey)?.startTime ?? Date.now())
  const [tracking, setTracking] = useState(false)
  const [exercises, setExercises] = useState<TrackingExercise[]>([])
  const [saving, setSaving] = useState(false)
  const [restActive, setRestActive] = useState(false)
  const [restKey, setRestKey] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [swapIdx, setSwapIdx] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const { display: timer, elapsedMs, running: timerRunning, toggle: toggleTimer, reset: resetTimer, clear: clearTimer } = useStopwatch(timerKey)

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
      buildKeyRef.current = storeKey
      return
    }
    // Fresh build from the program. Rebuilds when weight presets arrive
    // (Firestore loads async), but never once the user is tracking this day —
    // so in-progress edits are never clobbered.
    if (tracking && buildKeyRef.current === storeKey) return
    buildKeyRef.current = storeKey
    const category = day.focus.split(/[&,]/)[0].trim()
    setExercises(day.exercises.map((ex) => {
      const sets = parseReps(ex.sets, ex.reps)
      // Pre-fill weights from the last time this exercise was done (any program).
      // Reps stay as the program prescribes; only the loaded weight is remembered.
      const preset = getPreset(ex.name)
      const weights = applyPresetWeights(preset, sets.length, sets[0]?.weightKg ?? 10)
      return {
        name: ex.name, category, superset: !!ex.superset,
        prescription: `${ex.sets} sets · ${ex.reps}`,
        sets: sets.map((s, i) => ({ ...s, weightKg: weights[i] })),
      }
    }))
  }, [storeKey, day, getPreset, tracking])

  // Hydrate an in-progress session from Firestore when there's no local draft —
  // so a half-finished workout survives a new deploy, a cleared cache, or another
  // device. The local draft always wins (it's the freshest), and we bail if the
  // user starts editing before the doc resolves.
  useEffect(() => {
    if (!user || !day) return
    if (loadStored(storeKey)?.exercises?.length) return
    let cancelled = false
    getDoc(doc(db, 'users', user.uid, 'sessionDrafts', draftId))
      .then((snap) => {
        if (cancelled || !snap.exists()) return
        if (loadStored(storeKey)?.exercises?.length) return
        const data = snap.data() as StoredSession
        if (!data.exercises?.length) return
        setExercises(data.exercises)
        docIdRef.current = data.docId ?? null
        buildKeyRef.current = storeKey
        saveStored(storeKey, data)
        setTracking(true)
      })
      .catch(() => {/* offline or denied — local/program build stands */})
    return () => { cancelled = true }
  }, [user, day, storeKey, draftId])

  // Persist the live draft locally (instant) and mirror to Firestore (debounced,
  // durable across deploys/devices).
  useEffect(() => {
    if (!tracking || !exercises.length) return
    const draft: StoredSession = { exercises, docId: docIdRef.current, startTime }
    saveStored(storeKey, draft)
    if (!user) return
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      setDoc(doc(db, 'users', user.uid, 'sessionDrafts', draftId), {
        exercises, docId: docIdRef.current ?? null, startTime, updatedAt: Date.now(),
      }).catch(() => {})
    }, 800)
  }, [exercises, tracking, storeKey, startTime, user, draftId])

  // When the workout opens, jump to the first exercise that still has unfinished
  // sets — so you land where you left off. Runs once per mount.
  useEffect(() => {
    if (didScrollRef.current || !tracking || !exercises.length) return
    didScrollRef.current = true
    const idx = exercises.findIndex((ex) => ex.sets.some((s) => !s.completed))
    if (idx <= 0) return
    const t = setTimeout(() => {
      document.getElementById(`ex-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 420)
    return () => clearTimeout(t)
  }, [tracking, exercises])

  if (!program || !phase || !day) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-ink-muted text-[13px] uppercase tracking-[0.1em]">workout not found</p>
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
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => persist(next), 600)
    if (next.every((ex) => ex.sets.every((s) => s.completed))) markComplete(program!.id, phase!.id, week, day!.day)
  }

  function addSet(exIdx: number) {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex
      const last = ex.sets[ex.sets.length - 1]
      return { ...ex, sets: [...ex.sets, { reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 10, completed: false }] }
    }))
  }

  function removeLastSet(exIdx: number) {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx || ex.sets.length <= 1) return ex
      return { ...ex, sets: ex.sets.slice(0, -1) }
    }))
  }

  // Swap one exercise for any library exercise — for THIS session only. The
  // program day is unchanged, so next time you do this day the original returns.
  function handleSwap(ex: WgerExercise) {
    if (swapIdx === null) return
    setExercises((prev) => prev.map((item, i) => {
      if (i !== swapIdx) return item
      const preset = getPreset(ex.name)
      const weights = applyPresetWeights(preset, item.sets.length, 10)
      return {
        ...item,
        name: ex.name,
        category: ex.category,
        sets: item.sets.map((s, j) => ({ reps: s.reps, weightKg: weights[j], completed: false })),
      }
    }))
    setSwapIdx(null)
  }

  // Add any library exercise to THIS session, even if it isn't in the program.
  // It's appended to the live list and saved with the rest — existing exercises
  // and their logged sets are untouched.
  function handleAdd(ex: WgerExercise) {
    const preset = getPreset(ex.name)
    const count = preset?.weights.length || 3
    const weights = applyPresetWeights(preset, count, 10)
    const repsFor = (i: number) => {
      if (!preset || !preset.reps.length) return 10
      return preset.reps[i] ?? preset.reps[preset.reps.length - 1]
    }
    setExercises((prev) => [
      ...prev,
      {
        name: ex.name,
        category: ex.category,
        superset: false,
        prescription: `${count} sets · added`,
        sets: Array.from({ length: count }, (_, i) => ({
          reps: repsFor(i),
          weightKg: weights[i],
          completed: false,
        })),
      },
    ])
    setAddOpen(false)
  }

  // Remove an exercise from this session (e.g. an ad-hoc one you added).
  function removeExercise(exIdx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx))
  }

  async function persist(exs: TrackingExercise[]) {
    // Remember the per-set weights for each exercise so the next session (this or
    // any other program) pre-fills them. History below is never overwritten.
    exs.forEach((ex) => savePreset(ex.name, ex.sets.map((s) => s.weightKg), ex.sets.map((s) => s.reps)))
    const payload = {
      name: `${program!.name} · W${week} D${day!.day} — ${day!.focus}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.max(0, Math.round(elapsedMs / 60000)),
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
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    await persist(exercises)
    markComplete(program!.id, phase!.id, week, day!.day)
    clearStored(storeKey)
    clearTimer()
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    if (user) deleteDoc(doc(db, 'users', user.uid, 'sessionDrafts', draftId)).catch(() => {})
    if (nextDay) navigate(`/program/${nextDay.programId}/${nextDay.phaseId}/w/${nextDay.week}/d/${nextDay.dayNum}`)
    else navigate(`/program/${program!.id}`)
  }

  // ── Pre-workout overview ──────────────────────────────────────
  if (!tracking) {
    return (
      <>
      <PageGlow />
      <div className="min-h-screen pb-32 apex-page">
        <div className="px-6 pt-14 pb-5 border-b-[0.5px] border-border">
          <button onClick={() => navigate(`/program/${program.id}/${phaseId}`)}
            className="flex items-center gap-2 text-ink-muted text-[11px] uppercase tracking-[0.14em] mb-6">
            <ArrowLeft size={14} /> {program.name.toLowerCase()}
          </button>
          <p className="t-eyebrow mb-3 head-rise" style={{ animationDelay: '40ms' }}>
            {program.phases.length > 1 ? `Phase ${phaseIndex} · ` : ''}Week {week} · Day {day.day}
            {day.type && (
              <span className="ml-2 border-[0.5px] border-accent text-accent px-2 py-0.5 rounded-[6px]">{day.type}</span>
            )}
          </p>
          <h1 className="t-hero ink-tint head-rise" style={{ animationDelay: '90ms' }}>{day.focus.toLowerCase()}</h1>
          <p className="text-[13px] font-light text-ink-muted mt-3 head-rise" style={{ animationDelay: '150ms' }}>{day.exercises.length} exercises</p>
        </div>

        <div className="px-6 pt-4">
          {day.note && <p className="text-[13px] font-light text-ink-mid leading-relaxed mb-6 tracking-[0.01em]">{day.note}</p>}
          {day.exercises.map((ex, i) => (
            <ScrollReveal key={i} delay={i * 35} as="div">
              <button
                onClick={() => setTracking(true)}
                className={`w-full text-left flex items-start py-4 border-b-[0.5px] border-border last:border-b-0 active:bg-accent-bg transition-colors ${ex.superset ? 'pl-4 border-l-[0.5px] border-l-accent' : ''}`}
              >
                <span className="text-[11px] font-light text-ink-muted w-6 flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0 px-4">
                  <p className="text-[15px] font-light text-ink tracking-[0.01em] lowercase leading-snug">{ex.name.toLowerCase()}</p>
                  <p className="text-[11px] font-light text-ink-mid mt-0.5 tracking-[0.03em]">
                    {ex.sets} sets · {ex.reps} reps{ex.homeAlt ? ` · alt: ${ex.homeAlt.toLowerCase()}` : ''}
                  </p>
                </div>
                <ArrowLeft size={12} className="text-ink-muted flex-shrink-0 mt-1 rotate-180" />
              </button>
            </ScrollReveal>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-6 pt-8 pb-6 bg-bg"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button onClick={() => setTracking(true)}
            className="w-full bg-accent text-white py-[18px] t-cta active:opacity-80 active:scale-[0.97] transition-all duration-100">
            Start Workout
          </button>
        </div>
      </div>
      </>
    )
  }

  // ── Active tracking ───────────────────────────────────────────
  return (
    <>
    <PageGlow />
    <div className="min-h-screen pb-44 apex-page-fast">
      {scrolled && (
        <button onClick={() => setRestActive(true)}
          className="fixed right-6 z-20 flex items-center gap-1.5 bg-surface border-[0.5px] border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
          <Timer size={13} className="text-accent" /> Rest
        </button>
      )}

      <div className="px-6 pt-14 pb-4 border-b-[0.5px] border-border">
        <button onClick={() => navigate(`/program/${program.id}/${phaseId}`)}
          className="flex items-center gap-2 text-ink-mid text-[11px] uppercase tracking-[0.14em] mb-5">
          <ArrowLeft size={14} /> {program.name.toLowerCase()}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="t-eyebrow mb-1">
              {program.phases.length > 1 ? `Phase ${phaseIndex} · ` : ''}Week {week} · Day {day.day}
            </p>
            <h1 className="text-[22px] font-display font-medium ink-tint lowercase tracking-[-0.015em] truncate">{day.focus.toLowerCase()}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-[11px] tracking-[0.05em]">
                <Clock size={11} className={timerRunning ? 'text-ink-mid' : 'text-accent'} />
                <span className={`tabular-nums ${timerRunning ? 'text-ink-mid' : 'text-accent'}`}>{timer}</span>
                <button
                  onClick={toggleTimer}
                  aria-label={timerRunning ? 'Stop timer' : 'Resume timer'}
                  className="ml-0.5 w-6 h-6 flex items-center justify-center text-ink-muted active:text-accent active:scale-90 transition-all duration-100"
                >
                  {timerRunning ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  onClick={resetTimer}
                  aria-label="Reset timer"
                  className="w-6 h-6 flex items-center justify-center text-ink-muted active:text-accent active:scale-90 transition-all duration-100"
                >
                  <RotateCcw size={12} />
                </button>
                {!timerRunning && (
                  <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-accent">paused</span>
                )}
              </div>
              <span className="text-[11px] text-ink-mid tracking-[0.05em]">{completedSets}/{totalSets} sets</span>
            </div>
          </div>
          <button onClick={() => setRestActive(true)}
            className="flex items-center gap-1.5 bg-surface border-[0.5px] border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink flex-shrink-0">
            <Timer size={13} className="text-accent" /> Rest
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 flex flex-col gap-3 apex-stagger">
        {exercises.map((ex, exIdx) => {
          const exDone = ex.sets.every((s) => s.completed)
          const exDoneCount = ex.sets.filter((s) => s.completed).length
          const imgUrl = getImage(ex.name)

          return (
            <div key={exIdx} id={`ex-${exIdx}`} className={`flex overflow-hidden border-[0.5px] border-border bg-surface transition-opacity ${exDone ? 'opacity-40' : ''}`}>
              {/* Left — photo */}
              <div className="w-[38%] flex-shrink-0 min-h-[140px] bg-[#EBEBEB] overflow-hidden flex items-center justify-center">
                {imgUrl
                  ? <img src={imgUrl} alt={ex.name} loading="lazy" className="w-full h-full object-cover grayscale brightness-110 contrast-105" />
                  : <span className="text-[28px] font-extralight text-ink-muted">{ex.name.charAt(0).toLowerCase()}</span>
                }
              </div>

              {/* Right — title + sets */}
              <div className="flex-1 min-w-0 p-3 flex flex-col">
                {ex.superset && (
                  <p className="text-[9px] font-medium text-accent uppercase tracking-[0.2em] mb-0.5">Superset</p>
                )}
                <div className="flex items-start gap-1.5 mb-0.5">
                  <p className={`text-[13px] font-light lowercase tracking-[0.01em] leading-tight flex-1 ${exDone ? 'text-ink-mid' : 'text-ink'}`}>
                    {ex.name.toLowerCase()}
                  </p>
                  {exDone && <CheckCircle2 size={14} className="text-accent flex-shrink-0 mt-0.5" />}
                  <button
                    onClick={() => setSwapIdx(exIdx)}
                    className="text-ink-muted active:text-accent flex-shrink-0 mt-0.5 active:scale-90 transition-all duration-100"
                    aria-label="Swap exercise"
                  >
                    <Repeat2 size={14} />
                  </button>
                  <button
                    onClick={() => removeExercise(exIdx)}
                    className="text-ink-muted active:text-accent flex-shrink-0 mt-0.5 active:scale-90 transition-all duration-100"
                    aria-label="Remove exercise"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-light text-ink-mid tracking-[0.03em] truncate">{ex.prescription}</p>
                  <span className={`text-[10px] font-medium flex-shrink-0 ${exDone ? 'text-accent' : 'text-ink-mid'}`}>
                    {exDoneCount}/{ex.sets.length}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx}
                      className={`flex items-center gap-1.5 px-2 py-1.5 border-[0.5px] transition-colors ${set.completed ? 'border-accent/30 bg-accent-bg' : 'border-border bg-bg'}`}>
                      <span className="text-[10px] font-light text-ink-mid w-3 flex-shrink-0">{setIdx + 1}</span>
                      <div className="flex flex-1 min-w-0 items-center gap-1.5">
                        <div className="flex-1 min-w-0 flex flex-col items-center overflow-hidden">
                          <NumField
                            value={set.reps}
                            integer
                            min={1}
                            ariaLabel="reps"
                            onCommit={(reps) => updateSet(exIdx, setIdx, { reps })}
                            className="w-full min-w-0 text-center text-[16px] font-extralight bg-transparent text-ink focus:outline-none border-b-[0.5px] border-border focus:border-accent pb-0.5"
                          />
                          <span className="text-[8px] font-medium text-ink-mid uppercase tracking-[0.12em] mt-0.5">reps</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col items-center overflow-hidden">
                          <NumField
                            value={set.weightKg}
                            min={0}
                            step={2.5}
                            ariaLabel="weight in kg"
                            onCommit={(weightKg) => updateSet(exIdx, setIdx, { weightKg })}
                            className="w-full min-w-0 text-center text-[16px] font-extralight bg-transparent text-ink focus:outline-none border-b-[0.5px] border-border focus:border-accent pb-0.5"
                          />
                          <span className="text-[8px] font-medium text-ink-mid uppercase tracking-[0.12em] mt-0.5">kg</span>
                        </div>
                      </div>
                      <button onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-6 h-6 flex items-center justify-center flex-shrink-0 border-[0.5px] transition-all duration-150 active:scale-110 ${set.completed ? 'border-accent bg-accent text-white' : 'border-border text-ink-mid'}`}
                        style={set.completed ? { animation: 'apex-check 0.25s ease-out' } : {}}>
                        <CheckCircle2 size={12} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 mt-1">
                    <button onClick={() => addSet(exIdx)}
                      className="text-[9px] font-medium text-accent uppercase tracking-[0.2em] py-0.5">
                      + set
                    </button>
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeLastSet(exIdx)}
                        className="text-[9px] font-medium text-ink-muted uppercase tracking-[0.2em] py-0.5">
                        − set
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add an exercise that isn't part of the program for this session. */}
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center justify-center gap-2 border-[0.5px] border-dashed border-border py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-mid active:text-accent active:scale-[0.99] transition-all duration-100"
        >
          <Plus size={14} /> Add exercise
        </button>
      </div>

      {restActive && <RestTimer key={restKey} onDismiss={() => setRestActive(false)} />}

      <div className="fixed left-0 right-0 px-6 pt-8 pointer-events-none"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(to top, var(--color-bg) 75%, transparent)' }}>
        <button onClick={finishAndNext} disabled={!allDone || saving}
          className={`pointer-events-auto w-full py-[18px] t-cta transition-all duration-100 ${allDone ? 'bg-accent text-white active:opacity-80 active:scale-[0.97]' : 'bg-surface text-ink-mid cursor-default border-[0.5px] border-border'}`}>
          {saving ? 'saving…' : allDone ? (nextDay ? 'Finish & Next Day' : 'Finish Workout') : `${completedSets} / ${totalSets} sets`}
        </button>
      </div>

      <ExerciseDrawer
        open={swapIdx !== null || addOpen}
        onClose={() => { setSwapIdx(null); setAddOpen(false) }}
        onSelect={(ex) => (addOpen ? handleAdd(ex) : handleSwap(ex))}
        title={addOpen ? 'Add Exercise' : 'Swap Exercise'}
      />
    </div>
    </>
  )
}
