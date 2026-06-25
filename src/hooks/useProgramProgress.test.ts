import { describe, it, expect, vi } from 'vitest'

// These helpers are pure, but they live in a module that also imports Firebase.
// Mock those so importing the module doesn't try to init Firestore in Node.
vi.mock('../lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({}))

import {
  getNextSession,
  totalSessions,
  orderedSessions,
  nextPending,
  sessionKey,
} from './useProgramProgress'

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

describe('orderedSessions', () => {
  it('lists Build Muscle chronologically (40 sessions, A then B by week)', () => {
    const o = orderedSessions('build_muscle')
    expect(o).toHaveLength(40)
    expect(o[0]).toMatchObject({ phaseId: 'plan_a', week: 1, dayNum: 1 })
    // After Plan A week 1's four days, week 2 belongs to Plan B.
    expect(o[4]).toMatchObject({ phaseId: 'plan_b', week: 2, dayNum: 1 })
  })

  it('is empty for ongoing programs (PHUL)', () => {
    expect(orderedSessions('phul')).toEqual([])
  })
})

describe('nextPending (skip / catch-up)', () => {
  const notDone = () => false
  const noSkips = () => 0

  it('is the first session when nothing is done or skipped', () => {
    expect(nextPending('build_muscle', notDone, noSkips)).toMatchObject({
      phaseId: 'plan_a', week: 1, dayNum: 1,
    })
  })

  it('a once-skipped day still comes back as next', () => {
    const skippedOnce = (p: string, w: number, d: number) =>
      p === 'plan_a' && w === 1 && d === 1 ? 1 : 0
    expect(nextPending('build_muscle', notDone, skippedOnce)).toMatchObject({
      phaseId: 'plan_a', week: 1, dayNum: 1,
    })
  })

  it('a twice-skipped day is bypassed for good', () => {
    const skippedTwice = (p: string, w: number, d: number) =>
      p === 'plan_a' && w === 1 && d === 1 ? 2 : 0
    expect(nextPending('build_muscle', notDone, skippedTwice)).toMatchObject({
      phaseId: 'plan_a', week: 1, dayNum: 2,
    })
  })

  it('excludeKey skips a specific session (e.g. the one just left)', () => {
    const key = sessionKey('build_muscle', 'plan_a', 1, 1)
    expect(nextPending('build_muscle', notDone, noSkips, key)).toMatchObject({
      phaseId: 'plan_a', week: 1, dayNum: 2,
    })
  })

  it('skips completed days', () => {
    const week1Done = (_p: string, w: number) => w === 1
    expect(nextPending('build_muscle', week1Done, noSkips)).toMatchObject({
      phaseId: 'plan_b', week: 2, dayNum: 1,
    })
  })

  it('returns null for ongoing programs', () => {
    expect(nextPending('phul', notDone, noSkips)).toBeNull()
  })
})
