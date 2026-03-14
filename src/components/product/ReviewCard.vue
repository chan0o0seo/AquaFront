<script setup lang="ts">
import { computed } from 'vue'
import { Star, Lock } from 'lucide-vue-next'

interface Review {
  id: number
  reviewerId: string | null
  reviewerNickName: string
  rating: number
  content: string | null
  imageUrls: string[]
  createdAt: string
  secret: boolean
  masked: boolean
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

const isOwn = computed(() =>
  props.currentUserId !== null && props.review.reviewerId === props.currentUserId
)

const formattedDate = computed(() => {
  const date = new Date(props.review.createdAt)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
})

const avatarLetter = computed(() =>
  props.review.reviewerNickName.charAt(0).toUpperCase()
)
</script>

<template>
  <div class="border-b border-sky-50 py-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          :class="review.masked ? 'bg-slate-200' : 'bg-gradient-to-br from-sky-300 to-teal-400'"
        >
          {{ avatarLetter }}
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-semibold text-slate-800">{{ review.reviewerNickName }}</span>
            <!-- 비밀 리뷰 배지 -->
            <span
              v-if="review.secret"
              class="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              :class="review.masked ? 'bg-slate-100 text-slate-400' : 'bg-sky-100 text-sky-600'"
            >
              <Lock class="w-2.5 h-2.5" />
              비밀
            </span>
          </div>
          <span class="text-slate-400 text-sm">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Delete button (본인 리뷰만) -->
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

    <!-- 가려진 내용 -->
    <div v-if="review.masked" class="mt-2 flex items-center gap-1.5 text-slate-400 text-sm">
      <Lock class="w-3.5 h-3.5" />
      비밀 리뷰입니다.
    </div>

    <!-- 실제 내용 -->
    <template v-else>
      <p class="text-slate-700 mt-2 whitespace-pre-wrap">{{ review.content }}</p>
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
    </template>
  </div>
</template>
