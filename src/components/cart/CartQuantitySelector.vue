<script setup lang="ts">
import { ref } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

const props = defineProps<{
  quantity: number
  max: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [value: number]
}>()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const handleDecrement = () => {
  if (props.disabled || props.quantity <= 1) return
  if (debounceTimer) return
  debounceTimer = setTimeout(() => { debounceTimer = null }, 100)
  emit('update', props.quantity - 1)
}

const handleIncrement = () => {
  if (props.disabled || props.quantity >= props.max) return
  if (debounceTimer) return
  debounceTimer = setTimeout(() => { debounceTimer = null }, 100)
  emit('update', props.quantity + 1)
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      @click.prevent="handleDecrement"
      :disabled="disabled || quantity <= 1"
      class="w-8 h-8 rounded-full border border-sky-100 text-slate-600 hover:bg-sky-50 font-bold text-sm transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      <Minus class="w-4 h-4" />
    </button>
    <span class="w-8 text-center font-semibold text-slate-800">{{ quantity }}</span>
    <button
      type="button"
      @click.prevent="handleIncrement"
      :disabled="disabled || quantity >= max"
      class="w-8 h-8 rounded-full border border-sky-100 text-slate-600 hover:bg-sky-50 font-bold text-sm transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      <Plus class="w-4 h-4" />
    </button>
  </div>
</template>
