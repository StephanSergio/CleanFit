import { NavLink } from 'react-router-dom'
import { Layers, Dumbbell, CalendarDays, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const tabs = [
  { to: '/program', icon: Layers, label: 'Program' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/history', icon: CalendarDays, label: 'History' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const initial = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF]"
      style={{
        borderRadius: '24px 24px 0 0',
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -1px 0 #E5E5EA, 0 -8px 24px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-around h-[72px] px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/program'}
            className="flex-1 flex flex-col items-center justify-center gap-1"
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center transition-colors"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: isActive ? '#F4845F' : 'transparent',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={2}
                    color={isActive ? '#FFFFFF' : '#8E8E93'}
                  />
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? '#1C1C1E' : '#8E8E93' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Profile / Home */}
        <NavLink to="/" end className="flex-1 flex flex-col items-center justify-center gap-1" aria-label="Profile">
          {({ isActive }) => (
            <>
              <div
                className="flex items-center justify-center rounded-full text-[14px] font-bold text-white transition-all"
                style={{
                  width: 36,
                  height: 36,
                  background: '#F4845F',
                  border: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                }}
              >
                {initial}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
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
