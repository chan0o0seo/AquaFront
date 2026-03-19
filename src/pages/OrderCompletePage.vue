<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { orderApi, type OrderResponse } from '@/api'
import { CheckCircle, Package, Home, ClipboardList, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route  = useRoute()

const order   = ref<OrderResponse | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  const orderId = route.query.orderId ? Number(route.query.orderId) : null
  if (orderId) {
    try {
      order.value = await orderApi.getOrderDetail(orderId)
    } catch {
      // 조회 실패 시 완료 화면은 그대로 유지
    }
  }
  isLoading.value = false
})
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

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-4">
          <Loader2 class="w-5 h-5 animate-spin text-sky-400" />
        </div>

        <template v-else>
          <!-- 주문번호 -->
          <div class="flex items-center gap-3 text-left">
            <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
              <Package class="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <p class="text-sm text-slate-400">주문번호</p>
              <p class="font-bold text-slate-900">
                ORD-{{ order ? String(order.orderId).padStart(8, '0') : Date.now().toString().slice(-8) }}
              </p>
            </div>
          </div>

          <!-- 주문 상품 목록 -->
          <div v-if="order && order.items.length > 0" class="mt-4 pt-4 border-t border-sky-50 space-y-2 text-left">
            <div
              v-for="item in order.items"
              :key="item.orderItemId"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-slate-600 truncate flex-1 mr-2">{{ item.productName }} × {{ item.quantity }}</span>
              <span class="text-slate-800 font-semibold whitespace-nowrap">
                ₩{{ item.subtotal.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- 결제 금액 -->
          <div v-if="order" class="mt-4 pt-4 border-t border-sky-50">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-400">배송비</span>
              <span class="text-sm text-slate-600">
                {{ order.shippingFee === 0 ? '무료' : `₩${order.shippingFee.toLocaleString()}` }}
              </span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <span class="font-bold text-slate-800">총 결제금액</span>
              <span class="font-black text-sky-600 text-lg">
                ₩{{ order.totalAmount.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- 배송지 -->
          <div v-if="order" class="mt-4 pt-4 border-t border-sky-50 text-left">
            <p class="text-xs text-slate-400 mb-1">배송지</p>
            <p class="text-sm text-slate-700">
              {{ order.recipientName }} · {{ order.phoneNumber }}
            </p>
            <p class="text-sm text-slate-500">
              {{ order.address }}<span v-if="order.detailAddress"> {{ order.detailAddress }}</span>
            </p>
          </div>

          <!-- 주문 조회 실패 시 안내 -->
          <div v-if="!order" class="mt-4 pt-4 border-t border-sky-50">
            <p class="text-sm text-slate-500">주문 내역은 마이페이지에서 확인하실 수 있습니다.</p>
          </div>
        </template>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="router.push('/')"
          class="flex-1 flex items-center justify-center gap-2 py-4 rounded-full border-2 border-sky-200 text-sky-600 font-bold hover:bg-sky-50 transition-colors"
        >
          <Home class="w-5 h-5" />
          홈으로
        </button>
        <button
          type="button"
          @click="router.push('/mypage')"
          class="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors"
        >
          <ClipboardList class="w-5 h-5" />
          주문 내역
        </button>
      </div>
    </div>
  </main>
</template>
