<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Package, Gavel, Heart, Fish, Bell, Store, Settings, Loader2, CheckCircle, Clock, XCircle, MapPin, ShoppingBag, Truck, ChevronRight, Search, Edit3 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSellerApplication } from '@/composables/useSellerApplication'
import { orderApi, productApi, memberApi, ORDER_STATUS_LABEL, type OrderResponse, type OrderStatus, type NotificationType } from '@/api'
import type { MyBidResponse } from '@/api/auction.api'
import WishlistTab from '../components/mypage/WishlistTab.vue'
import AccountSettingsTab from '../components/mypage/AccountSettingsTab.vue'
import ProfileEditModal from '../components/mypage/ProfileEditModal.vue'
import TankProfileTab from '../components/mypage/TankProfileTab.vue'
import OrdersTab from '../components/mypage/OrdersTab.vue'
import AuctionsTab from '../components/mypage/AuctionsTab.vue'
import DeliveryAddressTab from '../components/mypage/DeliveryAddressTab.vue'

const router = useRouter()
const authStore = useAuthStore()
const { user: authUser } = storeToRefs(authStore)
const {
  applicationStatus,
  applicationData,
  hasProfile,
  isLoading: isLoadingApplication,
  fetchApplicationStatus,
  reapply,
  formatDate,
} = useSellerApplication()

// Derived user display
const user = computed(() => ({
  nickname: authUser.value?.nickName,
  initial: authUser.value?.nickName.charAt(0),
  memberType: (authUser.value?.role?.toLowerCase() ?? 'buyer') as 'buyer' | 'seller' | 'breeder',
}))

// Active tab
const activeTab = ref('summary')

// Summary data
const isSummaryLoading = ref(false)
const allOrders = ref<OrderResponse[]>([])
const wishlistCount = ref(0)
const myBids = ref<MyBidResponse[]>([])

// 인사말 (시간대별)
const greeting = computed(() => {
  const h = new Date().getHours()
  const name = authUser.value?.nickName ?? ''
  if (h < 6)  return `밤 늦게도 물생활이죠, ${name}님 🌙`
  if (h < 12) return `좋은 아침이에요, ${name}님 🌅`
  if (h < 18) return `안녕하세요, ${name}님 🐠`
  return `오늘 하루도 수고하셨어요, ${name}님 🌇`
})

// 상태별 카운트
const statCounts = computed(() => ({
  paid:      allOrders.value.filter(o => o.status === 'PAID').length,
  shipping:  allOrders.value.filter(o => o.status === 'SHIPPING').length,
  delivered: allOrders.value.filter(o => o.status === 'DELIVERED').length,
  confirmed: allOrders.value.filter(o => o.status === 'CONFIRMED').length,
  activeBids: myBids.value.filter(b => b.status === 'ACTIVE').length,
}))

// 구매확정 대기 주문 (DELIVERED)
const pendingConfirmOrders = computed(() =>
  allOrders.value.filter(o => o.status === 'DELIVERED')
)

