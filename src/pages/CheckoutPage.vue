<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { orderApi, paymentApi, productApi, getThumbnailUrl } from '@/api'
import type { ProductDetail } from '@/api'
import { memberApi, type DeliveryAddressResponse } from '@/api/member.api'
import {
  ArrowLeft,
  MapPin,
  Lock,
  Thermometer,
  Fish,
  Loader2,
  CreditCard,
  CheckCircle2,
  Plus,
} from 'lucide-vue-next'

declare const PortOne: {
  requestPayment: (params: object) => Promise<{ code?: string; message?: string; paymentId?: string }>
}

const STORE_ID = 'store-e103fa1f-c65c-4776-ab72-0cda7b8d9827'
const CHANNEL_KEYS = {
  kakao: 'channel-key-0edbe950-6ad5-4a1b-963a-b6f759fa1cb1',
  card:  'channel-key-f371ee6c-527d-47a4-8005-68e81a10dabe',
}

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const { checkedItems, subtotal, totalShippingFee, totalPrice } = storeToRefs(cartStore)

// ── 배송지 ─────────────────────────────────────────────
const savedAddresses = ref<DeliveryAddressResponse[]>([])
const addressMode = ref<'saved' | 'new'>('new')
const selectedAddressId = ref<number | null>(null)
const isLoadingAddresses = ref(false)

async function loadAddresses() {
  isLoadingAddresses.value = true
  try {
    savedAddresses.value = await memberApi.getAddresses()
    if (savedAddresses.value.length > 0) {
      addressMode.value = 'saved'
      const defaultAddr = savedAddresses.value.find(a => a.isDefault) ?? savedAddresses.value[0]
      selectAddress(defaultAddr)
    }
  } catch {
    // 로그인 안 됐거나 주소 없으면 새로 입력 모드 유지
  } finally {
    isLoadingAddresses.value = false
  }
}

function selectAddress(addr: DeliveryAddressResponse) {
  selectedAddressId.value = addr.id
  form.recipient = addr.recipientName
  form.phone = addr.phoneNumber
  form.zipCode = addr.zipCode
  form.address = addr.address
  form.addressDetail = addr.detailAddress ?? ''
}

function switchToNew() {
  addressMode.value = 'new'
  selectedAddressId.value = null
  form.recipient = ''
  form.phone = ''
  form.zipCode = ''
  form.address = ''
  form.addressDetail = ''
}

// Delivery form
const form = reactive({
  recipient: '',
  phone: '',
  zipCode: '',
  address: '',
  addressDetail: '',
  memo: '',
  memoCustom: ''
})

// Payment method
const paymentMethod = ref<'kakao' | 'card'>('kakao')

// 바로 구매 모드 (productId 쿼리 파라미터)
const buyNowProduct = ref<ProductDetail | null>(null)
const buyNowQuantity = ref(1)

// Order items
const orderItems = computed(() => {
  if (buyNowProduct.value) {
    const p = buyNowProduct.value
    return [{
      productId: p.id,
      name: p.name,
      sellerNickName: p.sellerNickName,
      price: p.price,
      shippingFee: p.shippingFee,
      quantity: buyNowQuantity.value,
      thumbnailUrl: getThumbnailUrl(p),
    }]
  }
  return checkedItems.value.map(item => ({
    productId: item.productId,
    name: item.name,
    sellerNickName: item.sellerNickName,
    price: item.price,
    shippingFee: item.shippingFee,
    quantity: item.quantity,
    thumbnailUrl: item.thumbnailUrl,
  }))
})

// Computed totals
const orderSubtotal = computed(() => {
  if (buyNowProduct.value) {
    return buyNowProduct.value.price * buyNowQuantity.value
  }
  return subtotal.value
})
const orderShippingFee = computed(() => {
  if (buyNowProduct.value) return buyNowProduct.value.shippingFee
  return totalShippingFee.value
})
const orderTotalPrice = computed(() => orderSubtotal.value + orderShippingFee.value)

const isFormValid = computed(() =>
    form.recipient.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.zipCode.trim().length > 0 &&
    form.address.trim().length > 0
)

const isSubmitting = ref(false)

const handleAddressSearch = () => {
  form.address = '서울시 강남구 테헤란로 123'
}

