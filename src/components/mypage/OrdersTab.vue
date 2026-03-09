<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Truck, CheckCircle, XCircle, ChevronRight } from 'lucide-vue-next'

const router = useRouter()

const statusFilter = ref('전체')

const orders = ref([
  {
    id: 1001,
    date: '2026-03-08',
    orderNumber: 'ORD-20260308-001',
    status: '배송중',
    reviewed: false,
    items: [
      { productId: 101, name: 'L-333 킹로얄 플레코 치어', qty: 1, price: 35000, sellerId: 1, sellerName: '플레코마스터', emoji: '🐠' }
    ],
    totalPrice: 40000,
    shippingFee: 5000
  },
  {
    id: 1002,
    date: '2026-03-05',
    orderNumber: 'ORD-20260305-003',
    status: '배송완료',
    reviewed: false,
    items: [
      { productId: 102, name: 'CRS SS급 5마리', qty: 1, price: 45000, sellerId: 2, sellerName: '새우천국', emoji: '🦐' },
      { productId: 206, name: '새우 전용 소일 3L', qty: 2, price: 44000, sellerId: 2, sellerName: '새우천국', emoji: '🪨' }
    ],
    totalPrice: 89000,
    shippingFee: 0
  },
  {
    id: 1003,
    date: '2026-02-28',
    orderNumber: 'ORD-20260228-007',
    status: '배송완료',
    reviewed: true,
    items: [
      { productId: 407, name: 'ADA 뉴 아마조니아 소일 9L', qty: 1, price: 48000, sellerId: 4, sellerName: '수초팜', emoji: '🪨' }
    ],
    totalPrice: 51000,
    shippingFee: 3000
  },
  {
    id: 1004,
    date: '2026-02-20',
    orderNumber: 'ORD-20260220-012',
    status: '결제완료',
    reviewed: false,
    items: [
      { productId: 103, name: '부세파란드라 미니 3포기', qty: 1, price: 28000, sellerId: 4, sellerName: '수초팜', emoji: '🌿' }
    ],
    totalPrice: 33000,
    shippingFee: 5000
  }
])

const statusSummary = [
  { label: '결제완료', icon: CheckCircle, count: 2 },
  { label: '배송중',   icon: Truck,        count: 1 },
  { label: '배송완료', icon: Package,       count: 14 },
  { label: '취소·반품', icon: XCircle,      count: 1 },
]

const statusOptions = ['전체', '결제완료', '배송중', '배송완료', '취소/반품']

const filteredOrders = computed(() => {
  if (statusFilter.value === '전체') return orders.value
  if (statusFilter.value === '취소/반품') return orders.value.filter(o => o.status === '취소됨')
  return orders.value.filter(o => o.status === statusFilter.value)
})

const statusBadgeClass = (status: string) => {
  if (status === '결제완료') return 'bg-sky-100 text-sky-700'
  if (status === '배송중')   return 'bg-amber-100 text-amber-700'
  if (status === '배송완료') return 'bg-emerald-100 text-emerald-700'
  return 'bg-slate-100 text-slate-500'
}

const formatPrice = (n: number) => '₩' + n.toLocaleString()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-black text-slate-900">주문 내역</h1>
      <select
          v-model="statusFilter"
          class="border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <option v-for="opt in statusOptions" :key="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Status Summary Strip -->
    <div class="grid grid-cols-4 gap-3 mb-6">
      <div
          v-for="item in statusSummary"
          :key="item.label"
          class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center cursor-pointer hover:border-sky-200 transition"
      >
        <component :is="item.icon" class="w-5 h-5 text-sky-400 mx-auto mb-1" />
        <div class="text-2xl font-black text-slate-900">{{ item.count }}</div>
        <div class="text-xs text-slate-400">{{ item.label }}</div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredOrders.length === 0" class="text-center py-20">
      <Package class="w-12 h-12 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-400">아직 주문 내역이 없습니다</p>
      <button
          @click="router.push('/shop')"
          class="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition"
      >
        쇼핑하러 가기
      </button>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-4">
      <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-2xl border border-sky-100 p-5"
      >
        <!-- Top Row -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">{{ order.date }}</span>
            <span class="text-xs text-slate-300">{{ order.orderNumber }}</span>
          </div>
          <span :class="['rounded-full text-xs px-3 py-1 font-semibold', statusBadgeClass(order.status)]">
            {{ order.status }}
          </span>
        </div>

        <!-- Product Row -->
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center text-2xl flex-shrink-0">
            {{ order.items[0].emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <button
                @click="router.push(`/store/${order.items[0].sellerId}`)"
                class="flex items-center gap-0.5 text-xs text-slate-400 mb-1 hover:text-sky-500 transition"
            >
              {{ order.items[0].sellerName }}
              <ChevronRight class="w-3 h-3" />
            </button>
            <div class="font-semibold text-slate-800 text-sm line-clamp-1">{{ order.items[0].name }}</div>
            <div class="text-xs text-slate-400">{{ order.items[0].qty }}개 · {{ formatPrice(order.items[0].price) }}</div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="font-black text-sky-600 text-sm">{{ formatPrice(order.totalPrice) }}</div>
            <span
                v-if="order.items.length > 1"
                class="bg-sky-50 text-sky-600 text-xs px-2 py-0.5 rounded-full"
            >
              외 {{ order.items.length - 1 }}건
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 mt-4 pt-4 border-t border-sky-50 flex-wrap">
          <button
              @click="router.push(`/orders/${order.id}`)"
              class="px-4 py-2 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm transition"
          >
            주문 상세
          </button>
          <button
              v-if="order.status === '배송중' || order.status === '배송완료'"
              class="px-4 py-2 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm transition"
          >
            배송조회
          </button>
          <button
              v-if="order.status === '배송완료'"
              class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-semibold transition"
          >
            구매 확정
          </button>
          <button
              v-if="order.status === '배송완료' && !order.reviewed"
              class="px-4 py-2 border border-sky-200 text-sky-600 hover:bg-sky-50 rounded-full text-sm transition"
          >
            리뷰 작성
          </button>
          <button
              v-if="order.status === '결제완료'"
              class="px-4 py-2 border border-red-200 text-red-400 hover:bg-red-50 rounded-full text-sm transition"
          >
            취소 신청
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
