<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, PenSquare, ChevronLeft, ChevronRight, Loader2, FileText } from 'lucide-vue-next'
import { communityApi, type BoardCategoryResponse, type PostSummaryResponse } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { isLoggedIn } = storeToRefs(useAuthStore())

// ─── State ────────────────────────────────────────────────
const categories = ref<BoardCategoryResponse[]>([])
const posts = ref<PostSummaryResponse[]>([])
const popularPosts = ref<PostSummaryResponse[]>([])
const totalPages = ref(1)
const currentPage = ref(0)         // 0-indexed
const selectedCategoryId = ref<number | null>(null)
const selectedCategoryName = ref('전체')
const sortBy = ref('최신순')
const searchQuery = ref('')
const isLoading = ref(false)

const sortOptions = ['최신순', '추천순', '조회순']
const SORT_MAP: Record<string, string | undefined> = {
  '최신순': undefined,
  '추천순': 'likeCount,desc',
  '조회순': 'viewCount,desc',
}
const PAGE_SIZE = 15

// ─── Computed ────────────────────────────────────────────
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return posts.value
  const q = searchQuery.value.toLowerCase()
  return posts.value.filter(p => p.title.toLowerCase().includes(q))
})

// ─── Data Fetching ────────────────────────────────────────
async function loadCategories() {
  categories.value = await communityApi.getCategories()
}

async function loadPosts() {
  isLoading.value = true
  try {
    const params: Record<string, any> = { page: currentPage.value, size: PAGE_SIZE }
    if (selectedCategoryId.value !== null) params.categoryId = selectedCategoryId.value
    const sort = SORT_MAP[sortBy.value]
    if (sort) params.sort = sort
    const page = await communityApi.getPosts(params)
    posts.value = page.content
    totalPages.value = page.totalPages
  } finally {
    isLoading.value = false
  }
}

async function loadPopularPosts() {
  const page = await communityApi.getPosts({ page: 0, size: 3, sort: 'likeCount,desc' })
  popularPosts.value = page.content
}

onMounted(async () => {
  await loadCategories()
  await Promise.all([loadPosts(), loadPopularPosts()])
})

// ─── Watchers ─────────────────────────────────────────────
watch([selectedCategoryId, sortBy], () => {
  currentPage.value = 0
  loadPosts()
})

watch(currentPage, loadPosts)

// ─── Actions ──────────────────────────────────────────────
function selectCategory(id: number | null, name: string) {
  selectedCategoryId.value = id
  selectedCategoryName.value = name
  currentPage.value = 0
}

function goWrite() {
  if (!isLoggedIn.value) { router.push('/login'); return }
  router.push('/community/write')
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(iso).toLocaleDateString('ko-KR')
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const start = Math.max(0, Math.min(cur - 2, total - 5))
  const end = Math.min(total, start + 5)
  return Array.from({ length: end - start }, (_, i) => start + i)
})
</script>

