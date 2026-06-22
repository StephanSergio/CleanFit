import { describe, it, expect } from 'vitest'
import { formatWeeks, getProgram } from './programs'

describe('formatWeeks', () => {
  it('renders a single week', () => {
    expect(formatWeeks([4])).toBe('Week 4')
  })

  it('renders contiguous weeks as a compact range (not a list)', () => {
    const s = formatWeeks([1, 2, 3])
    expect(s).not.toContain(',')
    expect(s.startsWith('Weeks 1')).toBe(true)
    expect(s.endsWith('3')).toBe(true)
  })

  it('lists alternating (gappy) weeks in full', () => {
    expect(formatWeeks([1, 3, 5, 7, 9])).toBe('Weeks 1, 3, 5, 7, 9')
    expect(formatWeeks([2, 4, 6, 8, 10])).toBe('Weeks 2, 4, 6, 8, 10')
  })

  it('handles an empty list', () => {
    expect(formatWeeks([])).toBe('')
  })
})

describe('getProgram', () => {
  it('finds known programs by id', () => {
    expect(getProgram('build_muscle')?.name).toBe('10-Week Muscle Build')
    expect(getProgram('phul')?.id).toBe('phul')
    expect(getProgram('buff_dudes')?.id).toBe('buff_dudes')
  })

  it('returns undefined for an unknown id', () => {
    expect(getProgram('does-not-exist')).toBeUndefined()
  })
})
