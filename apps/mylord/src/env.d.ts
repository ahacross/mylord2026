/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { RouteRecordRaw } from 'vue-router'
declare global {
  const definePage: (route: Partial<RouteRecordRaw> & { meta?: any }) => void
}
