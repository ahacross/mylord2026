import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'
import VueRouter from 'vue-router/vite'
import { VueRouterAutoImports } from 'vue-router/unplugin'

export default defineConfig({
  base: '/mylord2/',
  resolve: {
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
          if (id.includes('node_modules')) {
            // 대형 타사 라이브러리들 청크 분리
            if (id.includes('xlsx')) {
              return 'vendor-xlsx'
            }
            if (id.includes('d3')) {
              return 'vendor-charts'
            }
            if (id.includes('vue-final-modal')) {
              return 'vendor-vfm'
            }
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue-core'
            }
            return 'vendor-libs'
          }
        },
      },
    },
  },
})
