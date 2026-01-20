import './assets/styles/main.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createHead } from '@unhead/vue/client'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)

const head = createHead()
app.use(head)

app.use(VueQueryPlugin)

app.mount('#app')

registerSW({ immediate: true })
