import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 퀘이사 store wrapper를 제거하고 표준 Pinia 인스턴스 생성 및 상태 지속 플러그인 등록
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
setActivePinia(pinia)

export default pinia
