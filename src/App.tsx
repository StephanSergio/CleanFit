import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { WorkoutsProvider } from './contexts/WorkoutsContext'
import { StepsProvider } from './contexts/StepsContext'
import BottomNav from './components/BottomNav'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Exercises from './pages/Exercises'
import History from './pages/History'
import Progress from './pages/Progress'
import Programs from './pages/Programs'
import Steps from './pages/Steps'
import Profile from './pages/Profile'
import Program from './pages/Program'
import PhaseDetail from './pages/PhaseDetail'
import DayWorkout from './pages/DayWorkout'

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return (
    <WorkoutsProvider>
    <WorkoutProvider>
    <StepsProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/steps" element={<Steps />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/program/:programId" element={<Program />} />
        <Route path="/program/:programId/:phaseId" element={<PhaseDetail />} />
        <Route path="/program/:programId/:phaseId/w/:week/d/:dayNum" element={<DayWorkout />} />
      </Routes>
      <BottomNav />
    </StepsProvider>
    </WorkoutProvider>
    </WorkoutsProvider>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<AuthGuard />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </HashRouter>
  )
}

function AuthGuard() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <Auth />
}
