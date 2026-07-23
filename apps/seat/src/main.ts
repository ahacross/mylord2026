import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import './assets/main.scss'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 카카오톡 SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(import.meta.env.VITE_KAKAO_KEY)
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
