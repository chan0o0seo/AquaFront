<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Grid3x3, List, Heart, ShoppingCart, X, Search, Check } from 'lucide-vue-next'
import SearchBar from '@/components/search/SearchBar.vue'
import {
  productApi, searchApi,
  getThumbnailUrl,
  type ProductSummary, type ProductType, type WaterType, type Difficulty,
  type SearchResult, type SearchSortOption,
} from '@/api'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

// ─── 검색 키워드 ───────────────────────────────────────
const keyword = ref((route.query.keyword as string) || '')
const isKeywordMode = computed(() => keyword.value.trim().length > 0)

// ─── 공통 상태 ─────────────────────────────────────────
const isLoading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

// ─── 필터 (browse 모드) ────────────────────────────────
const selectedWaterType = ref('')
const selectedDifficulty = ref('')
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const priceMinInput = ref<number | null>(null)
const priceMaxInput = ref<number | null>(null)
const sortBy = ref('최신순')

// ─── 검색 모드 상태 ────────────────────────────────────
const searchResults = ref<SearchResult[]>([])
const searchSortOption = ref<SearchSortOption>('relevance')
const searchPage = ref(0)
const searchHasMore = ref(false)
const PAGE_SIZE = 20

// ─── 브라우즈 모드 상태 ────────────────────────────────
const allProducts = ref<ProductSummary[]>([])
const currentPage = ref(1)
const PAGE_BROWSE = 16

// ─── 공통 선택 productType (두 모드 공유) ──────────────
const activeTypeFilter = ref('')

// ─── 무한스크롤 (검색 모드) ────────────────────────────
const sentinelRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

// ─── 요청 ID (중복/stale 방지) ─────────────────────────
let currentRequestId = 0

// ─── 상수 ─────────────────────────────────────────────
const productTypes = [
  { key: 'FISH', label: '어류', emoji: '🐠' },
  { key: 'INVERTEBRATE', label: '새우/갑각류', emoji: '🦐' },
  { key: 'PLANT', label: '수초', emoji: '🌿' },
  { key: 'EQUIPMENT', label: '용품/장비', emoji: '🔧' },
  { key: 'FOOD', label: '사료', emoji: '🍃' },
  { key: 'ACCESSORY', label: '소품', emoji: '🪨' },
]
const typeEmojiMap: Record<string, string> = {
  FISH: '🐠', PLANT: '🌿', INVERTEBRATE: '🦐', EQUIPMENT: '🔧', ACCESSORY: '🪨', FOOD: '🍃',
}
const typeLabelMap: Record<string, string> = {
  FISH: '어류', PLANT: '수초', INVERTEBRATE: '새우/갑각류', EQUIPMENT: '용품/장비', ACCESSORY: '소품', FOOD: '사료',
}

// ─── 위시리스트 ────────────────────────────────────────
const wishlistedIds = ref(new Set<number>())

const loadWishlist = async () => {
  if (!isLoggedIn.value) return
  try {
    const items = await productApi.getMyWishlist()
    wishlistedIds.value = new Set(items.map((p: ProductSummary) => p.id))
  } catch {
    // 미로그인 등 무시
  }
}

const isWishlisted = (id: number | string) => wishlistedIds.value.has(Number(id))

const toggleWishlistById = async (id: number | string, e: Event) => {
  e.stopPropagation()
  if (!isLoggedIn.value) { router.push('/login'); return }
  const numId = Number(id)
  // 낙관적 업데이트
  const wasWishlisted = wishlistedIds.value.has(numId)
  wasWishlisted ? wishlistedIds.value.delete(numId) : wishlistedIds.value.add(numId)
  try {
    const isNowWishlisted = await productApi.toggleWishlist(numId)
    // 서버 응답으로 정확한 상태 동기화
    isNowWishlisted ? wishlistedIds.value.add(numId) : wishlistedIds.value.delete(numId)
  } catch {
    // 실패 시 롤백
    wasWishlisted ? wishlistedIds.value.add(numId) : wishlistedIds.value.delete(numId)
  }
}

// ─── 브라우즈 모드 정렬 ────────────────────────────────
const sortParam = computed(() => {
  switch (sortBy.value) {
    case '인기순': return 'reviewCount,desc'
    case '낮은 가격순': return 'price,asc'
    case '높은 가격순': return 'price,desc'
    default: return 'createdAt,desc'
  }
})

