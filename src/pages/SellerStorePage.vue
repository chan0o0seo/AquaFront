<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, Gavel, Heart, MapPin } from 'lucide-vue-next'
import { sellerApi, type SellerProfileResponse } from '@/api'
import { productApi, getThumbnailUrl, type ProductSummary } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const sellerId = route.params.sellerId as string

const profile = ref<SellerProfileResponse | null>(null)
const products = ref<ProductSummary[]>([])
const isFollowing = ref(false)
const isTogglingFollow = ref(false)
const isLoading = ref(true)
const activeSection = ref<'products' | 'auctions'>('products')
const activeTypeFilter = ref('')

const typeLabelMap: Record<string, string> = {
  FISH: '어류', PLANT: '수초', INVERTEBRATE: '새우/갑각류',
  EQUIPMENT: '용품/장비', ACCESSORY: '소품', FOOD: '사료',
}
const typeEmojiMap: Record<string, string> = {
  FISH: '🐠', PLANT: '🌿', INVERTEBRATE: '🦐', EQUIPMENT: '🔧', ACCESSORY: '🪨', FOOD: '🍃',
}
const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    FISH: 'bg-sky-100 text-sky-700', PLANT: 'bg-green-100 text-green-700',
    INVERTEBRATE: 'bg-purple-100 text-purple-700', EQUIPMENT: 'bg-amber-100 text-amber-700',
    ACCESSORY: 'bg-pink-100 text-pink-700', FOOD: 'bg-lime-100 text-lime-700',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600'
}

const availableTypes = computed(() => {
  const types = new Set(products.value.map(p => p.productType))
  return Array.from(types)
})

const filteredProducts = computed(() => {
  if (!activeTypeFilter.value) return products.value
  return products.value.filter(p => p.productType === activeTypeFilter.value)
})

const sellerInitial = computed(() => profile.value?.nickName?.charAt(0).toUpperCase() ?? 'S')

async function load() {
  isLoading.value = true
  try {
    const [profileData, productsData] = await Promise.all([
      sellerApi.getStore(sellerId),
      sellerApi.getSellerProducts(sellerId),
    ])
    profile.value = profileData
    products.value = productsData

    if (isLoggedIn.value) {
      isFollowing.value = await sellerApi.isFollowing(sellerId)
    }
  } catch (e) {
    console.error('판매자 정보 로드 실패', e)
  } finally {
    isLoading.value = false
  }
}

