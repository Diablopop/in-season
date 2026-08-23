# In Season — Product requirements document

**Product:** In Season (working title)
**Owner:** Andrew Schauer
**Version:** 1.10
**Last updated:** 2026-08-23
**Status:** Active — milestones 1–3 shipped, 4 and 5 not started
**Intended use:** Human reference and AI guidance

---

## 1. Summary

In Season is a zero-friction Progressive Web App that answers one question for a grocery shopper standing in the produce aisle: **is this a good time to buy this fruit?**

The app opens to a single screen showing what is at peak, what is acceptable, and what is worth skipping today, based on the device's current date and a California harvest calendar. No login, no search, no location prompt, no network required after first load.

---

## 2. Problem and opportunity

Grocery produce sections show no seasonal signal. Strawberries appear in December, apples appear in May, and the shelf gives no indication that one was picked last week and the other has been in cold storage since October. Price and appearance are unreliable proxies for quality.

Existing seasonality resources are either printed PDFs from agricultural extension offices, or apps that require account creation and location permissions before delivering any value. None of them distinguish between *locally harvested now*, *held in storage*, and *imported from the Southern Hemisphere* — the distinction that actually determines whether the fruit will taste good.

**Opportunity:** a single-screen reference that loads instantly, works offline in a store with poor cell signal, and gives an honest verdict rather than a binary in/out label.

---

## 3. Goals and non-goals

### 3.1 Goals

* Deliver the primary answer within one tap — opening the app is the entire required interaction. A brief cover screen precedes it on phones (§7.5); it is skippable, and it asks nothing of the shopper.
* Be honest about data limitations rather than projecting false precision.
* Work fully offline once installed, since grocery stores frequently have poor connectivity.
* Install to a phone home screen and launch like a native app.
* Remain a static site with no backend, no database, and no user accounts.

### 3.2 Non-goals

* **Prices.** The app will never display or estimate prices. Claude has no reliable source, and fabricating them would violate the accuracy rules in CLAUDE.md.
* **Store-specific inventory.** The app describes harvest windows, not what a given Ralphs has on the shelf.
* **Recipes.** Out of scope; a different product.
* **Shopping lists, accounts, sync, notifications, or social features.** All of these require a backend or add friction to the one-tap goal.
* **Nutrition data.** Available everywhere else, not the reason someone opens this app.

---

## 4. Target user

A home cook shopping at a mainstream Southern California grocery store or farmers market. Moderately curious about food, not an expert. Has a phone in hand, possibly one-handed while pushing a cart. Wants a fast verdict, and occasionally wants to understand *why* — for example, which apple variety is actually good right now, or why the blueberries are expensive and bland.

Primary usage context: standing in a produce aisle, distracted, on a phone, possibly with degraded network.

---

## 5. The seasonality model

This is the conceptual core of the product and the area of greatest risk to credibility.

### 5.1 The honesty problem

"In season" conflates three distinct facts:

1. When the fruit is harvested locally.
2. Whether the fruit on the shelf today came from that local harvest, from long-term storage, or from an importing country.
3. Whether the fruit will actually taste good.

A binary in/out label is misleading for exactly the fruits shoppers care most about. An apple sold in Southern California in April is genuinely a California apple, but it was picked the previous September and held in controlled-atmosphere storage for seven months. A December blueberry is real, edible, and flown in from Peru.

### 5.2 The verdict system

Each fruit resolves to exactly one of five verdicts for the current date. This is the single most important design decision in the product: the shopper receives a verdict, not a taxonomy.

| Verdict | Definition | Shopper meaning |
|---|---|---|
| **Peak** | California harvest at its height | Buy now — this is as good as it gets |
| **In season** | California harvest, early or late shoulder of the window | Good, quality varies by lot |
| **From storage** | Harvested in California months ago, sold from controlled-atmosphere or cold storage | Fine, but flavor and texture have faded |
| **Imported** | Not locally harvested; available from Southern Hemisphere or Mexican supply | Edible, usually pricier, quality is a gamble |
| **Skip** | Neither meaningful local harvest nor reliable imported supply | Wait for the season |

The `From storage` verdict is the differentiating feature. No mainstream seasonality guide surfaces it, and it explains a phenomenon shoppers have noticed without being able to name.

### 5.3 Data resolution

Harvest windows are **stored as calendar dates** (month and day, compared by day-of-year) but **authored at half-month boundaries** — the 1st and 16th — as the default convention.

