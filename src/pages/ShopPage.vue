<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Grid3x3, List, Heart, ShoppingCart, Filter, SlidersHorizontal, X } from 'lucide-vue-next'

const router = useRouter()

interface Product {
  id: number
  name: string
  price: number
  productType: string
  waterType: string | null
  difficulty: string | null
  status: string
  sellerId: number
  sellerNickName: string
  sellerInitial: string
  averageRating: number
  reviewCount: number
  tags: string[]
  emoji: string
  wishlisted: boolean
}

const allProducts = ref<Product[]>([
  { id: 101, name: 'L-333 킹로얄 플레코 치어', price: 35000, productType: 'FISH', waterType: 'FRESHWATER', difficulty: 'INTERMEDIATE', status: 'ACTIVE', sellerId: 1, sellerNickName: '플레코마스터', sellerInitial: '플', averageRating: 4.9, reviewCount: 47, tags: ['플레코', 'L번호'], emoji: '🐠', wishlisted: false },
  { id: 102, name: 'CRS SS급 크리스탈 레드 새우 5마리', price: 45000, productType: 'INVERTEBRATE', waterType: 'FRESHWATER', difficulty: 'ADVANCED', status: 'ACTIVE', sellerId: 2, sellerNickName: '새우천국', sellerInitial: '새', averageRating: 5.0, reviewCount: 89, tags: ['CRS', 'SS급'], emoji: '🦐', wishlisted: true },
  { id: 103, name: '부세파란드라 미니 3포기', price: 28000, productType: 'PLANT', waterType: 'FRESHWATER', difficulty: 'INTERMEDIATE', status: 'ACTIVE', sellerId: 4, sellerNickName: '수초팜', sellerInitial: '수', averageRating: 4.8, reviewCount: 57, tags: ['부세파란드라'], emoji: '🌿', wishlisted: false },
  { id: 104, name: 'ADA 뉴 아마조니아 소일 9L', price: 48000, productType: 'EQUIPMENT', waterType: null, difficulty: null, status: 'ACTIVE', sellerId: 4, sellerNickName: '수초팜', sellerInitial: '수', averageRating: 4.9, reviewCount: 88, tags: ['소일', '수초용'], emoji: '🪨', wishlisted: false },
  { id: 105, name: '블루다이아몬드 디스커스 단마리', price: 65000, productType: 'FISH', waterType: 'FRESHWATER', difficulty: 'ADVANCED', status: 'ACTIVE', sellerId: 3, sellerNickName: '디스커스월드', sellerInitial: '디', averageRating: 4.8, reviewCount: 41, tags: ['디스커스'], emoji: '🐟', wishlisted: false },
  { id: 106, name: '자바 모스 (탁구공×2)', price: 12000, productType: 'PLANT', waterType: 'FRESHWATER', difficulty: 'BEGINNER', status: 'ACTIVE', sellerId: 4, sellerNickName: '수초팜', sellerInitial: '수', averageRating: 4.6, reviewCount: 134, tags: ['모스', '새우용'], emoji: '🌱', wishlisted: false },
  { id: 107, name: '레드 체리 새우 20마리', price: 15000, productType: 'INVERTEBRATE', waterType: 'FRESHWATER', difficulty: 'BEGINNER', status: 'ACTIVE', sellerId: 2, sellerNickName: '새우천국', sellerInitial: '새', averageRating: 4.7, reviewCount: 142, tags: ['RCS', '입문용'], emoji: '🦐', wishlisted: false },
  { id: 108, name: 'CO2 확산기 (인라인형)', price: 25000, productType: 'EQUIPMENT', waterType: null, difficulty: null, status: 'ACTIVE', sellerId: 4, sellerNickName: '수초팜', sellerInitial: '수', averageRating: 4.7, reviewCount: 41, tags: ['CO2'], emoji: '💨', wishlisted: false },
  { id: 109, name: '히카리 플레코 펠렛 80g', price: 12000, productType: 'ACCESSORY', waterType: null, difficulty: null, status: 'ACTIVE', sellerId: 1, sellerNickName: '플레코마스터', sellerInitial: '플', averageRating: 4.8, reviewCount: 55, tags: ['사료', '플레코'], emoji: '🍃', wishlisted: false },
  { id: 110, name: 'L-046 메두사 플레코 5cm', price: 55000, productType: 'FISH', waterType: 'FRESHWATER', difficulty: 'INTERMEDIATE', status: 'SOLD_OUT', sellerId: 1, sellerNickName: '플레코마스터', sellerInitial: '플', averageRating: 5.0, reviewCount: 23, tags: ['플레코', '희귀종'], emoji: '🐠', wishlisted: false },
  { id: 111, name: '새우 전용 소일 3L', price: 22000, productType: 'EQUIPMENT', waterType: null, difficulty: null, status: 'ACTIVE', sellerId: 2, sellerNickName: '새우천국', sellerInitial: '새', averageRating: 4.8, reviewCount: 73, tags: ['새우소일'], emoji: '🪨', wishlisted: false },
  { id: 112, name: '아누비아스 나나 5포기', price: 18000, productType: 'PLANT', waterType: 'FRESHWATER', difficulty: 'BEGINNER', status: 'ACTIVE', sellerId: 4, sellerNickName: '수초팜', sellerInitial: '수', averageRating: 4.7, reviewCount: 98, tags: ['아누비아스'], emoji: '🍀', wishlisted: false },
  { id: 113, name: '디스커스 전용 히터 200W', price: 35000, productType: 'EQUIPMENT', waterType: null, difficulty: null, status: 'ACTIVE', sellerId: 3, sellerNickName: '디스커스월드', sellerInitial: '디', averageRating: 4.6, reviewCount: 32, tags: ['히터'], emoji: '🌡️', wishlisted: false },
  { id: 114, name: '블랙 킹콩 새우 3마리', price: 60000, productType: 'INVERTEBRATE', waterType: 'FRESHWATER', difficulty: 'ADVANCED', status: 'ACTIVE', sellerId: 2, sellerNickName: '새우천국', sellerInitial: '새', averageRating: 5.0, reviewCount: 34, tags: ['BKK', '희귀종'], emoji: '🦐', wishlisted: false },
  { id: 115, name: '수초 액비 세트 3종', price: 35000, productType: 'EQUIPMENT', waterType: null, difficulty: null, status: 'ACTIVE', sellerId: 4, sellerNickName: '수초팜', sellerInitial: '수', averageRating: 4.8, reviewCount: 63, tags: ['액비', '비료'], emoji: '💧', wishlisted: false },
  { id: 116, name: '골든 아이 코리도라스 5마리', price: 32000, productType: 'FISH', waterType: 'FRESHWATER', difficulty: 'BEGINNER', status: 'ACTIVE', sellerId: 5, sellerNickName: '코리팜', sellerInitial: '코', averageRating: 4.7, reviewCount: 28, tags: ['코리도라스', '청소부'], emoji: '🐟', wishlisted: false },
])

