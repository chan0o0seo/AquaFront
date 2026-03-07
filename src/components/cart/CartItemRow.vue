<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { X, Check } from 'lucide-vue-next'
import CartQuantitySelector from './CartQuantitySelector.vue'
import type { CartItem } from '@/stores/cart'

const props = defineProps<{
  item: CartItem
}>()

const emit = defineEmits<{
  toggleCheck: [productId: number]
  updateQuantity: [productId: number, quantity: number]
  remove: [productId: number]
}>()

const router = useRouter()

const productTypeBadgeClass = computed(() => {
  const map: Record<string, string> = {
    FISH: 'bg-sky-100 text-sky-700',
    INVERTEBRATE: 'bg-purple-100 text-purple-700',
    PLANT: 'bg-green-100 text-green-700',
    EQUIPMENT: 'bg-amber-100 text-amber-700',
    FOOD: 'bg-orange-100 text-orange-700',
    ACCESSORY: 'bg-pink-100 text-pink-700'
  }
  return map[props.item.productType] || 'bg-slate-100 text-slate-700'
})

const productTypeLabel = computed(() => {
  const map: Record<string, string> = {
    FISH: '어류',
    INVERTEBRATE: '무척추',
    PLANT: '수초',
    EQUIPMENT: '장비',
    FOOD: '먹이',
    ACCESSORY: '악세서리'
  }
  return map[props.item.productType] || props.item.productType
})

const isSoldOut = computed(() => props.item.status === 'SOLD_OUT')
const itemTotal = computed(() => props.item.price * props.item.quantity)

const handleNavigate = () => {
  router.push(`/products/${props.item.productId}`)
}
</script>

<template>
  <div
      class="px-5 py-5 flex items-start gap-4 border-b border-sky-50 last:border-0"
      :class="{ 'opacity-50': isSoldOut }"
  >
    <!-- Checkbox -->
    <button
        type="button"
        @click="emit('toggleCheck', item.productId)"
        :disabled="isSoldOut"
        class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-1"
        :class="[
        item.isChecked && !isSoldOut
          ? 'bg-sky-500 border-sky-500'
          : 'border-sky-300 bg-white',
        isSoldOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-sky-400'
      ]"
    >
      <Check v-if="item.isChecked && !isSoldOut" class="w-3 h-3 text-white" />
    </button>

    <!-- Product Image -->
    <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
      <img
          v-if="item.thumbnailUrl"
          :src="item.thumbnailUrl"
          :alt="item.name"
          loading="lazy"
          width="80"
          height="80"
          class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-sky-100 to-teal-200" />
      <!-- SOLD_OUT overlay -->
      <div
          v-if="isSoldOut"
          class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"
      >
        <span class="text-white text-xs font-bold">품절</span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between">
        <span
            class="text-xs font-medium px-2 py-0.5 rounded-full"
            :class="productTypeBadgeClass"
        >
          {{ productTypeLabel }}
        </span>
        <button
            type="button"
            @click="emit('remove', item.productId)"
            class="text-slate-300 hover:text-red-400 transition-colors p-1"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <h3
          @click="handleNavigate"
          class="font-semibold text-slate-800 mt-1 line-clamp-2 hover:text-sky-600 cursor-pointer transition-colors"
      >
        {{ item.name }}
      </h3>

      <!-- Low stock warning -->
      <p
          v-show="item.lowStockWarning && !isSoldOut"
          class="text-xs text-amber-500 mt-1"
      >
        ⚠ 재고 {{ item.stock }}개 남음
      </p>

      <!-- SOLD_OUT notice -->
      <p
          v-show="isSoldOut"
          class="text-xs text-red-400 mt-1"
      >
        현재 품절된 상품입니다. 주문에서 제외됩니다.
      </p>

      <!-- Bottom row -->
      <div class="flex items-center justify-between mt-3">
        <!-- Quantity selector -->
        <CartQuantitySelector
            v-show="!isSoldOut"
            :quantity="item.quantity"
            :max="item.stock"
            :disabled="isSoldOut"
            @update="(val) => emit('updateQuantity', item.productId, val)"
        />
        <div v-show="isSoldOut" />

        <!-- Price -->
        <div class="text-right">
          <span class="font-bold text-sky-600 text-lg">
            ₩{{ itemTotal.toLocaleString() }}
          </span>
          <span
              v-if="item.quantity > 1"
              class="text-xs text-slate-400 block"
          >
            ₩{{ item.price.toLocaleString() }} × {{ item.quantity }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
