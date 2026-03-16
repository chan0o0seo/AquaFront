<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Grid3x3, List, Heart, ShoppingCart, X, Search, Check,
  SlidersHorizontal, Star, Loader2, ChevronDown, ChevronUp,
} from 'lucide-vue-next'
import SearchBar from '@/components/search/SearchBar.vue'
import {
  searchApi, productApi,
  type ProductType, type WaterType, type Difficulty,
  type SearchResult, type SearchSortOption,
} from '@/api'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const route  = useRoute()
const router = useRouter()
const cartStore  = useCartStore()
const authStore  = useAuthStore()
const { isLoggedIn, user: authUser } = storeToRefs(authStore)

// ─── 키워드 ────────────────────────────────────────────────
const keyword = ref((route.query.keyword as string) || '')

// ─── 결과 상태 ─────────────────────────────────────────────
const results    = ref<SearchResult[]>([])
const isLoading  = ref(false)
const page       = ref(0)
const hasMore    = ref(false)
const PAGE_SIZE  = 20

// ─── 뷰 ────────────────────────────────────────────────────
const viewMode         = ref<'grid' | 'list'>('grid')
const showMobileFilter = ref(false)

// ─── 요청 중복 방지 ────────────────────────────────────────
let currentRequestId = 0

// ─── 필터 상태 ─────────────────────────────────────────────
const activeTypeFilter     = ref('')
const sortOption           = ref<SearchSortOption>('relevance')
const selectedWaterType    = ref('')
const selectedDifficulty   = ref('')
const selectedIsCompatible = ref(false)
const selectedFreeShipping = ref(false)
const selectedMinRating    = ref<number | null>(null)
const pricePreset          = ref('')    // '' | '0-10000' | '10000-30000' | ...
const priceMinCustom       = ref<number | null>(null)
const priceMaxCustom       = ref<number | null>(null)

// ─── 상수 ──────────────────────────────────────────────────
const productTypes = [
  { key: 'FISH',        label: '어류',      emoji: '🐠' },
  { key: 'INVERTEBRATE',label: '새우/갑각류',emoji: '🦐' },
  { key: 'PLANT',       label: '수초',      emoji: '🌿' },
  { key: 'EQUIPMENT',   label: '용품/장비', emoji: '🔧' },
  { key: 'FOOD',        label: '사료',      emoji: '🍃' },
  { key: 'ACCESSORY',   label: '소품',      emoji: '🪨' },
]
const BIO_TYPES = new Set(['FISH', 'INVERTEBRATE', 'PLANT'])

const pricePresets = [
  { key: '0-10000',    label: '1만원 이하',  min: undefined, max: 10000 },
  { key: '10000-30000',label: '1~3만원',     min: 10000,     max: 30000 },
  { key: '30000-50000',label: '3~5만원',     min: 30000,     max: 50000 },
  { key: '50000-',     label: '5만원 이상',  min: 50000,     max: undefined },
]

const ratingOptions = [
  { value: 4.0, label: '4.0점 이상' },
  { value: 3.5, label: '3.5점 이상' },
  { value: 3.0, label: '3.0점 이상' },
]

const sortOptions: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance',  label: '관련도순' },
  { value: 'price_asc',  label: '낮은가격순' },
  { value: 'price_desc', label: '높은가격순' },
  { value: 'rating_desc',label: '별점순' },
  { value: 'review_desc',label: '리뷰많은순' },
]

const waterTypes  = [{ key: 'FRESHWATER', label: '담수' }, { key: 'SALTWATER', label: '해수' }, { key: 'BRACKISH', label: '기수' }]
const difficulties = [{ key: 'BEGINNER', label: '초급' }, { key: 'INTERMEDIATE', label: '중급' }, { key: 'ADVANCED', label: '고급' }]

// ─── computed ──────────────────────────────────────────────
const showBioFilters = computed(() =>
  !activeTypeFilter.value || BIO_TYPES.has(activeTypeFilter.value)
)

const resolvedMinPrice = computed<number | undefined>(() => {
  if (priceMinCustom.value !== null) return priceMinCustom.value
  const p = pricePresets.find(p => p.key === pricePreset.value)
  return p?.min
})

const resolvedMaxPrice = computed<number | undefined>(() => {
  if (priceMaxCustom.value !== null) return priceMaxCustom.value
  const p = pricePresets.find(p => p.key === pricePreset.value)
  return p?.max
})