const productTypes = [
  { key: 'FISH', label: '어류', emoji: '🐠', count: 4 },
  { key: 'INVERTEBRATE', label: '새우/갑각류', emoji: '🦐', count: 3 },
  { key: 'PLANT', label: '수초', emoji: '🌿', count: 3 },
  { key: 'EQUIPMENT', label: '용품/장비', emoji: '🔧', count: 5 },
  { key: 'ACCESSORY', label: '소품', emoji: '🪨', count: 1 },
]

const selectedTypes = ref<string[]>([])
const selectedWaterType = ref('')
const selectedDifficulty = ref('')
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const priceMinInput = ref<number | null>(null)
const priceMaxInput = ref<number | null>(null)
const sortBy = ref('최신순')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = 12

const toggleType = (key: string) => {
  const idx = selectedTypes.value.indexOf(key)
  if (idx === -1) selectedTypes.value.push(key)
  else selectedTypes.value.splice(idx, 1)
  currentPage.value = 1
}

const toggleWaterType = (key: string) => {
  selectedWaterType.value = selectedWaterType.value === key ? '' : key
  currentPage.value = 1
}

const toggleDifficulty = (key: string) => {
  selectedDifficulty.value = selectedDifficulty.value === key ? '' : key
  currentPage.value = 1
}

const applyPrice = () => {
  priceMin.value = priceMinInput.value
  priceMax.value = priceMaxInput.value
  currentPage.value = 1
}

const resetFilters = () => {
  selectedTypes.value = []
  selectedWaterType.value = ''
  selectedDifficulty.value = ''
  priceMin.value = null
  priceMax.value = null
  priceMinInput.value = null
  priceMaxInput.value = null
  currentPage.value = 1
}

const filteredProducts = computed(() => {
  let list = [...allProducts.value]
  if (selectedTypes.value.length > 0) {
    list = list.filter(p => selectedTypes.value.includes(p.productType))
  }
  if (selectedWaterType.value) {
    list = list.filter(p => p.waterType === selectedWaterType.value)
  }
  if (selectedDifficulty.value) {
    list = list.filter(p => p.difficulty === selectedDifficulty.value)
  }
  if (priceMin.value !== null) {
    list = list.filter(p => p.price >= priceMin.value!)
  }
  if (priceMax.value !== null) {
    list = list.filter(p => p.price <= priceMax.value!)
  }
  if (sortBy.value === '낮은 가격순') list.sort((a, b) => a.price - b.price)
  else if (sortBy.value === '높은 가격순') list.sort((a, b) => b.price - a.price)
  else if (sortBy.value === '인기순') list.sort((a, b) => b.reviewCount - a.reviewCount)
  return list
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize))

