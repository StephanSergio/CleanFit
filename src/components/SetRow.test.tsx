// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetRow from './SetRow'
import type { WorkoutSet } from '../types'

const baseSet: WorkoutSet = { reps: 8, weightKg: 20, completed: false }

describe('SetRow', () => {
  it('renders the current reps and weight', () => {
    render(<SetRow setNumber={1} set={baseSet} onChange={() => {}} onToggle={() => {}} />)
    expect(screen.getByLabelText('reps')).toHaveValue(8)
    expect(screen.getByLabelText('weight in kg')).toHaveValue(20)
  })

  it('increments reps', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SetRow setNumber={1} set={baseSet} onChange={onChange} onToggle={() => {}} />)
    await user.click(screen.getByLabelText('Increase reps'))
    expect(onChange).toHaveBeenCalledWith({ reps: 9 })
  })

  it('decrements weight by 2.5', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SetRow setNumber={1} set={baseSet} onChange={onChange} onToggle={() => {}} />)
    await user.click(screen.getByLabelText('Decrease weight'))
    expect(onChange).toHaveBeenCalledWith({ weightKg: 17.5 })
  })

  it('never lets weight go below 0', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SetRow setNumber={1} set={{ ...baseSet, weightKg: 1 }} onChange={onChange} onToggle={() => {}} />)
    await user.click(screen.getByLabelText('Decrease weight'))
    expect(onChange).toHaveBeenCalledWith({ weightKg: 0 })
  })

  it('toggles completion', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<SetRow setNumber={1} set={baseSet} onChange={() => {}} onToggle={onToggle} />)
    await user.click(screen.getByLabelText(/mark set/i))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
