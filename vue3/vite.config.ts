import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import { unheadVueComposablesImports } from '@unhead/vue'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        unheadVueComposablesImports,
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
          ],
        },
      ],
    }),
    Components({
      dirs: [], // 禁用本地 components 目录组件自动导入
      resolvers: [
        ElementPlusResolver(),
        NaiveUiResolver(),
        (name) => {
          if (name.startsWith('Ri')) {
            return { name, from: '@remixicon/vue' }
          }
        },
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'PocketChat',
        short_name: 'Chat',
        start_url: '/',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        background_color: '#FFFFFF',
        theme_color: '#7899CC',
        screenshots: [
          {
            src: 'Snipaste_2026-01-20_15-58-20.jpg',
            sizes: '900x1440',
            type: 'image/jpeg',
            form_factor: 'wide',
          },
          {
            src: 'Snipaste_2026-01-20_15-59-39.jpg',
            sizes: '900x1440',
            type: 'image/jpeg',
            form_factor: 'wide',
          },
          {
            src: 'Snipaste_2026-01-20_15-58-20.jpg',
            sizes: '900x1440',
            type: 'image/jpeg',
          },
          {
            src: 'Snipaste_2026-01-20_15-59-39.jpg',
            sizes: '900x1440',
            type: 'image/jpeg',
          },
        ],
      },
      workbox: {
        // navigateFallback: null,
        navigateFallbackDenylist: [
          // PocketBase API (File)
          /^\/api\//,
          // PocketBase Admin UI
          /^\/_\//,
        ],
        runtimeCaching: [
          // 1. 图标缓存 /remixicon
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/remixicon'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'remixicon-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 180,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // 2. 文件缓存 /api/files/
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/files/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'files-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 180,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // 3. API 缓存 /api/collections/（只在离线时生效）
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/collections/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 0,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 10,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
