<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CheckCircle, Truck, Package, MapPin, CreditCard } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

type OrderStatus = '결제완료' | '배송준비중' | '배송중' | '배송완료' | '취소됨'

const order = ref({
  id: 'ORD-20250115-001',
  date: '2025-01-15 14:32',
  status: '배송중' as OrderStatus,
  product: {
    name: '레드 크리스탈 새우 10마리',
    seller: '강남아쿠아리움',
    quantity: 1,
    price: 45000
  },
  delivery: {
    recipient: '홍길동',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123, 456동 789호',
    memo: '부재시 경비실에 맡겨주세요'
  },
  payment: {
    productPrice: 45000,
    shippingFee: 3000,
    discount: 0,
    method: '카카오페이'
  }
})

// Status badge style map
const statusBadgeClass: Record<OrderStatus, string> = {
  '결제완료': 'bg-sky-100 text-sky-600',
  '배송준비중': 'bg-amber-100 text-amber-600',
  '배송중': 'bg-blue-100 text-blue-600',
  '배송완료': 'bg-emerald-100 text-emerald-600',
  '취소됨': 'bg-slate-100 text-slate-500'
}

// Stepper steps (excludes '취소됨')
const STEPS: OrderStatus[] = ['결제완료', '배송준비중', '배송중', '배송완료']

type StepState = 'completed' | 'current' | 'pending'

const stepperSteps = computed<{ label: OrderStatus; state: StepState }[]>(() => {
  const currentIndex = STEPS.indexOf(order.value.status)
  return STEPS.map((label, i) => {
    let state: StepState
    if (currentIndex === -1) {
      // cancelled — all pending
      state = 'pending'
    } else if (i < currentIndex) {
      state = 'completed'
    } else if (i === currentIndex) {
      state = 'current'
    } else {
      state = 'pending'
    }
    return { label, state }
  })
})

const totalAmount = computed(
    () => order.value.payment.productPrice + order.value.payment.shippingFee - order.value.payment.discount
)

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