<template>
  <main class="max-w-6xl mx-auto px-6 py-20">
    <div class="flex gap-8 items-start">

      <!-- ── Left Sidebar ── -->
      <aside class="hidden lg:block w-64 shrink-0 sticky top-24">
        <div class="bg-white rounded-2xl border border-sky-100 p-5">
          <h2 class="font-black text-slate-900 text-base mb-4">게시판</h2>

          <!-- Categories -->
          <nav class="space-y-1">
            <button
              @click="selectCategory(null, '전체')"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
              :class="selectedCategoryId === null ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'"
            >
              <span>전체</span>
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat.id, cat.name)"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
              :class="selectedCategoryId === cat.id ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'"
            >
              <span>{{ cat.name }}</span>
            </button>
          </nav>

          <div class="h-px bg-sky-50 my-4" />

          <!-- Write button -->
          <button
            @click="goWrite"
            class="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200"
          >
            <PenSquare class="w-4 h-4" />
            글쓰기
          </button>

          <!-- Popular posts -->
          <div class="mt-6">
            <h3 class="font-black text-slate-800 text-sm mb-3">인기 게시글</h3>
            <ol class="space-y-2.5">
              <li
                v-for="(post, idx) in popularPosts"
                :key="post.id"
                class="flex items-start gap-2 cursor-pointer group"
                @click="router.push('/community/' + post.id)"
              >
                <span
                  class="font-black text-sm w-5 shrink-0 leading-5"
                  :class="idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-500' : 'text-slate-400'"
                >{{ idx + 1 }}</span>
                <span class="text-xs text-slate-600 line-clamp-1 group-hover:text-sky-600 transition-colors duration-200">{{ post.title }}</span>
              </li>
            </ol>
          </div>
        </div>
      </aside>

      <!-- ── Main Content ── -->
      <div class="flex-1 min-w-0">

        <!-- Mobile category pills -->
        <div class="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          <button
            @click="selectCategory(null, '전체')"
            class="shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-all duration-200"
            :class="selectedCategoryId === null ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
          >전체</button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat.id, cat.name)"
            class="shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-all duration-200"
            :class="selectedCategoryId === cat.id ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
          >{{ cat.name }}</button>
        </div>

        <!-- Header row -->
        <div class="flex items-center justify-between mb-5 gap-4">
          <div class="flex items-baseline gap-2">
            <h1 class="text-2xl font-black text-slate-900">{{ selectedCategoryName }}</h1>
            <span class="text-slate-400 text-sm">{{ filteredPosts.length }}개</span>
          </div>
          <!-- Search -->
          <div class="relative hidden sm:block">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="제목 검색..."
              class="pl-10 pr-4 py-2.5 rounded-xl border border-sky-100 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all duration-200"
            />
          </div>
        </div>

        <!-- Sort tabs -->
        <div class="flex gap-6 border-b border-sky-100 mb-2">
          <button
            v-for="sort in sortOptions"
            :key="sort"
            @click="sortBy = sort"
            class="pb-3 text-sm font-medium transition-all duration-200"
            :class="sortBy === sort ? 'border-b-2 border-sky-500 text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'"
          >{{ sort }}</button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-20">
          <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
        </div>

        <!-- Post list -->
        <template v-else>
          <div class="divide-y divide-sky-50">
            <div
              v-for="post in filteredPosts"
              :key="post.id"
              @click="router.push('/community/' + post.id)"
              class="flex items-start gap-4 py-4 px-1 hover:bg-sky-50/50 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <!-- Category badge (only in 전체) -->
              <span
                v-if="selectedCategoryId === null"
                class="shrink-0 mt-0.5 text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 whitespace-nowrap"
              >{{ post.categoryName }}</span>

              <!-- Center -->
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-1">
                  <span class="font-semibold text-sm text-slate-900 line-clamp-1">{{ post.title }}</span>
                  <span class="text-sky-500 text-xs shrink-0">[{{ post.commentCount }}]</span>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                  <span>{{ post.authorNickName }}</span>
                  <span>·</span>
                  <span>{{ timeAgo(post.createdAt) }}</span>
                  <span>·</span>
                  <span>조회 {{ post.viewCount }}</span>
                  <span>·</span>
                  <span>추천 {{ post.likeCount }}</span>
                </div>
              </div>

              <!-- Thumbnail -->
              <div class="shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                <img
                  v-if="post.thumbnailUrl"
                  :src="post.thumbnailUrl"
                  :alt="post.title"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center"
                >
                  <FileText class="w-5 h-5 text-sky-400" />
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="filteredPosts.length === 0" class="py-16 text-center">
              <Search class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">게시글이 없습니다</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-8">
            <button
              :disabled="currentPage === 0"
              @click="currentPage--"
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-sky-100 text-slate-400 hover:border-sky-300 transition-all duration-200 disabled:opacity-40"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="currentPage = page"
              class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200"
              :class="currentPage === page ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-sky-50 border border-sky-100'"
            >{{ page + 1 }}</button>
            <button
              :disabled="currentPage >= totalPages - 1"
              @click="currentPage++"
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-sky-100 text-slate-400 hover:border-sky-300 transition-all duration-200 disabled:opacity-40"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </template>

      </div>
    </div>
  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
