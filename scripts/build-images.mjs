/**
 * Emits the WebP files the app loads, from the 1024px masters.
 *
 * Masters live outside the repo (they are ~1.8MB each and archival), so only the
 * small outputs are committed. Any fruit without a master falls back to its
 * placeholder circle, so the grid always renders a full set.
 */
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const MASTERS = resolve(ROOT, '../cropped-images')
const PLACEHOLDERS = join(ROOT, 'scripts/placeholders')
const OUT = join(ROOT, 'public/img/fruits')
const SIZES = [192, 640]
const QUALITY = 82

const slugsFrom = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => /\.(png|jpe?g)$/i.test(f))
        .map((f) => [basename(f).replace(/\.[^.]+$/, ''), join(dir, f)])
    : []

const masters = new Map(slugsFrom(MASTERS))

// A misspelled master silently emits an orphan file and leaves the placeholder
// showing, which is very easy to miss. Fail loudly instead.
const known = new Set(
  readdirSync(join(ROOT, 'src/data/fruits'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', '')),
)
const orphans = [...masters.keys()].filter((slug) => !known.has(slug))
if (orphans.length) {
  console.error(
    `\nNo fruit matches these masters: ${orphans.join(', ')}\n` +
      `Rename them to a slug in src/data/fruits/.\n`,
  )
  process.exit(1)
}
const placeholders = new Map(slugsFrom(PLACEHOLDERS))

// Masters win wherever they exist.
const sources = new Map([...placeholders, ...masters])

for (const size of SIZES) {
  rmSync(join(OUT, String(size)), { recursive: true, force: true })
  mkdirSync(join(OUT, String(size)), { recursive: true })
}

let real = 0
for (const [slug, src] of [...sources].sort()) {
  for (const size of SIZES) {
    await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: QUALITY })
      .toFile(join(OUT, String(size), `${slug}.webp`))
  }
  if (masters.has(slug)) real++
}

console.log(
  `${sources.size} fruits → ${SIZES.length * sources.size} files ` +
    `(${real} from masters, ${sources.size - real} still placeholder)`,
)
