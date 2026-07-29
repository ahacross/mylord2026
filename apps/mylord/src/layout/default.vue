<template>
  <div class="app-wrapper">
    <!-- 모던 헤더 앱 바 -->
    <header class="custom-app-bar">
      <button class="app-bar-btn menu-toggle-btn" @click="toggleLeftDrawer">
        <span class="material-icons-outlined">menu</span>
      </button>

      <div class="app-bar-title-area">
        <img src="@/assets/images/logo_white.png" alt="로고" class="app-logo-img" />
        <span class="app-title-text">마이로드</span>
      </div>

      <button v-if="info?.name" class="app-bar-action-btn logout" @click="onClickLogout">로그아웃</button>
      <button v-else class="app-bar-action-btn login" @click="onClickLogin">로그인</button>
    </header>

    <!-- 사이드 메뉴 (드로어) -->
    <div :class="['custom-drawer-container', { open: drawerOpen }]">
      <div class="drawer-overlay" @click="closeDrawer"></div>
      <div class="drawer-body">
        <div v-if="info?.name" class="user-profile-badge">
          <span class="avatar-icon">👤</span>
          <span class="user-name-text">{{ info?.name }}님 환영합니다</span>
        </div>
        <div v-else class="user-profile-badge guest">
          <span class="avatar-icon">🔑</span>
          <span class="user-name-text">로그인 해주세요</span>
        </div>

        <hr class="drawer-divider" />

        <MenuList />
      </div>
    </div>

    <!-- 뷰포트 본문 영역 -->
    <main class="custom-page-container">
      <router-view :key="rerenderCnt" />
    </main>

    <!-- 로그인 팝업 모달 -->
    <div v-if="prompt" class="custom-modal-wrapper">
      <div class="custom-modal-backdrop" @click="prompt = false"></div>
      <div class="custom-modal-card">
        <div class="modal-header">
          <span class="modal-icon">🔐</span>
          <h4 class="modal-title">로그인 인증</h4>
          <p class="modal-desc">휴대폰 번호를 입력하고 로그인하세요.</p>
        </div>
        <div class="modal-body">
          <input
            v-model="phone"
            type="tel"
            autofocus
            maxlength="11"
            placeholder="숫자만 입력 (예: 01012345678)"
            class="custom-phone-input"
            @input="onInput"
            @keyup.enter="prompt = false"
          />
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="prompt = false">취소</button>
          <button class="modal-btn confirm" @click="prompt = false">로그인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MenuList from '@/components/common/MenuList.vue'

const regNum = /[^0-9]/g
const regPhone = /(\d{3})(\d{3,4})(\d{4})/g

const storeCommon = useCommonStore()
const storeUser = useStoreUser()

const { info } = storeToRefs(storeUser)
const { drawerOpen } = storeToRefs(storeCommon)

const toggleLeftDrawer = () => storeCommon.setDrawerOpen(!storeCommon.drawerOpen)
const closeDrawer = () => storeCommon.setDrawerOpen(false)

const onClickLogout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem('mylordId')
    storeUser.setInfo(undefined)
    storeUser.setAuth(undefined)
    location.reload()
  }
}

const onClickLogin = () => {
  prompt.value = true
}

const prompt = ref(false)
const phone = ref('')
const onInput = (e) => {
  let value = e.target.value
  value = value.replace(regNum, '')
  e.target.value = value
  phone.value = value
}

watch(info, async () => {
  if (info.value.member_id) {
    const res = await apiCheckOfficer()
    storeUser.setAuth(res.role)
  }
})

const rerenderCnt = ref(0)
watch(prompt, async () => {
  if (!prompt.value) {
    if (phone.value.length < 10) return
    const res = await apiGetUserInfo({
      phone: phone.value.replace(regPhone, '$1-$2-$3'),
    })
    storeUser.setInfo(res)
    localStorage.setItem('mylordId', res.member_id)
    rerenderCnt.value++
  }
})

onMounted(async () => {
  const member_id = localStorage.getItem('mylordId')
  if (member_id) {
    const res = await apiGetUserInfo({ member_id })
    storeUser.setInfo(res)
  } else {
    prompt.value = true
  }
})
</script>

<style scoped>
/* 드로어 전체 컨테이너 제어 */
.custom-drawer-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  pointer-events: none;
  transition: all 0.3s ease;
}

.custom-drawer-container.open {
  pointer-events: auto;
}

/* 드로어 배경 어둡게 블러 처리 */
.drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.custom-drawer-container.open .drawer-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* 드로어 본체 바디 */
.drawer-body {
  position: absolute;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  box-sizing: border-box;
}

.custom-drawer-container.open .drawer-body {
  transform: translateX(0);
}

/* 유저 프로필 배지 */
.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 0.5rem;
}

.user-profile-badge .avatar-icon {
  font-size: 1.5rem;
  background: rgba(16, 185, 129, 0.08);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile-badge.guest .avatar-icon {
  background: rgba(148, 163, 184, 0.08);
}

.user-profile-badge .user-name-text {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

/* 드로어 구분선 */
.drawer-divider {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin: 0.5rem 1.5rem;
}

/* 모던 앱 바 헤더 */
.custom-app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  padding: 0 1rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
  position: sticky;
  top: 0;
  z-index: 1100;
}

.app-bar-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.app-bar-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.app-bar-title-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-bar-title-area .app-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.app-bar-title-area .app-title-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.app-bar-action-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-bar-action-btn:hover {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 본문 레이아웃 패딩 */
.custom-page-container {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 640px) {
  .custom-page-container {
    padding: 0.75rem 0.5rem;
  }

  .drawer-body {
    width: 82vw;
    max-width: 300px;
  }
}

/* --- 모던 로그인 팝업 모달 스타일 --- */
.custom-modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
}

.custom-modal-card {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  width: calc(100% - 2rem);
  max-width: 380px;
  padding: 1.75rem 1.25rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
  animation: modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: 1rem;
}

.modal-header {
  text-align: center;
}

.modal-header .modal-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.modal-header .modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.modal-header .modal-desc {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.modal-body {
  width: 100%;
}

.custom-phone-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  text-align: center;
  transition: border-color 0.2s ease;
}

.custom-phone-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #475569;
}

.modal-btn.cancel:hover {
  background: #e2e8f0;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.modal-btn.confirm:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

@keyframes modalScaleUp {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
