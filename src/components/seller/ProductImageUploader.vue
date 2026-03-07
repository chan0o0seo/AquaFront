<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { Plus, X, GripVertical } from 'lucide-vue-next'

interface Props {
  modelValue: File[]
  maxImages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxImages: 3
})

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrls = ref<string[]>([])
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Watch for external changes
watch(() => props.modelValue, (newFiles) => {
  // Only regenerate if files changed externally
  if (newFiles.length !== previewUrls.value.length) {
    regeneratePreviews(newFiles)
  }
}, { deep: true })

// Generate preview URLs
const regeneratePreviews = (files: File[]) => {
  // Revoke old URLs
  previewUrls.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  // Create new URLs
  previewUrls.value = files.map(file => URL.createObjectURL(file))
}

// Handle file selection
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  
  if (selectedFiles.length === 0) return
  
  const currentFiles = [...props.modelValue]
  const remainingSlots = props.maxImages - currentFiles.length
  const filesToAdd = selectedFiles.slice(0, remainingSlots)
  
  // Add new preview URLs
  filesToAdd.forEach(file => {
    previewUrls.value.push(URL.createObjectURL(file))
  })
  
  emit('update:modelValue', [...currentFiles, ...filesToAdd])
  
  // Reset input
  input.value = ''
}

// Remove image
const removeImage = (index: number) => {
  const newFiles = [...props.modelValue]
  newFiles.splice(index, 1)
  
  // Revoke and remove preview URL
  if (previewUrls.value[index]?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrls.value[index])
  }
  previewUrls.value.splice(index, 1)
  
  emit('update:modelValue', newFiles)
}

// Drag and drop reorder
const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  dragOverIndex.value = index
}

const handleDragEnd = () => {
  if (draggedIndex.value !== null && dragOverIndex.value !== null && draggedIndex.value !== dragOverIndex.value) {
    const newFiles = [...props.modelValue]
    const newPreviews = [...previewUrls.value]
    
    // Swap files
    const [draggedFile] = newFiles.splice(draggedIndex.value, 1)
    newFiles.splice(dragOverIndex.value, 0, draggedFile)
    
    // Swap previews
    const [draggedPreview] = newPreviews.splice(draggedIndex.value, 1)
    newPreviews.splice(dragOverIndex.value, 0, draggedPreview)
    
    previewUrls.value = newPreviews
    emit('update:modelValue', newFiles)
  }
  
  draggedIndex.value = null
  dragOverIndex.value = null
}

// Trigger file input
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Cleanup on unmount
onUnmounted(() => {
  previewUrls.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
})
</script>

<template>
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-3">
      이미지 등록 <span class="text-slate-400 font-normal">(최대 {{ maxImages }}장)</span>
    </label>
    
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
    
    <!-- Image grid -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Existing images -->
      <div
        v-for="(url, index) in previewUrls"
        :key="index"
        class="relative aspect-square rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing"
        :class="[
          dragOverIndex === index ? 'border-sky-400 bg-sky-50' : 'border-slate-200'
        ]"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover="(e) => handleDragOver(e, index)"
        @dragend="handleDragEnd"
      >
        <img
          :src="url"
          :alt="`상품 이미지 ${index + 1}`"
          class="w-full h-full object-cover"
        />
        
        <!-- Drag handle -->
        <div class="absolute top-2 left-2 p-1 bg-white/80 rounded-lg">
          <GripVertical class="w-4 h-4 text-slate-400" />
        </div>
        
        <!-- Remove button -->
        <button
          type="button"
          @click="removeImage(index)"
          class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
        >
          <X class="w-4 h-4 text-slate-500 hover:text-red-500" />
        </button>
        
        <!-- Thumbnail indicator -->
        <div
          v-if="index === 0"
          class="absolute bottom-2 left-2 px-2 py-1 bg-sky-500 text-white text-xs rounded-lg font-medium"
        >
          썸네일
        </div>
      </div>
      
      <!-- Add button (if slots remaining) -->
      <button
        v-if="modelValue.length < maxImages"
        type="button"
        @click="triggerFileInput"
        class="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50
               flex flex-col items-center justify-center gap-2 cursor-pointer
               hover:border-sky-300 hover:bg-sky-50 transition-all duration-150"
      >
        <Plus class="w-8 h-8 text-slate-400" />
        <span class="text-xs text-slate-400">사진 추가</span>
      </button>
    </div>
    
    <!-- Helper text -->
    <p class="text-xs text-slate-400 mt-2">
      첫 번째 이미지가 썸네일로 사용됩니다. 드래그하여 순서를 변경할 수 있습니다.
    </p>
  </div>
</template>
