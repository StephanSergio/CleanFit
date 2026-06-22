import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

type ToastType = 'info' | 'error' | 'success'
interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  showToast: (message: string, type?: ToastType) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{ bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto w-full max-w-sm bg-surface text-ink text-[13px] font-light px-4 py-3 border-[0.5px] shadow-lg"
            style={{
              borderColor:
                t.type === 'error' ? 'var(--color-accent)' : 'var(--color-border)',
              animation: 'apex-page 0.2s ease-out',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
