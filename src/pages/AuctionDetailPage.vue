<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Gavel, Clock, Users, TrendingUp, Bell, Trophy, CalendarClock } from 'lucide-vue-next'
import { auctionApi, type AuctionDetail } from '@/api'

const router = useRouter()
const route = useRoute()
const auctionId = Number(route.params.auctionId)

const auction = ref<AuctionDetail | null>(null)
const isLoading = ref(true)
const now = ref(Date.now())

const activeTab = ref<'description' | 'rules'>('description')
const bidAmount = ref(0)
const showConfirm = ref(false)
const bidSubmitted = ref(false)
const notifyRequested = ref(false)
const quickAddOptions = [5000, 10000, 30000]

const minBid = computed(() => (auction.value?.currentBid ?? 0) + (auction.value?.minimumBidUnit ?? 1000))

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
  if (!auction.value) return false
  const s = getSecondsLeft(auction.value.endsAt)
  return s > 0 && s < 3600
})

let interval: ReturnType<typeof setInterval>
onMounted(async () => {
  try {
    auction.value = await auctionApi.getDetail(auctionId)
    bidAmount.value = minBid.value
  } catch (e) {
    console.error('Failed to load auction', e)
  } finally {
    isLoading.value = false
  }
  interval = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(interval))

const addQuickAmount = (amount: number) => {
  bidAmount.value += amount
}

const openConfirm = () => {
  if (bidAmount.value < minBid.value) return
  showConfirm.value = true
}

const cancelConfirm = () => {
  showConfirm.value = false
}

const isSubmittingBid = ref(false)
const submitBid = async () => {
  if (!auction.value || isSubmittingBid.value) return
  isSubmittingBid.value = true
  try {
    const newBid = await auctionApi.placeBid(auctionId, { amount: bidAmount.value })
    auction.value.bids.unshift(newBid)
    auction.value.currentBid = bidAmount.value
    auction.value.bidCount++
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
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <!-- Back Button -->
      <button
        @click="router.push('/auction')"
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-8 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        경매 목록으로
      </button>

      <!-- Loading / Not Found -->
      <div v-if="isLoading" class="text-center py-32 text-slate-400">로딩 중...</div>
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
            <div class="relative aspect-square rounded-2xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center mb-6 overflow-hidden">
              <span class="text-8xl">🐠</span>

              <!-- LIVE Badge -->
              <div
                v-if="auction.status === 'LIVE'"
                class="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full"
              >
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>

              <!-- UPCOMING Badge -->
              <div
                v-else-if="auction.status === 'UPCOMING'"
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
                <span class="text-slate-300 text-sm mt-1">₩{{ auction.currentBid.toLocaleString() }}</span>
              </div>

              <!-- LIVE Timer (large, center-bottom) -->
              <div
                v-if="auction.status === 'LIVE'"
                class="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full backdrop-blur-sm"
                :class="isEndingSoon ? 'bg-amber-500/90 text-white' : 'bg-black/40 text-white'"
              >
                <div class="flex items-center gap-2">
                  <Clock class="w-4 h-4" />
                  <span class="font-mono text-lg font-bold tracking-wider">{{ formatTime(auction.endsAt) }}</span>
                </div>
              </div>

              <!-- UPCOMING Countdown pill -->
              <div
                v-else-if="auction.status === 'UPCOMING'"
                class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-sky-500/90 text-white px-5 py-2 rounded-full backdrop-blur-sm"
              >
                <div class="flex items-center gap-2">
                  <CalendarClock class="w-4 h-4" />
                  <span class="font-mono text-lg font-bold tracking-wider">예정</span>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="mb-4">
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="tag in auction.tags"
                  :key="tag"
                  class="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
                >
                  #{{ tag }}
                </span>
              </div>
              <h1 class="text-2xl font-black text-slate-900 mb-3">{{ auction.name }}</h1>

              <!-- Seller -->
              <div
                class="flex items-center gap-3 cursor-pointer group w-fit"
                @click="router.push(`/store/${auction.sellerId}`)"
              >
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform">
                  {{ auction.sellerNickName.charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{{ auction.sellerNickName }}</p>
                  <span class="text-xs text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">스토어 보기 →</span>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-sky-100 mb-4">
              <div class="flex gap-0">
                <button
                  @click="activeTab = 'description'"
                  class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
                  :class="activeTab === 'description'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'"
                >
                  상품 설명
                </button>
                <button
                  @click="activeTab = 'rules'"
                  class="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
                  :class="activeTab === 'rules'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'"
                >
                  입찰 규정
                </button>
              </div>
            </div>

            <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              <template v-if="activeTab === 'description'">{{ auction.description ?? '상품 설명이 없습니다.' }}</template>
              <template v-else>입찰 규정은 판매자에게 문의해 주세요.</template>
            </div>
          </div>

          <!-- RIGHT: Bid Panel (sticky) -->
          <div class="lg:sticky lg:top-24 h-fit">
            <div class="bg-white rounded-2xl border border-sky-100 p-6 shadow-sm">

              <!-- Current Bid (LIVE) -->
              <div v-if="auction.status === 'LIVE'" class="mb-5">
                <p class="text-xs text-slate-400 mb-1">현재 입찰가</p>
                <p class="text-4xl font-black text-sky-600">₩{{ auction.currentBid.toLocaleString() }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <div class="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users class="w-3.5 h-3.5" />
                    {{ auction.bidCount }}명 입찰
                  </div>
                  <div class="text-xs text-slate-400">
                    시작가 ₩{{ auction.startBid.toLocaleString() }}
                  </div>
                </div>
              </div>

              <!-- Starting Info (UPCOMING) -->
              <div v-else-if="auction.status === 'UPCOMING'" class="mb-5">
                <p class="text-xs text-slate-400 mb-1">시작가</p>
                <p class="text-4xl font-black text-sky-600">₩{{ auction.startBid.toLocaleString() }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <CalendarClock class="w-3.5 h-3.5 text-sky-400" />
                  <p class="text-xs text-slate-400">곧 시작됩니다</p>
                </div>
              </div>

              <!-- Final Result (ENDED) -->
              <div v-else class="mb-5">
                <p class="text-xs text-slate-400 mb-1">최종 낙찰가</p>
                <p class="text-4xl font-black text-slate-700">₩{{ auction.currentBid.toLocaleString() }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <div class="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users class="w-3.5 h-3.5" />
                    {{ auction.bidCount }}명 참여
                  </div>
                  <div class="text-xs text-slate-400">
                    시작가 ₩{{ auction.startBid.toLocaleString() }}
                  </div>
                </div>
              </div>

              <div class="h-px bg-sky-50 mb-5" />

              <!-- Bid Input -->
              <div v-if="auction.status === 'LIVE'" class="space-y-4">
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

                <!-- Quick Add Buttons -->
                <div class="flex gap-2">
                  <button
                    v-for="amount in quickAddOptions"
                    :key="amount"
                    @click="addQuickAmount(amount)"
                    class="flex-1 py-2 text-xs font-semibold rounded-lg bg-sky-50 text-sky-600
                           hover:bg-sky-100 border border-sky-100 transition-colors"
                  >
                    +{{ (amount / 1000).toFixed(0) }}천원
                  </button>
                </div>

                <!-- Bid Success Banner -->
                <div
                  v-if="bidSubmitted"
                  class="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-600 text-sm font-medium"
                >
                  <span class="text-green-500">✓</span>
                  입찰이 완료되었습니다!
                </div>

                <!-- Confirm Step -->
                <template v-if="showConfirm">
                  <div class="bg-sky-50 border border-sky-100 rounded-xl p-4">
                    <p class="text-sm font-semibold text-slate-700 mb-1">입찰 금액 확인</p>
                    <p class="text-2xl font-black text-sky-600 mb-3">₩{{ bidAmount.toLocaleString() }}</p>
                    <p class="text-xs text-slate-400 mb-4">입찰 후 취소가 불가능합니다. 최종 확인해 주세요.</p>
                    <div class="flex gap-2">
                      <button
                        @click="cancelConfirm"
                        class="flex-1 py-2.5 rounded-full border border-sky-200 text-sky-500 text-sm font-semibold hover:bg-sky-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        @click="submitBid"
                        class="flex-1 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-colors"
                      >
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
              </div>

              <!-- ENDED state -->
              <div v-else-if="auction.status === 'ENDED'" class="space-y-3">
                <!-- Winner Banner -->
                <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Trophy class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-xs text-amber-600 font-medium mb-0.5">최종 낙찰자</p>
                    <p class="font-black text-slate-800">{{ auction.bids[0]?.bidderNickName ?? '익명' }}</p>
                  </div>
                </div>
                <!-- Stats -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-slate-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-slate-400 mb-1">총 입찰 수</p>
                    <p class="font-black text-slate-800">{{ auction.bidCount }}회</p>
                  </div>
                  <div class="bg-slate-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-slate-400 mb-1">상승률</p>
                    <p class="font-black text-slate-800">
                      +{{ Math.round((auction.currentBid - auction.startBid) / auction.startBid * 100) }}%
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

              <!-- UPCOMING state -->
              <div v-else class="space-y-3">
                <div class="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <CalendarClock class="w-4 h-4 text-sky-500" />
                    <span class="text-sm font-semibold text-sky-600">경매 시작까지</span>
                  </div>
                  <p class="font-mono text-3xl font-black text-sky-600 tracking-wider">예정</p>
                </div>
                <p class="text-xs text-slate-400 text-center">알림을 신청하면 경매 시작 10분 전에 알려드립니다.</p>
                <button
                  @click="notifyRequested = !notifyRequested"
                  class="w-full py-3 rounded-full font-semibold text-sm transition-all"
                  :class="notifyRequested
                    ? 'bg-sky-500 text-white'
                    : 'border border-sky-200 text-sky-500 hover:bg-sky-50'"
                >
                  <div class="flex items-center justify-center gap-2">
                    <Bell class="w-4 h-4" />
                    {{ notifyRequested ? '알림 신청됨' : '알림 신청' }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Recent Bids (top 5) — LIVE / ENDED only -->
            <div v-if="auction.bids.length > 0" class="mt-4 bg-white rounded-2xl border border-sky-100 p-5">
              <div class="flex items-center gap-2 mb-4">
                <TrendingUp class="w-4 h-4 text-sky-500" />
                <span class="text-sm font-semibold text-slate-700">최근 입찰 내역</span>
              </div>
              <div class="space-y-2.5">
                <div
                  v-for="(bid, i) in auction.bids.slice(0, 5)"
                  :key="bid.id"
                  class="flex items-center justify-between text-xs py-2 px-3 rounded-lg"
                  :class="bid.isMine ? 'bg-sky-50 border border-sky-100' : ''"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px]"
                      :class="i === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'"
                    >{{ i + 1 }}</span>
                    <span :class="bid.isMine ? 'text-sky-600 font-semibold' : 'text-slate-500'">
                      {{ bid.bidderNickName }}{{ bid.isMine ? ' (나)' : '' }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div :class="bid.isMine ? 'text-sky-600 font-bold' : 'text-slate-700 font-semibold'">
                      ₩{{ bid.amount.toLocaleString() }}
                    </div>
                    <div class="text-slate-300 font-mono">{{ bid.createdAt.slice(11, 16) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- UPCOMING: no bids yet -->
            <div v-else class="mt-4 bg-sky-50 rounded-2xl border border-sky-100 p-5 text-center">
              <CalendarClock class="w-8 h-8 text-sky-300 mx-auto mb-2" />
              <p class="text-sm text-slate-400">아직 입찰 내역이 없습니다</p>
              <p class="text-xs text-slate-300 mt-1">경매 시작 후 업데이트됩니다</p>
            </div>
          </div>
        </div>

        <!-- Full-Width Bid History Table — only when there are bids -->
        <div v-if="auction.bids.length > 0" class="mt-12">
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
                  v-for="(bid, i) in auction.bids"
                  :key="bid.id"
                  class="border-t border-sky-50 transition-colors"
                  :class="bid.isMine ? 'bg-sky-50' : 'hover:bg-slate-50'"
                >
                  <td class="px-5 py-3">
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs inline-flex"
                      :class="i === 0 ? 'bg-amber-400 text-white' : i < 3 ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'"
                    >{{ i + 1 }}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span :class="bid.isMine ? 'text-sky-600 font-semibold' : 'text-slate-700'">
                      {{ bid.bidderNickName }}{{ bid.isMine ? ' (나)' : '' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span :class="bid.isMine ? 'text-sky-600 font-bold' : 'text-slate-800 font-semibold'">
                      ₩{{ bid.amount.toLocaleString() }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right font-mono text-slate-400 text-xs">{{ bid.createdAt.slice(11, 16) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>
