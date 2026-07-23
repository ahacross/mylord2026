# @common/api

Axios 기반의 HTTP 요청 클라이언트 및 Vue 3 비동기 쿼리 컴포저블(`useQuery`) 패키지입니다.

---

## 📦 주요 기능

1. **API 클라이언트 (`createApiClient` / `api`)**
   - **인증 토큰 자동 주입**: `localStorage`의 Access Token을 `Authorization: Bearer <token>` 헤더로 자동 추가
   - **토큰 자동 갱신 (401 Retry Queue)**: Access Token 만료 시 Refresh Token을 사용해 자동으로 토큰 재발급 후 이전 요청 재시도
   - **GET 요청 응답 캐싱**: `useCache: true` 옵션 사용 시 5분간 메모리 캐시 활용
   - **중복 요청 취소**: `cancelDuplicate: true` 옵션으로 동일 요청 연속 발생 시 이전 요청 자동 취소 (`AbortController`)
   - **공통 에러 핸들링**: 400, 403, 404, 500 등 HTTP 상태 코드별 에러 알림 핸들러 지원 (`setOnErrorAlert`)
   - **엑셀 다운로드 지원**: `api.downloadExcel(...)` 함수로 바이너리 Blob 파일 자동 다운로드 처리

2. **비동기 쿼리 훅 (`useQuery`)**
   - Vue 3 반응형 State (`data`, `isLoading`, `isFinished`, `error`) 및 재조회 함수(`refetch`) 제공
   - `immediate: true` 옵션을 통한 초기 자동 조회 기능 지원

---

## 🚀 사용법

### 1. 기본 API 호출 (`api`)

```typescript
import { api } from '@common/api'

// GET 요청 (기본값)
export const getPraisedHistory = async () => {
  const res = await api.get('/mylord/praised')
  return res.data
}

// POST 요청
export const createPraisedItem = async (data: Record<string, any>) => {
  return await api.post('/mylord/praised', data)
}

// PUT / DELETE 요청
export const updatePraisedItem = async (data: Record<string, any>) => {
  return await api.put('/mylord/praised', data)
}
export const deletePraisedItem = async (id: number) => {
  return await api.delete(`/mylord/praised/${id}`)
}
```

### 2. Vue 컴포저블 훅 (`useQuery`)

```vue
<script setup>
import { useQuery } from '@common/api'
import { getPraisedHistory } from '@/apis/history'

// useQuery 사용 (immediate: true로 설정 시 마운트 시 자동 호출)
const { data, isLoading, error, refetch } = useQuery({
  queryFn: async () => {
    const res = await getPraisedHistory()
    return res.data
  },
  immediate: true,
})
</script>

<template>
  <div v-if="isLoading">로딩 중...</div>
  <div v-else-if="error">에러 발생: {{ error.message }}</div>
  <div v-else>
    <ul>
      <li v-for="item in data" :key="item.id">{{ item.title }}</li>
    </ul>
    <button @click="refetch">새로고침</button>
  </div>
</template>
```

### 3. 커스텀 API 클라이언트 생성 (`createApiClient`)

```typescript
import { createApiClient } from '@common/api'

const customApi = createApiClient({
  baseURL: 'https://api.example.com',
  accessTokenKey: 'my_access_token',
  refreshTokenKey: 'my_refresh_token',
  refreshUrl: '/v1/auth/refresh',
  onSessionExpired: () => {
    alert('로그인이 필요합니다.')
    window.location.href = '/login'
  },
})
```
