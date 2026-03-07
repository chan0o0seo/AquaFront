<script setup lang="ts">
defineProps<{
  count?: number
  viewMode?: 'grid' | 'list'
}>()
</script>

<template>
  <!-- Grid Skeleton -->
  <template v-if="viewMode !== 'list'">
    <div
      v-for="i in (count || 8)"
      :key="i"
      class="rounded-2xl bg-white border border-sky-100 overflow-hidden"
    >
      <div class="aspect-square bg-slate-100 animate-pulse" />
      <div class="p-4 space-y-3">
        <div class="h-4 bg-slate-200 rounded-full animate-pulse w-3/4" />
        <div class="h-3 bg-slate-200 rounded-full animate-pulse w-1/2" />
        <div class="h-5 bg-slate-200 rounded-full animate-pulse w-1/3" />
      </div>
    </div>
  </template>

  <!-- List Skeleton -->
  <template v-else>
    <div
      v-for="i in (count || 8)"
      :key="i"
      class="flex gap-4 bg-white rounded-2xl border border-sky-100 p-4"
    >
      <div class="w-20 h-20 bg-slate-100 rounded-xl animate-pulse flex-shrink-0" />
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-slate-200 rounded-full animate-pulse w-1/4" />
        <div class="h-4 bg-slate-200 rounded-full animate-pulse w-3/4" />
        <div class="h-3 bg-slate-200 rounded-full animate-pulse w-1/3" />
        <div class="h-5 bg-slate-200 rounded-full animate-pulse w-1/4" />
      </div>
    </div>
  </template>
</template>
