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
        background_color: '#7899CC',
        theme_color: '#7899CC',
        screenshots: [
          {
            src: 'Snipaste_2026-01-18_17-30-48.jpg',
            sizes: '1920x1080',
            type: 'image/jpeg',
            form_factor: 'wide',
          },
          {
            src: 'Snipaste_2026-01-19_20-39-40.jpg',
            sizes: '900x1440',
            type: 'image/jpeg',
            form_factor: 'wide',
          },
          {
            src: 'Snipaste_2026-01-19_20-41-08.jpg',
            sizes: '537x1165',
            type: 'image/jpeg',
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
