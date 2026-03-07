<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, MapPin, Loader2 } from 'lucide-vue-next'
import { useSellerApplication } from '@/composables/useSellerApplication'
import LogoUploadCircle from '@/components/seller/LogoUploadCircle.vue'

const router = useRouter()
const { applicationData, isLoading } = useSellerApplication()

// Form state
const form = reactive({
  businessName: '',
  businessAddress: '',
  businessPhoneNumber: '',
  storeDescription: ''
})

// Logo file
const logoFile = ref<File | null>(null)

// Form submission loading state
const isSubmitting = ref(false)

// Character count for store description
const descriptionMaxLength = 300

// Validation
const isFormValid = computed(() => {
  return (
    form.businessName.trim().length > 0 &&
    form.businessAddress.trim().length > 0 &&
    form.businessPhoneNumber.trim().length > 0
  )
})

// Handle address search (placeholder for Kakao/Daum API)
const handleAddressSearch = () => {
  // In real implementation, integrate with Kakao/Daum address API
  alert('주소 검색 API가 연동될 예정입니다.')
}

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Create FormData for multipart upload
    const formData = new FormData()
    formData.append('businessName', form.businessName)
    formData.append('businessAddress', form.businessAddress)
    formData.append('businessPhoneNumber', form.businessPhoneNumber)
    formData.append('storeDescription', form.storeDescription)
    
    if (logoFile.value) {
      formData.append('logoImage', logoFile.value)
    }
    
    // Simulated API call
    // await fetch('/api/seller/profile', {
    //   method: 'PATCH',
    //   body: formData
    // })
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Navigate to seller center on success
    router.push('/mypage/seller')
  } catch (e) {
    alert('프로필 저장에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/mypage')
}
</script>

<template>
  <main class="min-h-screen bg-sky-50 pt-24 pb-16">
    <div class="max-w-2xl mx-auto px-6">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="flex items-center gap-1 text-sm text-slate-400 hover:text-sky-500 transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        마이페이지
      </button>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-8">
        <!-- Header -->
        <h1 class="text-3xl font-black text-slate-900">판매자 프로필 설정</h1>
        <p class="text-slate-400 text-sm mt-2">
          구매자들에게 보여질 내 스토어 정보를 설정해주세요.
        </p>

        <!-- Logo Upload -->
        <div class="mt-8">
          <LogoUploadCircle v-model="logoFile" />
        </div>

        <!-- Form Fields -->
        <div class="mt-8 space-y-5">
          <!-- Business Name -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              상호명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.businessName"
              type="text"
              placeholder="스토어에 표시될 상호명"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150"
            />
          </div>

          <!-- Business Address -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              사업장 주소 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.businessAddress"
                type="text"
                placeholder="서울시 강남구 테헤란로 123"
                class="flex-1 px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                       focus:border-transparent transition-all duration-150"
              />
              <button
                @click="handleAddressSearch"
                type="button"
                class="flex items-center gap-1 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-medium 
                       hover:bg-sky-100 transition-colors whitespace-nowrap"
              >
                <MapPin class="w-4 h-4" />
                주소 검색
              </button>
            </div>
          </div>

          <!-- Business Phone Number -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              사업장 전화번호 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.businessPhoneNumber"
              type="tel"
              placeholder="02-1234-5678"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150"
            />
          </div>

          <!-- Store Description -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              스토어 소개 <span class="text-slate-400 font-normal">(선택)</span>
            </label>
            <textarea
              v-model="form.storeDescription"
              rows="4"
              :maxlength="descriptionMaxLength"
              placeholder="스토어와 취급 어종을 간단히 소개해주세요. 구매자들이 팔로우할 가능성이 높아져요."
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150 resize-none"
            ></textarea>
            <p class="text-right text-xs text-slate-400 mt-1">
              {{ form.storeDescription.length }}/{{ descriptionMaxLength }}
            </p>
          </div>
        </div>

        <!-- Read-only Info Section -->
        <div class="mt-8 bg-sky-50 rounded-2xl p-5 border border-sky-100">
          <p class="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
            <span>심사 승인된 정보</span>
          </p>
          <div class="space-y-2">
            <div class="flex items-center">
              <span class="text-sm text-slate-400 w-28">사업자등록번호</span>
              <span class="text-sm text-slate-700">
                {{ applicationData?.businessRegistrationNumber || '000-00-00000' }}
              </span>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-3">
            사업자등록번호 변경은 고객센터로 문의해주세요.
          </p>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
          class="w-full mt-8 py-4 rounded-full font-bold text-white transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="[
            isFormValid && !isSubmitting 
              ? 'bg-sky-500 hover:bg-sky-600' 
              : 'bg-slate-300'
          ]"
        >
          <template v-if="isSubmitting">
            <Loader2 class="w-5 h-5 animate-spin inline mr-2" />
            저장 중...
          </template>
          <template v-else>
            프로필 저장하고 시작하기
          </template>
        </button>
      </div>
    </div>
  </main>
</template>
