<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, ShoppingCart, Fish, Check } from 'lucide-vue-next'
import { productApi, getThumbnailUrl, type ProductSummary } from '@/api'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const wishlistItems = ref<ProductSummary[]>([])
const isLoading = ref(false)

const typeLabelMap: Record<string, string> = {
  FISH: '어류', PLANT: '수초', INVERTEBRATE: '새우/갑각류',
  EQUIPMENT: '용품/장비', ACCESSORY: '소품', FOOD: '사료',
}
const typeEmojiMap: Record<string, string> = {
  FISH: '🐠', PLANT: '🌿', INVERTEBRATE: '🦐', EQUIPMENT: '🔧', ACCESSORY: '🪨', FOOD: '🍃',
}

type FilterKey = '전체' | 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'
const categories: { key: FilterKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: 'FISH', label: '어류' },
  { key: 'INVERTEBRATE', label: '새우/갑각류' },
  { key: 'PLANT', label: '수초' },
  { key: 'EQUIPMENT', label: '용품/장비' },
  { key: 'FOOD', label: '사료' },
  { key: 'ACCESSORY', label: '소품' },
]
const activeFilter = ref<FilterKey>('전체')

const filteredItems = computed(() => {
  if (activeFilter.value === '전체') return wishlistItems.value
  return wishlistItems.value.filter(item => item.productType === activeFilter.value)
})

const cartFeedback = ref<Record<number, boolean>>({})
const showAddedToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

async function loadWishlist() {
  isLoading.value = true
  try {
    wishlistItems.value = await productApi.getMyWishlist()
  } catch (e) {
    console.error('위시리스트 로드 실패', e)
  } finally {
    isLoading.value = false
  }
}

async function removeWishlist(id: number) {
  // 낙관적으로 목록에서 제거
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== id)
  try {
    await productApi.toggleWishlist(id)
  } catch (e) {
    // 실패 시 다시 로드
    console.error('찜 해제 실패', e)
    loadWishlist()
  }
}

async function addToCart(item: ProductSummary) {
  if (item.status === 'SOLD_OUT') return
  await cartStore.addItem(item.id)
  cartFeedback.value[item.id] = true
  setTimeout(() => { delete cartFeedback.value[item.id] }, 1500)
  showAddedToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { showAddedToast.value = false }, 2000)
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

onMounted(loadWishlist)
</script>

<template>
  <div>
    <h1 class="text-3xl font-black text-slate-900 mb-6">찜 목록</h1>

    <!-- 카테고리 필터 -->
    <div class="flex items-center gap-2 mb-6 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat.key"
        @click="activeFilter = cat.key"
        class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer"
        :class="activeFilter === cat.key
          ? 'bg-sky-500 text-white'
          : 'bg-sky-50 text-slate-600 hover:bg-sky-100'"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="filteredItems.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <Heart class="w-16 h-16 text-slate-200 mb-4" />
      <p class="text-slate-400 text-base mb-6">
        {{ activeFilter === '전체' ? '아직 찜한 상품이 없어요' : '해당 카테고리의 찜한 상품이 없어요' }}
      </p>
      <button
        @click="router.push('/shop')"
        class="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-colors duration-150"
      >
        쇼핑 시작하기
      </button>
    </div>

    <!-- 찜 목록 그리드 -->
    <TransitionGroup
      v-else
      name="wishlist"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        @click="router.push(`/products/${item.id}`)"
      >
        <!-- 이미지 -->
        <div class="relative aspect-[4/3] bg-gradient-to-br from-sky-100 to-teal-100 overflow-hidden">
          <img
            v-if="getThumbnailUrl(item)"
            :src="getThumbnailUrl(item)"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="absolute inset-0 flex items-center justify-center text-5xl">
            {{ typeEmojiMap[item.productType] ?? '📦' }}
          </span>

          <div v-if="item.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
          </div>

          <!-- 찜 해제 버튼 -->
          <button
            @click.stop="removeWishlist(item.id)"
            class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors duration-150"
            aria-label="찜 해제"
          >
            <Heart class="w-5 h-5 text-sky-500 fill-sky-500" />
          </button>

          <!-- 카테고리 뱃지 -->
          <span class="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/80 text-slate-600">
            {{ typeLabelMap[item.productType] ?? item.productType }}
          </span>
        </div>

        <!-- 카드 본문 -->
        <div class="p-4">
          <p class="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{{ item.name }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-slate-400">{{ item.sellerNickName }}</span>
            <span class="font-bold text-sky-600 text-sm">{{ formatPrice(item.price) }}</span>
          </div>

          <!-- 태그 -->
          <div class="flex gap-1 mt-2 flex-wrap">
            <span
              v-for="tag in item.tags.slice(0, 3)"
              :key="tag"
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex items-center gap-2 mt-3">
            <button
              @click.stop="removeWishlist(item.id)"
              class="text-sm text-slate-400 hover:text-red-400 transition-colors duration-150"
            >
              찜 해제
            </button>
            <div class="flex-1" />
            <button
              @click.stop="addToCart(item)"
              :disabled="item.status === 'SOLD_OUT'"
              class="flex items-center gap-1.5 text-sm font-semibold rounded-full px-4 py-2 transition-colors duration-150"
              :class="item.status === 'SOLD_OUT'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-600 text-white'"
            >
              <ShoppingCart v-if="!cartFeedback[item.id]" class="w-4 h-4" />
              <span>{{ cartFeedback[item.id] ? '담겼어요!' : '장바구니 담기' }}</span>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>

  <!-- 장바구니 토스트 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showAddedToast"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 whitespace-nowrap"
      >
        <div class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check :size="14" class="text-white" />
        </div>
        <span class="font-medium">장바구니에 담았어요</span>
        <router-link to="/cart" class="text-sky-400 hover:text-sky-300 text-sm font-medium ml-2">
          바로가기 →
        </router-link>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.wishlist-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.wishlist-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.wishlist-move {
  transition: transform 0.25s ease;
}
</style>
