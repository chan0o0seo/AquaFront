<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ThumbsUp, Eye, MessageCircle, Pencil, Trash2, CornerDownRight, Loader2, X } from 'lucide-vue-next'
import { communityApi, type PostDetailResponse, type CommentResponse } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const { user: authUser, isLoggedIn, isAdmin } = storeToRefs(useAuthStore())

const postId = Number(route.params.postId)

// ─── State ────────────────────────────────────────────────
const post = ref<PostDetailResponse | null>(null)
const comments = ref<CommentResponse[]>([])
const isLoading = ref(true)
const commentText = ref('')
const isSubmittingComment = ref(false)

// 대댓글 상태
const replyingToId = ref<number | null>(null)
const replyText = ref('')
const isSubmittingReply = ref(false)

// 댓글 수정 상태
const editingCommentId = ref<number | null>(null)
const editingCommentText = ref('')

// Toast
const toastMessage = ref('')
const toastVisible = ref(false)

// ─── Computed ─────────────────────────────────────────────
const isNoticePost = computed(() => post.value?.categoryName === '공지사항')

// 수정/삭제 버튼 표시:
// - 관리자: 모든 게시글
// - 일반 유저: 본인 글 (단 공지사항 제외)
const canEdit = computed(() => {
  if (!isLoggedIn.value || !post.value) return false
  if (isAdmin.value) return true
  return !isNoticePost.value && post.value.authorNickName === authUser.value?.nickName
})
const isSubmitDisabled = computed(() => commentText.value.trim().length === 0)

// ─── Helpers ──────────────────────────────────────────────
function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2200)
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

function avatarColor(name: string | null): string {
  const gradients = [
    'from-sky-400 to-teal-500',
    'from-emerald-400 to-sky-500',
    'from-amber-400 to-orange-500',
    'from-violet-400 to-sky-500',
    'from-rose-400 to-pink-500',
    'from-teal-400 to-emerald-500',
  ]
  const code = name?.charCodeAt(0) ?? 0
  return gradients[code % gradients.length]
}

function isMyComment(c: CommentResponse): boolean {
  return isLoggedIn.value && !c.deleted && c.authorNickName === authUser.value?.nickName
}

// ─── Data Fetching ────────────────────────────────────────
async function loadPost() {
  post.value = await communityApi.getPost(postId)
}

async function loadComments() {
  comments.value = await communityApi.getComments(postId)
}

onMounted(async () => {
  try {
    await Promise.all([loadPost(), loadComments()])
    // 세션당 1회만 조회수 카운트
    const key = `viewed_post_${postId}`
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      communityApi.recordView(postId).catch(() => {})
      if (post.value) post.value.viewCount++
    }
  } finally {
    isLoading.value = false
  }
})

// ─── Actions ──────────────────────────────────────────────
async function toggleLike() {
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (!post.value) return
  const res = await communityApi.toggleLike(postId)
  post.value.liked = res.liked
  post.value.likeCount += res.liked ? 1 : -1
  showToast(res.liked ? '추천했습니다.' : '추천을 취소했습니다.')
}

async function submitComment() {
  if (isSubmitDisabled.value || isSubmittingComment.value) return
  if (!isLoggedIn.value) { router.push('/login'); return }
  isSubmittingComment.value = true
  try {
    await communityApi.addComment(postId, { content: commentText.value.trim() })
    commentText.value = ''
    await loadComments()
    if (post.value) post.value.commentCount++
    showToast('댓글이 등록되었습니다.')
  } finally {
    isSubmittingComment.value = false
  }
}

async function submitReply(parentId: number) {
  if (!replyText.value.trim() || isSubmittingReply.value) return
  isSubmittingReply.value = true
  try {
    await communityApi.addComment(postId, { content: replyText.value.trim(), parentId })
    replyText.value = ''
    replyingToId.value = null
    await loadComments()
    if (post.value) post.value.commentCount++
    showToast('답글이 등록되었습니다.')
  } finally {
    isSubmittingReply.value = false
  }
}

