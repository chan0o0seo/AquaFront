<script setup lang="ts">
const categories = [
  { name: '열대어', icon: '🐟' },
  { name: '해수어', icon: '🦈' },
  { name: '수초', icon: '🌿' },
  { name: '새우', icon: '🦐' },
  { name: '거북·파충류', icon: '🐢' },
  { name: '수족관 용품', icon: '🔧' },
]
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900">
          어떤 물생활을 찾고 계신가요?
        </h2>
      </div>

      <!-- Category Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          v-for="category in categories"
          :key="category.name"
          class="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-sky-50 border-2 border-sky-100 rounded-2xl hover:bg-sky-100 hover:border-sky-200 transition-all duration-200 hover:scale-[1.02]"
        >
          <span class="text-4xl">{{ category.icon }}</span>
          <span class="font-semibold text-slate-700">{{ category.name }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