// 배송중 주문 중 송장 있는 것 (최신 1개)
const latestShipping = computed(() =>
  [...allOrders.value]
    .filter(o => o.status === 'SHIPPING' && o.trackingNumber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
)

const recentOrders = computed(() =>
  [...allOrders.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
)

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   'bg-slate-100 text-slate-500',
  PAID:      'bg-sky-100 text-sky-600',
  SHIPPING:  'bg-blue-100 text-blue-600',
  DELIVERED: 'bg-teal-100 text-teal-600',
  CONFIRMED: 'bg-emerald-100 text-emerald-600',
  CANCELLED: 'bg-red-100 text-red-400',
}

function orderTitle(order: OrderResponse) {
  const first = order.items[0]?.productName ?? '상품'
  return order.items.length > 1 ? `${first} 외 ${order.items.length - 1}건` : first
}

function formatDate2(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.')
}

async function loadSummary() {
  isSummaryLoading.value = true
  try {
    const [orders, wishlist, bids] = await Promise.all([
      orderApi.getMyOrders(),
      productApi.getMyWishlist(),
      auctionApi.getMyBids(),
    ])
    allOrders.value = orders
    wishlistCount.value = wishlist.length
    myBids.value = bids
  } catch {
    // 에러 무시 — 빈 상태로 표시
  } finally {
    isSummaryLoading.value = false
  }
}

onMounted(loadSummary)

// Menu items
const menuItems = computed(() => {
  const items = [
    { key: 'summary', icon: Home, label: '홈 요약' },
    { key: 'orders', icon: Package, label: '주문 내역' },
    { key: 'auctions', icon: Gavel, label: '참여 경매' },
    { key: 'wishlist', icon: Heart, label: '찜 목록' },
    { key: 'addresses', icon: MapPin, label: '배송지 관리' },
    { key: 'tank', icon: Fish, label: '내 수조 프로필' },
    { key: 'notifications', icon: Bell, label: '알림 설정' },
  ]

  if (user.value.memberType !== 'seller' && user.value.memberType !== 'breeder') {
    items.push({ key: 'seller', icon: Store, label: '판매자 전환 신청' })
  }

  items.push({ key: 'settings', icon: Settings, label: '계정 설정' })

  return items
})

// 판매자 탭 진입 시 신청 상태 조회 (BUYER 전용)
// 알림 탭 진입 시 설정 조회
watch(activeTab, (tab) => {
  if (tab === 'seller' && user.value.memberType === 'buyer') {
    fetchApplicationStatus()
  }
  if (tab === 'notifications') {
    loadNotificationSettings()
  }
})

const memberTypeBadge = computed(() => {
  const types = {
    buyer: { label: '일반 구매자', class: 'bg-sky-100 text-sky-600' },
    seller: { label: '수족관 운영자', class: 'bg-amber-100 text-amber-600' },
    breeder: { label: '홈 브리더', class: 'bg-emerald-100 text-emerald-600' },
  }
  return types[user.value.memberType]
})

// Notification toggles
const notifications = ref({
  auctionEnd: true,
  newBreeder: true,
  orderStatus: true,
  marketing: false
})

async function loadNotificationSettings() {
  try {
    const settings = await memberApi.getNotificationSettings()
    for (const s of settings) {
      if (s.type === 'AUCTION_ENDING')       notifications.value.auctionEnd = s.enabled
      if (s.type === 'FOLLOWED_NEW_PRODUCT') notifications.value.newBreeder = s.enabled
      if (s.type === 'ORDER_DELIVERY')       notifications.value.orderStatus = s.enabled
      if (s.type === 'MARKETING')            notifications.value.marketing  = s.enabled
    }
  } catch {
    // 실패 시 기본값 유지
  }
}

const notificationTypeMap: Record<keyof typeof notifications.value, NotificationType> = {
  auctionEnd: 'AUCTION_ENDING',
  newBreeder: 'FOLLOWED_NEW_PRODUCT',
  orderStatus: 'ORDER_DELIVERY',
  marketing: 'MARKETING',
}

async function toggleNotification(key: keyof typeof notifications.value) {
  const newValue = !notifications.value[key]
  notifications.value[key] = newValue
  try {
    await memberApi.updateNotificationSetting(notificationTypeMap[key], newValue)
  } catch {
    notifications.value[key] = !newValue // 실패 시 롤백
  }
}

// Profile edit modal
const showProfileEditModal = ref(false)

function onProfileSaved(updated: { nickname: string }) {
  if (authUser.value) {
    authUser.value.nickName = updated.nickname
  }
}

function goToOrderDetail(orderId: number) {
  router.push(`/orders/${orderId}`)
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">
      <div class="flex gap-8">
        <!-- Left Sidebar -->
        <aside class="w-64 flex-shrink-0">
          <div class="sticky top-24">
            <!-- Profile Card -->
            <div class="bg-sky-50 rounded-2xl p-6 border border-sky-100 mb-6">
              <!-- Avatar -->
              <div class="relative w-20 h-20 mx-auto">
                <img
                  v-if="authUser?.profileImageUrl"
                  :src="authUser.profileImageUrl"
                  class="w-20 h-20 rounded-full object-cover border-2 border-sky-200"
                />
                <div
                  v-else
                  class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-3xl font-black"
                >
                  {{ user.initial }}
                </div>
                <button
                  @click="showProfileEditModal = true"
                  class="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-sky-200 rounded-full flex items-center justify-center hover:bg-sky-50 transition-colors shadow-sm"
                >
                  <Edit3 class="w-3.5 h-3.5 text-sky-500" />
                </button>
              </div>
              <!-- Nickname & email -->
              <div class="text-center mt-4">
                <div class="font-bold text-slate-900 text-lg">{{ user.nickname }}</div>
                <div class="text-xs text-slate-400 mt-0.5">{{ authUser?.email }}</div>
                <span :class="['rounded-full text-xs px-3 py-1 inline-block mt-2 font-medium', memberTypeBadge.class]">
                  {{ memberTypeBadge.label }}
                </span>
              </div>
              <!-- Stats row -->
              <div class="grid grid-cols-3 gap-1 mt-4 pt-4 border-t border-sky-100 text-center">
                <button @click="activeTab = 'orders'" class="hover:bg-sky-100 rounded-xl py-1.5 transition-colors">
                  <div class="text-lg font-black text-slate-900">{{ allOrders.length }}</div>
                  <div class="text-xs text-slate-400">주문</div>
                </button>
                <button @click="activeTab = 'wishlist'" class="hover:bg-sky-100 rounded-xl py-1.5 transition-colors">
                  <div class="text-lg font-black text-slate-900">{{ wishlistCount }}</div>
                  <div class="text-xs text-slate-400">찜</div>
                </button>
                <button @click="activeTab = 'auctions'" class="hover:bg-sky-100 rounded-xl py-1.5 transition-colors">
                  <div class="text-lg font-black text-slate-900">{{ myBids.length }}</div>
                  <div class="text-xs text-slate-400">입찰</div>
                </button>
              </div>
            </div>

            <!-- Navigation Menu -->
            <nav class="space-y-1">
              <button
                  v-for="item in menuItems"
                  :key="item.key"
                  @click="activeTab = item.key"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors duration-150 text-left"
                  :class="activeTab === item.key
                  ? 'bg-sky-50 text-sky-600 font-semibold'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span>{{ item.label }}</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Right Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Summary Tab -->
          <div v-show="activeTab === 'summary'">
            <!-- 인사말 -->
            <div class="mb-6">
              <h1 class="text-2xl font-black text-slate-900">{{ greeting }}</h1>
              <p class="text-slate-400 text-sm mt-1">{{ new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}</p>
            </div>

            <!-- 로딩 -->
            <div v-if="isSummaryLoading" class="flex justify-center py-20">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>

            <template v-else>

              <!-- 주문 상태 스트립 -->
              <div class="grid grid-cols-5 gap-2 mb-6">
                <div
                  v-for="stat in [
                    { label: '결제완료', count: statCounts.paid,      icon: Package, color: 'text-sky-500',     tab: 'orders' },
                    { label: '배송중',   count: statCounts.shipping,   icon: Truck,   color: 'text-blue-500',    tab: 'orders' },
                    { label: '배송완료', count: statCounts.delivered,  icon: CheckCircle, color: 'text-teal-500',tab: 'orders' },
                    { label: '구매확정', count: statCounts.confirmed,  icon: CheckCircle, color: 'text-emerald-500', tab: 'orders' },
                    { label: '입찰중',   count: statCounts.activeBids, icon: Gavel,   color: 'text-amber-500',   tab: 'auctions' },
                  ]"
                  :key="stat.label"
                  class="bg-sky-50 rounded-2xl p-3 border border-sky-100 text-center cursor-pointer hover:border-sky-300 transition-colors"
                  @click="activeTab = stat.tab"
                >
                  <component :is="stat.icon" class="w-4 h-4 mx-auto mb-1" :class="stat.color" />
                  <div class="text-xl font-black text-slate-900">{{ stat.count }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ stat.label }}</div>
                </div>
              </div>

              <!-- 구매확정 유도 배너 -->
              <div
                v-if="pendingConfirmOrders.length > 0"
                class="mb-5 flex items-center justify-between gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 cursor-pointer hover:bg-teal-100 transition-colors"
                @click="activeTab = 'orders'"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-teal-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div class="font-bold text-teal-800 text-sm">구매확정 대기 {{ pendingConfirmOrders.length }}건</div>
                    <div class="text-xs text-teal-600">배송 받으셨다면 구매확정을 눌러주세요</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-teal-400 flex-shrink-0" />
              </div>

              <!-- 배송 추적 배너 -->
              <div
                v-if="latestShipping"
                class="mb-5 flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 cursor-pointer hover:bg-blue-100 transition-colors"
                @click="goToOrderDetail(latestShipping.orderId)"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-blue-400 flex items-center justify-center flex-shrink-0">
                    <Truck class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div class="font-bold text-blue-800 text-sm">{{ orderTitle(latestShipping) }} — 배송중</div>
                    <div class="text-xs text-blue-500 font-mono mt-0.5">{{ latestShipping.courier }} · {{ latestShipping.trackingNumber }}</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-blue-400 flex-shrink-0" />
              </div>

              <!-- 최근 주문 -->
              <section class="mb-8">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-bold text-slate-900">최근 주문</h2>
                  <button @click="activeTab = 'orders'" class="flex items-center gap-0.5 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors">
                    전체보기 <ChevronRight class="w-4 h-4" />
                  </button>
                </div>

                <div v-if="recentOrders.length === 0" class="bg-sky-50 rounded-2xl p-10 text-center border border-sky-100">
                  <ShoppingBag class="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p class="text-slate-400 text-sm mb-3">아직 주문 내역이 없어요</p>
                  <button @click="router.push('/search')" class="text-sm font-semibold text-sky-500 hover:text-sky-600">쇼핑 시작하기 →</button>
                </div>

                <div v-else class="rounded-2xl border border-sky-100 overflow-hidden bg-white">
                  <div
                    v-for="(order, idx) in recentOrders"
                    :key="order.orderId"
                    @click="goToOrderDetail(order.orderId)"
                    class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-sky-50 transition-colors"
                    :class="idx < recentOrders.length - 1 ? 'border-b border-sky-50' : ''"
                  >
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                      <Package class="w-5 h-5 text-sky-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-slate-800 text-sm line-clamp-1">{{ orderTitle(order) }}</div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-xs text-slate-400">{{ formatDate2(order.createdAt) }}</span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="STATUS_COLOR[order.status]">
                          {{ ORDER_STATUS_LABEL[order.status] }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="text-sm font-bold text-sky-600">₩{{ order.totalAmount.toLocaleString() }}</div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 빠른 메뉴 -->
              <section>
                <h2 class="text-lg font-bold text-slate-900 mb-4">바로가기</h2>
                <div class="grid grid-cols-4 gap-3">
                  <button
                    @click="router.push('/search')"
                    class="flex flex-col items-center gap-2 py-5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-colors"
                  >
                    <Search class="w-6 h-6" />
                    <span class="text-xs font-semibold">쇼핑하기</span>
                  </button>
                  <button
                    @click="router.push('/auction')"
                    class="flex flex-col items-center gap-2 py-5 bg-sky-50 hover:bg-sky-100 text-slate-700 rounded-2xl border border-sky-100 transition-colors"
                  >
                    <Gavel class="w-6 h-6 text-sky-500" />
                    <span class="text-xs font-semibold">경매 참여</span>
                  </button>
                  <button
                    @click="activeTab = 'wishlist'"
                    class="flex flex-col items-center gap-2 py-5 bg-sky-50 hover:bg-sky-100 text-slate-700 rounded-2xl border border-sky-100 transition-colors relative"
                  >
                    <Heart class="w-6 h-6 text-red-400" />
                    <span class="text-xs font-semibold">찜 목록</span>
                    <span v-if="wishlistCount > 0" class="absolute top-2 right-2 bg-red-400 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                      {{ wishlistCount > 9 ? '9+' : wishlistCount }}
                    </span>
                  </button>
                  <button
                    @click="activeTab = 'addresses'"
                    class="flex flex-col items-center gap-2 py-5 bg-sky-50 hover:bg-sky-100 text-slate-700 rounded-2xl border border-sky-100 transition-colors"
                  >
                    <MapPin class="w-6 h-6 text-sky-500" />
                    <span class="text-xs font-semibold">배송지</span>
                  </button>
                </div>
              </section>

            </template>
          </div>

          <!-- Delivery Address Tab -->
          <div v-show="activeTab === 'addresses'">
            <DeliveryAddressTab />
          </div>

          <!-- Tank Profile Tab -->
          <div v-show="activeTab === 'tank'">
            <TankProfileTab />
          </div>

          <!-- Notifications Tab -->
          <div v-show="activeTab === 'notifications'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">알림 설정</h1>

            <div class="space-y-0">
              <div class="flex justify-between items-center py-4 border-b border-sky-50">
                <span class="text-slate-700">경매 종료 임박 알림</span>
                <button
                    @click="toggleNotification('auctionEnd')"
                    class="w-12 h-6 rounded-full transition-all duration-200 relative"
                    :class="notifications.auctionEnd ? 'bg-sky-500' : 'bg-slate-200'"
                >
                  <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                      :class="notifications.auctionEnd ? 'left-7' : 'left-1'"
                  ></span>
                </button>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-sky-50">
                <span class="text-slate-700">팔로우한 브리더 신규 개체 등록</span>
                <button
                    @click="toggleNotification('newBreeder')"
                    class="w-12 h-6 rounded-full transition-all duration-200 relative"
                    :class="notifications.newBreeder ? 'bg-sky-500' : 'bg-slate-200'"
                >
                  <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                      :class="notifications.newBreeder ? 'left-7' : 'left-1'"
                  ></span>
                </button>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-sky-50">
                <span class="text-slate-700">주문 배송 상태 변경</span>
                <button
                    @click="toggleNotification('orderStatus')"
                    class="w-12 h-6 rounded-full transition-all duration-200 relative"
                    :class="notifications.orderStatus ? 'bg-sky-500' : 'bg-slate-200'"
                >
                  <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                      :class="notifications.orderStatus ? 'left-7' : 'left-1'"
                  ></span>
                </button>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-sky-50">
                <span class="text-slate-700">마케팅 및 이벤트 알림</span>
                <button
                    @click="toggleNotification('marketing')"
                    class="w-12 h-6 rounded-full transition-all duration-200 relative"
                    :class="notifications.marketing ? 'bg-sky-500' : 'bg-slate-200'"
                >
                  <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                      :class="notifications.marketing ? 'left-7' : 'left-1'"
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Orders Tab -->
          <div v-show="activeTab === 'orders'">
            <OrdersTab />
          </div>

          <!-- Auctions Tab -->
          <div v-show="activeTab === 'auctions'">
            <AuctionsTab />
          </div>

          <!-- Wishlist Tab -->
          <div v-show="activeTab === 'wishlist'">
            <WishlistTab />
          </div>

          <!-- Seller Tab -->
          <div v-show="activeTab === 'seller'">
            <!-- 판매자/브리더: 대시보드 이동 -->
            <template v-if="user.memberType === 'seller' || user.memberType === 'breeder'">
              <h1 class="text-3xl font-black text-slate-900 mb-6">판매자 센터</h1>
              <div class="bg-sky-50 rounded-2xl p-8 border border-sky-100 text-center">
                <p class="text-slate-600 mb-4">대시보드에서 상품과 통계를 관리하세요.</p>
                <button
                  @click="router.push('/mypage/seller')"
                  class="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors"
                >
                  판매자 센터로 이동
                </button>
              </div>
            </template>

            <!-- 일반 구매자: 판매자 전환 신청 플로우 -->
            <template v-else>
              <h1 class="text-3xl font-black text-slate-900 mb-6">판매자 전환 신청</h1>

              <!-- 로딩 -->
              <div v-if="isLoadingApplication" class="flex justify-center py-16">
                <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
              </div>

              <!-- 신청 없음 -->
              <div v-else-if="!applicationStatus" class="bg-sky-50 rounded-2xl p-8 border border-sky-100">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Store class="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-slate-900 mb-1">판매자로 활동하고 싶으신가요?</h2>
                    <p class="text-sm text-slate-500 mb-5">사업자 정보를 입력하고 판매자 전환을 신청하세요. 보통 1~3 영업일 내 심사가 완료됩니다.</p>
                    <div class="flex gap-3 text-sm text-slate-600 mb-6">
                      <div class="flex items-center gap-1.5"><CheckCircle class="w-4 h-4 text-emerald-500" />상품/경매 등록</div>
                      <div class="flex items-center gap-1.5"><CheckCircle class="w-4 h-4 text-emerald-500" />판매 통계 조회</div>
                      <div class="flex items-center gap-1.5"><CheckCircle class="w-4 h-4 text-emerald-500" />스토어 페이지</div>
                    </div>
                    <button
                      @click="router.push('/seller/apply')"
                      class="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors"
                    >
                      판매자 신청하기
                    </button>
                  </div>
                </div>
              </div>

              <!-- 심사 중 -->
              <div v-else-if="applicationStatus === 'PENDING'" class="bg-amber-50 rounded-2xl p-8 border border-amber-100">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock class="w-6 h-6 text-amber-500" />
                  </div>
                  <div class="flex-1">
                    <h2 class="text-lg font-bold text-slate-900 mb-1">심사가 진행 중입니다</h2>
                    <p class="text-sm text-slate-500 mb-4">보통 1~3 영업일 내에 결과를 알려드립니다.</p>
                    <div class="space-y-1 text-sm text-slate-600">
                      <div><span class="text-slate-400 w-24 inline-block">상호명</span>{{ applicationData?.businessName }}</div>
                      <div><span class="text-slate-400 w-24 inline-block">신청일</span>{{ applicationData?.createdAt ? formatDate(applicationData.createdAt) : '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 승인됨 → 프로필 설정 필요 -->
              <div v-else-if="applicationStatus === 'APPROVED' && !hasProfile" class="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle class="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-slate-900 mb-1">판매자 신청이 승인되었습니다! 🎉</h2>
                    <p class="text-sm text-slate-500 mb-5">스토어 프로필을 설정하면 판매 활동을 시작할 수 있습니다.</p>
                    <button
                      @click="router.push('/seller/profile/setup')"
                      class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-colors"
                    >
                      프로필 설정하기
                    </button>
                  </div>
                </div>
              </div>

              <!-- 반려됨 -->
              <div v-else-if="applicationStatus === 'REJECTED'" class="bg-red-50 rounded-2xl p-8 border border-red-100">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle class="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-slate-900 mb-1">신청이 반려되었습니다</h2>
                    <div v-if="applicationData?.rejectionReason" class="mt-2 mb-4 bg-white rounded-xl p-4 border border-red-100 text-sm text-slate-600">
                      <span class="font-semibold text-red-500 block mb-1">반려 사유</span>
                      {{ applicationData.rejectionReason }}
                    </div>
                    <button
                      @click="reapply(); router.push('/seller/apply')"
                      class="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors"
                    >
                      재신청하기
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Settings Tab -->
          <div v-show="activeTab === 'settings'">
            <AccountSettingsTab v-if="authUser" :user="authUser" />
          </div>
        </div>
      </div>
    </main>

    <!-- Profile Edit Modal -->
    <ProfileEditModal
        v-model="showProfileEditModal"
        :user="user"
        @saved="onProfileSaved"
    />
  </div>
</template>
