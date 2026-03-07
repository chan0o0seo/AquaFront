<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <main class="flex-1 flex items-center justify-center py-16 px-4 mt-16">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-lg border border-sky-100 p-10 text-center">
        <!-- Animated Checkmark -->
        <div class="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto">
          <svg 
            class="w-10 h-10 checkmark-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="3" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <path class="checkmark-path" d="M5 12l5 5L20 7" />
          </svg>
        </div>

        <!-- Welcome Message -->
        <h1 class="text-3xl font-black text-slate-900 mt-6">가입을 환영해요!</h1>
        <p class="text-slate-500 mt-2">@아쿠아리스트님의 아쿠아 허브가 시작됩니다</p>

        <!-- CTA Buttons -->
        <div class="flex flex-col gap-3 mt-8">
          <RouterLink
            to="/"
            class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 inline-block"
          >
            쇼핑 시작하기
          </RouterLink>
          <RouterLink
            to="/#auction"
            class="w-full border border-sky-200 text-slate-700 hover:border-sky-400 hover:text-sky-600 rounded-full px-8 py-3 transition-all duration-200 inline-block"
          >
            경매 구경하기
          </RouterLink>
        </div>

        <!-- Helper Text -->
        <p class="text-xs text-slate-400 mt-6">
          입점 또는 브리더 등록은 마이페이지에서 완료할 수 있어요
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.checkmark-icon {
  color: #0EA5E9;
}

.checkmark-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: drawStroke 0.6s ease-out forwards;
}

@keyframes drawStroke {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
