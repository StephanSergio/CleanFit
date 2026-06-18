import { useState, useMemo } from 'react'
import { Footprints, X, Check } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { useSteps } from '../contexts/StepsContext'

const GOAL = 10_000

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T12:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default function Steps() {
  const { entries, loading, logSteps, removeEntry } = useSteps()
  const [date, setDate] = useState(todayStr())
  const [stepsInput, setStepsInput] = useState('')
  const [saving, setSaving] = useState(false)

  const entryMap = useMemo(() => {
    const m = new Map<string, number>()
    entries.forEach((e) => m.set(e.date, e.steps))
    return m
  }, [entries])

  const today = todayStr()
  const todaySteps = entryMap.get(today) ?? 0
  const goalPct = Math.min(100, (todaySteps / GOAL) * 100)
  const goalMet = todaySteps >= GOAL

  const weeklyAvg = useMemo(() => {
    if (entries.length === 0) return 0
    const last7 = entries.slice(0, 7)
    return Math.round(last7.reduce((s, e) => s + e.steps, 0) / last7.length)
  }, [entries])

  const bestDay = useMemo(() => {
    if (entries.length === 0) return 0
    return Math.max(...entries.map((e) => e.steps))
  }, [entries])

  const chartData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      days.push({
        label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        steps: entryMap.get(ds) ?? 0,
        isToday: ds === today,
      })
    }
    return days
  }, [entryMap, today])

  function loadEntry(e: { date: string; steps: number }) {
    setDate(e.date)
    setStepsInput(String(e.steps))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLog() {
    const n = parseInt(stepsInput, 10)
    if (!date || isNaN(n) || n < 0) return
    setSaving(true)
    try {
      await logSteps(date, n)
      setStepsInput('')
      setDate(todayStr())
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-[0.5px] border-[#0F0F0E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-nav apex-page">

      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-[44px] font-extralight text-[#0F0F0E] lowercase">steps</h1>
      </div>

      {/* Today hero */}
      <div className="px-6 mb-5 apex-fade">
        <div
          className="bg-white p-5 transition-all duration-500"
          style={{ border: `0.5px solid ${goalMet ? '#22E8E0' : '#E5E3DD'}` }}
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-1.5">Today</p>
              <p
                className="text-[52px] font-extralight leading-none tabular-nums transition-colors duration-500"
                style={{ color: goalMet ? '#22E8E0' : '#0F0F0E' }}
              >
                {todaySteps.toLocaleString()}
              </p>
            </div>
            <div className="text-right mb-1">
              <p className="text-[11px] font-light text-[#B5B2AA]">goal</p>
              <p className="text-[13px] font-light text-[#636158]">{GOAL.toLocaleString()}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-[1px] bg-[#E5E3DD] overflow-hidden">
            <div
              className="h-[1px] bg-[#22E8E0] transition-all duration-700"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          {goalMet && (
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#22E8E0] mt-2">
              goal reached
            </p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-6 mb-5 grid grid-cols-2 gap-3 apex-stagger">
        <div className="bg-white border-[0.5px] border-[#E5E3DD] px-4 py-4">
          <p className="text-[28px] font-extralight text-[#0F0F0E] leading-none tabular-nums">
            {weeklyAvg.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mt-1">7-day avg</p>
        </div>
        <div className="bg-white border-[0.5px] border-[#E5E3DD] px-4 py-4">
          <p className="text-[28px] font-extralight text-[#0F0F0E] leading-none tabular-nums">
            {bestDay.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mt-1">best day</p>
        </div>
      </div>

      {/* Log form */}
      <div className="px-6 mb-5">
        <div className="bg-white border-[0.5px] border-[#E5E3DD] p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-4">Log Steps</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#B5B2AA] mb-2">Date</p>
              <input
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-b-[0.5px] border-[#E5E3DD] rounded-none px-0 py-2 font-light text-[#0F0F0E] focus:outline-none appearance-none"
                style={{ fontSize: 16 }}
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#B5B2AA] mb-2">Steps</p>
              <input
                type="number"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                placeholder="0"
                min="0"
                max="99999"
                className="w-full bg-transparent border-b-[0.5px] border-[#E5E3DD] rounded-none px-0 py-2 font-light text-[#0F0F0E] focus:outline-none"
                style={{ fontSize: 16 }}
                onKeyDown={(e) => e.key === 'Enter' && handleLog()}
              />
            </div>
            <button
              onClick={handleLog}
              disabled={!stepsInput || saving}
              className="flex items-center justify-center w-10 h-10 bg-[#0F0F0E] flex-shrink-0 transition-opacity disabled:opacity-30 active:opacity-70"
            >
              {saving
                ? <div className="w-4 h-4 border border-[#22E8E0] border-t-transparent rounded-full animate-spin" />
                : <Check size={16} strokeWidth={1.5} color="#22E8E0" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="px-6 mb-5">
        <div className="bg-white border-[0.5px] border-[#E5E3DD] p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-4">Last 7 Days</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: -30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DD" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#B5B2AA' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#B5B2AA' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 0,
                  border: '0.5px solid #E5E3DD',
                  background: '#FFFFFF',
                  color: '#0F0F0E',
                  fontSize: 13,
                }}
                formatter={(v) => [typeof v === 'number' ? v.toLocaleString() : v, 'steps']}
                cursor={{ fill: '#F8F7F4' }}
              />
              <ReferenceLine
                y={GOAL}
                stroke="#22E8E0"
                strokeDasharray="4 3"
                strokeWidth={0.75}
              />
              <Bar dataKey="steps" maxBarSize={32} isAnimationActive>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.steps >= GOAL ? '#22E8E0' : entry.isToday ? '#0F0F0E' : '#E5E3DD'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#22E8E0] mt-1 text-right">
            — goal {GOAL.toLocaleString()}
          </p>
        </div>
      </div>

      {/* History */}
      <div className="px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-3">History</p>
        {entries.length === 0 ? (
          <div className="border-[0.5px] border-[#E5E3DD] p-10 text-center">
            <Footprints size={36} strokeWidth={1} className="mx-auto mb-3" style={{ color: '#B5B2AA' }} />
            <p className="text-[#B5B2AA] text-[13px] font-light lowercase">no steps logged yet.</p>
            <p className="text-[#B5B2AA] text-[11px] font-light lowercase mt-1">tap log steps above to get started.</p>
          </div>
        ) : (
          <div className="apex-stagger">
            {entries.map((entry, i) => {
              const pct = Math.min(100, (entry.steps / GOAL) * 100)
              const met = entry.steps >= GOAL
              return (
                <div
                  key={entry.date}
                  className={`py-3.5 cursor-pointer active:opacity-70 transition-opacity ${
                    i < entries.length - 1 ? 'border-b-[0.5px] border-[#E5E3DD]' : ''
                  }`}
                  onClick={() => loadEntry(entry)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-light text-[#0F0F0E]">{fmtDate(entry.date)}</span>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-[15px] font-light tabular-nums transition-colors"
                        style={{ color: met ? '#22E8E0' : '#0F0F0E' }}
                      >
                        {entry.steps.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeEntry(entry.date) }}
                        className="w-6 h-6 flex items-center justify-center text-[#E5E3DD] active:text-[#B5B2AA] transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {/* Mini goal bar */}
                  <div className="h-[1px] bg-[#E5E3DD] overflow-hidden">
                    <div
                      className="h-[1px] transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: '#22E8E0',
                        opacity: met ? 1 : 0.45,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
