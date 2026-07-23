<template>
  <DialogComponent v-model="modelValue">
    <!-- 헤더 제목 -->
    <template #title>
      <div class="header-title-container">
        <span class="header-icon">🎧</span>
        <div class="header-text-group">
          <span class="header-text">연습 파트 선택</span>
          <span v-if="songTitle" class="header-sub-text">곡명: {{ songTitle }}</span>
        </div>
      </div>
    </template>

    <!-- 팝업 본문 -->
    <div class="popup-body-container">
      <div class="part-select-grid">
        <button v-for="(pt, idx) in parts" :key="pt" type="button" class="part-select-btn" @click="onSelect(idx)">
          <span class="part-badge" :class="`part-badge-${idx % 4}`">{{ pt }}</span>
          <span class="part-label-text">{{ pt }} 연습 영상 보기</span>
          <span class="part-arrow-icon">➔</span>
        </button>
      </div>
    </div>

    <!-- 하단 버튼 영역 -->
    <template #buttons="{ close }">
      <div class="button-group">
        <button class="btn btn-secondary" @click="onClose(close)">취소</button>
      </div>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
import { DialogComponent } from '@common/form/dialog'
import { parts } from '@/constants'

const modelValue = defineModel<boolean>()

const props = defineProps<{
  data?: any
}>()

const songTitle = computed(() => props.data?.title || '')

const onSelect = (partIdx: number) => {
  window.open(props.data.practice_url.split(',').at(partIdx), '_blank')
  modelValue.value = false
}

const onClose = (close: () => void) => {
  close()
}
</script>

<style scoped lang="scss" src="@/assets/scss/components/PartPopup.scss"></style>
