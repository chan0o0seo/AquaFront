<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'

const router = useRouter()
const searchInput = ref('')

const handleSearch = () => {
  const q = searchInput.value.trim()
  router.push(q ? `/search?keyword=${encodeURIComponent(q)}` : '/search')
}

const stats = [
  { label: '입점 수족관', value: '200+' },
  { label: '등록 생물', value: '15,000+' },
  { label: '누적 낙찰', value: '50,000+' },
]

const floatingCards = [
  { 
    name: '블루 제브라 플레코', 
    price: '₩185,000', 
    badge: '경매중', 
    badgeColor: 'bg-amber-100 text-amber-700' 
  },
  { 
    name: 'L-046 제브라 플레코', 
    price: '₩320,000', 
    badge: '즉시구매', 
    badgeColor: 'bg-sky-100 text-sky-700' 
  },
  { 
    name: '알비노 풀레드 롱핀', 
    price: '₩95,000', 
    badge: '경매중', 
    badgeColor: 'bg-amber-100 text-amber-700' 
  },
]
</script>

<template>
  <section class="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-5 gap-12 items-center">
        <!-- Left Content -->
        <div class="md:col-span-3 space-y-6">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-full">
            <span class="text-lg">🐠</span>
            <span class="text-sm font-semibold text-sky-600">국내 최대 물생활 플랫폼</span>
          </div>

          <!-- Headline -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
            희귀 어종을 찾는<br />
            <span class="text-sky-500">가장 빠른 방법</span>
          </h1>

          <!-- Subtext -->
          <p class="text-lg text-slate-500 max-w-md leading-relaxed">
            전국 수족관과 브리더의 물생활 생물·용품을 한 곳에서.
            실시간 경매로 가치있는 개체를 공정하게.
          </p>

          <!-- Search Bar -->
          <form @submit.prevent="handleSearch" class="flex items-center gap-2 max-w-md">
            <div class="flex-1 flex items-center gap-3 bg-white border border-sky-100 rounded-full px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-transparent transition-all">
              <Search class="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                v-model="searchInput"
                type="text"
                placeholder="구피, 플레코, ADA 소일..."
                class="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              class="px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition-colors shadow-sm flex-shrink-0"
            >
              검색
            </button>
          </form>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              @click="router.push('/search')"
              class="px-8 py-4 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              쇼핑 시작하기
            </button>
            <button
              @click="router.push('/auction')"
              class="px-8 py-4 border border-slate-300 text-slate-700 font-semibold rounded-full hover:border-sky-500 hover:text-sky-600 transition-all duration-200"
            >
              경매 참여하기
            </button>
          </div>

          <!-- Trust Stats -->
          <div class="flex flex-wrap gap-6 pt-6">
            <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-2">
              <span class="text-2xl font-bold text-slate-900">{{ stat.value }}</span>
              <span class="text-sm text-slate-500">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <!-- Right Visual - Floating Cards -->
        <div class="md:col-span-2 relative h-[400px] md:h-[500px]">
          <div
            v-for="(card, index) in floatingCards"
            :key="card.name"
            class="absolute bg-white rounded-2xl shadow-xl p-4 w-56 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            :style="{
              top: `${index * 80 + 20}px`,
              right: `${index * 30}px`,
              zIndex: 3 - index,
            }"
          >
            <!-- Image Placeholder -->
            <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-sky-200 to-teal-300 mb-3 flex items-center justify-center">
              <span class="text-4xl">🐟</span>
            </div>
            <div class="space-y-2">
              <span :class="['text-xs font-semibold px-2 py-1 rounded-full', card.badgeColor]">
                {{ card.badge }}
              </span>
              <h3 class="font-semibold text-slate-800 text-sm">{{ card.name }}</h3>
              <p class="text-sky-600 font-bold">{{ card.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
