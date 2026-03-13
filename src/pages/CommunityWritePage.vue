<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Send, Loader2 } from 'lucide-vue-next'
import { communityApi, uploadFiles, type BoardCategoryResponse } from '@/api'
import RichTextEditor from '@/components/community/RichTextEditor.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isLoggedIn, isAdmin } = storeToRefs(authStore)

const postId = computed(() => route.params.postId as string | undefined)
const isEditMode = computed(() => !!postId.value && postId.value !== 'write')

// ─── Form state ──────────────────────────────────────────
const categories = ref<BoardCategoryResponse[]>([])
const selectedCategoryId = ref<number | null>(null)
const title = ref('')
const content = ref('')

// ─── UI state ────────────────────────────────────────────
const isLoadingForm = ref(true)
const isSubmitting = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const isSubmittable = computed(() =>
  selectedCategoryId.value !== null && title.value.trim().length > 0 && content.value.trim().length > 0
)

// ─── Init ────────────────────────────────────────────────
onMounted(async () => {
  if (!isLoggedIn.value) { router.replace('/login'); return }
  try {
    const all = await communityApi.getCategories()
    // 공지사항은 관리자만 선택 가능
    categories.value = isAdmin.value ? all : all.filter(c => c.type !== 'NOTICE')
    if (categories.value.length > 0) selectedCategoryId.value = categories.value[0].id

    if (isEditMode.value) {
      const post = await communityApi.getPost(Number(postId.value))
      selectedCategoryId.value = post.categoryId
      title.value = post.title
      content.value = post.content
      existingImageUrls.value = [...post.imageUrls]
    }
  } finally {
    isLoadingForm.value = false
  }
})

// ─── Submit ───────────────────────────────────────────────
function showToastMessage(msg: string) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

async function handleSubmit() {
  if (!isSubmittable.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      await communityApi.updatePost(Number(postId.value), {
        title: title.value.trim(),
        content: content.value,
        imageUrls: [],
      })
      router.push(`/community/${postId.value}`)
    } else {
      const created = await communityApi.createPost({
        categoryId: selectedCategoryId.value!,
        title: title.value.trim(),
        content: content.value,
        imageUrls: [],
      })
      router.push(`/community/${created.id}`)
    }
  } catch (e: any) {
    showToastMessage(e?.response?.data?.message ?? '저장에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-sky-50/40 font-sans">
    <div class="max-w-3xl mx-auto px-6 py-12 mt-16">

      <!-- Back button -->
      <button
        class="flex items-center gap-2 text-slate-400 hover:text-sky-500 text-sm mb-8 transition-colors"
        @click="router.back()"
      >
        <ArrowLeft class="w-4 h-4" />
        돌아가기
      </button>

      <h1 class="text-2xl font-black text-slate-900 mb-8">
        {{ isEditMode ? '게시글 수정' : '게시글 작성' }}
      </h1>

      <!-- 로딩 -->
      <div v-if="isLoadingForm" class="flex justify-center py-20">
        <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
      </div>

      <template v-else>
        <!-- Form card -->
        <div class="bg-white rounded-2xl border border-sky-100 p-8 space-y-6">

          <!-- Category -->
          <div>
            <label class="text-sm font-semibold text-slate-700 mb-2 block">게시판 선택</label>
            <div class="relative">
              <select
                v-model="selectedCategoryId"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer pr-10"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="text-sm font-semibold text-slate-700 mb-2 block">제목</label>
            <input
              v-model="title"
              type="text"
              maxlength="100"
              placeholder="제목을 입력하세요"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-slate-300"
            />
            <p class="text-xs text-slate-400 text-right mt-1">{{ title.length }}/100</p>
          </div>

          <!-- Content -->
          <div>
            <label class="text-sm font-semibold text-slate-700 mb-2 block">내용</label>
            <RichTextEditor v-model="content" placeholder="내용을 입력하세요. 툴바에서 서식을 적용하거나 이미지를 삽입할 수 있습니다." />
          </div>

        </div>

        <!-- Action bar -->
        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-sky-50">
          <button
            type="button"
            class="border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-full px-5 py-2.5 text-sm transition-colors"
            @click="router.back()"
          >
            취소
          </button>
          <button
            type="button"
            class="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!isSubmittable || isSubmitting"
            @click="handleSubmit"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
            {{ isEditMode ? '수정하기' : '등록하기' }}
          </button>
        </div>
      </template>

    </div>

    <!-- Toast -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 whitespace-nowrap"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </main>
</template>
