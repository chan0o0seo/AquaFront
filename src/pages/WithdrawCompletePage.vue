<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Fish, Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-sky-50 rounded-full opacity-60"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-50 rounded-full opacity-60"></div>
    </div>

    <div class="relative text-center max-w-md">
      <!-- Logo -->
      <div class="flex items-center justify-center gap-2 mb-12">
        <Fish class="w-7 h-7 text-sky-500" />
        <span class="text-xl font-bold text-sky-600">아쿠아 Hub</span>
      </div>

      <!-- Icon -->
      <div class="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-8">
        <Fish class="w-12 h-12 text-slate-300" />
      </div>

      <!-- Message -->
      <h1 class="text-2xl font-black text-slate-900 mb-3">탈퇴가 완료됐어요</h1>
      <p class="text-slate-500 leading-relaxed mb-10">
        그동안 아쿠아 Hub를 이용해 주셔서 감사합니다.<br />
        언제든지 다시 찾아오세요.
      </p>

      <!-- Action -->
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors"
      >
        <Home class="w-4 h-4" />
        홈으로 이동
      </button>
    </div>
  </div>
</template>
