<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, Package, Plus, Gavel, TrendingUp,
  Bell, Settings, ChevronRight, Edit, Loader2, Clock, Trophy, ShoppingBag,
  AlertCircle, MapPin, ArrowRight, CheckCircle2
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
const activeTab = ref<'home' | 'products' | 'auctions' | 'orders' | 'settlements'>('home')
// 한 번 활성화된 탭은 DOM에서 제거하지 않음 (remount 방지)
const mountedTabs = ref(new Set<string>(['home']))
function setTab(tab: 'home' | 'products' | 'auctions' | 'orders') {
  activeTab.value = tab
  mountedTabs.value.add(tab)
}

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
const allProducts   = ref<ProductDetail[]>([])
const recentProducts = ref<ProductDetail[]>([])
const pendingOrders = ref<OrderResponse[]>([])
const isLoadingHome = ref(false)

const formatPrice = (n: number) => '₩' + n.toLocaleString()

// ── 인사말 ────────────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '좋은 아침이에요'
  if (h < 18) return '안녕하세요'
  return '수고하셨어요'
})
const todayStr = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
})

// ── 상품 현황 파생 ────────────────────────────────────
const activeProductCount = computed(() => allProducts.value.filter(p => p.status === 'ACTIVE').length)
const soldOutCount       = computed(() => allProducts.value.filter(p => p.status === 'SOLD_OUT').length)
const lowStockCount      = computed(() => allProducts.value.filter(p => p.status === 'ACTIVE' && p.stock > 0 && p.stock <= 5).length)

// 처리 필요 항목 존재 여부
const hasActionItems = computed(() =>
  pendingOrders.value.length > 0 ||
  soldOutCount.value > 0 ||
  lowStockCount.value > 0 ||
  (stats.value?.activeAuctions ?? 0) > 0
)

