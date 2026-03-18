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

  // auth 초기화는 router beforeEach에서 처리 (중복 호출 방지)
  await router.isReady()

  app.mount('#app')
}

bootstrap()