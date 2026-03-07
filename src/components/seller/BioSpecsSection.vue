<script setup lang="ts">
type WaterType = 'FRESHWATER' | 'SALTWATER' | 'BRACKISH'
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

interface BioSpecs {
  waterType: WaterType | null
  difficulty: Difficulty | null
  waterTemperatureMin: number | null
  waterTemperatureMax: number | null
  phMin: number | null
  phMax: number | null
  isCompatible: boolean | null
  minimumTankSize: number | null
}

interface Props {
  modelValue: BioSpecs
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: BioSpecs]
}>()

const waterTypes: { value: WaterType; label: string }[] = [
  { value: 'FRESHWATER', label: '담수' },
  { value: 'SALTWATER', label: '해수' },
  { value: 'BRACKISH', label: '기수' }
]

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'BEGINNER', label: '입문', color: 'emerald' },
  { value: 'INTERMEDIATE', label: '중급', color: 'amber' },
  { value: 'ADVANCED', label: '고급', color: 'red' }
]

const updateField = <K extends keyof BioSpecs>(field: K, value: BioSpecs[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<template>
  <div class="bg-sky-50 rounded-2xl border border-sky-100 p-6">
    <h3 class="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
      생물 사양 정보
    </h3>
    <p class="text-xs text-slate-400 mb-5">(선택사항)</p>
    
    <div class="space-y-5">
      <!-- Water Type -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">수질 유형</label>
        <div class="flex gap-2">
          <button
            v-for="type in waterTypes"
            :key="type.value"
            type="button"
            @click="updateField('waterType', type.value)"
            class="px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150"
            :class="[
              modelValue.waterType === type.value
                ? 'border-sky-400 bg-sky-100 text-sky-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            ]"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
      
      <!-- Difficulty -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">난이도</label>
        <div class="flex gap-2">
          <button
            v-for="diff in difficulties"
            :key="diff.value"
            type="button"
            @click="updateField('difficulty', diff.value)"
            class="px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150"
            :class="[
              modelValue.difficulty === diff.value
                ? diff.color === 'emerald' 
                  ? 'border-emerald-400 bg-emerald-100 text-emerald-600'
                  : diff.color === 'amber'
                    ? 'border-amber-400 bg-amber-100 text-amber-600'
                    : 'border-red-400 bg-red-100 text-red-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            ]"
          >
            {{ diff.label }}
          </button>
        </div>
      </div>
      
      <!-- Temperature Range -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">수온 범위</label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            :value="modelValue.waterTemperatureMin"
            @input="updateField('waterTemperatureMin', ($event.target as HTMLInputElement).valueAsNumber || null)"
            placeholder="20"
            class="w-20 px-3 py-2 rounded-xl border border-sky-100 bg-white text-slate-800 text-center
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all duration-150"
          />
          <span class="text-slate-400">~</span>
          <input
            type="number"
            :value="modelValue.waterTemperatureMax"
            @input="updateField('waterTemperatureMax', ($event.target as HTMLInputElement).valueAsNumber || null)"
            placeholder="28"
            class="w-20 px-3 py-2 rounded-xl border border-sky-100 bg-white text-slate-800 text-center
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all duration-150"
          />
          <span class="text-slate-500 text-sm">°C</span>
        </div>
      </div>
      
      <!-- pH Range -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">pH 범위</label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            :value="modelValue.phMin"
            @input="updateField('phMin', ($event.target as HTMLInputElement).valueAsNumber || null)"
            placeholder="6.5"
            class="w-20 px-3 py-2 rounded-xl border border-sky-100 bg-white text-slate-800 text-center
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all duration-150"
          />
          <span class="text-slate-400">~</span>
          <input
            type="number"
            step="0.1"
            :value="modelValue.phMax"
            @input="updateField('phMax', ($event.target as HTMLInputElement).valueAsNumber || null)"
            placeholder="8.0"
            class="w-20 px-3 py-2 rounded-xl border border-sky-100 bg-white text-slate-800 text-center
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all duration-150"
          />
        </div>
      </div>
      
      <!-- Compatibility Toggle -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">합사 가능 여부</label>
        <div class="flex gap-3">
          <button
            type="button"
            @click="updateField('isCompatible', true)"
            class="px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150"
            :class="[
              modelValue.isCompatible === true
                ? 'border-emerald-400 bg-emerald-100 text-emerald-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            ]"
          >
            합사 가능
          </button>
          <button
            type="button"
            @click="updateField('isCompatible', false)"
            class="px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150"
            :class="[
              modelValue.isCompatible === false
                ? 'border-red-400 bg-red-100 text-red-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            ]"
          >
            합사 불가
          </button>
        </div>
      </div>
      
      <!-- Minimum Tank Size -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">최소 수조 크기</label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            :value="modelValue.minimumTankSize"
            @input="updateField('minimumTankSize', ($event.target as HTMLInputElement).valueAsNumber || null)"
            placeholder="60"
            class="w-24 px-3 py-2 rounded-xl border border-sky-100 bg-white text-slate-800
                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                   focus:border-transparent transition-all duration-150"
          />
          <span class="text-slate-500 text-sm">L</span>
        </div>
      </div>
    </div>
  </div>
</template>
