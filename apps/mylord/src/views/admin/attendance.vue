<template>
  <div class="attendance-page-container">
    <div class="attendance-card-wrapper">
      <!-- 카드 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">📋</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">대원 출석 관리</h1>
            <p class="page-subtitle">주일 예배 전/후 대원들의 출석 체크 및 재적 인원을 관리합니다.</p>
          </div>
        </div>

        <!-- 필터 그룹 (날짜 선택) -->
        <div class="filter-group">
          <span class="filter-label">출석 일자</span>
          <div class="date-picker">
            <DatePicker v-model="attendanceDate" placeholder="일자 선택" :disabled-week-days="[1, 2, 3, 4, 5, 6]" :clearable="false" />
          </div>
        </div>
      </div>

      <!-- 출석 실시간 요약 통계 뱃지 바 -->
      <div class="attendance-summary-bar">
        <div class="summary-badge-item is-before">
          <span class="badge-icon">☀️</span>
          <div class="badge-text-box">
            <span class="badge-label">예배 전 출석 인원</span>
            <span class="badge-val">{{ beforeCount }}명 / 재적 {{ enrollBefore || 0 }}명</span>
          </div>
        </div>
        <div class="summary-badge-item is-after">
          <span class="badge-icon">🌙</span>
          <div class="badge-text-box">
            <span class="badge-label">예배 후 출석 인원</span>
            <span class="badge-val">{{ afterCount }}명 / 재적 {{ enrollAfter || 0 }}명</span>
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
        <TankTable :data="data || []" :columns="columns" name="대원 출석 목록" />
      </div>

      <!-- 하단 재적 수 입력 영역 -->
      <div class="enrollment-card-row">
        <div class="enrollment-input-group">
          <label class="enrollment-label">재적 수 (예배 전)</label>
          <input v-model.number="enrollBefore" type="number" class="enrollment-input" placeholder="예배 전 재적 인원 입력" @blur="onSaveEnrollment" />
        </div>
        <div class="enrollment-input-group">
          <label class="enrollment-label">재적 수 (예배 후)</label>
          <input v-model.number="enrollAfter" type="number" class="enrollment-input" placeholder="예배 후 재적 인원 입력" @blur="onSaveEnrollment" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'attendance',
  meta: {
    requiresAuth: true,
  },
})

import { DatePicker } from '@common/form/date-picker'
import { TankTable } from '@common/form/tank-table'
import { useQuery } from '@common/api'
import { partsShort } from '@/constants/constants'

const attendanceDate = ref(useDate.format(new Date(), 'yyyyMMdd'))
const enrollBefore = ref(0)
const enrollAfter = ref(0)
const tab = ref('s')

const toggleAttendance = async (row, column, checked) => {
  row[column] = checked ? 'Y' : 'N'
  const { member_id, before_check, after_check, part, name } = row
  await apiAttendanceInsert({
    member_id,
    before_check: before_check || 'N',
    after_check: after_check || 'N',
    part,
    attendance_date: attendanceDate.value,
  })
  const label = column === 'before_check' ? '예배 전' : '예배 후'
  noty.success(`${name} 님의 ${label} 출석이 ${checked ? '출석' : '결석'}으로 변경되었습니다.`)
}

const columns = [
  { header: '이름', accessorKey: 'name', id: 'name', align: 'center', width: 140 },
  {
    header: '예배 전 출석',
    id: 'before_check',
    align: 'center',
    cell: ({ row }) => {
      const isChecked = row.original.before_check === 'Y'
      return h('label', { class: 'att-checkbox-wrapper', onClick: (e) => e.stopPropagation() }, [
        h('input', {
          type: 'checkbox',
          checked: isChecked,
          onChange: (e) => toggleAttendance(row.original, 'before_check', e.target.checked),
        }),
        h('span', { class: 'custom-check-box' }),
      ])
    },
  },
  {
    header: '예배 후 출석',
    id: 'after_check',
    align: 'center',
    cell: ({ row }) => {
      const isChecked = row.original.after_check === 'Y'
      return h('label', { class: 'att-checkbox-wrapper', onClick: (e) => e.stopPropagation() }, [
        h('input', {
          type: 'checkbox',
          checked: isChecked,
          onChange: (e) => toggleAttendance(row.original, 'after_check', e.target.checked),
        }),
        h('span', { class: 'custom-check-box' }),
      ])
    },
  },
]

const getListEnrollment = async () => {
  if (!attendanceDate.value) return
  const enrollmentData = await apiEnrollmentList(attendanceDate.value, tab.value)
  const { before_count, after_count } = enrollmentData || {}
  if (before_count || after_count) {
    enrollBefore.value = before_count
    enrollAfter.value = after_count
  } else {
    const count = (data.value || []).length
    enrollBefore.value = count
    enrollAfter.value = count
    onSaveEnrollment()
  }
}

const onSaveEnrollment = () => {
  if (!attendanceDate.value) return
  const params = {
    attend_date: attendanceDate.value,
    part: tab.value,
    before_count: enrollBefore.value || 0,
    after_count: enrollAfter.value || 0,
  }
  apiEnrollmentInsert(params)
}

const { refetch, data } = useQuery({
  queryFn: async () => {
    if (!attendanceDate.value) return []
    return await apiAttendanceList(attendanceDate.value, tab.value)
  },
})

watch(
  [attendanceDate, tab],
  async () => {
    await refetch()
    await getListEnrollment()
  },
  { immediate: true },
)

const beforeCount = computed(() => (data.value || []).filter((item) => item?.before_check === 'Y').length)
const afterCount = computed(() => (data.value || []).filter((item) => item?.after_check === 'Y').length)
</script>

<style lang="scss" src="assets/scss/AttendanceManager.scss"></style>
