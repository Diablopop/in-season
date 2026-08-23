# In Season — splash screen scope

**Product:** In Season
**Owner:** Andrew Schauer
**Version:** 1.1
**Last updated:** 2026-08-22
**Status:** Active — milestones 1 and 2 shipped, 3 not started
**Intended use:** Human reference and AI guidance

---

## 1. Summary

A brief cream, paper-textured cover screen shown at launch, carrying the watercolor apple and the app name. It dissolves into the white home screen, making the app's book metaphor literal: a cover in different stock, then the plate pages.

This is a deliberate, manufactured delay. There is no load time to mask — the shell and dataset are precached and the app paints immediately. The splash exists for identity and for a moment of drama when the app is opened in a store. That tradeoff is accepted explicitly rather than rationalized as a loading indicator.

---

## 2. Goals and non-goals

### 2.1 Goals

* Give the launch a deliberate, crafted moment consistent with the textbook-plate direction.
* Make the cream-to-white transition the mechanism, so the delay reads as a dissolve rather than a wait.
* Cost approximately nothing to a hurried shopper, via a skip on any interaction.
* Work identically in a mobile browser tab, an installed iOS app, and an installed Android app, from one implementation.

### 2.2 Non-goals

* **Not a loading indicator.** It does not wait on data, fonts, or network. It is time-boxed and unconditional.
* **Carries no date or region.** They were on the cover through milestone 2 and Andrew removed them on 2026-08-22. A screen that disappears cannot be where a shopper checks what day the verdicts are for, so stating them here only invited the misreading that the question had been answered. That job belongs to the masthead — see §8. Dropping them also retired a hardcoded `Southern California` in `index.html` that would have had to be kept in step with `region.json` once the region picker lands.
* **Not `apple-touch-startup-image`.** That path needs 15–20 device-sized images, covers only iOS, and cannot perform a transition. Rejected on cost and capability, not on principle.

---

## 3. Behavior specification

1. Splash markup is static in `index.html`, styled by CSS inlined in `<head>`. It therefore paints on the first frame, before the JavaScript bundle parses.
2. React mounts the app underneath it. The splash is a fixed overlay above the app, so the home screen is fully rendered and ready before the splash clears.
3. The splash holds briefly at full opacity, then cross-fades to reveal the app.
4. Any tap, click, or key press skips immediately with a short fade.
5. Once faded, the node is removed from the DOM.

On a device with a mouse, none of the above happens — see D7. The cover is `display: none` and the script removes it on load, so a desktop user never sees a cover screen at all.

**Failure behavior.** The fade is driven by a CSS animation, not by JavaScript. If the bundle fails to load or throws, the splash still clears itself and sets `pointer-events: none`, so a script error can never trap Andrew behind a cover screen. JavaScript only adds skip-on-interaction and the DOM cleanup.

---

## 4. Decisions — settled 2026-08-22

| # | Decision | Claude's recommendation | Rationale |
|---|---|---|---|
| D1 | Total duration | **650ms** — 500ms hold, 150ms fade, eased out. The fade does no dramatic work; it is only the means of getting from cover to app, so it is short enough to read as a cut. A true hard cut is `--cover-fade: 1ms`. Andrew set the hold after feeling it; the fade was right first time. Slightly over the ~1s flow threshold, accepted knowingly, and worth re-checking once the artwork lands in milestone 2 — imagery makes the same duration feel shorter. | Andrew proposed 1–1.5s. Nielsen's classic threshold puts ~1 second at the edge of uninterrupted flow; past it, people register waiting. Starting the fade early spends similar wall-clock time while feeling shorter. Exposed as one CSS custom property, so it is a one-line change either way. |
| D2 | Skip affordance | **Any tap, click, or key press** | The single most important variable. It drops the cost to near zero when Andrew is in a hurry while keeping the moment when he is not. |
| D3 | Frequency | **Every cold start, no session cap** | Capping produces inconsistent behavior that is harder to reason about than always-on. iOS evicts installed PWAs aggressively, so cold starts will be common — which is an argument for D2, not for capping. |
| D4 | Reduced motion | **Skip the splash entirely** under `prefers-reduced-motion: reduce` | A full-screen cross-fade is exactly what that preference asks to avoid. Required by PRD §8.4. |
| D5 | Cover fonts | **Cover-scoped `@font-face` at `font-display: block`, plus preload.** Pulled forward into milestone 1. Preload alone was not enough — see below. | `font-display: swap` means the title would otherwise render in Georgia and swap mid-splash on a cold browser load. Costs 122KB earlier in the waterfall on first visit only; precached thereafter. |
| D7 | Where it appears | **Phones and touch devices only.** Andrew's call: a cover screen on a desktop reads as old-fashioned, and the drama is for a phone in a store. Keyed to `(hover: hover) and (pointer: fine)` rather than a width breakpoint, because width gets both edges wrong — a desktop browser dragged narrow is still a desktop, and a phone in landscape is still a phone. Costs one media query and no JavaScript: it reuses the `display: none` path reduced motion already established. |
| D6 | Manifest colors | `background_color` → cream; **`theme_color` stays `#ffffff`** | `background_color` backs the Android launch screen, so cream prevents a white flash before the cream splash. `theme_color` tints browser and status bar chrome, which sits against the white app for the whole session — cream there would be a permanent mismatch to fix a 900ms one. |