// ─── 검색 모드 정렬 옵션 ───────────────────────────────
const searchSortOptions: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: '관련도순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
]

// ─── 브라우즈 모드 computed ────────────────────────────
const totalElements = computed(() => allProducts.value.length)
const totalPages = computed(() => Math.ceil(totalElements.value / PAGE_BROWSE))
const pagedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_BROWSE
  return allProducts.value.slice(start, start + PAGE_BROWSE)
})

// ─── 검색 모드: Elasticsearch ──────────────────────────
const fetchSearchResults = async (reset = true) => {
  if (!reset && isLoading.value) return

  const requestId = ++currentRequestId
  isLoading.value = true

  if (reset) {
    searchPage.value = 0
    searchResults.value = []
    searchHasMore.value = false
  }

  try {
    const data = await searchApi.search({
      keyword: keyword.value,
      page: searchPage.value,
      size: PAGE_SIZE,
      sort: searchSortOption.value,
      productType: activeTypeFilter.value as ProductType || undefined,
    })

    if (requestId !== currentRequestId) return

    if (reset) {
      searchResults.value = data
    } else {
      searchResults.value = [...searchResults.value, ...data]
    }
    searchHasMore.value = data.length === PAGE_SIZE
  } catch (e) {
    if (requestId !== currentRequestId) return
    console.error('Search failed', e)
  } finally {
    if (requestId === currentRequestId) isLoading.value = false
  }
}

// ─── 브라우즈 모드: JPA ────────────────────────────────
const fetchBrowseProducts = async () => {
  const requestId = ++currentRequestId
  isLoading.value = true
  try {
    const data = await productApi.search({
      productType: activeTypeFilter.value as ProductType || undefined,
      waterType: selectedWaterType.value as WaterType || undefined,
      difficulty: selectedDifficulty.value as Difficulty || undefined,
      minPrice: priceMin.value ?? undefined,
      maxPrice: priceMax.value ?? undefined,
      sort: sortParam.value,
    })
    if (requestId !== currentRequestId) return
    allProducts.value = data
    currentPage.value = 1
  } catch (e) {
    if (requestId !== currentRequestId) return
    console.error('Fetch failed', e)
  } finally {
    if (requestId === currentRequestId) isLoading.value = false
  }
}

// ─── 통합 fetch ────────────────────────────────────────
const fetchProducts = (reset = true) => {
  if (isKeywordMode.value) {
    fetchSearchResults(reset)
  } else {
    fetchBrowseProducts()
  }
}

// ─── 검색 핸들러 ───────────────────────────────────────
const handleSearch = (searchKeyword: string) => {
  keyword.value = searchKeyword
  activeTypeFilter.value = ''
  searchSortOption.value = 'relevance'
  router.replace({
    path: '/shop',
    query: searchKeyword ? { keyword: searchKeyword } : {},
  })
  fetchProducts(true)
}

// ─── 필터 핸들러 ───────────────────────────────────────
const toggleType = (key: string) => {
  activeTypeFilter.value = activeTypeFilter.value === key ? '' : key
  currentPage.value = 1
  fetchProducts(true)
}

const toggleWaterType = (key: string) => {
  selectedWaterType.value = selectedWaterType.value === key ? '' : key
  currentPage.value = 1
  fetchBrowseProducts()
}

const toggleDifficulty = (key: string) => {
  selectedDifficulty.value = selectedDifficulty.value === key ? '' : key
  currentPage.value = 1
  fetchBrowseProducts()
}

const applyPrice = () => {
  priceMin.value = priceMinInput.value
  priceMax.value = priceMaxInput.value
  currentPage.value = 1
  fetchBrowseProducts()
}

const resetFilters = () => {
  activeTypeFilter.value = ''
  selectedWaterType.value = ''
  selectedDifficulty.value = ''
  priceMin.value = null
  priceMax.value = null
  priceMinInput.value = null
  priceMaxInput.value = null
  currentPage.value = 1
  fetchProducts(true)
}

const resetKeyword = () => {
  keyword.value = ''
  router.replace({ path: '/shop' })
  fetchBrowseProducts()
}

// ─── 정렬 변경 (검색 모드) ────────────────────────────
const handleSearchSortChange = (sort: SearchSortOption) => {
  searchSortOption.value = sort
  fetchSearchResults(true)
}

// ─── 브라우즈 정렬 watch ───────────────────────────────
watch(sortBy, () => fetchBrowseProducts())

