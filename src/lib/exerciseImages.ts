// Real exercise demonstration photos from the open-source free-exercise-db
// (https://github.com/yuhonas/free-exercise-db) — no API key required.
// We fetch the index once, cache it, and fuzzy-match program exercise names.

const INDEX_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const CACHE_KEY = 'exerciseImageDb_v1'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

export interface ImageEntry {
  name: string
  image: string
}

interface IndexedEntry extends ImageEntry {
  tokens: string[]
  joined: string
}

// Generic words that don't help identify the movement itself.
const STOP = new Set([
  'the', 'a', 'with', 'to', 'and', 'of', 'for', 'machine', 'barbell', 'dumbbell',
  'cable', 'bench', 'seated', 'standing', 'single', 'arm', 'grip', 'close', 'wide',
  'one', 'two', 'alternating', 'alternate', 'weighted', 'bar', 'ez', 'kb', 'db',
])

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

function stem(t: string): string {
  return t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t
}

function tokenize(s: string): string[] {
  return normalize(s).split(' ').map(stem).filter((t) => t && !STOP.has(t))
}

function index(entries: ImageEntry[]): IndexedEntry[] {
  return entries.map((e) => {
    const tokens = tokenize(e.name)
    return { ...e, tokens, joined: tokens.join('') }
  })
}

let memo: IndexedEntry[] | null = null

function readCache(): ImageEntry[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data: ImageEntry[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

export async function loadImageDb(): Promise<IndexedEntry[]> {
  if (memo) return memo

  const cached = readCache()
  if (cached) {
    memo = index(cached)
    return memo
  }

  try {
    const res = await fetch(INDEX_URL)
    if (!res.ok) return []
    const data = await res.json()
    const entries: ImageEntry[] = (data as any[])
      .filter((e) => e.images?.length)
      .map((e) => ({ name: e.name as string, image: IMG_BASE + e.images[0] }))
    writeCache(entries)
    memo = index(entries)
    return memo
  } catch {
    return []
  }
}

// Best-effort match of an exercise name to a demonstration photo.
export function matchImage(name: string, db: IndexedEntry[]): string | null {
  if (!db.length) return null
  // Superset names like "Skull Crushers / Close Grip Press" — match the first.
  const q = tokenize(name.split('/')[0])
  if (!q.length) return null
  const qJoined = q.join('')

  let best: IndexedEntry | null = null
  let bestScore = 0

  for (const e of db) {
    let score = 0
    if (e.joined === qJoined) {
      score = 3
    } else if (
      Math.min(qJoined.length, e.joined.length) >= 5 &&
      (e.joined.includes(qJoined) || qJoined.includes(e.joined))
    ) {
      score = 2
    } else {
      // Require at least two shared distinctive tokens — a single generic word
      // like "press" or "row" matches the wrong movement too easily.
      const overlap = q.filter((t) => e.tokens.includes(t)).length
      if (overlap < 2) continue
      score = overlap / Math.max(q.length, e.tokens.length)
    }
    if (score > bestScore) {
      bestScore = score
      best = e
    }
  }

  return bestScore >= 0.5 ? best!.image : null
}
