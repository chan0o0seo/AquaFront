<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Gavel, Clock, Users, TrendingUp, Bell, Trophy, CalendarClock } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auctionId = Number(route.params.auctionId)

interface BidRecord {
  rank: number
  bidder: string
  amount: number
  time: string
  isMine: boolean
}

interface AuctionDetail {
  id: number
  sellerId: number
  name: string
  breeder: string
  breederInitial: string
  breederRating: number
  currentBid: number
  startBid: number
  bidCount: number
  timeLeft: number
  startIn?: number   // seconds until start (UPCOMING)
  winner?: string    // masked winner name (ENDED)
  status: 'LIVE' | 'UPCOMING' | 'ENDED'
  category: string
  tags: string[]
  description: string
  bidRules: string
  bidHistory: BidRecord[]
}

const auctions: AuctionDetail[] = [
  {
    id: 1,
    sellerId: 1,
    name: 'L-333 킹로얄 플레코 (성어 1마리)',
    breeder: '플레코마스터',
    breederInitial: '플',
    breederRating: 4.9,
    currentBid: 85000,
    startBid: 30000,
    bidCount: 12,
    timeLeft: 8073,
    status: 'LIVE',
    category: '어류',
    tags: ['플레코', 'L번호', '희귀종'],
    description: 'L-333 킹로얄 플레코 성어 1마리입니다. 약 15cm 크기의 건강한 개체로, 먹이 반응 좋고 컨디션 최상입니다. 직접 브리딩한 F1 개체로 혈통이 확실합니다.\n\n• 크기: 약 15cm\n• 나이: 약 2년\n• 사육 기간: 6개월 이상\n• 먹이: 히카리 플레코 펠렛, 오이, 주키니',
    bidRules: '• 최소 입찰 단위: 1,000원\n• 입찰 후 취소 불가\n• 낙찰 후 3일 이내 결제\n• 미결제 시 차순위 낙찰\n• 배송: 안전박스 포장, 에어포장 택배\n• 배송비 낙찰자 부담 (기본 5,000원)\n• 생착 보증: 수령 후 24시간 이내 폐사 시 재발송 또는 환불',
    bidHistory: [
      { rank: 1, bidder: '사용자***', amount: 85000, time: '14:23:01', isMine: false },
      { rank: 2, bidder: '나***', amount: 80000, time: '14:22:45', isMine: true },
      { rank: 3, bidder: '어***', amount: 75000, time: '14:20:12', isMine: false },
      { rank: 4, bidder: '플***', amount: 70000, time: '14:18:30', isMine: false },
      { rank: 5, bidder: '수***', amount: 65000, time: '14:15:07', isMine: false },
      { rank: 6, bidder: '열***', amount: 60000, time: '14:12:22', isMine: false },
      { rank: 7, bidder: '물***', amount: 55000, time: '14:10:45', isMine: false },
      { rank: 8, bidder: '청***', amount: 50000, time: '14:08:11', isMine: false },
    ]
  },
  {
    id: 2,
    sellerId: 5,
    name: '슈퍼레드 아로와나 (25cm)',
    breeder: '아로와나팜',
    breederInitial: '아',
    breederRating: 4.8,
    currentBid: 2500000,
    startBid: 1000000,
    bidCount: 7,
    timeLeft: 12453,
    status: 'LIVE',
    category: '어류',
    tags: ['아로와나', '고급어종'],
    description: '슈퍼레드 아로와나 25cm 크기의 프리미엄 개체입니다. 선명한 붉은색 발색이 뛰어나며, 건강 상태 최상입니다.\n\n• 크기: 약 25cm\n• 등급: 슈퍼레드 A급\n• 검역증 포함\n• CITES 서류 제공',
    bidRules: '• 최소 입찰 단위: 10,000원\n• 입찰 후 취소 불가\n• 낙찰 후 3일 이내 결제\n• 직거래 우선 (서울/경기)\n• 택배 배송 시 별도 협의\n• 생착 보증: 수령 후 24시간',
    bidHistory: [
      { rank: 1, bidder: '아***', amount: 2500000, time: '13:45:22', isMine: false },
      { rank: 2, bidder: '나***', amount: 2300000, time: '13:40:11', isMine: true },
      { rank: 3, bidder: '고***', amount: 2100000, time: '13:35:05', isMine: false },
      { rank: 4, bidder: '프***', amount: 1900000, time: '13:30:44', isMine: false },
      { rank: 5, bidder: '럭***', amount: 1700000, time: '13:25:18', isMine: false },
    ]
  },
  {
    id: 3,
    sellerId: 3,
    name: '블루다이아몬드 디스커스 (3마리 세트)',
    breeder: '디스커스월드',
    breederInitial: '디',
    breederRating: 4.7,
    currentBid: 180000,
    startBid: 80000,
    bidCount: 24,
    timeLeft: 1820,
    status: 'LIVE',
    category: '어류',
    tags: ['디스커스', '열대어'],
    description: '블루다이아몬드 디스커스 3마리 세트입니다. 수컷 2마리 + 암컷 1마리 구성으로 번식에 유리합니다.\n\n• 크기: 약 10-12cm\n• 구성: 수컷 2 + 암컷 1\n• 사육 수온: 28-30°C\n• 먹이: 냉동 붉은 장구벌레, 전용 사료',
    bidRules: '• 최소 입찰 단위: 1,000원\n• 세트 상품으로 분리 판매 불가\n• 낙찰 후 48시간 이내 결제\n• 배송비 별도 (에어포장 포함 8,000원)\n• 생착 보증 48시간',
    bidHistory: [
      { rank: 1, bidder: '디***', amount: 180000, time: '15:01:33', isMine: false },
      { rank: 2, bidder: '블***', amount: 175000, time: '15:00:55', isMine: false },
      { rank: 3, bidder: '나***', amount: 170000, time: '14:59:22', isMine: true },
      { rank: 4, bidder: '수***', amount: 165000, time: '14:58:11', isMine: false },
      { rank: 5, bidder: '열***', amount: 160000, time: '14:55:44', isMine: false },
    ]
  },
  {
    id: 4,
    sellerId: 2,
    name: '크리스탈 레드 쉬림프 S급 (10마리)',
    breeder: '새우천국',
    breederInitial: '새',
    breederRating: 4.9,
    currentBid: 65000,
    startBid: 20000,
    bidCount: 18,
    timeLeft: 3412,
    status: 'LIVE',
    category: '새우/갑각류',
    tags: ['CRS', 'S급', '크리스탈'],
    description: 'CRS(크리스탈 레드 쉬림프) S급 10마리 세트입니다. 선명한 흰색과 붉은색 패턴이 아름다운 개체들입니다.\n\n• 등급: S급 (고밴딩)\n• 수량: 10마리 (암수 혼합)\n• 사육 수온: 20-24°C\n• 사육 pH: 6.0-6.5',
    bidRules: '• 최소 입찰 단위: 500원\n• 낙찰 후 24시간 이내 결제\n• 배송: 에어포장 필수 (배송비 5,000원)\n• DOA 보증: 수령 후 2시간 이내 사진 전송 시 보상',
    bidHistory: [
      { rank: 1, bidder: '새***', amount: 65000, time: '14:30:12', isMine: false },
      { rank: 2, bidder: '크***', amount: 62000, time: '14:28:45', isMine: false },
      { rank: 3, bidder: '나***', amount: 58000, time: '14:25:11', isMine: true },
      { rank: 4, bidder: '쉬***', amount: 55000, time: '14:22:33', isMine: false },
      { rank: 5, bidder: '수***', amount: 50000, time: '14:18:07', isMine: false },
    ]
  },
  {
    id: 5,
    sellerId: 5,
    name: '풀레드 구피 트리오 (1쌍+수컷)',
    breeder: '구피팜',
    breederInitial: '구',
    breederRating: 4.6,
    currentBid: 45000,
    startBid: 15000,
    bidCount: 9,
    timeLeft: 21600,
    status: 'LIVE',
    category: '어류',
    tags: ['구피', '풀레드', '초보추천'],
    description: '풀레드 구피 트리오(수컷 2 + 암컷 1) 세트입니다. 초보자도 키우기 쉬운 구피로, 번식력이 강합니다.\n\n• 구성: 수컷 2 + 암컷 1\n• 사육 수온: 24-28°C\n• 먹이: 구피 전용 사료, 냉동 장구벌레\n• 초보자 추천 어종',
    bidRules: '• 최소 입찰 단위: 500원\n• 낙찰 후 48시간 이내 결제\n• 배송비 4,000원 (에어포장 포함)\n• DOA 보증: 수령 후 2시간 이내',
    bidHistory: [
      { rank: 1, bidder: '구***', amount: 45000, time: '12:15:33', isMine: false },
      { rank: 2, bidder: '풀***', amount: 42000, time: '12:10:22', isMine: false },
      { rank: 3, bidder: '레***', amount: 38000, time: '12:05:11', isMine: false },
      { rank: 4, bidder: '나***', amount: 35000, time: '12:00:44', isMine: true },
      { rank: 5, bidder: '초***', amount: 30000, time: '11:55:07', isMine: false },
    ]
  },
  {
    id: 6,
    sellerId: 4,
    name: '대형 부세파란드라 (희귀 변종)',
    breeder: '수초팜',
    breederInitial: '수',
    breederRating: 4.8,
    currentBid: 0,
    startBid: 50000,
    bidCount: 0,
    timeLeft: 0,
    startIn: 43200, // 12시간 후 시작
    status: 'UPCOMING',
    category: '수초',
    tags: ['부세파란드라', '희귀수초'],
    description: '인도네시아산 희귀 변종 부세파란드라입니다. 잎 표면의 독특한 패턴과 메탈릭한 광택이 특징입니다.\n\n• 크기: 약 20cm (잎 길이)\n• 종류: 희귀 변종 (미분류)\n• 수온: 22-28°C\n• 조명: 중~고광량 권장\n• CO2: 필수',
    bidRules: '• 최소 입찰 단위: 1,000원\n• 낙찰 후 48시간 이내 결제\n• 배송: 전용 포장, 보냉 처리\n• 배송비 5,000원 (착불)\n• 식물 특성상 생착 보증 불가',
    bidHistory: []
  },
  {
    id: 7,
    sellerId: 5,
    name: 'ADA 뉴 아마조니아 소일 9L (미개봉)',
    breeder: '용품마켓',
    breederInitial: '용',
    breederRating: 4.5,
    currentBid: 28000,
    startBid: 20000,
    bidCount: 4,
    timeLeft: 0,
    winner: '수***',
    status: 'ENDED',
    category: '용품',
    tags: ['ADA', '소일', '수초용'],
    description: 'ADA 뉴 아마조니아 소일 9L 미개봉 제품입니다. 수초 재배에 최적화된 영양 소일로, 구매 후 미사용 상태입니다.\n\n• 용량: 9L\n• 상태: 미개봉 새상품\n• 유통기한: 2026년 6월\n• ADA 정품 인증',
    bidRules: '• 최소 입찰 단위: 500원\n• 낙찰 후 24시간 이내 결제\n• 배송비 3,000원 (일반 택배)\n• 반품 불가 (중고 특성)',
    bidHistory: [
      { rank: 1, bidder: '수***', amount: 28000, time: '09:45:12', isMine: false },
      { rank: 2, bidder: '아***', amount: 26000, time: '09:40:05', isMine: false },
      { rank: 3, bidder: '나***', amount: 24000, time: '09:35:22', isMine: true },
      { rank: 4, bidder: '소***', amount: 22000, time: '09:30:11', isMine: false },
    ]
  },
  {
    id: 8,
    sellerId: 5,
    name: '골든 아이 코리도라스 (5마리)',
    breeder: '코리팜',
    breederInitial: '코',
    breederRating: 4.7,
    currentBid: 38000,
    startBid: 15000,
    bidCount: 11,
    timeLeft: 0,
    winner: '열***',
    status: 'ENDED',
    category: '어류',
    tags: ['코리도라스', '청소부'],
    description: '골든 아이 코리도라스 5마리 세트입니다. 바닥 청소부로 유명하며 혼영어와의 호환성이 뛰어납니다.\n\n• 수량: 5마리 (암수 혼합)\n• 크기: 약 4-5cm\n• 사육 수온: 22-26°C\n• 초보자도 키우기 쉬운 어종',
    bidRules: '• 최소 입찰 단위: 500원\n• 낙찰 후 48시간 이내 결제\n• 배송비 4,000원 (에어포장)\n• DOA 보증: 수령 후 2시간',
    bidHistory: [
      { rank: 1, bidder: '열***', amount: 38000, time: '11:22:44', isMine: false },
      { rank: 2, bidder: '코***', amount: 35000, time: '11:18:33', isMine: false },
      { rank: 3, bidder: '나***', amount: 32000, time: '11:15:07', isMine: true },
      { rank: 4, bidder: '청***', amount: 28000, time: '11:10:22', isMine: false },
      { rank: 5, bidder: '바***', amount: 25000, time: '11:05:11', isMine: false },
      { rank: 6, bidder: '골***', amount: 22000, time: '11:00:44', isMine: false },
    ]
  },
]

