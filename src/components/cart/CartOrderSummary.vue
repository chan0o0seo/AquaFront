<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  subtotal: number
  totalShippingFee: number
  totalPrice: number
  checkedCount: number
}>()

const emit = defineEmits<{
  checkout: []
}>()

const router = useRouter()
const isLoading = ref(false)

const handleCheckout = async () => {
  if (props.checkedCount === 0 || isLoading.value) return
  isLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  emit('checkout')
  isLoading.value = false
  // Navigate to checkout page
  router.push('/checkout')
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sky-100 p-6 w-full" v-memo="[checkedCount, totalPrice, isLoading]">
    <h2 class="text-lg font-bold text-slate-900 mb-5">주문 요약</h2>

    <div class="space-y-3">
      <!-- Subtotal -->
      <div class="flex justify-between items-center text-sm">
        <span class="text-slate-600">상품 금액</span>
        <span class="text-slate-800 font-medium">₩{{ subtotal.toLocaleString() }}</span>
      </div>

      <!-- Shipping -->
      <div class="flex justify-between items-center text-sm">
        <span class="text-slate-600">배송비</span>
        <span v-if="totalShippingFee === 0" class="text-emerald-500 font-semibold">무료</span>
        <span v-else class="text-slate-800 font-medium">₩{{ totalShippingFee.toLocaleString() }}</span>
      </div>

      <!-- Divider -->
      <div class="border-t border-sky-100 my-3" />

      <!-- Total -->
      <div class="flex justify-between items-center">
        <span class="font-bold text-slate-900">총 결제금액</span>
        <span class="text-2xl font-black text-sky-600">₩{{ totalPrice.toLocaleString() }}</span>
      </div>
    </div>

    <!-- Shipping Info -->
    <div class="mt-4 bg-sky-50 rounded-xl p-3 border border-sky-100">
      <p class="text-xs text-slate-500 leading-relaxed">
        판매자별 배송비가 적용됩니다. 동일 판매자의 상품은 배송비가 한 번만 부과됩니다.
      </p>
    </div>

    <!-- Escrow Badge -->
    <div class="mt-3 flex items-center gap-2 text-xs text-slate-400">
      <Lock class="w-3 h-3" />
      <span>에스크로 안전결제 · 생물 사체 보상 정책 적용</span>
    </div>

    <!-- Checkout Button -->
    <button
      type="button"
      @click="handleCheckout"
      :disabled="checkedCount === 0 || isLoading"
      class="mt-5 w-full py-4 rounded-full font-bold text-center transition-all duration-200"
      :class="[
        checkedCount === 0 || isLoading
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-sky-500 hover:bg-sky-600 text-white'
      ]"
    >
      <span v-if="isLoading" class="flex items-center justify-center gap-2">
        <Loader2 class="w-4 h-4 animate-spin" />
        처리 중...
      </span>
      <span v-else>{{ checkedCount }}개 상품 주문하기</span>
    </button>

    <!-- Continue Shopping -->
    <button
      type="button"
      @click="router.push('/search')"
      class="mt-3 w-full text-center text-sm text-slate-400 hover:text-sky-500 transition-colors"
    >
      ← 쇼핑 계속하기
    </button>
  </div>
</template>
