/**
 * Emits the two WebP files the cover screen loads, from the masters in
 * ../asset-handoff.
 *
 * Same arrangement as build-images.mjs: the masters are large and archival so
 * they stay outside the repository, and only the small outputs are committed.
 * This is a local authoring step, not a build step — deploys use the committed
 * WebP as-is.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const MASTERS = resolve(ROOT, '../asset-handoff')
const OUT = join(ROOT, 'public/img/cover')
const QUALITY = 82

const PAPER = join(MASTERS, 'Paper texture 8.png')
const APPLE = join(MASTERS, 'apple-Malus domestica2.png')

if (!existsSync(PAPER) || !existsSync(APPLE)) {
  console.error(
    `\nMissing cover masters in ${MASTERS}.\n` +
      `Expected "Paper texture 8.png" and "apple-Malus domestica2.png".\n` +
      `The emitted WebP files are committed, so this only needs to run when\n` +
      `the artwork changes.\n`,
  )
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })

/*
 * Rotated to portrait, and shipped at its own resolution rather than upscaled
 * here.
 *
 * The master is 1312x874 landscape. Covering a tall phone in that orientation
 * has to scale until the *height* fills, then throws away two thirds of the
 * width — a 3.2x upscale that leaves about a third of the grain. Rotating means
 * only the width has to be covered: 2.1x, and roughly 58% of the grain
 * survives. Measured, not guessed.
 *
 * Upscaling here instead would only make the file bigger; the browser does the
 * same interpolation on the way to the screen either way.
 */
await sharp(PAPER)
  .rotate(90)
  .removeAlpha()
  .webp({ quality: QUALITY })
  .toFile(join(OUT, 'paper.webp'))

/*
 * Trimmed to the fruit itself. The master carries about a third of its frame as
 * transparent margin, and trimming means the CSS size is the size of the apple
 * rather than the size of the padding around it.
 */
await sharp(APPLE)
  .trim({ threshold: 1 })
  .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: QUALITY, alphaQuality: 100 })
  .toFile(join(OUT, 'apple.webp'))

for (const f of ['paper.webp', 'apple.webp']) {
  const path = join(OUT, f)
  const meta = await sharp(path).metadata()
  console.log(
    `${f.padEnd(12)} ${meta.width}x${meta.height}  ` +
      `${(statSync(path).size / 1024).toFixed(0)}KB`,
  )
}
