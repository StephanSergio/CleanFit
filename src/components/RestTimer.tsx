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
  const [remaining, setRemaining] = useState(90)
  const [paused, setPaused] = useState(false)
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          onDismissRef.current()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [paused])

  function select(seconds: number) {
    setPreset(seconds)
    setRemaining(seconds)
    setPaused(false)
  }

  function reset() {
    setRemaining(preset)
    setPaused(false)
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
            style={{ width: `${pct}%`, transitionDuration: '1s' }}
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
              onClick={() => setPaused((p) => !p)}
              className="w-9 h-9 rounded-none bg-transparent border-[0.5px] border-[#2A2A28] flex items-center justify-center text-accent"
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              onClick={reset}
              className="w-9 h-9 rounded-none bg-transparent border-[0.5px] border-[#2A2A28] flex items-center justify-center text-ink-mid"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onDismiss}
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
