import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import VueRouter from 'vue-router/vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: '/seat/',
  resolve: {
    dedupe: ['vue', 'pinia', 'vue-router'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
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
        'vue-router',
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

  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
})
