import { useState } from 'react'

interface Props {
  value: number
  onCommit: (n: number) => void
  min?: number
  step?: number
  integer?: boolean
  className?: string
  ariaLabel?: string
}

// A numeric field that's pleasant to edit:
//  • focusing selects the whole value, so you just type the new number — no
//    deleting the default 10/0 first;
//  • it may be empty while you type;
//  • leaving it empty keeps the current value (the default), so nothing is lost.
// The committed value stays a real number for storage.
export default function NumField({
  value,
  onCommit,
  min = 0,
  step,
  integer,
  className,
  ariaLabel,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  const parse = (s: string) => (integer ? parseInt(s, 10) : parseFloat(s))

  return (
    <input
      type="number"
      inputMode={integer ? 'numeric' : 'decimal'}
      min={min}
      step={step}
      aria-label={ariaLabel}
      // While focused we show the draft (may be empty); otherwise the real value.
      value={draft ?? String(value)}
      onFocus={(e) => {
        setDraft(String(value))
        e.currentTarget.select()
      }}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        if (raw === '') return // empty mid-edit — don't clobber the value yet
        const n = parse(raw)
        if (!Number.isNaN(n)) onCommit(Math.max(min, n))
      }}
      onBlur={() => setDraft(null)} // empty/invalid → falls back to the kept value
      className={className}
    />
  )
}