const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

const activeFilterChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  selectedTypes.value.forEach(t => {
    const type = productTypes.find(pt => pt.key === t)
    if (type) chips.push({ key: 'type:' + t, label: type.label })
  })
  if (selectedWaterType.value) {
    const map: Record<string, string> = { FRESHWATER: '담수', SALTWATER: '해수', BRACKISH: '기수' }
    chips.push({ key: 'water', label: map[selectedWaterType.value] })
  }
  if (selectedDifficulty.value) {
    const map: Record<string, string> = { BEGINNER: '입문', INTERMEDIATE: '중급', ADVANCED: '고급' }
    chips.push({ key: 'diff', label: map[selectedDifficulty.value] })
  }
  if (priceMin.value !== null) chips.push({ key: 'priceMin', label: `₩${priceMin.value.toLocaleString()} 이상` })
  if (priceMax.value !== null) chips.push({ key: 'priceMax', label: `₩${priceMax.value.toLocaleString()} 이하` })
  return chips
})

const removeChip = (key: string) => {
  if (key.startsWith('type:')) {
    const t = key.replace('type:', '')
    selectedTypes.value = selectedTypes.value.filter(x => x !== t)
  } else if (key === 'water') selectedWaterType.value = ''
  else if (key === 'diff') selectedDifficulty.value = ''
  else if (key === 'priceMin') { priceMin.value = null; priceMinInput.value = null }
  else if (key === 'priceMax') { priceMax.value = null; priceMaxInput.value = null }
  currentPage.value = 1
}

const toggleWishlist = (product: Product, e: Event) => {
  e.stopPropagation()
  product.wishlisted = !product.wishlisted
}

const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    FISH: 'bg-sky-100 text-sky-700',
    PLANT: 'bg-green-100 text-green-700',
    INVERTEBRATE: 'bg-purple-100 text-purple-700',
    EQUIPMENT: 'bg-amber-100 text-amber-700',
    ACCESSORY: 'bg-pink-100 text-pink-700',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600'
}

const typeLabelMap: Record<string, string> = {
  FISH: '어류', PLANT: '수초', INVERTEBRATE: '새우/갑각류', EQUIPMENT: '용품/장비', ACCESSORY: '소품'
}

const formatPrice = (price: number) => '₩' + price.toLocaleString()
</script>

