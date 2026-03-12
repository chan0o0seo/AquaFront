<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Truck, CheckCircle, XCircle, Loader2, Clock } from 'lucide-vue-next'
import { orderApi, ORDER_STATUS_LABEL, type OrderResponse, type OrderStatus } from '@/api'

const router = useRouter()

const orders = ref<OrderResponse[]>([])
const isLoading = ref(true)
const error = ref('')

type FilterKey = 'ALL' | OrderStatus

const statusFilter = ref<FilterKey>('ALL')

const statusOptions: { key: FilterKey; label: string }[] = [
  { key: 'ALL',       label: '전체' },
  { key: 'PAID',      label: '결제완료' },
  { key: 'SHIPPING',  label: '배송중' },
  { key: 'DELIVERED', label: '배송완료' },
  { key: 'CONFIRMED', label: '구매확정' },
  { key: 'CANCELLED', label: '취소됨' },
]

const filteredOrders = computed(() =>
  statusFilter.value === 'ALL'
    ? orders.value
    : orders.value.filter(o => o.status === statusFilter.value)
)

const statusSummary = computed(() => [
  { label: '결제완료', icon: CheckCircle, count: orders.value.filter(o => o.status === 'PAID').length },
  { label: '배송중',   icon: Truck,        count: orders.value.filter(o => o.status === 'SHIPPING').length },
  { label: '배송완료', icon: Package,      count: orders.value.filter(o => o.status === 'DELIVERED').length },
  { label: '구매확정', icon: CheckCircle,  count: orders.value.filter(o => o.status === 'CONFIRMED').length },
  { label: '취소됨',   icon: XCircle,      count: orders.value.filter(o => o.status === 'CANCELLED').length },
])

const statusBadgeClass = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    PENDING:   'bg-amber-100 text-amber-700',
    PAID:      'bg-sky-100 text-sky-700',
    SHIPPING:  'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
  }
  return map[status]
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const formatPrice = (n: number) => '₩' + n.toLocaleString()

// 구매 확정
const confirmingId = ref<number | null>(null)
async function handleConfirm(orderId: number) {
  confirmingId.value = orderId
  try {
    await orderApi.confirmOrder(orderId)
    const target = orders.value.find(o => o.orderId === orderId)
    if (target) target.status = 'CONFIRMED'
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '구매 확정에 실패했습니다.')
  } finally {
    confirmingId.value = null
  }
}

// 주문 취소
const cancellingId = ref<number | null>(null)
async function handleCancel(orderId: number) {
  cancellingId.value = orderId
  try {
    await orderApi.cancelOrder(orderId)
    const target = orders.value.find(o => o.orderId === orderId)
    if (target) target.status = 'CANCELLED'
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '주문 취소에 실패했습니다.')
  } finally {
    cancellingId.value = null
  }
}

onMounted(async () => {
  try {
    orders.value = await orderApi.getMyOrders()
  } catch {
    error.value = '주문 내역을 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-black text-slate-900">주문 내역</h1>
      <select
        v-model="statusFilter"
        class="border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <option v-for="opt in statusOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 text-red-500">{{ error }}</div>

    <template v-else>
      <!-- Status Summary Strip -->
      <div class="grid grid-cols-5 gap-2 mb-6">
        <div
          v-for="item in statusSummary"
          :key="item.label"
          class="bg-sky-50 rounded-2xl p-3 border border-sky-100 text-center cursor-pointer hover:border-sky-200 transition"
          @click="statusFilter = statusOptions.find(o => o.label === item.label)?.key ?? 'ALL'"
        >
          <component :is="item.icon" class="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <div class="text-xl font-black text-slate-900">{{ item.count }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ item.label }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="text-center py-20 bg-sky-50 rounded-2xl border border-sky-100">
        <Package class="w-12 h-12 text-sky-200 mx-auto mb-4" />
        <p class="text-slate-400">아직 주문 내역이 없습니다</p>
        <button
          @click="router.push('/')"
          class="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition"
        >
          쇼핑하러 가기
        </button>
      </div>

      <!-- Order List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="bg-white rounded-2xl border border-sky-100 p-5"
        >
          <!-- Top Row -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Clock class="w-3.5 h-3.5 text-slate-300" />
              <span class="text-xs text-slate-400">{{ formatDate(order.createdAt) }}</span>
              <span class="text-xs text-slate-300 font-mono">#{{ order.orderId }}</span>
            </div>
            <span :class="['rounded-full text-xs px-3 py-1 font-semibold', statusBadgeClass(order.status)]">
              {{ ORDER_STATUS_LABEL[order.status] }}
            </span>
          </div>

          <!-- Product Row -->
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center flex-shrink-0">
              <Package class="w-6 h-6 text-sky-300" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-800 text-sm line-clamp-1">
                {{ order.items[0]?.productName ?? '상품 정보 없음' }}
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                {{ order.items[0]?.quantity }}개 · {{ formatPrice(order.items[0]?.unitPrice ?? 0) }}
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="font-black text-sky-600 text-sm">{{ formatPrice(order.totalAmount) }}</div>
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
              @click="router.push(`/orders/${order.orderId}`)"
              class="px-4 py-2 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm transition"
            >
              주문 상세
            </button>

            <!-- 구매 확정 (배송완료) -->
            <button
              v-if="order.status === 'DELIVERED'"
              @click="handleConfirm(order.orderId)"
              :disabled="confirmingId === order.orderId"
              class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-semibold transition disabled:opacity-60 flex items-center gap-1"
            >
              <Loader2 v-if="confirmingId === order.orderId" class="w-3.5 h-3.5 animate-spin" />
              구매 확정
            </button>

            <!-- 주문 취소 (결제대기/결제완료) -->
            <button
              v-if="order.status === 'PENDING' || order.status === 'PAID'"
              @click="handleCancel(order.orderId)"
              :disabled="cancellingId === order.orderId"
              class="px-4 py-2 border border-red-200 text-red-400 hover:bg-red-50 rounded-full text-sm transition disabled:opacity-60 flex items-center gap-1"
            >
              <Loader2 v-if="cancellingId === order.orderId" class="w-3.5 h-3.5 animate-spin" />
              취소 신청
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
