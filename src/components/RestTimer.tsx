import { useState, useEffect, useRef } from 'react'
import { X, RotateCcw, Pause, Play } from 'lucide-react'

const PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
]

interface Props {
  onDismiss: () => void
}

export default function RestTimer({ onDismiss }: Props) {
  const [preset, setPreset] = useState(90)
  // Wall-clock based: we track the absolute end time and derive the remaining
  // seconds from Date.now(). Counting real elapsed time (not interval ticks)
  // means the rest keeps running while the tab is backgrounded, the phone is
  // locked, or you switch to another app — when you come back it reflects the
  // true time left (or it's already done).
  const [endAt, setEndAt] = useState(() => Date.now() + 90_000)
  const [paused, setPaused] = useState(false)
  const [pausedRemaining, setPausedRemaining] = useState(90)
  const [, setNow] = useState(Date.now()) // re-render tick only
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  const remaining = paused
    ? pausedRemaining
    : Math.max(0, Math.ceil((endAt - Date.now()) / 1000))

  // Refresh the display, and re-sync the instant the tab becomes visible again
  // (so returning from the background snaps to the correct time immediately).
  useEffect(() => {
    if (paused) return
    const tick = () => setNow(Date.now())
    const id = setInterval(tick, 500)
    const onVisible = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [paused])

  // Auto-dismiss when the rest has elapsed (incl. while it was backgrounded).
  useEffect(() => {
    if (!paused && remaining <= 0) onDismissRef.current()
  }, [remaining, paused])

  function select(seconds: number) {
    setPreset(seconds)
    setEndAt(Date.now() + seconds * 1000)
    setPaused(false)
    setNow(Date.now())
  }

  function reset() {
    setEndAt(Date.now() + preset * 1000)
    setPaused(false)
    setNow(Date.now())
  }

  function togglePause() {
    if (paused) {
      // Resume: rebuild the end time from the remaining seconds.
      setEndAt(Date.now() + pausedRemaining * 1000)
      setPaused(false)
      setNow(Date.now())
    } else {
      setPausedRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)))
      setPaused(true)
    }
  }

  const pct = Math.max(0, (remaining / preset) * 100)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="fixed inset-x-0 z-30 px-4 apex-fade" style={{ bottom: 'calc(4.5rem + max(0.5rem, env(safe-area-inset-bottom)) + 0.5rem)' }}>
      <div className="bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] overflow-hidden">
        <div className="h-[1px] bg-[#2A2A28]">
          <div
            className="h-[1px] bg-accent transition-all ease-linear"
            style={{ width: `${pct}%`, transitionDuration: '0.5s' }}
          />
        </div>

        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4A4844] mb-0.5">Rest</p>
            <p className="text-[32px] font-extralight text-white leading-none tabular-nums">
              {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
            </p>
          </div>

          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => select(p.seconds)}
                className={`text-[10px] font-medium uppercase tracking-[0.14em] px-3 py-1.5 rounded-none transition-colors ${
                  preset === p.seconds
                    ? 'bg-accent text-white'
                    : 'bg-[#1C1C1A] border-[0.5px] border-[#2A2A28] text-ink-mid'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={togglePause}
              aria-label={paused ? 'Resume rest' : 'Pause rest'}
              className="w-9 h-9 rounded-none bg-transparent border-[0.5px] border-[#2A2A28] flex items-center justify-center text-accent"
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              onClick={reset}
              aria-label="Reset rest"
              className="w-9 h-9 rounded-none bg-transparent border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onDismiss}
              aria-label="Dismiss rest timer"
              className="w-9 h-9 rounded-none bg-transparent border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
