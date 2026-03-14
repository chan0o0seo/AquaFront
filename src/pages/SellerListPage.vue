<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Store, Search, Users, X, ArrowRight, MapPin } from 'lucide-vue-next'
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

const sellerInitial = (seller: SellerProfileResponse) =>
  seller.nickName?.charAt(0).toUpperCase() ?? 'S'

// 카드마다 다른 그라디언트
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

load()
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16 pb-16">

    <!-- 헤더 -->
    <div class="bg-white border-b border-sky-100">
      <div class="max-w-6xl mx-auto px-6 py-10">
        <div class="flex items-center gap-3 mb-1">
          <Store class="w-7 h-7 text-sky-500" />
          <h1 class="text-3xl font-black text-slate-900">판매자 스토어</h1>
        </div>
        <p class="text-slate-400 text-sm mb-6">아쿠아 Hub에서 활동 중인 전문 판매자들을 만나보세요</p>

        <!-- 검색 + 정렬 -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="판매자 이름, 상호명 검색..."
              class="w-full pl-10 pr-10 py-3 rounded-2xl border border-sky-100 bg-sky-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <select
            v-model="sortKey"
            class="px-4 py-3 rounded-2xl border border-sky-100 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-300 cursor-pointer"
          >
            <option value="followers">팔로워 많은순</option>
            <option value="name">이름순</option>
            <option value="newest">최신 등록순</option>
          </select>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 py-8">

      <!-- 로딩 스켈레톤 -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="rounded-2xl bg-white border border-sky-100 overflow-hidden animate-pulse">
          <div class="h-20 bg-slate-100" />
          <div class="px-5 pt-10 pb-5 space-y-3">
            <div class="h-5 w-2/5 bg-slate-100 rounded-full" />
            <div class="h-3.5 w-1/3 bg-slate-100 rounded-full" />
            <div class="h-3 w-full bg-slate-100 rounded-full" />
            <div class="h-3 w-3/4 bg-slate-100 rounded-full" />
            <div class="flex gap-4 pt-1">
              <div class="h-3 w-20 bg-slate-100 rounded-full" />
              <div class="h-3 w-20 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 빈 결과 -->
      <div v-else-if="sortedFilteredSellers.length === 0" class="flex flex-col items-center py-32 text-slate-400">
        <Store class="w-16 h-16 mb-4 text-slate-200" />
        <p class="text-base font-semibold text-slate-500 mb-1">
          {{ searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : '등록된 판매자가 없습니다' }}
        </p>
        <p class="text-sm text-slate-400 mb-4">
          {{ searchQuery ? '다른 키워드로 검색해보세요' : '곧 멋진 판매자들이 합류할 예정입니다' }}
        </p>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="px-5 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
        >
          전체 보기
        </button>
      </div>

      <!-- 스토어 그리드 -->
      <template v-else>
        <p class="text-sm text-slate-400 mb-5">
          <span class="font-semibold text-sky-600">{{ sortedFilteredSellers.length }}</span>개 스토어
          <span v-if="searchQuery" class="ml-1">· "{{ searchQuery }}" 검색결과</span>
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="seller in sortedFilteredSellers"
            :key="seller.id"
            @click="router.push(`/store/${seller.memberId}`)"
            class="group bg-white rounded-2xl border border-sky-100 overflow-visible cursor-pointer hover:shadow-lg hover:border-sky-200 transition-all duration-200 relative"
          >
            <!-- 배너 -->
            <div
              class="h-20 bg-gradient-to-r rounded-t-2xl overflow-hidden relative"
              :class="cardGradient(seller)"
            >
              <div
                class="absolute inset-0 opacity-10"
                style="background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,.2) 8px, rgba(255,255,255,.2) 16px)"
              />
            </div>

            <!-- 아바타: 배너와 콘텐츠 경계에 걸침 -->
            <div class="absolute top-12 left-5 w-14 h-14 rounded-xl border-4 border-white shadow-md overflow-hidden z-10">
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
            <div class="px-5 pt-10 pb-5">
              <!-- 이름 + 화살표 -->
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h3 class="font-black text-slate-900 text-base leading-tight truncate">{{ seller.nickName }}</h3>
                  <p v-if="seller.businessName" class="text-xs text-slate-400 mt-0.5 truncate">{{ seller.businessName }}</p>
                </div>
                <ArrowRight class="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
              </div>

              <!-- 소개 -->
              <p
                v-if="seller.storeDescription"
                class="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed"
              >
                {{ seller.storeDescription }}
              </p>
              <p v-else class="text-sm text-slate-300 mt-2.5 italic">소개글이 없습니다</p>

              <!-- 위치 + 팔로워 -->
              <div class="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <div v-if="seller.businessAddress" class="flex items-center gap-1 min-w-0">
                  <MapPin class="w-3 h-3 flex-shrink-0" />
                  <span class="truncate">{{ seller.businessAddress.split(' ').slice(0, 2).join(' ') }}</span>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <Users class="w-3 h-3" />
                  <span>{{ seller.followerCount.toLocaleString() }}명</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
