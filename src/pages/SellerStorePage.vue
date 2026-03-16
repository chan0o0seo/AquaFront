<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, Gavel, Heart, MapPin, Star, ChevronDown } from 'lucide-vue-next'
import { sellerApi, type SellerProfileResponse } from '@/api'
import { getThumbnailUrl, type ProductSummary } from '@/api'
import { auctionApi, type AuctionResponse } from '@/api/auction.api'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const sellerId = route.params.sellerId as string

const profile      = ref<SellerProfileResponse | null>(null)
const products     = ref<ProductSummary[]>([])
const auctions     = ref<AuctionResponse[]>([])
const isFollowing  = ref(false)
const isTogglingFollow = ref(false)
const isLoading    = ref(true)
const activeSection = ref<'products' | 'auctions'>('products')
const activeTypeFilter = ref('')
const sortKey = ref<'default' | 'price_asc' | 'price_desc' | 'rating'>('default')

// ── 타입 맵 ───────────────────────────────────────────
const typeLabelMap: Record<string, string> = {
  FISH: '어류', PLANT: '수초', INVERTEBRATE: '새우/갑각류',
  EQUIPMENT: '용품/장비', ACCESSORY: '소품', FOOD: '사료',
}
const typeEmojiMap: Record<string, string> = {
  FISH: '🐠', PLANT: '🌿', INVERTEBRATE: '🦐', EQUIPMENT: '🔧', ACCESSORY: '🪨', FOOD: '🍃',
}
const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    FISH: 'bg-sky-100 text-sky-700', PLANT: 'bg-green-100 text-green-700',
    INVERTEBRATE: 'bg-purple-100 text-purple-700', EQUIPMENT: 'bg-amber-100 text-amber-700',
    ACCESSORY: 'bg-pink-100 text-pink-700', FOOD: 'bg-lime-100 text-lime-700',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600'
}

// ── 상품 필터/정렬 ────────────────────────────────────
const availableTypes = computed(() => Array.from(new Set(products.value.map(p => p.productType))))

const sortedFilteredProducts = computed(() => {
  let list = activeTypeFilter.value
    ? products.value.filter(p => p.productType === activeTypeFilter.value)
    : [...products.value]
  if (sortKey.value === 'price_asc')  list = list.sort((a, b) => a.price - b.price)
  if (sortKey.value === 'price_desc') list = list.sort((a, b) => b.price - a.price)
  if (sortKey.value === 'rating')     list = list.sort((a, b) => b.averageRating - a.averageRating)
  return list
})

// ── 경매 카운트다운 ────────────────────────────────────
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

