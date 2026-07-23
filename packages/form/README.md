# @common/form

Vue 3 전용 공통 UI 컴포넌트 패키지입니다. 가상화 테이블(`TankTable`), 날짜 선택기(`DatePicker`), 모달 다이얼로그(`Dialog`)를 제공합니다.

---

## 📦 구성 모듈

### 1. `TankTable` (`@common/form/tank-table`)
TanStack Table v8 및 TanStack Virtual 기반의 가상 스크롤 데이터 테이블 컴포넌트입니다.

#### 주요 기능
- **가상 스크롤 (Virtual Scrolling)**: 대용량 데이터도 수월하게 고성능 렌더링
- **PC/모바일 스크롤바 자동으로 세로선(Border) 보정**: 동적 스크롤바 폭 감지로 헤더/바디 라인 밀림 방지
- **컬럼 정렬 및 글로벌 검색**: 기본 검색바 및 컬럼 정렬 기능 지원
- **엑셀 다운로드**: 데이터 엑셀 파일 저장 기능 지원
- **인라인 편집**: 특정 컬럼의 셀 데이터 직접 수정 기능

#### 사용법
```vue
<script setup>
import { TankTable } from '@common/form/tank-table'

const tableData = ref([
  { id: 1, praised_day: '2026-07-20', title: '은혜', url: 'https://...' },
  { id: 2, praised_day: '2026-07-21', title: '주 품에', url: 'https://...' },
])

const columns = [
  { header: '부른 날', id: 'praised_day', width: 120, align: 'center' },
  { header: '제목', id: 'title' },
  {
    header: '영상',
    id: 'url',
    align: 'center',
    width: 80,
    formatter: ({ value }) => (value ? `<button class="btn-video">▶ 영상</button>` : ''),
  },
]

const handleCellClick = ({ columnName, row }) => {
  console.log('클릭한 셀:', columnName, row)
}
</script>

<template>
  <TankTable
    :data="tableData"
    :columns="columns"
    name="부른 찬양 목록"
    :isPaging="false"
    :isExcel="true"
    @click:cell="handleCellClick"
  />
</template>
```

---

### 2. `DatePicker` (`@common/form/date-picker`)
날짜를 선택할 수 있는 Form Input 컴포넌트입니다.

#### 사용법
```vue
<script setup>
import { DatePicker } from '@common/form/date-picker'

const selectedDate = ref('2026-07-22')
</script>

<template>
  <DatePicker v-model="selectedDate" placeholder="날짜를 선택하세요" />
</template>
```

---

### 3. `Dialog` (`@common/form/dialog`)
모달 및 다이얼로그 관리 컴포넌트 및 Composable입니다.

#### 사용법
```vue
<script setup>
import { CmnDialog, useDialog } from '@common/form/dialog'

const { openDialog, closeDialog } = useDialog()
</script>

<template>
  <CmnDialog />
</template>
```
