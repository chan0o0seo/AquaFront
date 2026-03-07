<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'DELETED'
type ProductType = 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'

interface SearchResult {
  id: number
  name: string
  price: number
  thumbnailUrl: string | null
  status: ProductStatus
  productType: ProductType
  tags: string[]
  sellerNickName: string
  sellerId: number
}

const props = defineProps<{
  product: SearchResult
  viewMode: 'grid' | 'list'
}>()

const router = useRouter()

const statusBadge = computed(() => {
  const map: Record<ProductStatus, { label: string; class: string } | null> = {
    ACTIVE: { label: '판매중', class: 'bg-emerald-100 text-emerald-700' },
    SOLD_OUT: { label: '품절', class: 'bg-slate-100 text-slate-500' },
    DELETED: null
  }
  return map[props.product.status]
})

const productTypeBadge = computed(() => {
  const map: Record<ProductType, { label: string; class: string }> = {
    FISH: { label: '어류', class: 'bg-sky-100 text-sky-700' },
    INVERTEBRATE: { label: '무척추동물', class: 'bg-purple-100 text-purple-700' },
    PLANT: { label: '수초', class: 'bg-green-100 text-green-700' },
    EQUIPMENT: { label: '용품/장비', class: 'bg-amber-100 text-amber-700' },
    FOOD: { label: '사료', class: 'bg-orange-100 text-orange-700' },
    ACCESSORY: { label: '소품', class: 'bg-pink-100 text-pink-700' }
  }
  return map[props.product.productType]
})

const displayTags = computed(() => {
  const tags = props.product.tags || []
  if (tags.length <= 2) return { visible: tags, overflow: 0 }
  return { visible: tags.slice(0, 2), overflow: tags.length - 2 }
})

const handleClick = () => {
  router.push(`/products/${props.product.id}`)
}
</script>

<template>
  <!-- Grid View -->
  <article
    v-if="viewMode === 'grid'"
    @click="handleClick"
    class="bg-white rounded-2xl border border-sky-100 overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200"
  >
    <div class="relative aspect-square">
      <img
        v-if="product.thumbnailUrl"
        :src="product.thumbnailUrl"
        :alt="product.name"
        loading="lazy"
        width="300"
        height="300"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center"
      >
        <span class="text-4xl">🐠</span>
      </div>
      
      <!-- Status Badge -->
      <span
        v-if="statusBadge"
        :class="[statusBadge.class, 'absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full']"
      >
        {{ statusBadge.label }}
      </span>
      
      <!-- ProductType Badge -->
      <span
        :class="[productTypeBadge.class, 'absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full']"
      >
        {{ productTypeBadge.label }}
      </span>
    </div>
    
    <div class="p-4">
      <h3 class="font-semibold text-slate-800 line-clamp-2">{{ product.name }}</h3>
      
      <!-- Tags -->
      <div v-if="product.tags?.length" class="flex flex-wrap gap-1 mt-2">
        <span
          v-for="tag in displayTags.visible"
          :key="tag"
          class="rounded-full bg-sky-50 text-sky-600 text-xs px-2 py-0.5 border border-sky-100"
        >
          {{ tag }}
        </span>
        <span
          v-if="displayTags.overflow > 0"
          class="rounded-full bg-slate-100 text-slate-500 text-xs px-2 py-0.5"
        >
          +{{ displayTags.overflow }}
        </span>
      </div>
      
      <!-- Seller -->
      <p class="text-xs text-slate-400 mt-2 flex items-center gap-1">
        <span>🏪</span>
        <span>{{ product.sellerNickName }}</span>
      </p>
      
      <!-- Price -->
      <p class="text-sky-600 font-bold text-lg mt-1">
        ₩{{ product.price.toLocaleString() }}
      </p>
    </div>
  </article>

  <!-- List View -->
  <article
    v-else
    @click="handleClick"
    class="flex gap-4 bg-white rounded-2xl border border-sky-100 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
  >
    <div class="relative w-20 h-20 flex-shrink-0">
      <img
        v-if="product.thumbnailUrl"
        :src="product.thumbnailUrl"
        :alt="product.name"
        loading="lazy"
        width="80"
        height="80"
        class="w-full h-full object-cover rounded-xl"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-sky-100 to-teal-200 rounded-xl flex items-center justify-center"
      >
        <span class="text-2xl">🐠</span>
      </div>
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span
          :class="[productTypeBadge.class, 'text-xs font-semibold px-2 py-0.5 rounded-full']"
        >
          {{ productTypeBadge.label }}
        </span>
        <span
          v-if="statusBadge"
          :class="[statusBadge.class, 'text-xs font-semibold px-2 py-0.5 rounded-full']"
        >
          {{ statusBadge.label }}
        </span>
      </div>
      
      <h3 class="font-semibold text-slate-800 line-clamp-1">{{ product.name }}</h3>
      
      <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
        <span>🏪</span>
        <span>{{ product.sellerNickName }}</span>
      </p>
      
      <p class="text-sky-600 font-bold mt-1">
        ₩{{ product.price.toLocaleString() }}
      </p>
    </div>
  </article>
</template>