function secondsLeft(iso: string) {
  return Math.max(0, Math.floor((new Date(iso).getTime() - now.value) / 1000))
}
function formatCountdown(sec: number) {
  if (sec <= 0) return '종료'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const activeAuctions    = computed(() => auctions.value.filter(a => a.status === 'ACTIVE'))
const scheduledAuctions = computed(() => auctions.value.filter(a => a.status === 'SCHEDULED'))

// ── 통계 ──────────────────────────────────────────────
const sellerInitial = computed(() => profile.value?.nickName?.charAt(0).toUpperCase() ?? 'S')

// ── 데이터 로드 ───────────────────────────────────────
async function load() {
  isLoading.value = true
  try {
    const [profileData, productsData, activeData, scheduledData] = await Promise.all([
      sellerApi.getStore(sellerId),
      sellerApi.getSellerProducts(sellerId),
      auctionApi.getActive().catch(() => [] as AuctionResponse[]),
      auctionApi.getScheduled().catch(() => [] as AuctionResponse[]),
    ])
    profile.value   = profileData
    products.value  = productsData

    // 해당 판매자의 경매만 필터링
    const all = [...activeData, ...scheduledData]
    auctions.value = all.filter(a => a.sellerNickName === profileData.nickName)

    if (isLoggedIn.value) {
      isFollowing.value = await sellerApi.isFollowing(sellerId)
    }
  } catch (e) {
    console.error('판매자 정보 로드 실패', e)
  } finally {
    isLoading.value = false
  }
}

async function toggleFollow() {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (isTogglingFollow.value || !profile.value) return
  isTogglingFollow.value = true
  // 낙관적 업데이트
  const prev = isFollowing.value
  isFollowing.value = !prev
  profile.value.followerCount += prev ? -1 : 1
  try {
    const result = await sellerApi.toggleFollow(sellerId)
    // 서버 결과가 낙관적 업데이트와 다르면 롤백
    if (result !== !prev) {
      isFollowing.value = result
      profile.value.followerCount += prev ? 1 : -1
    }
  } catch {
    // 실패 시 롤백
    isFollowing.value = prev
    profile.value.followerCount += prev ? 1 : -1
  } finally {
    isTogglingFollow.value = false
  }
}

onMounted(() => {
  load()
  ticker = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { if (ticker) clearInterval(ticker) })
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <button
        @click="router.back()"
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-8 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        뒤로가기
      </button>

      <!-- 스켈레톤 로딩 -->
      <template v-if="isLoading">
        <div class="rounded-2xl border border-sky-100 mb-8 animate-pulse">
          <div class="h-32 bg-slate-100 rounded-t-2xl" />
          <div class="px-6 pb-6">
            <div class="flex items-end justify-between -mt-10 mb-4">
              <div class="w-20 h-20 rounded-2xl bg-slate-200 border-4 border-white" />
              <div class="w-24 h-9 rounded-full bg-slate-200 mt-2" />
            </div>
            <div class="h-6 w-40 bg-slate-200 rounded mb-2" />
            <div class="h-4 w-28 bg-slate-100 rounded mb-4" />
            <div class="grid grid-cols-3 gap-3">
              <div class="h-16 bg-slate-100 rounded-xl" />
              <div class="h-16 bg-slate-100 rounded-xl" />
              <div class="h-16 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          <div v-for="i in 8" :key="i" class="rounded-2xl border border-sky-50 overflow-hidden">
            <div class="aspect-square bg-slate-100" />
            <div class="p-3 space-y-2">
              <div class="h-4 bg-slate-100 rounded w-3/4" />
              <div class="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      </template>

      <!-- 오류 -->
      <div v-else-if="!profile" class="text-center py-32">
        <Package class="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-400">판매자를 찾을 수 없습니다</p>
        <button @click="router.back()" class="mt-4 text-sm text-sky-500 hover:underline">뒤로가기</button>
      </div>

      <template v-else>

        <!-- ── 프로필 헤더 ── -->
        <div class="rounded-2xl border border-sky-100 mb-8 relative">
          <!-- 배너 -->
          <div class="h-36 bg-gradient-to-r from-sky-400 via-teal-400 to-cyan-500 rounded-t-2xl overflow-hidden relative">
            <div class="absolute inset-0 opacity-20"
              style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)" />
          </div>

          <!-- 로고: 배너와 콘텐츠 경계에 걸치도록 absolute 배치 -->
          <div class="absolute top-24 left-6 w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden z-10">
            <img v-if="profile.logoImageUrl" :src="profile.logoImageUrl" :alt="profile.nickName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-3xl font-black">
              {{ sellerInitial }}
            </div>
          </div>

          <div class="px-6 pb-6 pt-14">
            <!-- 팔로우 버튼 (우측 정렬) -->
            <div class="flex justify-end mb-3">
              <button
                @click="toggleFollow"
                :disabled="isTogglingFollow"
                class="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-60"
                :class="isFollowing
                  ? 'bg-sky-500 text-white hover:bg-sky-600'
                  : 'border border-sky-200 text-sky-500 hover:bg-sky-50'"
              >
                <Heart class="w-4 h-4" :fill="isFollowing ? 'currentColor' : 'none'" />
                {{ isFollowing ? '팔로잉' : '팔로우' }}
              </button>
            </div>

            <!-- 이름 + 상호명 -->
            <h1 class="text-2xl font-black text-slate-900">{{ profile.nickName }}</h1>
            <p v-if="profile.businessName" class="text-sm text-slate-500 mt-0.5">{{ profile.businessName }}</p>

            <!-- 위치 -->
            <div v-if="profile.businessAddress" class="flex items-center gap-1.5 mt-1.5">
              <MapPin class="w-3.5 h-3.5 text-slate-400" />
              <span class="text-sm text-slate-400">{{ profile.businessAddress }}</span>
            </div>

            <!-- 소개 -->
            <p v-if="profile.storeDescription" class="text-sm text-slate-600 leading-relaxed mt-3">
              {{ profile.storeDescription }}
            </p>

            <!-- 통계 3개 -->
            <div class="grid grid-cols-3 gap-3 mt-4">
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">등록 상품</p>
                <p class="text-xl font-black text-slate-900">{{ products.length }}</p>
              </div>
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">진행 경매</p>
                <p class="text-xl font-black text-slate-900">{{ activeAuctions.length }}</p>
              </div>
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">팔로워</p>
                <p class="text-xl font-black text-slate-900">{{ profile.followerCount.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 섹션 탭 ── -->
        <div class="flex gap-1 p-1 bg-sky-50 rounded-xl border border-sky-100 mb-6 w-fit">
          <button
            @click="activeSection = 'products'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="activeSection === 'products' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          >
            <Package class="w-4 h-4" />
            상품 {{ products.length }}
          </button>
          <button
            @click="activeSection = 'auctions'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="activeSection === 'auctions' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          >
            <Gavel class="w-4 h-4" />
            경매
            <span v-if="activeAuctions.length > 0"
              class="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {{ activeAuctions.length }}
            </span>
          </button>
        </div>

        <!-- ── 상품 섹션 ── -->
        <template v-if="activeSection === 'products'">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <!-- 카테고리 필터 -->
            <div v-if="availableTypes.length > 1" class="flex gap-2 flex-wrap">
              <button
                @click="activeTypeFilter = ''"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                :class="!activeTypeFilter ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
              >전체</button>
              <button
                v-for="type in availableTypes"
                :key="type"
                @click="activeTypeFilter = activeTypeFilter === type ? '' : type"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                :class="activeTypeFilter === type ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
              >
                {{ typeEmojiMap[type] }} {{ typeLabelMap[type] ?? type }}
              </button>
            </div>
            <div v-else />

            <!-- 정렬 -->
            <div class="relative">
              <select
                v-model="sortKey"
                class="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-sky-100 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
              >
                <option value="default">기본순</option>
                <option value="price_asc">낮은 가격순</option>
                <option value="price_desc">높은 가격순</option>
                <option value="rating">평점순</option>
              </select>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <!-- 상품 그리드 -->
          <div v-if="sortedFilteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="product in sortedFilteredProducts"
              :key="product.id"
              @click="router.push(`/products/${product.id}`)"
              class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200 group"
              :class="product.status === 'SOLD_OUT' ? 'opacity-60' : ''"
            >
              <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
                <img
                  v-if="getThumbnailUrl(product)"
                  :src="getThumbnailUrl(product)"
                  :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span v-else class="absolute inset-0 flex items-center justify-center text-4xl">
                  {{ typeEmojiMap[product.productType] ?? '📦' }}
                </span>

                <!-- 품절 오버레이 -->
                <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                </div>

                <!-- 타입 배지 -->
                <span class="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">
                  {{ typeLabelMap[product.productType] ?? product.productType }}
                </span>

                <!-- 재고임박 배지 -->
                <span v-if="product.lowStockWarning && product.status !== 'SOLD_OUT'"
                  class="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-white">
                  재고임박
                </span>
              </div>

              <div class="p-3">
                <h3 class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{{ product.name }}</h3>

                <!-- 태그 -->
                <div v-if="product.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="tag in product.tags.slice(0, 2)"
                    :key="tag"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
                  >#{{ tag }}</span>
                </div>

                <div class="flex items-end justify-between gap-1">
                  <div>
                    <p class="text-base font-black text-sky-600">₩{{ product.price.toLocaleString() }}</p>
                    <p v-if="product.shippingFee === 0" class="text-[10px] text-emerald-500 font-semibold">무료배송</p>
                    <p v-else class="text-[10px] text-slate-400">배송비 ₩{{ product.shippingFee.toLocaleString() }}</p>
                  </div>
                  <div v-if="product.reviewCount > 0" class="flex items-center gap-0.5 text-xs text-slate-400 flex-shrink-0">
                    <Star class="w-3 h-3 text-amber-400" fill="currentColor" />
                    <span>{{ product.averageRating.toFixed(1) }}</span>
                    <span class="text-slate-300">({{ product.reviewCount }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-20">
            <Package class="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">{{ activeTypeFilter ? '해당 카테고리 상품이 없습니다' : '등록된 상품이 없습니다' }}</p>
            <button v-if="activeTypeFilter" @click="activeTypeFilter = ''" class="mt-2 text-sm text-sky-500 hover:underline">전체 보기</button>
          </div>
        </template>

        <!-- ── 경매 섹션 ── -->
        <template v-else>

          <!-- ACTIVE 경매 -->
          <template v-if="activeAuctions.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <span class="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                LIVE
              </span>
              <span class="text-sm font-semibold text-slate-700">진행 중인 경매</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div
                v-for="auction in activeAuctions"
                :key="auction.id"
                @click="router.push(`/auction/${auction.id}`)"
                class="bg-white rounded-2xl border border-red-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-red-200 transition-all duration-200 group"
              >
                <div class="relative aspect-video bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
                  <img
                    v-if="auction.imageUrls[0]"
                    :src="auction.imageUrls[0]"
                    :alt="auction.productName"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span v-else class="absolute inset-0 flex items-center justify-center text-5xl">🐠</span>
                  <div class="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                  <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-mono px-2 py-0.5 rounded-lg"
                    :class="secondsLeft(auction.endAt) < 300 ? 'text-red-300' : ''">
                    {{ formatCountdown(secondsLeft(auction.endAt)) }}
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-slate-900 text-sm line-clamp-1 mb-2">{{ auction.productName }}</h3>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-slate-400">현재가</p>
                      <p class="text-lg font-black text-sky-600">₩{{ auction.currentPrice.toLocaleString() }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-slate-400">입찰</p>
                      <p class="text-sm font-bold text-slate-700">{{ auction.bidCount }}회</p>
                    </div>
                  </div>
                  <div v-if="auction.buyNowPrice" class="mt-2 text-xs text-emerald-600 font-medium">
                    즉시구매 ₩{{ auction.buyNowPrice.toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- SCHEDULED 경매 -->
          <template v-if="scheduledAuctions.length > 0">
            <p class="text-sm font-semibold text-slate-700 mb-3">예정된 경매</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="auction in scheduledAuctions"
                :key="auction.id"
                @click="router.push(`/auction/${auction.id}`)"
                class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-sky-200 transition-all duration-200 group"
              >
                <div class="relative aspect-video bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
                  <img
                    v-if="auction.imageUrls[0]"
                    :src="auction.imageUrls[0]"
                    :alt="auction.productName"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span v-else class="absolute inset-0 flex items-center justify-center text-5xl">🐠</span>
                  <div class="absolute top-2 left-2 bg-slate-600/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    예정
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-slate-900 text-sm line-clamp-1 mb-2">{{ auction.productName }}</h3>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-slate-400">시작가</p>
                      <p class="text-lg font-black text-slate-700">₩{{ auction.startPrice.toLocaleString() }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-slate-400">시작 일시</p>
                      <p class="text-xs font-semibold text-sky-600">{{ formatDateTime(auction.startAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 빈 상태 -->
          <div v-if="auctions.length === 0" class="text-center py-20">
            <Gavel class="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">진행 중이거나 예정된 경매가 없습니다</p>
            <button @click="router.push('/auction')" class="mt-3 text-sm text-sky-500 hover:underline">
              전체 경매 보기
            </button>
          </div>

        </template>

      </template>
    </main>
  </div>
</template>
