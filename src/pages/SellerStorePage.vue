<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Star, MapPin, Package, ShoppingCart, Gavel, Users, Heart, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const sellerId = Number(route.params.sellerId)

type ProductStatus = 'ACTIVE' | 'SOLD_OUT'
type ProductCategory = '어류' | '새우/갑각류' | '수초' | '용품' | '사료' | '소품'

interface SellerProduct {
  id: number
  name: string
  price: number
  category: ProductCategory
  status: ProductStatus
  tags: string[]
  rating: number
  reviewCount: number
  emoji: string
}

interface AuctionItem {
  id: number
  name: string
  currentBid: number
  timeLeft: number
  status: 'LIVE' | 'UPCOMING'
  emoji: string
}

interface Seller {
  id: number
  name: string
  initial: string
  gradientFrom: string
  gradientTo: string
  rating: number
  reviewCount: number
  location: string
  description: string
  productCount: number
  soldCount: number
  followerCount: number
  joinYear: number
  specialties: string[]
  products: SellerProduct[]
  auctions: AuctionItem[]
}

const sellers: Seller[] = [
  {
    id: 1,
    name: '플레코마스터',
    initial: '플',
    gradientFrom: 'from-sky-400',
    gradientTo: 'to-teal-500',
    rating: 4.9,
    reviewCount: 312,
    location: '경기도 수원시',
    description: '10년 경력의 플레코 전문 브리더입니다. L번호 플레코 전문으로 희귀 개체부터 입문용 개체까지 다양하게 취급합니다. 모든 개체는 직접 브리딩하며 건강 상태를 철저히 관리합니다.',
    productCount: 18,
    soldCount: 340,
    followerCount: 892,
    joinYear: 2019,
    specialties: ['L번호 플레코', '희귀종 브리딩', '성어 판매'],
    products: [
      { id: 101, name: 'L-333 킹로얄 플레코 (치어 1마리)', price: 35000, category: '어류', status: 'ACTIVE', tags: ['플레코', 'L번호'], rating: 4.9, reviewCount: 47, emoji: '🐠' },
      { id: 102, name: 'L-046 메두사 플레코 (5cm)', price: 55000, category: '어류', status: 'ACTIVE', tags: ['플레코', '희귀종'], rating: 5.0, reviewCount: 23, emoji: '🐟' },
      { id: 103, name: 'L-200 하이핀 레오파드 플레코', price: 42000, category: '어류', status: 'ACTIVE', tags: ['플레코', 'L번호'], rating: 4.8, reviewCount: 31, emoji: '🐠' },
      { id: 104, name: 'L-129 콜럼비아 레오파드 플레코', price: 38000, category: '어류', status: 'ACTIVE', tags: ['플레코'], rating: 4.7, reviewCount: 18, emoji: '🐟' },
      { id: 105, name: 'L-190 로얄 플레코 (성어)', price: 120000, category: '어류', status: 'SOLD_OUT', tags: ['플레코', '성어'], rating: 5.0, reviewCount: 12, emoji: '🐠' },
      { id: 106, name: '플레코 전용 유목 (드리프트우드)', price: 18000, category: '용품', status: 'ACTIVE', tags: ['유목', '플레코용'], rating: 4.6, reviewCount: 28, emoji: '🪵' },
      { id: 107, name: '히카리 플레코 펠렛 (80g)', price: 12000, category: '사료', status: 'ACTIVE', tags: ['플레코사료', '히카리'], rating: 4.8, reviewCount: 55, emoji: '🍃' },
      { id: 108, name: 'L-114 블루 아이 레몬 플레코', price: 48000, category: '어류', status: 'ACTIVE', tags: ['플레코', '블루아이'], rating: 4.9, reviewCount: 15, emoji: '🐟' },
    ],
    auctions: [
      { id: 1, name: 'L-333 킹로얄 플레코 (성어 1마리)', currentBid: 85000, timeLeft: 8073, status: 'LIVE', emoji: '🐠' },
    ]
  },
  {
    id: 2,
    name: '새우천국',
    initial: '새',
    gradientFrom: 'from-pink-400',
    gradientTo: 'to-rose-500',
    rating: 4.9,
    reviewCount: 528,
    location: '서울 강남구',
    description: '크리스탈 새우 & 타이거 새우 전문 브리더입니다. 고등급 개체 위주로 취급하며, 모든 새우는 상태 확인 후 발송합니다. 초보자 상담도 환영합니다.',
    productCount: 24,
    soldCount: 1240,
    followerCount: 2103,
    joinYear: 2018,
    specialties: ['CRS/CBS', '타이거 새우', '네오카리디나'],
    products: [
      { id: 201, name: 'CRS SS급 (5마리)', price: 45000, category: '새우/갑각류', status: 'ACTIVE', tags: ['CRS', 'SS급'], rating: 5.0, reviewCount: 89, emoji: '🦐' },
      { id: 202, name: 'CBS SS급 (5마리)', price: 40000, category: '새우/갑각류', status: 'ACTIVE', tags: ['CBS', 'SS급'], rating: 4.9, reviewCount: 67, emoji: '🦐' },
      { id: 203, name: '블랙 킹콩 새우 (3마리)', price: 60000, category: '새우/갑각류', status: 'ACTIVE', tags: ['BKK', '희귀종'], rating: 5.0, reviewCount: 34, emoji: '🦐' },
      { id: 204, name: '레드 체리 새우 (20마리)', price: 15000, category: '새우/갑각류', status: 'ACTIVE', tags: ['RCS', '입문용'], rating: 4.7, reviewCount: 142, emoji: '🦐' },
      { id: 205, name: '옐로우 골든백 새우 (10마리)', price: 25000, category: '새우/갑각류', status: 'ACTIVE', tags: ['골든백'], rating: 4.8, reviewCount: 51, emoji: '🦐' },
      { id: 206, name: '새우 전용 소일 (3L)', price: 22000, category: '용품', status: 'ACTIVE', tags: ['새우소일', 'pH조절'], rating: 4.8, reviewCount: 73, emoji: '🪨' },
      { id: 207, name: '새우 미네랄 첨가제 (100ml)', price: 18000, category: '용품', status: 'ACTIVE', tags: ['미네랄', '새우용'], rating: 4.9, reviewCount: 44, emoji: '💧' },
      { id: 208, name: '새우 전용 사료 모음 (3종)', price: 28000, category: '사료', status: 'SOLD_OUT', tags: ['새우사료', '모음세트'], rating: 4.9, reviewCount: 38, emoji: '🍃' },
      { id: 209, name: '모스볼 (탁구공 사이즈)', price: 8000, category: '수초', status: 'ACTIVE', tags: ['모스볼', '은신처'], rating: 4.6, reviewCount: 62, emoji: '🌿' },
    ],
    auctions: [
      { id: 4, name: '크리스탈 레드 쉬림프 S급 (10마리)', currentBid: 65000, timeLeft: 3412, status: 'LIVE', emoji: '🦐' },
    ]
  },
  {
    id: 3,
    name: '디스커스월드',
    initial: '디',
    gradientFrom: 'from-violet-400',
    gradientTo: 'to-purple-500',
    rating: 4.7,
    reviewCount: 198,
    location: '부산 해운대구',
    description: '20년 경력의 디스커스 전문점입니다. 독일, 말레이시아 원산지 직수입 개체와 국내 브리딩 개체를 함께 취급합니다. 디스커스에 관한 모든 것을 상담해 드립니다.',
    productCount: 12,
    soldCount: 580,
    followerCount: 1450,
    joinYear: 2016,
    specialties: ['디스커스 전문', '직수입 개체', '번식쌍 구성'],
    products: [
      { id: 301, name: '블루다이아몬드 디스커스 (단마리)', price: 65000, category: '어류', status: 'ACTIVE', tags: ['디스커스', '블루다이아'], rating: 4.8, reviewCount: 41, emoji: '🐠' },
      { id: 302, name: '레드 터키쉬 디스커스 (쌍)', price: 180000, category: '어류', status: 'ACTIVE', tags: ['디스커스', '번식쌍'], rating: 4.9, reviewCount: 27, emoji: '🐟' },
      { id: 303, name: '말레이시아 와일드 디스커스', price: 250000, category: '어류', status: 'ACTIVE', tags: ['디스커스', '와일드'], rating: 5.0, reviewCount: 14, emoji: '🐠' },
      { id: 304, name: '스노우 화이트 디스커스 (치어)', price: 45000, category: '어류', status: 'SOLD_OUT', tags: ['디스커스', '화이트'], rating: 4.7, reviewCount: 19, emoji: '🐟' },
      { id: 305, name: '디스커스 전용 사료 (냉동 붉은 장구벌레)', price: 15000, category: '사료', status: 'ACTIVE', tags: ['디스커스사료', '냉동사료'], rating: 4.8, reviewCount: 63, emoji: '🍱' },
      { id: 306, name: '디스커스 수온 유지 히터 (200W)', price: 35000, category: '용품', status: 'ACTIVE', tags: ['히터', '디스커스용'], rating: 4.6, reviewCount: 32, emoji: '🌡️' },
    ],
    auctions: [
      { id: 3, name: '블루다이아몬드 디스커스 (3마리 세트)', currentBid: 180000, timeLeft: 1820, status: 'LIVE', emoji: '🐠' },
    ]
  },
  {
    id: 4,
    name: '수초팜',
    initial: '수',
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-green-600',
    rating: 4.8,
    reviewCount: 267,
    location: '경기도 고양시',
    description: '수초 전문 농장을 운영하고 있습니다. 희귀 수초부터 일반 수초까지 200여 종을 직접 재배합니다. 무농약 인증 수초만 판매하며 건강한 수조 환경을 위해 노력합니다.',
    productCount: 31,
    soldCount: 2100,
    followerCount: 3250,
    joinYear: 2017,
    specialties: ['희귀 수초', '직접 재배', '무농약 인증'],
    products: [
      { id: 401, name: '부세파란드라 미니 (3포기)', price: 28000, category: '수초', status: 'ACTIVE', tags: ['부세파란드라', '미니'], rating: 4.8, reviewCount: 57, emoji: '🌿' },
      { id: 402, name: '아누비아스 나나 (5포기)', price: 18000, category: '수초', status: 'ACTIVE', tags: ['아누비아스', '입문용'], rating: 4.7, reviewCount: 98, emoji: '🍀' },
      { id: 403, name: '자바 모스 (탁구공×2)', price: 12000, category: '수초', status: 'ACTIVE', tags: ['모스', '새우용'], rating: 4.6, reviewCount: 134, emoji: '🌱' },
      { id: 404, name: '로탈라 로툰디폴리아 (10줄기)', price: 15000, category: '수초', status: 'ACTIVE', tags: ['로탈라', '유경초'], rating: 4.8, reviewCount: 72, emoji: '🌿' },
      { id: 405, name: '글로소스티그마 (5×5cm 조각)', price: 22000, category: '수초', status: 'ACTIVE', tags: ['전경초', '글로소'], rating: 4.9, reviewCount: 45, emoji: '🍃' },
      { id: 406, name: '바코파 모니에리 (10줄기)', price: 12000, category: '수초', status: 'SOLD_OUT', tags: ['바코파', '유경초'], rating: 4.7, reviewCount: 29, emoji: '🌿' },
      { id: 407, name: 'ADA 뉴 아마조니아 소일 9L', price: 48000, category: '용품', status: 'ACTIVE', tags: ['소일', '수초용'], rating: 4.9, reviewCount: 88, emoji: '🪨' },
      { id: 408, name: 'CO2 확산기 (인라인형)', price: 25000, category: '용품', status: 'ACTIVE', tags: ['CO2', '확산기'], rating: 4.7, reviewCount: 41, emoji: '💨' },
      { id: 409, name: '수초 액비 세트 (3종)', price: 35000, category: '용품', status: 'ACTIVE', tags: ['액비', '비료'], rating: 4.8, reviewCount: 63, emoji: '💧' },
    ],
    auctions: [
      { id: 6, name: '대형 부세파란드라 (희귀 변종)', currentBid: 0, timeLeft: 43200, status: 'UPCOMING', emoji: '🌿' },
    ]
  },
]

