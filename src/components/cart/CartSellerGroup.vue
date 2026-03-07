<script setup lang="ts">
import { computed } from 'vue'
import { TransitionGroup } from 'vue'
import CartItemRow from './CartItemRow.vue'
import type { CartItem } from '@/stores/cart'

const props = defineProps<{
  sellerNickName: string
  items: CartItem[]
}>()

const emit = defineEmits<{
  toggleCheck: [productId: number]
  updateQuantity: [productId: number, quantity: number]
  remove: [productId: number]
}>()

const shippingFee = computed(() => {
  // Use the first item's shipping fee (all items from same seller share shipping)
  return props.items[0]?.shippingFee ?? 0
})

const sellerInitial = computed(() => {
  return props.sellerNickName.charAt(0).toUpperCase()
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-sky-100 mb-4 overflow-hidden">
    <!-- Seller Header -->
    <div class="bg-sky-50 px-5 py-3 flex items-center gap-2 border-b border-sky-100">
      <div class="w-7 h-7 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
        {{ sellerInitial }}
      </div>
      <span class="font-semibold text-slate-700 text-sm flex items-center gap-1">
        <span>🏪</span>
        {{ sellerNickName }}
      </span>
      <div class="flex-1" />
      <span
          v-if="shippingFee === 0"
          class="bg-emerald-100 text-emerald-600 text-xs rounded-full px-2 py-0.5 font-medium"
      >
        무료배송
      </span>
      <span v-else class="text-slate-400 text-xs">
        배송비 ₩{{ shippingFee.toLocaleString() }}
      </span>
    </div>

    <!-- Items List -->
    <TransitionGroup name="cart-item" tag="div">
      <CartItemRow
          v-for="item in items"
          :key="item.productId"
          :item="item"
          @toggle-check="emit('toggleCheck', $event)"
          @update-quantity="(id, qty) => emit('updateQuantity', id, qty)"
          @remove="emit('remove', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.cart-item-leave-active {
  transition: all 0.25s ease-out;
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.cart-item-enter-active {
  transition: all 0.2s ease-out;
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
