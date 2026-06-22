import { BUFF_DUDES } from './buffDudes'
import { PHUL } from './phul'
import { BUILD_MUSCLE } from './buildMuscle'
import type { Program } from './buffDudes'

export const PROGRAMS: Program[] = [BUFF_DUDES, PHUL, BUILD_MUSCLE]

export function getProgram(id?: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id)
}

// Human-readable week list. Contiguous weeks render as a range ("1–3");
// gappy/alternating weeks are listed in full ("1, 3, 5, 7, 9") so a plan that
// runs on alternating weeks reads clearly instead of a misleading "1–9".
export function formatWeeks(weeks: number[]): string {
  if (weeks.length === 0) return ''
  const contiguous = weeks.every((w, i) => i === 0 || w === weeks[i - 1] + 1)
  if (contiguous) {
    return weeks.length === 1
      ? `Week ${weeks[0]}`
      : `Weeks ${weeks[0]}–${weeks[weeks.length - 1]}`
  }
  return `Weeks ${weeks.join(', ')}`
}

export type { Program } from './buffDudes'