Monthly resolution is not accurate enough for the crops that matter most: Southern California cherries are roughly a three-week event, and a monthly calendar misrepresents them as a two-month crop.

Weekly resolution is rejected as false precision. The cited sources in §5.4 publish at month granularity, occasionally softened with "early" or "late" — half-month is already a mild interpolation on top of them, and there is no source to cite for "cherries peak in week 21." Harvest dates also shift ±1–2 weeks year to year with winter chill hours, spring heat, and rain, so the biological variance exceeds either resolution:

| Resolution | Max verdict-flip error | Underlying source and weather uncertainty |
|---|---|---|
| Monthly | ~15 days | ~10–14 days |
| Half-month | ~7 days | ~10–14 days |
| Weekly | ~3 days | ~10–14 days |

Half-month already sits below the noise floor. Weekly would buy precision that is swamped before it reaches the shopper, while doubling the authoring surface from 24 slots to 52 per fruit, per region.

Storing dates rather than fixed period indices decouples storage precision from authoring precision at effectively no cost. The common case stays a constrained fill-in-the-slots job on half-month boundaries, and the handful of crops that genuinely warrant tighter windows — cherries, apricots, and closely spaced apple varieties in the detail view — can be authored to the day without a schema migration.

**Display language stays soft regardless of stored precision:** "peak through mid-September," never "peak until September 15." Stored resolution is never perceived directly by the shopper; it only determines when a verdict flips. Vague copy over precise data is the honest combination.

### 5.4 Data provenance

Every window carries its citations in the data file, shown to the shopper in the detail view. Across 33 fruits the dataset draws on 30 distinct sources, and their reliability is uneven. Listing them by tier is the honest way to describe what this product actually knows.

**Government and university sources** — the strongest, used for the crops they cover.

* Fresno County harvest calendar (7 fruits) — stone fruit and pears
* UC Davis, "It's Citrus Season" (6 fruits) — citrus
* USDA Economic Research Service — apple production by state
* CDFA seasonal chart, via the California Foundation for Agriculture in the Classroom (8 fruits) — but see the caveat below

**Industry and commodity sources** — reliable on their own crop, and often the only party publishing specific dates.

* Ventura Coastal (6 fruits) — citrus growing seasons
* California Avocado Commission; USApple and the Northwest Horticultural Council on controlled-atmosphere storage; California Grown on winter fruit
* The Packer and Fresh Fruit Portal (4 fruits each) — berry season reporting

**Regional and consumer references** — weaker, used where nothing better publishes dates.

* Seasonal Food Guide (Southern California pages), Visit California, Visit Oak Glen, California Rare Fruit Growers, Specialty Produce, LA Weekly's farmers market column

### Known weaknesses

Stated plainly, because a product whose premise is honesty should not overstate its own rigor.

* **The CDFA chart's dates could not be read.** It encodes months as colored table cells rather than text, so it confirms which crops are covered but not when. **Cantaloupe, grape, and watermelon rest on it alone** and should be re-sourced.
* **Five fruits cite a single source**: cantaloupe, grape, watermelon, guava, and passion fruit.
* **Guava, passion fruit, and mango are the weakest entries**, resting on consumer guides and grower blogs rather than agricultural reporting.
* **Berry import windows are inferred.** The California harvest windows are well sourced; the Mexico and Chile winter windows come from general trade reporting rather than a specific citation.
* **Lime is a judgment call, not a sourced window.** It is modeled as imported from Mexico year-round because that reflects the shelf, not because a harvest calendar says so.
* **Two sources named in earlier drafts did not work out.** UC Agriculture and Natural Resources publishes no month-specific harvest chart that could be cited, and CDPH's "Harvest of the Month" materials were not reachable in a citable form.

Import-origin notes (for example, "typically Chile and Peru in January") are stated as *typical* patterns, never as certainties about a specific shipment.

Every data file carries a `lastReviewed` ISO date, shown in the Sources section of each fruit's detail view alongside its citations. Claude will not invent a harvest window for any item where a cited source cannot be found; such items are omitted from the dataset rather than guessed.

---

## 6. Scope

### 6.1 Coverage

Approximately 30 fruits — the realistic year-round inventory of a Southern California grocery store. Coverage deliberately includes fruits that are currently out of season, because "skip the strawberries in December" is half the product's value.

