<template>
  <div class="status-page-container">
    <div class="status-card-wrapper">
      <!-- 카드 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">📊</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">나의 출석 & 회비 현황</h1>
            <p class="page-subtitle">최근 출석률 및 올해 회비 납부 내역을 한눈에 확인해보세요.</p>
          </div>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 차트 대시보드 그리드 -->
      <div class="dashboard-grid">
        <!-- 1. 최근 4주 출석률 -->
        <div class="chart-card">
          <GaugeChart :columns="columns[0]" title="최근 4주간 출석률" />
        </div>

        <!-- 2. 최근 12주 출석률 -->
        <div class="chart-card">
          <GaugeChart :columns="columns[1]" title="최근 12주간 출석률" />
        </div>

        <!-- 3. 올해 출석률 -->
        <div class="chart-card">
          <GaugeChart :columns="columns[2]" title="올해 출석률" />
        </div>

        <!-- 4. 회비 납부 현황 (모던 도넛 링 차트) -->
        <div class="chart-card">
          <DoughnutChart :columns="duesColumns" title="올해 회비 납부 현황" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'status',
  meta: {
    requiresAuth: true,
  },
})

import GaugeChart from '@/components/common/chart/gaugeChart.vue'
import DoughnutChart from '@/components/common/chart/doughnutChart.vue'
import { useQuery } from '@common/api'

const { info } = storeToRefs(useStoreUser())
const member_id = info.value?.member_id

const columns = ref([[], [], []])
const duesColumns = ref([[]])

useQuery({
  queryFn: async () => {
    if (!member_id) return
    const res = await apiGetStatus({ member_id })

    if (res && Array.isArray(res)) {
      columns.value = res.map((item) => {
        if (!item || !item.length) return []
        let { before_rate: before, after_rate: after } = item.at(0)
        before = Number(String(before).replace('%', ''))
        after = Number(String(after).replace('%', ''))
        return [
          [`예배전_${before}`, before],
          [`예배후_${after}`, after],
        ]
      })
    }

    const res2 = await apiGetDues({ member_id, year: new Date().getFullYear() })
    if (res2) {
      const cnt = Number(res2.dues_cnt || 0)
      duesColumns.value = [
        ['납부', cnt],
        ['미납', 12 - cnt],
      ]
    }
  },
  immediate: true,
})
</script>

<style scoped lang="scss" src="@/assets/scss/StatusPage.scss"></style>
