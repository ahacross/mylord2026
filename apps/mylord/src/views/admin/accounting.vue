<template>
  <div class="accounting-page-container">
    <div class="accounting-card-wrapper">
      <!-- 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">📑</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">회계 보고</h1>
            <p class="page-subtitle">주일 예배 후 파트별 출석 인원수와 출석 명단을 확인합니다.</p>
          </div>
        </div>
      </div>

      <!-- 주일 선택 및 복사 영역 -->
      <div class="date-select-section">
        <label class="date-select-label">주일 선택</label>
        <div class="date-action-row">
          <div class="date-picker-wrapper">
            <DatePicker
              v-model="selectedDate"
              model-type="yyyy.MM.dd"
              placeholder="주일 선택"
              :disabled-week-days="[1, 2, 3, 4, 5, 6]"
              :clearable="true"
            />
          </div>
          <button type="button" class="btn-copy" :disabled="isLoading || totalCount === 0" @click="copyMemberList">
            <span class="material-icons-outlined copy-icon">content_copy</span>
            <span>명단 복사</span>
          </button>
        </div>
      </div>

      <!-- 로딩 인디케이터 -->
      <div v-if="isLoading" class="loading-box">
        <span>출석 명단을 불러오는 중입니다...</span>
      </div>

      <!-- 출석 현황 테이블 -->
      <div v-else class="report-table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th class="col-part">파트 (인원)</th>
              <th class="col-members">출석 대원 명단</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in reportData" :key="part.key" class="part-row">
              <td class="col-part">
                <span class="part-badge" :class="part.badgeClass">
                  {{ part.name }} ({{ part.count }}명)
                </span>
              </td>
              <td class="col-members">
                <div v-if="part.members.length > 0" class="member-chip-group">
                  <span v-for="member in part.members" :key="member.member_id" class="member-chip">
                    {{ member.name }}
                  </span>
                </div>
                <div v-else class="empty-members">
                  출석 인원 없음
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="summary-row">
              <td class="col-part">
                <span class="part-badge badge-summary">
                  합계 ({{ totalCount }}명)
                </span>
              </td>
              <td class="col-members">
                <span class="summary-text">총 {{ totalCount }}명 출석</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePage({
  name: 'accounting',
  meta: {
    requiresAuth: true,
  },
})

import { DatePicker } from '@common/form/date-picker'
import { apiAttendanceList } from '@/apis/attendance'

// 최근 주일(일요일) 구하기
const getRecentSunday = () => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day
  const sunday = new Date(d.setDate(diff))
  const y = sunday.getFullYear()
  const m = String(sunday.getMonth() + 1).padStart(2, '0')
  const date = String(sunday.getDate()).padStart(2, '0')
  return `${y}.${m}.${date}`
}

const selectedDate = ref(getRecentSunday())
const isLoading = ref(false)

interface PartReportItem {
  key: string
  name: string
  copyTitle: string
  badgeClass: string
  members: Array<{ member_id: number; name: string; [key: string]: any }>
  count: number
}

const partsConfig: Omit<PartReportItem, 'members' | 'count'>[] = [
  { key: 's', name: '소프라노', copyTitle: '소프라노', badgeClass: 'badge-soprano' },
  { key: 'a', name: '알토', copyTitle: '알토', badgeClass: 'badge-alto' },
  { key: 't', name: '테너', copyTitle: '테너', badgeClass: 'badge-tenor' },
  { key: 'b', name: '베이스', copyTitle: '베이스', badgeClass: 'badge-bass' },
  { key: 'e', name: '그 외', copyTitle: '지휘자, 반주자', badgeClass: 'badge-etc' },
]

const reportData = ref<PartReportItem[]>([])

const totalCount = computed(() => {
  return reportData.value.reduce((acc, cur) => acc + cur.count, 0)
})

const fetchReport = async () => {
  if (!selectedDate.value) {
    reportData.value = partsConfig.map((p) => ({ ...p, members: [], count: 0 }))
    return
  }

  const rawDate = String(selectedDate.value).replace(/\D/g, '')
  if (!rawDate) return

  isLoading.value = true
  try {
    const results = await Promise.all(
      partsConfig.map(async (p) => {
        try {
          const list = await apiAttendanceList(rawDate, p.key)
          const attended = Array.isArray(list)
            ? list.filter((item: any) => item?.after_check === 'Y')
            : []
          return {
            ...p,
            members: attended,
            count: attended.length,
          }
        } catch {
          return {
            ...p,
            members: [],
            count: 0,
          }
        }
      }),
    )
    reportData.value = results
  } finally {
    isLoading.value = false
  }
}

