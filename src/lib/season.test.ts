import { describe, expect, it } from 'vitest'
import { covers, resolve, resolveVariety, toMonthDay } from './season'
import type { SeasonWindow } from './types'
import apple from '../data/regions/socal/apple.json'

const wrapping: SeasonWindow = { verdict: 'peak', start: '11-01', end: '05-15' }

describe('covers', () => {
  it('handles a normal window inclusively at both ends', () => {
    const w: SeasonWindow = { verdict: 'peak', start: '09-16', end: '10-31' }
    expect(covers(w, '09-15')).toBe(false)
    expect(covers(w, '09-16')).toBe(true)
    expect(covers(w, '10-31')).toBe(true)
    expect(covers(w, '11-01')).toBe(false)
  })

  it('handles a window that wraps the year boundary', () => {
    expect(covers(wrapping, '12-25')).toBe(true)
    expect(covers(wrapping, '01-01')).toBe(true)
    expect(covers(wrapping, '05-15')).toBe(true)
    expect(covers(wrapping, '05-16')).toBe(false)
    expect(covers(wrapping, '10-31')).toBe(false)
  })

  it('places February 29 inside a window spanning it', () => {
    const w: SeasonWindow = { verdict: 'storage', start: '02-16', end: '03-15' }
    expect(covers(w, '02-29')).toBe(true)
  })
})

describe('resolve', () => {
  it('falls through to skip when nothing covers the date', () => {
    expect(resolve([], '06-01').verdict).toBe('skip')
  })

  it('takes the best verdict when windows overlap', () => {
    const windows: SeasonWindow[] = [
      { verdict: 'imported', start: '01-01', end: '12-31' },
      { verdict: 'peak', start: '09-01', end: '09-30' },
    ]
    expect(resolve(windows, '09-15').verdict).toBe('peak')
    expect(resolve(windows, '03-15').verdict).toBe('imported')
  })
})

describe('socal apple data', () => {
  const at = (md: string) => resolve(apple.windows as SeasonWindow[], md).verdict

  it('resolves the shape of the apple year', () => {
    expect(at('08-20')).toBe('in-season')
    expect(at('10-01')).toBe('peak')
    expect(at('11-15')).toBe('in-season')
    expect(at('01-15')).toBe('storage')
    // Summer apples are storage fruit, not a separate imported window — see sources.
    expect(at('07-01')).toBe('storage')
  })

  it('covers every day of the year with an explicit window', () => {
    const uncovered: string[] = []
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const md = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        if (resolve(apple.windows as SeasonWindow[], md).window === null) uncovered.push(md)
      }
    }
    // 31st of a 30-day month is never reached by a real date, so allow those.
    const real = uncovered.filter((md) => !['02-30', '02-31', '04-31', '06-31', '09-31', '11-31'].includes(md))
    expect(real).toEqual([])
  })
})

describe('toMonthDay', () => {
  it('pads single digits', () => {
    expect(toMonthDay(new Date(2026, 0, 5))).toBe('01-05')
  })
})

describe('variety resolution', () => {
  const fruit = apple.windows as SeasonWindow[]
  const v = (slug: keyof typeof apple.varieties, md: string) =>
    resolveVariety(fruit, apple.varieties[slug].windows as SeasonWindow[], md).verdict

  it('gives a variety its own peak inside its window', () => {
    expect(v('gala', '09-01')).toBe('peak')
    expect(v('pink-lady', '11-15')).toBe('peak')
  })

  it('falls through to the fruit verdict outside the variety window', () => {
    // Gala in January is a storage apple because apples in January are.
    expect(v('gala', '01-15')).toBe('storage')
  })

  it('lifts a variety above the fruit verdict where they disagree', () => {
    // The fruit is only "in-season" in late August; Gala is already at peak.
    expect(resolve(fruit, '08-20').verdict).toBe('in-season')
    expect(v('gala', '08-20')).toBe('peak')
  })

  it('keeps a late variety at peak while the fruit has dropped to in-season', () => {
    expect(resolve(fruit, '11-15').verdict).toBe('in-season')
    expect(v('granny-smith', '11-15')).toBe('peak')
  })
})

describe('sourcing', () => {
  it('has citations and a review date', () => {
    expect(apple.sources.length).toBeGreaterThan(0)
    expect(apple.lastReviewed).not.toBeNull()
  })
})
