<template>
  <div class="stat-page-container">
    <div class="stat-card-wrapper">
      <!-- 카드 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">📈</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">출석 통계 관리</h1>
            <p class="page-subtitle">연도별 찬양대 전체 출석률 및 파트별 출석 통계를 확인합니다.</p>
          </div>
        </div>

        <!-- 필터 바 (년도 선택) -->
        <div class="filter-bar">
          <span class="filter-label">통계 연도</span>
          <div class="year-picker">
            <DatePicker v-model="statYear" yearPicker model-type="yyyy" placeholder="연도 선택" :clearable="false" />
          </div>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 1. 전체 출석률 섹션 -->
      <div class="stat-section">
        <div class="grid-card">
          <TankTable :bodyHeight="60" :columns="gridTot.columns" :data="gridTot.data" :header="header" :isSearch="false">
            <template #name>
              <div class="section-title-box">
                <span class="section-icon">🏆</span>
                <h2 class="section-title">전체 출석률</h2>
              </div>
            </template>
          </TankTable>
        </div>
      </div>

      <!-- 2. 파트 출석률 섹션 -->
      <div class="stat-section">
        <div class="grid-card">
          <TankTable :columns="gridPart.columns" :data="gridPart.data" :header="header" :isSearch="false">
            <template #name>
              <div class="section-title-box">
                <span class="section-icon">🎵</span>
                <h2 class="section-title">파트별 출석률</h2>
              </div>
            </template>
          </TankTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'stat',
  meta: {
    requiresAuth: true,
  },
})

import { DatePicker } from '@common/form/date-picker'
import { TankTable } from '@common/form/tank-table'
import { useQuery } from '@common/api'

const statYear = ref(String(new Date().getFullYear() - 1))

const header = {
  height: 80,
  complexColumns: [
    {
      header: '출석수',
      name: 'attendance',
      childNames: ['before_att', 'after_att'],
    },
    {
      header: '재적수',
      name: 'enroll',
      childNames: ['before_enroll', 'after_enroll'],
    },
    {
      header: '출석률',
      name: 'rate',
      childNames: ['before_rate', 'after_rate'],
    },
  ],
}

const gridTot = reactive({
  columns: [
    { header: '예배전', name: 'before_att', align: 'center' },
    { header: '예배후', name: 'after_att', align: 'center' },
    { header: '예배전', name: 'before_enroll', align: 'center' },
    { header: '예배후', name: 'after_enroll', align: 'center' },
    { header: '예배전', name: 'before_rate', align: 'center' },
    { header: '예배후', name: 'after_rate', align: 'center' },
  ],
  data: [],
})

const gridPart = reactive({
  columns: [
    { header: '파트', name: 'part', align: 'center' },
    { header: '예배전', name: 'before_att', align: 'center' },
    { header: '예배후', name: 'after_att', align: 'center' },
    { header: '예배전', name: 'before_enroll', align: 'center' },
    { header: '예배후', name: 'after_enroll', align: 'center' },
    { header: '예배전', name: 'before_rate', align: 'center' },
    { header: '예배후', name: 'after_rate', align: 'center' },
  ],
  data: [],
})

const { refetch } = useQuery({
  queryFn: async () => {
    const year = statYear.value
    if (year) {
      const res = await Promise.all([apiStatTot({ year }), apiStatPart({ year })])
      gridTot.data = res.at(0) || []
      gridPart.data = res.at(1) || []
    }
  },
})

watch(statYear, refetch, { immediate: true })
</script>

<style scoped lang="scss" src="assets/scss/AdminStatPage.scss"></style>
