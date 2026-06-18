import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'
import CircleRing from '../components/CircleRing'
import { useTheme } from '../contexts/ThemeContext'

const CHART = {
  light: { accent: '#4f46e5', ink: '#1a1a1a', mid: '#636158', grid: '#e3e0d9', axis: '#B5B2AA', surface: '#faf9f6', track: '#e3e0d9' },
  dark:  { accent: '#6366f1', ink: '#f3f1ec', mid: '#a8a49a', grid: '#2a2a26', axis: '#6f6c63', surface: '#1b1b18', track: '#2a2a26' },
}

export default function Progress() {
  const { workouts, loading } = useWorkouts()
  const { isDark } = useTheme()
  const c = isDark ? CHART.dark : CHART.light
  const [selected, setSelected] = useState<string>('')

  const exerciseNames = useMemo(() => {
    const names = new Set<string>()
    workouts.forEach((w) => w.exercises.forEach((ex) => names.add(ex.name)))
    return Array.from(names).sort()
  }, [workouts])

  const chartData = useMemo(() => {
    if (!selected) return []
    return workouts
      .filter((w) => w.exercises.some((ex) => ex.name === selected))
      .map((w) => {
        const ex = w.exercises.find((e) => e.name === selected)!
        const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg))
        const totalVolume = ex.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0)
        return {
          date: new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          weight: maxWeight,
          volume: Math.round(totalVolume),
        }
      })
      .reverse()
  }, [selected, workouts])

  const pb = chartData.length > 0 ? Math.max(...chartData.map((d) => d.weight)) : 0
  const sessions = chartData.length
  const lastWeight = chartData[chartData.length - 1]?.weight ?? 0

  const totalSets = useMemo(() => workouts.reduce((n, w) => n + w.exercises.reduce((m, ex) => m + ex.sets.filter(s => s.completed).length, 0), 0), [workouts])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-[0.5px] border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-nav apex-page">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-[44px] font-extralight text-ink lowercase">progress</h1>
      </div>

      {/* Circle ring */}
      <div className="px-6 mb-6 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <CircleRing
            percent={Math.min(100, (workouts.length / 50) * 100)}
            color={c.accent}
            trackColor={c.track}
            size={160}
            stroke={12}
          />
          <div className="absolute text-center">
            <p className="text-[44px] font-extralight text-ink leading-none">{workouts.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mt-1">sessions</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-3 apex-stagger">
        <div className="bg-surface border-[0.5px] border-border px-4 py-4">
          <p className="text-[28px] font-extralight text-ink leading-none">{totalSets}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mt-1">Total sets done</p>
        </div>
        <div className="bg-surface border-[0.5px] border-border px-4 py-4">
          <p className="text-[28px] font-extralight text-ink leading-none">{exerciseNames.length}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mt-1">Exercises tracked</p>
        </div>
      </div>

      <div className="px-6">
        {exerciseNames.length === 0 ? (
          <div className="border-[0.5px] border-border p-10 text-center">
            <TrendingUp size={36} className="text-ink-muted mx-auto mb-3" />
            <p className="text-ink-muted text-[13px] font-light lowercase">complete some workouts to see your progress.</p>
          </div>
        ) : (
          <>
            {/* Exercise select */}
            <div className="mb-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-2">Exercise</p>
              <div className="relative">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-transparent border-b-[0.5px] border-border rounded-none px-0 py-3 text-[15px] font-light text-ink focus:outline-none appearance-none"
                >
                  <option value="" style={{ background: c.surface, color: c.ink }}>Select an exercise…</option>
                  {exerciseNames.map((name) => (
                    <option key={name} value={name} style={{ background: c.surface, color: c.ink }}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selected && chartData.length > 0 && (
              <>
                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { label: 'Personal Best', value: `${pb}kg`, color: c.accent },
                    { label: 'Sessions', value: sessions, color: c.ink },
                    { label: 'Last Session', value: `${lastWeight}kg`, color: lastWeight === pb && pb > 0 ? c.accent : c.ink },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-surface border-[0.5px] border-border p-3 text-center">
                      <p className="text-[20px] font-extralight leading-none" style={{ color }}>{value}</p>
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted mt-1 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Max weight chart */}
                <div className="bg-surface border-[0.5px] border-border p-4 mb-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-4">
                    Max Weight (kg)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: c.axis }} />
                      <YAxis tick={{ fontSize: 11, fill: c.axis }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 0, border: `0.5px solid ${c.grid}`, background: c.surface, color: c.ink, fontSize: 13 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={c.accent}
                        strokeWidth={2}
                        dot={{ fill: c.accent, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Volume chart */}
                <div className="bg-surface border-[0.5px] border-border p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-4">
                    Volume (reps × kg)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: c.axis }} />
                      <YAxis tick={{ fontSize: 11, fill: c.axis }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 0, border: `0.5px solid ${c.grid}`, background: c.surface, color: c.ink, fontSize: 13 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke={c.mid}
                        strokeWidth={2}
                        dot={{ fill: c.mid, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selected && chartData.length === 0 && (
              <p className="text-center text-ink-muted text-[13px] font-light lowercase py-10">no data for this exercise yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
