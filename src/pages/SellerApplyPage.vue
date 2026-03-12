<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Loader2, MapPin, Info } from 'lucide-vue-next'
import { useSellerApplication } from '@/composables/useSellerApplication'

const router = useRouter()
const { submitApplication, isLoading, error } = useSellerApplication()

// Form state
const form = reactive({
  businessName: '',
  businessRegistrationNumber: '',
  businessAddress: '',
  businessPhoneNumber: ''
})

// Agreement checkboxes
const agreements = reactive({
  terms: false,
  fee: false
})

// Show fee info tooltip
const showFeeInfo = ref(false)

// Business registration number formatting
const formatBusinessRegNumber = (value: string): string => {
  // Remove non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as 000-00-00000
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`
  }
}

// Handle business registration number input
const handleBusinessRegInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const formatted = formatBusinessRegNumber(input.value)
  form.businessRegistrationNumber = formatted
}

// Validation
const isBusinessRegValid = computed(() => {
  const pattern = /^\d{3}-\d{2}-\d{5}$/
  return pattern.test(form.businessRegistrationNumber)
})

const isBusinessRegPartiallyFilled = computed(() => {
  return form.businessRegistrationNumber.length > 0 && !isBusinessRegValid.value
})

const isFormValid = computed(() => {
  return (
    form.businessName.trim().length > 0 &&
    isBusinessRegValid.value &&
    form.businessAddress.trim().length > 0 &&
    form.businessPhoneNumber.trim().length > 0 &&
    agreements.terms &&
    agreements.fee
  )
})

// Handle address search (placeholder for Kakao/Daum API)
const handleAddressSearch = () => {
  // In real implementation, integrate with Kakao/Daum address API
  alert('주소 검색 API가 연동될 예정입니다.')
}

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value) return
  
  const success = await submitApplication({
    businessName: form.businessName,
    businessRegistrationNumber: form.businessRegistrationNumber,
    businessAddress: form.businessAddress,
    businessPhoneNumber: form.businessPhoneNumber,
  })
  
  if (success) {
    router.push('/seller/apply/complete')
  }
}

const goBack = () => {
  router.push('/mypage')
}
</script>

<template>
  <main class="min-h-screen bg-sky-50 pt-24 pb-16">
    <div class="max-w-xl mx-auto px-6">
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
        <h1 class="text-3xl font-black text-slate-900">판매자 전환 신청</h1>
        <p class="text-slate-400 text-sm mt-2">
          아쿠아 Hub의 판매자로 활동하시려면 사업자 정보를 입력해주세요.
        </p>

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
              placeholder="예: 강남 아쿠아리움"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150"
            />
          </div>

          <!-- Business Registration Number -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              사업자등록번호 <span class="text-red-500">*</span>
            </label>
            <input
              :value="form.businessRegistrationNumber"
              @input="handleBusinessRegInput"
              type="text"
              placeholder="000-00-00000"
              maxlength="12"
              class="w-full px-4 py-3 rounded-xl border bg-white text-slate-800
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400
                     focus:border-transparent transition-all duration-150"
              :class="[
                isBusinessRegPartiallyFilled ? 'border-red-300' : 'border-sky-100'
              ]"
            />
            <p v-if="isBusinessRegPartiallyFilled" class="text-red-500 text-xs mt-1">
              000-00-00000 형식으로 입력해주세요
            </p>
            <p v-else-if="isBusinessRegValid" class="text-emerald-500 text-xs mt-1 flex items-center gap-1">
              <Check class="w-3 h-3" />
              올바른 형식입니다
            </p>
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
                class="flex items-center gap-1 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-medium hover:bg-sky-100 transition-colors whitespace-nowrap"
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
        </div>

        <!-- Agreement Section -->
        <div class="mt-8 space-y-4">
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="agreements.terms"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
              />
              <span class="text-sm text-slate-700">판매자 이용약관 동의 (필수)</span>
            </label>
            <button class="text-sm text-sky-500 hover:underline">약관 보기</button>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="agreements.fee"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
              />
              <span class="text-sm text-slate-700">수수료 정책 안내 확인 (필수)</span>
            </label>
            <div class="relative">
              <button 
                @click="showFeeInfo = !showFeeInfo"
                class="text-sm text-sky-500 hover:underline flex items-center gap-1"
              >
                <Info class="w-4 h-4" />
                내용 보기
              </button>
              <!-- Fee Info Tooltip -->
              <div
                v-show="showFeeInfo"
                class="absolute right-0 top-8 z-10 bg-slate-900 text-white rounded-xl p-4 text-sm w-64 shadow-lg"
              >
                <p class="font-semibold mb-2">수수료 안내</p>
                <ul class="space-y-1 text-slate-300">
                  <li>낙찰 수수료: 3.5%</li>
                  <li>즉시구매 수수료: 2.5%</li>
                  <li>정산 주기: 월 정산</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <p v-if="error" class="mt-4 text-red-500 text-sm text-center">
          {{ error }}
        </p>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          :disabled="!isFormValid || isLoading"
          class="w-full mt-8 py-4 rounded-full font-bold text-white transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="[
            isFormValid && !isLoading 
              ? 'bg-sky-500 hover:bg-sky-600' 
              : 'bg-slate-300'
          ]"
        >
          <template v-if="isLoading">
            <Loader2 class="w-5 h-5 animate-spin inline mr-2" />
            신청 중...
          </template>
          <template v-else>
            판매자 신청하기
          </template>
        </button>
      </div>
    </div>
  </main>
</template>
