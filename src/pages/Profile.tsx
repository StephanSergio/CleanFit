import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWorkouts } from '../hooks/useWorkouts'
import { useProgramProgress, useCompletedSessions } from '../hooks/useProgramProgress'
import { updateProfile } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Profile() {
  const { user, logOut } = useAuth()
  const { workouts } = useWorkouts()
  const { progress } = useProgramProgress()
  const { completedCount } = useCompletedSessions()
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
    <div className="min-h-screen bg-[#F8F7F4] pb-nav">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4 border-b-[0.5px] border-[#E5E3DD]">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] active:text-[#636158]"
        >
          ← Back
        </button>
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#0F0F0E]">Profile</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#22E8E0] active:opacity-70 disabled:opacity-40"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pt-10 pb-8 px-6">
        <div
          className="w-20 h-20 flex items-center justify-center mb-4"
          style={{
            border: '1px solid #22E8E0',
            borderRadius: 0,
          }}
        >
          <span className="text-[32px] font-extralight text-[#0F0F0E] lowercase">{initial.toLowerCase()}</span>
        </div>
        <h1 className="text-[28px] font-extralight text-[#0F0F0E] lowercase tracking-[0.01em]">
          {displayName.toLowerCase() || email.split('@')[0].toLowerCase()}
        </h1>
        <p className="text-[13px] font-light text-[#B5B2AA] mt-1 tracking-[0.03em]">{email}</p>
      </div>

      {/* Your info */}
      <div className="px-6 border-t-[0.5px] border-[#E5E3DD] pt-6 pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-5">Your Info</p>

        <div className="mb-6">
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#636158] block mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-transparent border-b-[0.5px] border-[#E5E3DD] pb-2.5 text-[16px] font-light text-[#0F0F0E] placeholder-[#B5B2AA] focus:outline-none focus:border-[#22E8E0] transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#636158] block mb-2">
            Email
          </label>
          <p className="text-[15px] font-light text-[#B5B2AA] pb-2.5 border-b-[0.5px] border-[#E5E3DD]">
            {email}
          </p>
        </div>

        {error && <p className="text-[12px] font-light text-[#22E8E0] mt-3">{error}</p>}
      </div>

      {/* Stats */}
      <div className="px-6 border-t-[0.5px] border-[#E5E3DD] pt-6 pb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B5B2AA] mb-5">Stats</p>

        <div className="flex flex-col gap-0">
          {[
            { value: workouts.length.toString(), label: 'workouts logged' },
            { value: completedCount.toString(), label: 'program sessions done' },
            ...(progress ? [{ value: `week ${progress.week}`, label: progress.programName.toLowerCase() }] : []),
          ].map((stat, i, arr) => (
            <div key={i} className={`flex items-baseline gap-4 py-4 ${i < arr.length - 1 ? 'border-b-[0.5px] border-[#E5E3DD]' : ''}`}>
              <span className="text-[28px] font-extralight text-[#0F0F0E] tabular-nums leading-none w-24 flex-shrink-0">{stat.value}</span>
              <span className="text-[13px] font-light text-[#636158] lowercase tracking-[0.01em]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pt-2 pb-8 border-t-[0.5px] border-[#E5E3DD] flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-[18px] text-[11px] font-medium uppercase tracking-[0.2em] text-[#0F0F0E] active:opacity-70 disabled:opacity-40 transition-opacity mt-4"
          style={{ background: '#22E8E0' }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full py-[18px] text-[11px] font-medium uppercase tracking-[0.2em] text-[#B5B2AA] border-[0.5px] border-[#E5E3DD] active:opacity-70 transition-opacity"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
