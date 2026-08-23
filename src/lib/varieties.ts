import { softDate } from './notes'
import { resolve, resolveVariety } from './season'
import type { Fruit, MonthDay, RegionItem, SeasonWindow, Verdict } from './types'

const ordinal = (md: MonthDay) => {
  const [m, d] = md.split('-').map(Number)
  return m * 100 + d
}

const varietyWindows = (item: RegionItem): SeasonWindow[] =>
  Object.values(item.varieties ?? {}).flatMap((v) => v.windows)

/**
 * Every window that contributes to a card's verdict. The season strip draws from
 * this so the chart cannot disagree with the verdict printed above it.
 */
export const entryWindows = (item: RegionItem): SeasonWindow[] => [
  ...item.windows,
  ...varietyWindows(item),
]

/**
 * The verdict a card shows, counting varieties.
 *
 * Apples in late August are only "in season" as a category, but Gala is already
 * at peak — and a good Gala genuinely exists on that shelf. Best-verdict-wins
 * across the fruit and all of its varieties. See PRD §7.1.
 */
export function resolveEntry(
  item: RegionItem,
  md: MonthDay,
): { verdict: Verdict; window: SeasonWindow | null } {
  return resolve(entryWindows(item), md)
}

/**
 * Varieties worth naming on the card right now: those whose own window covers
 * today and which reach the card's verdict. A variety with no current window
 * merely inherits the fruit's verdict, which is not standing out.
 */
export function standoutVarieties(
  fruit: Fruit,
  item: RegionItem,
  md: MonthDay,
  best: Verdict,
  limit = 3,
): string[] {
  if (!fruit.varietyNotes) return []

  return (fruit.varieties ?? [])
    .filter((v) => {
      const windows = item.varieties?.[v.slug]?.windows
      if (!windows) return false
      if (resolve(windows, md).window === null) return false
      return resolveVariety(item.windows, windows, md).verdict === best
    })
    .slice(0, limit)
    .map((v) => v.name)
}

/**
 * The detail view's headline, for fruits whose verdict is lifted by a variety.
 *
 * A verdict lifted by a variety describes that variety, not the fruit. Saying
 * only "through mid-September" silently changes the subject from apples to Gala,
 * and then contradicts a calendar showing peak into November. So the note names
 * whose window it is, and the arc says what happens after it.
 *
 * Both are computed together because they share a date: the arc only makes sense
 * relative to when the named varieties actually finish.
 *
 * Returns nulls when the fruit owns its own window, where the plain note is right.
 */
export function varietyHeadline(
  fruit: Fruit,
  item: RegionItem,
  md: MonthDay,
): { note: string | null; arc: string | null } {
  const none = { note: null, arc: null }
  const { verdict } = resolveEntry(item, md)

  // Only a live season has varieties to talk about. In storage or out of season
  // the fruit speaks for itself.
  if (verdict !== 'peak' && verdict !== 'in-season') return none

  const names = standoutVarieties(fruit, item, md, verdict)
  if (names.length === 0) return none

  // Each named variety has its own window. Use the latest end, or the note
  // understates how long the ones still going will last.
  const ends = (fruit.varieties ?? [])
    .filter((v) => names.includes(v.name))
    .map((v) => resolve(item.varieties?.[v.slug]?.windows ?? [], md).window)
    .filter((w): w is SeasonWindow => w !== null)
    .map((w) => w.end)
  if (ends.length === 0) return none

  const end = ends.reduce((a, b) => (ordinal(a) >= ordinal(b) ? a : b))
  const state = verdict === 'peak' ? 'at peak' : 'in season'
  const note = `${names.join(', ')}, ${state} through ${softDate(end)}`

  const peaks = Object.values(item.varieties ?? {})
    .flatMap((v) => v.windows)
    .filter((w) => w.verdict === 'peak')
  const latest = peaks.length
    ? peaks.reduce((a, b) => (ordinal(a.end) >= ordinal(b.end) ? a : b)).end
    : null

  const arc =
    latest && ordinal(latest) > ordinal(end)
      ? `Later varieties run into ${softDate(latest)}.`
      : null

  return { note, arc }
}
