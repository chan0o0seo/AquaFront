<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, PenSquare, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const router = useRouter()

// ─── Mock Data ───────────────────────────────────────────
const categories = [
  { id: 1, name: '전체', postCount: 284 },
  { id: 2, name: '공지사항', postCount: 12 },
  { id: 3, name: '자유게시판', postCount: 143 },
  { id: 4, name: '사육일기', postCount: 67 },
  { id: 5, name: '질문/답변', postCount: 38 },
  { id: 6, name: '거래후기', postCount: 24 },
]

const posts = [
  { id: 1, category: '자유게시판', title: '오늘 도착한 L-046 메두사 플레코 공유합니다', author: '플레코마스터', authorInitial: '플', timeAgo: '5분 전', views: 234, likes: 18, commentCount: 7, preview: '어제 주문한 녀석이 오늘 도착했는데 상태가 정말 좋네요. 색상도 선명하고...' },
  { id: 2, category: '질문/답변', title: '크리스탈 새우 수질 세팅 도움 요청드립니다', author: '새우초보', authorInitial: '새', timeAgo: '23분 전', views: 89, likes: 5, commentCount: 12, preview: 'TDS는 150 맞춰놨는데 계속 폐사가 나요. pH는 6.2 정도 되는데...' },
  { id: 3, category: '사육일기', title: '아로와나 6개월 성장기록 (사진多)', author: '아로와나팜', authorInitial: '아', timeAgo: '1시간 전', views: 512, likes: 43, commentCount: 28, preview: '처음 입수할 때 15cm였던 녀석이 벌써 35cm까지...' },
  { id: 4, category: '거래후기', title: '새우천국에서 CRS 구매 후기', author: '수초마니아', authorInitial: '수', timeAgo: '2시간 전', views: 167, likes: 21, commentCount: 4, preview: '오랜만에 새우 구매했는데 포장이 정말 꼼꼼하네요...' },
  { id: 5, category: '자유게시판', title: '수조 리셋 도전기 - 180cm 대형어항 세팅', author: '대형어항러', authorInitial: '대', timeAgo: '3시간 전', views: 445, likes: 38, commentCount: 15, preview: '드디어 180cm 어항 리셋 시작했습니다. 총 예산이...' },
  { id: 6, category: '공지사항', title: '[공지] 커뮤니티 이용 규칙 안내', author: '운영자', authorInitial: '운', timeAgo: '1일 전', views: 1203, likes: 0, commentCount: 2, preview: 'AquaHub 커뮤니티 이용 규칙을 안내드립니다...' },
  { id: 7, category: '질문/답변', title: '디스커스 흰 점 병인가요? (사진 첨부)', author: '디스커스입문', authorInitial: '디', timeAgo: '4시간 전', views: 203, likes: 8, commentCount: 19, preview: '어제부터 몸에 흰 점이 생겼는데 백점병인지...' },
  { id: 8, category: '사육일기', title: '산호 수조 1년 경과 사진 공유', author: '해수마스터', authorInitial: '해', timeAgo: '5시간 전', views: 678, likes: 89, commentCount: 34, preview: '작년에 시작한 산호 수조가 어느덧 1년이 됐네요...' },
  { id: 9, category: '자유게시판', title: '이번 달 경매 낙찰 목록 정리해봤어요', author: '경매중독자', authorInitial: '경', timeAgo: '6시간 전', views: 321, likes: 27, commentCount: 9, preview: '이번 달에도 또 과지출... 반성하면서 정리해봤습니다 ㅎㅎ' },
  { id: 10, category: '거래후기', title: '플레코마스터 L-333 구매 후기 (강추)', author: '플레코팬', authorInitial: '플', timeAgo: '7시간 전', views: 189, likes: 15, commentCount: 6, preview: '몇 달 전부터 찾던 L-333 드디어 구했어요. 사이즈도...' },
]

const popularPosts = posts.sort((a, b) => b.likes - a.likes).slice(0, 3)

