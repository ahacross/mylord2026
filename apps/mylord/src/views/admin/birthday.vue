<template>
  <div class="birthday-page-container">
    <div class="birthday-card-wrapper">
      <!-- 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">🎂</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">월별 생일자 관리</h1>
            <p class="page-subtitle">찬양대 대원들의 월별 생일 정보를 조회합니다.</p>
          </div>
        </div>

        <!-- 필터 그룹 -->
        <div class="filter-group">
          <span class="count-badge"> 🎉 {{ Number(selectedMonth) }}월 생일자: {{ data.length }}명 </span>
          <div class="month-picker">
            <DatePicker v-model="selectedMonth" monthPicker model-type="MM" placeholder="월 선택" :clearable="false" />
          </div>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 테이블 영역 (TankTable 적용) -->
      <div class="table-container">
        <TankTable :data="data" :columns="columns" :is-search="false" name="월별 생일자 목록" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'birthday',
  meta: {
    requiresAuth: true,
  },
})

import { DatePicker } from '@common/form/date-picker'
import { TankTable } from '@common/form/tank-table'
import { useQuery } from '@common/api'

const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')
const selectedMonth = ref(currentMonth)
const data = ref([])

const columns = [
  { header: '이름', id: 'name', align: 'center', width: 140 },
  {
    header: '생일',
    id: 'birthday',
    align: 'center',
    formatter: ({ value }) => {
      if (!value) return ''
      const str = String(value)
      if (str.length === 8) {
        return `${str.slice(0, 4)}년 ${str.slice(4, 6)}월 ${str.slice(6, 8)}일`
      }
      return value
    },
  },
]

const { refetch } = useQuery({
  queryFn: async () => {
    if (selectedMonth.value) {
      const monthStr = String(selectedMonth.value).padStart(2, '0')
      const res = await apiGetBirthday(monthStr)
      data.value = Array.isArray(res) ? res : []
    }
  },
})
watch(selectedMonth, refetch, { immediate: true })
</script>

<style scoped lang="scss" src="assets/scss/AdminBirthdayPage.scss"></style>