async function deleteComment(commentId: number) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return
  await communityApi.deleteComment(commentId)
  await loadComments()
  if (post.value) post.value.commentCount--
  showToast('댓글이 삭제되었습니다.')
}

function startEditComment(c: CommentResponse) {
  editingCommentId.value = c.id
  editingCommentText.value = c.content
}

async function submitEditComment(commentId: number) {
  if (!editingCommentText.value.trim()) return
  await communityApi.updateComment(commentId, editingCommentText.value.trim())
  editingCommentId.value = null
  await loadComments()
  showToast('댓글이 수정되었습니다.')
}

async function deletePost() {
  if (!confirm('게시글을 삭제하시겠습니까?')) return
  await communityApi.deletePost(postId)
  showToast('게시글이 삭제되었습니다.')
  setTimeout(() => router.push('/community'), 1000)
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-6 py-10 pb-32 mt-16 lg:pb-10">

    <!-- Back button -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-6 transition-all duration-200"
    >
      <ChevronLeft class="w-4 h-4" />
      돌아가기
    </button>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
    </div>

    <template v-else-if="post">
      <!-- Post Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <span class="bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-xs px-3 py-1">
            {{ post.categoryName }}
          </span>
          <!-- 수정/삭제 액션 -->
          <div v-if="canEdit" class="flex gap-2">
            <button
              @click="router.push(`/community/${postId}/edit`)"
              class="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-500 transition-colors"
            >
              <Pencil class="w-3.5 h-3.5" />수정
            </button>
            <button
              @click="deletePost"
              class="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />삭제
            </button>
          </div>
        </div>
        <h1 class="text-2xl font-black text-slate-900 mt-3 mb-4 leading-snug">{{ post.title }}</h1>

        <!-- Author meta -->
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-black"
            :class="avatarColor(post.authorNickName)"
          >
            {{ post.authorNickName?.charAt(0) }}
          </div>
          <span class="font-semibold text-sm text-slate-800">{{ post.authorNickName }}</span>
          <span class="text-slate-400 text-sm">·</span>
          <span class="text-slate-400 text-sm">{{ timeAgo(post.createdAt) }}</span>
          <span class="text-slate-400 text-sm">·</span>
          <span class="text-slate-400 text-sm">조회 {{ post.viewCount }}</span>
        </div>
      </div>

      <div class="h-px bg-sky-50 my-6" />

      <!-- Post Content -->
      <div class="rounded-2xl border border-sky-100 p-8 bg-white">
        <div class="tiptap-render" v-html="post.content" />
      </div>

      <!-- Reaction Bar -->
      <div class="flex items-center justify-between py-4 border-t border-b border-sky-50 mt-6">
        <button
          @click="toggleLike"
          class="flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-200"
          :class="post.liked
            ? 'bg-sky-50 border-sky-200 text-sky-600'
            : 'border-sky-100 text-slate-400 hover:border-sky-200 hover:text-sky-500'"
        >
          <ThumbsUp class="w-4 h-4" />
          <span class="text-sm font-medium">{{ post.likeCount }}</span>
        </button>
        <div class="flex items-center gap-3 text-sm text-slate-400">
          <span class="flex items-center gap-1"><Eye class="w-4 h-4" />{{ post.viewCount }}</span>
          <span class="flex items-center gap-1"><MessageCircle class="w-4 h-4" />{{ post.commentCount }}</span>
        </div>
      </div>

      <!-- Comment Section -->
      <section class="mt-10">
        <h2 class="text-lg font-black text-slate-900 mb-6">댓글 {{ post.commentCount }}개</h2>

        <!-- Write comment (로그인된 경우만) -->
        <div v-if="isLoggedIn" class="bg-white rounded-2xl border border-sky-100 p-5 mb-6">
          <div class="flex items-center gap-2 mb-3">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-black"
              :class="avatarColor(authUser?.nickName ?? '')"
            >
              {{ authUser?.nickName?.charAt(0) }}
            </div>
            <span class="text-sm text-slate-600">{{ authUser?.nickName }}</span>
          </div>
          <textarea
            v-model="commentText"
            placeholder="댓글을 입력해주세요..."
            class="w-full p-4 rounded-xl border border-sky-100 bg-sky-50/50 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white placeholder-slate-400 transition-all duration-200"
          />
          <div class="flex justify-end mt-3">
            <button
              @click="submitComment"
              :disabled="isSubmitDisabled || isSubmittingComment"
              class="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Loader2 v-if="isSubmittingComment" class="w-3.5 h-3.5 animate-spin" />
              댓글 등록
            </button>
          </div>
        </div>
        <div v-else class="bg-sky-50 rounded-2xl border border-sky-100 p-5 mb-6 text-center">
          <p class="text-sm text-slate-500">
            <button @click="router.push('/login')" class="text-sky-500 font-semibold hover:underline">로그인</button>
            하면 댓글을 작성할 수 있습니다.
          </p>
        </div>

        <!-- Comment list -->
        <div class="space-y-6">
          <div v-for="comment in comments" :key="comment.id">

            <!-- Top-level comment -->
            <div
              class="flex gap-3"
              :class="isMyComment(comment) ? 'bg-sky-50/60 rounded-xl p-3 border border-sky-100' : ''"
            >
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-black shrink-0"
                :class="avatarColor(comment.authorNickName)"
              >
                {{ comment.deleted ? '?' : comment.authorNickName?.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-baseline gap-2">
                    <span class="font-semibold text-sm text-slate-800">
                      {{ comment.deleted ? '(삭제됨)' : comment.authorNickName }}
                    </span>
                    <span class="text-xs text-slate-400">{{ timeAgo(comment.createdAt) }}</span>
                  </div>
                  <div v-if="isMyComment(comment)" class="flex gap-2">
                    <button @click="startEditComment(comment)" class="text-xs text-slate-400 hover:text-sky-500">수정</button>
                    <button @click="deleteComment(comment.id)" class="text-xs text-slate-400 hover:text-red-400">삭제</button>
                  </div>
                </div>

                <!-- 수정 중 -->
                <div v-if="editingCommentId === comment.id" class="mt-2">
                  <textarea
                    v-model="editingCommentText"
                    class="w-full p-3 rounded-xl border border-sky-200 bg-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <div class="flex gap-2 justify-end mt-2">
                    <button @click="editingCommentId = null" class="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 border border-slate-200 rounded-full">취소</button>
                    <button @click="submitEditComment(comment.id)" class="text-xs bg-sky-500 text-white px-3 py-1.5 rounded-full hover:bg-sky-600">저장</button>
                  </div>
                </div>
                <p v-else class="text-sm leading-relaxed mt-1" :class="comment.deleted ? 'text-slate-400 italic' : 'text-slate-600'">
                  {{ comment.content }}
                </p>

                <div v-if="!comment.deleted" class="flex items-center gap-3 mt-2">
                  <button
                    v-if="isLoggedIn"
                    @click="replyingToId = replyingToId === comment.id ? null : comment.id; replyText = ''"
                    class="text-xs text-slate-400 hover:text-sky-500 transition-colors flex items-center gap-1"
                  >
                    <CornerDownRight class="w-3 h-3" />
                    답글
                  </button>
                </div>

                <!-- 답글 입력 -->
                <div v-if="replyingToId === comment.id" class="mt-3">
                  <textarea
                    v-model="replyText"
                    placeholder="답글을 입력해주세요..."
                    class="w-full p-3 rounded-xl border border-sky-100 bg-sky-50/50 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white placeholder-slate-400"
                  />
                  <div class="flex gap-2 justify-end mt-2">
                    <button @click="replyingToId = null; replyText = ''" class="text-xs text-slate-400 px-3 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50 flex items-center gap-1">
                      <X class="w-3 h-3" />취소
                    </button>
                    <button
                      @click="submitReply(comment.id)"
                      :disabled="!replyText.trim() || isSubmittingReply"
                      class="text-xs bg-sky-500 text-white px-3 py-1.5 rounded-full hover:bg-sky-600 disabled:opacity-40 flex items-center gap-1"
                    >
                      <Loader2 v-if="isSubmittingReply" class="w-3 h-3 animate-spin" />
                      등록
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Replies -->
            <div v-if="comment.replies.length > 0" class="ml-11 space-y-4 mt-3">
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="flex gap-3"
                :class="isMyComment(reply) ? 'bg-sky-50/60 rounded-xl p-3 border border-sky-100' : ''"
              >
                <CornerDownRight class="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                <div
                  class="w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-black shrink-0"
                  :class="avatarColor(reply.authorNickName)"
                >
                  {{ reply.deleted ? '?' : reply.authorNickName?.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <div class="flex items-baseline gap-2">
                      <span class="font-semibold text-sm text-slate-800">
                        {{ reply.deleted ? '(삭제됨)' : reply.authorNickName }}
                      </span>
                      <span class="text-xs text-slate-400">{{ timeAgo(reply.createdAt) }}</span>
                    </div>
                    <div v-if="isMyComment(reply)" class="flex gap-2">
                      <button @click="startEditComment(reply)" class="text-xs text-slate-400 hover:text-sky-500">수정</button>
                      <button @click="deleteComment(reply.id)" class="text-xs text-slate-400 hover:text-red-400">삭제</button>
                    </div>
                  </div>
                  <div v-if="editingCommentId === reply.id" class="mt-2">
                    <textarea
                      v-model="editingCommentText"
                      class="w-full p-3 rounded-xl border border-sky-200 bg-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <div class="flex gap-2 justify-end mt-2">
                      <button @click="editingCommentId = null" class="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 border border-slate-200 rounded-full">취소</button>
                      <button @click="submitEditComment(reply.id)" class="text-xs bg-sky-500 text-white px-3 py-1.5 rounded-full hover:bg-sky-600">저장</button>
                    </div>
                  </div>
                  <p v-else class="text-sm leading-relaxed mt-1" :class="reply.deleted ? 'text-slate-400 italic' : 'text-slate-600'">
                    {{ reply.content }}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- 댓글 없음 -->
          <div v-if="comments.length === 0" class="text-center py-8 text-slate-400 text-sm">
            첫 댓글을 남겨보세요!
          </div>
        </div>
      </section>
    </template>

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

  </main>
</template>

<style>
.tiptap-render {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #334155;
}
.tiptap-render p { margin-bottom: 0.75rem; }
.tiptap-render h1 { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin: 1.2rem 0 0.5rem; }
.tiptap-render h2 { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 1rem 0 0.4rem; }
.tiptap-render h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0.8rem 0 0.3rem; }
.tiptap-render strong { font-weight: 700; }
.tiptap-render em { font-style: italic; }
.tiptap-render u { text-decoration: underline; }
.tiptap-render s { text-decoration: line-through; }
.tiptap-render ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap-render ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap-render li { margin-bottom: 0.25rem; }
.tiptap-render blockquote {
  border-left: 3px solid #bae6fd;
  padding: 0.5rem 1rem;
  background: #f0f9ff;
  color: #475569;
  border-radius: 0 8px 8px 0;
  margin: 0.75rem 0;
}
.tiptap-render pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin: 0.75rem 0;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.82rem;
}
.tiptap-render code {
  background: #f1f5f9;
  color: #0ea5e9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.83rem;
}
.tiptap-render pre code { background: none; color: inherit; padding: 0; }
.tiptap-render hr { border: none; border-top: 2px solid #e2e8f0; margin: 1rem 0; }
.tiptap-render img {
  max-width: 100%;
  border-radius: 10px;
  margin: 0.75rem 0;
  display: block;
}
.tiptap-render a { color: #0ea5e9; text-decoration: underline; }
.tiptap-render mark { border-radius: 3px; padding: 0 2px; }
.tiptap-render [style*="text-align: center"] { text-align: center; }
.tiptap-render [style*="text-align: right"]  { text-align: right; }
.tiptap-render [style*="text-align: left"]   { text-align: left; }
</style>
