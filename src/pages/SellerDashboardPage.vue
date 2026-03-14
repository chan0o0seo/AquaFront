<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, Package, Plus, Gavel, TrendingUp,
  Bell, Settings, ChevronRight, Edit, Loader2, Clock, Trophy, ShoppingBag,
  AlertCircle, MapPin, ArrowRight
} from 'lucide-vue-next'
import SellerStatsGrid from '@/components/seller/SellerStatsGrid.vue'
import SellerProductList from '@/components/seller/SellerProductList.vue'
import SellerOrdersTab from '@/components/seller/SellerOrdersTab.vue'
import { useSellerApplication } from '@/composables/useSellerApplication'
import { sellerApi, auctionApi, getThumbnailUrl, type SellerStats, type ProductDetail, type AuctionResponse } from '@/api'
import type { OrderResponse } from '@/api/order.api'

const router = useRouter()
const route = useRoute()
const { profileData, fetchProfile } = useSellerApplication()

// Active tab
const activeTab = ref<'home' | 'products' | 'auctions' | 'orders'>('home')

// 내 경매 목록
const myAuctions = ref<AuctionResponse[]>([])
const isLoadingAuctions = ref(false)
const isCancelling = ref<number | null>(null)

async function loadMyAuctions(force = false) {
  if (!force && myAuctions.value.length > 0) return
  isLoadingAuctions.value = true
  try {
    myAuctions.value = await auctionApi.getSellerAuctions()
  } finally {
    isLoadingAuctions.value = false
  }
}

