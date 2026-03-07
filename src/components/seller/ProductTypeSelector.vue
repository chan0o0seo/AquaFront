<script setup lang="ts">
import { Fish, Bug, Leaf, Wrench, Beef, Gem } from 'lucide-vue-next'

type ProductType = 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'

interface Props {
  modelValue: ProductType | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ProductType]
}>()

const productTypes: { value: ProductType; label: string; icon: typeof Fish }[] = [
  { value: 'FISH', label: '어류', icon: Fish },
  { value: 'INVERTEBRATE', label: '무척추동물', icon: Bug },
  { value: 'PLANT', label: '수초', icon: Leaf },
  { value: 'EQUIPMENT', label: '용품·장비', icon: Wrench },
  { value: 'FOOD', label: '사료', icon: Beef },
  { value: 'ACCESSORY', label: '소품', icon: Gem }
]

const selectType = (type: ProductType) => {
  emit('update:modelValue', type)
}
</script>

<template>
  <div>
    <label class="block text-sm font-semibold text-slate-700 mb-3">
      상품 유형 <span class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="type in productTypes"
        :key="type.value"
        type="button"
        @click="selectType(type.value)"
        class="rounded-xl border-2 py-4 text-center cursor-pointer transition-all duration-150"
        :class="[
          modelValue === type.value
            ? 'border-sky-400 bg-sky-50'
            : 'border-slate-200 bg-white hover:border-slate-300'
        ]"
      >
        <component
          :is="type.icon"
          class="w-6 h-6 mx-auto mb-2"
          :class="[
            modelValue === type.value ? 'text-sky-500' : 'text-slate-400'
          ]"
        />
        <span
          class="text-sm font-medium"
          :class="[
            modelValue === type.value ? 'text-sky-700' : 'text-slate-600'
          ]"
        >
          {{ type.label }}
        </span>
      </button>
    </div>
  </div>
</template>
