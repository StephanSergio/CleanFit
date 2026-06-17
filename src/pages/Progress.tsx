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
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F4845F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-nav" style={{ background: 'linear-gradient(160deg, #F2F2F7 0%, #ECECF1 50%, #F2F2F7 100%)' }}>
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-[38px] font-bold text-[#1C1C1E] tracking-tight">Progress</h1>
      </div>

      <div className="px-5 mb-6 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <CircleRing
            percent={Math.min(100, (workouts.length / 50) * 100)}
            color="#F4845F"
            trackColor="#E5E5EA"
            size={160}
            stroke={12}
          />
          <div className="absolute text-center">
            <p className="text-[44px] font-bold text-[#1C1C1E] leading-none">{workouts.length}</p>
            <p className="text-[12px] text-[#8E8E93] mt-1">sessions</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-6 grid grid-cols-2 gap-3">
        <div className="bg-white shadow-sm rounded-[20px] px-4 py-4">
          <p className="text-[28px] font-bold text-[#1C1C1E] leading-none">{totalSets}</p>
          <p className="text-[12px] text-[#8E8E93] mt-1">Total sets done</p>
        </div>
        <div className="bg-white shadow-sm rounded-[20px] px-4 py-4">
          <p className="text-[28px] font-bold text-[#F4845F] leading-none">{exerciseNames.length}</p>
          <p className="text-[12px] text-[#8E8E93] mt-1">Exercises tracked</p>
        </div>
      </div>

      <div className="px-5">
        {exerciseNames.length === 0 ? (
          <div className="bg-white shadow-sm rounded-[20px] p-10 text-center">
            <TrendingUp size={36} className="text-[#C7C7CC] mx-auto mb-3" />
            <p className="text-[#8E8E93] text-[14px]">Complete some workouts to see your progress.</p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#AEAEB2] mb-2">Exercise</p>
              <div className="relative">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-white border border-[#E5E5EA] rounded-[16px] px-4 py-3.5 text-[15px] text-[#1C1C1E] focus:outline-none focus:border-[#F4845F] appearance-none transition-colors"
                >
                  <option value="" style={{ background: '#FFFFFF' }}>Select an exercise…</option>
                  {exerciseNames.map((name) => (
                    <option key={name} value={name} style={{ background: '#FFFFFF' }}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selected && chartData.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { label: 'Personal Best', value: `${pb}kg` },
                    { label: 'Sessions', value: sessions },
                    { label: 'Last Session', value: `${lastWeight}kg` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white shadow-sm rounded-[16px] p-3 text-center">
                      <p className="text-[20px] font-bold text-[#1C1C1E] leading-none">{value}</p>
                      <p className="text-[10px] text-[#8E8E93] mt-1 uppercase tracking-wide leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white shadow-sm rounded-[20px] p-4 mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#AEAEB2] mb-4">
                    Max Weight (kg)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8E8E93' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #E5E5EA', background: '#FFFFFF', color: '#1C1C1E', fontSize: 13 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#F4845F"
                        strokeWidth={2.5}
                        dot={{ fill: '#F4845F', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white shadow-sm rounded-[20px] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#AEAEB2] mb-4">
                    Volume (reps × kg)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8E8E93' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #E5E5EA', background: '#FFFFFF', color: '#1C1C1E', fontSize: 13 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#30D158"
                        strokeWidth={2.5}
                        dot={{ fill: '#30D158', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {selected && chartData.length === 0 && (
              <p className="text-center text-[#AEAEB2] py-10 text-[14px]">No data for this exercise yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
