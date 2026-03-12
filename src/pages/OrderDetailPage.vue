<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, MapPin, CreditCard, Loader2 } from 'lucide-vue-next'
import { orderApi, ORDER_STATUS_LABEL, type OrderResponse, type OrderStatus } from '@/api'

const router = useRouter()
const route = useRoute()

const order = ref<OrderResponse | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    order.value = await orderApi.getOrderDetail(Number(route.params.orderId))
  } catch (e) {
    console.error('Failed to load order detail', e)
  } finally {
    isLoading.value = false
  }
})

// 상태 배지
const statusBadgeClass = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    PENDING:   'bg-amber-100 text-amber-600',
    PAID:      'bg-sky-100 text-sky-600',
    SHIPPING:  'bg-blue-100 text-blue-600',
    DELIVERED: 'bg-emerald-100 text-emerald-600',
    CONFIRMED: 'bg-green-100 text-green-600',
    CANCELLED: 'bg-slate-100 text-slate-500',
  }
  return map[status]
}

// 스테퍼
const STEPS: OrderStatus[] = ['PAID', 'SHIPPING', 'DELIVERED', 'CONFIRMED']
const STEP_LABELS: Record<OrderStatus, string> = {
  PENDING:   '결제 대기',
  PAID:      '결제완료',
  SHIPPING:  '배송중',
  DELIVERED: '배송완료',
  CONFIRMED: '구매확정',
  CANCELLED: '취소됨',
}

type StepState = 'completed' | 'current' | 'pending'

const stepperSteps = computed<{ status: OrderStatus; label: string; state: StepState }[]>(() => {
  const status = order.value?.status
  const currentIndex = status ? STEPS.indexOf(status) : -1
  return STEPS.map((s, i) => ({
    status: s,
    label: STEP_LABELS[s],
    state: currentIndex === -1 ? 'pending'
      : i < currentIndex ? 'completed'
      : i === currentIndex ? 'current'
      : 'pending',
  }))
})

const productPrice = computed(() =>
  order.value ? order.value.totalAmount - order.value.shippingFee : 0
)

const formatPrice = (n: number) => n.toLocaleString('ko-KR') + '원'

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 구매 확정
const isConfirming = ref(false)
const handleConfirm = async () => {
  if (!order.value) return
  isConfirming.value = true
  try {
    await orderApi.confirmOrder(order.value.orderId)
    order.value = { ...order.value, status: 'CONFIRMED' }
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '구매 확정에 실패했습니다.')
  } finally {
    isConfirming.value = false
  }
}

