import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// GitHub Pages 把站点挂在 /<repo>/ 下，由部署工作流传入；本地开发仍是根路径。
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'mark.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '六爻预测',
        short_name: '六爻',
        description: '传统六爻占卜排盘与解卦 PWA',
        lang: 'zh-CN',
        // 相对路径，这样挂在 /2D6Yao/ 子目录下也能正确安装。
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#f4ecda',
        theme_color: '#b08d3f',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // 大字库（康熙笔画约 1.2MB、卦例库约 1.8MB）不进预缓存，用到才下载，用过再离线缓存。
        globIgnores: ['**/name-number-*.js', '**/cases-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/name-number-.*\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'kangxi-strokes', expiration: { maxEntries: 2 } },
          },
          {
            urlPattern: /\/assets\/cases-.*\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'liuyao-cases', expiration: { maxEntries: 2 } },
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
