<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Package, Gavel, Heart, Fish, Bell, Store, Settings } from 'lucide-vue-next'

const router = useRouter()

// User data (mock)
const user = ref({
  nickname: '아쿠아리스트',
  initial: '아',
  memberType: 'seller' as 'buyer' | 'seller' | 'breeder'
})

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
    { key: 'tank', icon: Fish, label: '내 수조 프로필' },
    { key: 'notifications', icon: Bell, label: '알림 설정' },
  ]
  
  if (user.value.memberType === 'seller' || user.value.memberType === 'breeder') {
    items.push({ key: 'seller', icon: Store, label: '판매자 센터' })
  }
  
  items.push({ key: 'settings', icon: Settings, label: '계정 설정' })
  
  return items
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

// Tank profile
const hasTank = ref(false)
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
              <button class="text-sm text-sky-500 hover:underline cursor-pointer mt-3 block mx-auto">
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
                  class="flex items-center justify-between border-b border-sky-50 py-4"
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

          <!-- Tank Profile Tab -->
          <div v-show="activeTab === 'tank'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">내 수조 프로필</h1>
            
            <div v-show="!hasTank" class="text-center py-16">
              <div class="text-6xl mb-4">🐠</div>
              <p class="text-slate-500 mb-6">아직 등록된 수조가 없어요</p>
              <button 
                @click="hasTank = true"
                class="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200"
              >
                수조 프로필 만들기
              </button>
            </div>

            <div v-show="hasTank" class="bg-sky-50 rounded-2xl p-6 border border-sky-100">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-bold text-slate-900 text-lg">거실 수초 수조</h3>
                  <p class="text-slate-500 text-sm">60cm 수초 수조</p>
                </div>
                <button class="text-sm text-sky-500 hover:underline">편집</button>
              </div>
              
              <div class="mb-4">
                <span class="text-sm text-slate-500 block mb-2">키우는 물고기</span>
                <div class="flex flex-wrap gap-2">
                  <span class="rounded-full bg-sky-50 border border-sky-100 text-slate-600 px-3 py-1 text-sm">네온테트라</span>
                  <span class="rounded-full bg-sky-50 border border-sky-100 text-slate-600 px-3 py-1 text-sm">레드 체리 새우</span>
                  <span class="rounded-full bg-sky-50 border border-sky-100 text-slate-600 px-3 py-1 text-sm">코리도라스</span>
                </div>
              </div>

              <div class="border-2 border-dashed border-sky-200 rounded-xl p-8 text-center">
                <p class="text-slate-400 text-sm">수조 레이아웃 사진 업로드</p>
              </div>
            </div>
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
            <h1 class="text-3xl font-black text-slate-900 mb-6">주문 내역</h1>
            <div class="space-y-0">
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="flex items-center justify-between border-b border-sky-50 py-4"
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
          </div>

          <!-- Auctions Tab -->
          <div v-show="activeTab === 'auctions'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">참여 경매</h1>
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
          </div>

          <!-- Wishlist Tab -->
          <div v-show="activeTab === 'wishlist'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">찜 목록</h1>
            <p class="text-slate-500">찜한 상품이 여기에 표시됩니다.</p>
          </div>

          <!-- Seller Tab -->
          <div v-show="activeTab === 'seller'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">판매자 센터</h1>
            <div class="bg-sky-50 rounded-2xl p-8 border border-sky-100 text-center">
              <p class="text-slate-600 mb-4">판매자 전용 대시보드에서 상품과 통계를 관리하세요.</p>
              <button
                @click="router.push('/mypage/seller')"
                class="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors"
              >
                판매자 센터로 이동
              </button>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-show="activeTab === 'settings'">
            <h1 class="text-3xl font-black text-slate-900 mb-6">계정 설정</h1>
            <p class="text-slate-500">계정 관련 설정을 여기에서 변경하세요.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
