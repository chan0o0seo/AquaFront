<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

interface Props {
  averageRating: number
  reviewCount: number
  ratingBreakdown?: Record<number, number>
}

const props = withDefaults(defineProps<Props>(), {
  averageRating: 0,
  reviewCount: 0,
  ratingBreakdown: () => ({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
})

const filledStars = computed(() => Math.round(props.averageRating))

const getPercentage = (rating: number) => {
  if (props.reviewCount === 0) return 0
  const count = props.ratingBreakdown[rating] || 0
  return (count / props.reviewCount) * 100
}
</script>

<template>
  <div class="flex flex-col md:flex-row items-start md:items-center gap-8 bg-sky-50 rounded-2xl p-6 mb-8 border border-sky-100">
    <!-- Left: Large Rating -->
    <div class="flex items-baseline gap-1">
      <span class="text-6xl font-black text-sky-600">{{ averageRating.toFixed(1) }}</span>
      <span class="text-slate-400 text-xl">/ 5.0</span>
    </div>
    
    <!-- Center: Stars + Count -->
    <div class="flex flex-col items-start gap-2">
      <div class="flex gap-1">
        <Star
          v-for="i in 5"
          :key="i"
          :size="24"
          :class="i <= filledStars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
        />
      </div>
      <span class="text-slate-500 text-sm">총 {{ reviewCount }}개의 리뷰</span>
    </div>
    
    <!-- Right: Rating Breakdown -->
    <div class="flex-1 space-y-2 w-full md:w-auto md:min-w-[200px]">
      <div
        v-for="rating in [5, 4, 3, 2, 1]"
        :key="rating"
        class="flex items-center gap-2"
      >
        <span class="text-xs text-slate-500 w-6">{{ rating }}★</span>
        <div class="flex-1 bg-sky-100 rounded-full h-2 min-w-[80px]">
          <div
            class="bg-sky-400 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getPercentage(rating)}%` }"
          />
        </div>
        <span class="text-xs text-slate-400 w-8 text-right">
          {{ ratingBreakdown[rating] || 0 }}
        </span>
      </div>
    </div>
  </div>
</template>
