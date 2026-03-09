<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CheckCircle, Package, Home, ClipboardList } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goOrders = () => {
  router.push('/mypage')
}
</script>

<template>
  <main class="min-h-screen bg-sky-50 flex items-center justify-center px-6">
    <div class="max-w-md w-full text-center">
      <!-- Success Icon -->
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center">
        <CheckCircle class="w-12 h-12 text-white" />
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-black text-slate-900 mb-2">주문이 완료되었습니다!</h1>
      <p class="text-slate-500 mb-8">
        주문해 주셔서 감사합니다.<br />
        배송 준비가 시작되면 알림을 보내드릴게요.
      </p>

      <!-- Order Info Card -->
      <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
        <div class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
            <Package class="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <p class="text-sm text-slate-400">주문번호</p>
            <p class="font-bold text-slate-900">ORD-{{ Date.now().toString().slice(-8) }}</p>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-sky-50">
          <p class="text-sm text-slate-500">
            주문 내역은 마이페이지에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
            type="button"
            @click="goHome"
            class="flex-1 flex items-center justify-center gap-2 py-4 rounded-full border-2 border-sky-200 text-sky-600 font-bold hover:bg-sky-50 transition-colors"
        >
          <Home class="w-5 h-5" />
          홈으로
        </button>
        <button
            type="button"
            @click="goOrders"
            class="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors"
        >
          <ClipboardList class="w-5 h-5" />
          주문 내역
        </button>
      </div>
    </div>
  </main>
</template>
