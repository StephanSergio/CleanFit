// Local calendar date helpers. We use the device's local date — never UTC —
// so "today", the date picker, the History calendar and the weekly view all
// agree in every timezone. Format stays YYYY-MM-DD, identical to what's already
// stored, so existing data reads back unchanged.

export function ymd(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

export const todayStr = (): string => ymd()
