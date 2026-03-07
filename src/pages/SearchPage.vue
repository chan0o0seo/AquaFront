<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Grid3X3, List, Search } from 'lucide-vue-next'
import SearchBar from '../components/search/SearchBar.vue'
import ProductTypeFilter from '../components/search/ProductTypeFilter.vue'
import SearchResultCard from '../components/search/SearchResultCard.vue'
import SearchResultSkeleton from '../components/search/SearchResultSkeleton.vue'

type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'DELETED'
type ProductType = '' | 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'

interface SearchResult {
  id: number
  name: string
  price: number
  thumbnailUrl: string | null
  status: ProductStatus
  productType: ProductType
  tags: string[]
  sellerNickName: string
  sellerId: number
}

interface SearchResponse {
  content: SearchResult[]
  totalElements: number
  totalPages: number
  last: boolean
}

const route = useRoute()
const router = useRouter()

// State
const keyword = ref('')
const searchResults = ref<SearchResult[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const currentPage = ref(0)
const hasMore = ref(true)
const activeProductType = ref<ProductType>('')
const viewMode = ref<'grid' | 'list'>('grid')
const popularKeywords = ref<string[]>([])

// Intersection Observer
const sentinelRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

// Computed
const showInitialState = computed(() => !keyword.value && searchResults.value.length === 0 && !isLoading.value)
const showEmptyState = computed(() => !isLoading.value && searchResults.value.length === 0 && keyword.value)
const showResults = computed(() => searchResults.value.length > 0)

// API Calls
const fetchSearch = async (reset = true) => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  if (reset) {
    currentPage.value = 0
    searchResults.value = []
    hasMore.value = true
  }
  
  try {
    let url: string
    
    if (activeProductType.value) {
      url = `/api/products/type/${activeProductType.value}?page=${currentPage.value}&size=20`
    } else {
      url = `/api/search?keyword=${encodeURIComponent(keyword.value)}&page=${currentPage.value}&size=20`
    }
    
    const response = await fetch(url)
    
    if (response.ok) {
      const data: SearchResponse = await response.json()
      const filteredContent = data.content.filter(item => item.status !== 'DELETED')
      
      if (reset) {
        searchResults.value = filteredContent
      } else {
        searchResults.value = [...searchResults.value, ...filteredContent]
      }
      
      totalCount.value = data.totalElements
      hasMore.value = !data.last
    }
  } catch (error) {
    console.error('Search error:', error)
    // Mock data for development
    if (reset) {
      searchResults.value = generateMockResults()
      totalCount.value = searchResults.value.length
    }
  } finally {
    isLoading.value = false
  }
}

const fetchPopularKeywords = async () => {
  try {
    const response = await fetch('/api/search/popular')
    if (response.ok) {
      popularKeywords.value = await response.json()
    }
  } catch {
    popularKeywords.value = ['베타', '구피', '코리도라스', '수초', 'LED조명', '여과기']
  }
}

const generateMockResults = (): SearchResult[] => {
  const types: ProductType[] = ['FISH', 'INVERTEBRATE', 'PLANT', 'EQUIPMENT', 'FOOD', 'ACCESSORY']
  const names = ['풀레드 구피', '블루 림포머 플레코', '레드 체리 새우', '아누비아스 나나', 'LED 조명 60cm', '프리미엄 사료']
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length],
    price: Math.floor(Math.random() * 50000) + 5000,
    thumbnailUrl: null,
    status: 'ACTIVE' as ProductStatus,
    productType: types[i % types.length] as ProductType,
    tags: ['초보추천', '열대어'],
    sellerNickName: '아쿠아샵',
    sellerId: 1
  }))
}

// Event Handlers
const handleSearch = (searchKeyword: string) => {
  keyword.value = searchKeyword
  activeProductType.value = ''
  
  router.replace({
    path: '/search',
    query: searchKeyword ? { keyword: searchKeyword } : {}
  })
  
  fetchSearch(true)
}

const handleProductTypeChange = (type: ProductType) => {
  activeProductType.value = type
  fetchSearch(true)
}

const handlePopularKeywordClick = (clickedKeyword: string) => {
  keyword.value = clickedKeyword
  handleSearch(clickedKeyword)
}