Indicative list: apple, apricot, avocado, blackberry, blueberry, cantaloupe, cherimoya, cherry, date, fig, grape, grapefruit, guava, kiwi, kumquat, lemon, lime, mandarin, mango, nectarine, orange (navel, Valencia, and blood treated separately, per §7.1), passion fruit, peach, pear, persimmon, plum/pluot, pomegranate, raspberry, strawberry, watermelon.

### 6.2 Vegetables

**Deferred to phase 2**, with the data schema built to accommodate them from day one via a `category` field.

Rationale: Southern California vegetable supply is far less seasonal than fruit. Lettuce, brassicas, and carrots rotate between the Salinas and Yuma growing regions to produce near-year-round local supply, so most vegetable entries would read "in season" for ten or more months and dilute the signal that makes the fruit view useful.

Phase 2 will add only vegetables with genuinely sharp seasons: asparagus, artichoke, sweet corn, tomato, winter squash, snap peas, English peas, fava beans, and chard/hearty greens.

### 6.3 Regions

Southern California is the launch region and the permanent default. A region picker is a committed requirement, delivered in milestone 4.

**Explicit cost note for Andrew:** each additional region is a full authoring and sourcing pass — roughly 30 fruits × 5 verdicts × 24 half-month authoring slots, sourced from that region's own extension service. This is the single largest ongoing content cost in the product. The architecture supports regions from milestone 1; the data does not exist until someone writes it. Planned launch regions for milestone 4: Southern California, Central/Northern California, and Pacific Northwest. Additional regions are added as data becomes available, not on a schedule.

The picker never blocks first use. The app defaults to Southern California, remembers a changed selection in `localStorage`, and never requests geolocation permission.

---

## 7. Functional requirements

### 7.1 Home screen (the product)

* Displays today's date and the active region in a compact header.
* Presents all covered fruits grouped by verdict, with `Peak` first and `Skip` last.
* Each fruit appears as a card: name, illustration or emoji, verdict badge, and a one-line note ("peak through mid-September" or "from Chile right now").
* Legible at arm's length, one-handed, in a brightly lit store.
* Requires zero interaction to deliver its primary value.

**Variety-aware notes.** For the small set of fruits where the store labels varieties on the bin and the variety *is* the purchase decision, the one-line note names the current standouts rather than describing the fruit generically:

* September — *Apples · Peak · Gala and Honeycrisp now*
* November — *Apples · Peak · Fuji and Pink Lady now*
* April — *Apples · From storage · Pink Lady holds up best*

This reuses the existing note slot; it is a data capability, not a new component or a second tier of hierarchy. Notes name at most three varieties so the line stays scannable at arm's length.

**Card artwork is fixed, not seasonal.** A grouped fruit shows the same image year-round rather than swapping to whichever variety currently leads. The variety signal is already carried by the note text, so rotating the artwork would restate it — at the cost of grid stability. Shoppers navigate 30-plus cards by shape and color memory, and artwork that changes between visits breaks the recognition that makes the home screen fast.

**Verdict resolution for grouped fruits.** When a fruit's varieties resolve to different verdicts on the same date, the card takes the **best** verdict among them, and the note names the variety that earns it. Good Galas genuinely exist on that shelf in September; the shopper only needs to know which bin. Taking the worst or an averaged verdict would be actively misleading.

**Which fruits get variety notes.** The test is whether the shopper faces labeled bins and must choose between them — not whether the fruit has many varieties.

| Fruit | Treatment | Reason |
|---|---|---|
| Apple | One card, variety note | Six to ten labeled bins; variety is the decision |
| Pear | One card, variety note | Bartlett, Bosc, and Anjou differ in ripening and storage behavior |
| Grape | One card, no variety note | Red, green, and black have near-identical windows; nobody chooses by Flame vs. Thompson |
| Plum and pluot | One card, no variety note | Labeled, but the real decision is "are pluots good now" |
| Citrus | Separate cards per type, each able to carry varieties | Navels, Valencias, mandarins, and grapefruit are perceived as different fruits. See the seasonal argument below, which is the decisive one. Cultivars within a type are varieties: Cara Cara is a navel mutation and appears as a variety of the navel card |
| All others | One card, no variety note | Variety does not drive the purchase |

**Why citrus types are never merged.** Perception is the intuitive reason and the weaker one. The decisive argument is seasonal: navel runs November to May, Valencia March to November. Since a card takes the best verdict among everything it covers, a merged orange card would resolve to `Peak` or `In season` on every single day of the year — never storage, never imported, never skip. A card that always says "good" carries no information, and the split is the only reason oranges say anything at all.