// ─── State ───────────────────────────────────────────────
const selectedCategory = ref('전체')
const sortBy = ref('최신순')
const searchQuery = ref('')
const currentPage = ref(1)

const sortOptions = ['최신순', '추천순', '조회순']

// ─── Computed ────────────────────────────────────────────
const filteredPosts = computed(() => {
  let result = [...posts]
  if (selectedCategory.value !== '전체') {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(q) || p.preview.toLowerCase().includes(q))
  }
  if (sortBy.value === '추천순') result.sort((a, b) => b.likes - a.likes)
  else if (sortBy.value === '조회순') result.sort((a, b) => b.views - a.views)
  return result
})

const activeCategoryLabel = computed(() => {
  const cat = categories.find(c => c.name === selectedCategory.value)
  return cat ? `${cat.name} (${cat.postCount})` : selectedCategory.value
})

const totalPages = 5

const selectCategory = (name: string) => {
  selectedCategory.value = name
  currentPage.value = 1
}
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
                v-for="cat in categories"
                :key="cat.id"
                @click="selectCategory(cat.name)"
                class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
                :class="selectedCategory === cat.name
                ? 'bg-sky-50 text-sky-600 font-semibold'
                : 'text-slate-500 hover:bg-slate-50'"
            >
              <span>{{ cat.name }}</span>
              <span class="text-xs text-slate-400">{{ cat.postCount }}</span>
            </button>
          </nav>

          <div class="h-px bg-sky-50 my-4" />

          <!-- Write button -->
          <button
              @click="router.push('/community/write')"
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
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat.name)"
              class="shrink-0 text-sm px-4 py-1.5 rounded-full font-medium transition-all duration-200"
              :class="selectedCategory === cat.name
              ? 'bg-sky-500 text-white'
              : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-100'"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Header row -->
        <div class="flex items-center justify-between mb-5 gap-4">
          <div class="flex items-baseline gap-2">
            <h1 class="text-2xl font-black text-slate-900">{{ selectedCategory }}</h1>
            <span class="text-slate-400 text-sm">{{ filteredPosts.length }}개</span>
          </div>
          <!-- Search -->
          <div class="relative hidden sm:block">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                v-model="searchQuery"
                type="text"
                placeholder="검색..."
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
              :class="sortBy === sort
              ? 'border-b-2 border-sky-500 text-sky-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'"
          >
            {{ sort }}
          </button>
        </div>

        <!-- Post list -->
        <div class="divide-y divide-sky-50">
          <div
              v-for="post in filteredPosts"
              :key="post.id"
              @click="router.push('/community/' + post.id)"
              class="flex items-start gap-4 py-4 px-1 hover:bg-sky-50/50 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <!-- Category badge (only in 전체) -->
            <span
                v-if="selectedCategory === '전체'"
                class="shrink-0 mt-0.5 text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 whitespace-nowrap"
            >
              {{ post.category }}
            </span>

            <!-- Center -->
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-1">
                <span class="font-semibold text-sm text-slate-900 line-clamp-1">{{ post.title }}</span>
                <span class="text-sky-500 text-xs shrink-0">[{{ post.commentCount }}]</span>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                <span>{{ post.author }}</span>
                <span>·</span>
                <span>{{ post.timeAgo }}</span>
                <span>·</span>
                <span>조회 {{ post.views }}</span>
              </div>
              <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">{{ post.preview }}</p>
            </div>

            <!-- Thumbnail placeholder -->
            <div class="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-sky-200 to-teal-300 overflow-hidden flex items-center justify-center text-lg">
              🐟
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredPosts.length === 0" class="py-16 text-center">
            <Search class="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">게시글이 없습니다</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-center gap-1 mt-8">
          <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-sky-100 text-slate-400 hover:border-sky-300 transition-all duration-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200"
              :class="currentPage === page
              ? 'bg-sky-500 text-white'
              : 'text-slate-500 hover:bg-sky-50 border border-sky-100'"
          >
            {{ page }}
          </button>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg border border-sky-100 text-slate-400 hover:border-sky-300 transition-all duration-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
