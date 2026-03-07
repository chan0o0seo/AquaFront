<script setup lang="ts">
const trustItems = [
  { icon: '🐠', label: '등록 생물', value: '15,000+' },
  { icon: '🏪', label: '입점 수족관', value: '200+' },
  { icon: '🔒', label: '에스크로 안전결제', value: '' },
  { icon: '🌡', label: '날씨 연동 배송 관제', value: '' },
]
</script>

<template>
  <section class="py-12 bg-sky-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        <div
          v-for="(item, index) in trustItems"
          :key="item.label"
          class="flex items-center gap-3"
        >
          <span class="text-2xl">{{ item.icon }}</span>
          <div>
            <span v-if="item.value" class="font-bold text-slate-900">{{ item.value }} </span>
            <span class="text-slate-600">{{ item.label }}</span>
          </div>
          <div
            v-if="index < trustItems.length - 1"
            class="hidden md:block w-px h-8 bg-sky-200 ml-8"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>
