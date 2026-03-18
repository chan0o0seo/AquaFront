<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Truck, CheckCircle, XCircle, Loader2, Clock, MessageSquarePlus, PenLine } from 'lucide-vue-next'
import { orderApi, ORDER_STATUS_LABEL, type OrderResponse, type OrderStatus } from '@/api'
import { productApi, type Review } from '@/api/product.api'
import { useAuthStore } from '@/stores/auth'
import ReviewWriteForm from '@/components/product/ReviewWriteForm.vue'

interface Props {
  initialOrders?: OrderResponse[]
}
const props = withDefaults(defineProps<Props>(), { initialOrders: undefined })

const router = useRouter()
const authStore = useAuthStore()

const orders = ref<OrderResponse[]>(props.initialOrders ?? [])
const isLoading = ref(!props.initialOrders)
const error = ref('')

// ── 리뷰 상태 ──────────────────────────────────────────
interface ReviewState {
  isOpen: boolean
  isLoadingReview: boolean
  existingReview: Review | null
  isSubmitting: boolean
}

// key: `${orderId}-${productId}`
const reviewStates = ref<Record<string, ReviewState>>({})

// 다중 상품 주문의 리뷰 섹션 열림 여부 (key: orderId)
const multiReviewOpen = ref<Record<number, boolean>>({})

function reviewKey(orderId: number, productId: number) {
  return `${orderId}-${productId}`
}

function getReviewState(orderId: number, productId: number): ReviewState {
  const key = reviewKey(orderId, productId)
  if (!reviewStates.value[key]) {
    reviewStates.value[key] = { isOpen: false, isLoadingReview: false, existingReview: null, isSubmitting: false }
  }
  return reviewStates.value[key]
}

async function toggleReview(orderId: number, productId: number) {
  const state = getReviewState(orderId, productId)
  if (state.isOpen) {
    state.isOpen = false
    return
  }
  state.isOpen = true
  state.isLoadingReview = true
  try {
    const page = await productApi.getReviews(productId, 0, 100)
    const userId = authStore.user?.id
    state.existingReview = page.content.find(r => r.reviewerId === userId) ?? null
  } catch {
    state.existingReview = null
  } finally {
    state.isLoadingReview = false
  }
}

async function handleReviewSubmit(orderId: number, productId: number, form: { rating: number; content: string; imageUrls: string[]; secret: boolean }) {
  const state = getReviewState(orderId, productId)
  state.isSubmitting = true
  try {
    if (state.existingReview) {
      const updated = await productApi.updateReview(productId, state.existingReview.id, {
        rating: form.rating,
        content: form.content,
        imageUrls: form.imageUrls,
        secret: form.secret,
      })
      state.existingReview = updated
    } else {
      const created = await productApi.createReview(productId, {
        rating: form.rating,
        content: form.content,
        imageUrls: form.imageUrls,
        secret: form.secret,
      })
      state.existingReview = created
    }
    state.isOpen = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '리뷰 저장에 실패했습니다.')
  } finally {
    state.isSubmitting = false
  }
}

