import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Preloads the two woff2 files.
 *
 * The cover screen paints its title before the stylesheet has requested a font,
 * so with font-display: swap it renders in Georgia and visibly switches to
 * Source Serif 4 partway through the fade. Preloading starts both fetches at
 * HTML parse instead, which is early enough to beat first paint from the
 * service worker cache.
 *
 * This has to be a plugin rather than two <link> tags because Vite content-
 * hashes the filenames at build time. In dev the files are served from source.
 *
 * crossorigin is required even though the fonts are same-origin: font requests
 * are made in anonymous CORS mode, and a preload that does not match the mode
 * is ignored and the file is fetched twice.
 */
const preloadFonts = (): Plugin => {
  const link = (href: string) => ({
    tag: 'link',
    attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: 'anonymous' },
    injectTo: 'head-prepend' as const,
  })

  return {
    name: 'preload-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (ctx.bundle) {
          return Object.keys(ctx.bundle)
            .filter((f) => f.endsWith('.woff2'))
            .map((f) => link(`/${f}`))
        }
        return [
          link('/src/assets/fonts/source-serif-4-latin-opsz-normal.woff2'),
          link('/src/assets/fonts/inter-latin-wght-normal.woff2'),
        ]
      },
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    preloadFonts(),
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
