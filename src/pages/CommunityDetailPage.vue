<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ThumbsUp, Eye, MessageCircle } from 'lucide-vue-next'

const router = useRouter()

// ─── Mock Data ───────────────────────────────────────────
const post = ref({
  id: 1,
  category: '자유게시판',
  title: '오늘 도착한 L-046 메두사 플레코 공유합니다',
  author: '플레코마스터',
  authorInitial: '플',
  timeAgo: '5분 전',
  views: 234,
  likes: 18,
  liked: false,
  commentCount: 5,
  tags: ['플레코', 'L번호', '메두사', '개체공유'],
  content: `어제 주문한 녀석이 오늘 드디어 도착했습니다!\n\n사이즈는 약 6cm 정도고 포장 상태가 굉장히 꼼꼼했어요. 에어포장에 신문지까지 감싸서 왔더라고요. 도착 직후에 수온 맞추면서 물맞춤 2시간 정도 했습니다.\n\n일단 60cm 어항에 임시로 넣어놨는데, 입수 후 30분 만에 유목 밑에 자리 잡고 안정적으로 있네요. 겁이 없는 편인지 먹이도 금방 반응하더라고요.\n\n나중에 성어로 키워서 또 사진 공유하겠습니다. 다들 L번호 플레코 키우시는 분들 팁 공유해주시면 감사하겠습니다 :)`,
})

const comments = ref([
  { id: 1, author: '새우천국', authorInitial: '새', timeAgo: '3분 전', content: '정말 예쁘네요! 저도 L-046 키우고 있는데 적응 기간이 좀 필요해요. 처음에는 먹이 거부를 좀 할 수 있으니 오이나 주키니 넣어주세요!', likes: 4, isMine: false },
  { id: 2, author: '나', authorInitial: '나', timeAgo: '방금', content: '감사합니다! 일단 유목이랑 동굴 은신처 많이 넣어줬어요 ㅎㅎ', likes: 0, isMine: true },
  { id: 3, author: '플레코팬', authorInitial: '플', timeAgo: '1분 전', content: '어디서 구매하셨어요? 저도 찾고 있었는데 판매처 좀 여쭤봐도 될까요?', likes: 1, isMine: false },
  { id: 4, author: '어항고수', authorInitial: '어', timeAgo: '8분 전', content: '수온 26도 이하로 유지해주시는 게 좋아요. L-046은 고온에 약한 편이라서요.', likes: 7, isMine: false },
  { id: 5, author: '수족관왕', authorInitial: '수', timeAgo: '15분 전', content: '와 이거 진짜 희귀한 개체인데! 컨디션 좋아보이네요 부럽습니다 ㅠㅠ', likes: 2, isMine: false },
])

// ─── State ───────────────────────────────────────────────
const commentText = ref('')
const toastMessage = ref('')
const toastVisible = ref(false)

const isSubmitDisabled = computed(() => commentText.value.trim().length === 0)

// ─── Methods ─────────────────────────────────────────────
const showToast = (msg: string) => {
  toastMessage.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2200)
}

const toggleLike = () => {
  post.value.liked = !post.value.liked
  post.value.likes += post.value.liked ? 1 : -1
  showToast(post.value.liked ? '게시글에 좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.')
}

const toggleCommentLike = (commentId: number) => {
  const c = comments.value.find(c => c.id === commentId)
  if (c) c.likes += 1
}

const submitComment = () => {
  if (isSubmitDisabled.value) return
  const newComment = {
    id: Date.now(),
    author: '나',
    authorInitial: '나',
    timeAgo: '방금',
    content: commentText.value.trim(),
    likes: 0,
    isMine: true,
  }
  comments.value.unshift(newComment)
  commentText.value = ''
  post.value.commentCount += 1
  showToast('댓글이 등록되었습니다.')
}