// 주문 취소
const showCancelConfirm = ref(false)
const handleCancel = async () => {
  if (!order.value) return
  try {
    await orderApi.cancelOrder(order.value.orderId)
    order.value = { ...order.value, status: 'CANCELLED' }
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '주문 취소에 실패했습니다.')
  } finally {
    showCancelConfirm.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-2xl mx-auto px-6 py-12 mt-16">

      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-1 text-sm text-slate-400 hover:text-sky-500 transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        주문 내역
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-24">
        <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
      </div>
      <div v-else-if="!order" class="text-center py-24 text-slate-400">주문 정보를 불러올 수 없습니다.</div>

      <template v-else>
        <!-- Section 1: 주문 상태 -->
        <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-4">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-slate-400">주문번호</span>
            <span class="text-sm text-slate-700 font-mono">#{{ order.orderId }}</span>
          </div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs text-slate-400">주문일시</span>
            <span class="text-sm text-slate-700">{{ formatDate(order.createdAt) }}</span>
          </div>

          <!-- Status Badge -->
          <div class="mb-6">
            <span
              class="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
              :class="statusBadgeClass(order.status)"
            >
              {{ ORDER_STATUS_LABEL[order.status] }}
            </span>
          </div>

          <!-- Stepper (취소됨 제외) -->
          <div v-if="order.status !== 'CANCELLED'" class="flex items-center">
            <template v-for="(step, i) in stepperSteps" :key="step.status">
              <div class="flex flex-col items-center gap-1.5">
                <div
                  v-if="step.state === 'completed'"
                  class="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div
                  v-else-if="step.state === 'current'"
                  class="w-7 h-7 rounded-full bg-sky-500 ring-4 ring-sky-200 flex items-center justify-center"
                >
                  <div class="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <div v-else class="w-7 h-7 rounded-full border-2 border-slate-200 bg-white" />
                <span
                  class="text-xs whitespace-nowrap"
                  :class="step.state === 'pending' ? 'text-slate-400' : 'text-sky-600 font-medium'"
                >{{ step.label }}</span>
              </div>
              <div
                v-if="i < stepperSteps.length - 1"
                class="flex-1 h-0.5 mb-4"
                :class="stepperSteps[i + 1].state !== 'pending' ? 'bg-sky-300' : 'bg-slate-200'"
              />
            </template>
          </div>

          <!-- Cancelled notice -->
          <div v-else class="bg-slate-50 rounded-xl p-4 text-center">
            <p class="text-sm text-slate-500 font-medium">주문이 취소되었습니다.</p>
          </div>
        </div>

        <!-- Section 2: 배송 정보 -->
        <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-4">
          <div class="flex items-center gap-2 mb-4">
            <MapPin class="w-4 h-4 text-sky-500" />
            <h2 class="font-bold text-slate-900">배송 정보</h2>
          </div>
          <div>
            <div class="flex justify-between py-2 border-b border-sky-50">
              <span class="text-sm text-slate-400 w-20 flex-shrink-0">수령인</span>
              <span class="text-sm text-slate-700">{{ order.recipientName }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-sky-50">
              <span class="text-sm text-slate-400 w-20 flex-shrink-0">연락처</span>
              <span class="text-sm text-slate-700">{{ order.phoneNumber }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-slate-400 w-20 flex-shrink-0">배송지</span>
              <span class="text-sm text-slate-700 text-right flex-1">
                [{{ order.zipCode }}] {{ order.address }}
                <span v-if="order.detailAddress"> {{ order.detailAddress }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Section 3: 주문 상품 -->
        <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-4">
          <div class="flex items-center gap-2 mb-4">
            <Package class="w-4 h-4 text-sky-500" />
            <h2 class="font-bold text-slate-900">주문 상품</h2>
          </div>

          <div v-for="item in order.items" :key="item.orderItemId" class="flex gap-4 mb-4 last:mb-0">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex-shrink-0 flex items-center justify-center">
              <Package class="w-6 h-6 text-sky-300" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <p class="font-medium text-slate-900 text-sm leading-snug">{{ item.productName }}</p>
                <span class="text-xs text-slate-500 ml-2 flex-shrink-0">수량: {{ item.quantity }}개</span>
              </div>
              <p class="font-bold text-sky-600 text-sm mt-1">{{ formatPrice(item.unitPrice) }}</p>
              <p class="text-xs text-slate-400 mt-0.5">소계: {{ formatPrice(item.subtotal) }}</p>
            </div>
          </div>

          <!-- 구매 확정 버튼 (배송완료) -->
          <div v-if="order.status === 'DELIVERED'" class="mt-4 pt-4 border-t border-sky-50">
            <button
              @click="handleConfirm"
              :disabled="isConfirming"
              class="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-semibold transition disabled:opacity-60"
            >
              <Loader2 v-if="isConfirming" class="w-4 h-4 animate-spin" />
              구매 확정
            </button>
          </div>
        </div>

        <!-- Section 4: 결제 정보 -->
        <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-4">
          <div class="flex items-center gap-2 mb-4">
            <CreditCard class="w-4 h-4 text-sky-500" />
            <h2 class="font-bold text-slate-900">결제 정보</h2>
          </div>

          <div class="space-y-0">
            <div class="flex justify-between py-2 border-b border-sky-50">
              <span class="text-sm text-slate-400">상품 금액</span>
              <span class="text-sm text-slate-700">{{ formatPrice(productPrice) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-sky-50">
              <span class="text-sm text-slate-400">배송비</span>
              <span class="text-sm text-slate-700">{{ formatPrice(order.shippingFee) }}</span>
            </div>
            <div class="flex justify-between items-center pt-3 mt-1">
              <span class="font-bold text-lg text-slate-700">총 결제금액</span>
              <span class="font-black text-xl text-sky-600">{{ formatPrice(order.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Section 5: Action Buttons -->
        <div class="mt-2 flex flex-col gap-3">
          <button
            v-if="order.status === 'PENDING' || order.status === 'PAID'"
            @click="showCancelConfirm = true"
            class="border border-red-200 text-red-500 rounded-full py-3 px-6 hover:bg-red-50 transition-colors w-full font-semibold"
          >
            주문 취소
          </button>
        </div>
      </template>

    </div>

    <!-- Cancel Confirm Modal -->
    <Transition name="modal">
      <div
        v-if="showCancelConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showCancelConfirm = false" />
        <div class="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
          <h3 class="text-xl font-black text-slate-900 mb-2">주문을 취소할까요?</h3>
          <p class="text-sm text-slate-500 mb-8">취소 후에는 되돌릴 수 없어요. 결제 금액은 3-5 영업일 내로 환불됩니다.</p>
          <div class="flex gap-3">
            <button
              @click="showCancelConfirm = false"
              class="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              돌아가기
            </button>
            <button
              @click="handleCancel"
              class="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
            >
              취소 확인
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
