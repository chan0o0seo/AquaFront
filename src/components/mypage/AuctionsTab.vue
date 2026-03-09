<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gavel, Trophy, Clock } from 'lucide-vue-next'

const router = useRouter()

const activeFilter = ref('전체')
const filterOptions = ['전체', '입찰 중', '낙찰', '패찰']

const auctions = ref({
  active: [
    { id: 1,  name: 'L-333 킹로얄 플레코 (성어)',       sellerId: 1, sellerName: '플레코마스터', emoji: '🐠', currentBid: 85000,  myBid: 80000,  timeLeft: 8073, isWinning: false },
    { id: 3,  name: '블루다이아몬드 디스커스 (3마리)',   sellerId: 3, sellerName: '디스커스월드', emoji: '🐟', currentBid: 180000, myBid: 180000, timeLeft: 1820, isWinning: true  }
  ],
  past: [
    { id: 11, name: '크리스탈 레드 쉬림프 S급 (10마리)', sellerId: 2, sellerName: '새우천국',  emoji: '🦐', myBid: 65000,    finalPrice: 65000,    result: '낙찰', reviewed: false, endedAt: '2026-03-07' },
    { id: 12, name: '슈퍼레드 아로와나 (25cm)',           sellerId: 5, sellerName: '아로와나팜', emoji: '🐠', myBid: 2300000, finalPrice: 2500000,  result: '패찰', reviewed: false, endedAt: '2026-03-06' },
    { id: 13, name: '풀레드 구피 트리오',                 sellerId: 5, sellerName: '구피팜',    emoji: '🐟', myBid: 45000,    finalPrice: 45000,    result: '낙찰', reviewed: true,  endedAt: '2026-03-05' }
  ]
})

// Countdown timer
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    auctions.value.active.forEach(a => { if (a.timeLeft > 0) a.timeLeft-- })
  }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const formatTime = (secs: number) => {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
const formatPrice = (n: number) => '₩' + n.toLocaleString()

const filteredActive = computed(() => {
  if (activeFilter.value === '전체' || activeFilter.value === '입찰 중') return auctions.value.active
  return []
})

const filteredPast = computed(() => {
  if (activeFilter.value === '전체') return auctions.value.past
  if (activeFilter.value === '낙찰') return auctions.value.past.filter(p => p.result === '낙찰')
  if (activeFilter.value === '패찰') return auctions.value.past.filter(p => p.result === '패찰')
  return []
})

const showEmpty = computed(() =>
    filteredActive.value.length === 0 && filteredPast.value.length === 0
)

const totalWon = computed(() =>
    auctions.value.past.filter(p => p.result === '낙찰').reduce((acc, p) => acc + p.finalPrice, 0)
)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h1 class="text-xl font-black text-slate-900">참여 경매</h1>
      <div class="flex gap-2 flex-wrap">
        <button
            v-for="opt in filterOptions"
            :key="opt"
            @click="activeFilter = opt"
            :class="[
            'px-4 py-1.5 text-sm rounded-full transition font-semibold',
            activeFilter === opt
              ? 'bg-sky-500 text-white'
              : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'
          ]"
        >
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- Summary Strip -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
        <div class="text-2xl font-black text-sky-600">{{ auctions.active.length }}건</div>
        <div class="text-xs text-slate-400 mt-0.5">입찰 중</div>
      </div>
      <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
        <div class="text-2xl font-black text-emerald-600">{{ auctions.past.filter(p => p.result === '낙찰').length }}건</div>
        <div class="text-xs text-slate-400 mt-0.5">낙찰</div>
      </div>
      <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
        <div class="text-2xl font-black text-slate-900">{{ formatPrice(totalWon) }}</div>
        <div class="text-xs text-slate-400 mt-0.5">총 낙찰액</div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="showEmpty" class="text-center py-20">
      <Gavel class="w-12 h-12 text-slate-200 mx-auto mb-3" />
      <p class="text-slate-400 text-sm">아직 참여한 경매가 없습니다</p>
      <button
          @click="router.push('/auction')"
          class="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition"
      >
        경매 보러 가기
      </button>
    </div>

    <template v-else>
      <!-- Active Auctions -->
      <div v-if="filteredActive.length > 0" class="mb-8">
        <div class="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
          <span>실시간 입찰 중</span>
          <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
        </div>
        <div class="space-y-3">
          <div
              v-for="item in filteredActive"
              :key="item.id"
              @click="router.push(`/auction/${item.id}`)"
              class="bg-white rounded-2xl border border-sky-100 p-5 cursor-pointer hover:shadow-md hover:border-sky-200 transition-all"
          >
            <div class="flex items-center gap-2 mb-3">
              <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
              <span class="font-mono text-amber-500 text-sm font-bold ml-auto">
                <Clock class="w-3.5 h-3.5 inline mr-1" />
                {{ formatTime(item.timeLeft) }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center text-2xl flex-shrink-0">
                {{ item.emoji }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-800 text-sm line-clamp-1">{{ item.name }}</div>
                <div class="text-xs text-slate-400 mt-0.5">{{ item.sellerName }}</div>
              </div>
              <div class="text-right flex-shrink-0 space-y-1">
                <div>
                  <div class="text-xs text-slate-400">현재가</div>
                  <div class="font-black text-sky-600 text-sm">{{ formatPrice(item.currentBid) }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-400">내 입찰</div>
                  <div class="text-sm font-semibold text-slate-700">{{ formatPrice(item.myBid) }}</div>
                </div>
                <span :class="[
                  'rounded-full text-xs px-2 py-0.5 font-semibold',
                  item.isWinning ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                ]">
                  {{ item.isWinning ? '최고 입찰자' : '입찰 중' }}
                </span>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-sky-50">
              <button class="text-sm text-sky-600 hover:underline font-semibold">경매 보기</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Auctions -->
      <div v-if="filteredPast.length > 0" :class="filteredActive.length > 0 ? 'mt-8' : ''">
        <div class="text-sm font-black text-slate-700 mb-3">지난 경매</div>
        <div class="space-y-3">
          <div
              v-for="item in filteredPast"
              :key="item.id"
              class="bg-white rounded-2xl border border-sky-100 p-5 transition-all"
              :class="item.result === '패찰' ? 'opacity-80' : ''"
          >
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center text-2xl flex-shrink-0">
                {{ item.emoji }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-800 text-sm line-clamp-1">{{ item.name }}</div>
                <div class="text-xs text-slate-400 mt-0.5">{{ item.sellerName }} · {{ item.endedAt }}</div>
              </div>
              <div class="text-right flex-shrink-0 space-y-1">
                <span :class="[
                  'rounded-full text-xs px-2 py-0.5 font-semibold inline-flex items-center gap-1',
                  item.result === '낙찰' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                ]">
                  <Trophy v-if="item.result === '낙찰'" class="w-3.5 h-3.5" />
                  {{ item.result }}
                </span>
                <div class="text-xs text-slate-400 mt-1">{{ item.result === '낙찰' ? '낙찰가' : '최종가' }}</div>
                <div class="font-black text-sm" :class="item.result === '낙찰' ? 'text-emerald-600' : 'text-slate-500'">
                  {{ formatPrice(item.finalPrice) }}
                </div>
              </div>
            </div>
            <div v-if="item.result === '낙찰' && !item.reviewed" class="mt-3 pt-3 border-t border-sky-50">
              <button class="text-sm text-sky-600 hover:underline font-semibold">리뷰 작성</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
