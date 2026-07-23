<template>
  <DialogComponent v-model="modelValue">
    <template #title>
      <span>{{ data ? '대원 정보 수정' : '대원 등록' }}</span>
    </template>

    <div class="member-form-grid">
      <div class="form-group">
        <label class="form-label">이름 <span class="required">*</span></label>
        <input v-model="form.name" type="text" class="form-input" placeholder="이름" />
      </div>

      <div class="form-group">
        <label class="form-label">역할</label>
        <select v-model="form.part" class="form-select">
          <option v-for="opt in partsOption" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">휴대폰 번호</label>
        <input v-model="form.phone" type="tel" class="form-input" placeholder="010-0000-0000" />
      </div>

      <div class="form-group">
        <label class="form-label">생일</label>
        <DatePicker v-model="form.birthday" placeholder="생일" />
      </div>

      <div class="form-group">
        <label class="form-label">이메일</label>
        <input v-model="form.email" type="email" class="form-input" placeholder="이메일" />
      </div>

      <div class="form-group">
        <label class="form-label">상태</label>
        <select v-model="form.status" class="form-select">
          <option v-for="opt in memberStatus" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">차량 번호</label>
        <input v-model="form.car" type="text" class="form-input" placeholder="차량 번호" />
      </div>

      <div class="form-group">
        <label class="form-label">성가대 등록일</label>
        <DatePicker v-model="form.regi_date" placeholder="성가대 등록일" />
      </div>

      <div class="form-group full-width">
        <label class="form-label">비고</label>
        <textarea v-model="form.comment" class="form-textarea" rows="2" placeholder="비고"></textarea>
      </div>
    </div>

    <template #buttons="{ close }">
      <button v-if="data" type="button" class="btn-submit" @click="onSave(close)">수정</button>
      <button v-else type="button" class="btn-submit" @click="onInsert(close)">추가</button>
      <button type="button" class="btn-cancel" @click="close">취소</button>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">
import { DialogComponent } from '@common/form/dialog'
import { DatePicker } from '@common/form/date-picker'
import { useDate } from '@common/utils'
import { memberStatus } from '@/constants/constants'

interface Props {
  data?: Record<string, any> | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const modelValue = defineModel<boolean>()
const emits = defineEmits(['close'])

const partsOption = [
  { label: '소프라노', value: 's' },
  { label: '알토', value: 'a' },
  { label: '테너', value: 't' },
  { label: '베이스', value: 'b' },
  { label: '반주자', value: '반주자' },
  { label: '지휘자', value: '지휘자' },
  { label: '목사님', value: '목사님' },
]

const getInitialForm = () => ({
  member_id: undefined,
  name: '',
  part: 's',
  phone: '',
  birthday: '',
  email: '',
  status: 'Y',
  regi_date: useDate.format(new Date(), 'yyyyMMdd'),
  car: '',
  comment: '',
})

const form = reactive<Record<string, any>>(getInitialForm())

const initForm = () => {
  if (props.data) {
    const keys = Object.keys(getInitialForm())
    keys.forEach((key) => {
      if (['birthday', 'regi_date'].includes(key) && props.data?.[key]) {
        form[key] = useDate.format(props.data[key], 'yyyyMMdd')
      } else if (props.data?.[key] !== undefined) {
        form[key] = props.data[key]
      } else {
        form[key] = (getInitialForm() as Record<string, any>)[key]
      }
    })
    form.member_id = props.data.member_id
  } else {
    Object.assign(form, getInitialForm())
  }
}

watch(() => props.data, initForm, { immediate: true })

const validator = () => {
  let message = ''
  if (!form.name) {
    message = '이름을 입력해주세요.'
  }
  return message
}

const makeParams = () => {
  const message = validator()
  if (message) {
    noty.error(message)
    return false
  }

  const params: Record<string, any> = { ...form }
  const tempKeys = ['birthday', 'regi_date']
  tempKeys.forEach((key) => {
    if (params[key]) {
      params[key] = String(params[key])
        .replace('Invalid Date', '')
        .replace(/[^0-9]/g, '')
    }
  })

  return params
}

const onInsert = async (close: () => void) => {
  const params = makeParams()
  if (params && (await apiInsertMember(params))) {
    emits('close', true)
    close()
  }
}

const onSave = async (close: () => void) => {
  const params = makeParams()
  if (params && (await apiPutMember(params))) {
    emits('close', true)
    close()
  }
}

// watch(modelValue, initForm)
</script>

<style lang="scss" src="assets/scss/MemberPopup.scss"></style>
