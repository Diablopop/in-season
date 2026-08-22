import './App.css'
import { FruitDetail } from './components/FruitDetail'
import { VerdictGroup } from './components/VerdictGroup'
import { catalog, region } from './lib/catalog'
import { useRoute } from './lib/router'
import { toMonthDay } from './lib/season'
import { resolveEntry } from './lib/varieties'
import type { Verdict } from './lib/types'

/** Peak first, skip last — the order a shopper wants to read. */
const ORDER: Verdict[] = ['peak', 'in-season', 'storage', 'imported', 'skip']

const LONG_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
})

export function App() {
  const today = new Date()
  const md = toMonthDay(today)
  const route = useRoute()

  const selected = route ? catalog.find((e) => e.fruit.slug === route) : undefined

  const grouped = ORDER.map((verdict) => ({
    verdict,
    entries: catalog
      .filter((e) => resolveEntry(e.item, md).verdict === verdict)
      .sort((a, b) => a.fruit.name.localeCompare(b.fruit.name)),
  })).filter((g) => g.entries.length > 0)

  return (
    <main className="app">
      <header className="masthead">
        <h1 className="masthead__title">In Season</h1>
        <p className="masthead__meta">
          {LONG_DATE.format(today)} · {region.name}
        </p>
      </header>

      {selected ? (
        <FruitDetail entry={selected} md={md} />
      ) : (
        grouped.map((g) => (
          <VerdictGroup
            key={g.verdict}
            verdict={g.verdict}
            entries={g.entries}
            md={md}
          />
        ))
      )}

      <p className="colophon">
        Harvest windows are drawn from California agricultural calendars and
        describe when fruit is picked — not what a particular store has on the
        shelf. Artwork from the USDA Pomological Watercolor Collection, public
        domain.
      </p>
    </main>
  )
}
