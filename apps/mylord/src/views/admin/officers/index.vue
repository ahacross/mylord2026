<template>
  <div class="officer-page-container">
    <div class="officer-card-wrapper">
      <!-- 카드 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">🎖️</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">임원 관리</h1>
            <p class="page-subtitle">연도별 찬양대 임원 명단을 조회하고 관리합니다.</p>
          </div>
        </div>

        <div class="header-right">
          <div class="year-picker-wrapper">
            <DatePicker v-model="searchYear" yearPicker model-type="yyyy" :year-range="yearRange" placeholder="임기년도 선택" />
          </div>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 테이블 영역 (TankTable 적용) -->
      <div class="table-container">
        <TankTable :data="data" :columns="columns" :is-search="false" :hide-name="true" @click:cell="onClickCell">
          <template #btn-before>
            <button type="button" class="btn-add-officer" @click="onClickPopup()">
              <span>+ 임원 추가</span>
            </button>
          </template>
        </TankTable>
      </div>
    </div>
  </div>

  <OfficerPopup v-model="isOpenOfficer" :data="rowData" @close="refetch" />
</template>

<script setup lang="ts">
definePage({
  name: 'officers',
  meta: {
    requiresAuth: true,
  },
})

import { TankTable } from '@common/form/tank-table'
import { DatePicker } from '@common/form/date-picker'
import { useQuery } from '@common/api'
import { apiOfficerList } from '@/apis/officer'
import OfficerPopup from '@/views/admin/officers/components/OfficerPopup.vue'

const yearRange = [2000, new Date().getFullYear()] as [number, number]
const searchYear = ref(new Date().getFullYear().toString())

const columns = [
  {
    header: '역할',
    accessorKey: 'role',
    id: 'role',
    align: 'center',
    width: 120,
    cell: ({ row }: any) => h('span', { class: 'officer-link role-tag', onClick: () => onClickPopup(row.original) }, row.original.role),
  },
  {
    header: '이름',
    accessorKey: 'name',
    id: 'name',
    align: 'center',
    width: 120,
    cell: ({ row }: any) => h('span', { class: 'officer-link', onClick: () => onClickPopup(row.original) }, row.original.name),
  },
  {
    header: '임기년도',
    accessorKey: 'year',
    id: 'year',
    align: 'center',
    width: 100,
    formatter: ({ value }: any) => (value ? `${value}년` : ''),
  },
  {
    header: '임기상태',
    accessorKey: 'status',
    id: 'status',
    align: 'center',
    width: 120,
    cell: ({ row }: any) => {
      const isCurrent = row.original.status === 'Y'
      return h('span', { class: ['status-badge', isCurrent ? 'active' : 'ended'] }, isCurrent ? '✓ 임기 중' : '임기 종료')
    },
  },
]

const isOpenOfficer = ref(false)
const rowData = ref<any>()
const onClickPopup = async (row: any = null) => {
  isOpenOfficer.value = true
  rowData.value = row
}

const onClickCell = async ({ columnName, row }: any) => {
  if (['role', 'name'].includes(columnName) && row) {
    await onClickPopup(row)
  }
}

const { refetch, data } = useQuery({
  queryFn: async () => {
    if (!searchYear.value) return []
    return await apiOfficerList(searchYear.value)
  },
})

watch(searchYear, refetch, { immediate: true })
</script>

<style lang="scss" src="@/assets/scss/AdminOfficerPage.scss"></style>