**Card or variety, for cultivars of one species.** Sweet oranges are all *Citrus × sinensis*, so botany alone cannot decide this. The test is the cultivar group and the bin the shopper is standing at.

* Same group, choosing between adjacent bins → **a variety**. Cara Cara is a mutation of the Washington navel, sits beside plain navels, and the question is which navel to pick.
* Different group, read as a different fruit → **its own card**. Blood oranges are a separate group of sweet oranges with their own flesh, flavour, price, and December-to-April window; a card of their own says `Skip` for seven months, which is real signal rather than the always-good mush a merge would produce.

### 7.2 Detail view

Tapping a fruit opens a detail view containing:

* **Varieties with their own windows** — the apple problem in full. Gala peaks late August, Fuji in October, Pink Lady in November. Each variety carries its own window — often authored more tightly than half-month, since variety windows overlap closely — and resolves to its own verdict independently.
* Varieties without artwork render as text rows carrying the variety name, window, and verdict. Per-variety images are optional throughout (§8.5).
* Varieties are listed in current-verdict order, best first, so the detail view opens on the answer rather than an alphabetical list. This is the expanded form of the home screen's variety note: the note names the top two or three, the detail view shows all of them with the ones to avoid right now clearly marked.
* **How to pick one** — plain-language selection guidance (weight, skin, smell, give under thumb pressure).
* **Where it's from right now** — typical origin for the current date, local or imported.
* **Storage** — counter versus refrigerator, and whether it ripens after picking.
* **Season shape** — a compact 12-month strip showing the full annual arc, so the shopper can see when to come back.

Detail content is deliberately short: roughly 100–150 words per fruit. Depth beyond that is a phase 3 consideration.

### 7.3 Progressive Web App requirements

* Web app manifest with name, icons (192px, 512px, maskable), theme color, and `display: standalone`.
* Service worker precaching the full application shell and dataset, so a cold offline launch renders the complete home screen.
* Installable to the iOS and Android home screen; launches without browser chrome.
* Correct iOS `apple-touch-icon` and status bar meta tags, which the standard manifest does not fully cover.

### 7.4 Date handling

* The current date is read from the device clock. No network call, no time API.
* The date is reduced to a day-of-year value and evaluated against each fruit's windows in the local timezone. Year-wrapping windows (navel oranges and most citrus) are handled by the comparison, not by special-casing the data.
* An edge case to test: a device with a badly wrong clock will show wrong data. This is acceptable and not worth mitigating, but the visible date in the header lets the user notice it.

### 7.5 Cover screen

A cream, paper-textured cover shown at launch on phones, carrying the watercolor apple and the app name, which dissolves into the white home screen. Detailed scope, decisions, and verification are in `SPLASH.md`; this section records what it is and why the specification above tolerates it.

**It is a manufactured delay, not a loading indicator.** Nothing is being fetched: the shell and dataset are precached and the app paints immediately. It exists for identity and for a moment of drama opening the app in a store. Stating that plainly is the point — a product built on not overstating what it knows should not describe a deliberate pause as though it were work being done.

* **1000ms total** — 850ms holding on the artwork, then a 150ms fade. The split matters more than the total: dwell time on the artwork is the whole effect, and a long fade reads as lag rather than atmosphere. Both are single CSS custom properties.
* **Skippable by any tap or key press**, which is what keeps the cost near zero for a shopper in a hurry. The app is fully rendered and interactive underneath the cover from the first frame.
* **Phones and touch devices only.** A cover screen on a desktop reads as old-fashioned. Keyed to the pointer rather than a width breakpoint, because a desktop browser dragged narrow is still a desktop and a phone held in landscape is still a phone.
* **Absent entirely under `prefers-reduced-motion: reduce`**, per §8.4.
* **Cleared by a CSS animation rather than by script**, so a failed bundle cannot strand a shopper behind it.
* **Carries no date or region.** A screen that disappears cannot be where a shopper checks what day a verdict is for; that belongs to the masthead.

**The honest risk is that the novelty wears off before the delay does.** The test is the tenth launch in a store, not the first. It is built as one self-contained block so that removing it is a revert rather than a project.

---

## 8. Technical approach

### 8.1 Stack

