import { ref } from 'vue'
import { sellerApi, type SellerApplicationResponse, type SellerApplicationRequest, type SellerProfileResponse } from '@/api'

export type { SellerApplicationResponse, SellerApplicationRequest, SellerProfileResponse }
export type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Global state
const applicationStatus = ref<SellerApplicationStatus | null>(null)
const applicationData = ref<SellerApplicationResponse | null>(null)
const hasProfile = ref(false)
const profileData = ref<SellerProfileResponse | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useSellerApplication() {
  const fetchApplicationStatus = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await sellerApi.getMyApplication()
      applicationData.value = data
      applicationStatus.value = data?.status ?? null
    } catch (e) {
      // 404 means no application yet — that's fine
      applicationStatus.value = null
      applicationData.value = null
    } finally {
      isLoading.value = false
    }
  }

  const fetchProfile = async () => {
    try {
      const data = await sellerApi.getMyProfile()
      profileData.value = data
      hasProfile.value = true
    } catch (e) {
      hasProfile.value = false
    }
  }

  const submitApplication = async (form: SellerApplicationRequest): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    try {
      const data = await sellerApi.apply(form)
      applicationData.value = data
      applicationStatus.value = data.status
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? '신청에 실패했습니다. 다시 시도해주세요.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const reapply = () => {
    applicationStatus.value = null
    applicationData.value = null
  }

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
    reapply,
    formatDate,
  }
}
