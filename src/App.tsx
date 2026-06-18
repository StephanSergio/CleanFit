import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
      <div className="min-h-screen flex items-center justify-center">
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

// Drives the scroll-reactive background gradient. Updates --bg-shift (a transform
// offset, compositor-only) via requestAnimationFrame so it stays smooth, and
// resets on route change so each page starts from the top of the gradient.
function ScrollGradient() {
  const { pathname } = useLocation()
  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      root.style.setProperty('--bg-shift', '0vh')
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const max = root.scrollHeight - root.clientHeight
      const p = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0
      root.style.setProperty('--bg-shift', `${(-p * 100).toFixed(2)}vh`)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollGradient />
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