const activeFilterCount = computed(() => {
  let n = 0
  if (activeTypeFilter.value) n++
  if (selectedWaterType.value) n++
  if (selectedDifficulty.value) n++
  if (selectedIsCompatible.value) n++
  if (selectedFreeShipping.value) n++
  if (selectedMinRating.value) n++
  if (pricePreset.value || priceMinCustom.value !== null || priceMaxCustom.value !== null) n++
  return n
})

const activeFilterChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  if (activeTypeFilter.value) {
    const t = productTypes.find(p => p.key === activeTypeFilter.value)
    if (t) chips.push({ key: 'type', label: `${t.emoji} ${t.label}` })
  }
  if (selectedWaterType.value) {
    const m: Record<string, string> = { FRESHWATER: '담수', SALTWATER: '해수', BRACKISH: '기수' }
    chips.push({ key: 'water', label: m[selectedWaterType.value] ?? selectedWaterType.value })
  }
  if (selectedDifficulty.value) {
    const m: Record<string, string> = { BEGINNER: '초급', INTERMEDIATE: '중급', ADVANCED: '고급' }
    chips.push({ key: 'diff', label: m[selectedDifficulty.value] ?? selectedDifficulty.value })
  }
  if (selectedIsCompatible.value) chips.push({ key: 'compatible', label: '합사 가능' })
  if (selectedFreeShipping.value) chips.push({ key: 'free', label: '무료배송' })
  if (selectedMinRating.value !== null)
    chips.push({ key: 'rating', label: `★ ${selectedMinRating.value}점 이상` })
  if (pricePreset.value) {
    const p = pricePresets.find(p => p.key === pricePreset.value)
    if (p) chips.push({ key: 'price', label: p.label })
  } else if (priceMinCustom.value !== null || priceMaxCustom.value !== null) {
    const lo = priceMinCustom.value !== null ? `₩${priceMinCustom.value.toLocaleString()}` : ''
    const hi = priceMaxCustom.value !== null ? `₩${priceMaxCustom.value.toLocaleString()}` : ''
    chips.push({ key: 'price', label: lo && hi ? `${lo}~${hi}` : lo ? `${lo} 이상` : `${hi} 이하` })
  }
  return chips
})

// ─── 위시리스트 ────────────────────────────────────────────
const wishlistedIds = ref(new Set<number>())

const loadWishlist = async () => {
  if (!isLoggedIn.value) return
  try {
    const items = await productApi.getMyWishlist()
    wishlistedIds.value = new Set(items.map((p: any) => p.id))
  } catch { /* 무시 */ }
}

const isWishlisted = (id: string | number) => wishlistedIds.value.has(Number(id))

const toggleWishlistById = async (id: string | number, e: Event) => {
  e.stopPropagation()
  if (!isLoggedIn.value) { router.push('/login'); return }
  const numId = Number(id)
  const was = wishlistedIds.value.has(numId)
  was ? wishlistedIds.value.delete(numId) : wishlistedIds.value.add(numId)
  try {
    const now = await productApi.toggleWishlist(numId)
    now ? wishlistedIds.value.add(numId) : wishlistedIds.value.delete(numId)
  } catch {
    was ? wishlistedIds.value.add(numId) : wishlistedIds.value.delete(numId)
  }
}

// ─── 장바구니 ──────────────────────────────────────────────
const showAddedToast = ref(false)
const addingToCart   = ref(new Set<string | number>())
let toastTimer: ReturnType<typeof setTimeout> | null = null

const isOwnProduct = (p: SearchResult) =>
  isLoggedIn.value && !!authUser.value && p.sellerNickName === authUser.value.nickName

const addToCart = async (product: SearchResult, e: Event) => {
  e.stopPropagation()
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (isOwnProduct(product) || product.status === 'SOLD_OUT') return
  if (addingToCart.value.has(product.id)) return
  addingToCart.value.add(product.id)
  try {
    await cartStore.addItem(Number(product.id), 1)
    showAddedToast.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { showAddedToast.value = false }, 2000)
  } catch { /* 무시 */ } finally {
    addingToCart.value.delete(product.id)
  }
}

// ─── 검색 ──────────────────────────────────────────────────
const fetchResults = async (reset = true) => {
  if (!reset && (isLoading.value || !hasMore.value)) return
  const requestId = ++currentRequestId
  isLoading.value = true
  if (reset) { page.value = 0; results.value = []; hasMore.value = false }

  try {
    const data = await searchApi.search({
      keyword:     keyword.value || '',
      page:        page.value,
      size:        PAGE_SIZE,
      sort:        sortOption.value,
      productType: activeTypeFilter.value as ProductType || undefined,
      waterType:   selectedWaterType.value as WaterType || undefined,
      difficulty:  selectedDifficulty.value as Difficulty || undefined,
      isCompatible:  selectedIsCompatible.value  || undefined,
      freeShipping:  selectedFreeShipping.value  || undefined,
      minRating:   selectedMinRating.value ?? undefined,
      minPrice:    resolvedMinPrice.value,
      maxPrice:    resolvedMaxPrice.value,
    })
    if (requestId !== currentRequestId) return
    results.value  = reset ? data : [...results.value, ...data]
    hasMore.value  = data.length === PAGE_SIZE
  } catch {
    if (requestId === currentRequestId) results.value = reset ? [] : results.value
  } finally {
    if (requestId === currentRequestId) isLoading.value = false
  }
}