async function cancelAuction(auctionId: number) {
  if (!confirm('경매를 취소하시겠습니까? 시작 전 경매만 취소할 수 있습니다.')) return
  isCancelling.value = auctionId
  try {
    await auctionApi.cancelAuction(auctionId)
    myAuctions.value = myAuctions.value.filter(a => a.id !== auctionId)
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '취소에 실패했습니다.')
  } finally {
    isCancelling.value = null
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const stats = ref<SellerStats | null>(null)
const recentProducts = ref<ProductDetail[]>([])
const pendingOrders = ref<OrderResponse[]>([])
const isLoadingHome = ref(false)

const formatPrice = (n: number) => '₩' + n.toLocaleString()

onMounted(async () => {
  if (route.query.tab === 'auctions') {
    activeTab.value = 'auctions'
    loadMyAuctions(true)
  }
  isLoadingHome.value = true
  try {
    await fetchProfile()
    const [statsData, productsData, pendingData] = await Promise.all([
      sellerApi.getStats(),
      sellerApi.getMyProducts(),
      sellerApi.getSellerOrders('PAID'),
    ])
    stats.value = statsData
    recentProducts.value = productsData.slice(0, 5)
    pendingOrders.value = pendingData
  } catch (e) {
    console.error('Failed to load seller dashboard', e)
  } finally {
    isLoadingHome.value = false
  }
})

const statusBadge = (status: string) => {
  if (status === 'ACTIVE')   return 'bg-emerald-100 text-emerald-700'
  if (status === 'SOLD_OUT') return 'bg-slate-100 text-slate-500'
  return 'bg-red-100 text-red-500'
}
const statusText = (status: string) => {
  if (status === 'ACTIVE')   return '판매중'
  if (status === 'SOLD_OUT') return '품절'
  return '삭제됨'
}

// Seller sidebar nav
const navItems = [
  { key: 'home',     icon: LayoutDashboard, label: '판매자 홈' },
  { key: 'products', icon: Package,         label: '내 상품 관리' },
  { key: 'orders',   icon: ShoppingBag,     label: '주문 관리' },
  { key: 'auctions', icon: Gavel,           label: '내 경매 관리' },
]

const goToNewProduct = () => router.push('/seller/products/new')
const goToProfileEdit = () => router.push('/seller/profile/edit')
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <div class="flex gap-8">
        <!-- ── Seller Sidebar ── -->
        <aside class="w-64 flex-shrink-0">
          <div class="sticky top-24">
            <!-- Profile Card -->
            <div class="bg-sky-50 rounded-2xl p-6 border border-sky-100 mb-6">
              <!-- Logo / Avatar -->
              <div class="flex justify-center">
                <div
                  v-if="profileData?.logoImageUrl"
                  class="w-20 h-20 rounded-full overflow-hidden border-2 border-sky-200"
                >
                  <img :src="profileData.logoImageUrl" alt="스토어 로고" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-teal-500
                         flex items-center justify-center text-white text-3xl font-black"
                >
                  {{ (profileData?.businessName ?? '아')[0] }}
                </div>
              </div>

              <!-- Name / Follower -->
              <div class="text-center mt-4">
                <div class="font-bold text-slate-900 text-lg">
                  {{ profileData?.businessName ?? '내 스토어' }}
                </div>
                <div class="text-sky-500 text-sm font-semibold mt-1">
                  팔로워 {{ profileData?.followerCount ?? 0 }}명
                </div>
              </div>

              <!-- Edit profile -->
              <button
                @click="goToProfileEdit"
                class="flex items-center justify-center gap-1 w-full mt-4 py-2 rounded-xl
                       text-sm text-sky-600 hover:bg-sky-100 transition-colors font-medium"
              >
                <Edit class="w-3.5 h-3.5" />
                프로필 편집
              </button>
            </div>

            <!-- Nav Menu -->
            <nav class="space-y-1 mb-4">
              <button
                v-for="item in navItems"
                :key="item.key"
                @click="activeTab = item.key as 'home' | 'products' | 'orders' | 'auctions'; if (item.key === 'auctions') loadMyAuctions()"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
                       transition-colors duration-150 text-left"
                :class="activeTab === item.key
                  ? 'bg-sky-50 text-sky-600 font-semibold'
                  : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span>{{ item.label }}</span>
              </button>
            </nav>

            <!-- Shortcuts -->
            <div class="space-y-1 border-t border-sky-100 pt-4">
              <button
                @click="goToNewProduct"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                <Plus class="w-5 h-5" />
                상품 등록
              </button>
              <button
                @click="activeTab = 'auctions'; loadMyAuctions()"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                <Gavel class="w-5 h-5" />
                경매 관리
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-400 cursor-not-allowed opacity-60"
                disabled
              >
                <TrendingUp class="w-5 h-5" />
                판매 분석
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-400 cursor-not-allowed opacity-60"
                disabled
              >
                <Bell class="w-5 h-5" />
                팔로워 알림 설정
              </button>
              <button
                @click="goToProfileEdit"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                       text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                <Settings class="w-5 h-5" />
                판매자 정보 수정
              </button>
            </div>
          </div>
        </aside>

        <!-- ── Main Content ── -->
        <div class="flex-1 min-w-0">

          <!-- ── TAB: 판매자 홈 ── -->
          <div v-show="activeTab === 'home'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-3xl font-black text-slate-900">판매자 홈</h1>
              <span class="text-sm text-slate-400">{{ new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
            </div>

            <!-- Loading -->
            <div v-if="isLoadingHome" class="flex justify-center py-16">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>

            <template v-else>

              <!-- 신규 주문 알림 배너 -->
              <div
                v-if="pendingOrders.length > 0"
                class="mb-6 flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 cursor-pointer hover:bg-amber-100 transition-colors"
                @click="activeTab = 'orders'"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <AlertCircle class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div class="font-bold text-amber-800">신규 주문 {{ pendingOrders.length }}건이 처리를 기다리고 있습니다</div>
                    <div class="text-xs text-amber-600 mt-0.5">송장을 등록하여 배송을 시작해주세요</div>
                  </div>
                </div>
                <div class="flex items-center gap-1 text-amber-600 font-semibold text-sm flex-shrink-0">
                  주문 관리
                  <ArrowRight class="w-4 h-4" />
                </div>
              </div>

              <!-- Stats grid -->
              <SellerStatsGrid :stats="stats ?? { totalProducts: 0, soldCount: 0, activeAuctions: 0, followerCount: profileData?.followerCount ?? 0, monthlyRevenue: 0 }" />

              <!-- 신규 주문 미리보기 -->
              <section v-if="pendingOrders.length > 0" class="mt-8">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold text-slate-900">처리 필요 주문</h2>
                  <button
                    @click="activeTab = 'orders'"
                    class="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-semibold transition-colors"
                  >
                    전체 보기
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>
                <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                  <div
                    v-for="(order, idx) in pendingOrders.slice(0, 3)"
                    :key="order.orderId"
                    class="flex items-center gap-4 px-5 py-4 hover:bg-sky-50/50 transition-colors cursor-pointer"
                    :class="{ 'border-b border-sky-50': idx < Math.min(pendingOrders.length, 3) - 1 }"
                    @click="activeTab = 'orders'"
                  >
                    <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag class="w-4 h-4 text-amber-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-slate-800 text-sm line-clamp-1">
                        {{ order.items[0]?.productName ?? '상품' }}
                        <span v-if="order.items.length > 1" class="text-slate-400 font-normal"> 외 {{ order.items.length - 1 }}건</span>
                      </p>
                      <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span>{{ order.buyerNickName }}</span>
                        <span>·</span>
                        <MapPin class="w-3 h-3" />
                        <span class="truncate">{{ order.address }}</span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="font-bold text-sky-600 text-sm">{{ formatPrice(order.totalAmount) }}</p>
                      <span class="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium">신규</span>
                    </div>
                  </div>
                  <div
                    v-if="pendingOrders.length > 3"
                    class="px-5 py-3 text-center text-sm text-sky-500 font-medium border-t border-sky-50 cursor-pointer hover:bg-sky-50 transition-colors"
                    @click="activeTab = 'orders'"
                  >
                    + {{ pendingOrders.length - 3 }}건 더 보기
                  </div>
                </div>
              </section>

              <!-- 내 상품 현황 -->
              <section class="mt-8">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold text-slate-900">내 상품 현황</h2>
                  <button
                    @click="activeTab = 'products'"
                    class="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-semibold transition-colors"
                  >
                    전체 상품 관리
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>

                <div v-if="recentProducts.length === 0" class="bg-sky-50 rounded-2xl border border-sky-100 py-10 text-center">
                  <Package class="w-10 h-10 text-sky-200 mx-auto mb-3" />
                  <p class="text-slate-400 text-sm mb-3">등록된 상품이 없습니다</p>
                  <button @click="goToNewProduct" class="text-sm font-semibold text-sky-500 hover:text-sky-600">첫 상품 등록하기 →</button>
                </div>

                <div v-else class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                  <div
                    v-for="(product, idx) in recentProducts"
                    :key="product.id"
                    class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-sky-50/50 cursor-pointer"
                    :class="{ 'border-b border-sky-50': idx < recentProducts.length - 1 }"
                    @click="router.push(`/products/${product.id}`)"
                  >
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img v-if="getThumbnailUrl(product)" :src="getThumbnailUrl(product)!" :alt="product.name" class="w-full h-full object-cover" />
                      <Package v-else class="w-6 h-6 text-sky-300" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-slate-800 text-sm line-clamp-1">{{ product.name }}</p>
                      <p class="text-slate-400 text-xs mt-0.5">재고 {{ product.stock }}개</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="font-bold text-sky-600 text-sm">₩{{ product.price.toLocaleString() }}</p>
                      <span class="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusBadge(product.status)">
                        {{ statusText(product.status) }}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 빠른 메뉴 -->
              <section class="mt-8">
                <h2 class="text-xl font-bold text-slate-900 mb-4">빠른 메뉴</h2>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="goToNewProduct"
                    class="flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl p-5 font-semibold transition-colors text-left"
                  >
                    <Plus class="w-6 h-6 flex-shrink-0" />
                    <div>
                      <div class="font-bold">상품 등록</div>
                      <div class="text-sky-100 text-xs mt-0.5">새 상품을 등록해보세요</div>
                    </div>
                  </button>
                  <button
                    @click="activeTab = 'orders'"
                    class="flex items-center gap-3 bg-sky-50 hover:bg-sky-100 text-slate-700 rounded-2xl p-5 font-semibold transition-colors text-left border border-sky-100 relative"
                  >
                    <ShoppingBag class="w-6 h-6 text-sky-500 flex-shrink-0" />
                    <div>
                      <div class="font-bold text-slate-800">주문 관리</div>
                      <div class="text-slate-400 text-xs mt-0.5">주문 처리 및 배송 관리</div>
                    </div>
                    <span
                      v-if="pendingOrders.length > 0"
                      class="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
                    >{{ pendingOrders.length }}</span>
                  </button>
                  <button
                    @click="router.push('/seller/auctions/new')"
                    class="flex items-center gap-3 bg-sky-50 hover:bg-sky-100 text-slate-700 rounded-2xl p-5 font-semibold transition-colors text-left border border-sky-100"
                  >
                    <Gavel class="w-6 h-6 text-sky-500 flex-shrink-0" />
                    <div>
                      <div class="font-bold text-slate-800">경매 등록</div>
                      <div class="text-slate-400 text-xs mt-0.5">실시간 경매를 시작하세요</div>
                    </div>
                  </button>
                  <button
                    @click="activeTab = 'products'"
                    class="flex items-center gap-3 bg-sky-50 hover:bg-sky-100 text-slate-700 rounded-2xl p-5 font-semibold transition-colors text-left border border-sky-100"
                  >
                    <Package class="w-6 h-6 text-sky-500 flex-shrink-0" />
                    <div>
                      <div class="font-bold text-slate-800">상품 관리</div>
                      <div class="text-slate-400 text-xs mt-0.5">재고와 상태를 관리하세요</div>
                    </div>
                  </button>
                </div>
              </section>

            </template>
          </div>

          <!-- ── TAB: 내 상품 관리 ── -->
          <div v-show="activeTab === 'products'">
            <SellerProductList />
          </div>

          <!-- ── TAB: 주문 관리 ── -->
          <div v-show="activeTab === 'orders'">
            <SellerOrdersTab />
          </div>

          <!-- ── TAB: 내 경매 관리 ── -->
          <div v-show="activeTab === 'auctions'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-3xl font-black text-slate-900">내 경매 관리</h1>
              <button
                @click="router.push('/seller/auctions/new')"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
              >
                <Plus class="w-4 h-4" />
                경매 등록
              </button>
            </div>

            <!-- 로딩 -->
            <div v-if="isLoadingAuctions" class="flex justify-center py-16">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>

            <template v-else>
              <!-- 요약 -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
                  <div class="text-2xl font-black text-red-500">{{ myAuctions.filter(a => a.status === 'ACTIVE').length }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">진행 중</div>
                </div>
                <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
                  <div class="text-2xl font-black text-sky-500">{{ myAuctions.filter(a => a.status === 'SCHEDULED').length }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">예정</div>
                </div>
                <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
                  <div class="text-2xl font-black text-slate-500">{{ myAuctions.filter(a => a.status === 'ENDED').length }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">종료</div>
                </div>
              </div>

              <!-- 빈 상태 -->
              <div v-if="myAuctions.length === 0" class="text-center py-20 bg-sky-50 rounded-2xl border border-sky-100">
                <Gavel class="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p class="text-slate-400 text-sm mb-4">등록한 경매가 없습니다</p>
                <button
                  @click="router.push('/seller/auctions/new')"
                  class="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-full transition-colors"
                >
                  첫 경매 등록하기
                </button>
              </div>

              <!-- 경매 목록 -->
              <div v-else class="space-y-3">
                <div
                  v-for="auction in myAuctions"
                  :key="auction.id"
                  class="bg-white rounded-2xl border border-sky-100 p-5 transition-all hover:shadow-sm"
                >
                  <div class="flex items-center gap-4">
                    <!-- 썸네일 -->
                    <div class="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-sky-100 to-teal-200 flex-shrink-0">
                      <img
                        v-if="auction.imageUrls.length > 0"
                        :src="auction.imageUrls[0]"
                        :alt="auction.productName"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center text-2xl">🐠</div>
                    </div>

                    <!-- 정보 -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <!-- 상태 배지 -->
                        <span
                          class="text-xs px-2 py-0.5 rounded-full font-semibold"
                          :class="{
                            'bg-red-100 text-red-600 animate-pulse': auction.status === 'ACTIVE',
                            'bg-sky-100 text-sky-600': auction.status === 'SCHEDULED',
                            'bg-slate-100 text-slate-500': auction.status === 'ENDED',
                            'bg-orange-100 text-orange-500': auction.status === 'CANCELLED',
                          }"
                        >
                          {{ auction.status === 'ACTIVE' ? 'LIVE' : auction.status === 'SCHEDULED' ? '예정' : auction.status === 'ENDED' ? '종료' : '취소됨' }}
                        </span>
                      </div>
                      <p class="font-semibold text-slate-800 text-sm line-clamp-1">{{ auction.productName }}</p>
                      <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span class="flex items-center gap-1">
                          <Clock class="w-3 h-3" />
                          {{ auction.status === 'SCHEDULED' ? '시작 ' : '종료 ' }}{{ formatDateTime(auction.endAt) }}
                        </span>
                        <span>입찰 {{ auction.bidCount }}건</span>
                      </div>
                    </div>

                    <!-- 가격 & 액션 -->
                    <div class="text-right flex-shrink-0 space-y-2">
                      <div>
                        <p class="text-xs text-slate-400">{{ auction.status === 'SCHEDULED' ? '시작가' : '현재가' }}</p>
                        <p class="font-black text-sky-600 text-sm">
                          ₩{{ (auction.status === 'SCHEDULED' ? auction.startPrice : auction.currentPrice).toLocaleString() }}
                        </p>
                      </div>
                      <div class="flex gap-2 justify-end">
                        <button
                          @click="router.push(`/auction/${auction.id}`)"
                          class="text-xs px-3 py-1.5 rounded-lg border border-sky-200 text-sky-500 hover:bg-sky-50 transition-colors"
                        >
                          보기
                        </button>
                        <button
                          v-if="auction.status === 'SCHEDULED'"
                          @click="cancelAuction(auction.id)"
                          :disabled="isCancelling === auction.id"
                          class="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {{ isCancelling === auction.id ? '취소 중...' : '취소' }}
                        </button>
                        <span
                          v-else-if="auction.status === 'ENDED' && auction.currentWinnerNickName"
                          class="flex items-center gap-1 text-xs text-emerald-600 font-semibold"
                        >
                          <Trophy class="w-3 h-3" />
                          {{ auction.currentWinnerNickName }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>