Versions verified against the npm registry on 2026-08-21. Newest stable is recommended in each case; nothing here is pinned to an older release.

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Build | Vite | 8.2.2 | Fast, minimal config, first-class static output for Vercel |
| UI | React | 19.2.8 | Andrew's familiarity; component model suits the card grid |
| PWA | vite-plugin-pwa | 1.3.0 | Generates manifest and service worker; avoids hand-written service worker code |
| Styling | CSS custom properties | — | Per CLAUDE.md §2.4 and the design guidelines: tokens in one file, no CSS framework dependency |
| Hosting | Vercel | — | Free tier, GitHub integration, automatic deploys |

No backend, no database, no API keys, no analytics in the MVP.

### 8.2 Data architecture

The dataset is plain JSON, bundled at build time and versioned in Git. Editing seasonality data is editing a text file and pushing to GitHub — no admin interface, no CMS.

Proposed shape:

```
data/
  regions/
    socal.json          # region metadata + per-fruit windows
  fruits/
    apple.json          # region-independent content: how to pick, storage, varieties
  sources.md            # citations, one per claim group
```

Separating region-independent content (how to pick an apple) from region-dependent windows (when apples are harvested here) means adding a region does not duplicate the written content. This is the DRY requirement from CLAUDE.md §2.4 applied to data rather than code.

A window is expressed as a start date, an end date, and a verdict, each date stored as a month/day pair and compared by day-of-year. Windows may wrap the year boundary, which is required for navel oranges and most citrus.

Authoring convention: start and end dates fall on the 1st or 16th of a month unless a specific crop justifies finer precision. A build-time validation rule flags off-boundary dates so that tightening a window is a deliberate, reviewable decision rather than a typo.

### 8.3 Security and privacy

Deliberately minimal, and worth stating plainly:

* No user data is collected, transmitted, or stored anywhere except `localStorage` for the region preference.
* No third-party scripts, no trackers, no fonts loaded from external CDNs.
* No geolocation permission is ever requested.
* No API keys exist in the repository, because there are no APIs.
* The repository can be fully public with no exposure risk.

The main residual risk is reputational rather than technical: publishing inaccurate harvest data. Section 5.4 governs that.

### 8.4 Accessibility

Per the design guidelines: WCAG AA contrast minimums, verdicts distinguished by text label and icon rather than color alone (relevant for red/green color blindness, which the Peak/Skip pairing would otherwise trip), touch targets at least 44×44px, full keyboard navigation, and semantic landmarks.

### 8.5 Artwork and image assets

Artwork is decorative, not informational: every card states its fruit name and verdict in text, so images carry no meaning a screen reader would miss. All fruit images therefore take an empty `alt` attribute. This matters because it keeps the art direction a reversible decision rather than an accessibility dependency.

#### Format and size

| Use | Displayed at | Asset size | Format |
|---|---|---|---|
| Home screen card | ~96px | 192×192 | WebP |
| Detail view hero | ~320px | 640×640 | WebP |
| Authoring master | — | 1024×1024 | PNG, lossless |

* **Square, opaque, one crop serving both sizes.** The source paintings are portrait plates of roughly 3:4 with generous margins. Each is cropped once to a square framing the specimen; that single master serves both the card and the detail hero. A full-plate portrait variant was considered and rejected — it doubles production work, and on a white ground the aged paper edges read as damage rather than as provenance. See §8.6.
* **Backgrounds are not removed.** The paper is part of the artwork; cutting the fruit out of it turns a painting into a sticker. Assets are therefore opaque, which is workable only because the app is light-theme-only (§8.6).
* **Cropping is manual, once.** A square crop of a 3:4 plate discards about a quarter of its height, and plates where a branch or leaves run vertically need a judgment call rather than a centered crop. Roughly 32 decisions, not automatable — the resize and encode steps after that are.
* **WebP, single format, no `<picture>` element.** Universally supported for years; one file per size keeps the path construction DRY. AVIF would compress ~20% better but adds a second export path for a saving that does not matter at this scale.
* **Masters at 1024×1024**, with 192 and 640 emitted by a build step. Authoring one file per fruit and generating the rest is what makes the art pipeline automatable.
* Total precache cost at 32 fruits ≈ 1.5–2MB for photographic art, well within a reasonable service worker budget. Flat or illustrated art lands closer to 200KB. Bundle size is therefore **not** a constraint on the art direction — it should be chosen on merit.

#### Path convention

`img/fruits/{size}/{slug}.{ext}` — the extension is a single constant in code, so swapping formats is a one-line change. Dataset records reference a `slug` only, never a file path.

