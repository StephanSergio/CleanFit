// ============================================================
// Optional AI generation for seasonal meals (Claude).
// ------------------------------------------------------------
// Works two ways, controlled by env:
//   • VITE_CLAUDE_PROXY_URL  — recommended; key stays server-side. Posts
//     { mode: 'meals', season } to the shared Firebase Function (the same
//     proxy Mercato uses, extended with a "meals" mode).
//   • VITE_ANTHROPIC_API_KEY — simple; direct browser call (key is visible
//     in the bundle, so only use a tightly-limited key).
// If neither is set, the page falls back to the built-in curated list.
// ============================================================

import type { Meal, MealType, Season } from '../data/meals'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL
const MODEL = 'claude-sonnet-4-6'

export const isMealAiEnabled = Boolean(PROXY_URL || API_KEY)

const SYSTEM_PROMPT = `You are a nutritionist. Suggest healthy, lower-calorie meals that use produce in season for the given season.
Return ONLY JSON (no prose) in this exact shape:
{
  "breakfast": [ { "name": "…", "kcal": 280, "description": "one short sentence", "tags": ["veg"] } ],
  "lunch":     [ … ],
  "dinner":    [ … ],
  "snack":     [ … ]
}
Give 3 items per meal type. kcal is a realistic per-serving estimate. tags are from: "veg", "vegan", "high-protein". Keep descriptions to one short sentence.`

interface AnthropicTextBlock { type: string; text?: string }
interface AnthropicResponse { content?: AnthropicTextBlock[]; error?: { message?: string } }

type MealSet = Record<MealType, Meal[]>
const MEAL_KEYS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function coerce(raw: unknown): MealSet {
  const obj = (raw ?? {}) as Record<string, unknown>
  const out = {} as MealSet
  for (const k of MEAL_KEYS) {
    const list = Array.isArray(obj[k]) ? (obj[k] as Record<string, unknown>[]) : []
    out[k] = list
      .filter((m) => m && typeof m.name === 'string')
      .map((m) => ({
        name: String(m.name),
        kcal: Math.max(0, Math.round(Number(m.kcal) || 0)),
        description: typeof m.description === 'string' ? m.description : '',
        tags: Array.isArray(m.tags) ? (m.tags as unknown[]).map(String) : undefined,
      }))
  }
  return out
}

function extractJson(text: string): MealSet {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) throw new Error('No JSON in AI response.')
  return coerce(JSON.parse(text.slice(start, end + 1)))
}

export async function generateMeals(season: Season): Promise<MealSet> {
  if (!isMealAiEnabled) throw new Error('AI is off (set a proxy URL or API key).')

  const res = PROXY_URL
    ? await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'meals', season }),
      })
    : await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY as string,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Season: ${season}. Suggest seasonal meals.` }],
        }),
      })

  if (!res.ok) {
    let detail = ''
    try { detail = ((await res.json()) as AnthropicResponse)?.error?.message || '' } catch { /* ignore */ }
    throw new Error(`AI request failed (${res.status}). ${detail}`.trim())
  }

  const data = (await res.json()) as AnthropicResponse
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n')
  return extractJson(text)
}
