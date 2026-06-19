import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NavigateOptions, To } from 'react-router-dom'

// Drop-in replacement for useNavigate that opts every navigation into the
// View Transitions API (directional slide / crossfade — see index.css). On
// browsers without support, React Router falls back to an instant navigation.
export function useVTNavigate() {
  const navigate = useNavigate()
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to)
      return navigate(to, { viewTransition: true, ...options })
    },
    [navigate],
  )
}
