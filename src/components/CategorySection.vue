<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  { name: '열대어',    icon: '🐟', productType: 'FISH',         waterType: 'FRESHWATER', desc: '구피, 테트라, 시클리드' },
  { name: '해수어',    icon: '🦈', productType: 'FISH',         waterType: 'SALTWATER',  desc: '크라운피쉬, 탱어류' },
  { name: '수초',      icon: '🌿', productType: 'PLANT',        waterType: undefined,    desc: '전경초, 중경초, 후경초' },
  { name: '새우·갑각', icon: '🦐', productType: 'INVERTEBRATE', waterType: undefined,    desc: '체리새우, 크리스탈새우' },
  { name: '파충류',    icon: '🐢', productType: undefined,      keyword: '거북',         desc: '거북, 도마뱀, 뱀' },
  { name: '수족관 용품', icon: '💡', productType: 'EQUIPMENT',  waterType: undefined,    desc: '조명, 필터, 히터' },
]

function navigate(cat: typeof categories[0]) {
  const params = new URLSearchParams()
  if (cat.productType) params.set('productType', cat.productType)
  if ('waterType' in cat && cat.waterType) params.set('waterType', cat.waterType)
  if ('keyword' in cat && cat.keyword) params.set('keyword', cat.keyword)
  router.push(`/search?${params.toString()}`)
}
</script>

<template>
  <section class="py-16 md:py-20">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-10">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900">어떤 물생활을 찾고 계신가요?</h2>
        <p class="text-slate-400 text-sm mt-2">카테고리를 선택하면 관련 상품을 모아볼 수 있어요</p>
      </div>

      <!-- Category Grid -->
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        <button
          v-for="category in categories"
          :key="category.name"
          class="group flex flex-col items-center justify-center gap-2.5 py-6 px-3 bg-sky-50 border-2 border-sky-100 rounded-2xl hover:bg-sky-500 hover:border-sky-500 transition-all duration-200 hover:scale-[1.04] hover:shadow-md"
          @click="navigate(category)"
        >
          <span class="text-3xl md:text-4xl transition-transform duration-200 group-hover:scale-110">{{ category.icon }}</span>
          <div class="text-center">
            <div class="font-bold text-slate-700 text-sm group-hover:text-white transition-colors leading-tight">{{ category.name }}</div>
            <div class="text-slate-400 text-xs mt-0.5 group-hover:text-sky-100 transition-colors hidden md:block leading-tight">{{ category.desc }}</div>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>
