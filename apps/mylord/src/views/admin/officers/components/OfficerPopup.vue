<template>
  <DialogComponent v-model="modelValue">
    <template #title>
      <span>{{ data && data.member_id ? '임원 정보 수정' : '임원 등록' }}</span>
    </template>

    <div class="member-form-grid">
      <div class="form-group">
        <label class="form-label">임기년도 <span class="required">*</span></label>
        <DatePicker v-model="form.year" yearPicker model-type="yyyy" :year-range placeholder="임기년도 선택" />
      </div>

      <div class="form-group">
        <label class="form-label">이름 <span class="required">*</span></label>
        <div class="search-input-group">
          <input v-model="tempName" type="text" class="form-input" placeholder="이름 입력 후 검색" @keydown.enter="onClickNameSearch" />
          <button type="button" class="btn-search" @click="onClickNameSearch">검색</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">임기 기간</label>
        <div class="date-range-group">
          <DatePicker v-model="terms.from" placeholder="시작일 선택" />
          <span class="range-separator">~</span>
          <DatePicker v-model="terms.to" placeholder="종료일 선택" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">역할 <span class="required">*</span></label>
        <select v-model="form.role" class="form-select">
          <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div class="form-group full-width">
        <label class="form-label">비고 (etc)</label>
        <textarea v-model="form.etc" class="form-textarea" rows="2" placeholder="비고 입력"></textarea>
      </div>
    </div>

    <template #buttons="{ close }">
      <template v-if="data && data.member_id">
        <button type="button" class="btn-submit" @click="onSave(close)">수정</button>
        <button type="button" class="btn-danger" @click="onRemove(close)">삭제</button>
      </template>
      <button v-else type="button" class="btn-submit" @click="onInsert(close)">추가</button>
      <button type="button" class="btn-cancel" @click="close">취소</button>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
import { DialogComponent } from '@common/form/dialog'
import { DatePicker } from '@common/form/date-picker'
import { useDate } from '@common/utils'

interface Props {
  data?: Record<string, any> | null
}

const $props = withDefaults(defineProps<Props>(), {
  data: null,
})

const modelValue = defineModel<boolean>()
const emits = defineEmits(['close'])
const yearRange = [2000, new Date().getFullYear()] as [number, number]

const tempName = ref('')
const roleOptions = ref(['임원(팀장)', '임원', '파트장', '간식', '의자', '서버관리자'])
const terms = ref({ from: '', to: '' })

const getInitialForm = () => ({
  year: new Date().getFullYear().toString(),
  role: '임원',
  member_id: '',
  etc: '',
})

const form = reactive<Record<string, any>>(getInitialForm())

const initForm = async () => {
  if ($props.data) {
    const { year, role, member_id, etc, name, s_date, e_date } = $props.data
    tempName.value = name || ''
    form.year = year ? String(year) : ''
    form.role = role || '임원'
    form.member_id = member_id || ''
    form.etc = etc || ''
    await nextTick()
    terms.value.from = s_date ? useDate.format(s_date, 'yyyy-MM-dd') : ''
    terms.value.to = e_date ? useDate.format(e_date, 'yyyy-MM-dd') : ''
  } else {
    tempName.value = ''
    terms.value = { from: '', to: '' }
    Object.assign(form, getInitialForm())
  }
}

watch(() => $props.data, initForm, { immediate: true })

watch(
  () => form.year,
  () => {
    if (form.year) {
      const year = String(form.year)
      terms.value = { from: `${year}-01-01`, to: `${year}-12-31` }
    }
  },
)

const onClickNameSearch = async () => {
  if (!tempName.value.trim()) return
  const res = await apiGetUserInfo({ name: tempName.value })
  if (res && res.member_id) {
    form.member_id = res.member_id
    noty.success(`${tempName.value} 님이 확인되었습니다.`)
  } else {
    noty.error('해당 대원을 찾을 수 없습니다.')
  }
}

const validator = () => {
  let message = ''
  if (!form.year) {
    message = '임기년도를 선택해주세요.'
  } else if (!form.role) {
    message = '역할을 선택해주세요.'
  } else if (!tempName.value) {
    message = '이름을 입력해주세요.'
  } else if (!form.member_id) {
    message = '이름을 검색해주세요.'
  }
  return message
}

const makeParams = () => {
  const message = validator()
  if (message) {
    noty.error(message)
    return false
  }

  return {
    ...form,
    s_date: terms.value.from.replace(/[^0-9]/g, ''),
    e_date: terms.value.to.replace(/[^0-9]/g, ''),
    status: 'Y',
  }
}

const onInsert = async (close: () => void) => {
  const params = makeParams()
  if (params && (await apiInsertOfficer(params))) {
    emits('close', true)
    close()
  }
}

const onSave = async (close: () => void) => {
  const params = makeParams()
  if (params && (await apiPutOfficer(params))) {
    emits('close', true)
    close()
  }
}

const onRemove = async (close: () => void) => {
  if ($props.data && (await apiDeleteOfficer($props.data))) {
    emits('close', true)
    close()
  }
}

watch(modelValue, initForm)
</script>

<style lang="scss" src="assets/scss/MemberPopup.scss"></style>
