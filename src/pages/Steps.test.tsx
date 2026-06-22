// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

// Spy we assert on; returns a resolved Promise because the component does
// `logSteps(...).catch(...)`.
const logSteps = vi.fn(() => Promise.resolve())

vi.mock('../contexts/StepsContext', () => ({
  useSteps: () => ({ entries: [], loading: false, logSteps, removeEntry: vi.fn() }),
}))
vi.mock('../contexts/ThemeContext', () => ({ useTheme: () => ({ isDark: false }) }))
vi.mock('../components/ScrollReveal', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}))
// Recharts needs real layout; stub the exports Steps uses so jsdom is happy.
vi.mock('recharts', () => {
  const Stub = ({ children }: { children?: ReactNode }) => children ?? null
  return {
    BarChart: Stub,
    Bar: Stub,
    XAxis: Stub,
    YAxis: Stub,
    CartesianGrid: Stub,
    Tooltip: Stub,
    ResponsiveContainer: Stub,
    Cell: Stub,
    ReferenceLine: Stub,
  }
})

import Steps from './Steps'

beforeEach(() => logSteps.mockClear())

describe('Steps logging flow', () => {
  it('logs the entered steps for a date', async () => {
    const user = userEvent.setup()
    render(<Steps />)

    await user.type(screen.getByPlaceholderText('0'), '8000')
    await user.click(screen.getByRole('button')) // the ✓ submit

    expect(logSteps).toHaveBeenCalledTimes(1)
    const [date, steps] = logSteps.mock.calls[0]
    expect(typeof date).toBe('string')
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(steps).toBe(8000)
  })

  it('does not log when the field is empty (button disabled)', async () => {
    render(<Steps />)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(logSteps).not.toHaveBeenCalled()
  })

  it('shows the kcal estimates', () => {
    render(<Steps />)
    expect(screen.getByText(/kcal burned/i)).toBeInTheDocument()
    expect(screen.getByText(/kcal \/ day/i)).toBeInTheDocument()
  })
})
