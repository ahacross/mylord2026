<template>
  <div class="member-page-container">
    <div class="member-card-wrapper">
      <!-- 카드 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">👥</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">찬양대원 관리</h1>
            <p class="page-subtitle">파트별 대원 목록, 상태 및 출석 정보를 조회하고 관리합니다.</p>
          </div>
        </div>

        <!-- 필터 칩 뱃지 그룹 (선택 활성/비활성 100% 명확) -->
        <div class="status-chip-group">
          <button
            v-for="opt in memberStatus"
            :key="opt.value"
            type="button"
            class="status-chip-btn"
            :class="[`chip-${opt.value.toLowerCase()}`, { active: checkStatus.includes(opt.value) }]"
            @click="toggleStatus(opt.value)"
          >
            <span v-if="checkStatus.includes(opt.value)" class="chip-check-icon">✓</span>
            <span v-else class="chip-dot"></span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <!-- 파트 세그먼트 탭 -->
      <div class="part-tab-bar">
        <button v-for="{ text, part } in partsShort" :key="part" type="button" class="part-tab-btn" :class="{ active: tab === part }" @click="tab = part">
          <span>{{ text }}</span>
        </button>
      </div>

      <div class="card-divider"></div>

      <!-- 테이블 영역 (TankTable 적용) -->
      <div class="table-container">
        <TankTable :data="filterData" :columns="columns" :is-search="false" :hide-name="true" @click:cell="onClickCell">
          <template #btn-before>
            <button type="button" class="btn-add-member" @click="onClickPopup()">
              <span>+ 대원 추가</span>
            </button>
          </template>
        </TankTable>
      </div>
    </div>
  </div>
  <MemberPopup v-model="isOpenMember" :data="rowData" @close="refetch" />
</template>

<script setup>
definePage({
  name: 'members',
  meta: {
    requiresAuth: true,
  },
})

import { useQuery } from '@common/api'
import { TankTable } from '@common/form/tank-table'
import { memberStatus, memberStatusMap, partsShort } from '@/constants/constants'
import { useDate } from '@common/utils'
import MemberPopup from '@/views/admin/members/components/MemberPopup.vue'

const tab = ref('s')
const checkStatus = ref(['Y'])

const toggleStatus = (val) => {
  if (checkStatus.value.includes(val)) {
    if (checkStatus.value.length > 1) {
      checkStatus.value = checkStatus.value.filter((s) => s !== val)
    }
  } else {
    checkStatus.value.push(val)
  }
}

const { refetch, data } = useQuery({
  queryFn: async () => {
    const res = await apiGetMembers({ part: tab.value === 'all' ? '' : tab.value })
    return Array.isArray(res) ? res : []
  },
})

const filterData = computed(() => {
  const list = data.value || []
  return list.filter(({ status }) => checkStatus.value.includes(status))
})

const columns = [
  {
    header: '이름',
    accessorKey: 'name',
    id: 'name',
    align: 'center',
    width: 140,
    cell: ({ row }) => h('span', { class: 'member-name-link', onClick: () => onClickPopup(row.original) }, row.original.name),
  },
  {
    header: '상태',
    accessorKey: 'status',
    id: 'status',
    align: 'center',
    width: 130,
    formatter: ({ value }) => memberStatusMap.get(value) || value,
  },
  {
    header: '마지막 출석일',
    accessorKey: 'last_attend',
    id: 'last_attend',
    align: 'center',
    cell: ({ row }) => {
      const val = row.original.last_attend
      if (!val) return ''
      const formattedDate = useDate.format(val, 'yyyy년 MM월 dd일')
      const weekCnt = useDate.diff(val, 'weeks')
      const colorClass = weekCnt < 4 ? 'green' : weekCnt < 12 ? 'orange' : 'out'
      const icon = weekCnt < 4 ? '✓' : weekCnt < 12 ? '⚠️' : '🚨'
      return h('span', { class: ['attend-badge', colorClass] }, `${icon} ${formattedDate}`)
    },
  },
]

const isOpenMember = ref(false)
const rowData = ref()
const onClickPopup = async (row = null) => {
  rowData.value = row
  isOpenMember.value = true
}

const onClickCell = async ({ columnName, row }) => {
  if (columnName === 'name' && row) {
    await onClickPopup(row)
  }
}

watch(tab, refetch, { immediate: true })
</script>

<style lang="scss" src="assets/scss/MemberManager.scss"></style>
