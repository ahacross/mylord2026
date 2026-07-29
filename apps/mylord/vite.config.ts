import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'
import VueRouter from 'vue-router/vite'
import { VueRouterAutoImports } from 'vue-router/unplugin'

export default defineConfig({
  base: '/mylord/',
  resolve: {
    dedupe: ['vue', 'pinia', 'vue-router'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common/api': path.resolve(__dirname, '../../packages/api/src'),
      '@common/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@common/form': path.resolve(__dirname, '../../packages/form/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@common/utils', '@common/form', '@common/api'],
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
  css: {
    lightningcss: {
      errorRecovery: true,
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
          '@common/form/noty': ['noty', 'useNoty'],
          '@common/utils': ['useDate', 'useUtil'],
          '@common/api': ['createApiClient', 'api'],
        },
      ],
      vueTemplate: true,
      dirs: ['./src/composables', './src/stores',  './src/apis'],
      dts: './types/auto-imports.d.ts',
      viteOptimizeDeps: true,
    }),
    vueDevTools(),
    viteCompression(),
  ],
  build: {
    modulePreload: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (!normalizedId.includes('/node_modules/')) return

          const rules = [
            { chunk: 'vendor-xlsx', targets: ['/node_modules/xlsx/'] },
            { chunk: 'vendor-charts', targets: ['/node_modules/d3/', '/node_modules/d3-'] },
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
})
