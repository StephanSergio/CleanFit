import { describe, it, expect, vi } from 'vitest'

// PresetsContext imports Firebase at module load; mock it for Node tests.
vi.mock('../lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({}))

import { presetKey, applyPresetWeights } from './PresetsContext'

describe('presetKey', () => {
  it('slugifies an exercise name', () => {
    expect(presetKey('Barbell Bench Press')).toBe('barbell-bench-press')
  })

  it('trims and collapses punctuation/whitespace', () => {
    expect(presetKey('  EZ-Bar Curl! ')).toBe('ez-bar-curl')
  })

  it('falls back to "unknown" for an empty name', () => {
    expect(presetKey('   ')).toBe('unknown')
  })

  it('is stable regardless of case/spacing (same key)', () => {
    expect(presetKey('Lat Pull-Down')).toBe(presetKey('  lat   pull down  '))
  })
})

describe('applyPresetWeights', () => {
  it('uses the fallback weight when there is no preset', () => {
    expect(applyPresetWeights(undefined, 3, 10)).toEqual([10, 10, 10])
  })

  it('repeats the last known weight for extra sets', () => {
    expect(applyPresetWeights({ weights: [20, 25], reps: [] }, 4, 10)).toEqual([
      20, 25, 25, 25,
    ])
  })

  it('falls back when the preset has no weights', () => {
    expect(applyPresetWeights({ weights: [], reps: [] }, 2, 10)).toEqual([10, 10])
  })
})
