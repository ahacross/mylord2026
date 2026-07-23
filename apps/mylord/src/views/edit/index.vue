<template>
  <div class="edit-page-container">
    <div class="edit-card">
      <!-- 헤더 프로필 & 정보 타이틀 -->
      <div class="card-header">
        <div class="avatar-badge">
          <span class="avatar-icon">👤</span>
        </div>
        <div class="header-info">
          <h1 class="page-title">개인정보 수정</h1>
          <p class="page-subtitle">마이로드 대원 정보(이름, 연락처, 생일)를 최신으로 관리하세요.</p>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 폼 입력 영역 -->
      <div class="form-section">
        <!-- 이름 입력 -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-dot"></span>
            이름
          </label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input v-model="form.name" class="custom-input" placeholder="이름을 입력하세요" />
          </div>
        </div>

        <!-- 연락처 입력 -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-dot"></span>
            휴대폰 번호
          </label>
          <div class="input-wrapper">
            <span class="input-icon">📱</span>
            <input v-model="form.phone" type="tel" class="custom-input" placeholder="010-0000-0000" />
          </div>
        </div>

        <!-- 생일 선택 -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-dot"></span>
            생일
          </label>
          <div class="input-wrapper">
            <DatePicker v-model="form.birthday" placeholder="생일을 선택하세요" :year-range="[1930, 2050]" :clearable="false" class="custom-datepicker" />
          </div>
        </div>
      </div>

      <!-- 하단 저장 버튼 -->
      <div class="card-actions">
        <button type="button" class="btn-save" @click="onSave">
          <span class="btn-icon">💾</span>
          <span>저장하기</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'edit',
  meta: {
    requiresAuth: true,
  },
})

import { DatePicker } from '@common/form/date-picker'
import { useQuery } from '@common/api'
import noty from '@common/form/noty'

const form = reactive({
  name: '',
  phone: '',
  birthday: '',
})

const tempInfo = ref({})

const onSave = async () => {
  const birthday = form.birthday ? form.birthday.replace(/-/g, '') : ''
  const params = { ...tempInfo.value, ...form, birthday }
  if (await apiPutMember(params)) {
    await noty.success('개인정보가 성공적으로 저장되었습니다.')
  }
}

const {
  info: { member_id },
} = useStoreUser()

useQuery({
  queryFn: async () => {
    tempInfo.value = await apiGetUserInfo({ member_id })
    const { name, phone, birthday } = tempInfo.value
    form.name = name
    form.phone = phone
    form.birthday = birthday
  },
  immediate: true,
})
</script>

<style scoped lang="scss" src="@/assets/scss/EditPage.scss"></style>
