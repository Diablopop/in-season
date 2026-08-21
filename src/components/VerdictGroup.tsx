import type { CSSProperties } from 'react'
import type { CatalogEntry } from '../lib/catalog'
import { label } from '../lib/notes'
import type { MonthDay, Verdict } from '../lib/types'
import { FruitCard } from './FruitCard'
import './VerdictGroup.css'

export function VerdictGroup({
  verdict,
  entries,
  md,
}: {
  verdict: Verdict
  entries: CatalogEntry[]
  md: MonthDay
}) {
  return (
    <section
      className="group"
      style={{ '--verdict-color': `var(--color-${verdict})` } as CSSProperties}
    >
      <div className="group__head">
        <h2 className="group__label">{label(verdict)}</h2>
        <div className="group__rule" role="presentation" />
      </div>
      <div className="group__grid">
        {entries.map((e) => (
          <FruitCard key={e.fruit.slug} entry={e} md={md} />
        ))}
      </div>
    </section>
  )
}
