<script setup lang="ts">
import { Loader2, Eye } from 'lucide-vue-next'

interface Props {
  isValid: boolean
  isSubmitting: boolean
  isEditMode?: boolean
  missingFields?: string[]
}

withDefaults(defineProps<Props>(), { isEditMode: false, missingFields: () => [] })

const emit = defineEmits<{
  'preview': []
  'submit': []
}>()
</script>

<template>
  <div class="sticky bottom-0 bg-white border-t border-sky-100 px-6 py-4 -mx-6 -mb-6 mt-6">
    <p v-if="!isValid && missingFields.length > 0" class="text-xs text-slate-400 text-right mb-2">
      미입력: <span class="text-red-400 font-medium">{{ missingFields.join(', ') }}</span>
    </p>
    <div class="flex items-center justify-end gap-3">
      <button
        type="button"
        @click="emit('preview')"
        class="flex items-center gap-2 px-5 py-2.5 border border-sky-200 rounded-full
               text-sky-600 hover:bg-sky-50 transition-colors"
      >
        <Eye class="w-4 h-4" />
        <span class="text-sm font-medium">미리보기</span>
      </button>

      <button
        type="button"
        @click="emit('submit')"
        :disabled="!isValid || isSubmitting"
        class="flex items-center gap-2 px-8 py-2.5 rounded-full font-bold text-white transition-all duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        :class="isValid && !isSubmitting ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-300'"
      >
        <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
        <span>{{ isEditMode ? '수정 완료' : '상품 등록하기' }}</span>
      </button>
    </div>
  </div>
</template>
