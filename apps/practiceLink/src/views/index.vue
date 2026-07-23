<template>
  <div class="practice-app">
    <!-- 헤더 영역 -->
    <header class="app-header">
      <div class="header-content">
        <span class="logo-icon">🎵</span>
        <h1 class="gradient-text">MYLORD</h1>
        <span class="subtitle-divider"></span>
        <span class="subtitle">찬양대 파트별 연습실</span>
      </div>

      <!-- 다가오는 연습 일요일 강조 뱃지 -->
      <div class="date-badge" v-if="highlightDate">
        <span class="badge-label">연습 기준일:</span>
        <span class="badge-date">{{ formattedHighlightDate }}</span>
      </div>
    </header>

    <!-- YouTube 플레이어 섹션 -->
    <section class="player-section">
      <!-- 재생 방식 제어 토글 -->
      <div class="control-panel">
        <div class="segmented-control">
          <button :class="{ active: playType === 'inner' }" @click="playType = 'inner'">
            <span class="btn-icon">📺</span> 영상 재생
          </button>
          <button :class="{ active: playType === 'link' }" @click="playType = 'link'">
            <span class="btn-icon">🔗</span> 유튜브 새탭
          </button>
        </div>
      </div>

      <IframePlayer :src="iframeSrc" />
    </section>

    <!-- 메인 컨텐츠 (아코디언 형태) -->
    <div class="accordion-container">
      <!-- 1. 연습 곡들 섹션 -->
      <div class="accordion-item" :class="{ open: sectionsOpen.practice }">
        <button class="accordion-header" @click="toggleSection('practice')">
          <div class="header-title">
            <span class="icon">✨</span>
            <h2>연습 곡 목록</h2>
          </div>
          <span class="arrow material-icons-outlined">expand_more</span>
        </button>

        <div class="accordion-content">
          <div class="songs-grid">
            <div
              v-for="(item, idx) in practiceList"
              :key="idx"
              class="song-card"
              :class="{ 'highlighted-card': item.praised_day === highlightDate }"
            >
              <div v-if="item.praised_day === highlightDate" class="top-badge">이번 주 찬양 🌟</div>
              <div class="card-meta">
                <span class="praised-date">{{ item.praised_day }}</span>
              </div>
              <h3 class="song-title">{{ item.title }}</h3>
              <p class="song-desc" v-if="item.description">{{ item.description }}</p>

              <div class="parts-container">
                <button
                  v-for="(part, partIdx) in partList"
                  :key="partIdx"
                  class="part-chip"
                  :class="{ active: iframeSrc === item.practice_url?.split(',')[partIdx] }"
                  @click="handlePartClick(item.practice_url?.split(',')[partIdx])"
                >
                  <span
                    class="part-indicator"
                    v-if="iframeSrc === item.practice_url?.split(',')[partIdx]"
                  ></span>
                  {{ part.text }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 송영 섹션 -->
      <div class="accordion-item" :class="{ open: sectionsOpen.songyoung }">
        <button class="accordion-header" @click="toggleSection('songyoung')">
          <div class="header-title">
            <span class="icon">⛪</span>
            <h2>송영 (입례/기도/축도송)</h2>
          </div>
          <span class="arrow material-icons-outlined">expand_more</span>
        </button>

        <div class="accordion-content">
          <div class="songs-grid">
            <div v-for="(item, idx) in songyoungList" :key="idx" class="song-card songyoung-card">
              <div class="card-meta">
                <span class="songyoung-badge">{{ item.description }}</span>
              </div>
              <h3 class="song-title">{{ item.title }}</h3>

              <div class="parts-container">
                <button
                  v-for="(part, partIdx) in partList.slice(1)"
                  :key="partIdx"
                  class="part-chip"
                  :class="{ active: iframeSrc === item.url[partIdx] }"
                  @click="handlePartClick(item.url[partIdx])"
                >
                  <span class="part-indicator" v-if="iframeSrc === item.url[partIdx]"></span>
                  {{ part.text }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 생일 축하 섹션 -->
      <!--      <div class="accordion-item" :class="{ open: sectionsOpen.birthday }">-->
      <!--        <button class="accordion-header" @click="toggleSection('birthday')">-->
      <!--          <div class="header-title">-->
      <!--            <span class="icon">🎂</span>-->
      <!--            <h2>{{ birthMonth }}월 생일 축하</h2>-->
      <!--          </div>-->
      <!--          <span class="arrow material-icons-outlined">expand_more</span>-->
      <!--        </button>-->
      <!--        -->
      <!--        <div class="accordion-content">-->
      <!--          <div class="birthday-grid" v-if="birthdays.length > 0">-->
      <!--            <div -->
      <!--              v-for="{ name, birthday } in birthdays" -->
      <!--              :key="name"-->
      <!--              class="birthday-card"-->
      <!--            >-->
      <!--              <div class="cake-decor">✨🎂✨</div>-->
      <!--              <div class="birthday-name">{{ name }}</div>-->
      <!--              <div class="birthday-date">{{ formatBirthday(birthday) }}</div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--          <div class="no-birthdays" v-else>-->
      <!--            <p>이달에 생일인 멤버가 없습니다. 🤫</p>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@common/api'
import { getSongListApi, getBirthdaysApi } from '@/apis'

definePage({
  meta: { layout: 'empty' },
})

import IframePlayer from '@/components/IframePlayer.vue'
import type { PracticeSong, Songyoung, BirthdayMember, Part } from './types'

// --- 상태 정의 ---
const playType = ref<'inner' | 'link'>('inner')
const iframeSrc = ref<string>('')
const highlightDate = ref<string>('')

// 1. 찬양곡 목록 쿼리
const { data: practiceData, refetch: refetchSongs } = useQuery<PracticeSong[]>({
  queryFn: () => getSongListApi(),
  immediate: true,
})

const practiceList = computed(() => {
  const data = practiceData.value
  if (!data) return []
  return Array.isArray(data) ? data : [data]
})

// 2. 송영 데이터 로드
const songyoungList = ref<Songyoung[]>([])
const getSongyoungList = async () => {
  try {
    songyoungList.value = await fetch('/practiceLink/송영.json').then((res) => res.json())
  } catch (error) {
    console.error('송영 리스트 로딩 실패:', error)
  }
}

// 3. 생일자 목록 쿼리
const currentMonth = ref(String(new Date().getMonth() + 1).padStart(2, '0'))
const birthMonth = computed(() => String(parseInt(currentMonth.value, 10)))

const { data: birthdayData, refetch: refetchBirthdays } = useQuery<BirthdayMember[], string>(
  {
    queryFn: (month) => getBirthdaysApi(month || currentMonth.value),
    immediate: true,
  },
  currentMonth,
)

const birthdays = computed(() => birthdayData.value || [])

// 할렐루야 고정 URL 목록
const hallelujahList = ref<string[]>([
  'https://youtu.be/m-fS6VFaq10', // 합창
  'https://youtu.be/LR3mtuaEPh8', // 소프라노
  'https://youtu.be/gZdkV3BvNdg', // 알토
  'https://youtu.be/wnqvNTFnvz4', // 테너
  'https://youtu.be/jpeSNkIRo40', // 베이스
])

const partList: Part[] = [
  { text: '합창', short: 'mp' },
  { text: '소프라노', short: 'ss' },
  { text: '알토', short: 'aa' },
  { text: '테너', short: 'tt' },
  { text: '베이스', short: 'bb' },
]

// 아코디언 상태 관리
const sectionsOpen = ref({
  practice: true,
  songyoung: false,
  hallelujah: false,
  birthday: false,
})

// --- Computed ---
const formattedHighlightDate = computed(() => {
  if (!highlightDate.value) return ''
  try {
    const date = useDate.getDate(highlightDate.value, 'yyyy-MM-dd')
    return useDate.format(date, 'yyyy년 MM월 dd일 (E)')
  } catch (e) {
    return highlightDate.value
  }
})

// --- 메서드 정의 ---
const toggleSection = (section: keyof typeof sectionsOpen.value) => {
  sectionsOpen.value[section] = !sectionsOpen.value[section]
}

const handlePartClick = (url: string | undefined) => {
  if (!url) return
  if (playType.value === 'inner') {
    iframeSrc.value = url
  } else {
    const tempUrl = url.split('.be/').at(1)
    const youtubeUrl = `https://www.youtube.com/embed/${tempUrl}?autoplay=1&loop=1&playlist=${tempUrl}&playsinline=1`
    window.open(youtubeUrl, '_blank')
  }
}

// 다음 주 일요일 하이라이트 날짜 셋업
const setHighLightDate = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  let targetDate = today
  if (dayOfWeek !== 0) {
    targetDate = useDate.plus(7 - dayOfWeek, 'day', today)
  }
  highlightDate.value = useDate.format(targetDate, 'yyyy-MM-dd')
}

// 생일 포맷팅
const formatBirthday = (dateStr: string) => {
  if (!dateStr || dateStr.length < 4) return dateStr
  try {
    let cleanDate = dateStr
    if (dateStr.length === 8) {
      cleanDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    } else if (dateStr.length === 4) {
      const currentYear = new Date().getFullYear()
      cleanDate = `${currentYear}-${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}`
    } else {
      cleanDate = dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
    }
    const date = new Date(cleanDate)
    return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(date)
  } catch (e) {
    return dateStr
  }
}

// visibility 갱신 감지
const getTodayString = () => {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).formatToParts(new Date())

  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value

  return `${y}-${m}-${d}`
}

const checkAndReload = () => {
  const lastSavedDate = localStorage.getItem('lastVisitedDate')
  const today = getTodayString()

  if (lastSavedDate && lastSavedDate !== today) {
    localStorage.setItem('lastVisitedDate', today)
    refetchSongs()
    refetchBirthdays()
    setHighLightDate()
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkAndReload()
  } else {
    localStorage.setItem('lastVisitedDate', getTodayString())
  }
}

// --- 라이프사이클 훅 ---
onMounted(async () => {
  setHighLightDate()
  getSongyoungList()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
