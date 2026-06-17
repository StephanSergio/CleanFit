import { useState, useEffect } from 'react'

export function useElapsed(startTime: number | undefined): string {
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
