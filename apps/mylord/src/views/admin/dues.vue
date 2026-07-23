<template>
  <div class="dues-page-container">
    <div class="dues-card-wrapper">
      <!-- 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">💳</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">회비 관리</h1>
            <p class="page-subtitle">파트별 찬양대원들의 연간 회비 납부 개월 수를 확인 및 수정합니다.</p>
          </div>
        </div>

        <!-- 필터 그룹 (연도 선택) -->
        <div class="filter-group">
          <span class="filter-label">회비 연도</span>
          <div class="year-picker">
            <DatePicker v-model="selectedYear" picker-type="year" model-type="yyyy" placeholder="연도 선택" :clearable="false" />
          </div>
        </div>
      </div>

      <!-- 파트 세그먼트 탭 -->
      <div class="part-tab-bar">
        <button
          v-for="{ text, part } in partsShort.slice(1)"
          :key="part"
          type="button"
          class="part-tab-btn"
          :class="{ active: tab === part }"
          @click="tab = part"
        >
          <span>{{ text }}</span>
        </button>
      </div>

      <div class="card-divider"></div>

      <!-- 테이블 영역 (TankTable 적용) -->
      <div class="table-container">
        <TankTable :data="data" :columns="columns" :is-search="true" :is-excel="true" name="회비 납부 목록" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'dues',
  meta: {
    requiresAuth: true,
  },
})

import { DatePicker } from '@common/form/date-picker'
import { TankTable } from '@common/form/tank-table'
import { useQuery } from '@common/api'
import { partsShort } from '@/constants/constants'

const selectedYear = ref(String(new Date().getFullYear()))
const tab = ref('s')
const data = ref([])

const changeDues = async (row, delta) => {
  const currentCnt = Number(row.dues_cnt2 ?? row.dues_cnt ?? 0)
  const nextCnt = Math.max(0, Math.min(12, currentCnt + delta))
  if (nextCnt === currentCnt) return

  row.dues_cnt = nextCnt
  row.dues_cnt2 = nextCnt

  await apiDuesInsert({ member_id: row.member_id, dues_cnt: nextCnt, year: selectedYear.value })
  await noty.success(`${row.name} 님의 회비가 ${nextCnt}개월로 수정되었습니다.`)
}

const columns = [
  { header: '이름', accessorKey: 'name', id: 'name', align: 'center', width: 140 },
  {
    header: '납부 현황',
    accessorKey: 'dues_cnt2',
    id: 'dues_cnt2',
    align: 'center',
    width: 160,
    cell: ({ row }) => {
      const cnt = Number(row.original.dues_cnt2 ?? row.original.dues_cnt ?? 0)
      const isCompleted = cnt >= 12
      return h('span', { class: ['dues-progress-badge', isCompleted ? 'is-completed' : ''] }, isCompleted ? '✓ 12개월 (완납)' : `${cnt} / 12 개월`)
    },
  },
  {
    header: '납부 개월 수정',
    id: 'dues_control',
    align: 'center',
    cell: ({ row }) => {
      const cnt = Number(row.original.dues_cnt2 ?? row.original.dues_cnt ?? 0)
      return h('div', { class: 'dues-stepper' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'stepper-btn',
            disabled: cnt <= 0,
            onClick: (e) => {
              e.stopPropagation()
              changeDues(row.original, -1)
            },
          },
          '−',
        ),
        h('span', { class: 'stepper-value' }, `${cnt}개월`),
        h(
          'button',
          {
            type: 'button',
            class: 'stepper-btn',
            disabled: cnt >= 12,
            onClick: (e) => {
              e.stopPropagation()
              changeDues(row.original, 1)
            },
          },
          '+',
        ),
      ])
    },
  },
]

const { refetch } = useQuery({
  queryFn: async () => {
    if (!selectedYear.value || !tab.value) return
    const res = await apiDuesList(tab.value, { year: selectedYear.value })
    data.value = Array.isArray(res) ? res : []
  },
})

watch([selectedYear, tab], refetch, { immediate: true })
</script>

<style lang="scss" src="assets/scss/AdminDuesPage.scss"></style>
