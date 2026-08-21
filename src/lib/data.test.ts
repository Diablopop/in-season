import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolve } from './season'
import { entryWindows, resolveEntry, standoutVarieties } from './varieties'
import type { Fruit, RegionItem, Verdict } from './types'

const FRUITS_DIR = 'src/data/fruits'
const REGION_DIR = 'src/data/regions/socal'
const VERDICTS: Verdict[] = ['peak', 'in-season', 'storage', 'imported', 'skip']

const read = <T,>(dir: string, file: string): T =>
  JSON.parse(readFileSync(join(dir, file), 'utf-8')) as T

const fruitFiles = readdirSync(FRUITS_DIR).filter((f) => f.endsWith('.json'))
const fruits = fruitFiles.map((f) => read<Fruit>(FRUITS_DIR, f))
const items = fruitFiles.map((f) => read<RegionItem>(REGION_DIR, f))

/** Real calendar dates only — no 31st of a 30-day month. */
const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const everyDay = (): string[] => {
  const out: string[] = []
  for (let m = 1; m <= 12; m++)
    for (let d = 1; d <= DAYS[m - 1]; d++)
      out.push(`${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  return out
}

describe('catalog', () => {
  it('has a region file for every fruit', () => {
    const missing = fruitFiles.filter(
      (f) => !readdirSync(REGION_DIR).includes(f),
    )
    expect(missing).toEqual([])
  })

  it('covers the fruits the PRD scopes', () => {
    expect(fruits.length).toBe(32)
  })

  it('has matching slugs inside and across both files', () => {
    fruitFiles.forEach((f, i) => {
      expect(fruits[i].slug).toBe(f.replace('.json', ''))
      expect(items[i].slug).toBe(fruits[i].slug)
    })
  })

  it('has artwork at both sizes for every fruit slug', () => {
    const small = readdirSync('public/img/fruits/192')
    const large = readdirSync('public/img/fruits/640')
    fruits.forEach((fr) => {
      expect(small, `${fr.slug} missing 192px art`).toContain(`${fr.slug}.webp`)
      expect(large, `${fr.slug} missing 640px art`).toContain(`${fr.slug}.webp`)
    })
  })
})

describe('provenance', () => {
  it('cites a source and a review date for every fruit', () => {
    items.forEach((it) => {
      expect(it.sources.length, `${it.slug} has no sources`).toBeGreaterThan(0)
      expect(it.lastReviewed, `${it.slug} has no review date`).not.toBeNull()
    })
  })
})

describe('windows', () => {
  it('uses valid verdicts and MM-DD dates', () => {
    items.forEach((it) => {
      it.windows.forEach((win) => {
        expect(VERDICTS).toContain(win.verdict)
        expect(win.start).toMatch(/^\d{2}-\d{2}$/)
        expect(win.end).toMatch(/^\d{2}-\d{2}$/)
      })
    })
  })

  it('never authors a bare "skip" window — uncovered days already mean skip', () => {
    items.forEach((it) => {
      expect(it.windows.map((w) => w.verdict)).not.toContain('skip')
    })
  })

  it('resolves a verdict for every real calendar day', () => {
    const days = everyDay()
    items.forEach((it) => {
      days.forEach((md) => {
        expect(VERDICTS).toContain(resolve(it.windows, md).verdict)
      })
    })
  })

  it('gives every fruit at least one good day in the year', () => {
    const days = everyDay()
    items.forEach((it) => {
      const best = days.map((md) => resolve(it.windows, md).verdict)
      expect(
        best.some((v) => v === 'peak' || v === 'in-season' || v === 'imported'),
        `${it.slug} is never worth buying`,
      ).toBe(true)
    })
  })
})

describe('varieties', () => {
  it('only lists region windows for varieties the fruit declares', () => {
    fruitFiles.forEach((_, i) => {
      const declared = new Set((fruits[i].varieties ?? []).map((v) => v.slug))
      Object.keys(items[i].varieties ?? {}).forEach((slug) => {
        expect(declared, `${fruits[i].slug}/${slug} is not declared`).toContain(slug)
      })
    })
  })

  it('sets varietyNotes only where varieties exist', () => {
    fruits.forEach((fr) => {
      if (fr.varietyNotes) expect(fr.varieties?.length ?? 0).toBeGreaterThan(0)
    })
  })
})

describe('standout varieties', () => {
  const i = fruitFiles.indexOf('apple.json')
  const apple = fruits[i]
  const item = items[i]
  const best = (md: string) => resolveEntry(item, md).verdict

  it('lifts the card to the best variety verdict', () => {
    // Apples as a category are only in-season in late August; Gala is at peak,
    // and a good Gala is genuinely on the shelf.
    expect(resolve(item.windows, '08-20').verdict).toBe('in-season')
    expect(resolveEntry(item, '08-20').verdict).toBe('peak')
  })

  it('names only varieties whose own window covers today', () => {
    expect(standoutVarieties(apple, item, '08-20', best('08-20'))).toEqual(['Gala'])
  })

  it('names the varieties that lead in autumn', () => {
    expect(standoutVarieties(apple, item, '11-10', best('11-10'))).toContain('Pink Lady')
  })

  it('names nobody when every variety is merely inheriting storage', () => {
    // The regression: inheriting the fruit verdict is not standing out.
    expect(standoutVarieties(apple, item, '02-15', best('02-15'))).toEqual([])
  })

  it('stays silent for fruits that do not opt in', () => {
    const j = fruitFiles.indexOf('peach.json')
    expect(standoutVarieties(fruits[j], items[j], '07-01', 'peak')).toEqual([])
  })
})

describe('season strip', () => {
  it('never contradicts the verdict shown above it', () => {
    const days = everyDay()
    fruitFiles.forEach((_, i) => {
      days.forEach((md) => {
        expect(resolve(entryWindows(items[i]), md).verdict).toBe(
          resolveEntry(items[i], md).verdict,
        )
      })
    })
  })
})