---

## 5. Assets

### 5.1 Supplied

Both delivered to `asset-handoff/` on 2026-08-22.

| File | Dimensions | Notes |
|---|---|---|
| `Paper texture 8.png` | 1312 × 874, RGBA | Warm cream, subtle fiber, vignette baked in. Center `#F8F3E6`, corners `#EFE0CF`–`#F4E8D8`. Alpha channel present but unused; will be flattened. |
| `apple-Malus domestica2.png` | 1700 × 1700, RGBA | Genuinely cut out — corner alpha is 0, mean alpha 57. Apple occupies roughly the central 75%. |

### 5.2 Specification, for reference and future re-export

**Paper texture**

* **Ideal:** 1600 × 2800px, portrait, PNG, 8-bit RGB, no alpha.
* **The baked vignette stays, and is not corrected.** Andrew's direction on 2026-08-22: the wonkiness of the paper is part of what makes the artwork work, and an evenly-registered vignette would be heavy-handed. Darker at top and bottom but not the sides is fine. Claude adds no CSS vignette and does not attempt to align the falloff to the viewport.
* No text, no fruit, no strong directional features — the image is cropped differently on every screen.

**Known issue with the supplied file.** At 1312 × 874 landscape, filling a modern phone at 3× device pixel ratio (1290 × 2796) needs roughly a 3.2× upscale, and only the center third of the width survives the crop. The failure mode is benign — upscaled paper reads as smoother paper, not as a broken image — but the grain will visibly soften. Rotating to portrait improves it to about 2.1×. A larger portrait re-export would remove the compromise entirely; the current file is usable if that is inconvenient.

**Apple**

* Square, transparent background, subject centered with even margin. The supplied file already meets this.
* 1700 × 1700 is comfortably above what is needed; displayed at roughly 220pt, 3× wants ~660px.

### 5.3 Emitted files

Following the existing convention in `scripts/build-images.mjs` — masters stay outside the repository, WebP outputs are committed at quality 82.

Emitted by `scripts/build-cover.mjs` (`npm run cover`), a local authoring step — the WebP files are committed and deploys use them as-is.

* `public/img/cover/paper.webp` — 874 × 1312, 24KB. Rotated to portrait, alpha flattened.
* `public/img/cover/apple.webp` — 922 × 1024, 118KB. Trimmed to the fruit, alpha preserved.

Actual added precache cost: 144KB, taking the total from 71 entries at 1587KB to 73 at 1732KB. Well inside budget.

**The paper is rotated to portrait in the build step.** Covering a tall screen from a landscape master scales until the *height* fills and then discards two thirds of the width — 3.2×, retaining about 32% of the grain. Portrait only has to cover the width: 2.1×, retaining about 58%. Measured as high-frequency energy after subtracting a blur, against a native reference of 1.047: landscape 0.334, portrait 0.611. It is shipped at its own resolution rather than upscaled at build time, since the browser performs the same interpolation on the way to the screen and a pre-upscaled file would only be larger.

---

## 6. Implementation approach

* Splash markup and its critical CSS are inlined in `index.html`. Rendering it from a React component would flash white before the cream, which is the exact artifact this is meant to avoid.
* The cover's own tokens — cream, timings — are declared in that same inline block rather than in `tokens.css`, because `tokens.css` has not loaded when the cover paints. This is not a second source of truth: the cream and the timings have exactly one consumer, so they live where that consumer can read them. The two values it does share with the interface, `--color-ink` and `--color-ink-soft`, are necessarily repeated as literals and are commented as mirrors.
* The cover carries no dynamic text at all, so it cannot go stale and its script does no rendering — only skip-on-interaction and cleanup.
* The apple and paper are `<img>` and CSS background respectively, both marked decorative.

---

## 7. Accessibility

* The splash carries `aria-hidden="true"`. It is atmosphere, and the app name it shows is repeated in the masthead immediately below it.
* No focus trap. The app beneath is fully rendered and focusable throughout.
* `prefers-reduced-motion: reduce` skips it entirely, per D4.
* Skip is bound to key presses as well as pointer events, so it is not pointer-only.

---

## 8. Related, deliberately out of scope

Date and region are currently absent from every fruit detail page — the masthead that carried them was removed in `cfe86fc`. The splash does not fix this, because a screen that disappears cannot be where a shopper confirms what day the verdicts describe. Restoring a dateline to the detail head is a separate, small change worth doing on its own merits.

---

## 9. Documentation changes required

The PRD currently contradicts this feature in three places. Each should be amended in the same commit that ships it, so the specification does not describe an app that no longer exists.

