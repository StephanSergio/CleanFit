import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle2, Clock, Timer } from 'lucide-react'
import { useWorkout } from '../contexts/WorkoutContext'
import { useWorkouts } from '../hooks/useWorkouts'
import ExerciseCard from '../components/ExerciseCard'
import SetRow from '../components/SetRow'
import ExerciseDrawer from '../components/ExerciseDrawer'
import RestTimer from '../components/RestTimer'
import type { WgerExercise } from '../types'

function useTimer(startTime: number | undefined) {
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

export default function Workout() {
  const { workout, dispatch } = useWorkout()
  const { saveWorkout } = useWorkouts()
  const navigate = useNavigate()
  const timer = useTimer(workout?.startTime)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [swapFor, setSwapFor] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [restActive, setRestActive] = useState(false)

  if (!workout) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center gap-4 px-6 pb-nav">
        <p className="text-[#8E8E93] text-[15px]">No active workout.</p>
        <button
          onClick={() => dispatch({ type: 'START' })}
          className="bg-[#F4845F] text-white px-8 py-3.5 rounded-[16px] text-[15px] font-semibold"
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
    <div className="min-h-screen bg-[#F2F2F7] pb-nav">
      <div className="sticky top-0 z-10 bg-[#F2F2F7]/95 backdrop-blur-xl px-5 pt-14 pb-3 border-b border-[#E5E5EA]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-bold text-[#1C1C1E] tracking-tight leading-snug truncate">{workout.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1 text-[#8E8E93] text-[12px]">
                <Clock size={11} />
                <span>{timer}</span>
              </div>
              {totalSets > 0 && (
                <span className="text-[12px] text-[#8E8E93]">{completedSets}/{totalSets} sets</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setRestActive(true)}
              className="flex items-center gap-1.5 bg-white border border-[#E5E5EA] px-3 py-1.5 rounded-[12px] text-[13px] font-semibold text-[#636366]"
            >
              <Timer size={14} />
              Rest
            </button>
            <button
              onClick={finish}
              disabled={finishing}
              className="flex items-center gap-1.5 bg-[#30D158] text-white px-3 py-1.5 rounded-[12px] text-[13px] font-semibold disabled:opacity-60"
            >
              <CheckCircle2 size={14} />
              Finish
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {workout.exercises.length === 0 && (
          <div className="bg-white shadow-sm rounded-[20px] p-8 text-center">
            <p className="text-[#8E8E93] text-[14px]">Tap + to add your first exercise</p>
          </div>
        )}

        {workout.exercises.map((ex, exIdx) => (
          <div key={`${ex.exerciseId}-${exIdx}`} className="bg-white shadow-sm rounded-[20px] overflow-hidden">
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
                  onToggle={() => dispatch({ type: 'TOGGLE_SET', exerciseIndex: exIdx, setIndex: setIdx })}
                />
              ))}
            </div>

            <div className="px-3 pb-3 flex gap-2">
              <button
                onClick={() => dispatch({ type: 'ADD_SET', exerciseIndex: exIdx })}
                className="flex-1 py-2 rounded-[12px] bg-[#ECECF1] text-[#8E8E93] text-[13px] font-semibold"
              >
                + Set
              </button>
              {ex.sets.length > 1 && (
                <button
                  onClick={() => dispatch({ type: 'REMOVE_SET', exerciseIndex: exIdx, setIndex: ex.sets.length - 1 })}
                  className="px-3 py-2 rounded-[12px] bg-[#ECECF1] text-[#AEAEB2] text-[13px] font-semibold"
                >
                  − Set
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {restActive && <RestTimer onDismiss={() => setRestActive(false)} />}

      <div
        className="fixed right-5"
        style={{ bottom: 'calc(4.5rem + max(0.5rem, env(safe-area-inset-bottom)))' }}
      >
        <button
          onClick={() => { setSwapFor(null); setDrawerOpen(true) }}
          className="w-14 h-14 bg-[#F4845F] rounded-full flex items-center justify-center shadow-lg text-white active:opacity-80 transition-opacity"
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
