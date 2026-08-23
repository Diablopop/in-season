import type { CatalogEntry } from '../lib/catalog'
import { note } from '../lib/notes'
import { resolveEntry, standoutVarieties } from '../lib/varieties'
import type { MonthDay } from '../lib/types'
import './FruitCard.css'

export function FruitCard({ entry, md }: { entry: CatalogEntry; md: MonthDay }) {
  const { verdict, window } = resolveEntry(entry.item, md)
  const standouts = standoutVarieties(entry.fruit, entry.item, md, verdict)

  const detail = standouts.length
    ? `${standouts.join(', ')} now`
    : note(verdict, window)

  return (
    <a className="card" href={`#/${entry.fruit.slug}`}>
      <div className="card__plate">
        {/*
          Decorative: the name and verdict are already in text.

          Deliberately not lazy. Every card image is precached by the service
          worker, so there is no bandwidth to defer — the whole grid is ~150KB
          already on disk. Lazy loading only postpones decode, which shows as a
          flash of empty frames each time React remounts the grid on navigation.
        */}
        <img
          src={`/img/fruits/192/${entry.fruit.slug}.webp`}
          alt=""
          width={192}
          height={192}
        />
      </div>
      <h2 className="card__name">{entry.fruit.name}</h2>
      <p className="card__note">{detail}</p>
    </a>
  )
}