**Per-variety artwork is optional.** A variety's image field is nullable; where art exists it is shown, and where it does not the variety renders as a text row with its window and verdict (§7.2). This is a deliberate hedge against an inversion in the source material: the collection holds 3,807 apple paintings organized by cultivar, so heirloom varieties are trivially easy to source, while the varieties the app most needs to name all postdate 1942. Requiring per-variety art would therefore concentrate AI-generated images on the most-viewed screen in the app. Nullable fields make variety art elective and incremental rather than a precondition for milestone 3.

#### Source — decided

**The USDA Pomological Watercolor Collection**, supplemented by AI-generated approximations for modern cultivars. Per-fruit entry points, verified links, and confirmed file counts are maintained in `ART_SOURCING.md`, which is kept in the project folder alongside the image masters rather than in this repository.

* 7,497 watercolor paintings of fruit and nut varieties, made 1886–1942 for USDA bulletins. US public domain, marked Public Domain Mark 1.0, downloadable at high resolution.
* **Organized by cultivar** — individual paintings of specific named apple varieties. This is uniquely well matched to the variety-level detail view in §7.2; no other free source offers per-variety imagery.
* Already stylistically consistent — one illustration tradition, similar composition and plate framing — which solves the hardest problem with photo sourcing.
* Zero licensing risk and zero per-image design effort, while giving the app a distinctive identity that emoji cannot.
* **Known gap:** the collection ends in 1942, so it covers heirloom cultivars well but contains nothing for modern ones. Honeycrisp (1991), Fuji (1962), Pink Lady (1973), and Cosmic Crisp (2019) — precisely the apples people buy today — will not be found.

**Supplement policy.** Missing cultivars may be filled with AI-generated images approximating the collection's style. This is a favorable case: the style is distinctive, the subject is a single fruit on plain ground, and the failure mode is cosmetic rather than factual, since artwork is decorative. **Disclosure is mandatory** — every supplemented image is flagged in `data/sources.md` and marked in the detail view. The credibility of this product rests on not inventing things, and silently blending generated images into a historical public domain collection would undercut the one quality it is built on.

**Alternative: USDA ARS Image Gallery** — public domain photographs, ~6,500 images with a fruits and vegetables category. Best serves shopper recognition, since photos show what is actually on the shelf. Weaker on visual consistency: varying lighting, angle, and background across sources makes a grid look accidental, so a uniform processing pass (background removal, consistent crop) would be mandatory. Credit line requested by ARS even though the images are public domain.

**Alternative: AI-generated pixel art** — cheapest to produce, but consistency across 32 generations is genuinely hard to control, image models frequently produce pixel-*styled* art rather than true pixel art (off-grid pixels, anti-aliased edges, drifting palettes), and the failure mode is a grid that looks subtly wrong. Hallucination risk is real but low-stakes here, since art is decorative per above — a slightly wrong-looking apple is cosmetic, not a factual error.

**Alternative: curated photos through a uniform filter pipeline** — viable, and the processing step does solve consistency, but it does not solve sourcing. It is strictly more work than the watercolors unless a specific visual style is the goal.

Whichever source is chosen, its license and credit line are recorded in `data/sources.md` before any asset is committed. No image is downloaded without Andrew's explicit go-ahead, per CLAUDE.md §3.

#### Placeholders

Placeholder assets exist now so milestone 2 is not blocked on art production: flat colored circles, one per fruit, keyed to a representative fruit color so the grid reads as deliberate rather than broken. They live at the production path and sizes, so replacing them changes no code. Placeholders are transparent; final assets are not, per the crop rules above.

They are PNG rather than WebP because no WebP encoder is present on Andrew's machine — `sips` on this macOS build cannot write WebP, and neither ImageMagick, `cwebp`, nor Pillow is installed. The production build step should use `sharp` (0.35.3) directly or via `vite-imagetools` (12.0.0), which handles both resizing and WebP encoding in one pass and requires no system-level installation.

### 8.6 Design direction

**The organizing idea is a modern scientific textbook plate:** a specimen presented on a white page, framed by a rule, captioned in serif. The watercolors are treated as artwork being presented, not as nostalgic decoration applied to an interface. Every decision below follows from that.

#### Ground and palette

