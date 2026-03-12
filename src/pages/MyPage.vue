<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Package, Gavel, Heart, Fish, Bell, Store, Settings, Loader2, CheckCircle, Clock, XCircle, MapPin } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSellerApplication } from '@/composables/useSellerApplication'
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

// Stats data
const stats = ref({
  pendingOrders: 2,
  activeAuctions: 3,
  wishlist: 15
})

// Recent orders
const recentOrders = ref([
  { id: 1, name: '레드 크리스탈 새우 10마리', date: '2025-01-15', status: '배송중', price: '45,000원' },
  { id: 2, name: '수초 종합 세트', date: '2025-01-14', status: '배송완료', price: '32,000원' },
  { id: 3, name: 'ADA 어항 60cm', date: '2025-01-12', status: '배송완료', price: '180,000원' },
])

// Active auctions
const activeAuctions = ref([
  { id: 1, name: '슈퍼레드 아로와나', currentBid: '850,000원', myBid: '800,000원', timeLeft: '02:15:30' },
  { id: 2, name: '플래티넘 엔젤피쉬', currentBid: '120,000원', myBid: '120,000원', timeLeft: '05:42:18' },
])

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
watch(activeTab, (tab) => {
  if (tab === 'seller' && user.value.memberType === 'buyer') {
    fetchApplicationStatus()
  }
})

// Member type badge
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

console.log(user.value);
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

            <!-- Stat Cards -->
            <div class="grid grid-cols-3 gap-4 mb-8">
              <div class="bg-sky-50 rounded-2xl p-5 border border-sky-100">
                <div class="text-3xl font-black text-slate-900">{{ stats.pendingOrders }}</div>
                <div class="text-sm text-slate-500 mt-1">주문 대기 <span class="text-slate-400">건</span></div>
              </div>
              <div class="bg-sky-50 rounded-2xl p-5 border border-sky-100">
                <div class="flex items-center gap-2">
                  <span class="text-3xl font-black text-slate-900">{{ stats.activeAuctions }}</span>
                  <span class="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">입찰중</span>
                </div>
                <div class="text-sm text-slate-500 mt-1">진행 중 경매</div>
              </div>
              <div class="bg-sky-50 rounded-2xl p-5 border border-sky-100">
                <div class="text-3xl font-black text-slate-900">{{ stats.wishlist }}</div>
                <div class="text-sm text-slate-500 mt-1">찜한 상품</div>
              </div>
            </div>

            <!-- Recent Orders -->
            <section class="mb-8">
              <h2 class="text-xl font-bold text-slate-900 mb-4">최근 주문</h2>
              <div class="space-y-0">
                <div
                    v-for="order in recentOrders"
                    :key="order.id"
                    @click="goToOrderDetail(order.id)"
                    class="flex items-center justify-between border-b border-sky-50 py-4 cursor-pointer hover:bg-sky-50 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-200 to-teal-200"></div>
                    <div>
                      <div class="font-medium text-slate-900">{{ order.name }}</div>
                      <div class="text-sm text-slate-400">{{ order.date }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span
                        class="text-xs px-2 py-1 rounded-full"
                        :class="order.status === '배송중' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'"
                    >
                      {{ order.status }}
                    </span>
                    <div class="text-sm font-semibold text-slate-900 mt-1">{{ order.price }}</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Active Auctions -->
            <section>
              <h2 class="text-xl font-bold text-slate-900 mb-4">참여 중인 경매</h2>
              <div class="space-y-4">
                <div
                    v-for="auction in activeAuctions"
                    :key="auction.id"
                    class="flex gap-4 bg-sky-50 rounded-2xl p-4"
                >
                  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-200 to-teal-200 flex-shrink-0"></div>
                  <div class="flex-1">
                    <div class="font-medium text-slate-900">{{ auction.name }}</div>
                    <div class="flex items-center gap-4 mt-2 text-sm">
                      <div>
                        <span class="text-slate-500">현재가</span>
                        <span class="font-bold text-sky-600 ml-1">{{ auction.currentBid }}</span>
                      </div>
                      <div>
                        <span class="text-slate-500">내 입찰가</span>
                        <span class="font-semibold text-slate-700 ml-1">{{ auction.myBid }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-amber-500 font-mono text-lg font-bold">{{ auction.timeLeft }}</div>
                    <div class="text-xs text-slate-400">남은 시간</div>
                  </div>
                </div>
              </div>
            </section>
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
                    @click="notifications.auctionEnd = !notifications.auctionEnd"
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
                    @click="notifications.newBreeder = !notifications.newBreeder"
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
                    @click="notifications.orderStatus = !notifications.orderStatus"
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
                    @click="notifications.marketing = !notifications.marketing"
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
