// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastContext'

function Trigger({ message }: { message: string }) {
  const { showToast } = useToast()
  return (
    <button onClick={() => showToast(message, 'error')}>fire</button>
  )
}

describe('ToastContext', () => {
  it('shows a toast on demand and auto-dismisses it', () => {
    vi.useFakeTimers()
    try {
      render(
        <ToastProvider>
          <Trigger message="Couldn't save" />
        </ToastProvider>
      )
      expect(screen.queryByText("Couldn't save")).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('fire'))
      expect(screen.getByText("Couldn't save")).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(4000)
      })
      expect(screen.queryByText("Couldn't save")).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('stacks multiple toasts', () => {
    vi.useFakeTimers()
    try {
      render(
        <ToastProvider>
          <Trigger message="first" />
        </ToastProvider>
      )
      const btn = screen.getByText('fire')
      fireEvent.click(btn)
      fireEvent.click(btn)
      expect(screen.getAllByText('first')).toHaveLength(2)
    } finally {
      vi.useRealTimers()
    }
  })
})
