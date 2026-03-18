<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store, Search, Users, X, ArrowRight, MapPin, Sparkles, TrendingUp, Clock } from 'lucide-vue-next'
import { sellerApi, type SellerProfileResponse } from '@/api'

const router = useRouter()

const sellers = ref<SellerProfileResponse[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const sortKey = ref<'followers' | 'name' | 'newest'>('followers')

async function load() {
  isLoading.value = true
  try {
    sellers.value = await sellerApi.getAll()
  } catch (e) {
    console.error('스토어 목록 로드 실패', e)
  } finally {
    isLoading.value = false
  }
}

const sortedFilteredSellers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = q
    ? sellers.value.filter(s =>
        s.nickName.toLowerCase().includes(q) ||
        s.businessName?.toLowerCase().includes(q) ||
        s.storeDescription?.toLowerCase().includes(q)
      )
    : [...sellers.value]

  if (sortKey.value === 'followers') list = list.sort((a, b) => b.followerCount - a.followerCount)
  if (sortKey.value === 'name')      list = list.sort((a, b) => a.nickName.localeCompare(b.nickName, 'ko'))
  if (sortKey.value === 'newest')    list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return list
})

// 상위 3 판매자 (팔로워순 정렬 시 하이라이트용)
const topSellerIds = computed(() => {
  const sorted = [...sellers.value].sort((a, b) => b.followerCount - a.followerCount)
  return new Set(sorted.slice(0, 3).map(s => s.id))
})

// 신규 판매자: 30일 이내 가입
const isNewSeller = (seller: SellerProfileResponse) => {
  const diff = Date.now() - new Date(seller.createdAt).getTime()
  return diff < 30 * 24 * 60 * 60 * 1000
}

const sellerInitial = (seller: SellerProfileResponse) =>
  seller.nickName?.charAt(0).toUpperCase() ?? 'S'

const GRADIENTS = [
  'from-sky-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-green-600',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-indigo-400 to-blue-500',
]
const cardGradient = (seller: SellerProfileResponse) => {
  const idx = Math.abs([...seller.nickName].reduce((acc, c) => acc + c.charCodeAt(0), 0)) % GRADIENTS.length
  return GRADIENTS[idx]
}

// 검색어 하이라이트
function highlight(text: string): string {
  if (!searchQuery.value.trim()) return text
  const q = searchQuery.value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark class="bg-sky-100 text-sky-700 rounded px-0.5 not-italic">$1</mark>')
}

