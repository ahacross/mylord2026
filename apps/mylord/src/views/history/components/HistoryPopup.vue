<template>
  <DialogComponent v-model="modelValue">
    <!-- 헤더 제목 -->
    <template #title>
      <div class="header-title-container">
        <span class="header-icon">🎵</span>
        <span class="header-text">마이로드 찬양</span>
      </div>
    </template>

    <!-- 팝업 본문 -->
    <div class="popup-body-container">
      <div class="form-group">
        <label class="form-label">
          <span class="label-dot"></span>
          부른 날
        </label>

        <DatePicker
          v-model="form.praised_day"
          model-type="yyyy-MM-dd"
          :no-today="false"
          now-button-label="오늘"
          placeholder="부른 날을 선택하세요"
          :clearable="false"
          class="custom-datepicker"
        />
      </div>

      <div class="form-group">
        <label class="form-label">
          <span class="label-dot"></span>
          곡 제목
        </label>
        <input v-model="form.title" class="custom-input" placeholder="곡 제목을 입력하세요" />
      </div>

      <div class="form-group">
        <div class="label-with-action">
          <label class="form-label">
            <span class="label-dot"></span>
            부른 음원 URL
          </label>
          <button type="button" class="btn-search-url" @click="onSearchYoutube">
            <span>🔍 유튜브 영상 찾기</span>
          </button>
        </div>
        <input v-model="form.url" class="custom-input" placeholder="YouTube 공유 링크 (예: https://youtu.be/...)" @input="(e: any) => (form.url = onInputRemoveQueryString(e.target.value))" />
      </div>

      <div class="form-group part-section">
        <div class="section-title-container">
          <div class="section-title"><span>🎧</span> 파트별 연습 영상 URL</div>
          <button
            type="button"
            class="btn-batch-part"
            :disabled="isBatchSearchingParts || !form.title"
            @click="onBatchSearchParts"
          >
            <span v-if="isBatchSearchingParts" class="yt-spinner small"></span>
            <span v-else>⚡</span>
            <span>{{ isBatchSearchingParts ? '파트 검색 중...' : '전체 파트 자동 찾기' }}</span>
          </button>
        </div>

        <div class="part-grid">
          <div v-for="(partItem, idx) in parts" :key="partItem" class="part-input-item">
            <span class="part-badge" :class="`part-badge-${idx % 4}`">{{ partItem }}</span>
            <input
              v-model="tempParts[idx]"
              class="custom-input part-input"
              :placeholder="`${partItem} 연습 URL`"
              @input="(e: any) => (tempParts[idx] = onInputRemoveQueryString(e.target.value))"
            />
            <button
              type="button"
              class="btn-part-search"
              title="유튜브에서 검색"
              @click="onSearchPartYoutube(idx)"
            >
              🔍
            </button>
          </div>
        </div>
      </div>

      <!-- 설명 / 메모 -->
      <div class="form-group">
        <label class="form-label">
          <span class="label-dot"></span>
          설명 / 메모
        </label>
        <textarea v-model="form.description" class="custom-textarea" placeholder="무슨 책의 몇번 곡인지 적으세요" rows="3"></textarea>
      </div>
    </div>

    <!-- 유튜브 간이 검색 서브 모달 -->
    <div v-if="isOpenYoutubeSearch" class="yt-search-overlay" @click.self="isOpenYoutubeSearch = false">
      <div class="yt-search-modal">
        <div class="yt-search-header">
          <div class="yt-title">
            <span>🎬 YouTube 영상 찾기</span>
          </div>
          <button type="button" class="btn-close-yt" @click="isOpenYoutubeSearch = false">✕</button>
        </div>

        <div class="yt-search-form">
          <input
            v-model="ytSearchQuery"
            class="custom-input yt-input"
            placeholder="검색어를 입력하세요"
            @keydown.enter="execYtSearch"
          />
          <button type="button" class="btn btn-primary btn-search-go" :disabled="isSearchingYt" @click="execYtSearch">
            {{ isSearchingYt ? '검색 중...' : '검색' }}
          </button>
        </div>

        <div class="yt-results-box">
          <div v-if="isSearchingYt" class="yt-loading">
            <span class="yt-spinner"></span>
            <span>영상을 검색하고 있습니다...</span>
          </div>

          <div v-else-if="ytResults.length === 0" class="yt-empty">
            검색된 영상이 없습니다. 검색어를 수정해보세요.
          </div>

          <div
            v-for="item in ytResults"
            :key="item.videoId"
            class="yt-result-item"
            @click="selectYtVideo(item)"
          >
            <img :src="item.thumbnailUrl" class="yt-thumb" alt="thumbnail" />
            <div class="yt-info">
              <div class="yt-video-title">{{ item.title }}</div>
              <div class="yt-video-meta">{{ item.channelTitle }}</div>
            </div>
            <div class="yt-action">
              <a :href="item.shareUrl" target="_blank" class="yt-preview-btn" @click.stop>
                재생 ▶
              </a>
              <button type="button" class="btn btn-sm btn-primary" @click.stop="selectYtVideo(item)">
                선택
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 영역 -->
    <template #buttons="{ close }">
      <div class="button-group">
        <template v-if="data">
          <button class="btn btn-primary" @click="onSave(close)">수정</button>
          <button class="btn btn-danger" @click="onRemove(close)">삭제</button>
        </template>
        <button v-else class="btn btn-primary" @click="onInsert(close)">추가</button>
        <button class="btn btn-secondary" @click="close">취소</button>
      </div>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
