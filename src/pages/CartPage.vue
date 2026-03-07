<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import CartEmptyState from '@/components/cart/CartEmptyState.vue'
import CartSellerGroup from '@/components/cart/CartSellerGroup.vue'
import CartOrderSummary from '@/components/cart/CartOrderSummary.vue'

const router = useRouter()
const cartStore = useCartStore()

const {
  cartItems,
  groupedBySeller,
  subtotal,
  totalShippingFee,
  totalPrice,
  checkedCount,
  isAllChecked
} = storeToRefs(cartStore)

const { toggleCheck, updateQuantity, removeItem, clearCart, clearChecked } = cartStore

const isLoading = ref(false)

const handleClearAll = () => {
  if (confirm('장바구니를 비우시겠습니까?')) {
    clearCart()
  }
}

const handleClearChecked = () => {
  if (checkedCount.value === 0) return
  if (confirm(`선택한 ${checkedCount.value}개 상품을 삭제하시겠습니까?`)) {
    clearChecked()
  }
}

const handleToggleAll = () => {
  isAllChecked.value = !isAllChecked.value
}

const handleCheckout = async () => {
  if (checkedCount.value === 0 || isLoading.value) return
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  isLoading.value = false
  router.push('/checkout')
}

// Convert Map to array for v-for
const sellerGroups = computed(() => {
  return Array.from(groupedBySeller.value.entries())
})
</script>

<template>
  <main class="max-w-6xl mx-auto px-6 py-12 pb-32 lg:pb-12">
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black text-slate-900">장바구니</h1>
        <p class="text-slate-400 text-sm mt-1">{{ cartItems.length }}개의 상품이 담겨있어요</p>
      </div>
      <button
          v-show="cartItems.length > 0"
          type="button"
          @click="handleClearAll"
          class="text-sm text-slate-400 hover:text-red-400 transition-colors duration-150"
      >
        전체 삭제
      </button>
    </div>

    <!-- Empty State -->
    <CartEmptyState v-show="cartItems.length === 0" />

    <!-- Cart Content -->
    <div v-show="cartItems.length > 0" class="flex flex-col lg:flex-row gap-8 items-start">
      <!-- Left: Product List -->
      <div class="flex-1 w-full">
        <!-- Select All Bar -->
        <div class="bg-sky-50 rounded-2xl px-5 py-4 flex items-center justify-between mb-4 border border-sky-100 sticky top-[80px] z-40 lg:static">
          <div class="flex items-center gap-3">
            <button
                type="button"
                @click="handleToggleAll"
                class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer"
                :class="[
                isAllChecked
                  ? 'bg-sky-500 border-sky-500'
                  : 'border-sky-300 bg-white hover:border-sky-400'
              ]"
            >
              <Check v-if="isAllChecked" class="w-3 h-3 text-white" />
            </button>
            <span class="text-sm text-slate-700 font-medium">
              전체 선택 ({{ checkedCount }}/{{ cartItems.length }})
            </span>
          </div>
          <button
              type="button"
              @click="handleClearChecked"
              class="text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            선택 상품 삭제
          </button>
        </div>

        <!-- Seller Groups -->
        <CartSellerGroup
            v-for="[seller, items] in sellerGroups"
            :key="seller"
            :seller-nick-name="seller"
            :items="items"
            @toggle-check="toggleCheck"
            @update-quantity="updateQuantity"
            @remove="removeItem"
        />
      </div>

      <!-- Right: Order Summary (Desktop) -->
      <div class="hidden lg:block w-80 sticky top-24">
        <CartOrderSummary
            :subtotal="subtotal"
            :total-shipping-fee="totalShippingFee"
            :total-price="totalPrice"
            :checked-count="checkedCount"
            @checkout="handleCheckout"
        />
      </div>
    </div>

    <!-- Mobile Fixed Bottom Bar -->
    <div
        v-show="cartItems.length > 0"
        class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sky-100 px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div class="flex justify-between items-center">
        <div>
          <span class="font-bold text-slate-900">{{ checkedCount }}개</span>
          <span class="text-slate-400 mx-1">·</span>
          <span class="font-bold text-slate-900">₩{{ totalPrice.toLocaleString() }}</span>
        </div>
        <button
            type="button"
            @click="handleCheckout"
            :disabled="checkedCount === 0 || isLoading"
            class="rounded-full px-6 py-3 font-bold text-sm transition-all duration-200"
            :class="[
            checkedCount === 0 || isLoading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          ]"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            처리 중...
          </span>
          <span v-else>주문하기</span>
        </button>
      </div>
    </div>
  </main>
</template>
