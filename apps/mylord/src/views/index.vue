<template>
  <div class="dashboard-container">
    <!-- 1. 웰컴 배너 섹션 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1 class="welcome-title">
          <img src="@/assets/images/logo.png" alt="로고" class="welcome-logo" /> 안녕하세요, <span class="highlight">{{ info?.name || '대원' }}</span
          >님!
        </h1>
        <p class="welcome-subtitle">오늘도 주님의 은혜 안에서 찬양으로 섬기는 당신을 축복합니다.</p>
      </div>
    </div>

    <!-- 3. 예배 출석 통계 그리드 (실제 차트 컴포넌트 적용) -->
    <div class="charts-section">
      <h2 class="section-title">예배 출석 통계</h2>
      <div class="stat-card chart-container-card">
        <div class="card-body chart-body-wrapper" style="display: flex; justify-content: center; padding: 1.5rem 0">
          <BarChart
            v-if="chartData.columns.length"
            :columns="chartData.columns"
            :groups="chartData.groups"
            :categories="chartData.categories"
            :use-dynamic-color="true"
            :title="chartData.title"
            :width="chartWidth"
          />
        </div>
      </div>
    </div>

    <!-- 4. 퀵 링크 단축키 섹션 (맨 아래로 내림) -->
    <div class="quick-links-area">
      <h2 class="section-title">빠른 메뉴 바로가기</h2>
      <div class="quick-links-grid">
        <div v-for="link in quickLinks" :key="link.text" class="quick-btn" @click="$router.push({ name: link.routeName }).catch(() => {})">
          <span class="quick-icon">{{ link.icon }}</span>
          <span class="quick-text">{{ link.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: '출석률',
  meta: { requiresAuth: true },
})

import BarChart from '@/components/common/chart/barChart.vue'
import { useQuery } from '@common/api'

const storeUser = useStoreUser()
const { info, auth } = storeToRefs(storeUser)
const member_id = info.value?.member_id || Number(localStorage.getItem('mylordId'))

const $router = useRouter()

// 사용자 권한에 따른 동적 포털형 퀵 링크 목록
const quickLinks = computed(() => {
  const baseLinks = [
    { text: '연습실', icon: '🎹', routeName: 'practice' },
    { text: '부른 찬양', icon: '🎵', routeName: 'history' },
    { text: '기타 정보', icon: '📋', routeName: 'etc' },
    { text: '정보 수정', icon: '👤', routeName: 'edit' },
  ]

  if (auth.value === 'admin') {
    return [
      ...baseLinks,
      { text: '임원 관리', icon: '👑', routeName: 'officers' },
      { text: '대원 관리', icon: '👥', routeName: 'members' },
      { text: '출석 관리', icon: '✔️', routeName: 'attendance' },
      { text: '회비 관리', icon: '💰', routeName: 'dues' },
    ]
  }

  return baseLinks
})

// 예배 전/후 통합 그룹 막대 차트 목업 데이터 (추후 API 데이터 연동 시 이 값을 가공해 넣어주시면 차트가 자동 갱신됩니다)
const chartData = ref({
  title: '기간별 예배 출석률 현황',
  columns: [
    ['예배 전', 35, 51, 75], // 4주, 12주, 연간에 매핑되는 3개 데이터
    ['예배 후', 20, 76, 100],
  ],
  categories: ['4주', '12주', '연간'],
  groups: [],
})
const chartWidth = ref(600) // 대시보드 카드 레이아웃에 최적화된 가로 너비

const updateChartWidth = () => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    if (screenWidth < 640) {
      chartWidth.value = Math.max(280, screenWidth - 64)
    } else if (screenWidth < 960) {
      chartWidth.value = Math.max(400, screenWidth - 120)
    } else {
      chartWidth.value = 600
    }
  }
}

const { refetch } = useQuery({
  queryFn: async () => {
    if (!member_id) return
    const res = await apiGetStatus({ member_id })
    if (!res || !Array.isArray(res)) return

    // [데이터 연동 가이드]
    chartData.value.columns = [
      ['예배 전', ...res.map((item) => Number(item.at(0).before_rate.replace('%', '')))],
      ['예배 후', ...res.map((item) => Number(item.at(0).after_rate.replace('%', '')))],
    ]
  },
})

onMounted(() => {
  updateChartWidth()
  window.addEventListener('resize', updateChartWidth)
  refetch()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartWidth)
})
</script>

<style scoped lang="scss" src="@/assets/scss/IndexPage.scss"></style>
