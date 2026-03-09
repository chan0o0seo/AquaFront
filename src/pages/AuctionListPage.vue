<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gavel, Clock, TrendingUp, Filter, ChevronRight, Search } from 'lucide-vue-next'

const router = useRouter()

type AuctionStatus = 'LIVE' | 'UPCOMING' | 'ENDED'
type AuctionCategory = '전체' | '어류' | '새우/갑각류' | '수초' | '용품'

interface Auction {
  id: number
  name: string
  breeder: string
  breederInitial: string
  currentBid: number
  startBid: number
  bidCount: number
  timeLeft: number // seconds
  status: AuctionStatus
  category: string
  tags: string[]
}

const activeFilter = ref<AuctionCategory>('전체')
const searchQuery = ref('')

const categories: AuctionCategory[] = ['전체', '어류', '새우/갑각류', '수초', '용품']

const auctions = ref<Auction[]>([
  {
    id: 1,
    name: 'L-333 킹로얄 플레코 (성어 1마리)',
    breeder: '플레코마스터',
    breederInitial: '플',
    currentBid: 85000,
    startBid: 30000,
    bidCount: 12,
    timeLeft: 8073,
    status: 'LIVE',
    category: '어류',
    tags: ['플레코', 'L번호', '희귀종']
  },
  {
    id: 2,
    name: '슈퍼레드 아로와나 (25cm)',
    breeder: '아로와나팜',
    breederInitial: '아',
    currentBid: 2500000,
    startBid: 1000000,
    bidCount: 7,
    timeLeft: 12453,
    status: 'LIVE',
    category: '어류',
    tags: ['아로와나', '고급어종']
  },
  {
    id: 3,
    name: '블루다이아몬드 디스커스 (3마리 세트)',
    breeder: '디스커스월드',
    breederInitial: '디',
    currentBid: 180000,
    startBid: 80000,
    bidCount: 24,
    timeLeft: 1820,
    status: 'LIVE',
    category: '어류',
    tags: ['디스커스', '열대어']
  },
  {
    id: 4,
    name: '크리스탈 레드 쉬림프 S급 (10마리)',
    breeder: '새우천국',
    breederInitial: '새',
    currentBid: 65000,
    startBid: 20000,
    bidCount: 18,
    timeLeft: 3412,
    status: 'LIVE',
    category: '새우/갑각류',
    tags: ['CRS', 'S급', '크리스탈']
  },
  {
    id: 5,
    name: '풀레드 구피 트리오 (1쌍+수컷)',
    breeder: '구피팜',
    breederInitial: '구',
    currentBid: 45000,
    startBid: 15000,
    bidCount: 9,
    timeLeft: 21600,
    status: 'LIVE',
    category: '어류',
    tags: ['구피', '풀레드', '초보추천']
  },
  {
    id: 6,
    name: '대형 부세파란드라 (희귀 변종)',
    breeder: '수초팜',
    breederInitial: '수',
    currentBid: 120000,
    startBid: 50000,
    bidCount: 15,
    timeLeft: 43200,
    status: 'UPCOMING',
    category: '수초',
    tags: ['부세파란드라', '희귀수초']
  },
  {
    id: 7,
    name: 'ADA 뉴 아마조니아 소일 9L (미개봉)',
    breeder: '용품마켓',
    breederInitial: '용',
    currentBid: 28000,
    startBid: 20000,
    bidCount: 4,
    timeLeft: 0,
    status: 'ENDED',
    category: '용품',
    tags: ['ADA', '소일', '수초용']
  },
  {
    id: 8,
    name: '골든 아이 코리도라스 (5마리)',
    breeder: '코리팜',
    breederInitial: '코',
    currentBid: 38000,
    startBid: 15000,
    bidCount: 11,
    timeLeft: 0,
    status: 'ENDED',
    category: '어류',
    tags: ['코리도라스', '청소부']
  },
])

// 실시간 카운트다운
let interval: ReturnType<typeof setInterval>
onMounted(() => {
  interval = setInterval(() => {
    auctions.value = auctions.value.map(a => ({
      ...a,
      timeLeft: a.status === 'LIVE' ? Math.max(0, a.timeLeft - 1) : a.timeLeft
    }))
  }, 1000)
})
onUnmounted(() => clearInterval(interval))

