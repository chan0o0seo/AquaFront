<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, ShoppingCart } from 'lucide-vue-next'

const router = useRouter()

const products = ref([
  { id: 1, name: '네온 테트라 (10마리)',       store: '서울 강남 수족관',     price: '₩12,000', difficulty: 2, liked: false },
  { id: 2, name: '카디널 테트라 (5마리)',       store: '부산 해운대 아쿠아',   price: '₩15,000', difficulty: 2, liked: true  },
  { id: 3, name: '코리도라스 스테르바이',       store: '대전 수족관 월드',     price: '₩8,500',  difficulty: 1, liked: false },
  { id: 4, name: '엔젤피쉬 블랙',              store: '인천 송도 아쿠아리움', price: '₩25,000', difficulty: 3, liked: false },
  { id: 5, name: '구피 코브라 (1쌍)',          store: '대구 팔공 수족관',     price: '₩18,000', difficulty: 1, liked: true  },
  { id: 6, name: '베타 하프문 레드',           store: '광주 상무 아쿠아',     price: '₩35,000', difficulty: 2, liked: false },
  { id: 7, name: '플레코 브리슬노즈',          store: '서울 홍대 피쉬샵',     price: '₩15,000', difficulty: 1, liked: false },
  { id: 8, name: '레드 체리 쉬림프 (10마리)',  store: '수원 영통 수족관',     price: '₩12,000', difficulty: 2, liked: true  },
])

const getDifficultyStars = (level: number) => '★'.repeat(level) + '☆'.repeat(3 - level)

const toggleLike = (productId: number, e: Event) => {
  e.stopPropagation()
  const product = products.value.find(p => p.id === productId)
  if (product) product.liked = !product.liked
}

const handleCartClick = (productId: number, e: Event) => {
  e.stopPropagation()
}
</script>

<template>
  <section id="shop" class="py-16 md:py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          지금 인기있는 생물
        </h2>
        <p class="text-slate-500">전국 수족관에서 판매 중인 개체</p>
      </div>

      <!-- Product Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div
            v-for="product in products"
            :key="product.id"
            class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group cursor-pointer"
            @click="router.push('/products/' + product.id)"
        >
          <!-- Image -->
          <div class="relative aspect-square bg-gradient-to-br from-sky-200 to-teal-300 flex items-center justify-center">
            <span class="text-5xl">🐟</span>
            <button
                class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                :class="product.liked ? 'text-red-500' : 'text-slate-400'"
                @click="toggleLike(product.id, $event)"
            >
              <Heart class="w-5 h-5" :fill="product.liked ? 'currentColor' : 'none'" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 space-y-2">
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <span>🏪</span>
              <span>{{ product.store }}</span>
            </div>
            <h3 class="font-semibold text-slate-800 line-clamp-1">{{ product.name }}</h3>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">
                난이도 <span class="text-amber-500">{{ getDifficultyStars(product.difficulty) }}</span>
              </span>
            </div>
            <div class="flex items-center justify-between pt-2">
              <span class="text-sky-600 font-bold">{{ product.price }}</span>
              <button
                  class="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                  @click="handleCartClick(product.id, $event)"
              >
                <ShoppingCart class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View More Button -->
      <div class="text-center mt-12">
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