const auction = computed(() => auctions.find(a => a.id === auctionId))

const timeLeft = ref(auction.value?.timeLeft ?? 0)
const startIn = ref(auction.value?.startIn ?? 0)
const activeTab = ref<'description' | 'rules'>('description')

const bidAmount = ref(0)
const showConfirm = ref(false)
const bidSubmitted = ref(false)
const notifyRequested = ref(false)

const quickAddOptions = [5000, 10000, 30000]

const minBid = computed(() => (auction.value?.currentBid ?? 0) + 1000)

const formatTime = (seconds: number) => {
  if (seconds <= 0) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatStartIn = (seconds: number) => {
  if (seconds <= 0) return '곧 시작'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}일 ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const isEndingSoon = computed(() => timeLeft.value > 0 && timeLeft.value < 3600)

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  if (auction.value?.status === 'LIVE') {
    interval = setInterval(() => {
      timeLeft.value = Math.max(0, timeLeft.value - 1)
    }, 1000)
  } else if (auction.value?.status === 'UPCOMING') {
    interval = setInterval(() => {
      startIn.value = Math.max(0, startIn.value - 1)
    }, 1000)
  }
  bidAmount.value = minBid.value
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

const submitBid = () => {
  showConfirm.value = false
  bidSubmitted.value = true
  setTimeout(() => { bidSubmitted.value = false }, 3000)
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

      <!-- Not Found -->
      <div v-if="!auction" class="text-center py-32">
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
                  <span class="font-mono text-lg font-bold tracking-wider">{{ formatTime(timeLeft) }}</span>
                </div>
              </div>

              <!-- UPCOMING Countdown pill -->
              <div
                v-else-if="auction.status === 'UPCOMING'"
                class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-sky-500/90 text-white px-5 py-2 rounded-full backdrop-blur-sm"
              >
                <div class="flex items-center gap-2">
                  <CalendarClock class="w-4 h-4" />
                  <span class="font-mono text-lg font-bold tracking-wider">{{ formatStartIn(startIn) }}</span>
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

              <!-- Breeder -->
              <div
                class="flex items-center gap-3 cursor-pointer group w-fit"
                @click="router.push(`/store/${auction.sellerId}`)"
              >
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform">
                  {{ auction.breederInitial }}
                </div>
                <div>
                  <p class="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{{ auction.breeder }}</p>
                  <div class="flex items-center gap-1">
                    <span class="text-amber-400 text-xs">★</span>
                    <span class="text-xs text-slate-400">{{ auction.breederRating }}</span>
                    <span class="text-xs text-sky-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">스토어 보기 →</span>
                  </div>
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
              <template v-if="activeTab === 'description'">{{ auction.description }}</template>
              <template v-else>{{ auction.bidRules }}</template>
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
                  <p class="text-xs text-slate-400">시작까지 <span class="font-mono font-semibold text-sky-500">{{ formatStartIn(startIn) }}</span></p>
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
                    <p class="font-black text-slate-800">{{ auction.winner ?? '익명' }}</p>
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
                  <p class="font-mono text-3xl font-black text-sky-600 tracking-wider">{{ formatStartIn(startIn) }}</p>
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
            <div v-if="auction.bidHistory.length > 0" class="mt-4 bg-white rounded-2xl border border-sky-100 p-5">
              <div class="flex items-center gap-2 mb-4">
                <TrendingUp class="w-4 h-4 text-sky-500" />
                <span class="text-sm font-semibold text-slate-700">최근 입찰 내역</span>
              </div>
              <div class="space-y-2.5">
                <div
                  v-for="bid in auction.bidHistory.slice(0, 5)"
                  :key="bid.rank"
                  class="flex items-center justify-between text-xs py-2 px-3 rounded-lg"
                  :class="bid.isMine ? 'bg-sky-50 border border-sky-100' : ''"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px]"
                      :class="bid.rank === 1 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'"
                    >{{ bid.rank }}</span>
                    <span :class="bid.isMine ? 'text-sky-600 font-semibold' : 'text-slate-500'">
                      {{ bid.bidder }}{{ bid.isMine ? ' (나)' : '' }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div :class="bid.isMine ? 'text-sky-600 font-bold' : 'text-slate-700 font-semibold'">
                      ₩{{ bid.amount.toLocaleString() }}
                    </div>
                    <div class="text-slate-300 font-mono">{{ bid.time }}</div>
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
        <div v-if="auction.bidHistory.length > 0" class="mt-12">
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
                  v-for="bid in auction.bidHistory"
                  :key="bid.rank"
                  class="border-t border-sky-50 transition-colors"
                  :class="bid.isMine ? 'bg-sky-50' : 'hover:bg-slate-50'"
                >
                  <td class="px-5 py-3">
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs inline-flex"
                      :class="bid.rank === 1 ? 'bg-amber-400 text-white' : bid.rank <= 3 ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'"
                    >{{ bid.rank }}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span :class="bid.isMine ? 'text-sky-600 font-semibold' : 'text-slate-700'">
                      {{ bid.bidder }}{{ bid.isMine ? ' (나)' : '' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span :class="bid.isMine ? 'text-sky-600 font-bold' : 'text-slate-800 font-semibold'">
                      ₩{{ bid.amount.toLocaleString() }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right font-mono text-slate-400 text-xs">{{ bid.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>