const formatTime = (seconds: number) => {
  if (seconds <= 0) return '종료'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m.toString().padStart(2, '0')}분`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const isEndingSoon = (seconds: number) => seconds > 0 && seconds < 3600 // 1시간 미만

const filteredAuctions = computed(() => {
  return auctions.value.filter(a => {
    const categoryMatch = activeFilter.value === '전체' || a.category === activeFilter.value
    const searchMatch = searchQuery.value === '' ||
      a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.breeder.includes(searchQuery.value) ||
      a.tags.some(t => t.includes(searchQuery.value))
    return categoryMatch && searchMatch
  })
})

const liveCount = computed(() => auctions.value.filter(a => a.status === 'LIVE').length)
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-black text-slate-900">실시간 경매</h1>
          <span class="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE {{ liveCount }}
          </span>
        </div>
        <p class="text-slate-400 text-sm">희귀 개체와 수초를 경매로 만나보세요</p>
      </div>

      <!-- Search + Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <!-- Search -->
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="어종, 브리더, 태그 검색"
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all text-sm"
          />
        </div>

        <!-- Category Filters -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeFilter = cat"
            class="flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150"
            :class="activeFilter === cat
              ? 'bg-sky-500 text-white'
              : 'bg-sky-50 text-slate-600 hover:bg-sky-100'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span class="text-xs text-slate-500">진행 중</span>
          </div>
          <div class="text-2xl font-black text-slate-900">{{ auctions.filter(a => a.status === 'LIVE').length }}</div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
          <div class="flex items-center gap-2 mb-1">
            <Clock class="w-3 h-3 text-slate-400" />
            <span class="text-xs text-slate-500">종료 임박</span>
          </div>
          <div class="text-2xl font-black text-amber-500">
            {{ auctions.filter(a => isEndingSoon(a.timeLeft)).length }}
          </div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
          <div class="flex items-center gap-2 mb-1">
            <TrendingUp class="w-3 h-3 text-slate-400" />
            <span class="text-xs text-slate-500">오늘 총 입찰</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            {{ auctions.reduce((s, a) => s + a.bidCount, 0) }}
          </div>
        </div>
      </div>

      <!-- Auction Grid -->
      <div
        v-if="filteredAuctions.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        <div
          v-for="auction in filteredAuctions"
          :key="auction.id"
          @click="auction.status !== 'ENDED' && router.push(`/auction/${auction.id}`)"
          class="bg-white rounded-2xl border border-sky-100 overflow-hidden transition-all duration-200 group"
          :class="auction.status !== 'ENDED'
            ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-sky-200'
            : 'opacity-60'"
        >
          <!-- Image Area -->
          <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center">
            <span class="text-5xl">🐠</span>

            <!-- LIVE Badge -->
            <div
              v-if="auction.status === 'LIVE'"
              class="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            >
              <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>

            <!-- UPCOMING Badge -->
            <div
              v-else-if="auction.status === 'UPCOMING'"
              class="absolute top-3 left-3 bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            >
              예정
            </div>

            <!-- ENDED Badge -->
            <div
              v-else
              class="absolute top-3 left-3 bg-slate-400 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            >
              종료
            </div>

            <!-- Timer pill (ending soon) -->
            <div
              v-if="auction.status === 'LIVE' && isEndingSoon(auction.timeLeft)"
              class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full"
            >
              ⏱ {{ formatTime(auction.timeLeft) }}
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4">
            <!-- Name -->
            <h3 class="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug mb-2">
              {{ auction.name }}
            </h3>

            <!-- Breeder -->
            <div class="flex items-center gap-2 mb-3">
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-[10px] font-black">
                {{ auction.breederInitial }}
              </div>
              <span class="text-xs text-slate-400">{{ auction.breeder }}</span>
            </div>

            <!-- Bid Info -->
            <div class="flex items-end justify-between">
              <div>
                <p class="text-[10px] text-slate-400 mb-0.5">현재가</p>
                <p class="text-base font-black text-sky-600">₩{{ auction.currentBid.toLocaleString() }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">{{ auction.bidCount }}명 입찰</p>
              </div>
              <div class="text-right">
                <p
                  class="text-xs font-mono font-bold"
                  :class="isEndingSoon(auction.timeLeft) ? 'text-amber-500' : 'text-slate-400'"
                >
                  <template v-if="auction.status === 'LIVE'">{{ formatTime(auction.timeLeft) }}</template>
                  <template v-else-if="auction.status === 'UPCOMING'">곧 시작</template>
                  <template v-else>낙찰 완료</template>
                </p>
              </div>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1 mt-3">
              <span
                v-for="tag in auction.tags.slice(0, 2)"
                :key="tag"
                class="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- CTA Button -->
            <button
              v-if="auction.status === 'LIVE'"
              class="w-full mt-3 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              입찰하기
            </button>
            <div
              v-else-if="auction.status === 'UPCOMING'"
              class="w-full mt-3 py-2.5 bg-sky-50 text-sky-500 text-sm font-semibold rounded-xl text-center border border-sky-100"
            >
              알림 신청
            </div>
            <div
              v-else
              class="w-full mt-3 py-2.5 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl text-center"
            >
              경매 종료
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <Gavel class="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-400">검색 결과가 없습니다</p>
        <button
          @click="activeFilter = '전체'; searchQuery = ''"
          class="mt-4 text-sky-500 text-sm hover:underline"
        >
          전체 경매 보기
        </button>
      </div>

    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