// Cancel confirm modal
const showCancelConfirm = ref(false)
const handleCancel = () => {
  order.value.status = '취소됨'
  showCancelConfirm.value = false
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

      <!-- Section 1: 주문 상태 -->
      <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-4">
        <!-- Order meta -->
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs text-slate-400">주문번호</span>
          <span class="text-sm text-slate-700 font-mono">{{ order.id }}</span>
        </div>
        <div class="flex justify-between items-center mb-4">
          <span class="text-xs text-slate-400">주문일시</span>
          <span class="text-sm text-slate-700">{{ order.date }}</span>
        </div>

        <!-- Status Badge -->
        <div class="mb-6">
          <span
              class="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
              :class="statusBadgeClass[order.status]"
          >
            {{ order.status }}
          </span>
        </div>

        <!-- Stepper (hidden when cancelled) -->
        <div v-if="order.status !== '취소됨'" class="flex items-center">
          <template v-for="(step, i) in stepperSteps" :key="step.label">
            <!-- Circle -->
            <div class="flex flex-col items-center gap-1.5 relative">
              <!-- Completed -->
              <div
                  v-if="step.state === 'completed'"
                  class="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center"
              >
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <!-- Current -->
              <div
                  v-else-if="step.state === 'current'"
                  class="w-7 h-7 rounded-full bg-sky-500 ring-4 ring-sky-200 flex items-center justify-center"
              >
                <div class="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <!-- Pending -->
              <div
                  v-else
                  class="w-7 h-7 rounded-full border-2 border-slate-200 bg-white"
              />
              <span
                  class="text-xs whitespace-nowrap"
                  :class="step.state === 'pending' ? 'text-slate-400' : 'text-sky-600 font-medium'"
              >{{ step.label }}</span>
            </div>

            <!-- Connector line -->
            <div
                v-if="i < stepperSteps.length - 1"
                class="flex-1 h-0.5 mb-4"
                :class="stepperSteps[i + 1].state !== 'pending' || stepperSteps[i].state === 'completed' ? 'bg-sky-300' : 'bg-slate-200'"
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
            <span class="text-sm text-slate-700">{{ order.delivery.recipient }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-sky-50">
            <span class="text-sm text-slate-400 w-20 flex-shrink-0">연락처</span>
            <span class="text-sm text-slate-700">{{ order.delivery.phone }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-sky-50">
            <span class="text-sm text-slate-400 w-20 flex-shrink-0">배송지</span>
            <span class="text-sm text-slate-700 text-right flex-1">{{ order.delivery.address }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-sm text-slate-400 w-20 flex-shrink-0">배송 메모</span>
            <span class="text-sm text-slate-700 text-right flex-1">{{ order.delivery.memo }}</span>
          </div>
        </div>
      </div>

      <!-- Section 3: 주문 상품 -->
      <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-4">
        <div class="flex items-center gap-2 mb-4">
          <Package class="w-4 h-4 text-sky-500" />
          <h2 class="font-bold text-slate-900">주문 상품</h2>
        </div>

        <div class="flex gap-4">
          <!-- Thumbnail -->
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex-shrink-0" />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <p class="font-medium text-slate-900 text-sm leading-snug">{{ order.product.name }}</p>
              <span class="text-xs text-slate-500 ml-2 flex-shrink-0">수량: {{ order.product.quantity }}개</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">판매자: {{ order.product.seller }}</p>
            <p class="font-bold text-sky-600 text-sm mt-1">{{ formatPrice(order.product.price) }}</p>
          </div>
        </div>

        <!-- Review button (배송완료만) -->
        <div v-if="order.status === '배송완료'" class="mt-4">
          <button class="text-sm text-sky-500 border border-sky-200 rounded-full px-4 py-1.5 hover:bg-sky-50 transition-colors">
            리뷰 작성
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
            <span class="text-sm text-slate-700">{{ formatPrice(order.payment.productPrice) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-sky-50">
            <span class="text-sm text-slate-400">배송비</span>
            <span class="text-sm text-slate-700">{{ formatPrice(order.payment.shippingFee) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-sky-50">
            <span class="text-sm text-slate-400">할인</span>
            <span
                class="text-sm"
                :class="order.payment.discount > 0 ? 'text-emerald-500 font-medium' : 'text-slate-700'"
            >
              -{{ formatPrice(order.payment.discount) }}
            </span>
          </div>

          <!-- Total -->
          <div class="flex justify-between items-center pt-3 mt-1">
            <span class="font-bold text-lg text-slate-700">총 결제금액</span>
            <span class="font-black text-xl text-sky-600">{{ formatPrice(totalAmount) }}</span>
          </div>

          <div class="flex justify-between py-2 mt-1 bg-sky-50 rounded-xl px-4">
            <span class="text-sm text-slate-400">결제 수단</span>
            <span class="text-sm text-slate-700 font-medium">{{ order.payment.method }}</span>
          </div>
        </div>
      </div>

      <!-- Section 5: Action Buttons -->
      <div class="mt-2 flex flex-col gap-3">
        <!-- 주문 취소 (결제완료 / 배송준비중) -->
        <button
            v-if="order.status === '결제완료' || order.status === '배송준비중'"
            @click="showCancelConfirm = true"
            class="border border-red-200 text-red-500 rounded-full py-3 px-6 hover:bg-red-50 transition-colors w-full font-semibold"
        >
          주문 취소
        </button>

        <!-- 배송완료: 교환/반품 + 재구매 -->
        <template v-if="order.status === '배송완료'">
          <button class="border border-slate-200 text-slate-600 rounded-full py-3 px-6 hover:bg-slate-50 transition-colors w-full font-semibold">
            교환/반품 신청
          </button>
          <button class="bg-sky-500 hover:bg-sky-600 text-white rounded-full py-3 px-6 transition-colors w-full font-bold">
            재구매
          </button>
        </template>
      </div>

    </div>

    <!-- Cancel Confirm Modal -->
    <Transition name="modal">
      <div
          v-if="showCancelConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-black/30 backdrop-blur-sm"
            @click="showCancelConfirm = false"
        />

        <!-- Dialog -->
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
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
