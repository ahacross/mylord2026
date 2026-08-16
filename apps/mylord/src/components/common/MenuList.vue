<template>
  <ul class="custom-menu-list">
    <li v-for="menu in activeMenus" :key="menu.title" :class="['menu-item', { active: activeMenu === menu.pathName }]" @click="onClickMove(menu.pathName)">
      <span class="material-icons-outlined menu-icon">{{ menu.icon }}</span>
      <span class="menu-title">{{ menu.title }}</span>
    </li>
  </ul>
</template>

<script setup>
const $storeCommon = useCommonStore()
const { activeMenu } = storeToRefs($storeCommon)

const $storeUser = useStoreUser()
const { auth } = storeToRefs($storeUser)

const defaultMenus = [
  {
    title: '출석현황',
    pathName: 'status',
    icon: 'assessment',
  },
  {
    title: '개인정보 수정',
    pathName: 'edit',
    icon: 'account_circle',
  },
  {
    title: '부른 찬양',
    pathName: 'history',
    icon: 'timeline',
  },
  {
    title: '연습',
    pathName: 'practice',
    icon: 'music_note',
  },
  {
    title: '기타 정보',
    pathName: 'etc',
    icon: 'content_paste',
  },
]

const adminMenus = [
  {
    title: '임원관리',
    pathName: 'officers',
    icon: 'diversity_3',
  },
  {
    title: '대원관리',
    pathName: 'members',
    icon: 'supervisor_account',
  },
  {
    title: '출석관리',
    pathName: 'attendance',
    icon: 'how_to_reg',
  },
  {
    title: '회비관리',
    pathName: 'dues',
    icon: 'savings',
  },
  {
    title: '월별생일',
    pathName: 'birthday',
    icon: 'celebration',
  },
  {
    title: '등록차량',
    pathName: 'car',
    icon: 'minor_crash',
  },
  {
    title: '출석통계',
    pathName: 'stat',
    icon: 'query_stats',
  },
  {
    title: '자리배치',
    pathName: 'seat',
    icon: 'chair_alt',
  },
  {
    title: '회계 보고',
    pathName: 'accounting',
    icon: 'receipt_long',
  },
]

const activeMenus = computed(() => {
  if (auth.value === 'admin') {
    return [...defaultMenus, ...adminMenus]
  }
  return defaultMenus
})

const $route = useRoute()
watch($route, () => {
  $storeCommon.setActiveMenu($route.fullPath.slice(1))
})

const $router = useRouter()
const onClickMove = (name) => {
  $storeCommon.setDrawerOpen(false)
  if ($route.name !== name) {
    $router.push({ name }).catch(() => {})
  }
}
</script>

<style scoped>
.custom-menu-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 12px 20px;
  color: #475569;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 12px;
}

.menu-item:hover {
  background: rgba(16, 185, 129, 0.06);
  color: #059669;
  transform: translateX(4px);
}

.menu-item.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.2);
}

.menu-item.active:hover {
  transform: none;
}

.menu-icon {
  font-size: 1.3rem;
}

.menu-title {
  white-space: nowrap;
}
</style>