* **§11 success criteria** — "Cold launch to rendered answer in under one second" is no longer true by design. Reword to separate time-to-interactive from time-to-splash-clear.
* **§3.1 goals** — "opening the app is the entire required interaction" still holds, but should acknowledge the cover.
* **§8.6 design direction** — records a deliberate exception to "pure white page. Not cream, not bone." The exception is coherent as stated there: a cover is different stock from the pages. It must be written down, or the reasoning will read as violated rather than extended.

---

## 10. Testing

* Cold browser load with cache disabled — no white frame before the cream.
* Installed PWA cold launch on iOS, including after the OS has evicted the app from memory.
* Skip on first frame, and skip mid-fade.
* `prefers-reduced-motion: reduce` — splash does not appear.
* JavaScript disabled — splash still clears and the app is usable.
* Lighthouse, confirming the splash has not become a permanent LCP regression.
* Andrew's own check: open it in a store and judge whether the moment earns its 900ms on roughly the tenth launch, not the first.

---

## 11. Milestones

| # | Scope | Testable when |
|---|---|---|
| 1 ✅ | Mechanics — flat cream, live type, no imagery, font preload | Splash appears, holds, fades, skips on tap, clears with JavaScript disabled, absent under reduced motion |
| 2 ✅ | Artwork — paper texture, apple, final typography and spacing | Renders correctly at 375px, 430px, and desktop widths, in browser and installed |
| 3 | Documentation — PRD §3.1, §8.6, §11 amendments | PRD no longer contradicts the shipped app |

**Milestone 2 verified 2026-08-22.** Composition follows the concept art — apple above the wordmark, date and region beneath. The apple is sized `min(52vw, 250px, 36vh)`: the first two set proportion and a ceiling, the third keeps the composition inside a short screen. Without that third term a phone held in landscape needs about 376px of content in a 375px viewport. Confirmed unchanged at 375 × 812 (195px) and correctly constrained at 667 × 375 (135px, everything fits). Note that a landscape phone could not be emulated directly — above 768px wide the tooling reports a mouse, which is the desktop path — so that case is reasoned and arithmetic-checked rather than observed.

**Milestone 1 verified 2026-08-22.** The animation was seeked frame by frame rather than timed against the wall clock: opacity holds at 1.00 through the hold, then eases to 0.00 at the end, and `visibility` flips to hidden at the end. Fonts fetch at 14ms and complete at 16ms, so the serif is available well before the hold expires. Outstanding for Andrew: the installed-PWA cold launch, and reduced motion on a real device.

**Preload alone did not fix the font swap.** Preload fetches the bytes but cannot register the family; that comes from `fonts.css`, which arrives by script in dev and by a blocking link in a build. Either way the cover paints before it exists, so the title rendered in Georgia and switched. The cover now declares its own two families inline — registered on the first frame — at `font-display: block`, which never paints a fallback and instead shows nothing until the font is ready. Preload makes that a few milliseconds against the hold. The interface keeps `font-display: swap`, where a visible fallback beats invisible text. Verified: `Cover Serif` and `Cover Sans` report `loaded` at page load, and the two files are still fetched exactly once each despite being declared under two family names.

**One defect found and fixed during milestone 1.** Skipping cancels the animation, which also cancels the `visibility: hidden` its final keyframe would have applied — leaving the cover at opacity 0 but still hit-testable until the 3-second backstop removed it, where it would silently swallow the next tap. Skip now drops `pointer-events` itself. The cover deliberately remains hit-testable *before* the skip, so the tap that dismisses it cannot also activate a card underneath.

---

## 12. Risks

* **The novelty wears off before the delay does.** The honest test is the tenth launch in a store, not the first. Milestone 1 is deliberately cheap so this can be judged early and reverted cheaply.
* **Grain softness from upscaling the supplied texture** — see §5.2. Cosmetic, not structural.
* **iOS PWA eviction** makes cold starts more frequent than expected, so the splash will be seen more often than a native app's would be. Mitigated by D2, not eliminated.

---

## 13. Revision history

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-22 | Initial scope |
| 1.1 | 2026-08-22 | Decisions settled; milestone 1 shipped and verified; font preload pulled forward from milestone 2; recorded the skip hit-testing defect and its fix |
| 1.2 | 2026-08-22 | Preload alone did not stop the font swap; cover now declares its own families inline at font-display: block |
| 1.3 | 2026-08-22 | D7 added — cover is limited to touch devices and never shown on desktop |
| 1.4 | 2026-08-22 | Hold lengthened to 500ms after Andrew felt it; total 1050ms |
| 1.5 | 2026-08-22 | Milestone 2 shipped — paper, apple, composition, and the short-screen ceiling |
| 1.6 | 2026-08-22 | Date and region removed from the cover; Cover Sans retired with them |
| 1.7 | 2026-08-22 | Fade shortened to 450ms and switched from ease-in to ease-out, which was the actual cause of the apple appearing to ghost |
| 1.8 | 2026-08-22 | Fade cut to 150ms — effectively a cut; artwork is above half opacity for 51ms, down from ~370ms |
