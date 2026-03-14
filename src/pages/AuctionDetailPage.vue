<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Gavel, Clock, Users, TrendingUp, Bell, Trophy, CalendarClock, Loader2 } from 'lucide-vue-next'
import { auctionApi, type AuctionResponse, type BidResponse } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const auctionId = Number(route.params.auctionId)

const { user, isLoggedIn } = storeToRefs(useAuthStore())

const auction = ref<AuctionResponse | null>(null)
const bids = ref<BidResponse[]>([])
const isLoading = ref(true)
const now = ref(Date.now())

const activeTab = ref<'description' | 'rules'>('description')
const bidAmount = ref(0)
const showConfirm = ref(false)
const bidSubmitted = ref(false)
const notifyRequested = ref(false)
const isTogglingWatch = ref(false)
const isSubmittingBid = ref(false)
const isBuyingNow = ref(false)
const quickAddOptions = [5000, 10000, 30000]

// 최소 입찰가: 현재가 + 1000원
const minBid = computed(() => (auction.value?.currentPrice ?? 0) + 1000)

const getSecondsLeft = (isoDate: string) =>
  Math.max(0, Math.floor((new Date(isoDate).getTime() - now.value) / 1000))

const formatTime = (isoDate: string) => {
  const seconds = getSecondsLeft(isoDate)
  if (seconds <= 0) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const isEndingSoon = computed(() => {
  if (!auction.value || auction.value.status !== 'ACTIVE') return false
  return getSecondsLeft(auction.value.endAt) < 3600
})

const isMine = (bid: BidResponse) =>
  !!user.value && bid.bidderNickName === user.value.nickName

const isOwner = computed(() =>
  !!user.value && auction.value?.sellerNickName === user.value.nickName
)

let interval: ReturnType<typeof setInterval>
onMounted(async () => {
  try {
    const [detail, bidList] = await Promise.all([
      auctionApi.getDetail(auctionId),
      auctionApi.getBids(auctionId),
    ])
    auction.value = detail
    bids.value = bidList
    bidAmount.value = minBid.value
    if (isLoggedIn.value) {
      notifyRequested.value = await auctionApi.isWatching(auctionId).catch(() => false)
    }
  } catch (e) {
    console.error('Failed to load auction', e)
  } finally {
    isLoading.value = false
  }
  interval = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(interval))

const openConfirm = () => {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (bidAmount.value < minBid.value) return
  showConfirm.value = true
}

const submitBid = async () => {
  if (!auction.value || isSubmittingBid.value) return
  isSubmittingBid.value = true
  try {
    const newBid = await auctionApi.placeBid(auctionId, { amount: bidAmount.value })
    bids.value.unshift(newBid)
    auction.value.currentPrice = bidAmount.value
    auction.value.bidCount++
    auction.value.currentWinnerNickName = user.value?.nickName ?? null
    showConfirm.value = false
    bidSubmitted.value = true
    setTimeout(() => { bidSubmitted.value = false }, 3000)
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '입찰에 실패했습니다.')
    showConfirm.value = false
  } finally {
    isSubmittingBid.value = false
  }
}

const handleBuyNow = async () => {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (!confirm(`₩${auction.value?.buyNowPrice?.toLocaleString()}에 즉시 구매하시겠습니까?`)) return
  isBuyingNow.value = true
  try {
    auction.value = await auctionApi.buyNow(auctionId)
    bids.value = await auctionApi.getBids(auctionId)
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '즉시 구매에 실패했습니다.')
  } finally {
    isBuyingNow.value = false
  }
}

const toggleWatch = async () => {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (isTogglingWatch.value) return
  isTogglingWatch.value = true
  try {
    if (notifyRequested.value) {
      await auctionApi.unwatchAuction(auctionId)
      notifyRequested.value = false
    } else {
      await auctionApi.watchAuction(auctionId)
      notifyRequested.value = true
    }
  } catch (e) {
    // 이미 신청/취소 상태면 반영
  } finally {
    isTogglingWatch.value = false
  }
}

const formatBidTime = (bidAt: string) => {
  try {
    const d = new Date(bidAt)
    const m = d.getMonth() + 1
    const day = d.getDate()
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')
    return `${m}.${day} ${hh}:${mm}`
  } catch { return bidAt.slice(0, 16) }
}
</script>

