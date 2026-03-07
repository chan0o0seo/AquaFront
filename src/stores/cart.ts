import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    name: string
    price: number
    shippingFee: number
    stock: number
    status: 'ACTIVE' | 'SOLD_OUT'
    productType: 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'
    thumbnailUrl: string | null
    sellerNickName: string
    quantity: number
    isChecked: boolean
    lowStockWarning: boolean
}

export const useCartStore = defineStore('cart', () => {
    // State
    const cartItems = ref<CartItem[]>([])

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
                if (item.status === 'ACTIVE') {
                    item.isChecked = value
                }
            })
        }
    })

    // Actions
    function addItem(item: Omit<CartItem, 'quantity' | 'isChecked'>, quantity = 1) {
        const existing = cartItems.value.find(i => i.productId === item.productId)
        if (existing) {
            existing.quantity = Math.min(existing.quantity + quantity, existing.stock)
        } else {
            cartItems.value.push({
                ...item,
                quantity: Math.min(quantity, item.stock),
                isChecked: item.status === 'ACTIVE'
            })
        }
    }

    function removeItem(productId: number) {
        const index = cartItems.value.findIndex(item => item.productId === productId)
        if (index !== -1) {
            cartItems.value.splice(index, 1)
        }
    }

    function updateQuantity(productId: number, quantity: number) {
        const item = cartItems.value.find(i => i.productId === productId)
        if (item) {
            item.quantity = Math.max(1, Math.min(quantity, item.stock))
        }
    }

    function toggleCheck(productId: number) {
        const item = cartItems.value.find(i => i.productId === productId)
        if (item && item.status === 'ACTIVE') {
            item.isChecked = !item.isChecked
        }
    }

    function clearCart() {
        cartItems.value = []
    }

    function clearChecked() {
        cartItems.value = cartItems.value.filter(item => !item.isChecked)
    }

    function setAllChecked(value: boolean) {
        cartItems.value.forEach(item => {
            if (item.status === 'ACTIVE') {
                item.isChecked = value
            }
        })
    }

    return {
        // State
        cartItems,
        // Getters
        checkedItems,
        groupedBySeller,
        subtotal,
        totalShippingFee,
        totalPrice,
        checkedCount,
        totalCount,
        isAllChecked,
        // Actions
        addItem,
        removeItem,
        updateQuantity,
        toggleCheck,
        clearCart,
        clearChecked,
        setAllChecked
    }
})
