import type { CSSProperties } from 'react'
import { label } from '../lib/notes'
import { resolve } from '../lib/season'
import type { MonthDay, SeasonWindow, Verdict } from '../lib/types'
import './SeasonStrip.css'

const MONTH_INITIALS = ['J','F','M','A','M','J','J','A','S','O','N','D']
const MONTHS = ['January','February','March','April','May','June','July',
  'August','September','October','November','December']

/** Two samples per month — the 8th and the 23rd — matching half-month authoring. */
const SAMPLES: MonthDay[] = Array.from({ length: 24 }, (_, i) => {
  const month = String(Math.floor(i / 2) + 1).padStart(2, '0')
  return `${month}-${i % 2 === 0 ? '08' : '23'}`
})

const FILL: Record<Verdict, string> = {
  peak: 'var(--fill-peak)',
  'in-season': 'var(--fill-in-season)',
  storage: 'var(--fill-storage)',
  imported: 'var(--fill-imported)',
  skip: 'var(--fill-skip)',
}

/** Runs of the same verdict, for the screen-reader summary. */
function summarize(verdicts: Verdict[]): string {
  const runs: { verdict: Verdict; from: number; to: number }[] = []
  verdicts.forEach((v, i) => {
    const last = runs.at(-1)
    if (last && last.verdict === v) last.to = i
    else runs.push({ verdict: v, from: i, to: i })
  })
  return runs
    .map((r) => {
      const from = MONTHS[Math.floor(r.from / 2)]
      const to = MONTHS[Math.floor(r.to / 2)]
      return `${label(r.verdict)} ${from === to ? `in ${from}` : `from ${from} to ${to}`}`
    })
    .join('. ')
}

export function SeasonStrip({
  windows,
  md,
}: {
  windows: SeasonWindow[]
  md: MonthDay
}) {
  const verdicts = SAMPLES.map((s) => resolve(windows, s).verdict)
  const nowIndex = SAMPLES.findIndex((sample) => sameHalf(sample, md))

  return (
    <figure className="strip">
      <div className="strip__cells" role="img" aria-label={summarize(verdicts)}>
        {verdicts.map((v, i) => (
          <div
            key={i}
            className={`strip__cell${i === nowIndex ? ' strip__now' : ''}`}
            style={{ '--cell': FILL[v] } as CSSProperties}
          />
        ))}
      </div>
      <div className="strip__months" aria-hidden="true">
        {MONTH_INITIALS.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
      <figcaption className="strip__caption">The year at a glance. Today is outlined.</figcaption>
    </figure>
  )
}

function sameHalf(sample: MonthDay, md: MonthDay): boolean {
  const [sm, sd] = sample.split('-').map(Number)
  const [mm, mdd] = md.split('-').map(Number)
  return sm === mm && (sd <= 15) === (mdd <= 15)
}
