<template>
  <div
    class="page-container"
    style="display: flex; flex-direction: column; flex: 1; min-height: 100%; width: 100%; padding: 0; box-sizing: border-box; overflow: auto"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
  >
    <TankTable :data="tableData" :columns="columns" name="찬양들" @click:cell="onClickCell">
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

const isMobile = ref(false)

const updateIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 640
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const columns = computed(() => [
  {
    header: isMobile.value ? '날짜' : '부른 날',
    id: 'praised_day',
    width: isMobile.value ? 86 : 110,
    align: 'center',
    formatter: ({ value }) => {
      if (!value) return ''
      return String(value).replaceAll('-', '.')
    },
  },
  {
    header: '제목',
    id: 'title',
    className: 'col-title',
    formatter: ({ value }) => {
      if (!value) return ''
      return `<div class="title-scroll-wrapper"><span class="title-scroll-text">${value}</span></div>`
    },
  },
  {
    header: '영상',
    id: 'url',
    align: 'center',
    width: isMobile.value ? 42 : 75,
    className: 'underBarNone',
    formatter: ({ value }) =>
      value ? `<button class="btn-cell btn-cell-video" title="영상"><span class="btn-icon">▶</span><span class="btn-text">영상</span></button>` : '',
  },
  {
    header: '연습',
    id: 'practice_url',
    align: 'center',
    width: isMobile.value ? 42 : 75,
    className: 'underBarNone',
    formatter: ({ value }) =>
      value ? `<button class="btn-cell btn-cell-practice" title="연습"><span class="btn-icon">🎵</span><span class="btn-text">연습</span></button>` : '',
  },
])

const open = (url) => window.open(url, '_blank')

let touchStartX = 0
let touchStartY = 0
let isTouchDragging = false

const onTouchStart = (e) => {
  if (e.touches && e.touches.length > 0) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    isTouchDragging = false
  }
}

const onTouchMove = (e) => {
  if (e.touches && e.touches.length > 0) {
    const diffX = Math.abs(e.touches[0].clientX - touchStartX)
    const diffY = Math.abs(e.touches[0].clientY - touchStartY)
    if (diffX > 8 || diffY > 8) {
      isTouchDragging = true
    }
  }
}

const onClickCell = ({ columnName, rowKey }) => {
  if (isTouchDragging) {
    isTouchDragging = false
    return
  }
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

<style scoped lang="scss" src="@/assets/scss/HistoryPage.scss"></style>
