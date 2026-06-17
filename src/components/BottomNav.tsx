import { NavLink } from 'react-router-dom'
import { Layers, Dumbbell, CalendarDays, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const tabs = [
  { to: '/programs', icon: Layers, label: 'Programs' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/history', icon: CalendarDays, label: 'History' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const initial = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#F8F7F4]"
      style={{
        borderRadius: 0,
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '0.5px solid #E5E3DD',
      }}
    >
      <div className="flex items-center justify-around h-[72px] px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/programs'}
            className="flex-1 flex flex-col items-center justify-center gap-1"
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center transition-colors rounded-none"
                  style={{
                    width: 40,
                    height: 40,
                    background: isActive ? '#0F0F0E' : 'transparent',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    color={isActive ? '#FFFFFF' : '#B5B2AA'}
                  />
                </div>
                <span
                  className="text-[9px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: isActive ? '#0F0F0E' : '#B5B2AA' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Profile */}
        <NavLink to="/profile" className="flex-1 flex flex-col items-center justify-center gap-1" aria-label="Profile">
          {({ isActive }) => (
            <>
              <div
                className="flex items-center justify-center text-[12px] font-light text-white transition-all rounded-none"
                style={{
                  width: 32,
                  height: 32,
                  background: '#0F0F0E',
                  border: isActive ? '0.5px solid #22E8E0' : '0.5px solid transparent',
                }}
              >
                {initial}
              </div>
              <span
                className="text-[9px] font-medium uppercase tracking-[0.1em]"
                style={{ color: isActive ? '#0F0F0E' : '#B5B2AA' }}
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