async function toggleFollow() {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (isTogglingFollow.value || !profile.value) return
  isTogglingFollow.value = true
  const prev = isFollowing.value
  isFollowing.value = !prev
  if (profile.value) profile.value.followerCount += prev ? -1 : 1
  try {
    const result = await sellerApi.toggleFollow(sellerId)
    isFollowing.value = result
    if (profile.value) {
      profile.value.followerCount += (result ? 1 : -1) - (prev ? 0 : 0)
      // re-fetch accurate count
      const fresh = await sellerApi.getStore(sellerId)
      profile.value.followerCount = fresh.followerCount
    }
  } catch {
    isFollowing.value = prev
    if (profile.value) profile.value.followerCount += prev ? 1 : -1
  } finally {
    isTogglingFollow.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-6xl mx-auto px-6 py-12 mt-16">

      <button
        @click="router.back()"
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-8 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        뒤로가기
      </button>

      <!-- 로딩 -->
      <div v-if="isLoading" class="flex justify-center py-32">
        <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- 오류 -->
      <div v-else-if="!profile" class="text-center py-32">
        <Package class="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-400">판매자를 찾을 수 없습니다</p>
        <button @click="router.push('/stores')" class="mt-4 text-sm text-sky-500 hover:underline">
          스토어 목록으로
        </button>
      </div>

      <template v-else>

        <!-- ── 프로필 헤더 ── -->
        <div class="rounded-2xl border border-sky-100 overflow-hidden mb-8">
          <!-- 배너 -->
          <div class="h-32 bg-gradient-to-r from-sky-400 to-teal-500" />

          <div class="px-6 pb-6">
            <!-- 아바타 + 팔로우 버튼 -->
            <div class="flex items-end justify-between -mt-10 mb-4">
              <div class="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden">
                <img
                  v-if="profile.logoImageUrl"
                  :src="profile.logoImageUrl"
                  :alt="profile.nickName"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-3xl font-black"
                >
                  {{ sellerInitial }}
                </div>
              </div>

              <button
                @click="toggleFollow"
                :disabled="isTogglingFollow"
                class="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-60 mt-2"
                :class="isFollowing
                  ? 'bg-sky-500 text-white'
                  : 'border border-sky-200 text-sky-500 hover:bg-sky-50'"
              >
                <Heart class="w-4 h-4" :fill="isFollowing ? 'currentColor' : 'none'" />
                {{ isFollowing ? '팔로잉' : '팔로우' }}
              </button>
            </div>

            <!-- 이름 + 상호명 -->
            <h1 class="text-2xl font-black text-slate-900">{{ profile.nickName }}</h1>
            <p v-if="profile.businessName" class="text-sm text-slate-500 mt-0.5">{{ profile.businessName }}</p>

            <!-- 위치 -->
            <div v-if="profile.businessAddress" class="flex items-center gap-1.5 mt-1">
              <MapPin class="w-3.5 h-3.5 text-slate-400" />
              <span class="text-sm text-slate-400">{{ profile.businessAddress }}</span>
            </div>

            <!-- 소개 -->
            <p v-if="profile.storeDescription" class="text-sm text-slate-600 leading-relaxed mt-3 mb-4">
              {{ profile.storeDescription }}
            </p>

            <!-- 통계 -->
            <div class="grid grid-cols-2 gap-3 mt-4">
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">등록 상품</p>
                <p class="text-xl font-black text-slate-900">{{ products.length }}</p>
              </div>
              <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                <p class="text-xs text-slate-400 mb-1">팔로워</p>
                <p class="text-xl font-black text-slate-900">{{ profile.followerCount.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 섹션 탭 ── -->
        <div class="flex gap-1 p-1 bg-sky-50 rounded-xl border border-sky-100 mb-6 w-fit">
          <button
            @click="activeSection = 'products'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="activeSection === 'products' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          >
            <Package class="w-4 h-4" />
            상품 {{ products.length }}
          </button>
          <button
            @click="activeSection = 'auctions'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="activeSection === 'auctions' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          >
            <Gavel class="w-4 h-4" />
            경매
          </button>
        </div>

        <!-- ── 상품 섹션 ── -->
        <template v-if="activeSection === 'products'">
          <!-- 카테고리 필터 -->
          <div v-if="availableTypes.length > 1" class="flex gap-2 flex-wrap mb-6">
            <button
              @click="activeTypeFilter = ''"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all"
              :class="!activeTypeFilter ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
            >
              전체
            </button>
            <button
              v-for="type in availableTypes"
              :key="type"
              @click="activeTypeFilter = activeTypeFilter === type ? '' : type"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all"
              :class="activeTypeFilter === type ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
            >
              {{ typeEmojiMap[type] }} {{ typeLabelMap[type] ?? type }}
            </button>
          </div>

          <!-- 상품 그리드 -->
          <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              @click="router.push(`/products/${product.id}`)"
              class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200"
              :class="product.status === 'SOLD_OUT' ? 'opacity-60' : ''"
            >
              <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
                <img
                  v-if="getThumbnailUrl(product)"
                  :src="getThumbnailUrl(product)"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="absolute inset-0 flex items-center justify-center text-4xl">
                  {{ typeEmojiMap[product.productType] ?? '📦' }}
                </span>
                <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                </div>
                <span class="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">
                  {{ typeLabelMap[product.productType] ?? product.productType }}
                </span>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{{ product.name }}</h3>
                <div class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="tag in product.tags.slice(0, 2)"
                    :key="tag"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
                  >
                    #{{ tag }}
                  </span>
                </div>
                <div class="flex items-end justify-between">
                  <p class="text-base font-black text-sky-600">₩{{ product.price.toLocaleString() }}</p>
                  <div class="flex items-center gap-0.5 text-xs text-slate-400">
                    <span class="text-amber-400">★</span>
                    <span>{{ product.averageRating.toFixed(1) }}</span>
                    <span class="text-slate-300 ml-0.5">({{ product.reviewCount }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-16">
            <Package class="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">등록된 상품이 없습니다</p>
          </div>
        </template>

        <!-- ── 경매 섹션 ── -->
        <template v-else>
          <div class="text-center py-16">
            <Gavel class="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">진행 중인 경매가 없습니다</p>
            <button @click="router.push('/auction')" class="mt-3 text-sm text-sky-500 hover:underline">
              전체 경매 보기
            </button>
          </div>
        </template>

      </template>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