const seller = computed(() => sellers.find(s => s.id === sellerId))

const allCategories = ['전체', '어류', '새우/갑각류', '수초', '용품', '사료', '소품'] as const
type CategoryFilter = typeof allCategories[number]

const activeCategory = ref<CategoryFilter>('전체')
const isFollowing = ref(false)
const activeSection = ref<'products' | 'auctions'>('products')

const availableCategories = computed(() => {
  if (!seller.value) return []
  const cats = new Set(seller.value.products.map(p => p.category))
  return allCategories.filter(c => c === '전체' || cats.has(c as ProductCategory))
})

const filteredProducts = computed(() => {
  if (!seller.value) return []
  if (activeCategory.value === '전체') return seller.value.products
  return seller.value.products.filter(p => p.category === activeCategory.value)
})

const formatTime = (seconds: number) => {
  if (seconds <= 0) return '곧 시작'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <!-- Back -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-8 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        뒤로가기
      </button>

      <!-- Not Found -->
      <div v-if="!seller" class="text-center py-32">
        <Package class="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-400">판매자를 찾을 수 없습니다</p>
      </div>

      <template v-else>

        <!-- ── Profile Header ── -->
        <div class="rounded-2xl border border-sky-100 overflow-hidden mb-8">

          <!-- Banner -->
          <div
            class="h-32 bg-gradient-to-r"
            :class="`${seller.gradientFrom} ${seller.gradientTo}`"
          />

          <!-- Profile Card Body -->
          <div class="px-6 pb-6">
            <!-- Avatar + Actions row -->
            <div class="flex items-end justify-between -mt-10 mb-4">
              <!-- Avatar -->
              <div
                class="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br flex items-center justify-center text-white text-3xl font-black shadow-md"
                :class="`${seller.gradientFrom} ${seller.gradientTo}`"
              >
                {{ seller.initial }}
              </div>

              <!-- Follow + Message -->
              <div class="flex gap-2 mt-2">
                <button
                  @click="isFollowing = !isFollowing"
                  class="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  :class="isFollowing
                    ? 'bg-sky-500 text-white'
                    : 'border border-sky-200 text-sky-500 hover:bg-sky-50'"
                >
                  <Heart class="w-4 h-4" :fill="isFollowing ? 'currentColor' : 'none'" />
                  {{ isFollowing ? '팔로잉' : '팔로우' }}
                </button>
              </div>
            </div>

            <!-- Name + Location -->
            <div class="mb-2">
              <h1 class="text-2xl font-black text-slate-900">{{ seller.name }}</h1>
              <div class="flex items-center gap-1.5 mt-1">
                <MapPin class="w-3.5 h-3.5 text-slate-400" />
                <span class="text-sm text-slate-400">{{ seller.location }}</span>
                <span class="text-slate-200 mx-1">·</span>
                <span class="text-sm text-slate-400">{{ seller.joinYear }}년부터 활동</span>
              </div>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-1.5 mb-3">
              <div class="flex">
                <span v-for="i in 5" :key="i" class="text-sm" :class="i <= Math.round(seller.rating) ? 'text-amber-400' : 'text-slate-200'">★</span>
              </div>
              <span class="font-bold text-slate-800 text-sm">{{ seller.rating }}</span>
              <span class="text-slate-400 text-sm">({{ seller.reviewCount.toLocaleString() }}개 리뷰)</span>
            </div>

            <!-- Description -->
            <p class="text-sm text-slate-600 leading-relaxed mb-4">{{ seller.description }}</p>

            <!-- Specialties -->
            <div class="flex flex-wrap gap-2 mb-5">
              <span
                v-for="spec in seller.specialties"
                :key="spec"
                class="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100 font-medium"
              >
                {{ spec }}
              </span>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">등록 상품</p>
                <p class="text-xl font-black text-slate-900">{{ seller.productCount }}</p>
              </div>
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">판매 완료</p>
                <p class="text-xl font-black text-slate-900">{{ seller.soldCount.toLocaleString() }}</p>
              </div>
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">팔로워</p>
                <p class="text-xl font-black text-slate-900">{{ seller.followerCount.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Section Toggle: 상품 / 경매 ── -->
        <div class="flex gap-1 p-1 bg-sky-50 rounded-xl border border-sky-100 mb-6 w-fit">
          <button
            @click="activeSection = 'products'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="activeSection === 'products'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'"
          >
            <Package class="w-4 h-4" />
            상품 {{ seller.products.length }}
          </button>
          <button
            @click="activeSection = 'auctions'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="activeSection === 'auctions'
              ? 'bg-white text-sky-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'"
          >
            <Gavel class="w-4 h-4" />
            경매 {{ seller.auctions.length }}
          </button>
        </div>

        <!-- ── Products Section ── -->
        <template v-if="activeSection === 'products'">

          <!-- Category Filter -->
          <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
            <button
              v-for="cat in availableCategories"
              :key="cat"
              @click="activeCategory = cat"
              class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
              :class="activeCategory === cat
                ? 'bg-sky-500 text-white'
                : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
            >
              {{ cat }}
              <span v-if="cat !== '전체'" class="ml-1 text-xs opacity-70">
                {{ seller.products.filter(p => p.category === cat).length }}
              </span>
            </button>
          </div>

          <!-- Product Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              @click="router.push(`/products/${product.id}`)"
              class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer
                     hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200"
              :class="product.status === 'SOLD_OUT' ? 'opacity-60' : ''"
            >
              <!-- Image Area -->
              <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center">
                <span class="text-4xl">{{ product.emoji }}</span>

                <!-- SOLD OUT Overlay -->
                <div
                  v-if="product.status === 'SOLD_OUT'"
                  class="absolute inset-0 bg-slate-900/40 flex items-center justify-center"
                >
                  <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-3">
                <p class="text-[10px] text-slate-400 mb-1">{{ product.category }}</p>
                <h3 class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{{ product.name }}</h3>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="tag in product.tags.slice(0, 2)"
                    :key="tag"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
                  >
                    #{{ tag }}
                  </span>
                </div>

                <!-- Price + Rating -->
                <div class="flex items-end justify-between">
                  <p class="text-base font-black text-sky-600">₩{{ product.price.toLocaleString() }}</p>
                  <div class="flex items-center gap-0.5 text-xs text-slate-400">
                    <span class="text-amber-400">★</span>
                    <span>{{ product.rating }}</span>
                    <span class="text-slate-300 ml-0.5">({{ product.reviewCount }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProducts.length === 0" class="text-center py-16">
            <Package class="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">해당 카테고리의 상품이 없습니다</p>
          </div>
        </template>

        <!-- ── Auctions Section ── -->
        <template v-else>
          <div v-if="seller.auctions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="auction in seller.auctions"
              :key="auction.id"
              @click="router.push(`/auction/${auction.id}`)"
              class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer
                     hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200"
            >
              <!-- Image -->
              <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center">
                <span class="text-5xl">{{ auction.emoji }}</span>

                <!-- Status Badge -->
                <div
                  v-if="auction.status === 'LIVE'"
                  class="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
                <div
                  v-else
                  class="absolute top-3 left-3 bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  예정
                </div>
              </div>

              <!-- Content -->
              <div class="p-4">
                <h3 class="font-semibold text-slate-800 text-sm line-clamp-2 mb-3">{{ auction.name }}</h3>
                <div class="flex items-end justify-between">
                  <div>
                    <p class="text-[10px] text-slate-400 mb-0.5">{{ auction.status === 'LIVE' ? '현재가' : '시작가' }}</p>
                    <p class="text-lg font-black text-sky-600">
                      {{ auction.currentBid > 0 ? `₩${auction.currentBid.toLocaleString()}` : '시작가 미정' }}
                    </p>
                  </div>
                  <p
                    class="text-xs font-mono font-bold"
                    :class="auction.status === 'LIVE' ? 'text-amber-500' : 'text-sky-400'"
                  >
                    {{ auction.status === 'LIVE' ? formatTime(auction.timeLeft) : '곧 시작' }}
                  </p>
                </div>
                <button
                  class="w-full mt-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                  :class="auction.status === 'LIVE'
                    ? 'bg-sky-500 hover:bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-500 border border-sky-100'"
                >
                  {{ auction.status === 'LIVE' ? '입찰하기' : '경매 보기' }}
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-16">
            <Gavel class="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">진행 중인 경매가 없습니다</p>
          </div>
        </template>

      </template>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
