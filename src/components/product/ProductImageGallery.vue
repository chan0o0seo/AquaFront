<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  imageUrls: string[]
  status: 'ACTIVE' | 'SOLD_OUT' | 'DELETED'
  productName: string
}

const props = withDefaults(defineProps<Props>(), {
  imageUrls: () => [],
  status: 'ACTIVE',
  productName: ''
})

const activeIndex = ref(0)

const currentImage = computed(() => {
  return props.imageUrls.length > 0 ? props.imageUrls[activeIndex.value] : null
})

const setActiveImage = (index: number) => {
  activeIndex.value = index
}
</script>

<template>
  <div class="space-y-3">
    <!-- Main Image -->
    <div class="relative rounded-2xl overflow-hidden aspect-square bg-sky-50">
      <img
        v-if="currentImage"
        :src="currentImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center"
      >
        <span class="text-6xl">🐠</span>
      </div>
      
      <!-- SOLD_OUT Overlay -->
      <div
        v-show="status === 'SOLD_OUT'"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <span class="text-white text-3xl font-black">품절</span>
      </div>
    </div>

    <!-- Thumbnail Strip -->
    <div v-if="imageUrls.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(url, index) in imageUrls"
        :key="index"
        @click="setActiveImage(index)"
        class="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200"
        :class="[
          index === activeIndex
            ? 'ring-2 ring-sky-400'
            : 'opacity-60 hover:opacity-100'
        ]"
      >
        <img
          :src="url"
          :alt="`${productName} 이미지 ${index + 1}`"
          loading="lazy"
          width="64"
          height="64"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>
