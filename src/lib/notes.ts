import type { SeasonWindow, Verdict } from './types'

/**
 * Card notes are derived from the window by default, with an authored `note`
 * field as an override. Authoring every note by hand would mean ~128 strings for
 * one region alone, and they would drift out of sync with the windows.
 */

const VERDICT_LABEL: Record<Verdict, string> = {
  peak: 'Peak',
  'in-season': 'In season',
  storage: 'From storage',
  imported: 'Imported',
  skip: 'Skip',
}

export const label = (v: Verdict) => VERDICT_LABEL[v]

const MONTHS = ['January','February','March','April','May','June','July',
  'August','September','October','November','December']

/**
 * Deliberately vague: "mid-September", never "September 15". Stored precision is
 * finer than the underlying sources justify, so the copy must not imply it.
 */
export function softDate(md: string): string {
  const [m, d] = md.split('-').map(Number)
  const month = MONTHS[m - 1]
  if (d <= 10) return `early ${month}`
  if (d <= 20) return `mid-${month}`
  return `late ${month}`
}

export function note(verdict: Verdict, window: SeasonWindow | null): string {
  if (window?.note) return window.note
  if (!window) return 'wait for the season'

  switch (verdict) {
    case 'peak':
    case 'in-season':
      return `through ${softDate(window.end)}`
    case 'storage':
      return window.origin ?? 'held since harvest'
    case 'imported':
      return window.origin ? `from ${window.origin}` : 'imported'
    case 'skip':
      return 'wait for the season'
  }
}