// ─── 핸들러 ────────────────────────────────────────────────
const handleSearch = (kw: string) => {
  keyword.value = kw
  if (kw) sortOption.value = 'relevance'
  router.replace({ path: '/shop', query: kw ? { keyword: kw } : {} })
  fetchResults(true)
}

const applyFilter = () => {
  showMobileFilter.value = false
  fetchResults(true)
}

const resetFilters = () => {
  activeTypeFilter.value     = ''
  selectedWaterType.value    = ''
  selectedDifficulty.value   = ''
  selectedIsCompatible.value = false
  selectedFreeShipping.value = false
  selectedMinRating.value    = null
  pricePreset.value          = ''
  priceMinCustom.value       = null
  priceMaxCustom.value       = null
  showMobileFilter.value     = false
  fetchResults(true)
}

const removeChip = (key: string) => {
  if (key === 'type')       activeTypeFilter.value = ''
  else if (key === 'water') selectedWaterType.value = ''
  else if (key === 'diff')  selectedDifficulty.value = ''
  else if (key === 'compatible') selectedIsCompatible.value = false
  else if (key === 'free')  selectedFreeShipping.value = false
  else if (key === 'rating') selectedMinRating.value = null
  else if (key === 'price') { pricePreset.value = ''; priceMinCustom.value = null; priceMaxCustom.value = null }
  fetchResults(true)
}

const selectPricePreset = (key: string) => {
  pricePreset.value    = pricePreset.value === key ? '' : key
  priceMinCustom.value = null
  priceMaxCustom.value = null
}

const applyCustomPrice = () => {
  pricePreset.value = ''
  fetchResults(true)
}

// ─── 정렬 변경 ────────────────────────────────────────────
watch(sortOption, () => fetchResults(true))

// ─── URL keyword watch ─────────────────────────────────────
watch(() => route.query.keyword, (newKw) => {
  const kw = typeof newKw === 'string' ? newKw : ''
  if (kw === keyword.value) return
  keyword.value = kw
  fetchResults(true)
})

// ─── 무한 스크롤 ───────────────────────────────────────────
const sentinelRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
      page.value++
      fetchResults(false)
    }
  }, { rootMargin: '200px' })
  observer.observe(sentinelRef.value)
}

// ─── 헬퍼 ─────────────────────────────────────────────────
const typeEmojiMap: Record<string, string> = {
  FISH: '🐠', PLANT: '🌿', INVERTEBRATE: '🦐', EQUIPMENT: '🔧', ACCESSORY: '🪨', FOOD: '🍃',
}
const typeLabelMap: Record<string, string> = {
  FISH: '어류', PLANT: '수초', INVERTEBRATE: '새우/갑각류', EQUIPMENT: '용품/장비', ACCESSORY: '소품', FOOD: '사료',
}
const difficultyLabel: Record<string, string> = { BEGINNER: '초급', INTERMEDIATE: '중급', ADVANCED: '고급' }
const waterTypeLabel:  Record<string, string>  = { FRESHWATER: '담수', SALTWATER: '해수', BRACKISH: '기수' }

const typeBadgeClass = (type: string) => {
  const m: Record<string, string> = {
    FISH: 'bg-sky-100 text-sky-700', PLANT: 'bg-green-100 text-green-700',
    INVERTEBRATE: 'bg-purple-100 text-purple-700', EQUIPMENT: 'bg-amber-100 text-amber-700',
    ACCESSORY: 'bg-pink-100 text-pink-700', FOOD: 'bg-lime-100 text-lime-700',
  }
  return m[type] ?? 'bg-slate-100 text-slate-600'
}

const formatPrice = (n: number) => '₩' + n.toLocaleString()

