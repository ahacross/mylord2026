import type { Router } from 'vue-router'
import { useStoreUser } from '@/stores/user'

export function setupRouterGuard(router: Router) {
  router.beforeEach((to) => {
    // 이미 '/' 페이지이거나 meta.requiresAuth === false 인 경우 권한 체크 없이 자유 진입
    if (to.path === '/' || to.meta?.requiresAuth === false) {
      return true
    }

    // 그 외 권한 체크가 필요한 페이지 (requiresAuth: true 등)
    const storeUser = useStoreUser()
    const hasUser = !!(storeUser.info as any)?.member_id || !!localStorage.getItem('mylordId')

    if (!hasUser) {
      return '/'
    }

    return true
  })
}