<template>
  <main class="min-h-screen bg-slate-50 pt-20 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex gap-8">

        <!-- Sidebar -->
        <aside class="hidden lg:block w-60 flex-shrink-0">
          <div class="sticky top-24 space-y-6">
            <!-- 상품 유형 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">상품 유형</p>
              <div class="space-y-1">
                <button
                    v-for="type in productTypes"
                    :key="type.key"
                    @click="toggleType(type.key)"
                    class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors"
                    :class="selectedTypes.includes(type.key)
                    ? 'bg-sky-50 text-sky-600 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50'"
                >
                  <span>{{ type.emoji }} {{ type.label }}</span>
                  <span class="text-xs text-slate-400">{{ type.count }}</span>
                </button>
              </div>
            </div>

            <!-- 수질 -->
            <div class="mt-6 pt-6 border-t border-sky-50">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">수질</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="w in [{ key: 'FRESHWATER', label: '담수' }, { key: 'SALTWATER', label: '해수' }, { key: 'BRACKISH', label: '기수' }]"
                        :key="w.key" @click="toggleWaterType(w.key)"
                        class="text-sm px-3 py-1.5 rounded-full transition-colors"
                        :class="selectedWaterType === w.key ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'">
                  {{ w.label }}
                </button>
              </div>
            </div>

            <!-- 난이도 -->
            <div class="mt-6 pt-6 border-t border-sky-50">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">난이도</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="d in [{ key: 'BEGINNER', label: '입문' }, { key: 'INTERMEDIATE', label: '중급' }, { key: 'ADVANCED', label: '고급' }]"
                        :key="d.key" @click="toggleDifficulty(d.key)"
                        class="text-sm px-3 py-1.5 rounded-full transition-colors"
                        :class="selectedDifficulty === d.key ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'">
                  {{ d.label }}
                </button>
              </div>
            </div>

            <!-- 가격대 -->
            <div class="mt-6 pt-6 border-t border-sky-50">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">가격대</p>
              <div class="space-y-2">
                <input v-model.number="priceMinInput" type="number" placeholder="최소 금액"
                       class="w-full border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <input v-model.number="priceMaxInput" type="number" placeholder="최대 금액"
                       class="w-full border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <button @click="applyPrice"
                        class="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors">
                  적용
                </button>
              </div>
            </div>

            <!-- 초기화 -->
            <button @click="resetFilters" class="text-xs text-sky-500 hover:underline mt-2">
              필터 초기화
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Top bar -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black text-slate-900">전체 상품</h1>
              <span class="text-slate-400 text-sm">{{ filteredProducts.length }}개</span>
            </div>
            <div class="flex items-center gap-3">
              <select v-model="sortBy"
                      class="border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                <option v-for="opt in ['최신순', '인기순', '낮은 가격순', '높은 가격순']" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <div class="flex items-center gap-1">
                <button @click="viewMode = 'grid'"
                        class="p-2 rounded-lg transition-colors"
                        :class="viewMode === 'grid' ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-50'">
                  <Grid3x3 class="w-4 h-4" />
                </button>
                <button @click="viewMode = 'list'"
                        class="p-2 rounded-lg transition-colors"
                        :class="viewMode === 'list' ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-50'">
                  <List class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Active filter chips -->
          <div v-if="activeFilterChips.length > 0" class="flex gap-2 flex-wrap mb-5">
            <span v-for="chip in activeFilterChips" :key="chip.key"
                  class="flex items-center gap-1.5 bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full">
              {{ chip.label }}
              <button @click="removeChip(chip.key)" class="hover:text-sky-900">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <div v-for="product in pagedProducts" :key="product.id"
                 @click="router.push(`/products/${product.id}`)"
                 class="rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200 bg-white">
              <!-- Image -->
              <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center">
                <span class="text-5xl">{{ product.emoji }}</span>
                <!-- Sold out overlay -->
                <div v-if="product.status === 'SOLD_OUT'"
                     class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                </div>
                <!-- Type badge -->
                <span class="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">
                  {{ typeLabelMap[product.productType] }}
                </span>
                <!-- Wishlist -->
                <button @click="toggleWishlist(product, $event)"
                        class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition-colors hover:bg-white">
                  <Heart class="w-3.5 h-3.5 transition-colors"
                         :class="product.wishlisted ? 'fill-sky-500 text-sky-500' : 'text-slate-400'"
                  />
                </button>
              </div>
              <!-- Content -->
              <div class="p-4">
                <div class="flex items-center gap-1.5 mb-2">
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                    {{ product.sellerInitial }}
                  </div>
                  <button @click.stop="router.push(`/store/${product.sellerId}`)"
                          class="text-xs text-slate-400 hover:text-sky-500 transition-colors truncate">
                    {{ product.sellerNickName }}
                  </button>
                </div>
                <p class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{{ product.name }}</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in product.tags.slice(0, 2)" :key="tag"
                        class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                    {{ tag }}
                  </span>
                </div>
                <div class="flex items-end justify-between mt-2">
                  <span class="text-lg font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                  <span class="flex items-center gap-0.5 text-xs text-slate-400">
                    <span class="text-amber-400">★</span>
                    {{ product.averageRating }} ({{ product.reviewCount }})
                  </span>
                </div>
                <button @click.stop
                        class="w-full mt-3 py-2 text-sm font-semibold rounded-xl transition-colors"
                        :class="product.status === 'SOLD_OUT'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'">
                  장바구니
                </button>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="space-y-1">
            <div v-for="product in pagedProducts" :key="product.id"
                 @click="router.push(`/products/${product.id}`)"
                 class="flex items-center gap-4 py-4 border-b border-sky-50 cursor-pointer hover:bg-sky-50/40 rounded-xl px-3 transition-colors">
              <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center flex-shrink-0 text-3xl relative overflow-hidden">
                {{ product.emoji }}
                <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span class="text-white text-[10px] font-black">품절</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">
                    {{ typeLabelMap[product.productType] }}
                  </span>
                  <button @click.stop="router.push(`/store/${product.sellerId}`)"
                          class="text-xs text-slate-400 hover:text-sky-500 transition-colors">
                    {{ product.sellerNickName }}
                  </button>
                </div>
                <p class="text-sm font-semibold text-slate-800 truncate">{{ product.name }}</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tag in product.tags.slice(0, 2)" :key="tag"
                        class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                    {{ tag }}
                  </span>
                </div>
                <span class="flex items-center gap-0.5 text-xs text-slate-400 mt-1">
                  <span class="text-amber-400">★</span>
                  {{ product.averageRating }} ({{ product.reviewCount }})
                </span>
              </div>
              <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <span class="font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                <button @click.stop
                        class="px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors"
                        :class="product.status === 'SOLD_OUT'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'">
                  장바구니
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center gap-1 mt-10">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                    class="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                    :class="currentPage === page
                ? 'bg-sky-500 text-white'
                : 'border border-sky-100 text-slate-500 hover:bg-sky-50'">
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
