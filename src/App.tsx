import { useEffect, useLayoutEffect, useRef } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { WorkoutsProvider } from './contexts/WorkoutsContext'
import { StepsProvider } from './contexts/StepsContext'
import { PresetsProvider } from './contexts/PresetsContext'
import { ToastProvider } from './contexts/ToastContext'
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
    <PresetsProvider>
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
    </PresetsProvider>
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

// Top-level routes that act as peer "tabs" — moving between these crossfades;
// going deeper (into /program/...) slides forward, and back slides in reverse.
const TAB_PATHS = ['/', '/programs', '/workout', '/steps', '/profile', '/history', '/progress']

// Sets data-transition on <html> just before each route's view transition runs,
// so the CSS in index.css can pick the right direction. Runs inside React Router's
// startViewTransition update, so the attribute is set before the new snapshot.
function PageTransitions() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  const prev = useRef(pathname)
  useLayoutEffect(() => {
    const from = prev.current
    const to = pathname
    if (from === to) return
    prev.current = to
    // Only drive data-transition when the browser actually runs View Transitions
    // (Safari 18+/modern Chrome). Otherwise leave it unset so the per-page
    // entrance animations (apex-page fade/rise) still play as the fallback —
    // setting it would suppress them AND there'd be no transition to replace them.
    if (!('startViewTransition' in document)) return
    const depth = (p: string) => p.split('/').filter(Boolean).length
    const isTab = (p: string) => TAB_PATHS.includes(p)
    let dir: 'fade' | 'forward' | 'back'
    if (isTab(from) && isTab(to)) dir = 'fade'
    else if (navType === 'POP') dir = 'back'
    else if (depth(to) >= depth(from)) dir = 'forward'
    else dir = 'back'
    document.documentElement.dataset.transition = dir
  }, [pathname, navType])
  return null
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <ScrollGradient />
        <PageTransitions />
        <Routes>
          <Route path="/auth" element={<AuthGuard />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  )
}

function AuthGuard() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <Auth />
}
