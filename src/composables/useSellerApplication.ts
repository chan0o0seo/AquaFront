import { ref, computed } from 'vue'

// Application status enum
export type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null

// Application response interface
export interface SellerApplicationResponse {
  id: number
  memberId: number
  businessName: string
  businessRegistrationNumber: string
  businessAddress: string
  businessPhoneNumber: string
  status: SellerApplicationStatus
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

// Seller profile response interface
export interface SellerProfileResponse {
  id: number
  memberId: number
  businessName: string
  businessAddress: string
  businessPhoneNumber: string
  businessRegistrationNumber: string
  storeDescription?: string
  logoImageUrl?: string
  followerCount: number
  createdAt: string
  updatedAt: string
}

// Application request interface
export interface SellerApplicationRequest {
  businessName: string
  businessRegistrationNumber: string
  businessAddress: string
  businessPhoneNumber: string
}

// Global state
const applicationStatus = ref<SellerApplicationStatus>(null)
const applicationData = ref<SellerApplicationResponse | null>(null)
const hasProfile = ref(false)
const profileData = ref<SellerProfileResponse | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useSellerApplication() {
  // Fetch current application status
  const fetchApplicationStatus = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulated API call - replace with actual API
      // const response = await fetch('/api/seller/application/me')
      // const data = await response.json()
      
      // For demo purposes, use mock data
      // applicationData.value = data
      // applicationStatus.value = data?.status || null
    } catch (e) {
      error.value = '신청 정보를 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch seller profile
  const fetchProfile = async () => {
    try {
      // const response = await fetch('/api/seller/profile/me')
      // const data = await response.json()
      // profileData.value = data
      // hasProfile.value = !!data
    } catch (e) {
      hasProfile.value = false
    }
  }

  // Submit new application
  const submitApplication = async (form: SellerApplicationRequest): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    
    try {
      // const response = await fetch('/api/seller/apply', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form)
      // })
      
      // Simulate success
      applicationStatus.value = 'PENDING'
      applicationData.value = {
        id: 1,
        memberId: 1,
        ...form,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return true
    } catch (e) {
      error.value = '신청에 실패했습니다. 다시 시도해주세요.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Cancel application
  const cancelApplication = async (): Promise<boolean> => {
    isLoading.value = true
    
    try {
      // await fetch('/api/seller/application/me', { method: 'DELETE' })
      applicationStatus.value = null
      applicationData.value = null
      return true
    } catch (e) {
      error.value = '신청 취소에 실패했습니다.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Reapply after rejection
  const reapply = () => {
    applicationStatus.value = null
    applicationData.value = null
  }

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  return {
    applicationStatus,
    applicationData,
    hasProfile,
    profileData,
    isLoading,
    error,
    fetchApplicationStatus,
    fetchProfile,
    submitApplication,
    cancelApplication,
    reapply,
    formatDate
  }
}
