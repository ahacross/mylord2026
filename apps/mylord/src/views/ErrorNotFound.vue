<template>
  <div class="error-not-found-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-msg">어디가세요??</div>
      <div class="btn-wrapper">
        <router-link to="/" class="home-btn">
          Go Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
definePage({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  meta: {
    requiresAuth: false,
  },
})
</script>

<style scoped>
.error-not-found-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  overflow: hidden;
  z-index: 9999;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.error-code {
  font-size: clamp(80px, 20vh, 180px);
  font-weight: 800;
  line-height: 1;
  margin: 0;
  letter-spacing: -2px;
}

.error-msg {
  font-size: clamp(18px, 4vw, 32px);
  opacity: 0.85;
  margin-top: 16px;
  font-weight: 500;
}

.btn-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  background-color: #ffffff;
  color: #2563eb;
  font-weight: 700;
  font-size: 15px;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
</style>