const sortOptions = [
  { key: 'followers' as const, label: '팔로워순', icon: TrendingUp },
  { key: 'newest'   as const, label: '최신순',   icon: Sparkles },
  { key: 'name'     as const, label: '이름순',   icon: Store },
]

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16 pb-20">

    <!-- ── 히어로 헤더 ── -->
    <div class="relative bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-600 overflow-hidden">
      <!-- 배경 패턴 -->
      <div class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px); background-size: 60px 60px, 80px 80px, 40px 40px" />
      <!-- 물결 모양 -->
      <div class="absolute bottom-0 left-0 right-0 h-10 bg-slate-50"
        style="clip-path: ellipse(55% 100% at 50% 100%)" />

      <div class="relative max-w-4xl mx-auto px-6 pt-14 pb-20 text-center">
        <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Store class="w-3.5 h-3.5" />
          <span>{{ isLoading ? '···' : `${sellers.length}개 스토어 운영 중` }}</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
          판매자 스토어
        </h1>
        <p class="text-sky-100 text-base mb-8">
          아쿠아 Hub의 전문 판매자들이 운영하는 개성 넘치는 스토어를 만나보세요
        </p>

        <!-- 검색창 -->
        <div class="relative max-w-lg mx-auto">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="판매자 이름, 상호명으로 검색..."
            class="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white text-slate-800 text-sm shadow-lg
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6">

      <!-- ── 정렬 / 결과 바 ── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5">
        <!-- 결과 수 -->
        <p class="text-sm text-slate-500 order-2 sm:order-1">
          <template v-if="!isLoading">
            <span class="font-bold text-slate-800">{{ sortedFilteredSellers.length }}</span>개 스토어
            <span v-if="searchQuery" class="text-sky-600 ml-1">· "{{ searchQuery }}" 검색결과</span>
          </template>
        </p>

        <!-- 정렬 pill -->
        <div class="flex items-center gap-1.5 order-1 sm:order-2">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            @click="sortKey = opt.key"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border"
            :class="sortKey === opt.key
              ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
              : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600'"
          >
            <component :is="opt.icon" class="w-3.5 h-3.5" />
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 로딩 스켈레톤 -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="rounded-2xl bg-white border border-sky-100 overflow-hidden animate-pulse">
          <div class="h-24 bg-slate-100" />
          <div class="px-5 pt-10 pb-5 space-y-3">
            <div class="h-5 w-2/5 bg-slate-100 rounded-full" />
            <div class="h-3.5 w-1/3 bg-slate-100 rounded-full" />
            <div class="h-3 w-full bg-slate-100 rounded-full" />
            <div class="h-3 w-3/4 bg-slate-100 rounded-full" />
            <div class="h-px bg-slate-100 mt-2" />
            <div class="flex gap-4">
              <div class="h-3 w-16 bg-slate-100 rounded-full" />
              <div class="h-3 w-20 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 빈 결과 -->
      <div v-else-if="sortedFilteredSellers.length === 0"
        class="flex flex-col items-center py-32 text-slate-400"
      >
        <div class="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-5">
          <Store class="w-9 h-9 text-sky-200" />
        </div>
        <p class="text-base font-bold text-slate-600 mb-1">
          {{ searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : '등록된 판매자가 없습니다' }}
        </p>
        <p class="text-sm text-slate-400 mb-5">
          {{ searchQuery ? '다른 키워드로 검색해보세요' : '곧 멋진 판매자들이 합류할 예정입니다' }}
        </p>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="px-5 py-2.5 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
        >
          전체 보기
        </button>
      </div>

      <!-- 스토어 그리드 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(seller, rank) in sortedFilteredSellers"
          :key="seller.id"
          @click="router.push(`/store/${seller.memberId}`)"
          class="group bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 relative flex flex-col"
          :class="topSellerIds.has(seller.id) && sortKey === 'followers'
            ? 'border-sky-200 hover:border-sky-300'
            : 'border-sky-100 hover:border-sky-200'"
        >
          <!-- 배너 -->
          <div class="h-24 relative flex-shrink-0 overflow-hidden">
            <!-- 배너 이미지 -->
            <img
              v-if="seller.bannerImageUrl"
              :src="seller.bannerImageUrl"
              :alt="`${seller.nickName} 배너`"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <!-- 기본 그라디언트 (배너 없을 때) -->
            <div
              v-else
              class="w-full h-full bg-gradient-to-r"
              :class="cardGradient(seller)"
            >
              <div class="absolute inset-0 opacity-10"
                style="background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,.25) 8px, rgba(255,255,255,.25) 16px)" />
            </div>
            <!-- 배너 위 그라디언트 오버레이 (가독성) -->
            <div v-if="seller.bannerImageUrl"
              class="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

            <!-- TOP 배지 -->
            <div
              v-if="topSellerIds.has(seller.id) && sortKey === 'followers'"
              class="absolute top-3 right-3 flex items-center gap-1 bg-white/25 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1 rounded-full"
            >
              <TrendingUp class="w-3 h-3" />
              TOP {{ rank + 1 }}
            </div>

            <!-- NEW 배지 -->
            <div
              v-else-if="isNewSeller(seller)"
              class="absolute top-3 right-3 bg-emerald-400 text-white text-[11px] font-black px-2.5 py-1 rounded-full"
            >
              NEW
            </div>
          </div>

          <!-- 아바타 -->
          <div class="absolute top-[4.5rem] left-5 w-14 h-14 rounded-xl border-4 border-white shadow-md overflow-hidden z-10">
            <img
              v-if="seller.logoImageUrl"
              :src="seller.logoImageUrl"
              :alt="seller.nickName"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-black"
              :class="cardGradient(seller)"
            >
              {{ sellerInitial(seller) }}
            </div>
          </div>

          <!-- 카드 본문 -->
          <div class="px-5 pt-10 pb-4 flex flex-col flex-1">
            <!-- 이름 + 화살표 -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="min-w-0">
                <h3
                  class="font-black text-slate-900 text-base leading-tight truncate"
                  v-html="highlight(seller.nickName)"
                />
                <p
                  v-if="seller.businessName"
                  class="text-xs text-slate-400 mt-0.5 truncate"
                  v-html="highlight(seller.businessName)"
                />
              </div>
              <div class="flex-shrink-0 w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center mt-0.5
                          group-hover:bg-sky-500 transition-colors">
                <ArrowRight class="w-3.5 h-3.5 text-sky-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <!-- 소개 -->
            <p
              v-if="seller.storeDescription"
              class="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1"
              v-html="highlight(seller.storeDescription)"
            />
            <p v-else class="text-sm text-slate-300 italic flex-1">소개글이 없습니다</p>

            <!-- 구분선 -->
            <div class="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between">
              <!-- 위치 -->
              <div v-if="seller.businessAddress" class="flex items-center gap-1 text-xs text-slate-400 min-w-0">
                <MapPin class="w-3 h-3 flex-shrink-0" />
                <span class="truncate">{{ seller.businessAddress.split(' ').slice(0, 2).join(' ') }}</span>
              </div>
              <div v-else />

              <!-- 팔로워 -->
              <div class="flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                :class="seller.followerCount > 0 ? 'text-sky-600' : 'text-slate-400'"
              >
                <Users class="w-3 h-3" />
                <span>{{ seller.followerCount.toLocaleString() }}</span>
                <span class="font-normal text-slate-400">팔로워</span>
              </div>
            </div>
          </div>

          <!-- hover 시 CTA 오버레이 -->
          <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-sky-500/10 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-b-2xl" />
        </div>
      </div>

    </div>
  </div>
</template>
