import { catalog } from '../lib/catalog'
import './Credits.css'

interface Group {
  artist: string
  dates?: string
  fruits: string[]
}

/**
 * Grouped by painter rather than by fruit, so eight plates by one hand read as
 * one person's work instead of eight isolated captions.
 */
function byArtist(): Group[] {
  const groups = new Map<string, Group>()

  for (const { fruit } of catalog) {
    const { artist, artistDates } = fruit.credit
    if (!artist) continue
    const existing = groups.get(artist)
    if (existing) existing.fruits.push(fruit.name)
    else groups.set(artist, { artist, dates: artistDates, fruits: [fruit.name] })
  }

  return [...groups.values()]
    .map((g) => ({ ...g, fruits: g.fruits.sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => b.fruits.length - a.fruits.length || a.artist.localeCompare(b.artist))
}

export function Credits() {
  const groups = byArtist()
  const generated = catalog
    .filter((e) => !e.fruit.credit.artist)
    .map((e) => e.fruit.name)
    .sort((a, b) => a.localeCompare(b))

  return (
    <article className="credits">
      <a className="detail__back" href="#/">← All fruit</a>

      <h2 className="credits__title">Art credits</h2>

      <p className="credits__intro">
        When available, illustrations are from the{' '}
        <a
          href="https://www.nal.usda.gov/collections/special-collections/pomological-watercolors"
          target="_blank"
          rel="noopener noreferrer"
        >
          USDA Pomological Watercolor Collection
        </a>
        , painted between 1886 and 1942 to document fruit varieties for the
        Department of Agriculture. They are in the US public domain.
      </p>

      {groups.map((g) => (
        <section key={g.artist} className="credits__artist">
          <h3>
            {g.artist}
            {g.dates && <span className="credits__dates"> {g.dates}</span>}
          </h3>
          <p>{g.fruits.join(', ')}</p>
        </section>
      ))}

      {generated.length > 0 && (
        <section className="credits__artist credits__generated">
          <h3>Generated illustrations</h3>
          <p>
            The collection ends in 1942 and does not cover every fruit sold today.
            These were generated to match the style: {generated.join(', ')}.
          </p>
        </section>
      )}
    </article>
  )
}
