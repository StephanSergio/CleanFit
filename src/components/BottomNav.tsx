import { NavLink } from 'react-router-dom'
import { House, Layers, Dumbbell, Footprints } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const tabs = [
  { to: '/', icon: House, label: 'Home', end: true },
  { to: '/programs', icon: Layers, label: 'Programs' },
  { to: '/workout', icon: Dumbbell, label: 'Workout', end: true },
  { to: '/steps', icon: Footprints, label: 'Steps' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const initial = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-bg"
      style={{
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '0.5px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-around h-[72px] px-2">
        {tabs.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={!!end}
            className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-transform duration-100"
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center w-10 h-10 ${isActive ? 'text-accent' : 'text-ink-muted'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span
                  className={`text-[9px] font-medium uppercase tracking-[0.1em] ${isActive ? 'text-accent' : 'text-ink-muted'}`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Profile */}
        <NavLink to="/profile" className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-transform duration-100" aria-label="Profile">
          {({ isActive }) => (
            <>
              <div
                className="flex items-center justify-center text-[12px] font-light bg-ink text-bg transition-all duration-150"
                style={{
                  width: 32,
                  height: 32,
                  border: isActive ? '1.5px solid var(--color-accent)' : '0.5px solid transparent',
                }}
              >
                {initial}
              </div>
              <span
                className={`text-[9px] font-medium uppercase tracking-[0.1em] ${isActive ? 'text-accent' : 'text-ink-muted'}`}
              >
                You
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