// ─── 무한스크롤 (검색 모드) ────────────────────────────
const loadMore = () => {
  if (!searchHasMore.value || isLoading.value) return
  searchPage.value++
  fetchSearchResults(false)
}

const setupObserver = () => {
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && searchHasMore.value && !isLoading.value) loadMore()
    },
    { rootMargin: '200px' }
  )
  observer.observe(sentinelRef.value)
}

// ─── 페이지네이션 (브라우즈 모드) ─────────────────────
const changePage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── URL keyword watcher (뒤로가기 등) ────────────────
watch(
  () => route.query.keyword,
  (newKeyword) => {
    const kw = typeof newKeyword === 'string' ? newKeyword : ''
    if (kw === keyword.value) return
    keyword.value = kw
    fetchProducts(true)
  }
)

// ─── 위시리스트 ────────────────────────────────────────
const toggleWishlist = (product: ProductSummary, e: Event) => toggleWishlistById(product.id, e)

// ─── 장바구니 토스트 ───────────────────────────────────
const showAddedToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const addToCart = async (product: ProductSummary | SearchResult, e: Event) => {
  e.stopPropagation()
  if (product.status === 'SOLD_OUT') return
  await cartStore.addItem(Number(product.id))
  showAddedToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { showAddedToast.value = false }, 2000)
}

// ─── 검색결과 카드 클릭 ────────────────────────────────
const goToProduct = (id: string | number) => {
  router.push(`/products/${id}`)
}

// ─── 활성 필터 칩 ─────────────────────────────────────
const activeFilterChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  if (activeTypeFilter.value) {
    const t = productTypes.find(p => p.key === activeTypeFilter.value)
    if (t) chips.push({ key: 'type', label: `${t.emoji} ${t.label}` })
  }
  if (!isKeywordMode.value) {
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
  }
  return chips
})

const removeChip = (key: string) => {
  if (key === 'type') { activeTypeFilter.value = ''; fetchProducts(true) }
  else if (key === 'water') { selectedWaterType.value = ''; fetchBrowseProducts() }
  else if (key === 'diff') { selectedDifficulty.value = ''; fetchBrowseProducts() }
  else if (key === 'priceMin') { priceMin.value = null; priceMinInput.value = null; fetchBrowseProducts() }
  else if (key === 'priceMax') { priceMax.value = null; priceMaxInput.value = null; fetchBrowseProducts() }
  currentPage.value = 1
}

// ─── UI 헬퍼 ──────────────────────────────────────────
const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    FISH: 'bg-sky-100 text-sky-700', PLANT: 'bg-green-100 text-green-700',
    INVERTEBRATE: 'bg-purple-100 text-purple-700', EQUIPMENT: 'bg-amber-100 text-amber-700',
    ACCESSORY: 'bg-pink-100 text-pink-700', FOOD: 'bg-lime-100 text-lime-700',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600'
}

const formatPrice = (price: number) => '₩' + price.toLocaleString()

onMounted(() => {
  fetchProducts(true)
  loadWishlist()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
  currentRequestId++
})
</script>