const handleOrder = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  if (orderItems.value.length === 0) {
    alert('주문할 상품이 없습니다.')
    return
  }

  isSubmitting.value = true
  try {
    // 1. 주문 생성
    const order = await orderApi.createOrder({
      items: orderItems.value.map(i => ({ productId: i.productId, quantity: i.quantity })),
      recipientName: form.recipient,
      phoneNumber: form.phone,
      zipCode: form.zipCode,
      address: form.address,
      detailAddress: form.addressDetail || '',
    })

    const orderId = order.orderId
    const totalAmount = order.totalAmount + order.shippingFee
    const paymentId = `order_${orderId}_${Date.now()}`
    const channelKey = CHANNEL_KEYS[paymentMethod.value]

    // 리다이렉트 방식 복귀 시 사용
    sessionStorage.setItem('pendingPaymentOrderId', String(orderId))

    // 2. PortOne V2 결제 요청
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey,
      paymentId,
      orderName: '아쿠아허브 주문',
      totalAmount,
      currency: 'CURRENCY_KRW',
      payMethod: paymentMethod.value === 'kakao' ? 'EASY_PAY' : 'CARD',
      ...(paymentMethod.value === 'kakao'
        ? { easyPay: { easyPayProvider: 'EASY_PAY_PROVIDER_KAKAOPAY' } }
        : {}),
      customer: {
        fullName: form.recipient,
        phoneNumber: form.phone,
        address: {
          addressLine1: form.address,
          addressLine2: form.addressDetail || '',
          country: 'KR',
        },
      },
      redirectUrl: `${window.location.origin}/checkout`,
    })

    // 팝업 방식(카카오페이)은 여기서 결과 수신
    if (response.code) {
      alert(`결제 실패: ${response.message}`)
      return
    }

    // 3. 백엔드 결제 검증
    await paymentApi.verify({ paymentId: response.paymentId!, orderId })

    if (!buyNowProduct.value) {
      await cartStore.clearChecked()
    }
    sessionStorage.removeItem('pendingPaymentOrderId')
    router.push('/orders/complete')
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? e?.message
    const status = e?.response?.status
    console.error('[주문 실패]', e)
    alert(msg ?? `주문에 실패했습니다. (${status ?? '네트워크 오류'})`)
  } finally {
    isSubmitting.value = false
  }
}

