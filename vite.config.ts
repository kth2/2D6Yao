import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '六爻预测',
        short_name: '六爻',
        description: '传统六爻占卜排盘与解卦 PWA',
        lang: 'zh-CN',
        start_url: '/',
        display: 'standalone',
        background_color: '#16171d',
        theme_color: '#aa3bff',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // 汉字起卦的康熙笔画字库约 1.2MB，只有用到才下载，用过再离线缓存。
        globIgnores: ['**/name-number-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/name-number-.*\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'kangxi-strokes', expiration: { maxEntries: 2 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
})
