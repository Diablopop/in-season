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
    <article className="card">
      <div className="card__plate">
        {/* Decorative: the name and verdict are already in text. */}
        <img
          src={`/img/fruits/192/${entry.fruit.slug}.webp`}
          alt=""
          width={192}
          height={192}
          loading="lazy"
        />
      </div>
      <h2 className="card__name">{entry.fruit.name}</h2>
      <p className="card__note">{detail}</p>
    </article>
  )
}
