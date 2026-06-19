import { useVTNavigate } from '../hooks/useVTNavigate'
import { ArrowRight } from 'lucide-react'
import { PROGRAMS } from '../data/programs'
import { totalSessions, useProgramProgress } from '../hooks/useProgramProgress'
import ScrollReveal from '../components/ScrollReveal'

export default function Programs() {
  const navigate = useVTNavigate()
  const { progress } = useProgramProgress()

  return (
    <div className="min-h-screen pb-nav apex-page">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-2">
          Training
        </p>
        <h1 className="text-[44px] font-display font-light tracking-[-0.02em] lowercase leading-[1.05] ink-tint head-rise">
          programs
        </h1>
      </div>

      {/* Programs list */}
      <ScrollReveal>
      <div className="px-6 apex-stagger">
        {PROGRAMS.map((p) => {
          const total = totalSessions(p.id)
          const daysPerWeek = p.daysPerWeek ?? Math.max(...p.phases.map((ph) => ph.days.length))
          const isActive = progress?.programId === p.id
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/program/${p.id}`)}
              className="row-press w-full text-left py-5 flex items-center gap-4 border-b-[0.5px] border-border"
              style={{
                borderLeft: `3px solid ${isActive ? 'var(--color-accent)' : 'var(--color-neutral)'}`,
                paddingLeft: 16,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[20px] font-display font-medium text-ink lowercase tracking-[-0.01em] leading-snug">
                    {p.name}
                  </p>
                  {isActive && (
                    <span
                      className="text-[9px] font-medium uppercase tracking-[0.14em] px-2 py-0.5"
                      style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                    >
                      active
                    </span>
                  )}
                </div>
                {p.fullName && p.fullName !== p.name && (
                  <p className="text-[13px] font-light text-ink-mid lowercase mt-0.5">
                    {p.fullName}
                  </p>
                )}
                <p className="text-[11px] font-light text-ink-muted tracking-[0.03em] mt-1.5">
                  {daysPerWeek} days/week
                  {total !== null ? ` · ${total} sessions` : ' · ongoing'}
                  {p.author ? ` · ${p.author}` : ''}
                </p>
              </div>
              <ArrowRight size={14} style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-ink-muted)', flexShrink: 0 }} />
            </button>
          )
        })}
      </div>
      </ScrollReveal>
    </div>
  )
}
