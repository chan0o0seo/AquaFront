<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { listenForegroundMessage } from '@/composables/useFcm'

const { isLoggedIn } = storeToRefs(useAuthStore())
const notificationStore = useNotificationStore()

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    notificationStore.load()
    notificationStore.connect()
  } else {
    notificationStore.disconnect()
  }
}, { immediate: true })

// 앱이 포그라운드일 때 FCM 메시지 수신 → 브라우저 알림 직접 표시
let unsubscribeFcm: (() => void) | null = null

onMounted(() => {
  unsubscribeFcm = listenForegroundMessage((title, body) => {
    if (Notification.permission !== 'granted') return
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, { body, icon: '/favicon.ico' })
    })
  })
})

onUnmounted(() => {
  unsubscribeFcm?.()
})
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <AppNavbar />
    <div class="flex-1 min-h-[calc(120vh-4rem)]">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <AppFooter />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
