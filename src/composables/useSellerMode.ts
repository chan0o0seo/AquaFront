import { ref, computed, onMounted } from 'vue'

// Member role types
export type MemberRole = 'BUYER' | 'SELLER' | 'BREEDER'

// Simulated current user state (in real app, this would come from auth store)
const currentUserRole = ref<MemberRole>('BUYER')
const isSeller = ref(false)

export function useSellerMode() {
  // Check localStorage on mount
  onMounted(() => {
    const stored = localStorage.getItem('aquahub_seller_mode')
    if (stored === 'true') {
      isSeller.value = true
    }
  })

  // Is user eligible to be a seller (has SELLER or BREEDER role)
  const isEligible = computed(() => {
    return currentUserRole.value === 'SELLER' || currentUserRole.value === 'BREEDER'
  })

  // Toggle seller mode
  const toggle = () => {
    isSeller.value = !isSeller.value
    localStorage.setItem('aquahub_seller_mode', String(isSeller.value))
  }

  // Set seller mode explicitly
  const setSellerMode = (value: boolean) => {
    isSeller.value = value
    localStorage.setItem('aquahub_seller_mode', String(value))
  }

  // Set user role (for testing/simulation)
  const setUserRole = (role: MemberRole) => {
    currentUserRole.value = role
  }

  return {
    isSeller,
    currentUserRole,
    isEligible,
    toggle,
    setSellerMode,
    setUserRole
  }
}