onMounted(async () => {
  if (route.query.tab === 'auctions') {
    setTab('auctions')
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
    stats.value       = statsData
    allProducts.value = productsData
    recentProducts.value = productsData.slice(0, 5)
    pendingOrders.value  = pendingData
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
                @click="setTab(item.key as any); if (item.key === 'auctions') loadMyAuctions()"
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
                @click="setTab('auctions'); loadMyAuctions()"
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

            <!-- ── 스켈레톤 로딩 ── -->
            <div v-if="isLoadingHome" class="animate-pulse space-y-6">
              <!-- 인사말 -->
              <div class="flex items-center justify-between">
                <div class="space-y-2">
                  <div class="h-3.5 w-24 bg-slate-100 rounded-full" />
                  <div class="h-7 w-48 bg-slate-200 rounded-full" />
                </div>
                <div class="h-4 w-32 bg-slate-100 rounded-full" />
              </div>
              <!-- 액션 카드 -->
              <div class="grid grid-cols-3 gap-3">
                <div v-for="i in 3" :key="i" class="h-20 rounded-2xl bg-slate-100" />
              </div>
              <!-- 스탯 -->
              <div class="grid grid-cols-5 gap-3">
                <div class="col-span-2 h-24 rounded-2xl bg-slate-100" />
                <div v-for="i in 3" :key="i" class="h-24 rounded-2xl bg-slate-100" />
              </div>
              <!-- 주문 목록 -->
              <div class="rounded-2xl border border-sky-50 overflow-hidden">
                <div class="h-12 bg-slate-50 border-b border-sky-50 px-5 flex items-center gap-3">
                  <div class="h-4 w-24 bg-slate-200 rounded-full" />
                </div>
                <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-sky-50 last:border-0">
                  <div class="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3.5 w-2/3 bg-slate-100 rounded-full" />
                    <div class="h-3 w-1/3 bg-slate-100 rounded-full" />
                  </div>
                  <div class="w-16 h-4 bg-slate-100 rounded-full" />
                </div>
              </div>
              <!-- 상품 목록 -->
              <div class="rounded-2xl border border-sky-50 overflow-hidden">
                <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-sky-50 last:border-0">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3.5 w-1/2 bg-slate-100 rounded-full" />
                    <div class="h-3 w-1/4 bg-slate-100 rounded-full" />
                  </div>
                  <div class="w-14 h-4 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>

            <template v-else>

              <!-- ── 인사말 헤더 ── -->
              <div class="flex items-start justify-between mb-7">
                <div>
                  <p class="text-sm text-sky-500 font-semibold mb-1">{{ greeting }},</p>
                  <h1 class="text-2xl font-black text-slate-900">
                    {{ profileData?.businessName ?? '판매자' }}님 👋
                  </h1>
                </div>
                <span class="text-sm text-slate-400 mt-1 flex-shrink-0">{{ todayStr }}</span>
              </div>

              <!-- ── 처리 필요 항목 ── -->
              <div class="mb-7">
                <!-- 모두 처리됨 -->
                <div
                  v-if="!hasActionItems"
                  class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3.5"
                >
                  <CheckCircle2 class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p class="text-sm font-semibold text-emerald-700">처리할 업무가 없어요</p>
                  <p class="text-sm text-emerald-500">오늘도 수고 많으셨습니다!</p>
                </div>

                <!-- 처리 필요 항목 카드들 -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <!-- 신규 주문 -->
                  <button
                    v-if="pendingOrders.length > 0"
                    @click="setTab('orders')"
                    class="group flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left hover:bg-amber-100 hover:border-amber-300 transition-all"
                  >
                    <div class="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-2xl font-black text-amber-700 leading-none">{{ pendingOrders.length }}<span class="text-base font-bold ml-0.5">건</span></p>
                      <p class="text-xs text-amber-600 mt-1 font-medium">신규 주문 처리 필요</p>
                    </div>
                    <ArrowRight class="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>

                  <!-- 품절 상품 -->
                  <button
                    v-if="soldOutCount > 0"
                    @click="setTab('products')"
                    class="group flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-left hover:bg-red-100 hover:border-red-300 transition-all"
                  >
                    <div class="w-11 h-11 rounded-xl bg-red-400 flex items-center justify-center flex-shrink-0">
                      <Package class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-2xl font-black text-red-700 leading-none">{{ soldOutCount }}<span class="text-base font-bold ml-0.5">개</span></p>
                      <p class="text-xs text-red-600 mt-1 font-medium">품절 상품 재입고 필요</p>
                    </div>
                    <ArrowRight class="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>

                  <!-- 재고 부족 (품절은 없지만 임박한 경우) -->
                  <button
                    v-else-if="lowStockCount > 0"
                    @click="setTab('products')"
                    class="group flex items-center gap-4 bg-orange-50 border border-orange-200 rounded-2xl p-4 text-left hover:bg-orange-100 transition-all"
                  >
                    <div class="w-11 h-11 rounded-xl bg-orange-400 flex items-center justify-center flex-shrink-0">
                      <AlertCircle class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-2xl font-black text-orange-700 leading-none">{{ lowStockCount }}<span class="text-base font-bold ml-0.5">개</span></p>
                      <p class="text-xs text-orange-600 mt-1 font-medium">재고 부족 상품 확인 필요</p>
                    </div>
                    <ArrowRight class="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>

                  <!-- 진행 중 경매 -->
                  <button
                    v-if="stats?.activeAuctions"
                    @click="setTab('auctions'); loadMyAuctions()"
                    class="group flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl p-4 text-left hover:bg-red-100 transition-all"
                  >
                    <div class="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 relative">
                      <Gavel class="w-5 h-5 text-white" />
                      <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-300 rounded-full animate-pulse border-2 border-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-2xl font-black text-red-700 leading-none">{{ stats.activeAuctions }}<span class="text-base font-bold ml-0.5">건</span></p>
                      <p class="text-xs text-red-500 mt-1 font-medium">LIVE 경매 진행 중</p>
                    </div>
                    <ArrowRight class="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>

                </div>
              </div>

              <!-- ── 통계 그리드 ── -->
              <SellerStatsGrid :stats="stats ?? { totalProducts: 0, soldCount: 0, activeAuctions: 0, followerCount: profileData?.followerCount ?? 0, monthlyRevenue: 0 }" />

              <!-- ── 신규 주문 미리보기 ── -->
              <section v-if="pendingOrders.length > 0" class="mt-8">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-bold text-slate-900">처리 대기 주문</h2>
                  <button
                    @click="setTab('orders')"
                    class="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-semibold transition-colors"
                  >
                    전체 보기 <ChevronRight class="w-4 h-4" />
                  </button>
                </div>
                <div class="rounded-2xl border border-sky-100 overflow-hidden divide-y divide-sky-50">
                  <div
                    v-for="order in pendingOrders.slice(0, 3)"
                    :key="order.orderId"
                    @click="setTab('orders')"
                    class="flex items-center gap-4 px-5 py-4 hover:bg-sky-50/50 transition-colors cursor-pointer group"
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
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <p class="font-bold text-sky-600 text-sm">{{ formatPrice(order.totalAmount) }}</p>
                      <span class="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        송장 등록
                      </span>
                    </div>
                  </div>
                  <div
                    v-if="pendingOrders.length > 3"
                    @click="setTab('orders')"
                    class="px-5 py-3 text-center text-sm text-sky-500 font-medium cursor-pointer hover:bg-sky-50 transition-colors"
                  >
                    + {{ pendingOrders.length - 3 }}건 더 보기
                  </div>
                </div>
              </section>

              <!-- ── 내 상품 현황 ── -->
              <section class="mt-8">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3 flex-wrap">
                    <h2 class="text-lg font-bold text-slate-900">내 상품 현황</h2>
                    <div v-if="allProducts.length > 0" class="flex gap-1.5">
                      <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                        판매중 {{ activeProductCount }}
                      </span>
                      <span v-if="soldOutCount > 0" class="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold">
                        품절 {{ soldOutCount }}
                      </span>
                    </div>
                  </div>
                  <button
                    v-if="allProducts.length > 0"
                    @click="setTab('products')"
                    class="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-semibold transition-colors flex-shrink-0"
                  >
                    전체 보기 <ChevronRight class="w-4 h-4" />
                  </button>
                </div>

                <!-- 신규 판매자 온보딩 -->
                <div v-if="allProducts.length === 0" class="rounded-2xl border border-sky-100 overflow-hidden">
                  <div class="bg-gradient-to-r from-sky-50 to-teal-50 px-6 py-5 border-b border-sky-100">
                    <h3 class="font-bold text-slate-800 mb-1">판매를 시작할 준비가 됐나요?</h3>
                    <p class="text-sm text-slate-500">아래 단계를 따라 첫 판매를 시작해보세요</p>
                  </div>
                  <div class="p-5 space-y-4">
                    <div class="flex items-center gap-3">
                      <CheckCircle2 class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span class="text-sm text-slate-400 line-through">판매자 신청 승인</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <CheckCircle2 class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span class="text-sm text-slate-400 line-through">스토어 프로필 설정</span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full border-2 border-sky-400 flex-shrink-0" />
                        <span class="text-sm font-semibold text-slate-700">첫 상품 등록하기</span>
                      </div>
                      <button
                        @click="goToNewProduct"
                        class="flex items-center gap-1.5 text-xs bg-sky-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-sky-600 transition-colors flex-shrink-0"
                      >
                        <Plus class="w-3.5 h-3.5" />
                        상품 등록
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 상품 목록 -->
                <div v-else class="rounded-2xl border border-sky-100 overflow-hidden divide-y divide-sky-50">
                  <div
                    v-for="product in recentProducts"
                    :key="product.id"
                    class="group flex items-center gap-4 px-5 py-4 hover:bg-sky-50/50 transition-colors cursor-pointer"
                    @click="router.push(`/seller/products/${product.id}/edit`)"
                  >
                    <!-- 썸네일 -->
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img v-if="getThumbnailUrl(product)" :src="getThumbnailUrl(product)!" :alt="product.name" class="w-full h-full object-cover" loading="lazy" />
                      <Package v-else class="w-6 h-6 text-sky-300" />
                    </div>
                    <!-- 상품명 + 재고 -->
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-slate-800 text-sm line-clamp-1">{{ product.name }}</p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <p
                          class="text-xs"
                          :class="product.stock <= 5 && product.status === 'ACTIVE' ? 'text-orange-500 font-semibold' : 'text-slate-400'"
                        >
                          재고 {{ product.stock }}개
                          <span v-if="product.stock <= 5 && product.status === 'ACTIVE'" class="ml-0.5">⚠️</span>
                        </p>
                      </div>
                    </div>
                    <!-- 가격 + 상태 -->
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <p class="font-bold text-sky-600 text-sm">₩{{ product.price.toLocaleString() }}</p>
                      <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="statusBadge(product.status)">
                        {{ statusText(product.status) }}
                      </span>
                      <Edit class="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-400 transition-colors" />
                    </div>
                  </div>
                  <!-- 전체 보기 -->
                  <div
                    v-if="allProducts.length > 5"
                    @click="setTab('products')"
                    class="px-5 py-3 text-center text-sm text-sky-500 font-medium cursor-pointer hover:bg-sky-50 transition-colors"
                  >
                    전체 {{ allProducts.length }}개 상품 보기
                  </div>
                </div>
              </section>

            </template>
          </div>

          <!-- ── TAB: 내 상품 관리 ── -->
          <div v-if="mountedTabs.has('products')" v-show="activeTab === 'products'">
            <SellerProductList />
          </div>

          <!-- ── TAB: 주문 관리 ── -->
          <div v-if="mountedTabs.has('orders')" v-show="activeTab === 'orders'">
            <SellerOrdersTab />
          </div>

          <!-- ── TAB: 내 경매 관리 ── -->
          <div v-if="mountedTabs.has('auctions')" v-show="activeTab === 'auctions'">
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