* **Pure white page.** Not cream, not bone. Aged paper only reads as *paper* when something genuinely white sits beside it; against a cream interface the same tone reads as dirty. The usual objection to pure white — harshness — does not apply to an app used in a brightly lit grocery store in daylight.
* **One exception: the cover screen is cream** (§7.5). A cover is different stock from the pages, which is the whole reason the book metaphor survives the contradiction — the cream is never on screen beside the plates, it gives way to them. This is a deliberate exception, recorded here so the rule above is not read as broken.
* **Near-black ink, very slightly warm.** Not `#000`.
* **One neutral gray** for rules.
* **Five verdict colors**, and essentially no other color in the interface. Against white with muted artwork surrounding them, saturated verdict badges carry the functional signal without competing for attention. Verdict colors must still satisfy §8.4 — distinguishable by label and icon, not by hue alone.

The severity of this palette is itself the textbook look. Additions should be resisted.

#### Light theme only

There is no dark theme. Opaque cream plates on a dark ground glow like light boxes, and no reasonable dimming treatment fixes it.

This must be declared explicitly rather than left to default: `color-scheme: light`, an explicit background color on `body`, and a matching `theme_color` in the web app manifest. Without all three, iOS and Android apply their own dark treatment or auto-inversion, producing a broken-looking app rather than a light one.

#### Typography

* **Source Serif 4** — fruit names and section headings. Designed for on-screen reading with an academic-press character, and at a card's fruit name it reads as a plate caption.
* **Inter** — verdicts, notes, and all interface text. The highest legibility per pixel among free sans faces at small sizes, which is the binding constraint: this is read at arm's length, under poor lighting, while distracted.
* **Botanical binomials in italic serif** in the detail view (*Malus domestica*). Factual, sourceable, and unmistakably textbook.

**Fonts must be self-hosted and bundled**, not linked from the Google Fonts CDN. A CDN link would violate the no-third-party-request rule in §8.3 and would break the offline requirement in §7.3. Two families at two weights each is roughly 120KB of woff2 in the precache.

#### Rules and strokes

* **A hairline rule frames every image.** This is functional before it is stylistic: cream paper on a white ground has almost no edge contrast and will appear to bleed into the page without a containing stroke.
* **Two or three stroke weights, defined as tokens** and used to signal hierarchy — hairline between rows, heavier beneath section heads — the way rule weight works on a textbook page.
* **Hairline dividers between detail view sections** (varieties, how to pick, origin, storage) in place of cards or filled backgrounds.
* **Verdict groups on the home screen are separated by labeled rules** — `PEAK ────────` — which is plate-like and does real organizational work.
* **Rule between groups, not between every element.** Over-ruling turns the page into a spreadsheet.

**No shadows anywhere. Structure comes from rules and whitespace.** Textbook pages have no elevation. This is a deliberate, documented exception to the elevation and shadow scale in the design guidelines, not an oversight.

#### Consequences elsewhere

The 12-month season strip in §7.2 should be drawn as a ruled figure with hairline month divisions, which follows directly from this direction rather than needing its own treatment.

---

## 9. Milestones

Each milestone is independently testable and independently deployable.

Live at <https://in-season-grocery.vercel.app/>, source at <https://github.com/Diablopop/in-season>.

### Milestone 1 — Data foundation ✅ Complete
Define the JSON schema. Author and cite Southern California windows for all ~30 fruits. Build the date-to-verdict resolution logic with unit tests. No UI.
**Testable when:** a test suite proves that given a date, each fruit resolves to the expected verdict — including year-wrapping citrus windows, half-month boundaries, and the day-precision windows authored for short crops.
**Verified 2026-08-22:** 30 tests pass. All 32 fruits carry sourced windows, citations, and a review date, enforced by a build-time validation test.

### Milestone 2 — Home screen ✅ Complete
The single-screen card grid, verdict grouping, design tokens, responsive layout. Deployed to Vercel.
**Testable when:** Andrew opens the URL on a phone in a store and gets a usable answer.
**Verified 2026-08-22:** deployed to Vercel and installed on Andrew's phone. The in-store accuracy review in §10 is still outstanding.

### Milestone 3 — Detail view and PWA ✅ Complete
Detail views with varieties, selection guidance, origin, storage, and the 12-month strip. Manifest, service worker, icons, offline support.
**Testable when:** the app installs to the iOS home screen and renders fully in airplane mode.
**Verified 2026-08-22:** installed to the home screen and confirmed working in airplane mode. The service worker precaches 71 entries — app shell, both fonts, and all 32 watercolors.

### Milestone 4 — Regions — not started
Region picker UI, `localStorage` persistence, plus authored data for Central/Northern California and Pacific Northwest.
**Testable when:** switching regions changes verdicts correctly and the choice survives an app restart.

