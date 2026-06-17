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
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col px-5">
      <div className="flex-1 flex flex-col justify-center py-16">
        <div className="mb-10">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#F4845F] mb-4">FitLog</p>
          <h1 className="text-[40px] font-bold text-[#1C1C1E] tracking-tight leading-none mb-1">
            {mode === 'signin' ? 'Welcome' : 'Get'}
          </h1>
          <h1 className="text-[40px] font-bold text-[#1C1C1E] tracking-tight leading-none">
            {mode === 'signin' ? 'back.' : 'started.'}
          </h1>
          <p className="text-[15px] text-[#8E8E93] mt-3">Track every rep. See every gain.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white border border-[#E5E5EA] rounded-[16px] px-4 py-3.5 text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:border-[#F4845F] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white border border-[#E5E5EA] rounded-[16px] px-4 py-3.5 text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:border-[#F4845F] transition-colors"
          />
          {error && <p className="text-[#FF453A] text-[13px]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F4845F] text-white rounded-[16px] py-3.5 text-[15px] font-semibold mt-1 active:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#E5E5EA]" />
          <span className="text-[12px] text-[#C7C7CC]">or</span>
          <div className="flex-1 h-px bg-[#E5E5EA]" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E5EA] rounded-[16px] py-3.5 text-[15px] font-semibold text-[#1C1C1E] active:opacity-80 transition-opacity"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="pb-10 text-center">
        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          className="text-[14px] text-[#8E8E93]"
        >
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <span className="font-semibold text-[#1C1C1E]">{mode === 'signin' ? 'Create one' : 'Sign in'}</span>
        </button>
      </div>
    </div>
  )
}
