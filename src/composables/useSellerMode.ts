import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const isSeller = ref(false)

export function useSellerMode() {
  const authStore = useAuthStore()

  onMounted(() => {
    const stored = localStorage.getItem('aquahub_seller_mode')
    if (stored === 'true') {
      isSeller.value = true
    }
  })

  // Eligible if the logged-in user has SELLER or BREEDER role
  const isEligible = computed(() => authStore.isSeller)

  const setSellerMode = (value: boolean) => {
    isSeller.value = value
    localStorage.setItem('aquahub_seller_mode', String(value))
  }

  return {
    isSeller,
    isEligible,
    setSellerMode,
  }
}
