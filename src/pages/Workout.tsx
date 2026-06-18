import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Timer } from 'lucide-react'
import { useWorkout } from '../contexts/WorkoutContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { usePresets } from '../contexts/PresetsContext'
import { useElapsed } from '../hooks/useElapsed'
import ExerciseCard from '../components/ExerciseCard'
import SetRow from '../components/SetRow'
import ExerciseDrawer from '../components/ExerciseDrawer'
import RestTimer from '../components/RestTimer'
import type { WgerExercise } from '../types'

export default function Workout() {
  const { workout, dispatch } = useWorkout()
  const { saveWorkout } = useWorkouts()
  const { getPreset, savePreset } = usePresets()
  const navigate = useNavigate()
  const timer = useElapsed(workout?.startTime)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [swapFor, setSwapFor] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [restActive, setRestActive] = useState(false)
  const [restKey, setRestKey] = useState(0)

  function handleToggleSet(exIdx: number, setIdx: number, wasCompleted: boolean) {
    dispatch({ type: 'TOGGLE_SET', exerciseIndex: exIdx, setIndex: setIdx })
    if (!wasCompleted) {
      setRestKey((k) => k + 1)
      setRestActive(true)
    }
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 pb-nav">
        <p className="text-ink-mid text-[15px] font-light lowercase">no active workout.</p>
        <button
          onClick={() => dispatch({ type: 'START' })}
          className="bg-accent text-white px-8 py-[18px] w-full text-[11px] font-medium uppercase tracking-[0.2em] rounded-none active:opacity-80 active:scale-[0.97] transition-all duration-100"
        >
          Start Workout
        </button>
      </div>
    )
  }

  async function finish() {
    if (!workout) return
    setFinishing(true)
    const completedSets = workout.exercises.reduce((n, ex) => n + ex.sets.filter(s => s.completed).length, 0)
    if (completedSets === 0 && workout.exercises.length === 0) {
      dispatch({ type: 'RESET' })
      navigate('/')
      return
    }
    // Remember per-set weights for each exercise for next time.
    workout.exercises.forEach((ex) => savePreset(ex.name, ex.sets.map((s) => s.weightKg), ex.sets.map((s) => s.reps)))
    await saveWorkout({
      name: workout.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.round((Date.now() - workout.startTime) / 60000),
      exercises: workout.exercises,
    })
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  function handleAddExercise(ex: WgerExercise) {
    // Pre-fill sets from the last time this exercise was done (any program/session).
    const preset = getPreset(ex.name)
    const sets = preset && preset.weights.length
      ? preset.weights.map((w, i) => ({ reps: preset.reps[i] ?? preset.reps[preset.reps.length - 1] ?? 8, weightKg: w, completed: false }))
      : undefined
    dispatch({
      type: 'ADD_EXERCISE',
      exercise: { exerciseId: String(ex.id), name: ex.name, category: ex.category, imageUrl: ex.imageUrl },
      sets,
    })
  }

  function handleSwap(ex: WgerExercise) {
    if (swapFor === null) return
    dispatch({
      type: 'SWAP_EXERCISE',
      index: swapFor,
      exercise: { exerciseId: String(ex.id), name: ex.name, category: ex.category, imageUrl: ex.imageUrl },
    })
    setSwapFor(null)
  }

  const completedSets = workout.exercises.reduce((n, ex) => n + ex.sets.filter(s => s.completed).length, 0)
  const totalSets = workout.exercises.reduce((n, ex) => n + ex.sets.length, 0)

  return (
    <div className="min-h-screen pb-nav apex-page-fast">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur px-6 pt-14 pb-4 border-b-[0.5px] border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-extralight text-ink lowercase tracking-[0.01em] truncate">{workout.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] font-light text-ink-mid tracking-[0.05em]">{timer}</span>
              {totalSets > 0 && (
                <span className="text-[11px] font-light text-ink-mid tracking-[0.05em]">{completedSets}/{totalSets} sets</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setRestActive(true)}
              className="flex items-center gap-1.5 border-[0.5px] border-border bg-surface px-4 py-2 rounded-none text-[11px] font-medium uppercase tracking-[0.2em] text-ink"
            >
              <Timer size={12} className="text-accent" />
              Rest
            </button>
            <button
              onClick={finish}
              disabled={finishing}
              className="bg-accent text-white px-4 py-2 rounded-none text-[11px] font-medium uppercase tracking-[0.2em] disabled:opacity-60 active:opacity-80"
            >
              Finish
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 flex flex-col gap-4 apex-stagger">
        {workout.exercises.length === 0 && (
          <div className="bg-surface border-[0.5px] border-border p-8 text-center">
            <p className="text-[13px] font-light text-ink-mid lowercase">tap + to add your first exercise</p>
          </div>
        )}

        {workout.exercises.map((ex, exIdx) => (
          <div key={`${ex.exerciseId}-${exIdx}`} className="bg-surface border-b-[0.5px] border-border overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <ExerciseCard
                exercise={{ id: parseInt(ex.exerciseId) || 0, name: ex.name, category: ex.category, imageUrl: ex.imageUrl }}
                mode="workout"
                onSwap={() => { setSwapFor(exIdx); setDrawerOpen(true) }}
                onRemove={() => dispatch({ type: 'REMOVE_EXERCISE', index: exIdx })}
              />
            </div>

            <div className="px-3 pb-2 flex flex-col gap-1.5">
              {ex.sets.map((set, setIdx) => (
                <SetRow
                  key={setIdx}
                  setNumber={setIdx + 1}
                  set={set}
                  onChange={(patch) => dispatch({ type: 'UPDATE_SET', exerciseIndex: exIdx, setIndex: setIdx, patch })}
                  onToggle={() => handleToggleSet(exIdx, setIdx, set.completed)}
                />
              ))}
            </div>

            <div className="px-3 pb-3 flex gap-2">
              <button
                onClick={() => dispatch({ type: 'ADD_SET', exerciseIndex: exIdx })}
                className="flex-1 py-2 bg-transparent text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mid rounded-none"
              >
                + Set
              </button>
              {ex.sets.length > 1 && (
                <button
                  onClick={() => dispatch({ type: 'REMOVE_SET', exerciseIndex: exIdx, setIndex: ex.sets.length - 1 })}
                  className="px-3 py-2 bg-transparent text-[10px] font-medium uppercase tracking-[0.2em] text-ink-mid rounded-none"
                >
                  − Set
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {restActive && <RestTimer key={restKey} onDismiss={() => setRestActive(false)} />}

      <div
        className="fixed right-5"
        style={{ bottom: 'calc(4.5rem + max(0.5rem, env(safe-area-inset-bottom)))' }}
      >
        <button
          onClick={() => { setSwapFor(null); setDrawerOpen(true) }}
          className="w-14 h-14 bg-accent rounded-none flex items-center justify-center text-white active:opacity-80 active:scale-[0.97] transition-all duration-100"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      <ExerciseDrawer
        open={drawerOpen && swapFor === null}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleAddExercise}
        title="Add Exercise"
      />
      <ExerciseDrawer
        open={drawerOpen && swapFor !== null}
        onClose={() => { setDrawerOpen(false); setSwapFor(null) }}
        onSelect={handleSwap}
        filterCategory={swapFor !== null ? workout.exercises[swapFor]?.category : undefined}
        title="Swap Exercise"
      />
    </div>
  )
}
