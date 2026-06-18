import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { WorkoutExercise, WorkoutSet } from '../types'

export interface ActiveWorkout {
  name: string
  startTime: number
  exercises: WorkoutExercise[]
}

type Action =
  | { type: 'START' }
  | { type: 'START_WITH_EXERCISES'; name: string; exercises: WorkoutExercise[] }
  | { type: 'ADD_EXERCISE'; exercise: Omit<WorkoutExercise, 'sets'>; sets?: WorkoutSet[] }
  | { type: 'REMOVE_EXERCISE'; index: number }
  | { type: 'SWAP_EXERCISE'; index: number; exercise: Omit<WorkoutExercise, 'sets'> }
  | { type: 'ADD_SET'; exerciseIndex: number }
  | { type: 'UPDATE_SET'; exerciseIndex: number; setIndex: number; patch: Partial<WorkoutSet> }
  | { type: 'TOGGLE_SET'; exerciseIndex: number; setIndex: number }
  | { type: 'REMOVE_SET'; exerciseIndex: number; setIndex: number }
  | { type: 'RESET' }

const defaultSet: WorkoutSet = { reps: 4, weightKg: 10, completed: false }

function makeExercise(base: Omit<WorkoutExercise, 'sets'>): WorkoutExercise {
  return { ...base, sets: [{ ...defaultSet }] }
}

function reducer(state: ActiveWorkout | null, action: Action): ActiveWorkout | null {
  if (action.type === 'RESET') return null

  if (action.type === 'START') {
    return { name: 'Workout', startTime: Date.now(), exercises: [] }
  }

  if (action.type === 'START_WITH_EXERCISES') {
    return {
      name: action.name,
      startTime: Date.now(),
      exercises: action.exercises,
    }
  }

  if (!state) return state

  switch (action.type) {
    case 'ADD_EXERCISE': {
      const created = action.sets && action.sets.length
        ? { ...action.exercise, sets: action.sets.map((s) => ({ ...s, completed: false })) }
        : makeExercise(action.exercise)
      return { ...state, exercises: [...state.exercises, created] }
    }

    case 'REMOVE_EXERCISE':
      return { ...state, exercises: state.exercises.filter((_, i) => i !== action.index) }

    case 'SWAP_EXERCISE': {
      const exercises = [...state.exercises]
      exercises[action.index] = { ...action.exercise, sets: exercises[action.index].sets }
      return { ...state, exercises }
    }

    case 'ADD_SET': {
      const exercises = [...state.exercises]
      const ex = exercises[action.exerciseIndex]
      const last = ex.sets[ex.sets.length - 1] ?? defaultSet
      exercises[action.exerciseIndex] = {
        ...ex,
        sets: [...ex.sets, { reps: last.reps, weightKg: last.weightKg, completed: false }],
      }
      return { ...state, exercises }
    }

    case 'UPDATE_SET': {
      const exercises = [...state.exercises]
      const ex = exercises[action.exerciseIndex]
      const sets = [...ex.sets]
      sets[action.setIndex] = { ...sets[action.setIndex], ...action.patch }
      exercises[action.exerciseIndex] = { ...ex, sets }
      return { ...state, exercises }
    }

    case 'TOGGLE_SET': {
      const exercises = [...state.exercises]
      const ex = exercises[action.exerciseIndex]
      const sets = [...ex.sets]
      sets[action.setIndex] = { ...sets[action.setIndex], completed: !sets[action.setIndex].completed }
      exercises[action.exerciseIndex] = { ...ex, sets }
      return { ...state, exercises }
    }

    case 'REMOVE_SET': {
      const exercises = [...state.exercises]
      const ex = exercises[action.exerciseIndex]
      if (ex.sets.length <= 1) return state
      exercises[action.exerciseIndex] = { ...ex, sets: ex.sets.filter((_, i) => i !== action.setIndex) }
      return { ...state, exercises }
    }

    default:
      return state
  }
}

const WorkoutContext = createContext<{
  workout: ActiveWorkout | null
  dispatch: React.Dispatch<Action>
} | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workout, dispatch] = useReducer(reducer, null)
  return (
    <WorkoutContext.Provider value={{ workout, dispatch }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkout must be inside WorkoutProvider')
  return ctx
}
