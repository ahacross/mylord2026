import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import VueRouter from 'vue-router/vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: '/practiceLink/',
  resolve: {
    dedupe: ['vue', 'pinia', 'vue-router'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common/api': path.resolve(__dirname, '../../packages/api/src'),
      '@common/form': path.resolve(__dirname, '../../packages/form/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@common/form', '@common/api'],
  },
  server: {
    port: 5173,
    proxy: {
      '/apis': {
        target: 'https://ahacross.me/apis/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apis/, ''),
      },
    },
  },
  plugins: [
    VueRouter({
      routesFolder: 'src/views',
      extensions: ['.vue'],
      importMode: (filepath) => {
        if (filepath.includes('index.vue')) return 'sync'
        return 'async'
      },
      dts: './types/typed-router.d.ts',
      exclude: ['**/components/**/*.vue', '**/__tests__/**/*', '**/*.spec.ts', '**/*.test.ts'],
    }),
    vue(),
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        'pinia',
        '@vueuse/core',
        'vue-router',
        {
          '@common/form/dialog': ['useDialog'],
          '@common/api': ['createApiClient', 'api'],
        },
      ],
      vueTemplate: true,
      dirs: ['./src/composables', './src/stores'],
      dts: './types/auto-imports.d.ts',
      viteOptimizeDeps: true,
    }),
    vueDevTools(),
    viteCompression(),
  ],
  build: {
    modulePreload: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (!normalizedId.includes('/node_modules/')) return

          const rules = [
            { chunk: 'vendor-xlsx', targets: ['/node_modules/xlsx/'] },
            { chunk: 'vendor-vfm', targets: ['/node_modules/vue-final-modal/'] },
            { chunk: 'vendor-tanstack', targets: ['/node_modules/@tanstack/'] },
            { chunk: 'vendor-datepicker', targets: ['/node_modules/@vuepic/'] },
            {
              chunk: 'vendor-vue-core',
              targets: [
                '/node_modules/vue/',
                '/node_modules/@vue/',
                '/node_modules/pinia/',
                '/node_modules/vue-router/',
              ],
            },
          ]

          const matched = rules.find((r) => r.targets.some((t) => normalizedId.includes(t)))
          return matched ? matched.chunk : 'vendor-libs'
        },
      },
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
})
