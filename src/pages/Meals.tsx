import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import {
  MEALS, SEASONS, MEAL_TYPES, currentSeason,
  type Season, type MealType, type Meal,
} from '../data/meals'
import { generateMeals, isMealAiEnabled } from '../lib/mealsAi'
import ScrollReveal from '../components/ScrollReveal'

type MealSet = Record<MealType, Meal[]>

export default function Meals() {
  const [season, setSeason] = useState<Season>(() => currentSeason())
  // AI-generated sets per season (session-only); falls back to the curated list.
  const [aiSets, setAiSets] = useState<Partial<Record<Season, MealSet>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const meals: MealSet = aiSets[season] ?? MEALS[season]
  const isAi = Boolean(aiSets[season])

  async function regenerate() {
    setLoading(true)
    setError('')
    try {
      const set = await generateMeals(season)
      // Keep curated for any meal type the model left empty.
      const merged = { ...MEALS[season], ...Object.fromEntries(
        MEAL_TYPES.map(({ key }) => [key, set[key]?.length ? set[key] : MEALS[season][key]])
      ) } as MealSet
      setAiSets((prev) => ({ ...prev, [season]: merged }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate ideas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-nav apex-page">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <h1 className="text-[44px] font-display font-light tracking-[-0.02em] ink-tint head-rise lowercase">meals</h1>
        <p className="text-[13px] font-light text-ink-mid mt-2 tracking-[0.01em]">
          Healthy, lower-calorie ideas — in season{isAi ? ', picked by AI' : ''}.
        </p>
      </div>

      {/* Season selector */}
      <ScrollReveal>
      <div className="px-6 pt-3">
        <div className="grid grid-cols-4 gap-2">
          {SEASONS.map((s) => {
            const active = s.key === season
            return (
              <button
                key={s.key}
                onClick={() => setSeason(s.key)}
                className="flex flex-col items-center gap-1 py-2.5 border-[0.5px] transition-colors"
                style={active
                  ? { borderColor: 'var(--color-accent)', background: 'color-mix(in oklab, var(--color-accent) 10%, transparent)' }
                  : { borderColor: 'var(--color-border)' }}
              >
                <span className="text-[18px] leading-none">{s.emoji}</span>
                <span className={`text-[10px] font-medium uppercase tracking-[0.12em] ${active ? 'text-accent' : 'text-ink-muted'}`}>
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted mt-2">
          follows the season automatically
        </p>
      </div>
      </ScrollReveal>

      {/* AI generate (only when configured) */}
      {isMealAiEnabled && (
        <ScrollReveal delay={40}>
        <div className="px-6 pt-4">
          <button
            onClick={regenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border-[0.5px] border-border py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-mid active:text-accent active:scale-[0.99] transition-all duration-100 disabled:opacity-40"
          >
            {loading
              ? <><div className="w-3.5 h-3.5 border border-ink-mid border-t-transparent rounded-full animate-spin" /> generating…</>
              : isAi
              ? <><RefreshCw size={14} /> regenerate with AI</>
              : <><Sparkles size={14} /> generate with AI</>}
          </button>
          {error && <p className="text-[11px] font-light text-accent mt-2 leading-relaxed">{error}</p>}
        </div>
        </ScrollReveal>
      )}

      {/* Meals grouped by type */}
      <div className="px-6 pt-6">
        {MEAL_TYPES.map(({ key, label }, gi) => (
          <ScrollReveal key={key} delay={60 + gi * 40}>
          <section className="mb-7">
            <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-2 mb-3">
              <span className="t-eyebrow">{label}</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted tabular-nums">
                {meals[key].length} ideas
              </span>
            </div>
            <div className="apex-stagger">
              {meals[key].map((m, i) => (
                <div key={i} className="py-3.5 border-b-[0.5px] border-border last:border-b-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display flex-1 text-[16px] font-medium text-ink tracking-[-0.01em] leading-tight">
                      {m.name}
                    </span>
                    <span className="text-[13px] font-light text-accent tabular-nums flex-shrink-0">
                      {m.kcal} kcal
                    </span>
                  </div>
                  {m.description && (
                    <p className="text-[12px] font-light text-ink-mid mt-1 leading-relaxed">{m.description}</p>
                  )}
                  {m.tags && m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.tags.map((t) => (
                        <span key={t} className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-muted border-[0.5px] border-border px-2 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
