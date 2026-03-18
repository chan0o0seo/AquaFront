<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { ImagePlus, X } from 'lucide-vue-next'

interface Props {
  modelValue?: File | null
  existingUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  existingUrl: null
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'remove': []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(props.existingUrl || null)
const isHovered = ref(false)

watch(() => props.existingUrl, (newUrl) => {
  if (newUrl && !props.modelValue) previewUrl.value = newUrl
})

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
}

const remove = (e: MouseEvent) => {
  e.stopPropagation()
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  emit('update:modelValue', null)
  emit('remove')
  if (fileInput.value) fileInput.value.value = ''
}

onUnmounted(() => {
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 배너 영역 -->
    <div
      class="relative w-full rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200"
      style="aspect-ratio: 4/1; min-height: 96px;"
      :class="previewUrl
        ? 'border-transparent'
        : 'border-dashed border-sky-200 bg-sky-50 hover:border-sky-400 hover:bg-sky-100'"
      @click="fileInput?.click()"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- 빈 상태 -->
      <template v-if="!previewUrl">
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <ImagePlus class="w-8 h-8 text-sky-400" />
          <span class="text-sm text-slate-400 font-medium">배너 이미지 업로드</span>
          <span class="text-xs text-slate-300">권장 크기: 1200×300px · JPG/PNG/WEBP</span>
        </div>
      </template>

      <!-- 이미지 미리보기 -->
      <template v-else>
        <img
          :src="previewUrl"
          alt="배너 미리보기"
          class="w-full h-full object-cover"
        />

        <!-- hover 오버레이 -->
        <div
          v-show="isHovered"
          class="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity"
        >
          <span class="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            이미지 변경
          </span>
        </div>

        <!-- 삭제 버튼 -->
        <button
          type="button"
          @click="remove"
          class="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
        >
          <X class="w-4 h-4" />
        </button>
      </template>
    </div>
  </div>
</template>
