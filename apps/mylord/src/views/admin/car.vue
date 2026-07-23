<template>
  <div class="car-page-container">
    <div class="car-card-wrapper">
      <!-- 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">🚗</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">등록 차량 관리</h1>
            <p class="page-subtitle">망원 한강공원 망원1주차장 등록 차량 목록입니다.</p>
          </div>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 테이블 영역 (TankTable 적용) -->
      <div class="table-container">
        <TankTable :data="filteredData" :columns="columns" :is-search="true" :is-excel="true" name="등록 차량 목록" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePage({
  name: 'car',
  meta: {
    requiresAuth: true,
  },
})

import { TankTable } from '@common/form/tank-table'
import { useQuery } from '@common/api'

const columns = [
  { header: '이름', id: 'name', align: 'center', width: 140 },
  { header: '차량번호', id: 'car', align: 'center' },
]

const { data } = useQuery({ queryFn: apiCar, immediate: true })
const filteredData = computed(() => data.value?.filter((i: any) => i.car) || [])
</script>

<style scoped lang="scss" src="@/assets/scss/AdminCarPage.scss"></style>