<template>
  <div class="bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-8 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        돌아가기
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-32">
        <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
      </div>

      <!-- Not Found -->
      <div v-else-if="!auction" class="text-center py-32">
        <Gavel class="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-400">경매를 찾을 수 없습니다</p>
        <button @click="router.push('/auction')" class="mt-4 text-sky-500 text-sm hover:underline">
          전체 경매 보기
        </button>
      </div>

      <template v-else>
        <!-- 2-Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">

          <!-- LEFT: Image & Info -->
          <div>
            <!-- Image -->
            <div class="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-sky-100 to-teal-200">
              <img
                v-if="auction.imageUrls.length > 0"
                :src="auction.imageUrls[0]"
                :alt="auction.productName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-8xl">🐠</span>
              </div>

              <!-- Status Badge -->
              <div
                v-if="auction.status === 'ACTIVE'"
                class="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full"
              >
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
              <div
                v-else-if="auction.status === 'SCHEDULED'"
                class="absolute top-4 left-4 bg-sky-500 text-white text-sm font-bold px-3 py-1.5 rounded-full"
              >
                예정
              </div>

              <!-- ENDED Overlay -->
              <div
                v-else-if="auction.status === 'ENDED'"
                class="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center"
              >
                <Trophy class="w-10 h-10 text-amber-400 mb-2" />
                <span class="text-white font-black text-lg">낙찰 완료</span>
                <span class="text-slate-300 text-sm mt-1">₩{{ auction.currentPrice.toLocaleString() }}</span>
              </div>

              <!-- Timer -->
              <div
                v-if="auction.status === 'ACTIVE'"
                class="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full backdrop-blur-sm"
                :class="isEndingSoon ? 'bg-amber-500/90 text-white' : 'bg-black/40 text-white'"
              >
                <div class="flex items-center gap-2">
                  <Clock class="w-4 h-4" />
                  <span class="font-mono text-lg font-bold tracking-wider">{{ formatTime(auction.endAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="mb-4">
              <div v-if="auction.species" class="mb-3">
                <span class="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                  {{ auction.species }}
                </span>
              </div>
              <h1 class="text-2xl font-black text-slate-900 mb-3">{{ auction.productName }}</h1>

              <!-- Seller -->
              <div class="flex items-center gap-3 w-fit">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white font-black text-sm">
                  {{ auction.sellerNickName.charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold text-slate-800 text-sm">{{ auction.sellerNickName }}</p>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-sky-100 mb-4">
              <div class="flex gap-0">
                <button
                  @click="activeTab = 'description'"
                  class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
                  :class="activeTab === 'description' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
                >
                  상품 설명
                </button>
                <button
                  @click="activeTab = 'rules'"
                  class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
                  :class="activeTab === 'rules' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
                >
                  입찰 규정
                </button>
              </div>
            </div>

            <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              <template v-if="activeTab === 'description'">{{ auction.productDescription ?? '상품 설명이 없습니다.' }}</template>
              <template v-else>
                <ul class="space-y-1.5">
                  <li>· 입찰 후 취소는 불가능합니다.</li>
                  <li>· 낙찰 후 3일 이내 결제하지 않으면 자동 취소됩니다.</li>
                  <li>· 자세한 사항은 판매자에게 문의해 주세요.</li>
                </ul>
              </template>
            </div>
          </div>

          <!-- RIGHT: Bid Panel (sticky) -->
          <div class="lg:sticky lg:top-24 h-fit">
            <div class="bg-white rounded-2xl border border-sky-100 p-6 shadow-sm">

              <!-- ACTIVE: Current Bid -->
              <div v-if="auction.status === 'ACTIVE'" class="mb-5">
                <p class="text-xs text-slate-400 mb-1">현재 입찰가</p>
                <p class="text-4xl font-black text-sky-600">₩{{ auction.currentPrice.toLocaleString() }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <div class="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users class="w-3.5 h-3.5" />
                    {{ auction.bidCount }}명 입찰
                  </div>
                  <div class="text-xs text-slate-400">시작가 ₩{{ auction.startPrice.toLocaleString() }}</div>
                </div>
              </div>

              <!-- SCHEDULED: Starting Price -->
              <div v-else-if="auction.status === 'SCHEDULED'" class="mb-5">
                <p class="text-xs text-slate-400 mb-1">시작가</p>
                <p class="text-4xl font-black text-sky-600">₩{{ auction.startPrice.toLocaleString() }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <CalendarClock class="w-3.5 h-3.5 text-sky-400" />
                  <p class="text-xs text-slate-400">곧 시작됩니다</p>
                </div>
              </div>

              <!-- ENDED: Final Result -->
              <div v-else class="mb-5">
                <p class="text-xs text-slate-400 mb-1">최종 낙찰가</p>
                <p class="text-4xl font-black text-slate-700">₩{{ auction.currentPrice.toLocaleString() }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <div class="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users class="w-3.5 h-3.5" />
                    {{ auction.bidCount }}명 참여
                  </div>
                  <div class="text-xs text-slate-400">시작가 ₩{{ auction.startPrice.toLocaleString() }}</div>
                </div>
              </div>

              <div class="h-px bg-sky-50 mb-5" />

              <!-- Owner Notice (ACTIVE) -->
              <div v-if="auction.status === 'ACTIVE' && isOwner" class="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-center">
                <Gavel class="w-8 h-8 text-sky-300 mx-auto mb-2" />
                <p class="text-sm font-semibold text-slate-700">내가 등록한 경매입니다</p>
                <p class="text-xs text-slate-400 mt-1">판매자는 자신의 경매에 입찰할 수 없습니다</p>
              </div>

              <!-- ACTIVE: Bid Input -->
              <div v-else-if="auction.status === 'ACTIVE'" class="space-y-4">
                <div>
                  <label class="text-xs font-medium text-slate-500 mb-2 block">입찰 금액</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₩</span>
                    <input
                      v-model.number="bidAmount"
                      type="number"
                      :min="minBid"
                      step="1000"
                      class="w-full pl-8 pr-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                             font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-400
                             focus:border-transparent transition-all"
                    />
                  </div>
                  <p class="text-xs text-slate-400 mt-1">최소 입찰가: ₩{{ minBid.toLocaleString() }}</p>
                </div>

                <!-- Quick Add -->
                <div class="flex gap-2">
                  <button
                    v-for="amount in quickAddOptions"
                    :key="amount"
                    @click="bidAmount += amount"
                    class="flex-1 py-2 text-xs font-semibold rounded-lg bg-sky-50 text-sky-600
                           hover:bg-sky-100 border border-sky-100 transition-colors"
                  >
                    +{{ (amount / 1000).toFixed(0) }}천원
                  </button>
                </div>

                <!-- Bid Success -->
                <div
                  v-if="bidSubmitted"
                  class="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-600 text-sm font-medium"
                >
                  <span>✓</span> 입찰이 완료되었습니다!
                </div>

                <!-- Confirm Step -->
                <template v-if="showConfirm">
                  <div class="bg-sky-50 border border-sky-100 rounded-xl p-4">
                    <p class="text-sm font-semibold text-slate-700 mb-1">입찰 금액 확인</p>
                    <p class="text-2xl font-black text-sky-600 mb-3">₩{{ bidAmount.toLocaleString() }}</p>
                    <p class="text-xs text-slate-400 mb-4">입찰 후 취소가 불가능합니다. 최종 확인해 주세요.</p>
                    <div class="flex gap-2">
                      <button
                        @click="showConfirm = false"
                        class="flex-1 py-2.5 rounded-full border border-sky-200 text-sky-500 text-sm font-semibold hover:bg-sky-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        @click="submitBid"
                        :disabled="isSubmittingBid"
                        class="flex-1 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Loader2 v-if="isSubmittingBid" class="w-4 h-4 animate-spin" />
                        최종 입찰
                      </button>
                    </div>
                  </div>
                </template>

                <!-- Bid CTA -->
                <button
                  v-else
                  @click="openConfirm"
                  :disabled="bidAmount < minBid"
                  class="w-full py-4 rounded-full font-bold text-base transition-all"
                  :class="bidAmount >= minBid
                    ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
                >
                  <div class="flex items-center justify-center gap-2">
                    <Gavel class="w-5 h-5" />
                    입찰하기
                  </div>
                </button>

                <!-- Buy Now -->
                <button
                  v-if="auction.buyNowPrice"
                  @click="handleBuyNow"
                  :disabled="isBuyingNow"
                  class="w-full py-3 rounded-full border border-amber-300 text-amber-600 hover:bg-amber-50 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  즉시 구매 ₩{{ auction.buyNowPrice.toLocaleString() }}
                </button>
              </div>

              <!-- ENDED state -->
              <div v-else-if="auction.status === 'ENDED'" class="space-y-3">
                <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Trophy class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-xs text-amber-600 font-medium mb-0.5">최종 낙찰자</p>
                    <p class="font-black text-slate-800">{{ auction.currentWinnerNickName ?? bids[0]?.bidderNickName ?? '없음' }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-slate-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-slate-400 mb-1">총 입찰 수</p>
                    <p class="font-black text-slate-800">{{ auction.bidCount }}회</p>
                  </div>
                  <div class="bg-slate-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-slate-400 mb-1">상승률</p>
                    <p class="font-black text-slate-800">
                      +{{ auction.startPrice > 0 ? Math.round((auction.currentPrice - auction.startPrice) / auction.startPrice * 100) : 0 }}%
                    </p>
                  </div>
                </div>
                <button
                  @click="router.push('/auction')"
                  class="w-full py-3 rounded-full border border-sky-200 text-sky-500 text-sm font-semibold hover:bg-sky-50 transition-colors"
                >
                  다른 경매 보러가기
                </button>
              </div>

              <!-- SCHEDULED state -->
              <div v-else class="space-y-3">
                <div class="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <CalendarClock class="w-4 h-4 text-sky-500" />
                    <span class="text-sm font-semibold text-sky-600">경매 예정</span>
                  </div>
                  <p class="text-xs text-slate-500">
                    시작: {{ new Date(auction.startAt).toLocaleString('ko-KR') }}
                  </p>
                </div>
                <button
                  @click="toggleWatch"
                  :disabled="isTogglingWatch"
                  class="w-full py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-60"
                  :class="notifyRequested ? 'bg-sky-500 text-white' : 'border border-sky-200 text-sky-500 hover:bg-sky-50'"
                >
                  <div class="flex items-center justify-center gap-2">
                    <Bell class="w-4 h-4" />
                    {{ notifyRequested ? '알림 신청됨' : '알림 신청' }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Recent Bids -->
            <div v-if="bids.length > 0" class="mt-4 bg-white rounded-2xl border border-sky-100 p-5">
              <div class="flex items-center gap-2 mb-4">
                <TrendingUp class="w-4 h-4 text-sky-500" />
                <span class="text-sm font-semibold text-slate-700">최근 입찰 내역</span>
              </div>
              <div class="space-y-2.5">
                <div
                  v-for="(bid, i) in bids.slice(0, 5)"
                  :key="bid.id"
                  class="flex items-center justify-between text-xs py-2 px-3 rounded-lg"
                  :class="isMine(bid) ? 'bg-sky-50 border border-sky-100' : ''"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px]"
                      :class="i === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'"
                    >{{ i + 1 }}</span>
                    <span :class="isMine(bid) ? 'text-sky-600 font-semibold' : 'text-slate-500'">
                      {{ bid.bidderNickName }}{{ isMine(bid) ? ' (나)' : '' }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div :class="isMine(bid) ? 'text-sky-600 font-bold' : 'text-slate-700 font-semibold'">
                      ₩{{ bid.amount.toLocaleString() }}
                    </div>
                    <div class="text-slate-300 font-mono">{{ formatBidTime(bid.bidAt) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="mt-4 bg-sky-50 rounded-2xl border border-sky-100 p-5 text-center">
              <CalendarClock class="w-8 h-8 text-sky-300 mx-auto mb-2" />
              <p class="text-sm text-slate-400">아직 입찰 내역이 없습니다</p>
            </div>
          </div>
        </div>

        <!-- Full-Width Bid History Table -->
        <div v-if="bids.length > 0" class="mt-12">
          <h2 class="text-lg font-black text-slate-900 mb-4">전체 입찰 내역</h2>
          <div class="rounded-2xl border border-sky-100 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-sky-50">
                <tr>
                  <th class="px-5 py-3 text-left font-semibold text-slate-500 text-xs">순위</th>
                  <th class="px-5 py-3 text-left font-semibold text-slate-500 text-xs">입찰자</th>
                  <th class="px-5 py-3 text-right font-semibold text-slate-500 text-xs">금액</th>
                  <th class="px-5 py-3 text-right font-semibold text-slate-500 text-xs">시간</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(bid, i) in bids"
                  :key="bid.id"
                  class="border-t border-sky-50 transition-colors"
                  :class="isMine(bid) ? 'bg-sky-50' : 'hover:bg-slate-50'"
                >
                  <td class="px-5 py-3">
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs inline-flex"
                      :class="i === 0 ? 'bg-amber-400 text-white' : i < 3 ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'"
                    >{{ i + 1 }}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span :class="isMine(bid) ? 'text-sky-600 font-semibold' : 'text-slate-700'">
                      {{ bid.bidderNickName }}{{ isMine(bid) ? ' (나)' : '' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span :class="isMine(bid) ? 'text-sky-600 font-bold' : 'text-slate-800 font-semibold'">
                      ₩{{ bid.amount.toLocaleString() }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right font-mono text-slate-400 text-xs">
                    {{ formatBidTime(bid.bidAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>