const avatarGradient = (initial: string) => {
  const colors: Record<string, string> = {
    '플': 'from-sky-400 to-teal-500',
    '새': 'from-emerald-400 to-sky-500',
    '아': 'from-amber-400 to-orange-500',
    '수': 'from-violet-400 to-sky-500',
    '어': 'from-sky-300 to-blue-500',
    '나': 'from-sky-400 to-sky-600',
  }
  return colors[initial] ?? 'from-sky-300 to-teal-400'
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-6 py-10 pb-32 lg:pb-10">

    <!-- Back button -->
    <button
        @click="router.push('/community')"
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-6 transition-all duration-200"
    >
      <ChevronLeft class="w-4 h-4" />
      커뮤니티로 돌아가기
    </button>

    <!-- Post Header -->
    <div class="mb-6">
      <span class="bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-xs px-3 py-1">
        {{ post.category }}
      </span>
      <h1 class="text-2xl font-black text-slate-900 mt-3 mb-4 leading-snug">{{ post.title }}</h1>

      <!-- Author meta -->
      <div class="flex items-center gap-2">
        <div
            class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-black"
            :class="avatarGradient(post.authorInitial)"
        >
          {{ post.authorInitial }}
        </div>
        <span class="font-semibold text-sm text-slate-800">{{ post.author }}</span>
        <span class="text-slate-400 text-sm">·</span>
        <span class="text-slate-400 text-sm">{{ post.timeAgo }}</span>
        <span class="text-slate-400 text-sm">·</span>
        <span class="text-slate-400 text-sm">조회 {{ post.views }}</span>
      </div>
    </div>

    <div class="h-px bg-sky-50 my-6" />

    <!-- Post Content -->
    <div class="rounded-2xl border border-sky-100 p-8 bg-white">
      <!-- Image placeholder -->
      <div class="rounded-xl overflow-hidden mb-6 aspect-video bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center">
        <span class="text-6xl">🐟</span>
      </div>

      <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{{ post.content }}</p>
    </div>

    <!-- Reaction Bar -->
    <div class="flex items-center justify-between py-4 border-t border-b border-sky-50 mt-6">
      <!-- Like button -->
      <button
          @click="toggleLike"
          class="flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-200"
          :class="post.liked
          ? 'bg-sky-50 border-sky-200 text-sky-600'
          : 'border-sky-100 text-slate-400 hover:border-sky-200 hover:text-sky-500'"
      >
        <ThumbsUp class="w-4 h-4" />
        <span class="text-sm font-medium">{{ post.likes }}</span>
      </button>

      <!-- Stats -->
      <div class="flex items-center gap-3 text-sm text-slate-400">
        <span class="flex items-center gap-1">
          <Eye class="w-4 h-4" />
          {{ post.views }}
        </span>
        <span class="flex items-center gap-1">
          <MessageCircle class="w-4 h-4" />
          {{ post.commentCount }}
        </span>
      </div>
    </div>

    <!-- Tags -->
    <div class="flex gap-2 flex-wrap mt-4">
      <span
          v-for="tag in post.tags"
          :key="tag"
          class="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Comment Section -->
    <section class="mt-10">
      <h2 class="text-lg font-black text-slate-900 mb-6">댓글 {{ post.commentCount }}개</h2>

      <!-- Write comment -->
      <div class="bg-white rounded-2xl border border-sky-100 p-5 mb-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-black">
            나
          </div>
          <span class="text-sm text-slate-600">나</span>
        </div>
        <textarea
            v-model="commentText"
            placeholder="댓글을 입력해주세요..."
            class="w-full mt-3 p-4 rounded-xl border border-sky-100 bg-sky-50/50 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white placeholder-slate-400 transition-all duration-200"
        />
        <div class="flex justify-end mt-3">
          <button
              @click="submitComment"
              :disabled="isSubmitDisabled"
              class="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            댓글 등록
          </button>
        </div>
      </div>

      <!-- Comment list -->
      <div class="space-y-5">
        <div
            v-for="comment in comments"
            :key="comment.id"
            class="flex gap-3"
            :class="comment.isMine ? 'bg-sky-50/50 rounded-xl p-3 border border-sky-100' : ''"
        >
          <!-- Avatar -->
          <div
              class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-black shrink-0"
              :class="avatarGradient(comment.authorInitial)"
          >
            {{ comment.authorInitial }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="font-semibold text-sm text-slate-800">{{ comment.author }}</span>
              <span class="text-xs text-slate-400">{{ comment.timeAgo }}</span>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed mt-1">{{ comment.content }}</p>
            <div class="flex items-center gap-3 mt-2">
              <button
                  @click="toggleCommentLike(comment.id)"
                  class="text-xs text-slate-400 hover:text-sky-500 transition-colors duration-200 cursor-pointer"
              >
                좋아요 {{ comment.likes }}
              </button>
              <button class="text-xs text-slate-400 hover:text-sky-500 transition-colors duration-200 cursor-pointer">
                답글
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- Toast -->
  <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
  >
    <div
        v-if="toastVisible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-5 py-3 rounded-full shadow-lg whitespace-nowrap"
    >
      {{ toastMessage }}
    </div>
  </Transition>
</template>
