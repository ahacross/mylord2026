<template>
  <div class="seat-app">
    <!-- 헤더 -->
    <header class="app-header">
      <div class="header-content">
        <span class="logo-icon">🪑</span>
        <h1 class="gradient-text">성가대 자리 배치</h1>
      </div>
      <p class="subtitle">우리 교회의 완벽한 찬양 대열 디자인 🎼</p>
    </header>

    <div class="card-container">
      <!-- 1. 정렬 방식 제어 (세그먼트 토글) -->
      <div class="control-section">
        <h3 class="section-title">배치 방식 선택</h3>
        <div class="segmented-control-wrapper">
          <div class="segmented-control">
            <button :class="{ active: isSingle }" @click="isSingle = true">
              <span class="btn-icon">💡</span> 단방향
            </button>
            <button :class="{ active: !isSingle }" @click="isSingle = false">
              <span class="btn-icon">⚖️</span> 양방향
            </button>
          </div>
        </div>
      </div>

      <!-- 2. 행/열 설정 (인풋 그리드) -->
      <div class="control-section">
        <h3 class="section-title">좌석 규모 설정 (줄 × 칸)</h3>
        <div class="input-grid">
          <!-- 단방향일 때 -->
          <div v-if="isSingle" class="input-group-row">
            <div class="input-card">
              <span class="input-label">줄 수 (Rows)</span>
              <input v-model.number="singleRow" type="number" min="1" max="15" />
            </div>
            <div class="input-card">
              <span class="input-label">칸 수 (Cols)</span>
              <input v-model.number="singleCol" type="number" min="1" max="15" />
            </div>
          </div>
          <!-- 양방향 분할일 때 -->
          <div v-else class="input-group-both">
            <div class="direction-column">
              <div class="direction-badge left">👈 왼쪽 대열 (오르간 방향)</div>
              <div class="input-group-row">
                <div class="input-card">
                  <span class="input-label">줄 수 (Rows)</span>
                  <input v-model.number="leftRow" type="number" min="1" max="15" />
                </div>
                <div class="input-card">
                  <span class="input-label">칸 수 (Cols)</span>
                  <input v-model.number="leftCol" type="number" min="1" max="15" />
                </div>
              </div>
            </div>
            <div class="direction-column">
              <div class="direction-badge right">오른쪽 대열 (피아노 방향) 👉</div>
              <div class="input-group-row">
                <div class="input-card">
                  <span class="input-label">줄 수 (Rows)</span>
                  <input v-model.number="rightRow" type="number" min="1" max="15" />
                </div>
                <div class="input-card">
                  <span class="input-label">칸 수 (Cols)</span>
                  <input v-model.number="rightCol" type="number" min="1" max="15" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 파트 지정 칩 -->
      <div class="control-section">
        <h3 class="section-title">배치할 파트 선택</h3>
        <div class="parts-selector">
          <button
            v-for="p in parts"
            :key="p.id"
            :class="['part-chip', p.id, { active: part === p.id }]"
            @click="part = p.id"
          >
            <span class="part-indicator"></span>
            {{ p.name }}
          </button>
        </div>
      </div>

      <!-- 4. 성가대 배치판 (순수 Vue 3 렌더링 영역) -->
      <div class="board-section">
        <div class="board-header">
          <span class="badge">배치 판넬</span>
          <p class="board-tip">
            💡 좌석을 누르면 선택된 파트 색상으로 바뀝니다. (이미 채워진 자리를 다시 누르면 초기화)
          </p>
        </div>

        <div ref="captureArea" class="capture-container">
          <!-- 단방향 대열일 때 -->
          <div v-if="isSingle" class="single-layout-wrapper">
            <div class="direction-bar center">피아노 🎹</div>

            <!-- 열 번호 헤더 (정순) -->
            <div class="col-header-row" :style="{ paddingLeft: '44px' }">
              <span v-for="c in singleCol" :key="'col-num-' + c" class="col-number-label">
                {{ c }}
              </span>
            </div>

            <!-- 바둑판 좌석 배치 -->
            <div class="seats-rows-container">
              <div v-for="r in singleRow" :key="'row-' + r" class="seat-row-line">
                <!-- 행 알파벳 인덱서 (왼쪽) -->
                <span class="row-alphabet-label">{{ getRowLabel(r - 1) }}</span>

                <!-- 좌석 아이템 루프 -->
                <span
                  v-for="c in singleCol"
                  :key="'seat-' + r + '-' + c"
                  :class="['custom-seat-btn', singleSeats[r - 1]?.[c - 1]]"
                  @click="toggleSeat(singleSeats, r - 1, c - 1)"
                >
                  {{ getRowLabel(r - 1) }}{{ c }}
                </span>
              </div>
            </div>
          </div>

          <!-- 양방향 분할 대열일 때 -->
          <div v-else class="split-layout-wrapper">
            <div class="split-direction-headers">
              <div class="direction-bar left">오르간 🎼</div>
              <div class="direction-bar middle">강단 정중앙</div>
              <div class="direction-bar right">피아노 🎹</div>
            </div>

            <div class="split-grid-body">
              <!-- [1] 왼쪽 대열 좌석표 (열 번호 대칭 역순 배치: 예: 3, 2, 1) -->
              <div class="split-pane left-pane">
                <!-- 왼쪽 대열 열 번호 (역순) -->
                <div class="col-header-row justify-end" :style="{ paddingRight: '4px' }">
                  <span v-for="c in leftCol" :key="'l-col-num-' + c" class="col-number-label">
                    {{ leftCol - c + 1 }}
                  </span>
                </div>
                <!-- 왼쪽 좌석 행 루프 -->
                <div v-for="r in leftRow" :key="'l-row-' + r" class="seat-row-line justify-end">
                  <span
                    v-for="c in leftCol"
                    :key="'l-seat-' + r + '-' + c"
                    :class="['custom-seat-btn', leftSeats[r - 1]?.[leftCol - c]]"
                    @click="toggleSeat(leftSeats, r - 1, leftCol - c)"
                  >
                    {{ getRowLabel(r - 1) }}{{ leftCol - c + 1 }}
                  </span>
                </div>
              </div>

              <!-- [2] 중앙 행 인덱서 (A, B, C, D...) -->
              <div class="split-pane center-indexer-pane">
                <div class="col-header-row invisible-label">
                  <span class="col-number-label">-</span>
                </div>
                <div v-for="r in maxRows" :key="'c-indexer-' + r" class="indexer-row-line">
                  <span class="center-alphabet-badge">{{ getRowLabel(r - 1) }}</span>
                </div>
              </div>

              <!-- [3] 오른쪽 대열 좌석표 (열 번호 정순 배치: 1, 2, 3) -->
              <div class="split-pane right-pane">
                <!-- 오른쪽 대열 열 번호 (정순) -->
                <div class="col-header-row justify-start" :style="{ paddingLeft: '4px' }">
                  <span v-for="c in rightCol" :key="'r-col-num-' + c" class="col-number-label">
                    {{ c }}
                  </span>
                </div>
                <!-- 오른쪽 좌석 행 루프 -->
                <div v-for="r in rightRow" :key="'r-row-' + r" class="seat-row-line justify-start">
                  <span
                    v-for="c in rightCol"
                    :key="'r-seat-' + r + '-' + c"
                    :class="['custom-seat-btn', rightSeats[r - 1]?.[c - 1]]"
                    @click="toggleSeat(rightSeats, r - 1, c - 1)"
                  >
                    {{ getRowLabel(r - 1) }}{{ c }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 액션 버튼 -->
      <div class="action-section">
        <button class="gradient-btn" @click="onClickShare">
          <span class="material-icons-outlined">share</span>
          배치도 전송
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { captureToBlob } from '@/utils/capture'
import { Share } from '@/utils/kakaoShare'

// 타입 및 파트 정의
type SeatState = 'available' | 'sop' | 'alt' | 'ten' | 'bas'

interface PartConfig {
  id: SeatState
  name: string
}

// 로컬스토리지 데이터 로드 헬퍼 함수
const getStoredNum = (key: string, defaultVal: number): number => {
  const val = localStorage.getItem(key)
  return val ? parseInt(val, 10) : defaultVal
}

const getStoredBool = (key: string, defaultVal: boolean): boolean => {
  const val = localStorage.getItem(key)
  return val ? val === 'true' : defaultVal
}

const part = ref<SeatState>('sop')

// 1. 기본값 단방향(true) 설정 및 로컬스토리지 영속화 적용
const isSingle = ref(getStoredBool('seat:isSingle', true))

// 2. 단/양방향 개별 Row / Col 로컬스토리지 영속화 데이터 마운팅
const singleRow = ref(getStoredNum('seat:singleRow', 6))
const singleCol = ref(getStoredNum('seat:singleCol', 3))

const leftRow = ref(getStoredNum('seat:leftRow', 5))
const leftCol = ref(getStoredNum('seat:leftCol', 3))

const rightRow = ref(getStoredNum('seat:rightRow', 5))
const rightCol = ref(getStoredNum('seat:rightCol', 3))

// 3. 상태값 변경 시 로컬스토리지 즉각 동기화 감시자 지정
watch(isSingle, (newVal) => localStorage.setItem('seat:isSingle', String(newVal)))
watch(singleRow, (newVal) => localStorage.setItem('seat:singleRow', String(newVal)))
watch(singleCol, (newVal) => localStorage.setItem('seat:singleCol', String(newVal)))
watch(leftRow, (newVal) => localStorage.setItem('seat:leftRow', String(newVal)))
watch(leftCol, (newVal) => localStorage.setItem('seat:leftCol', String(newVal)))
watch(rightRow, (newVal) => localStorage.setItem('seat:rightRow', String(newVal)))
watch(rightCol, (newVal) => localStorage.setItem('seat:rightCol', String(newVal)))

// 실제 좌석 배치도 2차원 배열 데이터 상태
const singleSeats = ref<SeatState[][]>([])
const leftSeats = ref<SeatState[][]>([])
const rightSeats = ref<SeatState[][]>([])

const parts: PartConfig[] = [
  { id: 'sop', name: '소프라노' },
  { id: 'alt', name: '알토' },
  { id: 'ten', name: '테너' },
  { id: 'bas', name: '베이스' },
]

// 스마트 보존형 크기 변환 알고리즘 (리사이징 시 배치된 데이터 보존)
const resizeSeats = (oldSeats: SeatState[][], newRow: number, newCol: number): SeatState[][] => {
  const result: SeatState[][] = []
  for (let r = 0; r < newRow; r++) {
    const rowArr: SeatState[] = []
    for (let c = 0; c < newCol; c++) {
      rowArr.push((oldSeats[r] && oldSeats[r][c]) || 'available')
    }
    result.push(rowArr)
  }
  return result
}

// 알파벳 인덱서 행 라벨 얻기 (0 -> A, 1 -> B...)
const getRowLabel = (index: number): string => {
  return String.fromCharCode(65 + index)
}

// 좌석 클릭 배정 토글 함수
const toggleSeat = (matrix: SeatState[][], r: number, c: number) => {
  if (!matrix[r]) return
  const current = matrix[r][c]
  if (current === part.value) {
    matrix[r][c] = 'available' // 동일 파트를 한 번 더 누르면 초기화
  } else {
    matrix[r][c] = part.value // 선택한 파트로 배정
  }
}

// 분할 모드 일 때 알파벳 중앙 인덱서 최대 렌더링 범위 산출
const maxRows = computed(() => {
  return Math.max(leftRow.value, rightRow.value)
})

// 단방향 좌석 크기 조절 감시
watch(
  [singleRow, singleCol],
  ([newRow, newCol]) => {
    singleSeats.value = resizeSeats(singleSeats.value, newRow, newCol)
  },
  { immediate: true },
)

// 양방향 좌측 크기 조절 감시
watch(
  [leftRow, leftCol],
  ([newRow, newCol]) => {
    leftSeats.value = resizeSeats(leftSeats.value, newRow, newCol)
  },
  { immediate: true },
)

// 양방향 우측 크기 조절 감시
watch(
  [rightRow, rightCol],
  ([newRow, newCol]) => {
    rightSeats.value = resizeSeats(rightSeats.value, newRow, newCol)
  },
  { immediate: true },
)

// 배치 방식(단방향/양방향) 스위칭 감시 초기화
watch(
  isSingle,
  (singleVal) => {
    if (singleVal) {
      singleSeats.value = resizeSeats(singleSeats.value, singleRow.value, singleCol.value)
    } else {
      leftSeats.value = resizeSeats(leftSeats.value, leftRow.value, leftCol.value)
      rightSeats.value = resizeSeats(rightSeats.value, rightRow.value, rightCol.value)
    }
  },
  { immediate: true },
)

const captureArea = ref<HTMLDivElement>()

// 캡처 및 공유 액션 핸들러
const onClickShare = async () => {
  if (!captureArea.value) return
  try {
    const blob = await captureToBlob(captureArea.value)
    if (!blob) {
      alert('이미지 파일 생성에 실패했습니다.')
      return
    }
    const todayStr = new Date().toISOString().split('T').at(0) || 'seat_layout'

    // 로컬 다운로드 정식 활성화
    // const downloadUrl = window.URL.createObjectURL(blob)
    // const link = document.createElement('a')
    // link.href = downloadUrl
    // link.setAttribute('download', `${todayStr}_성가대배치.png`)
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
    // window.URL.revokeObjectURL(downloadUrl)

    // 카카오 SDK 업로드 및 피드 공유 발송 (주석 처리)
    const file = new File([blob], `성가대배치_${todayStr}.png`, { type: 'image/png' })
    const imageUrl = await Share.uploadImage(file)
    Share.shareContent(`성가대 자리 배치도 (${todayStr})`, imageUrl)
  } catch (error) {
    console.error('이미지 다운로드 및 공유 실패:', error)
    alert('이미지 다운로드 중 오류가 발생했습니다.')
  }
}
</script>
