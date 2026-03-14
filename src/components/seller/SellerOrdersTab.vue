<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Package, Truck, CheckCircle, XCircle, Loader2, Clock,
  MapPin, ChevronDown, ChevronUp, Send
} from 'lucide-vue-next'
import { sellerApi } from '@/api/seller.api'
import { ORDER_STATUS_LABEL, type OrderResponse, type OrderStatus } from '@/api/order.api'

const orders = ref<OrderResponse[]>([])
const isLoading = ref(true)
const error = ref('')

type FilterKey = 'ALL' | OrderStatus
const statusFilter = ref<FilterKey>('ALL')

const statusOptions: { key: FilterKey; label: string }[] = [
  { key: 'ALL',       label: '전체' },
  { key: 'PAID',      label: '신규주문' },
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
  { key: 'PAID',      label: '신규주문', icon: Package,      count: orders.value.filter(o => o.status === 'PAID').length },
  { key: 'SHIPPING',  label: '배송중',   icon: Truck,        count: orders.value.filter(o => o.status === 'SHIPPING').length },
  { key: 'DELIVERED', label: '배송완료', icon: CheckCircle,  count: orders.value.filter(o => o.status === 'DELIVERED').length },
  { key: 'CONFIRMED', label: '구매확정', icon: CheckCircle,  count: orders.value.filter(o => o.status === 'CONFIRMED').length },
  { key: 'CANCELLED', label: '취소됨',   icon: XCircle,      count: orders.value.filter(o => o.status === 'CANCELLED').length },
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

// ── 주문 상세 펼침 ─────────────────────────────────
const expandedOrders = ref<Set<number>>(new Set())
function toggleExpand(orderId: number) {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId)
  } else {
    expandedOrders.value.add(orderId)
  }
}

// ── 송장 등록 모달 상태 ────────────────────────────
interface ShipForm { courier: string; trackingNumber: string }
const shipTarget = ref<number | null>(null)   // orderId
const shipForm = ref<ShipForm>({ courier: '', trackingNumber: '' })
const isShipping = ref(false)

const couriers = [
  'CJ대한통운', '롯데택배', '한진택배', '우체국택배', '로젠택배',
  '카카오택배', '쿠팡로켓', '직접배송',
]

function openShipModal(orderId: number) {
  shipTarget.value = orderId
  shipForm.value = { courier: '', trackingNumber: '' }
}

async function handleShip() {
  if (!shipTarget.value || !shipForm.value.courier || !shipForm.value.trackingNumber) return
  isShipping.value = true
  try {
    const updated = await sellerApi.shipOrder(shipTarget.value, shipForm.value)
    const idx = orders.value.findIndex(o => o.orderId === shipTarget.value)
    if (idx !== -1) orders.value[idx] = updated
    shipTarget.value = null
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '배송 처리에 실패했습니다.')
  } finally {
    isShipping.value = false
  }
}

// ── 배송완료 처리 ──────────────────────────────────
const deliveringId = ref<number | null>(null)
async function handleDeliver(orderId: number) {
  if (!confirm('배송완료로 처리하시겠습니까?')) return
  deliveringId.value = orderId
  try {
    const updated = await sellerApi.deliverOrder(orderId)
    const idx = orders.value.findIndex(o => o.orderId === orderId)
    if (idx !== -1) orders.value[idx] = updated
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '배송완료 처리에 실패했습니다.')
  } finally {
    deliveringId.value = null
  }
}

