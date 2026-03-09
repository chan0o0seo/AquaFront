<script setup lang="ts">
import { ref, computed } from 'vue'
import { Heart, ShoppingCart, Fish } from 'lucide-vue-next'

interface WishlistItem {
  id: number
  name: string
  seller: string
  price: number
  category: '전체' | '어류' | '수초' | '용품'
}

const wishlistItems = ref<WishlistItem[]>([
  { id: 1, name: '레드 크리스탈 새우 10마리', seller: '강남아쿠아리움', price: 45000, category: '어류' },
  { id: 2, name: 'ADA 아마조니아 소일 9L',    seller: '브리더팜',      price: 35000, category: '용품' },
  { id: 3, name: '수초 종합 세트',             seller: '수초팜',        price: 28000, category: '수초' },
  { id: 4, name: '슈퍼레드 구피 수컷 5마리',  seller: '홈브리더김씨',  price: 18000, category: '어류' },
])

type FilterCategory = '전체' | '어류' | '수초' | '용품'
const categories: FilterCategory[] = ['전체', '어류', '수초', '용품']
const activeFilter = ref<FilterCategory>('전체')

const filteredItems = computed(() => {
  if (activeFilter.value === '전체') return wishlistItems.value
  return wishlistItems.value.filter(item => item.category === activeFilter.value)
})

// Cart feedback state: itemId → boolean
const cartFeedback = ref<Record<number, boolean>>({})

function removeWishlist(id: number) {
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== id)
}

function addToCart(id: number) {
  cartFeedback.value[id] = true
  setTimeout(() => {
    delete cartFeedback.value[id]
  }, 1500)
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div>
    <!-- Header -->
    <h1 class="text-3xl font-black text-slate-900 mb-6">찜 목록</h1>

    <!-- Filter Pills -->
    <div class="flex items-center gap-2 mb-6">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeFilter = cat"
        class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer"
        :class="activeFilter === cat
          ? 'bg-sky-500 text-white'
          : 'bg-sky-50 text-slate-600 hover:bg-sky-100'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredItems.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <Heart class="w-16 h-16 text-slate-200 mb-4" />
      <p class="text-slate-400 text-base mb-6">아직 찜한 상품이 없어요</p>
      <button class="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-colors duration-150">
        쇼핑 시작하기
      </button>
    </div>

    <!-- Product Grid -->
    <TransitionGroup
      v-else
      name="wishlist"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="bg-white rounded-2xl border border-sky-100 overflow-hidden"
      >
        <!-- Image area -->
        <div class="relative">
          <div class="bg-gradient-to-br from-sky-100 to-teal-100 aspect-[4/3] w-full rounded-xl mx-0" />
          <!-- Heart remove button -->
          <button
            @click="removeWishlist(item.id)"
            class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors duration-150 cursor-pointer"
            aria-label="찜 해제"
          >
            <Heart class="w-5 h-5 text-sky-500 fill-sky-500" />
          </button>
        </div>

        <!-- Card Body -->
        <div class="p-4">
          <p class="font-semibold text-slate-900 text-sm mt-1 leading-snug">{{ item.name }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-slate-400">{{ item.seller }}</span>
            <span class="font-bold text-sky-600 text-sm">{{ formatPrice(item.price) }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 mt-3">
            <button
              @click="removeWishlist(item.id)"
              class="text-sm text-slate-400 hover:text-red-400 transition-colors duration-150 cursor-pointer"
            >
              찜 해제
            </button>
            <div class="flex-1" />
            <button
              @click="addToCart(item.id)"
              class="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full px-4 py-2 transition-colors duration-150 cursor-pointer"
            >
              <ShoppingCart v-if="!cartFeedback[item.id]" class="w-4 h-4" />
              <span>{{ cartFeedback[item.id] ? '담겼어요!' : '장바구니 담기' }}</span>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
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
