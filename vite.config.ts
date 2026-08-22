import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
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
          'What fruit is worth buying in Southern California right now.',
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
