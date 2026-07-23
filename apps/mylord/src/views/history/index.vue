<template>
  <div
    class="page-container"
    style="display: flex; flex-direction: column; flex: 1; height: 100%; width: 100%; padding: 0; box-sizing: border-box; overflow: hidden"
  >
    <TankTable :data="tableData" :columns="columns" name="부른 찬양들" @click:cell="onClickCell">
      <template #btn-after>
        <button v-if="$storeAuth === 'admin'" class="btn-action btn-primary" @click="openHistory()">
          <span>+ 추가</span>
        </button>
      </template>
    </TankTable>
  </div>

  <!-- 찬양 등록/수정 팝업 -->
  <HistoryPopup v-model="isOpenHistory" :data="selectedRow" @close="getHistoryData" />

  <!-- 파트 선택 팝업 (일반적인 템플릿 바인딩 방식) -->
  <PartPopup v-model="isOpenPart" :data="selectedRow" />
</template>

<script setup>
definePage({
  name: 'history',
  meta: {
    requiresAuth: false,
  },
})

import { TankTable } from '@common/form/tank-table'
import { useQuery } from '@common/api'

import HistoryPopup from './components/HistoryPopup.vue'
import PartPopup from './components/PartPopup.vue'

const { auth: $storeAuth } = storeToRefs(useStoreUser())

const selectedRow = ref(null)
const isOpenHistory = ref(false)

const openHistory = (row = null) => {
  selectedRow.value = row
  isOpenHistory.value = true
}

const isOpenPart = ref(false)

const columns = [
  { header: '부른 날', id: 'praised_day', width: 120, align: 'center' },
  { header: '제목', id: 'title' },
  {
    header: '영상',
    id: 'url',
    align: 'center',
    width: 80,
    className: 'underBarNone',
    formatter: ({ value }) => (value ? `<button class="btn-cell btn-cell-video"><span class="btn-icon">▶</span><span>영상</span></button>` : ''),
  },
  {
    header: '연습',
    id: 'practice_url',
    align: 'center',
    width: 80,
    className: 'underBarNone',
    formatter: ({ value }) => (value ? `<button class="btn-cell btn-cell-practice"><span class="btn-icon">🎵</span><span>연습</span></button>` : ''),
  },
]

const open = (url) => window.open(url, '_blank')

const onClickCell = ({ columnName, rowKey }) => {
  const row = tableData.value.at(rowKey)
  if (!row) return
  selectedRow.value = row

  if ($storeAuth.value === 'admin' && columnName === 'title') {
    openHistory(row)
  } else if (columnName === 'url' && row.url) {
    open(row.url)
  } else if (columnName === 'practice_url' && row.practice_url) {
    isOpenPart.value = true
  }
}

const { data, refetch: getHistoryData } = useQuery({
  queryFn: apiGetHistory,
  immediate: true,
})

const tableData = computed(() => {
  return Array.isArray(data.value) ? data.value : Array.isArray(data.value?.data) ? data.value.data : []
})
</script>

<style scoped lang="scss" src="assets/scss/HistoryPage.scss"></style>