// 출석 대원 명단 복사 기능
const copyMemberList = async () => {
  // 복사 출력 순서: 지휘자, 반주자 -> 소프라노 -> 알토 -> 테너 -> 베이스
  const copyOrder = [
    { key: 'e', title: '지휘자, 반주자' },
    { key: 's', title: '소프라노' },
    { key: 'a', title: '알토' },
    { key: 't', title: '테너' },
    { key: 'b', title: '베이스' },
  ]

  const sections: string[] = []

  copyOrder.forEach(({ key, title }) => {
    const part = reportData.value.find((p) => p.key === key)
    const memberNames = part?.members?.map((m) => m.name).join(', ') || ''
    sections.push(`${title}\n: ${memberNames}`)
  })

  const textToCopy = sections.join('\n\n')

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    noty.success('출석 명단이 복사되었습니다.')
  } catch {
    noty.error('복사에 실패했습니다.')
  }
}

watch(selectedDate, fetchReport, { immediate: true })
</script>

<style scoped lang="scss">
.accounting-page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 2rem 1rem;
  box-sizing: border-box;
  overflow-y: auto;
}

.accounting-card-wrapper {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 640px;
  padding: 2.25rem 2rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-sizing: border-box;
}

/* 카드 헤더 영역 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .header-icon {
    font-size: 1.6rem;
  }
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  line-height: 1.3;
}

/* 주일 선택 및 복사 영역 */
.date-select-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .date-select-label {
    font-size: 0.95rem;
    font-weight: 700;
    color: #334155;
  }

  .date-action-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .date-picker-wrapper {
      flex: 1;
    }

    .btn-copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      height: 48px;
      padding: 0 1.1rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
      flex-shrink: 0;

      .copy-icon {
        font-size: 1.15rem;
      }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  }
}

/* 로딩 박스 */
.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

/* 테이블 영역 */
.report-table-wrapper {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;

    th {
      padding: 1rem 1.25rem;
      font-size: 0.92rem;
      font-weight: 700;
      color: #334155;

      &.col-part {
        width: 150px;
        text-align: center;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 1rem 1.25rem;
        vertical-align: middle;

        &.col-part {
          text-align: center;
          width: 150px;
        }
      }
    }
  }

  tfoot {
    .summary-row {
      background: #ecfdf5;
      border-top: 1px solid #a7f3d0;

      td {
        padding: 1.1rem 1.25rem;
        vertical-align: middle;

        &.col-part {
          text-align: center;
          width: 150px;
        }
      }

      .summary-text {
        font-size: 1rem;
        font-weight: 800;
        color: #059669;
      }
    }
  }
}

/* 파트 뱃지 스타일 */
.part-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;

  &.badge-soprano {
    background: #fdf2f8;
    color: #db2777;
    border: 1px solid #fbcfe8;
  }

  &.badge-alto {
    background: #fefce8;
    color: #a16207;
    border: 1px solid #fde047;
  }

  &.badge-tenor {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #86efac;
  }

  &.badge-bass {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #93c5fd;
  }

  &.badge-etc {
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  &.badge-summary {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
    font-weight: 800;
  }
}

/* 대원 명단 칩 스타일 */
.member-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.empty-members {
  color: #94a3b8;
  font-size: 0.88rem;
}

@media (max-width: 640px) {
  .accounting-page-container {
    padding: 0.75rem 0.5rem;
  }

  .accounting-card-wrapper {
    padding: 1.25rem 1rem;
    border-radius: 18px;
    gap: 1.25rem;
  }

  .report-table {
    thead th.col-part,
    tbody td.col-part,
    tfoot td.col-part {
      width: 120px;
      padding: 0.75rem 0.5rem;
    }

    thead th.col-members,
    tbody td.col-members,
    tfoot td.col-members {
      padding: 0.75rem 0.5rem;
    }
  }

  .part-badge {
    padding: 5px 10px;
    font-size: 0.82rem;
  }

  .member-chip {
    padding: 5px 10px;
    font-size: 0.88rem;
  }

  .date-action-row {
    flex-wrap: wrap;

    .btn-copy {
      width: 100%;
    }
  }
}
</style>
