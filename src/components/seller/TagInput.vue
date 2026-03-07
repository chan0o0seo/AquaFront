<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  modelValue: string[]
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxTags: 10
})

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
}>()

const inputValue = ref('')

// Add tag
const addTag = () => {
  const tag = inputValue.value.trim().replace(/,/g, '')
  
  if (!tag) return
  if (props.modelValue.length >= props.maxTags) return
  if (props.modelValue.includes(tag)) {
    inputValue.value = ''
    return
  }
  
  emit('update:modelValue', [...props.modelValue, tag])
  inputValue.value = ''
}

// Handle key events
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

// Handle input (for comma detection)
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.value.includes(',')) {
    inputValue.value = target.value.replace(/,/g, '')
    addTag()
  }
}

// Remove tag
const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <label class="text-sm font-semibold text-slate-700">
        태그 <span class="text-slate-400 font-normal">(최대 {{ maxTags }}개)</span>
      </label>
      <span class="text-xs text-slate-400">{{ modelValue.length }}/{{ maxTags }}</span>
    </div>
    
    <!-- Tags display -->
    <div class="flex flex-wrap gap-2 mb-3" v-if="modelValue.length > 0">
      <span
        v-for="(tag, index) in modelValue"
        :key="index"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm"
      >
        {{ tag }}
        <button
          type="button"
          @click="removeTag(index)"
          class="p-0.5 hover:bg-sky-200 rounded-full transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </span>
    </div>
    
    <!-- Input -->
    <input
      v-model="inputValue"
      type="text"
      :disabled="modelValue.length >= maxTags"
      @keydown="handleKeydown"
      @input="handleInput"
      placeholder="태그를 입력하고 Enter 또는 쉼표로 추가"
      class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
             placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
             focus:border-transparent transition-all duration-150
             disabled:bg-slate-50 disabled:cursor-not-allowed"
    />
  </div>
</template>
