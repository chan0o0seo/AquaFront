<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ImagePlus, X, Save, Send } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const postId = computed(() => route.params.postId as string | undefined)
const isEditMode = computed(() => !!postId.value && postId.value !== 'write')

// Form state
const selectedCategory = ref('자유게시판')
const title = ref('')
const content = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const images = ref<File[]>([])
const imagePreviews = ref<string[]>([])

// UI state
const showToast = ref(false)
const toastMessage = ref('')
const isSubmitting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const tagInputRef = ref<HTMLInputElement | null>(null)

const categories = ['자유게시판', '사육일기', '질문·답변', '거래후기']

const mockExistingPost = {
  category: '자유게시판',
  title: '오늘 도착한 L-046 메두사 플레코 공유합니다',
  content: '어제 주문한 녀석이 오늘 드디어 도착했습니다!\n\n사이즈는 약 6cm 정도고 포장 상태가 굉장히 꼼꼼했어요.',
  tags: ['플레코', 'L번호', '메두사'],
  images: [] as File[]
}

onMounted(() => {
  if (isEditMode.value) {
    selectedCategory.value = mockExistingPost.category
    title.value = mockExistingPost.title
    content.value = mockExistingPost.content
    tags.value = [...mockExistingPost.tags]
  }
})

const isSubmittable = computed(() => title.value.trim().length > 0 && content.value.trim().length > 0)

// Tag handling
const addTag = () => {
  const raw = tagInput.value.replace(/,/g, '').trim()
  if (raw && !tags.value.includes(raw) && tags.value.length < 10) {
    tags.value.push(raw)
  }
  tagInput.value = ''
}

const onTagKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && tagInput.value === '' && tags.value.length > 0) {
    tags.value.pop()
  }
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}

// Image handling
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const remaining = 5 - images.value.length
  const newFiles = Array.from(input.files).slice(0, remaining)
  newFiles.forEach(file => {
    images.value.push(file)
    imagePreviews.value.push(URL.createObjectURL(file))
  })
  input.value = ''
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviews.value[index])
  images.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

// Submit
const showToastMessage = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

const handleSubmit = async () => {
  if (!isSubmittable.value) {
    showToastMessage('제목과 내용을 입력해주세요')
    return
  }
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  isSubmitting.value = false
  if (isEditMode.value) {
    router.push(`/community/${postId.value}`)
  } else {
    router.push('/community')
  }
}

const handleDraftSave = () => {
  showToastMessage('임시저장 되었습니다')
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

      <!-- Page title -->
      <h1 class="text-2xl font-black text-slate-900 mb-8">
        {{ isEditMode ? '게시글 수정' : '게시글 작성' }}
      </h1>

      <!-- Form card -->
      <div class="bg-white rounded-2xl border border-sky-100 p-8 space-y-6">

        <!-- Category -->
        <div>
          <label class="text-sm font-semibold text-slate-700 mb-2 block">게시판 선택</label>
          <div class="relative">
            <select
                v-model="selectedCategory"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer pr-10"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
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
          <textarea
              v-model="content"
              placeholder="내용을 입력하세요. 수조 환경, 사육 팁, 거래 후기 등 아쿠아리움에 관한 모든 이야기를 나눠보세요."
              class="w-full px-4 py-4 rounded-xl border border-sky-100 bg-white text-slate-700 text-sm leading-relaxed min-h-[320px] resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-slate-300"
          />
          <p class="text-xs text-slate-400 text-right mt-1">{{ content.length }}자</p>
        </div>

        <!-- Image upload -->
        <div>
          <label class="text-sm font-semibold text-slate-700 mb-2 block">이미지 첨부</label>
          <p class="text-xs text-slate-400 mb-3">최대 5장까지 첨부할 수 있습니다</p>

          <button
              v-if="images.length < 5"
              type="button"
              class="w-full border-2 border-dashed border-sky-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-sky-50 transition-colors"
              @click="triggerFileInput"
          >
            <ImagePlus class="w-8 h-8 text-sky-400 mx-auto mb-2" />
            <p class="text-sm text-sky-500 font-medium">클릭하여 이미지 추가</p>
            <p class="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (최대 10MB)</p>
          </button>
          <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onFileSelect"
          />

          <!-- Image previews -->
          <div v-if="imagePreviews.length > 0" class="grid grid-cols-4 gap-3 mt-4">
            <div
                v-for="(preview, idx) in imagePreviews"
                :key="idx"
                class="relative aspect-square rounded-xl overflow-hidden bg-sky-50"
            >
              <img :src="preview" :alt="`첨부 이미지 ${idx + 1}`" class="w-full h-full object-cover" />
              <button
                  type="button"
                  class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/60 text-white flex items-center justify-center text-xs hover:bg-slate-900/80 transition-colors"
                  @click="removeImage(idx)"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="text-sm font-semibold text-slate-700 mb-2 block">태그</label>
          <p class="text-xs text-slate-400 mb-3">Enter 또는 쉼표로 구분, 최대 10개</p>
          <div
              class="border border-sky-100 rounded-xl px-4 py-3 flex flex-wrap gap-2 min-h-[52px] cursor-text focus-within:ring-2 focus-within:ring-sky-400"
              @click="tagInputRef?.focus()"
          >
            <span
                v-for="(tag, idx) in tags"
                :key="tag"
                class="bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              {{ tag }}
              <button
                  type="button"
                  class="text-sky-500 hover:text-sky-700 transition-colors"
                  @click.stop="removeTag(idx)"
              >
                <X class="w-3 h-3" />
              </button>
            </span>
            <input
                v-if="tags.length < 10"
                ref="tagInputRef"
                v-model="tagInput"
                type="text"
                placeholder="태그 입력..."
                class="border-none outline-none text-sm text-slate-700 flex-1 min-w-[120px] bg-transparent placeholder-slate-300"
                @keydown="onTagKeydown"
                @blur="addTag"
            />
          </div>
        </div>

      </div>

      <!-- Action bar -->
      <div class="flex items-center justify-between mt-8 pt-6 border-t border-sky-50">
        <!-- Draft save -->
        <button
            type="button"
            class="border border-sky-200 text-sky-500 hover:bg-sky-50 rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors"
            @click="handleDraftSave"
        >
          <Save class="w-4 h-4" />
          임시저장
        </button>

        <!-- Right actions -->
        <div class="flex gap-3">
          <button
              type="button"
              class="border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-full px-5 py-2.5 text-sm transition-colors"
              @click="router.back()"
          >
            취소
          </button>
          <button
              type="button"
              class="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-2.5 text-sm font-bold flex items-center gap-2 transition-all"
              :class="!isSubmittable || isSubmitting ? 'opacity-40 cursor-not-allowed' : ''"
              :disabled="!isSubmittable || isSubmitting"
              @click="handleSubmit"
          >
            <Send class="w-4 h-4" />
            {{ isEditMode ? '수정하기' : '등록하기' }}
          </button>
        </div>
      </div>

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
