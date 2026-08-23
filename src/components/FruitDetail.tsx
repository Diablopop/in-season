import type { CSSProperties } from 'react'
import type { CatalogEntry } from '../lib/catalog'
import { label, note } from '../lib/notes'
import { resolve, resolveVariety } from '../lib/season'
import type { MonthDay, Verdict } from '../lib/types'
import { entryWindows, resolveEntry, varietyHeadline } from '../lib/varieties'
import { SeasonStrip } from './SeasonStrip'
import './FruitDetail.css'

const RANK: Verdict[] = ['peak', 'in-season', 'storage', 'imported', 'skip']

export function FruitDetail({ entry, md }: { entry: CatalogEntry; md: MonthDay }) {
  const { fruit, item } = entry
  const { verdict, window } = resolveEntry(item, md)
  const headline = varietyHeadline(fruit, item, md)

  /** Best first, so the view opens on the answer rather than an alphabetical list. */
  const varieties = (fruit.varieties ?? [])
    .map((v) => {
      const windows = item.varieties?.[v.slug]?.windows
      const resolved = windows
        ? resolveVariety(item.windows, windows, md).verdict
        : resolve(item.windows, md).verdict
      return { ...v, verdict: resolved, hasWindow: Boolean(windows) }
    })
    .sort((a, b) => RANK.indexOf(a.verdict) - RANK.indexOf(b.verdict))

  return (
    <article style={
        {
          '--verdict-color': `var(--color-${verdict})`,
          '--verdict-fill': `var(--fill-${verdict})`,
        } as CSSProperties
      }>
      <a className="detail__back" href="#/">← All fruit</a>

      <div className="detail__head">
        <div className="detail__plate">
          <img src={`/img/fruits/640/${fruit.slug}.webp`} alt="" width={640} height={640} />
        </div>
        <div>
          <h2 className="detail__name">{fruit.name}</h2>
          {fruit.botanicalName && (
            <p className="detail__botanical">{fruit.botanicalName}</p>
          )}
          <span className="detail__verdict">{label(verdict)}</span>
          <p className="detail__note">
            {headline.note ?? note(verdict, window)}
          </p>
          {headline.arc && <p className="detail__arc">{headline.arc}</p>}
          <SeasonStrip windows={entryWindows(item)} md={md} />
        </div>
      </div>

      <section className="detail__section">
        <h3>How to pick one</h3>
        <p>{fruit.selection}</p>
      </section>

      <section className="detail__section">
        <h3>Storage</h3>
        <p>
          {fruit.storage}
          {fruit.ripensAfterPicking
            ? ' It keeps ripening after picking.'
            : ' It will not ripen further after picking.'}
        </p>
      </section>

      {varieties.length > 0 && (
        <section className="detail__section">
          <h3>Varieties</h3>
          <ul className="varieties">
            {varieties.map((v) => (
              <li
                key={v.slug}
                className="variety"
                style={{ '--verdict-color': `var(--color-${v.verdict})` } as CSSProperties}
              >
                <span className="variety__name">{v.name}</span>
                <span className="variety__verdict">
                  {v.hasWindow ? label(v.verdict) : ''}
                </span>
                {v.note && <p className="variety__note">{v.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="detail__section sources">
        <h3>Sources</h3>
        <p>
          Harvest windows for {fruit.name.toLowerCase()} in {'Southern California'}
          {item.lastReviewed ? `, last checked ${item.lastReviewed}` : ''}.
        </p>
        <ul>
          {item.sources.map((s) => (
            <li key={s}>
              <a href={s} target="_blank" rel="noopener noreferrer">{s}</a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
