import { describe, it, expect } from 'vitest'
import { ymd } from './dates'

describe('ymd', () => {
  it('formats a date as local YYYY-MM-DD', () => {
    // Constructed with local args, read with local getters — timezone-independent.
    expect(ymd(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(ymd(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('zero-pads month and day', () => {
    expect(ymd(new Date(2026, 8, 9))).toBe('2026-09-09')
  })
})
