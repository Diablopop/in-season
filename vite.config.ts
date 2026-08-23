import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Gives the cover screen its fonts at first paint.
 *
 * The cover paints from static markup in index.html, before the stylesheet that
 * declares @font-face exists — injected by script in dev, a blocking link in a
 * build. Until that family is registered the title renders in Georgia and then
 * visibly switches, which is the worst place in the app to show a swap.
 *
 * So the cover gets its own two families, declared inline and therefore
 * registered on the first frame, with font-display: block — the fallback is
 * never painted, the text simply appears once the font is ready. Preload makes
 * that a few milliseconds against a 350ms hold. The interface keeps its own
 * font-display: swap, where a fallback is better than invisible text.
 *
 * Both live here rather than in index.html because Vite content-hashes the
 * filenames at build time, so the URLs are not knowable until then.
 *
 * crossorigin is required even though the fonts are same-origin: font requests
 * are made in anonymous CORS mode, and a preload that does not match the mode
 * is discarded and the file fetched twice.
 */
const coverFonts = (): Plugin => {
  const DEV = {
    serif: '/src/assets/fonts/source-serif-4-latin-opsz-normal.woff2',
    sans: '/src/assets/fonts/inter-latin-wght-normal.woff2',
  }

  const face = (family: string, href: string, weights: string) =>
    `@font-face{font-family:'${family}';src:url('${href}') format('woff2-variations');` +
    `font-weight:${weights};font-style:normal;font-display:block}`

  return {
    name: 'cover-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        let { serif, sans } = DEV
        if (ctx.bundle) {
          const woff2 = Object.keys(ctx.bundle).filter((f) => f.endsWith('.woff2'))
          const find = (needle: string) => {
            const hit = woff2.find((f) => f.includes(needle))
            // A silent miss would ship the cover with no font at all, and
            // font-display: block would render it as blank cream.
            if (!hit) throw new Error(`cover-fonts: no built woff2 matching "${needle}"`)
            return `/${hit}`
          }
          serif = find('source-serif')
          sans = find('inter')
        }

        const preload = (href: string) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: 'anonymous' },
          injectTo: 'head-prepend' as const,
        })

        return [
          preload(serif),
          preload(sans),
          {
            tag: 'style',
            children:
              face('Cover Serif', serif, '200 900') + face('Cover Sans', sans, '100 900'),
            injectTo: 'head-prepend' as const,
          },
        ]
      },
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    coverFonts(),
    VitePWA({
      registerType: 'autoUpdate',
      // Manifest icons are precached by default. The OS fetches them at install
      // time and the running app never requests them, so caching ~880KB of PNG
      // buys nothing on a phone with poor signal.
      includeManifestIcons: false,
      // Dev has no service worker: a stale cache during development is a
      // confusing failure mode, and offline is a production concern.
      devOptions: { enabled: false },
      workbox: {
        // Everything the app needs, precached at install. The whole dataset is
        // inside the JS bundle, so offline means the artwork and fonts.
        globPatterns: ['**/*.{js,css,html,woff2,webp}'],
        // Install icons are fetched by the OS at install time, never by the
        // running app, so precaching them buys nothing and costs ~880KB.
        globIgnores: ['**/icon-*.png', '**/apple-touch-icon.png', '**/og.png'],
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'In Season',
        short_name: 'In Season',
        description:
          'Get instant answers while you shop on which Southern California fruits are at their peak and which to skip.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    // Bind all interfaces rather than IPv6 loopback alone: browsers resolve
    // "localhost" to 127.0.0.1 first, and this also exposes the LAN address so
    // the app can be tested on a phone, which is the device it is built for.
    host: true,
  },
})
