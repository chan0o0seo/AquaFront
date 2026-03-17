<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const error = route.query.error
  if (error) {
    router.replace('/login?error=oauth')
    return
  }

  try {
    await authStore.fetchMe()
    router.replace('/')
  } catch {
    router.replace('/login?error=oauth')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-4 text-slate-500">
      <span class="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm">로그인 처리 중...</p>
    </div>
  </div>
</template>
