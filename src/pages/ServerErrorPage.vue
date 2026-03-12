<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Fish, RefreshCw, Home, AlertTriangle } from 'lucide-vue-next'

const router = useRouter()

function retry() {
  window.location.reload()
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
    <!-- Decorative background blobs -->
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

      <!-- Error icon -->
      <div class="relative mx-auto mb-8 w-32 h-32">
        <div class="w-32 h-32 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center">
          <Fish class="w-14 h-14 text-sky-300" />
        </div>
        <div class="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
          <AlertTriangle class="w-5 h-5 text-amber-400" />
        </div>
      </div>

      <!-- Error code -->
      <div class="text-8xl font-black text-sky-100 leading-none mb-2 select-none">500</div>

      <!-- Message -->
      <h1 class="text-2xl font-black text-slate-900 mt-2 mb-3">서버에 문제가 생겼어요</h1>
      <p class="text-slate-500 leading-relaxed mb-10">
        일시적인 오류가 발생했습니다.<br />
        잠시 후 다시 시도해 주세요.
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          @click="retry"
          class="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw class="w-4 h-4" />
          다시 시도
        </button>
        <button
          @click="goHome"
          class="flex items-center gap-2 px-6 py-3 border border-sky-200 text-sky-600 hover:bg-sky-50 font-semibold rounded-full transition-colors w-full sm:w-auto justify-center"
        >
          <Home class="w-4 h-4" />
          홈으로 이동
        </button>
      </div>

      <!-- Support hint -->
      <p class="text-xs text-slate-400 mt-10">
        문제가 계속된다면 고객센터로 문의해 주세요.
      </p>
    </div>
  </div>
</template>
