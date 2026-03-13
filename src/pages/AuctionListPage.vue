<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gavel, Clock, TrendingUp, Search } from 'lucide-vue-next'
import { auctionApi, type AuctionResponse, type AuctionStatus } from '@/api'

const router = useRouter()

type StatusFilter = '전체' | '진행중' | '예정'
const activeFilter = ref<StatusFilter>('전체')
const searchQuery = ref('')
const statusFilters: StatusFilter[] = ['전체', '진행중', '예정']

const auctions = ref<AuctionResponse[]>([])
const isLoading = ref(true)
const now = ref(Date.now())

let interval: ReturnType<typeof setInterval>

onMounted(async () => {
  try {
    const [active, scheduled] = await Promise.all([
      auctionApi.getActive(),
      auctionApi.getScheduled(),
    ])
    auctions.value = [...active, ...scheduled]
  } catch (e) {
    console.error('Failed to load auctions', e)
  } finally {
    isLoading.value = false
  }
  interval = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(interval))

const getSecondsLeft = (endAt: string) =>
  Math.max(0, Math.floor((new Date(endAt).getTime() - now.value) / 1000))

const formatTime = (endAt: string) => {
  const seconds = getSecondsLeft(endAt)
  if (seconds <= 0) return '종료'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m.toString().padStart(2, '0')}분`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const isEndingSoon = (endAt: string) => {
  const s = getSecondsLeft(endAt)
  return s > 0 && s < 3600
}

const filteredAuctions = computed(() => {
  return auctions.value.filter(a => {
    const statusMatch =
      activeFilter.value === '전체' ||
      (activeFilter.value === '진행중' && a.status === 'ACTIVE') ||
      (activeFilter.value === '예정' && a.status === 'SCHEDULED')
    const q = searchQuery.value.toLowerCase()
    const searchMatch =
      q === '' ||
      a.productName.toLowerCase().includes(q) ||
      a.sellerNickName.toLowerCase().includes(q) ||
      (a.species?.toLowerCase().includes(q) ?? false)
    return statusMatch && searchMatch
  })
})

const liveCount = computed(() => auctions.value.filter(a => a.status === 'ACTIVE').length)
const scheduledCount = computed(() => auctions.value.filter(a => a.status === 'SCHEDULED').length)
const endingSoonCount = computed(() => auctions.value.filter(a => a.status === 'ACTIVE' && isEndingSoon(a.endAt)).length)
</script>

<template>
  <div class="bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-black text-slate-900">실시간 경매</h1>
          <span v-if="liveCount > 0" class="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE {{ liveCount }}
          </span>
        </div>
        <p class="text-slate-400 text-sm">희귀 개체와 수초를 경매로 만나보세요</p>
      </div>

      <!-- Search + Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="어종명, 브리더 검색"
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all text-sm"
          />
        </div>
        <div class="flex gap-2">
          <button
            v-for="f in statusFilters"
            :key="f"
            @click="activeFilter = f"
            class="flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150"
            :class="activeFilter === f
              ? 'bg-sky-500 text-white'
              : 'bg-sky-50 text-slate-600 hover:bg-sky-100'"
          >
            {{ f }}
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
          <div class="text-2xl font-black text-slate-900">{{ liveCount }}</div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
          <div class="flex items-center gap-2 mb-1">
            <Clock class="w-3 h-3 text-slate-400" />
            <span class="text-xs text-slate-500">종료 임박</span>
          </div>
          <div class="text-2xl font-black text-amber-500">{{ endingSoonCount }}</div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
          <div class="flex items-center gap-2 mb-1">
            <TrendingUp class="w-3 h-3 text-slate-400" />
            <span class="text-xs text-slate-500">예정 경매</span>
          </div>
          <div class="text-2xl font-black text-slate-900">{{ scheduledCount }}</div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>

      <!-- Auction Grid -->
      <div
        v-else-if="filteredAuctions.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        <div
          v-for="auction in filteredAuctions"
          :key="auction.id"
          @click="router.push(`/auction/${auction.id}`)"
          class="bg-white rounded-2xl border border-sky-100 overflow-hidden transition-all duration-200 group cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-sky-200"
          :class="auction.status === 'ENDED' || auction.status === 'CANCELLED' ? 'opacity-70' : ''"
        >
          <!-- Image Area -->
          <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
            <img
              v-if="auction.imageUrls.length > 0"
              :src="auction.imageUrls[0]"
              :alt="auction.productName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-5xl">🐠</span>
            </div>

            <!-- Status Badge -->
            <div
              v-if="auction.status === 'ACTIVE'"
              class="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            >
              <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
            <div
              v-else-if="auction.status === 'SCHEDULED'"
              class="absolute top-3 left-3 bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            >
              예정
            </div>
            <div
              v-else
              class="absolute top-3 left-3 bg-slate-400 text-white text-xs font-bold px-2.5 py-1 rounded-full"
            >
              종료
            </div>

            <!-- Ending Soon Timer -->
            <div
              v-if="auction.status === 'ACTIVE' && isEndingSoon(auction.endAt)"
              class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-mono font-bold px-3 py-1 rounded-full"
            >
              ⏱ {{ formatTime(auction.endAt) }}
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4">
            <h3 class="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug mb-2">
              {{ auction.productName }}
            </h3>

            <div class="flex items-center gap-2 mb-3">
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-[10px] font-black">
                {{ auction.sellerNickName.charAt(0) }}
              </div>
              <span class="text-xs text-slate-400">{{ auction.sellerNickName }}</span>
            </div>

            <div class="flex items-end justify-between">
              <div>
                <p class="text-[10px] text-slate-400 mb-0.5">
                  {{ auction.status === 'SCHEDULED' ? '시작가' : '현재가' }}
                </p>
                <p class="text-base font-black text-sky-600">
                  ₩{{ (auction.status === 'SCHEDULED' ? auction.startPrice : auction.currentPrice).toLocaleString() }}
                </p>
                <p class="text-[10px] text-slate-400 mt-0.5">{{ auction.bidCount }}명 입찰</p>
              </div>
              <div class="text-right">
                <p
                  class="text-xs font-mono font-bold"
                  :class="isEndingSoon(auction.endAt) ? 'text-amber-500' : 'text-slate-400'"
                >
                  <template v-if="auction.status === 'ACTIVE'">{{ formatTime(auction.endAt) }}</template>
                  <template v-else-if="auction.status === 'SCHEDULED'">곧 시작</template>
                  <template v-else>낙찰 완료</template>
                </p>
              </div>
            </div>

            <div v-if="auction.species" class="mt-2">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                {{ auction.species }}
              </span>
            </div>

            <button
              v-if="auction.status === 'ACTIVE'"
              class="w-full mt-3 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              입찰하기
            </button>
            <div
              v-else-if="auction.status === 'SCHEDULED'"
              class="w-full mt-3 py-2.5 bg-sky-50 text-sky-500 text-sm font-semibold rounded-xl text-center border border-sky-100"
            >
              예정
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
        <p class="text-slate-400">{{ isLoading ? '불러오는 중...' : '진행 중인 경매가 없습니다' }}</p>
        <button
          v-if="activeFilter !== '전체' || searchQuery"
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