### Milestone 5 — Vegetables — not started
Add the sharply seasonal vegetables from §6.2 and a fruit/vegetable filter.

---

## 10. Testing plan

* **Unit tests** on date-to-verdict resolution: every fruit at all 24 half-month boundaries, plus the exact start and end date of every authored window and the days immediately either side of each. Also year-boundary wrapping, leap years (day-of-year shifts after February 29), and timezone edges near midnight.
* **Data validation test** that fails the build if any fruit is missing a citation, has overlapping contradictory windows, or leaves a period unresolved.
* **Manual device testing** on iOS Safari and Android Chrome, including home screen installation and airplane-mode cold launch.
* **Accuracy review**: Andrew spot-checks roughly ten fruits against an actual store visit before each region ships. This is the only test that catches genuinely wrong data.
* **Lighthouse PWA audit** targeting installability and offline capability.

---

## 11. Success criteria

The MVP succeeds if Andrew opens it in a store and it changes a purchase decision. That is the honest bar for a personal-utility app with no growth objective.

Secondary, measurable without any analytics backend:

* Cold launch to a rendered answer in under one second on a mid-range phone, measured from when the cover clears. The app is painted and interactive underneath the cover throughout, so this measures readiness rather than waiting; the cover adds a deliberate 1000ms on phones (§7.5) and can be skipped with a tap.
* Fully functional with the network disabled.
* Installed to Andrew's home screen and used unprompted more than once.

---

## 12. Open questions

1. Should farmers-market-only fruits (cherimoya, loquat, guava, jujube) be marked as such, since they rarely appear in mainstream grocery stores? Marking them may be more useful than omitting them.
2. Art direction: §8.5 recommends the USDA watercolors, but the choice is deliberately deferred — placeholders are in place and the format, sizes, and paths are fixed, so the decision can be made after milestone 2 shows the grid at real density. Hand-drawn pixel art in Aseprite is explicitly **not** the plan; 32 hand-created sprites is more production work than this app justifies.
3. Does the app need an About screen explaining the verdict system, or should the verdicts be self-explanatory? Leaning toward a small, dismissible first-run explanation rather than a separate screen.

**Closed:** whether navel and Valencia oranges share a card — resolved in §7.1, and re-examined on 2026-08-23 when Andrew queried it. The split stands, on a stronger argument than the one originally recorded: their opposite seasons mean a merged card would read `Peak` or `In season` every day of the year. The same review added Cara Cara as a variety of the navel card and set the card-or-variety test for cultivars of one species.

---

## 13. Revision history

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-21 | Initial draft |
| 1.1 | 2026-08-21 | Windows stored as day-of-year dates with a half-month authoring convention; added resolution rationale and weekly-precision rejection (§5.3) |
| 1.2 | 2026-08-21 | Added variety-aware home screen notes, best-verdict resolution rule, and the per-fruit treatment table (§7.1); variety ordering in detail view (§7.2); closed the citrus open question |
| 1.3 | 2026-08-21 | Added artwork and image assets section with format, sizes, path convention, and sourcing assessment (§8.5); generated placeholder assets; ruled out hand-drawn Aseprite art |
| 1.4 | 2026-08-21 | Confirmed the watercolors as the art source with an AI supplement and disclosure policy; corrected §8.5 to opaque single-crop square assets; made per-variety art nullable; fixed card artwork (§7.1); added the textbook-plate design direction (§8.6) — pure white ground, light theme only, Source Serif 4 with Inter, rules instead of shadows |
| 1.5 | 2026-08-22 | Moved into the app repository so the specification is versioned with the code it describes |
| 1.6 | 2026-08-22 | Marked milestones 1–3 complete and verified; status moved from Draft to Active |
| 1.7 | 2026-08-22 | Rewrote §5.4 to list the sources actually used, tiered by reliability, with known weaknesses named |
| 1.8 | 2026-08-23 | Added §7.5 for the cover screen; recorded the cream exception in §8.6, amended the §11 launch criterion it invalidated, and qualified the §3.1 one-tap goal |
| 1.9 | 2026-08-23 | §7.1: recorded the seasonal argument for keeping citrus types separate, and the card-or-variety test for cultivars of one species; Cara Cara added as a navel variety |
| 1.10 | 2026-08-23 | Blood orange added as its own card, the first application of the §7.1 card-or-variety test; coverage now 33 fruits |