// ── 판매자 취소 ────────────────────────────────────
const cancellingId = ref<number | null>(null)
async function handleCancel(orderId: number) {
  if (!confirm('이 주문을 취소하시겠습니까? 재고가 복구됩니다.')) return
  cancellingId.value = orderId
  try {
    await sellerApi.cancelSellerOrder(orderId)
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
    orders.value = await sellerApi.getSellerOrders()
  } catch {
    error.value = '주문 목록을 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-black text-slate-900">주문 관리</h1>
      <select
        v-model="statusFilter"
        class="border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <option v-for="opt in statusOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
      </select>
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="text-center py-20 text-red-500">{{ error }}</div>

    <template v-else>
      <!-- 상태별 요약 -->
      <div class="grid grid-cols-5 gap-2 mb-6">
        <div
          v-for="item in statusSummary"
          :key="item.label"
          class="bg-sky-50 rounded-2xl p-3 border border-sky-100 text-center cursor-pointer hover:border-sky-200 transition"
          @click="statusFilter = item.key as FilterKey"
          :class="statusFilter === item.key ? 'border-sky-400 bg-sky-100' : ''"
        >
          <component :is="item.icon" class="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <div class="text-xl font-black text-slate-900">{{ item.count }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ item.label }}</div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="filteredOrders.length === 0" class="text-center py-20 bg-sky-50 rounded-2xl border border-sky-100">
        <Package class="w-12 h-12 text-sky-200 mx-auto mb-4" />
        <p class="text-slate-400">해당 상태의 주문이 없습니다</p>
      </div>

      <!-- 주문 목록 -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.orderId"
          class="bg-white rounded-2xl border border-sky-100 overflow-hidden"
        >
          <!-- 주문 헤더 -->
          <div
            class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-sky-50/50 transition-colors"
            @click="toggleExpand(order.orderId)"
          >
            <div class="flex items-center gap-3">
              <Clock class="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span class="text-xs text-slate-400">{{ formatDate(order.createdAt) }}</span>
              <span class="text-xs text-slate-300 font-mono">#{{ order.orderId }}</span>
              <span class="text-xs text-slate-600 font-medium">{{ order.buyerNickName }}</span>
              <span :class="['rounded-full text-xs px-3 py-1 font-semibold', statusBadgeClass(order.status)]">
                {{ ORDER_STATUS_LABEL[order.status] }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-black text-sky-600 text-sm">{{ formatPrice(order.totalAmount) }}</span>
              <component :is="expandedOrders.has(order.orderId) ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <!-- 펼쳐진 상세 -->
          <div v-if="expandedOrders.has(order.orderId)" class="border-t border-sky-50 px-5 pb-5">

            <!-- 상품 목록 -->
            <div class="py-4 space-y-3">
              <div
                v-for="item in order.items"
                :key="item.orderItemId"
                class="flex items-center gap-3"
              >
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center flex-shrink-0">
                  <Package class="w-5 h-5 text-sky-300" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-slate-800 line-clamp-1">{{ item.productName }}</div>
                  <div class="text-xs text-slate-400">{{ item.quantity }}개 · {{ formatPrice(item.unitPrice) }}</div>
                </div>
                <div class="text-sm font-bold text-sky-600">{{ formatPrice(item.subtotal) }}</div>
              </div>
            </div>

            <!-- 배송지 -->
            <div class="flex items-start gap-2 bg-sky-50 rounded-xl px-4 py-3 mb-4">
              <MapPin class="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-slate-600">
                <span class="font-semibold text-slate-800 mr-2">{{ order.recipientName }}</span>
                <span class="text-slate-400 mr-3">{{ order.phoneNumber }}</span>
                <br class="sm:hidden" />
                [{{ order.zipCode }}] {{ order.address }}
                <span v-if="order.detailAddress"> {{ order.detailAddress }}</span>
              </div>
            </div>

            <!-- 송장 정보 (배송중 이상) -->
            <div v-if="order.courier" class="flex items-center gap-2 text-sm mb-4 text-slate-600">
              <Truck class="w-4 h-4 text-sky-400" />
              <span class="font-medium">{{ order.courier }}</span>
              <span class="text-slate-400">|</span>
              <span class="font-mono text-slate-700">{{ order.trackingNumber }}</span>
            </div>

            <!-- 액션 버튼 -->
            <div class="flex gap-2 flex-wrap">
              <!-- 신규주문(PAID) → 송장 등록 / 주문 취소 -->
              <template v-if="order.status === 'PAID'">
                <button
                  @click="openShipModal(order.orderId)"
                  class="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-semibold transition"
                >
                  <Send class="w-3.5 h-3.5" />
                  송장 등록
                </button>
                <button
                  @click="handleCancel(order.orderId)"
                  :disabled="cancellingId === order.orderId"
                  class="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-400 hover:bg-red-50 rounded-full text-sm transition disabled:opacity-60"
                >
                  <Loader2 v-if="cancellingId === order.orderId" class="w-3.5 h-3.5 animate-spin" />
                  주문 취소
                </button>
              </template>

              <!-- 배송중(SHIPPING) → 배송완료 처리 -->
              <button
                v-if="order.status === 'SHIPPING'"
                @click="handleDeliver(order.orderId)"
                :disabled="deliveringId === order.orderId"
                class="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition disabled:opacity-60"
              >
                <Loader2 v-if="deliveringId === order.orderId" class="w-3.5 h-3.5 animate-spin" />
                <CheckCircle v-else class="w-3.5 h-3.5" />
                배송완료 처리
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── 송장 등록 모달 ── -->
    <Teleport to="body">
      <div
        v-if="shipTarget !== null"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        @click.self="shipTarget = null"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-5">송장 등록</h3>

          <!-- 택배사 -->
          <div class="mb-4">
            <label class="text-sm text-slate-500 mb-1.5 block">택배사</label>
            <select
              v-model="shipForm.courier"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            >
              <option value="" disabled>택배사를 선택하세요</option>
              <option v-for="c in couriers" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <!-- 송장번호 -->
          <div class="mb-6">
            <label class="text-sm text-slate-500 mb-1.5 block">송장번호</label>
            <input
              v-model="shipForm.trackingNumber"
              type="text"
              placeholder="송장번호를 입력하세요"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              @keyup.enter="handleShip"
            />
          </div>

          <!-- 버튼 -->
          <div class="flex gap-3">
            <button
              @click="handleShip"
              :disabled="isShipping || !shipForm.courier || !shipForm.trackingNumber"
              class="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isShipping" class="w-4 h-4 animate-spin" />
              {{ isShipping ? '처리 중...' : '배송 처리' }}
            </button>
            <button
              @click="shipTarget = null"
              :disabled="isShipping"
              class="flex-1 py-3 border border-sky-100 text-slate-600 hover:bg-sky-50 font-semibold rounded-full transition"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
