import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'
import CircleRing from '../components/CircleRing'

export default function Progress() {
  const { workouts, loading } = useWorkouts()
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
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-[0.5px] border-[#0F0F0E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-nav">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-[44px] font-extralight text-[#0F0F0E] lowercase">progress</h1>
      </div>

      {/* Circle ring — orange is the one accent */}
      <div className="px-6 mb-6 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <CircleRing
            percent={Math.min(100, (workouts.length / 50) * 100)}
            color="#22E8E0"
            trackColor="#E5E3DD"
            size={160}
            stroke={12}
          />
          <div className="absolute text-center">
            <p className="text-[44px] font-extralight text-[#0F0F0E] leading-none">{workouts.length}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mt-1">sessions</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-3">
        <div className="bg-white border-[0.5px] border-[#E5E3DD] px-4 py-4">
          <p className="text-[28px] font-extralight text-[#0F0F0E] leading-none">{totalSets}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mt-1">Total sets done</p>
        </div>
        <div className="bg-white border-[0.5px] border-[#E5E3DD] px-4 py-4">
          <p className="text-[28px] font-extralight text-[#0F0F0E] leading-none">{exerciseNames.length}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mt-1">Exercises tracked</p>
        </div>
      </div>

      <div className="px-6">
        {exerciseNames.length === 0 ? (
          <div className="border-[0.5px] border-[#E5E3DD] p-10 text-center">
            <TrendingUp size={36} className="text-[#B5B2AA] mx-auto mb-3" />
            <p className="text-[#B5B2AA] text-[13px] font-light lowercase">complete some workouts to see your progress.</p>
          </div>
        ) : (
          <>
            {/* Exercise select — underline style */}
            <div className="mb-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-2">Exercise</p>
              <div className="relative">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-transparent border-b-[0.5px] border-[#E5E3DD] rounded-none px-0 py-3 text-[15px] font-light text-[#0F0F0E] focus:outline-none appearance-none"
                >
                  <option value="" style={{ background: '#F8F7F4' }}>Select an exercise…</option>
                  {exerciseNames.map((name) => (
                    <option key={name} value={name} style={{ background: '#F8F7F4' }}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selected && chartData.length > 0 && (
              <>
                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { label: 'Personal Best', value: `${pb}kg` },
                    { label: 'Sessions', value: sessions },
                    { label: 'Last Session', value: `${lastWeight}kg` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white border-[0.5px] border-[#E5E3DD] p-3 text-center">
                      <p className="text-[20px] font-extralight text-[#0F0F0E] leading-none">{value}</p>
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#B5B2AA] mt-1 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Max weight chart */}
                <div className="bg-white border-[0.5px] border-[#E5E3DD] p-4 mb-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-4">
                    Max Weight (kg)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DD" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#B5B2AA' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#B5B2AA' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 0, border: '0.5px solid #E5E3DD', background: '#FFFFFF', color: '#0F0F0E', fontSize: 13 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#22E8E0"
                        strokeWidth={2}
                        dot={{ fill: '#22E8E0', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Volume chart */}
                <div className="bg-white border-[0.5px] border-[#E5E3DD] p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-4">
                    Volume (reps × kg)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DD" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#B5B2AA' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#B5B2AA' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 0, border: '0.5px solid #E5E3DD', background: '#FFFFFF', color: '#0F0F0E', fontSize: 13 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#636158"
                        strokeWidth={2}
                        dot={{ fill: '#636158', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selected && chartData.length === 0 && (
              <p className="text-center text-[#B5B2AA] text-[13px] font-light lowercase py-10">no data for this exercise yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
