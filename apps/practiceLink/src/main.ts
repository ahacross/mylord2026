import { createApp } from 'vue'
import { createVfm, DialogComponent } from '@common/form/dialog'
import { store } from './stores'
import router from './router'
import App from './App.vue'
import './assets/main.scss'

const app = createApp(App)
const vfm = createVfm()

app.use(store)
app.use(router)
app.use(vfm)

app.component('DialogComponent', DialogComponent)
app.mount('#app')
