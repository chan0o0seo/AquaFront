<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

interface Review {
  id: number
  reviewerId: string
  reviewerNickName: string
  rating: number
  content: string
  imageUrls: string[]
  createdAt: string
}

interface Props {
  review: Review
  currentUserId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  currentUserId: null
})

const emit = defineEmits<{
  (e: 'delete', reviewId: number): void
}>()

const isOwn = computed(() => {
  return props.currentUserId !== null && props.review.reviewerId === props.currentUserId
})

const formattedDate = computed(() => {
  const date = new Date(props.review.createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
})

const avatarLetter = computed(() => {
  return props.review.reviewerNickName.charAt(0).toUpperCase()
})
</script>

<template>
  <div class="border-b border-sky-50 py-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
          {{ avatarLetter }}
        </div>
        <div>
          <span class="font-semibold text-slate-800">{{ review.reviewerNickName }}</span>
          <span class="text-slate-400 text-sm ml-2">{{ formattedDate }}</span>
        </div>
      </div>
      
      <!-- Delete button (own review only) -->
      <button
        v-show="isOwn"
        @click="emit('delete', review.id)"
        class="text-sm text-slate-400 hover:text-red-500 transition-colors"
      >
        삭제
      </button>
    </div>
    
    <!-- Stars -->
    <div class="flex gap-0.5 mt-2">
      <Star
        v-for="i in 5"
        :key="i"
        :size="16"
        :class="i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
      />
    </div>
    
    <!-- Content -->
    <p class="text-slate-700 mt-2 whitespace-pre-wrap">{{ review.content }}</p>
    
    <!-- Images -->
    <div v-if="review.imageUrls && review.imageUrls.length > 0" class="flex gap-2 mt-3 overflow-x-auto">
      <img
        v-for="(url, index) in review.imageUrls"
        :key="index"
        :src="url"
        :alt="`리뷰 이미지 ${index + 1}`"
        loading="lazy"
        width="80"
        height="80"
        class="w-20 h-20 rounded-xl object-cover flex-shrink-0"
      />
    </div>
  </div>
</template>