<template>
  <div>
  <main class="min-h-screen bg-slate-50 pt-16 pb-16">
    <!-- 검색바 -->
    <SearchBar v-model="keyword" @search="handleSearch" />

    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8">

        <!-- Sidebar -->
        <aside class="hidden lg:block w-56 flex-shrink-0">
          <div class="sticky top-28 space-y-6">

            <!-- 상품 유형 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">상품 유형</p>
              <div class="space-y-1">
                <button
                  v-for="type in productTypes"
                  :key="type.key"
                  @click="toggleType(type.key)"
                  class="w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="activeTypeFilter === type.key
                    ? 'bg-sky-50 text-sky-600 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100'"
                >
                  {{ type.emoji }} {{ type.label }}
                </button>
              </div>
            </div>

            <!-- 아래 필터는 브라우즈 모드에서만 -->
            <template v-if="!isKeywordMode">
              <!-- 수질 -->
              <div class="pt-5 border-t border-sky-50">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">수질</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="w in [{ key: 'FRESHWATER', label: '담수' }, { key: 'SALTWATER', label: '해수' }, { key: 'BRACKISH', label: '기수' }]"
                    :key="w.key"
                    @click="toggleWaterType(w.key)"
                    class="text-xs px-3 py-1.5 rounded-full transition-colors"
                    :class="selectedWaterType === w.key ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'"
                  >
                    {{ w.label }}
                  </button>
                </div>
              </div>

              <!-- 난이도 -->
              <div class="pt-5 border-t border-sky-50">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">난이도</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="d in [{ key: 'BEGINNER', label: '입문' }, { key: 'INTERMEDIATE', label: '중급' }, { key: 'ADVANCED', label: '고급' }]"
                    :key="d.key"
                    @click="toggleDifficulty(d.key)"
                    class="text-xs px-3 py-1.5 rounded-full transition-colors"
                    :class="selectedDifficulty === d.key ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'"
                  >
                    {{ d.label }}
                  </button>
                </div>
              </div>

              <!-- 가격대 -->
              <div class="pt-5 border-t border-sky-50">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">가격대</p>
                <div class="space-y-2">
                  <input
                    v-model.number="priceMinInput"
                    type="number"
                    placeholder="최소 금액"
                    class="w-full border border-sky-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <input
                    v-model.number="priceMaxInput"
                    type="number"
                    placeholder="최대 금액"
                    class="w-full border border-sky-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button
                    @click="applyPrice"
                    class="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    적용
                  </button>
                </div>
              </div>
            </template>

            <button @click="resetFilters" class="text-xs text-sky-500 hover:underline">
              필터 초기화
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">

          <!-- Top bar -->
          <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <!-- 제목 / 검색어 표시 -->
            <div class="flex items-center gap-2 flex-wrap">
              <template v-if="isKeywordMode">
                <span class="text-lg font-black text-slate-900">"{{ keyword }}"</span>
                <span class="text-slate-400 text-sm">검색 결과 {{ searchResults.length }}개<template v-if="searchHasMore">+</template></span>
                <button @click="resetKeyword" class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  <X class="w-3 h-3" /> 검색 초기화
                </button>
              </template>
              <template v-else>
                <h1 class="text-xl font-black text-slate-900">전체 상품</h1>
                <span class="text-slate-400 text-sm">{{ totalElements }}개</span>
              </template>
            </div>

            <div class="flex items-center gap-2">
              <!-- 검색 모드 정렬 -->
              <template v-if="isKeywordMode">
                <div class="flex items-center gap-1 bg-white rounded-xl border border-sky-100 p-1">
                  <button
                    v-for="opt in searchSortOptions"
                    :key="opt.value"
                    @click="handleSearchSortChange(opt.value)"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    :class="searchSortOption === opt.value
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </template>
              <!-- 브라우즈 모드 정렬 -->
              <template v-else>
                <select
                  v-model="sortBy"
                  class="border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                >
                  <option v-for="opt in ['최신순', '인기순', '낮은 가격순', '높은 가격순']" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </template>

              <!-- 뷰 모드 -->
              <div class="flex items-center gap-1 bg-white border border-sky-100 rounded-lg p-1">
                <button
                  @click="viewMode = 'grid'"
                  class="p-1.5 rounded-md transition-colors"
                  :class="viewMode === 'grid' ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-50'"
                >
                  <Grid3x3 class="w-4 h-4" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  class="p-1.5 rounded-md transition-colors"
                  :class="viewMode === 'list' ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-50'"
                >
                  <List class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 활성 필터 칩 -->
          <div v-if="activeFilterChips.length > 0" class="flex gap-2 flex-wrap mb-4">
            <span
              v-for="chip in activeFilterChips"
              :key="chip.key"
              class="flex items-center gap-1.5 bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full"
            >
              {{ chip.label }}
              <button @click="removeChip(chip.key)" class="hover:text-sky-900">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>

          <!-- ══ 검색 모드 결과 ══ -->
          <template v-if="isKeywordMode">
            <!-- 로딩 스켈레톤 -->
            <div v-if="isLoading && searchResults.length === 0"
              :class="viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'">
              <div
                v-for="i in 8" :key="i"
                :class="viewMode === 'grid'
                  ? 'rounded-2xl bg-slate-200 animate-pulse aspect-square'
                  : 'h-24 rounded-2xl bg-slate-200 animate-pulse'"
              />
            </div>

            <!-- 빈 결과 -->
            <div v-else-if="!isLoading && searchResults.length === 0" class="flex flex-col items-center py-24 text-slate-400">
              <Search class="w-12 h-12 mb-3 text-slate-200" />
              <p class="font-medium">"{{ keyword }}" 검색 결과가 없어요</p>
              <p class="text-sm mt-1">다른 키워드나 필터로 시도해보세요</p>
              <button @click="resetKeyword" class="mt-4 text-sm text-sky-500 hover:underline">전체 상품 보기</button>
            </div>

            <!-- 검색 결과 그리드 -->
            <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'">
              <div
                v-for="product in searchResults"
                :key="product.id"
                @click="goToProduct(product.id)"
                class="cursor-pointer"
                :class="viewMode === 'grid'
                  ? 'rounded-2xl border border-sky-100 bg-white overflow-hidden hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200'
                  : 'flex items-center gap-4 py-3 border-b border-sky-50 hover:bg-sky-50/40 rounded-xl px-3 transition-colors'"
              >
                <!-- Grid 이미지 -->
                <template v-if="viewMode === 'grid'">
                  <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
                    <img v-if="product.thumbnailUrl" :src="product.thumbnailUrl" :alt="product.name" class="w-full h-full object-cover" />
                    <span v-else class="absolute inset-0 flex items-center justify-center text-4xl">{{ typeEmojiMap[product.productType] ?? '📦' }}</span>
                    <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                    </div>
                    <span class="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">
                      {{ typeLabelMap[product.productType] ?? product.productType }}
                    </span>
                    <button
                      @click="toggleWishlistById(product.id, $event)"
                      class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart class="w-3.5 h-3.5 transition-colors" :class="isWishlisted(product.id) ? 'fill-sky-500 text-sky-500' : 'text-slate-400'" />
                    </button>
                  </div>
                  <div class="p-3">
                    <p class="text-xs text-slate-400 mb-1">{{ product.sellerNickName }}</p>
                    <p class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{{ product.name }}</p>
                    <div class="flex flex-wrap gap-1 mb-2">
                      <span v-for="tag in product.tags.slice(0, 2)" :key="tag" class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">{{ tag }}</span>
                    </div>
                    <span class="text-base font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                    <button
                      @click="addToCart(product, $event)"
                      :disabled="product.status === 'SOLD_OUT'"
                      class="w-full mt-2 py-1.5 text-sm font-semibold rounded-xl transition-colors"
                      :class="product.status === 'SOLD_OUT' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white'"
                    >
                      장바구니
                    </button>
                  </div>
                </template>

                <!-- List 레이아웃 -->
                <template v-else>
                  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex-shrink-0 overflow-hidden relative">
                    <img v-if="product.thumbnailUrl" :src="product.thumbnailUrl" :alt="product.name" class="w-full h-full object-cover" />
                    <span v-else class="absolute inset-0 flex items-center justify-center text-2xl">{{ typeEmojiMap[product.productType] ?? '📦' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">{{ typeLabelMap[product.productType] }}</span>
                      <span class="text-xs text-slate-400">{{ product.sellerNickName }}</span>
                    </div>
                    <p class="text-sm font-semibold text-slate-800 truncate">{{ product.name }}</p>
                    <div class="flex gap-1 mt-1">
                      <span v-for="tag in product.tags.slice(0, 2)" :key="tag" class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">{{ tag }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button @click="toggleWishlistById(product.id, $event)" class="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                      <Heart class="w-4 h-4 transition-colors" :class="isWishlisted(product.id) ? 'fill-sky-500 text-sky-500' : 'text-slate-300'" />
                    </button>
                    <span class="font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                    <button
                      @click="addToCart(product, $event)"
                      :disabled="product.status === 'SOLD_OUT'"
                      class="px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors"
                      :class="product.status === 'SOLD_OUT' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white'"
                    >
                      장바구니
                    </button>
                  </div>
                </template>
              </div>

              <!-- 더 로딩 중 스켈레톤 -->
              <template v-if="isLoading && searchResults.length > 0">
                <div v-for="i in 4" :key="`skel-${i}`"
                  :class="viewMode === 'grid' ? 'rounded-2xl bg-slate-200 animate-pulse aspect-square' : 'h-20 rounded-2xl bg-slate-200 animate-pulse'" />
              </template>
            </div>

            <!-- 무한스크롤 센티넬 -->
            <div ref="sentinelRef" class="h-4 mt-4" />
            <p v-if="!searchHasMore && searchResults.length > 0" class="text-center text-slate-400 text-sm py-6">모든 결과를 불러왔어요 🐠</p>
          </template>

          <!-- ══ 브라우즈 모드 결과 ══ -->
          <template v-else>
            <!-- 로딩 -->
            <div v-if="isLoading" class="flex justify-center py-24">
              <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>

            <!-- 빈 결과 -->
            <div v-else-if="pagedProducts.length === 0" class="text-center py-24 text-slate-400">
              <ShoppingCart class="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p class="font-medium">조건에 맞는 상품이 없습니다</p>
              <button @click="resetFilters" class="mt-3 text-sm text-sky-500 hover:underline">필터 초기화</button>
            </div>

            <!-- Grid -->
            <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              <div
                v-for="product in pagedProducts"
                :key="product.id"
                @click="router.push(`/products/${product.id}`)"
                class="rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200 bg-white"
              >
                <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center overflow-hidden">
                  <img v-if="getThumbnailUrl(product)" :src="getThumbnailUrl(product)" :alt="product.name" class="w-full h-full object-cover" />
                  <span v-else class="text-5xl">{{ typeEmojiMap[product.productType] ?? '📦' }}</span>
                  <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                  </div>
                  <span class="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">
                    {{ typeLabelMap[product.productType] ?? product.productType }}
                  </span>
                  <button @click="toggleWishlist(product, $event)" class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white">
                    <Heart class="w-3.5 h-3.5 transition-colors" :class="isWishlisted(product.id) ? 'fill-sky-500 text-sky-500' : 'text-slate-400'" />
                  </button>
                </div>
                <div class="p-4">
                  <div class="flex items-center gap-1.5 mb-2">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                      {{ product.sellerNickName.charAt(0) }}
                    </div>
                    <button @click.stop="router.push(`/store/${product.sellerId}`)" class="text-xs text-slate-400 hover:text-sky-500 truncate">{{ product.sellerNickName }}</button>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">{{ product.name }}</p>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="tag in product.tags.slice(0, 2)" :key="tag" class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">{{ tag }}</span>
                  </div>
                  <div class="flex items-end justify-between mt-2">
                    <span class="text-lg font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                    <span class="flex items-center gap-0.5 text-xs text-slate-400">
                      <span class="text-amber-400">★</span> {{ product.averageRating }} ({{ product.reviewCount }})
                    </span>
                  </div>
                  <button
                    @click="addToCart(product, $event)"
                    class="w-full mt-3 py-2 text-sm font-semibold rounded-xl transition-colors"
                    :class="product.status === 'SOLD_OUT' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white'"
                  >
                    장바구니
                  </button>
                </div>
              </div>
            </div>

            <!-- List -->
            <div v-else class="space-y-1">
              <div
                v-for="product in pagedProducts"
                :key="product.id"
                @click="router.push(`/products/${product.id}`)"
                class="flex items-center gap-4 py-4 border-b border-sky-50 cursor-pointer hover:bg-sky-50/40 rounded-xl px-3 transition-colors"
              >
                <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center flex-shrink-0 text-3xl relative overflow-hidden">
                  <img v-if="getThumbnailUrl(product)" :src="getThumbnailUrl(product)" :alt="product.name" class="w-full h-full object-cover" />
                  <span v-else>{{ typeEmojiMap[product.productType] ?? '📦' }}</span>
                  <div v-if="product.status === 'SOLD_OUT'" class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <span class="text-white text-[10px] font-black">품절</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="typeBadgeClass(product.productType)">{{ typeLabelMap[product.productType] }}</span>
                    <button @click.stop="router.push(`/store/${product.sellerId}`)" class="text-xs text-slate-400 hover:text-sky-500">{{ product.sellerNickName }}</button>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ product.name }}</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span v-for="tag in product.tags.slice(0, 2)" :key="tag" class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">{{ tag }}</span>
                  </div>
                  <span class="flex items-center gap-0.5 text-xs text-slate-400 mt-1">
                    <span class="text-amber-400">★</span> {{ product.averageRating }} ({{ product.reviewCount }})
                  </span>
                </div>
                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                  <span class="font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                  <button
                    @click="addToCart(product, $event)"
                    class="px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors"
                    :class="product.status === 'SOLD_OUT' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white'"
                  >
                    장바구니
                  </button>
                </div>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="totalPages > 1" class="flex justify-center gap-1 mt-10">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="changePage(page)"
                class="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                :class="currentPage === page ? 'bg-sky-500 text-white' : 'border border-sky-100 text-slate-500 hover:bg-sky-50'"
              >
                {{ page }}
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>
  </main>

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
  </div>
</template>
