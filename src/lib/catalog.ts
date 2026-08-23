import type { Fruit, RegionItem } from './types'

/** Bundled at build time — there is no backend and no fetch. */
const fruitModules = import.meta.glob<Fruit>('../data/fruits/*.json', {
  eager: true,
  import: 'default',
})
const regionModules = import.meta.glob<RegionItem>(
  '../data/regions/california/*.json',
  { eager: true, import: 'default' },
)

const slugOf = (path: string) => path.split('/').pop()!.replace('.json', '')

export interface CatalogEntry {
  fruit: Fruit
  item: RegionItem
}

export const catalog: CatalogEntry[] = Object.entries(fruitModules)
  .map(([path, fruit]) => {
    const slug = slugOf(path)
    const item = Object.entries(regionModules).find(
      ([p]) => slugOf(p) === slug,
    )?.[1]
    return item ? { fruit, item } : null
  })
  .filter((e): e is CatalogEntry => e !== null)

export const region = regionModules['../data/regions/california/region.json'] as
  | unknown as { name: string; lastReviewed: string | null }
