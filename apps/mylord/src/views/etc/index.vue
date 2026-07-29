<template>
  <div class="etc-page-container">
    <div class="etc-card">
      <!-- 카드 헤더 영역 -->
      <div class="card-header">
        <div class="header-left">
          <div class="header-badge">
            <span class="header-icon">📋</span>
          </div>
          <div class="header-info">
            <h1 class="page-title">기타 안내 및 정보</h1>
            <p class="page-subtitle">마이로드 찬양대의 정관 문서 및 주요 장소 안내 정보입니다.</p>
          </div>
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- 안내 항목 영역 -->
      <div class="info-section">
        <!-- 마이로드 정관 카드리스트 -->
        <div class="info-item-card">
          <div class="item-left">
            <div class="item-icon-box pdf-icon">
              <span>📄</span>
            </div>
            <div class="item-content">
              <span class="item-title">마이로드 정관</span>
              <span class="item-desc">찬양대 운영 규정 및 정관 PDF (176KB)</span>
            </div>
          </div>
          <a
            href="https://ahacross.me/down/mylord/%EB%A7%88%EC%9D%B4%EB%A1%9C%EB%93%9C%20%EC%A0%95%EA%B4%80.pdf"
            target="_blank"
            class="item-btn btn-pdf"
          >
            <span>정관 열기</span>
            <span>↗</span>
          </a>
        </div>

        <!-- 주차장 안내 카드리스트 -->
        <div class="info-item-card">
          <div class="item-left">
            <div class="item-icon-box map-icon">
              <span>🅿️</span>
            </div>
            <div class="item-content">
              <span class="item-title">망원1주차장 (한강공원)</span>
              <span class="item-desc">서울 마포구 합정동 352-5</span>
            </div>
          </div>
          <a
            href="https://naver.me/5pHRJ0pX"
            target="_blank"
            class="item-btn btn-map"
          >
            <span>지도보기</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  name: 'etc',
  meta: {
    requiresAuth: true,
  },
})
</script>

<style scoped lang="scss" src="@/assets/scss/EtcPage.scss"></style>
