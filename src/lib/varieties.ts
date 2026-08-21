import { resolve, resolveVariety } from './season'
import type { Fruit, MonthDay, RegionItem, SeasonWindow, Verdict } from './types'

const varietyWindows = (item: RegionItem): SeasonWindow[] =>
  Object.values(item.varieties ?? {}).flatMap((v) => v.windows)

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
  return resolve([...item.windows, ...varietyWindows(item)], md)
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