import { DialogComponent } from '@common/form/dialog'
import { DatePicker } from '@common/form/date-picker'

import { useDate } from '@common/utils'
import { noty } from '@common/form/noty'
import { parts } from '@/constants'
import {
  searchYoutubeVideos,
  buildSearchQuery,
  buildPartSearchQuery,
  rankYoutubeSearchResults,
  getStoredApiKey,
  type YouTubeSearchResult,
  type SearchRankingCriteria,
} from '@/apis/youtube'

const modelValue = defineModel<boolean>()
const emit = defineEmits(['close'])

const props = defineProps<{
  data?: any
}>()

const form = reactive({
  praised_day: '',
  title: '',
  url: '',
  practice_url: '',
  description: '',
})

const tempParts = reactive(Array.from({ length: parts.length }, () => ''))
watch(tempParts, () => (form.practice_url = tempParts.join(',')))

// 유튜브 검색 모달 상태
const isOpenYoutubeSearch = ref(false)
const searchTarget = ref<'main' | number>('main')
const ytSearchQuery = ref('')
const ytResults = ref<YouTubeSearchResult[]>([])
const isSearchingYt = ref(false)
const isBatchSearchingParts = ref(false)

const checkApiKey = (): boolean => {
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    const entered = prompt('YouTube Data API Key가 설정되지 않았습니다.\nAPI 키를 입력해주세요:')
    if (entered && entered.trim()) {
      localStorage.setItem('mylord_youtube_api_key', entered.trim())
      return true
    }
    return false
  }
  return true
}

// 부른 음원 영상 검색
const onSearchYoutube = () => {
  if (!checkApiKey()) return
  searchTarget.value = 'main'
  ytSearchQuery.value = buildSearchQuery(form.title, form.praised_day)
  isOpenYoutubeSearch.value = true
  execYtSearch()
}

// 개별 파트 연습 영상 검색
const onSearchPartYoutube = (idx: number) => {
  if (!checkApiKey()) return
  searchTarget.value = idx
  const partName = parts[idx] || ''
  ytSearchQuery.value = buildPartSearchQuery(form.title, form.description, partName)
  isOpenYoutubeSearch.value = true
  execYtSearch()
}

