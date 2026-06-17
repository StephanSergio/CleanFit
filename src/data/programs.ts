import { BUFF_DUDES } from './buffDudes'
import { PHUL } from './phul'
import { BUILD_MUSCLE } from './buildMuscle'
import type { Program } from './buffDudes'

export const PROGRAMS: Program[] = [BUFF_DUDES, PHUL, BUILD_MUSCLE]

export function getProgram(id?: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id)
}

export type { Program } from './buffDudes'
