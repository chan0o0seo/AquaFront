<script setup lang="ts">
interface Props {
  modelValue: number
  maxQuantity: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  maxQuantity: 99,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const decrease = () => {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

const increase = () => {
  if (props.modelValue < props.maxQuantity) {
    emit('update:modelValue', props.modelValue + 1)
  }
}
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      @click="decrease"
      :disabled="disabled || modelValue <= 1"
      class="w-10 h-10 rounded-full border border-sky-200 text-slate-700 font-bold
             hover:bg-sky-50 transition-colors duration-200
             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      −
    </button>
    <span class="w-12 text-center text-lg font-semibold text-slate-800">
      {{ modelValue }}
    </span>
    <button
      @click="increase"
      :disabled="disabled || modelValue >= maxQuantity"
      class="w-10 h-10 rounded-full border border-sky-200 text-slate-700 font-bold
             hover:bg-sky-50 transition-colors duration-200
             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      +
    </button>
  </div>
</template>
