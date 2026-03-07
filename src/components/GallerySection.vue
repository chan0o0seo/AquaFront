<script setup lang="ts">
const galleryItems = [
  { id: 1, username: 'aqua_master', likes: 234, height: 'h-48' },
  { id: 2, username: 'fish_lover', likes: 128, height: 'h-64' },
  { id: 3, username: 'planted_tank', likes: 456, height: 'h-56' },
  { id: 4, username: 'reef_keeper', likes: 312, height: 'h-48' },
  { id: 5, username: 'shrimp_king', likes: 89, height: 'h-64' },
  { id: 6, username: 'discus_world', likes: 567, height: 'h-52' },
]
</script>

<template>
  <section id="community" class="py-16 md:py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900">
          아쿠아리스트들의 수조 갤러리
        </h2>
      </div>

      <!-- Masonry Grid -->
      <div class="columns-2 md:columns-3 gap-4 space-y-4">
        <div
          v-for="item in galleryItems"
          :key="item.id"
          :class="['break-inside-avoid rounded-2xl overflow-hidden group relative cursor-pointer', item.height]"
        >
          <!-- Image Placeholder -->
          <div class="w-full h-full bg-gradient-to-br from-sky-200 via-teal-300 to-cyan-400 flex items-center justify-center">
            <span class="text-6xl opacity-50">🐠</span>
          </div>
          
          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100">
            <span class="text-white font-medium">@{{ item.username }}</span>
            <span class="text-white flex items-center gap-1">
              ❤ {{ item.likes }}
            </span>
          </div>
        </div>
      </div>

      <!-- View More Button -->
      <div class="text-center mt-12">
        <button class="px-8 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-full hover:border-sky-500 hover:text-sky-600 transition-all duration-200">
          갤러리 더 보기
        </button>
      </div>
    </div>
  </section>
</template>
