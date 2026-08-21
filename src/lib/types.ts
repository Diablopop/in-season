/**
 * Data schema for In Season.
 *
 * The split between these two shapes is the core of the data design: content that
 * is true everywhere (how to pick an apple) lives in a Fruit, and content that is
 * true only in one region (when apples are harvested here) lives in a RegionItem.
 * Adding a region therefore duplicates windows, never prose.
 */

/** Five verdicts. See PRD §5.2. */
export type Verdict = 'peak' | 'in-season' | 'storage' | 'imported' | 'skip'

/**
 * A calendar date without a year, as `MM-DD`. Compared by day-of-year, so windows
 * may wrap the year boundary (navel oranges run November to May).
 */
export type MonthDay = string

/** Windows are authored on the 1st or 16th unless a short crop justifies otherwise. */
export interface SeasonWindow {
  verdict: Verdict
  start: MonthDay
  end: MonthDay
  /**
   * Typical source during this window, e.g. "Washington and California". Stated as
   * a typical pattern, never as a certainty about a given shipment. See PRD §5.4.
   */
  origin?: string
  /** Authored override for the card note. Omit to let the note be derived. */
  note?: string
}

export interface Variety {
  slug: string
  name: string
  /**
   * Optional. Where art exists it is shown; where it does not, the variety renders
   * as a text row. Deliberately nullable — see PRD §8.5.
   */
  image?: string | null
  /** One line on what distinguishes this variety. */
  note?: string
}

/** Region-independent content. One file per fruit. */
export interface Fruit {
  slug: string
  name: string
  /** Italic serif in the detail view, per PRD §8.6. */
  botanicalName?: string
  category: 'fruit' | 'vegetable'
  /** How to pick a good one. */
  selection: string
  /** Counter vs refrigerator. */
  storage: string
  ripensAfterPicking: boolean
  /**
   * Whether the card note names current standout varieties. True only where the
   * store labels varieties and the variety is the purchase decision — apples and
   * pears. See PRD §7.1.
   */
  varietyNotes?: boolean
  varieties?: Variety[]
}

/** Region-dependent content. One file per fruit per region. */
export interface RegionItem {
  /** Must match a Fruit slug. */
  slug: string
  windows: SeasonWindow[]
  /** Keyed by variety slug. Varieties absent here inherit no window of their own. */
  varieties?: Record<string, { windows: SeasonWindow[] }>
  /**
   * Citations for the windows above. The build fails on an empty array — no
   * window ships without a source. See PRD §5.4.
   */
  sources: string[]
  /** ISO date the windows were last checked against those sources. */
  lastReviewed: string | null
}

export interface Region {
  slug: string
  name: string
  /** Shown in the About section so the shopper can judge how current the data is. */
  lastReviewed: string | null
}
