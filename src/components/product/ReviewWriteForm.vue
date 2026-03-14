<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Star, Plus, X, Lock } from 'lucide-vue-next'

interface ReviewForm {
  rating: number
  content: string
  imageUrls: string[]
  secret: boolean
}

interface Props {
  initialData?: ReviewForm | null
  isEditing?: boolean
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null,
  isEditing: false,
  isSubmitting: false
})

const emit = defineEmits<{
  (e: 'submit', form: ReviewForm): void
  (e: 'cancel'): void
}>()

const form = reactive<ReviewForm>({
  rating: 0,
  content: '',
  imageUrls: [],
  secret: false,
})

const hoverRating = ref(0)

// Initialize form with initial data if editing
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.rating = data.rating
      form.content = data.content
      form.imageUrls = [...data.imageUrls]
      form.secret = data.secret
    }
  },
  { immediate: true }
)

const setRating = (rating: number) => {
  form.rating = rating
}

const removeImage = (index: number) => {
  form.imageUrls.splice(index, 1)
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return
  
  // In real app, upload to server and get URL
  // For now, create object URL for preview
  Array.from(files).forEach((file) => {
    if (form.imageUrls.length < 5) {
      const url = URL.createObjectURL(file)
      form.imageUrls.push(url)
    }
  })
  
  // Reset input
  target.value = ''
}

const handleSubmit = () => {
  if (form.rating === 0) {
    alert('별점을 선택해주세요.')
    return
  }
  if (!form.content.trim()) {
    alert('리뷰 내용을 입력해주세요.')
    return
  }
  emit('submit', { ...form })
}

const handleCancel = () => {
  form.rating = 0
  form.content = ''
  form.imageUrls = []
  form.secret = false
  emit('cancel')
}
</script>

<template>
  <div class="bg-sky-50 rounded-2xl p-6 mb-6 border border-sky-100">
    <h4 class="font-semibold text-slate-800 mb-4">
      {{ isEditing ? '리뷰 수정' : '리뷰 작성' }}
    </h4>
    
    <!-- Star Rating Picker -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-sm text-slate-500 mr-2">별점</span>
      <div class="flex gap-1">
        <button
          v-for="i in 5"
          :key="i"
          @click="setRating(i)"
          @mouseenter="hoverRating = i"
          @mouseleave="hoverRating = 0"
          class="transition-transform hover:scale-110"
        >
          <Star
            :size="28"
            :class="[
              i <= (hoverRating || form.rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            ]"
          />
        </button>
      </div>
      <span v-if="form.rating > 0" class="text-sm text-slate-500 ml-2">
        {{ form.rating }}점
      </span>
    </div>
    
    <!-- Content Textarea -->
    <textarea
      v-model="form.content"
      rows="4"
      placeholder="상품 사용 후기를 남겨주세요. (최대 이미지 5장)"
      class="w-full px-4 py-3 border-2 border-sky-200 rounded-xl
             focus:border-sky-400 focus:outline-none
             placeholder:text-slate-400 text-slate-700
             resize-none transition-colors"
    />
    
    <!-- Image Upload -->
    <div class="flex gap-2 mt-3 flex-wrap">
      <!-- Uploaded Images -->
      <div
        v-for="(url, index) in form.imageUrls"
        :key="index"
        class="relative w-16 h-16 rounded-xl overflow-hidden group"
      >
        <img
          :src="url"
          :alt="`업로드 이미지 ${index + 1}`"
          class="w-full h-full object-cover"
        />
        <button
          @click="removeImage(index)"
          class="absolute inset-0 bg-black/50 flex items-center justify-center
                 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X :size="20" class="text-white" />
        </button>
      </div>
      
      <!-- Add Button -->
      <label
        v-if="form.imageUrls.length < 5"
        class="w-16 h-16 rounded-xl border-2 border-dashed border-sky-200
               flex flex-col items-center justify-center cursor-pointer
               hover:border-sky-400 hover:bg-sky-50 transition-colors"
      >
        <Plus :size="20" class="text-sky-400" />
        <span class="text-xs text-sky-400 mt-0.5">{{ form.imageUrls.length }}/5</span>
        <input
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleImageUpload"
        />
      </label>
    </div>
    
    <!-- 비밀 리뷰 토글 -->
    <label class="flex items-center gap-2 mt-4 cursor-pointer select-none w-fit">
      <button
        type="button"
        @click="form.secret = !form.secret"
        class="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
        :class="form.secret ? 'bg-sky-500' : 'bg-slate-200'"
      >
        <span
          class="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform"
          :class="form.secret ? 'translate-x-5' : 'translate-x-0.5'"
        />
      </button>
      <Lock class="w-3.5 h-3.5" :class="form.secret ? 'text-sky-500' : 'text-slate-400'" />
      <span class="text-sm" :class="form.secret ? 'text-sky-600 font-medium' : 'text-slate-500'">
        비밀 리뷰 (판매자와 나만 볼 수 있어요)
      </span>
    </label>

    <!-- Buttons -->
    <div class="flex gap-3 mt-4">
      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="px-6 py-2 bg-sky-500 text-white font-semibold rounded-full
               hover:bg-sky-600 transition-colors
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? '저장 중...' : (isEditing ? '수정 완료' : '리뷰 등록') }}
      </button>
      <button
        @click="handleCancel"
        :disabled="isSubmitting"
        class="px-6 py-2 text-slate-500 font-semibold rounded-full
               hover:bg-slate-100 transition-colors
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        취소
      </button>
    </div>
  </div>
</template>
