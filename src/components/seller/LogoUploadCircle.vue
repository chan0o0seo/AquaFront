<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { Camera } from 'lucide-vue-next'

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
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(props.existingUrl || null)
const isHovered = ref(false)

// Watch for external existingUrl changes
watch(() => props.existingUrl, (newUrl) => {
  if (newUrl && !props.modelValue) {
    previewUrl.value = newUrl
  }
})

// Handle file selection
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    // Revoke previous object URL to prevent memory leak
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }
    
    // Create new preview URL
    previewUrl.value = URL.createObjectURL(file)
    emit('update:modelValue', file)
  }
}

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Cleanup on unmount
onUnmounted(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileSelect"
    />
    
    <!-- Upload circle -->
    <button
      type="button"
      @click="triggerFileInput"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      class="relative w-32 h-32 rounded-full border-2 border-dashed overflow-hidden
             flex items-center justify-center cursor-pointer
             transition-all duration-200"
      :class="[
        previewUrl 
          ? 'border-transparent' 
          : 'border-sky-200 bg-sky-50 hover:border-sky-400 hover:bg-sky-100'
      ]"
    >
      <!-- Empty state -->
      <template v-if="!previewUrl">
        <div class="flex flex-col items-center gap-2">
          <Camera class="w-8 h-8 text-sky-400" />
          <span class="text-xs text-slate-400">로고 업로드</span>
        </div>
      </template>
      
      <!-- Image preview -->
      <template v-else>
        <img
          :src="previewUrl"
          alt="로고 미리보기"
          class="w-full h-full object-cover"
        />
        <!-- Hover overlay -->
        <div
          v-show="isHovered"
          class="absolute inset-0 bg-black/50 flex items-center justify-center
                 transition-opacity duration-200"
        >
          <span class="text-white text-sm font-medium">변경</span>
        </div>
      </template>
    </button>
    
    <!-- Helper text -->
    <p class="text-xs text-slate-400 mt-2">
      권장 크기: 400x400px, JPG/PNG
    </p>
  </div>
</template>
