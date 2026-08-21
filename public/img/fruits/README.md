# Fruit artwork

**Status:** placeholders — flat colored circles, generated 2026-08-21. Not final art.

## Convention

* One image per fruit, named by the fruit's `slug` from the dataset.
* Two emitted sizes: `192/` for home screen cards, `640/` for detail view heroes.
* Square aspect ratio, subject centered, transparent background.
* Placeholders are PNG. Production art is WebP — see PRD §8.5.

The app builds the path as `img/fruits/{size}/{slug}.{ext}`, where `ext` is a single constant, so the PNG-to-WebP switch is a one-line change.

## Replacing the placeholders

Drop a master image at 1024×1024 into `assets/masters/{slug}.png` and run the resize script. Do not hand-edit files in `192/` or `640/` — they are build output.

## Attribution

Any sourced artwork must have its license and credit line recorded in `data/sources.md` before it is committed. See PRD §8.5.
