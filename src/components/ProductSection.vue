<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, ShoppingCart, Star, Loader2, Package, ArrowRight } from 'lucide-vue-next'
import { productApi, getThumbnailUrl, type ProductSummary } from '@/api/product.api'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const products = ref<ProductSummary[]>([])
const isLoading = ref(true)
const wishlistIds = ref<Set<number>>(new Set())
const togglingWishlist = ref<Set<number>>(new Set())
const addingToCart = ref<Set<number>>(new Set())

const difficultyLabel: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
}
const difficultyColor: Record<string, string> = {
  BEGINNER: 'text-emerald-500',
  INTERMEDIATE: 'text-amber-500',
  ADVANCED: 'text-red-400',
}
const typeLabel: Record<string, string> = {
  FISH: '어류', INVERTEBRATE: '무척추', PLANT: '수초',
  EQUIPMENT: '용품', FOOD: '사료', ACCESSORY: '악세서리',
}

async function toggleWishlist(product: ProductSummary, e: Event) {
  e.stopPropagation()
  if (!authStore.isLoggedIn) { router.push('/login'); return }
  if (togglingWishlist.value.has(product.id)) return
  togglingWishlist.value.add(product.id)
  try {
    const added = await productApi.toggleWishlist(product.id)
    if (added) wishlistIds.value.add(product.id)
    else wishlistIds.value.delete(product.id)
  } catch { /* ignore */ } finally {
    togglingWishlist.value.delete(product.id)
  }
}

function isOwnProduct(product: ProductSummary) {
  return authStore.isLoggedIn && !!authStore.user && product.sellerNickName === authStore.user.nickName
}

async function addToCart(product: ProductSummary, e: Event) {
  e.stopPropagation()
  if (!authStore.isLoggedIn) { router.push('/login'); return }
  if (isOwnProduct(product)) return
  if (addingToCart.value.has(product.id)) return
  addingToCart.value.add(product.id)
  try {
    await cartStore.addItem(product.id, 1)
  } catch { /* ignore */ } finally {
    addingToCart.value.delete(product.id)
  }
}

onMounted(async () => {
  try {
    products.value = await productApi.search({ size: 8 })
    if (authStore.isLoggedIn) {
      const wishlist = await productApi.getMyWishlist().catch(() => [])
      wishlist.forEach((p: ProductSummary) => wishlistIds.value.add(p.id))
    }
  } catch {
    products.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section id="shop" class="py-16 md:py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-slate-900">지금 인기있는 생물</h2>
          <p class="text-slate-400 mt-1 text-sm">전국 수족관에서 판매 중인 개체</p>
        </div>
        <button
          @click="router.push('/search')"
          class="hidden sm:flex items-center gap-1 text-sky-600 font-semibold text-sm hover:gap-2 transition-all"
        >
          전체보기 <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="bg-white rounded-2xl overflow-hidden animate-pulse">
          <div class="aspect-square bg-slate-100" />
          <div class="p-4 space-y-2">
            <div class="h-3 bg-slate-100 rounded w-1/2" />
            <div class="h-4 bg-slate-100 rounded w-3/4" />
            <div class="h-4 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="products.length === 0" class="text-center py-16 bg-white rounded-2xl border border-sky-100">
        <Package class="w-12 h-12 text-sky-200 mx-auto mb-3" />
        <p class="text-slate-400">등록된 상품이 없습니다</p>
      </div>

      <!-- 상품 그리드 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] group cursor-pointer"
          @click="router.push(`/products/${product.id}`)"
        >
          <!-- 이미지 -->
          <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200">
            <img
              v-if="getThumbnailUrl(product)"
              :src="getThumbnailUrl(product)!"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-5xl">🐟</div>

            <!-- 품절 오버레이 -->
            <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span class="bg-white/90 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">품절</span>
            </div>

            <!-- 재고 부족 뱃지 -->
            <div v-else-if="product.lowStockWarning" class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              품절임박
            </div>

            <!-- 위시리스트 버튼 -->
            <button
              class="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
              :class="wishlistIds.has(product.id) ? 'text-red-500' : 'text-slate-400'"
              @click="toggleWishlist(product, $event)"
            >
              <Heart class="w-4 h-4" :fill="wishlistIds.has(product.id) ? 'currentColor' : 'none'" />
            </button>
          </div>

          <!-- 컨텐츠 -->
          <div class="p-4 space-y-2">
            <!-- 판매자 + 타입 -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400 truncate flex-1 mr-2">@{{ product.sellerNickName }}</span>
              <span class="text-xs font-medium text-sky-500 flex-shrink-0">{{ typeLabel[product.productType] ?? product.productType }}</span>
            </div>

            <!-- 상품명 -->
            <h3 class="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
              {{ product.name }}
            </h3>

            <!-- 별점 + 난이도 -->
            <div class="flex items-center gap-2 text-xs">
              <span v-if="product.averageRating > 0" class="flex items-center gap-0.5 text-amber-400 font-semibold">
                <Star class="w-3 h-3" fill="currentColor" />
                {{ product.averageRating.toFixed(1) }}
                <span class="text-slate-300 font-normal">({{ product.reviewCount }})</span>
              </span>
            </div>

            <!-- 가격 + 장바구니 -->
            <div class="flex items-center justify-between pt-1">
              <div>
                <span class="text-sky-600 font-black text-sm">₩{{ product.price.toLocaleString() }}</span>
                <span v-if="product.shippingFee === 0" class="ml-1.5 text-xs text-emerald-500 font-medium">무료배송</span>
              </div>
              <button
                class="p-2 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="product.status === 'SOLD_OUT' || addingToCart.has(product.id) || isOwnProduct(product)"
                :title="isOwnProduct(product) ? '내가 등록한 상품' : '장바구니 담기'"
                @click="addToCart(product, $event)"
              >
                <Loader2 v-if="addingToCart.has(product.id)" class="w-4 h-4 animate-spin" />
                <ShoppingCart v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 더 보기 버튼 -->
      <div class="text-center mt-10">
        <button
          class="px-8 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-full hover:border-sky-500 hover:text-sky-600 transition-all duration-200"
          @click="router.push('/search')"
        >
          더 많은 상품 보기
        </button>
      </div>
    </div>
  </section>
</template>
