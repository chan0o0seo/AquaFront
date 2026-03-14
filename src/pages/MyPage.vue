<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Package, Gavel, Heart, Fish, Bell, Store, Settings, Loader2, CheckCircle, Clock, XCircle, MapPin, ShoppingBag } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSellerApplication } from '@/composables/useSellerApplication'
import { orderApi, productApi, memberApi, ORDER_STATUS_LABEL, type OrderResponse, type OrderStatus, type NotificationType } from '@/api'
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

const pendingOrderCount = computed(() =>
  allOrders.value.filter(o => o.status === 'PENDING' || o.status === 'PAID').length
)

const recentOrders = computed(() =>
  [...allOrders.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
)

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:   'bg-slate-100 text-slate-500',
  PAID:      'bg-sky-100 text-sky-600',
  SHIPPING:  'bg-amber-100 text-amber-600',
  DELIVERED: 'bg-teal-100 text-teal-600',
  CONFIRMED: 'bg-emerald-100 text-emerald-600',
  CANCELLED: 'bg-red-100 text-red-500',
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
    const [orders, wishlist] = await Promise.all([
      orderApi.getMyOrders(),
      productApi.getMyWishlist(),
    ])
    allOrders.value = orders
    wishlistCount.value = wishlist.length
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
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-2xl font-black mx-auto">
                {{ user.initial }}
              </div>
              <!-- Nickname -->
              <div class="text-center mt-4">
                <div class="font-bold text-slate-900">{{ user.nickname }}</div>
                <span :class="['rounded-full text-xs px-3 py-1 inline-block mt-2', memberTypeBadge.class]">
                  {{ memberTypeBadge.label }}
                </span>
              </div>
              <!-- Edit Profile -->
              <button
                  @click="showProfileEditModal = true"
                  class="text-sm text-sky-500 hover:underline cursor-pointer mt-3 block mx-auto"
              >
                프로필 편집
              </button>
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
            <h1 class="text-3xl font-black text-slate-900 mb-6">홈 요약</h1>

            <!-- 로딩 -->
            <div v-if="isSummaryLoading" class="flex justify-center py-20">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>

            <template v-else>
              <!-- Stat Cards -->
              <div class="grid grid-cols-2 gap-4 mb-8">
                <div
                  class="bg-sky-50 rounded-2xl p-5 border border-sky-100 cursor-pointer hover:border-sky-300 transition-colors"
                  @click="activeTab = 'orders'"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                      <Package class="w-5 h-5 text-sky-500" />
                    </div>
                    <span class="text-sm text-slate-500">주문 대기</span>
                  </div>
                  <div class="text-3xl font-black text-slate-900">{{ pendingOrderCount }}<span class="text-base font-normal text-slate-400 ml-1">건</span></div>
                </div>
                <div
                  class="bg-sky-50 rounded-2xl p-5 border border-sky-100 cursor-pointer hover:border-sky-300 transition-colors"
                  @click="activeTab = 'wishlist'"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                      <Heart class="w-5 h-5 text-red-400" />
                    </div>
                    <span class="text-sm text-slate-500">찜한 상품</span>
                  </div>
                  <div class="text-3xl font-black text-slate-900">{{ wishlistCount }}<span class="text-base font-normal text-slate-400 ml-1">개</span></div>
                </div>
              </div>

              <!-- Recent Orders -->
              <section>
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold text-slate-900">최근 주문</h2>
                  <button
                    @click="activeTab = 'orders'"
                    class="text-sm text-sky-500 hover:underline"
                  >전체보기</button>
                </div>

                <!-- 주문 없음 -->
                <div v-if="recentOrders.length === 0" class="bg-sky-50 rounded-2xl p-10 text-center border border-sky-100">
                  <ShoppingBag class="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p class="text-slate-400 text-sm">아직 주문 내역이 없어요</p>
                </div>

                <div v-else class="rounded-2xl border border-sky-100 overflow-hidden">
                  <div
                    v-for="(order, idx) in recentOrders"
                    :key="order.orderId"
                    @click="goToOrderDetail(order.orderId)"
                    class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-sky-50 transition-colors"
                    :class="idx < recentOrders.length - 1 ? 'border-b border-sky-50' : ''"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        <Package class="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <div class="font-medium text-slate-900 text-sm">{{ orderTitle(order) }}</div>
                        <div class="text-xs text-slate-400 mt-0.5">{{ formatDate2(order.createdAt) }}</div>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="STATUS_COLOR[order.status]">
                        {{ ORDER_STATUS_LABEL[order.status] }}
                      </span>
                      <div class="text-sm font-semibold text-slate-900 mt-1.5">
                        ₩{{ order.totalAmount.toLocaleString() }}
                      </div>
                    </div>
                  </div>
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
