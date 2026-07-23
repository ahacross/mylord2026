import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { createVfm } from '@common/form/dialog'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(createVfm())
app.mount('#app')
