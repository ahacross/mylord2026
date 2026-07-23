# @common/utils

유용한 공통 유틸리티 함수, 날짜 연산, 엑셀 처리 및 `es-toolkit` 재내보내기 패키지입니다.

---

## 📦 주요 유틸리티

### 1. `useDate`
`date-fns` 기반의 날짜 연산 및 포맷팅 헬퍼 객체입니다. (한국어 locale 기본 적용)

#### 주요 메서드
- `getDate(date, template)`: 문자열/숫자/Date 객체를 표준 Date 객체로 변환
- `plus(amount, unit, date)`: 지정한 단위(year, month, day, hour 등)만큼 날짜 더하기
- `minus(amount, unit, date)`: 지정한 단위만큼 날짜 빼기
- `diff(date, unit)`: 현재 시각과 지정 날짜 간의 차이 계산
- `diff2(date1, date2, unit)`: 두 날짜 간의 차이 계산
- `endOf(date, unit)`: 해당 연도/월/일의 마지막 시각 반환
- `format(date, template)`: 날짜 포맷팅 (예: `yyyy-MM-dd (E)`)

#### 사용법
```typescript
import { useDate, DATE_TEMPLATE } from '@common/utils'

// 오늘 날짜 포맷팅
console.log(useDate.format(new Date(), DATE_TEMPLATE.DATE.DASH_DAY)) // 예: "2026-07-22 (수)"

// 7일 전 날짜 구하기
const pastDate = useDate.minus(7, 'days')

// 두 날짜 간 차이 (일 단위)
const daysDiff = useDate.diff2('2026-07-22', '2026-07-01', 'days') // 21
```

---

### 2. `useExcel`
`xlsx` 라이브러리를 동적 로딩하여 Excel 파일 읽기/쓰기 기능을 제공하는 컴포저블 함수입니다.

#### 주요 메서드
- `convertExcelToJson(file, columns, columnFn)`: 업로드한 Excel 파일을 JSON 객체 배열로 변환
- `exportJsonToExcel(data, fileName, sheetName)`: JSON 객체 배열을 Excel `.xlsx` 파일로 변환하여 브라우저 자동 다운로드

#### 사용법
```typescript
import { useExcel } from '@common/utils'

const { exportJsonToExcel, convertExcelToJson } = useExcel()

// 1. JSON 데이터를 엑셀로 다운로드
const handleDownload = () => {
  const list = [
    { 이름: '홍길동', 부서: '개발팀' },
    { 이름: '김철수', 부서: '디자인팀' },
  ]
  exportJsonToExcel(list, '임직원_목록', 'Sheet1')
}

// 2. 엑셀 파일 읽기 (업로드)
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const columns = [
    { headerName: '이름', field: 'name' },
    { headerName: '부서', field: 'dept' },
  ]

  const jsonData = await convertExcelToJson(file, columns, (rows) => rows)
  console.log('변환된 데이터:', jsonData)
}
```

---

### 3. `useUtil`
기초 공통 유틸리티 함수 모음입니다.

#### 주요 메서드
- `delay(time)`: 지정된 시간(ms) 동안 대기하는 Promise 반환 (`await useUtil.delay(1000)`)
- `genId(length, prefix)`: 랜덤 아이디 문자열 생성
- `comma(num)`: 숫자에 3자리 단위 콤마(천 단위 구분기호) 추가 (`useUtil.comma(1000000)` => `"1,000,000"`)

#### 사용법
```typescript
import { useUtil } from '@common/utils'

// 1초 딜레이
await useUtil.delay(1000)

// 천 단위 콤마
console.log(useUtil.comma(1250000)) // "1,250,000"

// 랜덤 ID 생성
console.log(useUtil.genId(6, 'USER_')) // 예: "USER_a8f9x2"
```

---

### 4. `es-toolkit` 내보내기
고성능 모던 유틸리티 라이브러리인 `es-toolkit`의 모든 함수(e.g., `debounce`, `throttle`, `chunk`, `pick`, `omit` 등)를 `@common/utils`에서 바로 사용할 수 있습니다.

```typescript
import { debounce, pick } from '@common/utils'
```
