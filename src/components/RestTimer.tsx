import { useState, useEffect } from 'react'
import { X, RotateCcw } from 'lucide-react'

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
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running || remaining <= 0) {
      if (remaining <= 0) onDismiss()
      return
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [running, remaining, onDismiss])

  function select(seconds: number) {
    setPreset(seconds)
    setRemaining(seconds)
    setRunning(true)
  }

  function reset() {
    setRemaining(preset)
    setRunning(true)
  }

  const pct = Math.max(0, (remaining / preset) * 100)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="fixed inset-x-0 z-30 px-4" style={{ bottom: 'calc(4.5rem + max(0.5rem, env(safe-area-inset-bottom)) + 0.5rem)' }}>
      <div className="bg-white border border-[#E5E5EA] rounded-[20px] shadow-xl overflow-hidden">
        <div className="h-1 bg-[#ECECF1]">
          <div
            className="h-full bg-[#F4845F] transition-all duration-1000 linear"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C7C7CC] mb-0.5">Rest</p>
            <p className="text-[30px] font-bold text-[#1C1C1E] leading-none tabular-nums">
              {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
            </p>
          </div>

          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => select(p.seconds)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-[10px] transition-colors ${
                  preset === p.seconds
                    ? 'bg-[#F4845F] text-white'
                    : 'bg-[#ECECF1] text-[#8E8E93]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={reset}
              className="w-9 h-9 rounded-[12px] bg-[#ECECF1] flex items-center justify-center text-[#8E8E93]"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onDismiss}
              className="w-9 h-9 rounded-[12px] bg-[#ECECF1] flex items-center justify-center text-[#8E8E93]"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
