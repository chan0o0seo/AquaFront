<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

interface Auction {
  id: number
  name: string
  breeder: string
  currentBid: string
  timeLeft: number
}

const auctions = ref<Auction[]>([
  { id: 1, name: 'L-333 킹로얄 플레코', breeder: '플레코마스터', currentBid: '₩85,000', timeLeft: 8073 },
  { id: 2, name: '슈퍼레드 아로와나', breeder: '아로와나팜', currentBid: '₩2,500,000', timeLeft: 12453 },
  { id: 3, name: '블루다이아몬드 디스커스', breeder: '디스커스월드', currentBid: '₩180,000', timeLeft: 5234 },
  { id: 4, name: '크리스탈 레드 쉬림프 S급', breeder: '새우천국', currentBid: '₩65,000', timeLeft: 3412 },
])

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

let interval: number

onMounted(() => {
  interval = setInterval(() => {
    auctions.value = auctions.value.map(auction => ({
      ...auction,
      timeLeft: Math.max(0, auction.timeLeft - 1)
    }))
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <section id="auction" class="py-16 md:py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse-red"></span>
          실시간 경매
        </h2>
        <a href="#" class="text-sky-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
          전체보기 <ArrowRight class="w-4 h-4" />
        </a>
      </div>

      <!-- Auction Cards -->
      <div class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        <div
          v-for="auction in auctions"
          :key="auction.id"
          class="flex-shrink-0 w-72 bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] snap-start"
        >
          <!-- Image Placeholder with Live Badge -->
          <div class="relative w-full aspect-square rounded-xl bg-gradient-to-br from-sky-200 to-teal-300 mb-4 flex items-center justify-center">
            <span class="text-6xl">🐠</span>
            <div class="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <span class="w-2 h-2 bg-white rounded-full animate-pulse-red"></span>
              LIVE
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-3">
            <h3 class="font-semibold text-slate-800">{{ auction.name }}</h3>
            
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-sky-300 to-teal-400"></div>
              <span class="text-sm text-slate-400">by @{{ auction.breeder }}</span>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-slate-400">현재가</p>
                <p class="text-lg font-bold text-sky-600">{{ auction.currentBid }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-400">남은시간</p>
                <p class="text-sm font-mono text-amber-500 font-semibold">
                  ⏱ {{ formatTime(auction.timeLeft) }}
                </p>
              </div>
            </div>

            <button class="w-full py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors">
              입찰하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
