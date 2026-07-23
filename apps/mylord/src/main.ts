import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { createVfm } from '@common/form/dialog'
import { api } from '@common/api'

api.setBaseURL('/apis')

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(createVfm())
app.mount('#app')
