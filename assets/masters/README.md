# Masters

Cropped artwork lives **outside this repo**, in `in-season/cropped-images/`, because masters run ~1.8MB each and only the small WebP outputs need committing.

Drop files there named exactly `{slug}.png` (or `.jpg`), then run:

```
npm run images
```

That emits `public/img/fruits/{192,640}/{slug}.webp`. Fruits with no master fall back to the placeholder circles in `scripts/placeholders/`.

* Square crop, at least 1024px on a side. Exact dimensions do not matter.
* Keep the paper. Do not remove the background or color-correct it toward white.
* Do not draw a border. The frame stroke is applied in CSS.

Slugs must match a file in `src/data/fruits/`. See `ART_SOURCING.md`.
