<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="py-32 flex flex-col items-center justify-center text-center">
    <div class="w-24 h-24 rounded-full bg-sky-50 flex items-center justify-center mb-6">
      <ShoppingCart class="w-12 h-12 text-sky-300" />
    </div>
    <h2 class="text-2xl font-bold text-slate-700">장바구니가 비어있어요</h2>
    <p class="text-slate-400 mt-2">마음에 드는 생물이나 용품을 담아보세요</p>
    <div class="flex items-center gap-3 mt-8">
      <button
        @click="router.push('/search')"
        class="bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full px-8 py-3 transition-colors duration-200"
      >
        쇼핑 계속하기
      </button>
      <button
        @click="router.push('/auction')"
        class="border border-sky-200 text-sky-600 hover:bg-sky-50 font-bold rounded-full px-8 py-3 transition-colors duration-200"
      >
        실시간 경매 보기
      </button>
    </div>
  </div>
</template>
