<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Loader2, Gavel } from 'lucide-vue-next'
import { auctionApi, type AuctionResponse } from '@/api/auction.api'

const router = useRouter()

const auctions = ref<AuctionResponse[]>([])
const isLoading = ref(true)
const now = ref(Date.now())

let clockInterval: ReturnType<typeof setInterval>

// endAt ISO 문자열로부터 남은 초 계산
function secondsLeft(endAt: string) {
  return Math.max(0, Math.floor((new Date(endAt).getTime() - now.value) / 1000))
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatPrice = (n: number) => '₩' + n.toLocaleString()

// ACTIVE 우선 표시, 없으면 SCHEDULED 표시
const displayAuctions = computed(() => {
  const active = auctions.value.filter(a => a.status === 'ACTIVE')
  return active.length > 0 ? active : auctions.value.filter(a => a.status === 'SCHEDULED')
})

const isScheduled = computed(() => {
  return auctions.value.filter(a => a.status === 'ACTIVE').length === 0
    && auctions.value.filter(a => a.status === 'SCHEDULED').length > 0
})

onMounted(async () => {
  try {
    auctions.value = await auctionApi.getList()
  } catch {
    auctions.value = []
  } finally {
    isLoading.value = false
  }
  clockInterval = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<template>
  <section id="auction" class="py-16 md:py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <span v-if="!isScheduled" class="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          {{ isScheduled ? '예정된 경매' : '실시간 경매' }}
        </h2>
        <button
          @click="router.push('/auction')"
          class="text-sky-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          전체보기 <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
      </div>

      <!-- 빈 상태 -->
      <div
        v-else-if="displayAuctions.length === 0"
        class="text-center py-16 bg-white rounded-2xl border border-sky-100"
      >
        <Gavel class="w-12 h-12 text-sky-200 mx-auto mb-3" />
        <p class="text-slate-400 font-medium mb-2">현재 진행 중인 경매가 없습니다</p>
        <p class="text-slate-300 text-sm">곧 새로운 경매가 시작됩니다</p>
      </div>

      <!-- 경매 카드 목록 -->
      <div v-else class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        <div
          v-for="auction in displayAuctions.slice(0, 6)"
          :key="auction.id"
          class="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] snap-start cursor-pointer"
          @click="router.push(`/auction/${auction.id}`)"
        >
          <!-- 이미지 -->
          <div class="relative w-full aspect-square bg-gradient-to-br from-sky-100 to-teal-200">
            <img
              v-if="auction.imageUrls.length > 0"
              :src="auction.imageUrls[0]"
              :alt="auction.productName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-6xl">🐠</div>

            <!-- LIVE / 예정 배지 -->
            <div
              class="absolute top-3 left-3 flex items-center gap-1.5 text-white text-xs font-bold px-2.5 py-1 rounded-full"
              :class="auction.status === 'ACTIVE' ? 'bg-red-500' : 'bg-sky-500'"
            >
              <span v-if="auction.status === 'ACTIVE'" class="w-2 h-2 bg-white rounded-full animate-pulse" />
              {{ auction.status === 'ACTIVE' ? 'LIVE' : '예정' }}
            </div>

            <!-- 입찰 수 -->
            <div v-if="auction.bidCount > 0" class="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
              {{ auction.bidCount }}명 입찰
            </div>
          </div>

          <!-- 컨텐츠 -->
          <div class="p-5 space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex-shrink-0" />
              <span class="text-xs text-slate-400 truncate">@{{ auction.sellerNickName }}</span>
            </div>

            <h3 class="font-semibold text-slate-800 line-clamp-2 leading-snug">{{ auction.productName }}</h3>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-slate-400">{{ auction.status === 'ACTIVE' ? '현재가' : '시작가' }}</p>
                <p class="text-lg font-black text-sky-600">
                  {{ formatPrice(auction.status === 'ACTIVE' ? auction.currentPrice : auction.startPrice) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-400">{{ auction.status === 'ACTIVE' ? '남은시간' : '시작까지' }}</p>
                <p
                  class="text-sm font-mono font-semibold"
                  :class="auction.status === 'ACTIVE'
                    ? secondsLeft(auction.endAt) < 300 ? 'text-red-500' : 'text-amber-500'
                    : 'text-sky-500'"
                >
                  {{ formatTime(secondsLeft(auction.status === 'ACTIVE' ? auction.endAt : auction.startAt)) }}
                </p>
              </div>
            </div>

            <button
              class="w-full py-3 font-semibold rounded-xl transition-colors text-sm"
              :class="auction.status === 'ACTIVE'
                ? 'bg-sky-500 hover:bg-sky-600 text-white'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200'"
              @click.stop="router.push(`/auction/${auction.id}`)"
            >
              {{ auction.status === 'ACTIVE' ? '입찰하기' : '알림 신청' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
