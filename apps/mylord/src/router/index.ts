import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { setupRouterGuard } from './middleware'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from) {
    if (to.path !== from.path) {
      return { top: 0, left: 0 }
    }
  },
})

setupRouterGuard(router)

export default router
