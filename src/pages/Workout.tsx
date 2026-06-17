import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Timer } from 'lucide-react'
import { useWorkout } from '../contexts/WorkoutContext'
import { useWorkouts } from '../hooks/useWorkouts'
import ExerciseCard from '../components/ExerciseCard'
import SetRow from '../components/SetRow'
import ExerciseDrawer from '../components/ExerciseDrawer'
import RestTimer from '../components/RestTimer'
import type { WgerExercise } from '../types'

function useTimer(startTime: number | undefined) {
  const tick = () => startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  const [elapsed, setElapsed] = useState(tick)
  useEffect(() => {
    if (!startTime) return
    setElapsed(tick())
    const id = setInterval(() => setElapsed(tick()), 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') setElapsed(tick()) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [startTime])
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const s = (elapsed % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Workout() {
  const { workout, dispatch } = useWorkout()
  const { saveWorkout } = useWorkouts()
  const navigate = useNavigate()
  const timer = useTimer(workout?.startTime)
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
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center gap-4 px-6 pb-nav">
        <p className="text-[#636158] text-[15px] font-light lowercase">no active workout.</p>
        <button
          onClick={() => dispatch({ type: 'START' })}
          className="bg-[#22E8E0] text-[#0F0F0E] px-8 py-[18px] w-full text-[11px] font-medium uppercase tracking-[0.2em] rounded-none"
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
    dispatch({
      type: 'ADD_EXERCISE',
      exercise: { exerciseId: String(ex.id), name: ex.name, category: ex.category, imageUrl: ex.imageUrl },
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
    <div className="min-h-screen bg-[#F8F7F4] pb-nav">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#F8F7F4]/95 backdrop-blur px-6 pt-14 pb-4 border-b-[0.5px] border-[#E5E3DD]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-extralight text-[#0F0F0E] lowercase tracking-[0.01em] truncate">{workout.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] font-light text-[#636158] tracking-[0.05em]">{timer}</span>
              {totalSets > 0 && (
                <span className="text-[11px] font-light text-[#636158] tracking-[0.05em]">{completedSets}/{totalSets} sets</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setRestActive(true)}
              className="flex items-center gap-1.5 border-[0.5px] border-[#E5E3DD] bg-white px-4 py-2 rounded-none text-[11px] font-medium uppercase tracking-[0.2em] text-[#0F0F0E]"
            >
              <Timer size={12} className="text-[#22E8E0]" />
              Rest
            </button>
            <button
              onClick={finish}
              disabled={finishing}
              className="bg-[#22E8E0] text-[#0F0F0E] px-4 py-2 rounded-none text-[11px] font-medium uppercase tracking-[0.2em] disabled:opacity-60"
            >
              Finish
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 flex flex-col gap-4">
        {workout.exercises.length === 0 && (
          <div className="bg-white border-[0.5px] border-[#E5E3DD] p-8 text-center">
            <p className="text-[13px] font-light text-[#636158] lowercase">tap + to add your first exercise</p>
          </div>
        )}

        {workout.exercises.map((ex, exIdx) => (
          <div key={`${ex.exerciseId}-${exIdx}`} className="bg-white border-b-[0.5px] border-[#E5E3DD] overflow-hidden">
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
                className="flex-1 py-2 bg-transparent text-[10px] font-medium uppercase tracking-[0.2em] text-[#636158] rounded-none"
              >
                + Set
              </button>
              {ex.sets.length > 1 && (
                <button
                  onClick={() => dispatch({ type: 'REMOVE_SET', exerciseIndex: exIdx, setIndex: ex.sets.length - 1 })}
                  className="px-3 py-2 bg-transparent text-[10px] font-medium uppercase tracking-[0.2em] text-[#636158] rounded-none"
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
          className="w-14 h-14 bg-[#22E8E0] rounded-none flex items-center justify-center text-[#0F0F0E] active:opacity-80 transition-opacity"
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