onMounted(() => {
  fetchResults(true)
  loadWishlist()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
  currentRequestId++
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <div>
  <main class="min-h-screen bg-slate-50 pt-16 pb-20">
    <SearchBar v-model="keyword" @search="handleSearch" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      <!-- ── 모바일: 필터 버튼 + 정렬 ── -->
      <div class="flex items-center gap-3 mb-4 lg:hidden">
        <button
          @click="showMobileFilter = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-100 bg-white text-slate-700 text-sm font-semibold hover:bg-sky-50 transition-colors"
        >
          <SlidersHorizontal class="w-4 h-4 text-sky-500" />
          필터
          <span v-if="activeFilterCount > 0"
            class="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">
            {{ activeFilterCount }}
          </span>
        </button>
        <select
          v-model="sortOption"
          class="flex-1 border border-sky-100 rounded-xl px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <div class="flex items-center gap-1 bg-white border border-sky-100 rounded-lg p-1">
          <button @click="viewMode = 'grid'" class="p-1.5 rounded-md transition-colors"
            :class="viewMode === 'grid' ? 'text-sky-500 bg-sky-50' : 'text-slate-400'">
            <Grid3x3 class="w-4 h-4" />
          </button>
          <button @click="viewMode = 'list'" class="p-1.5 rounded-md transition-colors"
            :class="viewMode === 'list' ? 'text-sky-500 bg-sky-50' : 'text-slate-400'">
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- ── 활성 필터 칩 (모바일) ── -->
      <div v-if="activeFilterChips.length > 0" class="flex gap-2 flex-wrap mb-4 lg:hidden">
        <span v-for="chip in activeFilterChips" :key="chip.key"
          class="flex items-center gap-1.5 bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full">
          {{ chip.label }}
          <button @click="removeChip(chip.key)"><X class="w-3 h-3" /></button>
        </span>
        <button @click="resetFilters" class="text-xs text-slate-400 hover:text-slate-600 px-2">전체 초기화</button>
      </div>

      <div class="flex gap-6">
        <!-- ── 데스크탑 사이드바 ── -->
        <aside class="hidden lg:block w-60 flex-shrink-0">
          <div class="sticky top-28">
            <!-- 헤더 -->
            <div class="flex items-center justify-between mb-5">
              <span class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <SlidersHorizontal class="w-4 h-4 text-sky-500" /> 필터
                <span v-if="activeFilterCount > 0"
                  class="ml-1 w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] flex items-center justify-center font-bold">
                  {{ activeFilterCount }}
                </span>
              </span>
              <button v-if="activeFilterCount > 0" @click="resetFilters"
                class="text-xs text-sky-500 hover:underline">초기화</button>
            </div>

            <!-- 상품 유형 -->
            <div class="mb-5">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">상품 유형</p>
              <div class="space-y-0.5">
                <button @click="activeTypeFilter = ''; fetchResults(true)"
                  class="w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="activeTypeFilter === '' ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-500 hover:bg-slate-100'">
                  전체
                </button>
                <button v-for="t in productTypes" :key="t.key"
                  @click="activeTypeFilter = activeTypeFilter === t.key ? '' : t.key; fetchResults(true)"
                  class="w-full flex items-center px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="activeTypeFilter === t.key ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-500 hover:bg-slate-100'">
                  {{ t.emoji }} {{ t.label }}
                </button>
              </div>
            </div>

            <!-- 구분선 -->
            <hr class="border-sky-50 mb-5" />

            <!-- 정렬 -->
            <div class="mb-5">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">정렬</p>
              <div class="space-y-1">
                <label v-for="o in sortOptions" :key="o.value"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" :value="o.value" v-model="sortOption" class="accent-sky-500" />
                  <span class="text-sm" :class="sortOption === o.value ? 'text-sky-600 font-semibold' : 'text-slate-600'">
                    {{ o.label }}
                  </span>
                </label>
              </div>
            </div>

            <hr class="border-sky-50 mb-5" />

            <!-- 가격대 -->
            <div class="mb-5">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">가격대</p>
              <div class="flex flex-wrap gap-1.5 mb-3">
                <button v-for="p in pricePresets" :key="p.key"
                  @click="selectPricePreset(p.key); fetchResults(true)"
                  class="text-xs px-3 py-1.5 rounded-full transition-colors border"
                  :class="pricePreset === p.key
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-slate-600 border-sky-100 hover:border-sky-300'">
                  {{ p.label }}
                </button>
              </div>
              <div class="flex items-center gap-1.5">
                <input v-model.number="priceMinCustom" type="number" placeholder="최소"
                  class="w-full border border-sky-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  @keyup.enter="applyCustomPrice" />
                <span class="text-slate-300 text-xs flex-shrink-0">~</span>
                <input v-model.number="priceMaxCustom" type="number" placeholder="최대"
                  class="w-full border border-sky-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  @keyup.enter="applyCustomPrice" />
                <button @click="applyCustomPrice"
                  class="flex-shrink-0 px-2 py-1.5 bg-sky-500 text-white text-xs rounded-lg hover:bg-sky-600 transition-colors">
                  적용
                </button>
              </div>
            </div>

            <hr class="border-sky-50 mb-5" />

            <!-- 배송 -->
            <div class="mb-5">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">배송</p>
              <label class="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" v-model="selectedFreeShipping"
                  @change="fetchResults(true)" class="accent-sky-500 w-4 h-4" />
                <span class="text-sm text-slate-600">무료배송만 보기</span>
              </label>
            </div>

            <hr class="border-sky-50 mb-5" />

            <!-- 별점 -->
            <div class="mb-5">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">별점</p>
              <div class="space-y-1">
                <label v-for="r in ratingOptions" :key="r.value"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" :value="r.value" v-model="selectedMinRating"
                    @change="fetchResults(true)" class="accent-sky-500" />
                  <span class="flex items-center gap-1 text-sm"
                    :class="selectedMinRating === r.value ? 'text-sky-600 font-semibold' : 'text-slate-600'">
                    <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {{ r.label }}
                  </span>
                </label>
                <label class="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" :value="null" v-model="selectedMinRating"
                    @change="fetchResults(true)" class="accent-sky-500" />
                  <span class="text-sm text-slate-400">전체</span>
                </label>
              </div>
            </div>

            <!-- 생물 전용 필터 -->
            <template v-if="showBioFilters">
              <hr class="border-sky-50 mb-5" />

              <!-- 수질 타입 -->
              <div class="mb-5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">수질 타입</p>
                <div class="flex flex-wrap gap-1.5">
                  <button v-for="w in waterTypes" :key="w.key"
                    @click="selectedWaterType = selectedWaterType === w.key ? '' : w.key; fetchResults(true)"
                    class="text-xs px-3 py-1.5 rounded-full transition-colors border"
                    :class="selectedWaterType === w.key
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-slate-600 border-sky-100 hover:border-sky-300'">
                    {{ w.label }}
                  </button>
                </div>
              </div>

              <!-- 난이도 -->
              <div class="mb-5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">난이도</p>
                <div class="flex flex-wrap gap-1.5">
                  <button v-for="d in difficulties" :key="d.key"
                    @click="selectedDifficulty = selectedDifficulty === d.key ? '' : d.key; fetchResults(true)"
                    class="text-xs px-3 py-1.5 rounded-full transition-colors border"
                    :class="selectedDifficulty === d.key
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-slate-600 border-sky-100 hover:border-sky-300'">
                    {{ d.label }}
                  </button>
                </div>
              </div>

              <!-- 합사 가능 -->
              <div class="mb-5">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">합사</p>
                <label class="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" v-model="selectedIsCompatible"
                    @change="fetchResults(true)" class="accent-sky-500 w-4 h-4" />
                  <span class="text-sm text-slate-600">합사 가능한 생물만</span>
                </label>
              </div>
            </template>
          </div>
        </aside>

        <!-- ── 메인 컨텐츠 ── -->
        <div class="flex-1 min-w-0">

          <!-- 탑바 -->
          <div class="flex items-center justify-between mb-3 gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <template v-if="keyword">
                <span class="text-lg font-black text-slate-900">"{{ keyword }}"</span>
                <span class="text-slate-400 text-sm">
                  {{ results.length }}개<template v-if="hasMore">+</template>
                </span>
                <button @click="handleSearch('')"
                  class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  <X class="w-3 h-3" /> 초기화
                </button>
              </template>
              <template v-else>
                <h1 class="text-lg font-black text-slate-900">전체 상품</h1>
                <span class="text-slate-400 text-sm">{{ results.length }}개<template v-if="hasMore">+</template></span>
              </template>
            </div>

            <!-- 데스크탑: 뷰 모드 토글 -->
            <div class="hidden lg:flex items-center gap-1 bg-white border border-sky-100 rounded-lg p-1">
              <button @click="viewMode = 'grid'" class="p-1.5 rounded-md transition-colors"
                :class="viewMode === 'grid' ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-50'">
                <Grid3x3 class="w-4 h-4" />
              </button>
              <button @click="viewMode = 'list'" class="p-1.5 rounded-md transition-colors"
                :class="viewMode === 'list' ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:bg-slate-50'">
                <List class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 활성 필터 칩 (데스크탑) -->
          <div v-if="activeFilterChips.length > 0" class="hidden lg:flex gap-2 flex-wrap mb-4">
            <span v-for="chip in activeFilterChips" :key="chip.key"
              class="flex items-center gap-1.5 bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full">
              {{ chip.label }}
              <button @click="removeChip(chip.key)" class="hover:text-sky-900"><X class="w-3 h-3" /></button>
            </span>
          </div>

          <!-- 로딩 스켈레톤 (초기) -->
          <div v-if="isLoading && results.length === 0"
            :class="viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'">
            <div v-for="i in 8" :key="i"
              :class="viewMode === 'grid'
                ? 'rounded-2xl bg-slate-200 animate-pulse aspect-[3/4]'
                : 'h-24 rounded-2xl bg-slate-200 animate-pulse'" />
          </div>

          <!-- 빈 결과 -->
          <div v-else-if="!isLoading && results.length === 0"
            class="flex flex-col items-center py-24 text-slate-400">
            <Search class="w-12 h-12 mb-3 text-slate-200" />
            <p class="font-medium">
              {{ keyword ? `"${keyword}" 검색 결과가 없어요` : '조건에 맞는 상품이 없어요' }}
            </p>
            <p class="text-sm mt-1">다른 키워드나 필터로 시도해보세요</p>
            <button @click="resetFilters" class="mt-4 text-sm text-sky-500 hover:underline">
              필터 초기화
            </button>
          </div>

          <!-- 그리드 뷰 -->
          <div v-else-if="viewMode === 'grid'"
            class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="product in results"
              :key="product.id"
              @click="router.push(`/products/${product.id}`)"
              class="rounded-2xl border border-sky-100 bg-white overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-sky-200 transition-all duration-200 group"
            >
              <!-- 이미지 -->
              <div class="relative aspect-square bg-gradient-to-br from-sky-100 to-teal-200 overflow-hidden">
                <img v-if="product.thumbnailUrl" :src="product.thumbnailUrl" :alt="product.name"
                  class="w-full h-full object-cover" />
                <span v-else class="absolute inset-0 flex items-center justify-center text-4xl">
                  {{ typeEmojiMap[product.productType] ?? '📦' }}
                </span>

                <!-- 품절 -->
                <div v-if="product.status === 'SOLD_OUT'"
                  class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span class="text-white font-black text-sm bg-slate-700/80 px-3 py-1 rounded-full">품절</span>
                </div>

                <!-- 타입 배지 -->
                <span class="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  :class="typeBadgeClass(product.productType)">
                  {{ typeLabelMap[product.productType] ?? product.productType }}
                </span>

                <!-- 위시리스트 -->
                <button @click="toggleWishlistById(product.id, $event)"
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                  <Heart class="w-3.5 h-3.5"
                    :class="isWishlisted(product.id) ? 'fill-sky-500 text-sky-500' : 'text-slate-400'" />
                </button>

                <!-- 품절임박 -->
                <span v-if="product.lowStockWarning && product.status !== 'SOLD_OUT'"
                  class="absolute bottom-2 left-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                  품절임박
                </span>
              </div>

              <!-- 컨텐츠 -->
              <div class="p-3">
                <!-- 판매자 -->
                <button
                  @click.stop="product.sellerId ? router.push(`/store/${product.sellerId}`) : undefined"
                  class="text-xs text-slate-400 hover:text-sky-500 truncate block w-full text-left mb-1 transition-colors">
                  @{{ product.sellerNickName }}
                </button>

                <!-- 상품명 -->
                <p class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-sky-600 transition-colors">
                  {{ product.name }}
                </p>

                <!-- 태그 -->
                <div class="flex flex-wrap gap-1 mb-2">
                  <span v-for="tag in product.tags?.slice(0, 2)" :key="tag"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                    {{ tag }}
                  </span>
                </div>

                <!-- 부가 정보 (생물) -->
                <div v-if="product.waterType || product.difficulty"
                  class="flex gap-1.5 mb-1.5">
                  <span v-if="product.waterType"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {{ waterTypeLabel[product.waterType] ?? product.waterType }}
                  </span>
                  <span v-if="product.difficulty"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                    {{ difficultyLabel[product.difficulty] ?? product.difficulty }}
                  </span>
                </div>

                <!-- 가격 + 별점 -->
                <div class="flex items-end justify-between">
                  <span class="text-base font-black text-sky-600">{{ formatPrice(product.price) }}</span>
                  <span v-if="product.averageRating > 0"
                    class="flex items-center gap-0.5 text-xs text-amber-400 font-semibold">
                    <Star class="w-3 h-3 fill-amber-400" />
                    {{ product.averageRating.toFixed(1) }}
                    <span class="text-slate-300 font-normal">({{ product.reviewCount }})</span>
                  </span>
                </div>

                <!-- 배송비 -->
                <p class="text-[10px] text-slate-400 mt-0.5">
                  {{ product.shippingFee === 0 ? '무료배송' : `배송비 ${formatPrice(product.shippingFee)}` }}
                </p>

                <!-- 장바구니 버튼 -->
                <button
                  @click.stop="addToCart(product, $event)"
                  :disabled="product.status === 'SOLD_OUT' || isOwnProduct(product) || addingToCart.has(product.id)"
                  :title="isOwnProduct(product) ? '내가 등록한 상품' : undefined"
                  class="w-full mt-2.5 py-2 text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                  :class="product.status === 'SOLD_OUT' || isOwnProduct(product)
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'">
                  <Loader2 v-if="addingToCart.has(product.id)" class="w-4 h-4 animate-spin mx-auto" />
                  <span v-else>{{ isOwnProduct(product) ? '내 상품' : '장바구니' }}</span>
                </button>
              </div>
            </div>

            <!-- 추가 로딩 스켈레톤 -->
            <template v-if="isLoading && results.length > 0">
              <div v-for="i in 4" :key="`skel-${i}`"
                class="rounded-2xl bg-slate-200 animate-pulse aspect-[3/4]" />
            </template>
          </div>

          <!-- 리스트 뷰 -->
          <div v-else class="space-y-1">
            <div
              v-for="product in results"
              :key="product.id"
              @click="router.push(`/products/${product.id}`)"
              class="flex items-center gap-4 py-3 px-3 border-b border-sky-50 cursor-pointer hover:bg-white rounded-xl transition-colors"
            >
              <!-- 썸네일 -->
              <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex-shrink-0 overflow-hidden relative">
                <img v-if="product.thumbnailUrl" :src="product.thumbnailUrl" :alt="product.name"
                  class="w-full h-full object-cover" />
                <span v-else class="absolute inset-0 flex items-center justify-center text-3xl">
                  {{ typeEmojiMap[product.productType] ?? '📦' }}
                </span>
                <div v-if="product.status === 'SOLD_OUT'"
                  class="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <span class="text-white text-[10px] font-black">품절</span>
                </div>
              </div>

              <!-- 정보 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    :class="typeBadgeClass(product.productType)">
                    {{ typeLabelMap[product.productType] }}
                  </span>
                  <span v-if="product.waterType"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {{ waterTypeLabel[product.waterType] }}
                  </span>
                  <span v-if="product.difficulty"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100">
                    {{ difficultyLabel[product.difficulty] }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-slate-800 truncate">{{ product.name }}</p>
                <button @click.stop="product.sellerId ? router.push(`/store/${product.sellerId}`) : undefined"
                  class="text-xs text-slate-400 hover:text-sky-500 transition-colors">
                  @{{ product.sellerNickName }}
                </button>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tag in product.tags?.slice(0, 2)" :key="tag"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- 가격/버튼 -->
              <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                <button @click="toggleWishlistById(product.id, $event)"
                  class="p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <Heart class="w-4 h-4"
                    :class="isWishlisted(product.id) ? 'fill-sky-500 text-sky-500' : 'text-slate-300'" />
                </button>
                <span class="font-black text-sky-600 text-sm">{{ formatPrice(product.price) }}</span>
                <span v-if="product.averageRating > 0"
                  class="flex items-center gap-0.5 text-xs text-amber-400">
                  <Star class="w-3 h-3 fill-amber-400" />
                  {{ product.averageRating.toFixed(1) }}
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ product.shippingFee === 0 ? '무료배송' : `+${formatPrice(product.shippingFee)}` }}
                </span>
                <button
                  @click.stop="addToCart(product, $event)"
                  :disabled="product.status === 'SOLD_OUT' || isOwnProduct(product) || addingToCart.has(product.id)"
                  class="px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                  :class="product.status === 'SOLD_OUT' || isOwnProduct(product)
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'">
                  <Loader2 v-if="addingToCart.has(product.id)" class="w-3 h-3 animate-spin" />
                  <span v-else>{{ isOwnProduct(product) ? '내 상품' : '담기' }}</span>
                </button>
              </div>
            </div>

            <!-- 추가 로딩 -->
            <template v-if="isLoading && results.length > 0">
              <div v-for="i in 4" :key="`skel-${i}`" class="h-24 rounded-2xl bg-slate-200 animate-pulse" />
            </template>
          </div>

          <!-- 무한스크롤 센티넬 -->
          <div ref="sentinelRef" class="h-4 mt-4" />
          <p v-if="!hasMore && results.length > 0 && !isLoading"
            class="text-center text-slate-300 text-xs py-6">모든 상품을 불러왔어요 🐠</p>
        </div>
      </div>
    </div>
  </main>

  <!-- ── 모바일 필터 오버레이 ── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showMobileFilter" class="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
        <!-- dim -->
        <div class="absolute inset-0 bg-black/40" @click="showMobileFilter = false" />

        <!-- 패널 -->
        <div class="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto z-10">
          <!-- 핸들 -->
          <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-sky-50">
            <span class="font-bold text-slate-800">필터</span>
            <button @click="showMobileFilter = false"><X class="w-5 h-5 text-slate-400" /></button>
          </div>

          <div class="px-5 py-4 space-y-5">
            <!-- 상품 유형 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">상품 유형</p>
              <div class="flex flex-wrap gap-2">
                <button @click="activeTypeFilter = ''"
                  class="text-sm px-3 py-1.5 rounded-full border transition-colors"
                  :class="activeTypeFilter === '' ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-100 text-slate-600'">
                  전체
                </button>
                <button v-for="t in productTypes" :key="t.key"
                  @click="activeTypeFilter = activeTypeFilter === t.key ? '' : t.key"
                  class="text-sm px-3 py-1.5 rounded-full border transition-colors"
                  :class="activeTypeFilter === t.key ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-100 text-slate-600'">
                  {{ t.emoji }} {{ t.label }}
                </button>
              </div>
            </div>

            <!-- 정렬 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">정렬</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="o in sortOptions" :key="o.value"
                  @click="sortOption = o.value"
                  class="text-sm px-3 py-1.5 rounded-full border transition-colors"
                  :class="sortOption === o.value ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-100 text-slate-600'">
                  {{ o.label }}
                </button>
              </div>
            </div>

            <!-- 가격대 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">가격대</p>
              <div class="flex flex-wrap gap-2 mb-2">
                <button v-for="p in pricePresets" :key="p.key"
                  @click="selectPricePreset(p.key)"
                  class="text-sm px-3 py-1.5 rounded-full border transition-colors"
                  :class="pricePreset === p.key ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-100 text-slate-600'">
                  {{ p.label }}
                </button>
              </div>
            </div>

            <!-- 배송 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">배송</p>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="selectedFreeShipping" class="accent-sky-500 w-4 h-4" />
                <span class="text-sm text-slate-600">무료배송만 보기</span>
              </label>
            </div>

            <!-- 별점 -->
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">별점</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="r in ratingOptions" :key="r.value"
                  @click="selectedMinRating = selectedMinRating === r.value ? null : r.value"
                  class="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border transition-colors"
                  :class="selectedMinRating === r.value ? 'bg-amber-400 text-white border-amber-400' : 'border-sky-100 text-slate-600'">
                  <Star class="w-3 h-3 fill-current" />
                  {{ r.label }}
                </button>
              </div>
            </div>

            <!-- 생물 필터 -->
            <template v-if="showBioFilters">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">수질 타입</p>
                <div class="flex flex-wrap gap-2">
                  <button v-for="w in waterTypes" :key="w.key"
                    @click="selectedWaterType = selectedWaterType === w.key ? '' : w.key"
                    class="text-sm px-3 py-1.5 rounded-full border transition-colors"
                    :class="selectedWaterType === w.key ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-100 text-slate-600'">
                    {{ w.label }}
                  </button>
                </div>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">난이도</p>
                <div class="flex flex-wrap gap-2">
                  <button v-for="d in difficulties" :key="d.key"
                    @click="selectedDifficulty = selectedDifficulty === d.key ? '' : d.key"
                    class="text-sm px-3 py-1.5 rounded-full border transition-colors"
                    :class="selectedDifficulty === d.key ? 'bg-teal-500 text-white border-teal-500' : 'border-sky-100 text-slate-600'">
                    {{ d.label }}
                  </button>
                </div>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">합사</p>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="selectedIsCompatible" class="accent-sky-500 w-4 h-4" />
                  <span class="text-sm text-slate-600">합사 가능한 생물만</span>
                </label>
              </div>
            </template>
          </div>

          <!-- 버튼 -->
          <div class="sticky bottom-0 bg-white border-t border-sky-50 px-5 py-3 flex gap-2">
            <button @click="resetFilters"
              class="flex-1 py-3 border border-sky-200 text-sky-600 font-semibold rounded-full text-sm hover:bg-sky-50 transition-colors">
              초기화
            </button>
            <button @click="applyFilter"
              class="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full text-sm transition-colors">
              적용하기
              <span v-if="activeFilterCount > 0">({{ activeFilterCount }})</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

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
      <div v-if="showAddedToast"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 whitespace-nowrap">
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
