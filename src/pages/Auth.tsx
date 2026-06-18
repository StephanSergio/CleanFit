import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') await signIn(email, password)
      else await signUp(email, password)
    } catch (err: any) {
      setError(
        err?.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
        err?.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' :
        err?.code === 'auth/weak-password' ? 'Password must be at least 6 characters.' :
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try { await signInWithGoogle() }
    catch { setError('Google sign-in failed. Please try again.') }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 apex-page">
      {/* Brand label */}
      <p className="pt-14 text-[11px] font-medium uppercase tracking-[0.2em] text-ink">
        FITLOG
      </p>

      <div className="flex-1 flex flex-col justify-center">
        {/* Hero heading */}
        <div className="mb-10">
          <h1 className="text-[44px] font-extralight lowercase tracking-[0.01em] leading-[1.05] text-ink">
            {mode === 'signin' ? 'Welcome' : 'Get'}
          </h1>
          <h1 className="text-[44px] font-extralight lowercase tracking-[0.01em] leading-[1.05] text-ink">
            {mode === 'signin' ? 'back.' : 'started.'}
          </h1>
          <p className="text-[14px] font-extralight text-ink-mid lowercase mt-3">
            track every rep. see every gain.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-b-[0.5px] border-border rounded-none px-0 py-3 text-[15px] font-light text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-transparent border-b-[0.5px] border-border rounded-none px-0 py-3 text-[15px] font-light text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
          />
          {error && (
            <p className="text-[12px] font-light text-ink-mid">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white rounded-none py-[18px] text-[11px] font-medium uppercase tracking-[0.2em] mt-1 disabled:opacity-50 transition-opacity active:opacity-80 active:scale-[0.97] transition-transform duration-100"
          >
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* "or" divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-b-[0.5px] border-border" />
          <span className="text-[11px] text-ink-muted">or</span>
          <div className="flex-1 border-b-[0.5px] border-border" />
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border-[0.5px] border-border rounded-none py-[18px] text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-opacity active:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Toggle link */}
      <div className="pb-10 text-center">
        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          className="text-[13px] font-light text-ink-muted"
        >
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <span className="font-medium text-ink">{mode === 'signin' ? 'Create one' : 'Sign in'}</span>
        </button>
      </div>
    </div>
  )
}
