import { describe, it, expect, vi } from 'vitest'

// These helpers are pure, but they live in a module that also imports Firebase.
// Mock those so importing the module doesn't try to init Firestore in Node.
vi.mock('../lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({}))

import { getNextSession, totalSessions } from './useProgramProgress'

describe('getNextSession — within a week', () => {
  it('advances to the next day of the same week', () => {
    expect(getNextSession('build_muscle', 'plan_a', 1, 1)).toMatchObject({
      phaseId: 'plan_a',
      week: 1,
      dayNum: 2,
    })
  })
})

describe('getNextSession — Build Muscle alternates by absolute week', () => {
  it('Plan A week 1 (last day) → Plan B week 2', () => {
    expect(getNextSession('build_muscle', 'plan_a', 1, 4)).toMatchObject({
      phaseId: 'plan_b',
      week: 2,
      dayNum: 1,
    })
  })

  it('Plan B week 2 (last day) → Plan A week 3', () => {
    expect(getNextSession('build_muscle', 'plan_b', 2, 4)).toMatchObject({
      phaseId: 'plan_a',
      week: 3,
      dayNum: 1,
    })
  })

  it('Plan B week 10 (last day) → finished (optional bonus not auto-entered)', () => {
    expect(getNextSession('build_muscle', 'plan_b', 10, 4)).toBeNull()
  })
})

describe('getNextSession — other programs are unaffected', () => {
  it('Buff Dudes: end of phase 1 (week 3) → phase 2, week 4', () => {
    expect(getNextSession('buff_dudes', 'phase_1', 3, 4)).toMatchObject({
      phaseId: 'phase_2',
      week: 4,
      dayNum: 1,
    })
  })

  it('PHUL ongoing cycle just rolls to the next week in place', () => {
    expect(getNextSession('phul', 'phul_main', 1, 4)).toMatchObject({
      phaseId: 'phul_main',
      week: 2,
      dayNum: 1,
    })
  })
})

describe('totalSessions', () => {
  it('Build Muscle = 40 sessions (5+5 weeks × 4 days; bonus excluded)', () => {
    expect(totalSessions('build_muscle')).toBe(40)
  })

  it('PHUL is open-ended (no fixed total)', () => {
    expect(totalSessions('phul')).toBeNull()
  })

  it('Buff Dudes has a fixed positive total', () => {
    const t = totalSessions('buff_dudes')
    expect(typeof t).toBe('number')
    expect(t as number).toBeGreaterThan(0)
  })
})
