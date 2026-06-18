import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWorkouts } from '../hooks/useWorkouts'
import { useProgramProgress, useCompletedSessions } from '../hooks/useProgramProgress'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Profile() {
  const { user, logOut } = useAuth()
  const { workouts } = useWorkouts()
  const { progress } = useProgramProgress()
  const { completedCount } = useCompletedSessions()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const initial = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()
  const email = user?.email ?? ''

  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      await updateProfile(auth.currentUser!, { displayName: displayName.trim() || null })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await logOut()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-bg pb-nav apex-page">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4 border-b-[0.5px] border-border">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted active:text-ink-mid"
        >
          ← Back
        </button>
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink">profile</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent active:opacity-70 disabled:opacity-40"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pt-10 pb-8 px-6">
        <div
          className="w-20 h-20 flex items-center justify-center mb-4"
          style={{
            border: '1.5px solid var(--color-accent)',
            borderRadius: 0,
          }}
        >
          <span className="text-[32px] font-extralight text-ink lowercase">{initial.toLowerCase()}</span>
        </div>
        <h1 className="text-[28px] font-extralight text-ink lowercase tracking-[0.01em]">
          {displayName.toLowerCase() || email.split('@')[0].toLowerCase()}
        </h1>
        <p className="text-[13px] font-light text-ink-muted mt-1 tracking-[0.03em]">{email}</p>
      </div>

      {/* Your info */}
      <div className="px-6 border-t-[0.5px] border-border pt-6 pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-5">Your Info</p>

        <div className="mb-6">
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mid block mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-transparent border-b-[0.5px] border-border pb-2.5 text-[16px] font-light text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mid block mb-2">
            Email
          </label>
          <p className="text-[15px] font-light text-ink-muted pb-2.5 border-b-[0.5px] border-border">
            {email}
          </p>
        </div>

        {error && <p className="text-[12px] font-light text-ink-mid mt-3">{error}</p>}
      </div>

      {/* Appearance */}
      <div className="px-6 border-t-[0.5px] border-border pt-6 pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-4">Appearance</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { mode: 'light' as const, label: 'Light', icon: Sun },
            { mode: 'dark' as const, label: 'Dark', icon: Moon },
          ]).map(({ mode, label, icon: Icon }) => {
            const active = theme === mode
            return (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`flex items-center justify-center gap-2 py-3.5 border-[0.5px] active:scale-[0.97] transition-all duration-100 ${
                  active ? 'border-accent text-accent bg-accent-bg' : 'border-border text-ink-muted'
                }`}
              >
                <Icon size={15} strokeWidth={1.75} />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 border-t-[0.5px] border-border pt-6 pb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted mb-5">Stats</p>

        <div className="flex flex-col gap-0 apex-stagger">
          {[
            { value: workouts.length.toString(), label: 'workouts logged' },
            { value: completedCount.toString(), label: 'program sessions done' },
            ...(progress ? [{ value: `week ${progress.week}`, label: progress.programName.toLowerCase() }] : []),
          ].map((stat, i, arr) => (
            <div key={i} className={`flex items-baseline gap-4 py-4 ${i < arr.length - 1 ? 'border-b-[0.5px] border-border' : ''}`}>
              <span className="text-[28px] font-extralight text-ink tabular-nums leading-none w-24 flex-shrink-0">{stat.value}</span>
              <span className="text-[13px] font-light text-ink-mid lowercase tracking-[0.01em]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pt-2 pb-8 border-t-[0.5px] border-border flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-[18px] text-[11px] font-medium uppercase tracking-[0.2em] text-white active:opacity-70 disabled:opacity-40 transition-opacity mt-4 active:scale-[0.97] transition-transform duration-100"
          style={{ background: 'var(--color-accent)' }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full py-[18px] text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted border-[0.5px] border-border active:opacity-70 transition-opacity"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
