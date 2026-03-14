<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

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