function handleReviewCancel(orderId: number, productId: number) {
  getReviewState(orderId, productId).isOpen = false
}

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
  if (props.initialOrders) return   // 부모에서 이미 데이터를 받았으면 재요청 생략
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
          <div
            class="flex items-center gap-4 cursor-pointer rounded-xl hover:bg-sky-50 -mx-2 px-2 py-1 transition-colors"
            @click="router.push(`/products/${order.items[0]?.productId}`)"
          >
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center flex-shrink-0">
              <Package class="w-6 h-6 text-sky-300" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-sky-600">
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

            <!-- 리뷰 버튼 (구매확정, 단일 상품) -->
            <button
              v-if="order.status === 'CONFIRMED' && order.items.length === 1"
              @click="toggleReview(order.orderId, order.items[0].productId)"
              class="px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1"
              :class="getReviewState(order.orderId, order.items[0].productId).existingReview
                ? 'border border-sky-200 text-sky-600 hover:bg-sky-50'
                : 'bg-sky-500 hover:bg-sky-600 text-white'"
            >
              <PenLine v-if="getReviewState(order.orderId, order.items[0].productId).existingReview" class="w-3.5 h-3.5" />
              <MessageSquarePlus v-else class="w-3.5 h-3.5" />
              {{ getReviewState(order.orderId, order.items[0].productId).existingReview ? '리뷰 수정' : '리뷰 작성' }}
            </button>

            <!-- 리뷰 버튼 (구매확정, 다중 상품) -->
            <button
              v-if="order.status === 'CONFIRMED' && order.items.length > 1"
              @click="multiReviewOpen[order.orderId] = !multiReviewOpen[order.orderId]"
              class="px-4 py-2 border border-sky-200 text-sky-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition flex items-center gap-1"
            >
              <MessageSquarePlus class="w-3.5 h-3.5" />
              리뷰 작성 ({{ order.items.length }}개 상품)
            </button>
          </div>

          <!-- 단일 상품 리뷰 인라인 폼 -->
          <template v-if="order.status === 'CONFIRMED' && order.items.length === 1">
            <div v-if="getReviewState(order.orderId, order.items[0].productId).isOpen && getReviewState(order.orderId, order.items[0].productId).isLoadingReview"
              class="mt-4 flex justify-center py-6"
            >
              <Loader2 class="w-6 h-6 animate-spin text-sky-400" />
            </div>
            <div v-else-if="getReviewState(order.orderId, order.items[0].productId).isOpen" class="mt-4">
              <ReviewWriteForm
                :initial-data="getReviewState(order.orderId, order.items[0].productId).existingReview
                  ? {
                      rating: getReviewState(order.orderId, order.items[0].productId).existingReview!.rating,
                      content: getReviewState(order.orderId, order.items[0].productId).existingReview!.content ?? '',
                      imageUrls: getReviewState(order.orderId, order.items[0].productId).existingReview!.imageUrls,
                      secret: getReviewState(order.orderId, order.items[0].productId).existingReview!.secret,
                    }
                  : null"
                :is-editing="!!getReviewState(order.orderId, order.items[0].productId).existingReview"
                :is-submitting="getReviewState(order.orderId, order.items[0].productId).isSubmitting"
                @submit="(form) => handleReviewSubmit(order.orderId, order.items[0].productId, form)"
                @cancel="handleReviewCancel(order.orderId, order.items[0].productId)"
              />
            </div>
          </template>

          <!-- 다중 상품 리뷰 섹션 -->
          <div
            v-if="order.status === 'CONFIRMED' && order.items.length > 1 && multiReviewOpen[order.orderId]"
            class="mt-4 border-t border-sky-50 pt-4 space-y-3"
          >
            <div v-for="item in order.items" :key="`multi-review-${item.productId}`">
              <!-- 상품 행 -->
              <div class="flex items-center justify-between gap-3 py-2 px-3 bg-sky-50 rounded-xl">
                <span class="text-sm text-slate-700 font-medium truncate flex-1">{{ item.productName }}</span>
                <button
                  @click="toggleReview(order.orderId, item.productId)"
                  class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1"
                  :class="getReviewState(order.orderId, item.productId).existingReview
                    ? 'border border-sky-200 text-sky-600 hover:bg-white'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'"
                >
                  <PenLine v-if="getReviewState(order.orderId, item.productId).existingReview" class="w-3 h-3" />
                  <MessageSquarePlus v-else class="w-3 h-3" />
                  {{ getReviewState(order.orderId, item.productId).existingReview ? '수정' : '작성' }}
                </button>
              </div>

              <!-- 해당 상품 리뷰 폼 -->
              <div v-if="getReviewState(order.orderId, item.productId).isOpen && getReviewState(order.orderId, item.productId).isLoadingReview"
                class="flex justify-center py-4"
              >
                <Loader2 class="w-5 h-5 animate-spin text-sky-400" />
              </div>
              <div v-else-if="getReviewState(order.orderId, item.productId).isOpen" class="mt-2">
                <ReviewWriteForm
                  :initial-data="getReviewState(order.orderId, item.productId).existingReview
                    ? {
                        rating: getReviewState(order.orderId, item.productId).existingReview!.rating,
                        content: getReviewState(order.orderId, item.productId).existingReview!.content ?? '',
                        imageUrls: getReviewState(order.orderId, item.productId).existingReview!.imageUrls,
                        secret: getReviewState(order.orderId, item.productId).existingReview!.secret,
                      }
                    : null"
                  :is-editing="!!getReviewState(order.orderId, item.productId).existingReview"
                  :is-submitting="getReviewState(order.orderId, item.productId).isSubmitting"
                  @submit="(form) => handleReviewSubmit(order.orderId, item.productId, form)"
                  @cancel="handleReviewCancel(order.orderId, item.productId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
