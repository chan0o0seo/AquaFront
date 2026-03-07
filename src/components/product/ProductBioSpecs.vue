<script setup lang="ts">
interface Props {
  waterType?: 'FRESHWATER' | 'SALTWATER' | 'BRACKISH' | null
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
  waterTemperatureMin?: number | null
  waterTemperatureMax?: number | null
  phMin?: number | null
  phMax?: number | null
  isCompatible?: boolean | null
  minimumTankSize?: number | null
  brand?: string | null
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false
})

const waterTypeLabels: Record<string, string> = {
  FRESHWATER: '담수',
  SALTWATER: '해수',
  BRACKISH: '기수'
}

const difficultyLabels: Record<string, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '고급'
}

const hasAnySpec = () => {
  return props.waterType || props.difficulty || 
         (props.waterTemperatureMin !== null && props.waterTemperatureMax !== null) ||
         (props.phMin !== null && props.phMax !== null) ||
         props.isCompatible !== null ||
         props.minimumTankSize !== null ||
         props.brand !== null
}
</script>

<template>
  <div
    v-if="hasAnySpec()"
    v-memo="[waterType, difficulty, waterTemperatureMin, waterTemperatureMax, phMin, phMax, isCompatible, minimumTankSize, brand]"
    :class="[
      'bg-sky-50 rounded-2xl border border-sky-100',
      expanded ? 'p-6' : 'p-5 mt-4'
    ]"
  >
    <h3 class="text-sm font-bold text-slate-700 mb-3">
      {{ expanded ? '상세 사육 정보' : '사육 정보' }}
    </h3>
    <div :class="expanded ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'grid grid-cols-2 gap-3'">
      <!-- 수질 -->
      <div v-if="waterType" class="flex flex-col">
        <span class="text-slate-400 text-xs">수질</span>
        <span class="text-slate-700 font-medium">{{ waterTypeLabels[waterType] }}</span>
      </div>
      
      <!-- 난이도 -->
      <div v-if="difficulty" class="flex flex-col">
        <span class="text-slate-400 text-xs">난이도</span>
        <span class="text-slate-700 font-medium">{{ difficultyLabels[difficulty] }}</span>
      </div>
      
      <!-- 수온 -->
      <div v-if="waterTemperatureMin !== null && waterTemperatureMax !== null" class="flex flex-col">
        <span class="text-slate-400 text-xs">수온</span>
        <span class="text-slate-700 font-medium">{{ waterTemperatureMin }}~{{ waterTemperatureMax }}℃</span>
      </div>
      
      <!-- pH -->
      <div v-if="phMin !== null && phMax !== null" class="flex flex-col">
        <span class="text-slate-400 text-xs">pH</span>
        <span class="text-slate-700 font-medium">{{ phMin }}~{{ phMax }}</span>
      </div>
      
      <!-- 합사 -->
      <div v-if="isCompatible !== null" class="flex flex-col">
        <span class="text-slate-400 text-xs">합사</span>
        <span
          :class="[
            'font-medium',
            isCompatible ? 'text-emerald-600' : 'text-red-500'
          ]"
        >
          {{ isCompatible ? '가능 ✓' : '불가 ✗' }}
        </span>
      </div>
      
      <!-- 최소 수조 -->
      <div v-if="minimumTankSize !== null" class="flex flex-col">
        <span class="text-slate-400 text-xs">최소 수조</span>
        <span class="text-slate-700 font-medium">{{ minimumTankSize }}L 이상</span>
      </div>
      
      <!-- 브랜드 -->
      <div v-if="brand" class="flex flex-col">
        <span class="text-slate-400 text-xs">브랜드</span>
        <span class="text-slate-700 font-medium">{{ brand }}</span>
      </div>
    </div>
    
    <!-- Expanded descriptions -->
    <div v-if="expanded" class="mt-6 pt-4 border-t border-sky-100 space-y-3 text-sm text-slate-600">
      <p v-if="waterType === 'FRESHWATER'">
        담수어종은 일반 수돗물(염소 제거 후)에서 사육 가능합니다.
      </p>
      <p v-if="waterType === 'SALTWATER'">
        해수어종은 인공해수 또는 천연해수가 필요하며, 비중계로 염도를 관리해야 합니다.
      </p>
      <p v-if="waterType === 'BRACKISH'">
        기수어종은 담수와 해수의 중간 염도 환경이 필요합니다.
      </p>
      <p v-if="difficulty === 'BEGINNER'">
        입문자도 쉽게 사육할 수 있는 종입니다. 기본적인 여과 시스템만 갖추면 됩니다.
      </p>
      <p v-if="difficulty === 'INTERMEDIATE'">
        어느 정도 사육 경험이 필요합니다. 수질 관리에 신경 써야 합니다.
      </p>
      <p v-if="difficulty === 'ADVANCED'">
        고급 사육 기술이 필요합니다. 까다로운 수질 조건과 먹이 관리가 요구됩니다.
      </p>
    </div>
  </div>
</template>