const loadMore = () => {
  if (!hasMore.value || isLoading.value) return
  currentPage.value++
  fetchSearch(false)
}

// Intersection Observer Setup
const setupObserver = () => {
  if (!sentinelRef.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoading.value && searchResults.value.length > 0) {
        loadMore()
      }
    },
    { rootMargin: '100px' }
  )
  
  observer.observe(sentinelRef.value)
}

// Watchers
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (typeof newKeyword === 'string' && newKeyword !== keyword.value) {
      keyword.value = newKeyword
      fetchSearch(true)
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  fetchPopularKeywords()
  
  if (route.query.keyword) {
    keyword.value = route.query.keyword as string
    fetchSearch(true)
  }
  
  setupObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <main class="min-h-screen bg-white">
    <!-- Search Bar -->
    <SearchBar
      v-model="keyword"
      @search="handleSearch"
    />
    
    <!-- Product Type Filter -->
    <ProductTypeFilter
      v-model="activeProductType"
      @update:model-value="handleProductTypeChange"
    />
    
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Initial State -->
      <div
        v-show="showInitialState"
        class="flex flex-col items-center justify-center py-24"
      >
        <span class="text-6xl mb-4">🐠</span>
        <p class="text-slate-400 text-lg text-center">
          찾고 싶은 생물이나 용품을 검색해보세요
        </p>
        
        <!-- Popular Keywords -->
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <button
            v-for="kw in popularKeywords"
            :key="kw"
            @click="handlePopularKeywordClick(kw)"
            class="rounded-full bg-sky-50 border border-sky-100 px-4 py-2 text-sm text-slate-600 hover:bg-sky-100 transition-colors"
          >
            {{ kw }}
          </button>
        </div>
      </div>
      
      <!-- Loading State (Initial) -->
      <div
        v-show="isLoading && searchResults.length === 0"
        :class="[
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'flex flex-col gap-4'
        ]"
      >
        <SearchResultSkeleton :count="8" :view-mode="viewMode" />
      </div>
      
      <!-- Empty State -->
      <div
        v-show="showEmptyState"
        class="flex flex-col items-center justify-center py-24"
      >
        <Search class="w-16 h-16 text-slate-300 mb-4" />
        <p class="text-xl font-bold text-slate-700">
          "{{ keyword }}" 검색 결과가 없어요
        </p>
        <p class="text-slate-400 mt-2">
          다른 키워드나 태그로 검색해보세요
        </p>
        
        <!-- Popular Keywords -->
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <button
            v-for="kw in popularKeywords"
            :key="kw"
            @click="handlePopularKeywordClick(kw)"
            class="rounded-full bg-sky-50 border border-sky-100 px-4 py-2 text-sm text-slate-600 hover:bg-sky-100 transition-colors"
          >
            {{ kw }}
          </button>
        </div>
      </div>
      
      <!-- Results -->
      <div v-show="showResults">
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-4">
          <p class="text-sm text-slate-500">
            <template v-if="keyword">"{{ keyword }}"</template>
            검색 결과 {{ totalCount.toLocaleString() }}개
          </p>
          
          <!-- View Mode Toggle -->
          <div class="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              ]"
            >
              <Grid3X3 class="w-4 h-4" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              ]"
            >
              <List class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Results Grid/List -->
        <div
          :class="[
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'flex flex-col gap-4'
          ]"
        >
          <SearchResultCard
            v-for="product in searchResults"
            :key="product.id"
            :product="product"
            :view-mode="viewMode"
          />
          
          <!-- Loading More Skeletons -->
          <template v-if="isLoading && searchResults.length > 0">
            <SearchResultSkeleton :count="3" :view-mode="viewMode" />
          </template>
        </div>
        
        <!-- Sentinel for Infinite Scroll -->
        <div ref="sentinelRef" class="h-4" />
        
        <!-- End of Results -->
        <p
          v-show="!hasMore && searchResults.length > 0"
          class="text-center text-slate-400 text-sm py-8"
        >
          모든 결과를 불러왔어요 🐠
        </p>
      </div>
    </div>
  </main>
</template>
