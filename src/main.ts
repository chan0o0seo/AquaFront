import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import router from './router'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
  app.use(router)

  // 서비스워커는 권한과 무관하게 앱 시작 시 항상 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {})
  }

  // 앱 마운트 전에 auth 초기화 — 보호된 페이지 플래시 방지
  const { useAuthStore } = await import('@/stores/auth')
  await useAuthStore().fetchMe()

  app.mount('#app')
}

bootstrap()