// 리다이렉트 방식 결제(토스 등) 복귀 처리
onMounted(async () => {
  const paymentId = route.query.paymentId as string | undefined
  const code = route.query.code as string | undefined
  const productIdParam = route.query.productId as string | undefined
  const quantityParam = route.query.quantity as string | undefined

  // 바로 구매 모드
  if (productIdParam) {
    try {
      buyNowProduct.value = await productApi.getDetail(Number(productIdParam))
      buyNowQuantity.value = Number(quantityParam) || 1
    } catch {
      router.replace('/cart')
    }
    return
  }

  // 장바구니 결제 모드: 데이터 로드
  if (cartStore.cartItems.length === 0) {
    await cartStore.fetchCart()
  }

  // 결제 복귀가 아닌 일반 접근 시, 체크된 상품 없으면 장바구니로
  if (!paymentId && !code && checkedItems.value.length === 0) {
    router.replace('/cart')
    return
  }

  if (!paymentId && !code) return

  const orderIdStr = sessionStorage.getItem('pendingPaymentOrderId')
  if (!orderIdStr) return
  const orderId = Number(orderIdStr)

  if (code) {
    const message = route.query.message as string
    alert(`결제 실패: ${message}`)
    return
  }

  isSubmitting.value = true
  try {
    await paymentApi.verify({ paymentId: paymentId!, orderId })
    await cartStore.clearChecked()
    sessionStorage.removeItem('pendingPaymentOrderId')
    router.push('/orders/complete')
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '결제 검증에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
})

const goBack = () => {
  router.back()
}
onMounted(loadAddresses)
</script>

<template>
  <main class="min-h-screen bg-sky-50">
    <div class="max-w-5xl mx-auto px-6 py-12 mt-16 pb-32 lg:pb-12">
      <!-- Back Button -->
      <button
          type="button"
          @click="goBack"
          class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6"
      >
        <ArrowLeft class="w-5 h-5" />
        <span class="font-medium">장바구니</span>
      </button>

      <!-- Page Title -->
      <h1 class="text-3xl font-black text-slate-900 mb-8">결제하기</h1>

      <!-- Main Content -->
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- Left Column: Forms -->
        <div class="flex-1 w-full space-y-4">
          <!-- Section 1: 배송지 정보 -->
          <section class="bg-white rounded-2xl border border-sky-100 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">배송지</h2>

            <!-- 주소 모드 탭 -->
            <div class="flex gap-2 mb-4">
              <button
                type="button"
                @click="addressMode = 'saved'"
                :disabled="savedAddresses.length === 0"
                class="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                :class="addressMode === 'saved'
                  ? 'bg-sky-500 text-white'
                  : 'border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed'"
              >
                저장된 배송지 {{ savedAddresses.length > 0 ? `(${savedAddresses.length})` : '' }}
              </button>
              <button
                type="button"
                @click="switchToNew"
                class="px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1"
                :class="addressMode === 'new'
                  ? 'bg-sky-500 text-white'
                  : 'border border-sky-100 text-slate-500 hover:bg-sky-50'"
              >
                <Plus class="w-3.5 h-3.5" />
                새로 입력
              </button>
            </div>

            <!-- 로딩 -->
            <div v-if="isLoadingAddresses" class="flex justify-center py-6">
              <Loader2 class="w-5 h-5 animate-spin text-sky-400" />
            </div>

            <!-- 저장된 배송지 목록 -->
            <div v-else-if="addressMode === 'saved'" class="space-y-2 mb-4">
              <button
                v-for="addr in savedAddresses"
                :key="addr.id"
                type="button"
                @click="selectAddress(addr)"
                class="w-full text-left p-4 rounded-xl border-2 transition-colors"
                :class="selectedAddressId === addr.id
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-sky-100 hover:border-sky-200'"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-slate-800 text-sm">{{ addr.recipientName }}</span>
                      <span class="text-slate-400 text-sm">{{ addr.phoneNumber }}</span>
                      <span
                        v-if="addr.isDefault"
                        class="text-xs px-2 py-0.5 bg-sky-100 text-sky-600 rounded-full font-medium"
                      >
                        기본
                      </span>
                    </div>
                    <div class="text-sm text-slate-500 mt-1">
                      [{{ addr.zipCode }}] {{ addr.address }}
                      <span v-if="addr.detailAddress"> {{ addr.detailAddress }}</span>
                    </div>
                  </div>
                  <CheckCircle2
                    class="w-5 h-5 flex-shrink-0 mt-0.5 transition-colors"
                    :class="selectedAddressId === addr.id ? 'text-sky-500' : 'text-slate-200'"
                  />
                </div>
              </button>
            </div>

            <!-- 새로 입력 폼 -->
            <div v-else class="space-y-4 mb-4">
              <input
                v-model="form.recipient"
                type="text"
                placeholder="수령인 이름"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              </div>

              <!-- 연락처 -->
              <div>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="010-1234-5678"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              </div>

              <!-- 우편번호 -->
              <div>
              <input
                v-model="form.zipCode"
                type="text"
                placeholder="우편번호"
                maxlength="6"
                class="w-36 px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              </div>

              <!-- 배송지 주소 -->
              <div class="flex gap-3">
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="주소를 검색하세요"
                  readonly
                  class="flex-1 px-4 py-3 rounded-xl border border-sky-100 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none cursor-pointer"
                  @click="handleAddressSearch"
                />
                <button
                  type="button"
                  @click="handleAddressSearch"
                  class="flex items-center gap-2 bg-sky-50 text-sky-600 rounded-xl px-4 py-3 hover:bg-sky-100 transition-colors font-medium whitespace-nowrap"
                >
                  <MapPin class="w-4 h-4" />
                  주소 검색
                </button>
              </div>

              <!-- 상세 주소 -->
              <div>
              <input
                v-model="form.addressDetail"
                type="text"
                placeholder="아파트 동/호수"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
            </div>

            <!-- 배송 메모 (공통) -->
            <div class="space-y-3">
              <select
                v-model="form.memo"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>배송 메모를 선택하세요</option>
                <option value="guard">부재시 경비실에 맡겨주세요</option>
                <option value="door">부재시 문 앞에 놓아주세요</option>
                <option value="call">배송 전 연락 부탁드립니다</option>
                <option value="custom">직접 입력</option>
              </select>
              </div>

              <!-- 직접 입력 -->
              <div v-if="form.memo === 'custom'">
              <input
                v-if="form.memo === 'custom'"
                v-model="form.memoCustom"
                type="text"
                placeholder="배송 메모를 입력하세요"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
            </div>
          </section>

          <!-- Section 2: 주문 상품 -->
          <section class="bg-white rounded-2xl border border-sky-100 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">
              주문 상품 {{ orderItems.length }}개
            </h2>

            <div class="space-y-0">
              <div
                  v-for="(item, index) in orderItems"
                  :key="item.productId"
                  class="py-4"
                  :class="{ 'border-b border-sky-50': index !== orderItems.length - 1 }"
              >
                <div class="flex gap-4">
                  <!-- Thumbnail -->
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex-shrink-0 overflow-hidden">
                    <img
                        v-if="item.thumbnailUrl"
                        :src="item.thumbnailUrl"
                        :alt="item.name"
                        class="w-full h-full object-cover"
                    />
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start gap-2">
                      <p class="font-medium text-slate-900 text-sm line-clamp-1">{{ item.name }}</p>
                      <span class="text-sm text-slate-500 whitespace-nowrap">수량: {{ item.quantity }}개</span>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                      <span class="text-xs text-slate-400">
                        {{ item.sellerNickName }} · 배송비 ₩{{ item.shippingFee.toLocaleString() }}
                      </span>
                      <span class="font-bold text-sky-600 text-sm">
                        ₩{{ (item.price * item.quantity).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: 결제 수단 -->
          <section class="bg-white rounded-2xl border border-sky-100 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">결제 수단</h2>

            <!-- Payment Method Cards -->
            <div class="grid grid-cols-2 gap-3">
              <!-- 카카오페이 -->
              <button
                  type="button"
                  @click="paymentMethod = 'kakao'"
                  class="rounded-2xl border-2 p-4 text-center cursor-pointer transition-all"
                  :class="[
                  paymentMethod === 'kakao'
                    ? 'border-[#FEE500] bg-[#FEE500]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                ]"
              >
                <span
                    class="font-bold text-sm"
                    :class="paymentMethod === 'kakao' ? 'text-slate-900' : 'text-slate-600'"
                >
                  카카오페이
                </span>
              </button>

              <!-- 토스페이먼츠 (신용/체크카드) -->
              <button
                  type="button"
                  @click="paymentMethod = 'card'"
                  class="rounded-2xl border-2 p-4 text-center cursor-pointer transition-all"
                  :class="[
                  paymentMethod === 'card'
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                ]"
              >
                <span
                    class="font-bold text-sm"
                    :class="paymentMethod === 'card' ? 'text-sky-600' : 'text-slate-600'"
                >
                  신용/체크카드
                </span>
              </button>
            </div>

            <!-- 카드 안내 (입력은 PortOne 팝업에서 처리) -->
            <div v-if="paymentMethod === 'card'" class="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <CreditCard class="w-4 h-4" />
              <span>결제 버튼을 누르면 토스페이먼츠 창이 열립니다.</span>
            </div>
          </section>
        </div>

        <!-- Right Column: Order Summary (Desktop) -->
        <div class="hidden lg:block w-80 sticky top-24">
          <div class="bg-white rounded-2xl border border-sky-100 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">주문 요약</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">상품 금액</span>
                <span class="text-slate-700">₩{{ orderSubtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">배송비</span>
                <span :class="orderShippingFee === 0 ? 'text-emerald-500' : 'text-slate-700'">
                  {{ orderShippingFee === 0 ? '무료' : `₩${orderShippingFee.toLocaleString()}` }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">할인</span>
                <span class="text-slate-700">-₩0</span>
              </div>

              <div class="border-t border-sky-100 pt-3 mt-3">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-slate-900">총 결제금액</span>
                  <span class="font-black text-xl text-sky-600">
                    ₩{{ orderTotalPrice.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Safety Badges -->
            <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-sky-50">
              <div class="flex items-center gap-1 text-xs text-slate-400">
                <Lock class="w-3 h-3" />
                <span>에스크로 안전결제</span>
              </div>
              <div class="flex items-center gap-1 text-xs text-slate-400">
                <Thermometer class="w-3 h-3" />
                <span>날씨 연동 배송</span>
              </div>
              <div class="flex items-center gap-1 text-xs text-slate-400">
                <Fish class="w-3 h-3" />
                <span>생물 사체 보상</span>
              </div>
            </div>

            <!-- Order Button (Desktop) -->
            <button
                type="button"
                @click="handleOrder"
                :disabled="!isFormValid || isSubmitting"
                class="mt-6 w-full py-4 rounded-full font-bold transition-colors"
                :class="[
                !isFormValid || isSubmitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 text-white'
              ]"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <Loader2 class="w-5 h-5 animate-spin" />
                결제 진행 중...
              </span>
              <span v-else>
                ₩{{ orderTotalPrice.toLocaleString() }} 주문하기
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Fixed Bottom Bar -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sky-100 px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div class="flex flex-col gap-3">
        <!-- Safety Badges -->
        <div class="flex justify-center gap-4">
          <div class="flex items-center gap-1 text-xs text-slate-400">
            <Lock class="w-3 h-3" />
            <span>에스크로</span>
          </div>
          <div class="flex items-center gap-1 text-xs text-slate-400">
            <Thermometer class="w-3 h-3" />
            <span>날씨 연동</span>
          </div>
          <div class="flex items-center gap-1 text-xs text-slate-400">
            <Fish class="w-3 h-3" />
            <span>생물 보상</span>
          </div>
        </div>

        <!-- Order Button -->
        <button
            type="button"
            @click="handleOrder"
            :disabled="!isFormValid || isSubmitting"
            class="w-full py-4 rounded-full font-bold transition-colors"
            :class="[
            !isFormValid || isSubmitting
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          ]"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
            <Loader2 class="w-5 h-5 animate-spin" />
            결제 진행 중...
          </span>
          <span v-else>
            ₩{{ orderTotalPrice.toLocaleString() }} 주문하기
          </span>
        </button>
      </div>
    </div>
  </main>
</template>
