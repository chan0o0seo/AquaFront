<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store, Search, Users, Package } from 'lucide-vue-next'
import { sellerApi, type SellerProfileResponse } from '@/api'

const router = useRouter()

const sellers = ref<SellerProfileResponse[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

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

const filteredSellers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sellers.value
  return sellers.value.filter(s =>
    s.nickName.toLowerCase().includes(q) ||
    s.businessName?.toLowerCase().includes(q) ||
    s.storeDescription?.toLowerCase().includes(q)
  )
})

const sellerInitial = (seller: SellerProfileResponse) =>
  seller.nickName?.charAt(0).toUpperCase() ?? 'S'

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16 pb-16">

    <!-- 헤더 -->
    <div class="bg-white border-b border-sky-100">
      <div class="max-w-6xl mx-auto px-6 py-10">
        <div class="flex items-center gap-3 mb-2">
          <Store class="w-7 h-7 text-sky-500" />
          <h1 class="text-3xl font-black text-slate-900">판매자 스토어</h1>
        </div>
        <p class="text-slate-400 text-sm mb-6">아쿠아 Hub에서 활동 중인 전문 판매자들을 만나보세요</p>

        <!-- 검색 -->
        <div class="relative max-w-md">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="판매자 이름, 상호명 검색..."
            class="w-full pl-10 pr-4 py-3 rounded-2xl border border-sky-100 bg-sky-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-colors"
          />
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 py-8">

      <!-- 로딩 -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="rounded-2xl bg-white border border-sky-100 overflow-hidden animate-pulse">
          <div class="h-24 bg-slate-100" />
          <div class="p-5 space-y-3">
            <div class="h-5 w-1/2 bg-slate-100 rounded-full" />
            <div class="h-4 w-3/4 bg-slate-100 rounded-full" />
            <div class="h-3 w-full bg-slate-100 rounded-full" />
            <div class="h-3 w-2/3 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>

      <!-- 빈 결과 -->
      <div v-else-if="filteredSellers.length === 0" class="flex flex-col items-center py-32 text-slate-400">
        <Store class="w-12 h-12 mb-4 text-slate-200" />
        <p class="font-medium">
          {{ searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : '등록된 판매자가 없습니다' }}
        </p>
        <button v-if="searchQuery" @click="searchQuery = ''" class="mt-3 text-sm text-sky-500 hover:underline">
          전체 보기
        </button>
      </div>

      <!-- 스토어 그리드 -->
      <div v-else>
        <p class="text-sm text-slate-400 mb-5">{{ filteredSellers.length }}개 스토어</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="seller in filteredSellers"
            :key="seller.id"
            @click="router.push(`/store/${seller.memberId}`)"
            class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-sky-200 hover:scale-[1.01] transition-all duration-200"
          >
            <!-- 배너 -->
            <div class="h-20 bg-gradient-to-r from-sky-400 to-teal-500 relative">
              <!-- 로고 아바타 -->
              <div class="absolute -bottom-6 left-5 w-14 h-14 rounded-xl border-3 border-white shadow-md overflow-hidden">
                <img
                  v-if="seller.logoImageUrl"
                  :src="seller.logoImageUrl"
                  :alt="seller.nickName"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-xl font-black"
                >
                  {{ sellerInitial(seller) }}
                </div>
              </div>
            </div>

            <div class="px-5 pt-8 pb-5">
              <!-- 이름 -->
              <h3 class="font-black text-slate-900 text-base leading-tight">{{ seller.nickName }}</h3>
              <p v-if="seller.businessName" class="text-xs text-slate-400 mt-0.5">{{ seller.businessName }}</p>

              <!-- 소개 -->
              <p v-if="seller.storeDescription" class="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {{ seller.storeDescription }}
              </p>
              <p v-else class="text-sm text-slate-300 mt-2 italic">소개글이 없습니다</p>

              <!-- 팔로워 -->
              <div class="flex items-center gap-1 mt-3 text-xs text-slate-400">
                <Users class="w-3.5 h-3.5" />
                <span>팔로워 {{ seller.followerCount.toLocaleString() }}명</span>
              </div>

              <!-- 스토어 보기 버튼 -->
              <button
                class="w-full mt-4 py-2 rounded-xl text-sm font-semibold bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-colors"
              >
                스토어 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
