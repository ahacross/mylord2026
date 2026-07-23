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
        <label class="form-label">
          <span class="label-dot"></span>
          부른 음원 URL
        </label>
        <input v-model="form.url" class="custom-input" @input="(e: any) => (form.url = onInputRemoveQueryString(e.target.value))" />
      </div>

      <div class="form-group part-section">
        <div class="section-title"><span>🎧</span> 파트별 연습 영상 URL</div>
        <div class="part-grid">
          <div v-for="(partItem, idx) in parts" :key="partItem" class="part-input-item">
            <span class="part-badge" :class="`part-badge-${idx % 4}`">{{ partItem }}</span>
            <input
              v-model="tempParts[idx]"
              class="custom-input part-input"
              :placeholder="`${partItem} 연습 URL`"
              @input="(e: any) => (tempParts[idx] = onInputRemoveQueryString(e.target.value))"
            />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">
          <span class="label-dot"></span>
          설명 / 메모
        </label>
        <textarea v-model="form.description" class="custom-textarea" placeholder="무슨 책의 몇번 곡인지 적으세요" rows="3"></textarea>
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
import { parts } from '@/constants/constants'

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
