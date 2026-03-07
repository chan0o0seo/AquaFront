<script setup lang="ts">
type ProductType = '' | 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'

interface FilterTab {
  value: ProductType
  label: string
}

const props = defineProps<{
  modelValue: ProductType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductType): void
}>()

const tabs: FilterTab[] = [
  { value: '', label: '전체' },
  { value: 'FISH', label: '어류' },
  { value: 'INVERTEBRATE', label: '무척추동물' },
  { value: 'PLANT', label: '수초' },
  { value: 'EQUIPMENT', label: '용품/장비' },
  { value: 'FOOD', label: '사료' },
  { value: 'ACCESSORY', label: '소품' }
]

const handleTabClick = (value: ProductType) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="bg-white border-b border-sky-100">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="handleTabClick(tab.value)"
          :class="[
            'px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-full',
            modelValue === tab.value
              ? 'bg-sky-500 text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-sky-50'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
