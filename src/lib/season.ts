import type { MonthDay, SeasonWindow, Verdict } from './types'

/**
 * Verdict precedence, best first. Used when windows overlap: a fruit whose peak
 * and imported windows both cover today takes the better of the two, because the
 * good fruit genuinely exists on the shelf. See PRD §7.1.
 */
const PRECEDENCE: Verdict[] = ['peak', 'in-season', 'storage', 'imported', 'skip']

/**
 * Dates compare as MM*100+DD integers rather than day-of-year. Equivalent for
 * ordering, and immune to leap years — February 29 is 229 either way, where a
 * day-of-year mapping shifts every window after it by one day in leap years.
 */
function ordinal(md: MonthDay): number {
  const [m, d] = md.split('-').map(Number)
  return m * 100 + d
}

export function toMonthDay(date: Date): MonthDay {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}-${d}`
}

/** Windows may wrap the year boundary, which citrus requires. */
export function covers(window: SeasonWindow, md: MonthDay): boolean {
  const v = ordinal(md)
  const start = ordinal(window.start)
  const end = ordinal(window.end)
  return start <= end ? v >= start && v <= end : v >= start || v <= end
}

/**
 * Resolves the verdict for a date. Days no window covers fall through to `skip`,
 * so authors write only the interesting windows rather than padding the full year.
 */
export function resolve(
  windows: SeasonWindow[],
  md: MonthDay,
): { verdict: Verdict; window: SeasonWindow | null } {
  const matches = windows.filter((w) => covers(w, md))
  if (matches.length === 0) return { verdict: 'skip', window: null }

  const best = matches.reduce((a, b) =>
    PRECEDENCE.indexOf(a.verdict) <= PRECEDENCE.indexOf(b.verdict) ? a : b,
  )
  return { verdict: best.verdict, window: best }
}

/**
 * Resolves a variety by layering its own windows over the parent fruit's.
 *
 * A variety needs only its peak window authored: outside that, it falls through to
 * whatever the fruit as a whole is doing. Gala in January is a storage apple because
 * apples in January are storage apples, and nothing about that needs restating per
 * variety. Best-verdict-wins does the rest.
 */
export function resolveVariety(
  fruitWindows: SeasonWindow[],
  varietyWindows: SeasonWindow[],
  md: MonthDay,
): { verdict: Verdict; window: SeasonWindow | null } {
  return resolve([...fruitWindows, ...varietyWindows], md)
}
