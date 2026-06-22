// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NumField from './NumField'

describe('NumField', () => {
  it('shows the current value', () => {
    render(<NumField value={10} onCommit={() => {}} ariaLabel="w" />)
    expect(screen.getByLabelText('w')).toHaveValue(10)
  })

  it('commits the typed number', async () => {
    const onCommit = vi.fn()
    const user = userEvent.setup()
    render(<NumField value={10} onCommit={onCommit} ariaLabel="w" />)
    const input = screen.getByLabelText('w')
    await user.clear(input)
    await user.type(input, '8')
    expect(onCommit).toHaveBeenLastCalledWith(8)
  })

  it('clamps to the minimum', async () => {
    const onCommit = vi.fn()
    const user = userEvent.setup()
    render(<NumField value={4} onCommit={onCommit} min={1} integer ariaLabel="r" />)
    const input = screen.getByLabelText('r')
    await user.clear(input)
    await user.type(input, '0')
    expect(onCommit).toHaveBeenLastCalledWith(1)
  })

  it('accepts decimals', async () => {
    const onCommit = vi.fn()
    const user = userEvent.setup()
    render(<NumField value={10} onCommit={onCommit} step={2.5} ariaLabel="w" />)
    const input = screen.getByLabelText('w')
    await user.clear(input)
    await user.type(input, '12.5')
    expect(onCommit).toHaveBeenLastCalledWith(12.5)
  })

  it('left empty, it keeps the value and never commits a 0', async () => {
    const onCommit = vi.fn()
    const user = userEvent.setup()
    render(<NumField value={10} onCommit={onCommit} ariaLabel="w" />)
    const input = screen.getByLabelText('w')
    await user.clear(input) // empty while editing
    await user.tab() // blur
    expect(onCommit).not.toHaveBeenCalled()
    expect(input).toHaveValue(10) // reverted to the kept value
  })
})
