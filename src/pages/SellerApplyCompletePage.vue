<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

const router = useRouter()

const goToMyPage = () => {
  router.push('/mypage')
}
</script>

<template>
  <main class="min-h-screen bg-sky-50 pt-24 pb-16 flex items-center justify-center">
    <div class="max-w-md mx-auto px-6 text-center">
      <!-- Success Animation -->
      <div class="w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg 
          class="w-14 h-14 text-emerald-500" 
          viewBox="0 0 52 52"
        >
          <circle 
            class="stroke-current" 
            cx="26" 
            cy="26" 
            r="24" 
            fill="none" 
            stroke-width="3"
            style="stroke-dasharray: 166; stroke-dashoffset: 0; animation: circle 0.6s ease-in-out"
          />
          <path 
            class="stroke-current" 
            fill="none" 
            stroke-width="4" 
            stroke-linecap="round"
            d="M14 27l8 8 16-16"
            style="stroke-dasharray: 48; stroke-dashoffset: 0; animation: check 0.3s 0.6s ease-in-out forwards"
          />
        </svg>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-black text-slate-900">
        신청이 완료되었습니다!
      </h1>

      <!-- Description -->
      <p class="text-slate-500 mt-4">
        보통 1~3 영업일 내에 검토 후 결과를 알려드립니다.
      </p>

      <!-- Info Box -->
      <div class="mt-6 bg-white rounded-2xl p-5 border border-sky-100">
        <p class="text-sm text-slate-600">
          마이페이지에서 신청 현황을 확인하세요
        </p>
      </div>

      <!-- Button -->
      <button
        @click="goToMyPage"
        class="mt-8 inline-flex items-center gap-2 px-8 py-4 text-sky-600 font-semibold hover:text-sky-700 transition-colors"
      >
        마이페이지로 이동
        <ArrowRight class="w-5 h-5" />
      </button>
    </div>
  </main>
</template>

<style scoped>
@keyframes circle {
  from {
    stroke-dashoffset: 166;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes check {
  from {
    stroke-dashoffset: 48;
  }
  to {
    stroke-dashoffset: 0;
  }
}

svg circle {
  animation: circle 0.6s ease-in-out forwards;
}

svg path {
  stroke-dashoffset: 48;
  animation: check 0.3s 0.6s ease-in-out forwards;
}
</style>
