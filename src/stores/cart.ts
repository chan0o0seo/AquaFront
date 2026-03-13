import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi, type CartItemResponse } from '@/api'

export interface CartItem {
  productId: number
  name: string
  price: number
  shippingFee: number
  stock: number
  status: 'ACTIVE' | 'SOLD_OUT'
  productType: string
  thumbnailUrl: string | null
  sellerNickName: string
  quantity: number
  isChecked: boolean
  lowStockWarning: boolean
}

function toCartItem(res: CartItemResponse): CartItem {
  return {
    ...res,
    isChecked: res.status === 'ACTIVE',
  }
}

export const useCartStore = defineStore('cart', () => {
  // State
  const cartItems = ref<CartItem[]>([])
  const loading = ref(false)

  // Getters
  const checkedItems = computed(() =>
    cartItems.value.filter(item => item.isChecked && item.status === 'ACTIVE')
  )

  const groupedBySeller = computed(() => {
    const map = new Map<string, CartItem[]>()
    for (const item of cartItems.value) {
      const existing = map.get(item.sellerNickName)
      if (existing) {
        existing.push(item)
      } else {
        map.set(item.sellerNickName, [item])
      }
    }
    return map
  })

  const subtotal = computed(() =>
    checkedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const totalShippingFee = computed(() => {
    const sellerFees = new Map<string, number>()
    for (const item of checkedItems.value) {
      if (!sellerFees.has(item.sellerNickName)) {
        sellerFees.set(item.sellerNickName, item.shippingFee)
      }
    }
    let total = 0
    sellerFees.forEach(fee => { total += fee })
    return total
  })

  const totalPrice = computed(() => subtotal.value + totalShippingFee.value)
  const checkedCount = computed(() => checkedItems.value.length)
  const totalCount = computed(() => cartItems.value.length)

  const isAllChecked = computed({
    get: () => {
      const activeItems = cartItems.value.filter(item => item.status === 'ACTIVE')
      return activeItems.length > 0 && activeItems.every(item => item.isChecked)
    },
    set: (value: boolean) => {
      cartItems.value.forEach(item => {
        if (item.status === 'ACTIVE') item.isChecked = value
      })
    }
  })

  // Actions

  // 서버에서 장바구니 전체 fetch (로그인 후 호출)
  async function fetchCart() {
    try {
      loading.value = true
      const items = await cartApi.getCart()
      cartItems.value = items.map(toCartItem)
    } catch {
      // 미로그인 상태 등 — 무시
    } finally {
      loading.value = false
    }
  }

  // 상품 추가 (서버 + 로컬)
  async function addItem(productId: number, quantity = 1) {
    const res = await cartApi.addItem(productId, quantity)
    const existing = cartItems.value.find(i => i.productId === productId)
    if (existing) {
      existing.quantity = res.quantity
      existing.stock = res.stock
      existing.status = res.status
    } else {
      cartItems.value.push(toCartItem(res))
    }
  }

  // 수량 변경 (서버 + 로컬)
  async function updateQuantity(productId: number, quantity: number) {
    const res = await cartApi.updateItem(productId, quantity)
    const item = cartItems.value.find(i => i.productId === productId)
    if (item) item.quantity = res.quantity
  }

  // 개별 항목 제거 (서버 + 로컬)
  async function removeItem(productId: number) {
    await cartApi.removeItem(productId)
    const index = cartItems.value.findIndex(i => i.productId === productId)
    if (index !== -1) cartItems.value.splice(index, 1)
  }

  // 전체 비우기 (서버 + 로컬) — 구매 완료 후 호출
  async function clearCart() {
    await cartApi.clearCart()
    cartItems.value = []
  }

  // 로컬만 비우기 — 로그아웃 시 호출 (DB는 유지)
  function clearLocalCart() {
    cartItems.value = []
  }

  // 체크 토글 (로컬만)
  function toggleCheck(productId: number) {
    const item = cartItems.value.find(i => i.productId === productId)
    if (item && item.status === 'ACTIVE') item.isChecked = !item.isChecked
  }

  function setAllChecked(value: boolean) {
    cartItems.value.forEach(item => {
      if (item.status === 'ACTIVE') item.isChecked = value
    })
  }

  // 체크된 항목 제거 (서버 + 로컬) — 구매 완료 후 호출
  async function clearChecked() {
    const checkedIds = cartItems.value
      .filter(item => item.isChecked)
      .map(item => item.productId)
    await Promise.all(checkedIds.map(id => cartApi.removeItem(id)))
    cartItems.value = cartItems.value.filter(item => !item.isChecked)
  }

  return {
    cartItems,
    loading,
    checkedItems,
    groupedBySeller,
    subtotal,
    totalShippingFee,
    totalPrice,
    checkedCount,
    totalCount,
    isAllChecked,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    clearLocalCart,
    toggleCheck,
    setAllChecked,
    clearChecked,
  }
})
