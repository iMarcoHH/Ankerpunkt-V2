import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['anchor-icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Ankerpunkt',
        short_name: 'Ankerpunkt',
        description: 'Dein Finanz-Überblick. Klar. Kurs halten.',
        theme_color: '#0D1B2A',
        background_color: '#0D1B2A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 4, maxAgeSeconds: 365*24*60*60 } }
          },
          {
            urlPattern: /^https:\/\/dbamkjxxlfdcdisnytxh\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-api', expiration: { maxEntries: 50, maxAgeSeconds: 5*60 } }
          }
        ]
      }
    })
  ],
})
