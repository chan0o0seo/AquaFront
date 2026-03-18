<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gavel, Trophy, Clock, Loader2, Bell } from 'lucide-vue-next'
import { auctionApi, type MyBidResponse, type AuctionResponse } from '@/api'

interface Props {
  initialBids?: MyBidResponse[]
}
const props = withDefaults(defineProps<Props>(), { initialBids: undefined })

const router = useRouter()

type Filter = '전체' | '입찰중' | '낙찰' | '패찰'
const activeFilter = ref<Filter>('전체')
const filterOptions: Filter[] = ['전체', '입찰중', '낙찰', '패찰']

const myBids = ref<MyBidResponse[]>(props.initialBids ?? [])
const myWatches = ref<AuctionResponse[]>([])
const isLoading = ref(true)
const now = ref(Date.now())

let timer: ReturnType<typeof setInterval>
onMounted(async () => {
  try {
    const [bids, watches] = await Promise.all([
      props.initialBids ? Promise.resolve(props.initialBids) : auctionApi.getMyBids(),
      auctionApi.getMyWatches(),
    ])
    myBids.value = bids
    myWatches.value = watches
  } catch (e) {
    console.error('Failed to load auction data', e)
  } finally {
    isLoading.value = false
  }
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(timer))

// ── 분류 ──────────────────────────────────────────────────
const activeBids = computed(() => myBids.value.filter(b => b.status === 'ACTIVE'))
const wonBids    = computed(() => myBids.value.filter(b => b.status === 'ENDED' && b.winning))
const lostBids   = computed(() => myBids.value.filter(b => b.status === 'ENDED' && !b.winning))
const endedBids  = computed(() => myBids.value.filter(b => b.status === 'ENDED'))

const filteredActive = computed(() => {
  if (activeFilter.value === '전체' || activeFilter.value === '입찰중') return activeBids.value
  return []
})
const filteredPast = computed(() => {
  if (activeFilter.value === '전체') return endedBids.value
  if (activeFilter.value === '낙찰') return wonBids.value
  if (activeFilter.value === '패찰') return lostBids.value
  return []
})
const showEmpty = computed(() => filteredActive.value.length === 0 && filteredPast.value.length === 0)

// ── 포맷 ──────────────────────────────────────────────────
const getSecondsLeft = (endAt: string) =>
  Math.max(0, Math.floor((new Date(endAt).getTime() - now.value) / 1000))

const formatCountdown = (endAt: string) => {
  const s = getSecondsLeft(endAt)
  if (s <= 0) return '종료'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

const isEndingSoon = (endAt: string) => {
  const s = getSecondsLeft(endAt)
  return s > 0 && s < 3600
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`
  } catch { return iso.slice(0,10) }
}

const totalWon = computed(() =>
  wonBids.value.reduce((sum, b) => sum + b.currentPrice, 0)
)

// 알림 신청한 예정/진행 경매만 (종료된 건 제외)
const activeWatches = computed(() =>
  myWatches.value.filter(w => w.status === 'SCHEDULED' || w.status === 'ACTIVE')
)

const unwatchAuction = async (auctionId: number) => {
  try {
    await auctionApi.unwatchAuction(auctionId)
    myWatches.value = myWatches.value.filter(w => w.id !== auctionId)
  } catch (e) {
    console.error('Failed to unwatch', e)
  }
}

const formatStartAt = (iso: string) => {
  try {
    const d = new Date(iso)
    return `${d.getMonth()+1}.${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} 시작`
  } catch { return iso.slice(0, 16) }
}
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
        >{{ opt }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
    </div>

    <template v-else>
      <!-- Summary Strip -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
          <div class="text-2xl font-black text-sky-600">{{ activeBids.length }}건</div>
          <div class="text-xs text-slate-400 mt-0.5">입찰 중</div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
          <div class="text-2xl font-black text-emerald-600">{{ wonBids.length }}건</div>
          <div class="text-xs text-slate-400 mt-0.5">낙찰</div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
          <div class="text-2xl font-black text-amber-500">{{ activeWatches.length }}건</div>
          <div class="text-xs text-slate-400 mt-0.5">알림 신청</div>
        </div>
        <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center">
          <div class="text-2xl font-black text-slate-900">
            {{ totalWon > 0 ? '₩' + totalWon.toLocaleString() : '-' }}
          </div>
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
        <!-- Active (입찰 중) -->
        <div v-if="filteredActive.length > 0" class="mb-8">
          <div class="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
            <span>실시간 입찰 중</span>
            <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          </div>
          <div class="space-y-3">
            <div
              v-for="item in filteredActive"
              :key="item.auctionId"
              @click="router.push(`/auction/${item.auctionId}`)"
              class="bg-white rounded-2xl border border-sky-100 p-5 cursor-pointer hover:shadow-md hover:border-sky-200 transition-all"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                <span
                  class="font-mono text-sm font-bold ml-auto"
                  :class="isEndingSoon(item.endAt) ? 'text-amber-500' : 'text-slate-400'"
                >
                  <Clock class="w-3.5 h-3.5 inline mr-1" />
                  {{ formatCountdown(item.endAt) }}
                </span>
              </div>
              <div class="flex items-center gap-4">
                <!-- Thumbnail -->
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex-shrink-0 overflow-hidden">
                  <img
                    v-if="item.imageUrls.length > 0"
                    :src="item.imageUrls[0]"
                    :alt="item.productName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">🐠</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-slate-800 text-sm line-clamp-1">{{ item.productName }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ item.sellerNickName }}</div>
                </div>
                <div class="text-right flex-shrink-0 space-y-1">
                  <div>
                    <div class="text-xs text-slate-400">현재가</div>
                    <div class="font-black text-sky-600 text-sm">₩{{ item.currentPrice.toLocaleString() }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400">내 입찰</div>
                    <div class="text-sm font-semibold text-slate-700">₩{{ item.myHighestBid.toLocaleString() }}</div>
                  </div>
                  <span :class="[
                    'rounded-full text-xs px-2 py-0.5 font-semibold',
                    item.winning ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  ]">
                    {{ item.winning ? '최고 입찰자' : '입찰 중' }}
                  </span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-sky-50">
                <button class="text-sm text-sky-600 hover:underline font-semibold">경매 보기 →</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Past (낙찰 / 패찰) -->
        <div v-if="filteredPast.length > 0">
          <div class="text-sm font-black text-slate-700 mb-3">지난 경매</div>
          <div class="space-y-3">
            <div
              v-for="item in filteredPast"
              :key="item.auctionId"
              @click="router.push(`/auction/${item.auctionId}`)"
              class="bg-white rounded-2xl border border-sky-100 p-5 cursor-pointer hover:shadow-sm transition-all"
              :class="!item.winning ? 'opacity-80' : ''"
            >
              <div class="flex items-center gap-4">
                <!-- Thumbnail -->
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex-shrink-0 overflow-hidden">
                  <img
                    v-if="item.imageUrls.length > 0"
                    :src="item.imageUrls[0]"
                    :alt="item.productName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">🐠</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-slate-800 text-sm line-clamp-1">{{ item.productName }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">
                    {{ item.sellerNickName }} · {{ formatDate(item.endAt) }} 종료
                  </div>
                </div>
                <div class="text-right flex-shrink-0 space-y-1">
                  <span :class="[
                    'rounded-full text-xs px-2 py-0.5 font-semibold inline-flex items-center gap-1',
                    item.winning ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  ]">
                    <Trophy v-if="item.winning" class="w-3.5 h-3.5" />
                    {{ item.winning ? '낙찰' : '패찰' }}
                  </span>
                  <div class="text-xs text-slate-400 mt-1">{{ item.winning ? '낙찰가' : '최종가' }}</div>
                  <div
                    class="font-black text-sm"
                    :class="item.winning ? 'text-emerald-600' : 'text-slate-500'"
                  >
                    ₩{{ item.currentPrice.toLocaleString() }}
                  </div>
                  <div class="text-xs text-slate-400">
                    내 입찰 ₩{{ item.myHighestBid.toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 알림 신청한 경매 -->
      <div v-if="activeWatches.length > 0" class="mt-8">
        <div class="flex items-center gap-2 text-sm font-black text-slate-700 mb-3">
          <Bell class="w-4 h-4 text-amber-500" />
          알림 신청한 경매
        </div>
        <div class="space-y-3">
          <div
            v-for="item in activeWatches"
            :key="item.id"
            class="bg-white rounded-2xl border border-sky-100 p-5 cursor-pointer hover:shadow-md hover:border-sky-200 transition-all"
          >
            <div class="flex items-center gap-4">
              <!-- Thumbnail -->
              <div
                class="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-sky-100 to-teal-200"
                @click="router.push(`/auction/${item.id}`)"
              >
                <img
                  v-if="item.imageUrls.length > 0"
                  :src="item.imageUrls[0]"
                  :alt="item.productName"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-2xl">🐠</div>
              </div>
              <div class="flex-1 min-w-0" @click="router.push(`/auction/${item.id}`)">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    :class="item.status === 'ACTIVE'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-sky-100 text-sky-600'"
                  >
                    {{ item.status === 'ACTIVE' ? 'LIVE' : '예정' }}
                  </span>
                </div>
                <div class="font-semibold text-slate-800 text-sm line-clamp-1">{{ item.productName }}</div>
                <div class="text-xs text-slate-400 mt-0.5">
                  {{ item.sellerNickName }} ·
                  <span v-if="item.status === 'SCHEDULED'">{{ formatStartAt(item.startAt) }}</span>
                  <span v-else>시작가 ₩{{ item.startPrice.toLocaleString() }}</span>
                </div>
              </div>
              <button
                @click.stop="unwatchAuction(item.id)"
                class="flex-shrink-0 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-slate-100"
              >
                알림 취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