// 전체 파트 일괄 자동 검색
const onBatchSearchParts = async () => {
  if (!form.title?.trim()) {
    noty.warning('곡 제목을 먼저 입력해주세요.')
    return
  }
  if (!checkApiKey()) return

  isBatchSearchingParts.value = true
  let successCount = 0

  try {
    for (let idx = 0; idx < parts.length; idx++) {
      const partName = parts[idx]
      const query = buildPartSearchQuery(form.title, form.description, partName)
      // 10개 후보군을 가져와 책이름, 곡명, 파트(합창=SATB) 유사도 기반으로 정렬 후 1위 적용
      const rawResults = await searchYoutubeVideos(query, undefined, 10)
      const criteria: SearchRankingCriteria = {
        book: form.description,
        title: form.title,
        part: partName,
        query,
      }
      const ranked = rankYoutubeSearchResults(rawResults, criteria)
      if (ranked.length > 0) {
        tempParts[idx] = ranked[0].shareUrl
        successCount++
      }
    }
    noty.success(`총 ${successCount}개 파트의 연습 영상이 입력되었습니다.`)
  } catch (err: any) {
    noty.error(err?.response?.data?.error?.message || err?.message || '파트 검색 중 오류가 발생했습니다.')
  } finally {
    isBatchSearchingParts.value = false
  }
}

const execYtSearch = async () => {
  if (!ytSearchQuery.value.trim()) return
  isSearchingYt.value = true
  try {
    const rawResults = await searchYoutubeVideos(ytSearchQuery.value.trim(), undefined, 15)
    const currentPart = typeof searchTarget.value === 'number' ? parts[searchTarget.value] : undefined
    const criteria: SearchRankingCriteria = {
      book: form.description,
      title: form.title,
      part: currentPart,
      query: ytSearchQuery.value.trim(),
    }
    ytResults.value = rankYoutubeSearchResults(rawResults, criteria)
  } catch (err: any) {
    noty.error(err?.response?.data?.error?.message || err?.message || '검색 중 오류가 발생했습니다.')
  } finally {
    isSearchingYt.value = false
  }
}

const selectYtVideo = (item: YouTubeSearchResult) => {
  if (searchTarget.value === 'main') {
    form.url = item.shareUrl
    noty.success('부른 음원 영상 링크가 적용되었습니다.')
  } else if (typeof searchTarget.value === 'number') {
    tempParts[searchTarget.value] = item.shareUrl
    const partName = parts[searchTarget.value] || '파트'
    noty.success(`${partName} 연습 영상 링크가 적용되었습니다.`)
  }
  isOpenYoutubeSearch.value = false
}

const onInputRemoveQueryString = (val?: string) => val?.split('?')?.at(0) || val || ''

const onInsert = async (close: () => void) => {
  if (await apiInsertHistory(form)) {
    emit('close', form)
    close()
  }
}

const onSave = async (close: () => void) => {
  if (await apiPutHistory({ ...form, seq: props.data?.seq })) {
    emit('close', form)
    close()
  }
}

const onRemove = async (close: () => void) => {
  if (await apiDeleteHistory({ ...form, seq: props.data?.seq })) {
    emit('close', form)
    close()
  }
}

const resetForm = () => {
  form.praised_day = useDate.format(null, 'yyyy-MM-dd')
  form.title = ''
  form.url = ''
  form.practice_url = ''
  form.description = ''
  tempParts.fill('')
}

watch(modelValue, (val) => {
  if (val) {
    resetForm()
    if (props.data) {
      const arr = ['praised_day', 'title', 'url', 'practice_url', 'description']
      arr.forEach((key) => {
        if (props.data[key]) {
          if (key === 'practice_url') {
            const partsArr = props.data[key].split(',')
            partsArr.forEach((part: string, idx: number) => {
              if (idx < tempParts.length) {
                tempParts[idx] = part
              }
            })
            form.practice_url = props.data[key]
          } else {
            ;(form as any)[key] = props.data[key]
          }
        }
      })
    }
  } else {
    resetForm()
  }
})
</script>

<style scoped lang="scss" src="@/assets/scss/components/HistoryPopup.scss"></style>
