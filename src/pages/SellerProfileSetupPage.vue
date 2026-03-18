<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, MapPin, Loader2 } from 'lucide-vue-next'
import { useSellerApplication } from '@/composables/useSellerApplication'
import LogoUploadCircle from '@/components/seller/LogoUploadCircle.vue'
import BannerUpload from '@/components/seller/BannerUpload.vue'
import { sellerApi, uploadFile } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { applicationData } = useSellerApplication()
const authStore = useAuthStore()

const isEditMode = route.name === 'SellerProfileEdit'

// Form state
const form = reactive({
  businessName: '',
  businessAddress: '',
  businessPhoneNumber: '',
  storeDescription: ''
})

// Logo
const logoFile = ref<File | null>(null)
const existingLogoUrl = ref<string | null>(null)
// Banner
const bannerFile = ref<File | null>(null)
const existingBannerUrl = ref<string | null>(null)
const bannerRemoved = ref(false)
const existingRegistrationNumber = ref<string | null>(null)

const isSubmitting = ref(false)
const isLoadingProfile = ref(false)
const descriptionMaxLength = 300

// Validation
const isFormValid = computed(() => {
  return (
    form.businessName.trim().length > 0 &&
    form.businessAddress.trim().length > 0 &&
    form.businessPhoneNumber.trim().length > 0
  )
})

// Edit 모드: 기존 프로필 로드
onMounted(async () => {
  if (!isEditMode) return
  isLoadingProfile.value = true
  try {
    const profile = await sellerApi.getMyProfile()
    form.businessName = profile.businessName
    form.businessAddress = profile.businessAddress
    form.businessPhoneNumber = profile.businessPhoneNumber
    form.storeDescription = profile.storeDescription ?? ''
    existingLogoUrl.value = profile.logoImageUrl ?? null
    existingBannerUrl.value = profile.bannerImageUrl ?? null
    existingRegistrationNumber.value = profile.businessRegistrationNumber
  } catch {
    // ignore
  } finally {
    isLoadingProfile.value = false
  }
})

const handleAddressSearch = () => {
  alert('주소 검색 API가 연동될 예정입니다.')
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  isSubmitting.value = true

  try {
    let logoImageUrl: string | undefined
    if (logoFile.value) {
      logoImageUrl = await uploadFile(logoFile.value)
    } else if (isEditMode) {
      logoImageUrl = existingLogoUrl.value ?? undefined
    }

    let bannerImageUrl: string | undefined
    if (bannerFile.value) {
      bannerImageUrl = await uploadFile(bannerFile.value)
    } else if (isEditMode && !bannerRemoved.value) {
      bannerImageUrl = existingBannerUrl.value ?? undefined
    }

    await sellerApi.updateProfile({
      businessName: form.businessName,
      businessAddress: form.businessAddress,
      businessPhoneNumber: form.businessPhoneNumber,
      storeDescription: form.storeDescription || undefined,
      logoImageUrl,
      bannerImageUrl,
    })

    await authStore.fetchMe()
    router.push('/mypage/seller')
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '프로필 저장에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/mypage/seller')
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
        판매자 센터
      </button>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-sky-100 p-8">
        <!-- Loading (edit mode) -->
        <div v-if="isLoadingProfile" class="flex justify-center py-16">
          <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
        </div>

        <template v-else>
        <!-- Header -->
        <h1 class="text-3xl font-black text-slate-900">
          {{ isEditMode ? '판매자 프로필 수정' : '판매자 프로필 설정' }}
        </h1>
        <p class="text-slate-400 text-sm mt-2">
          구매자들에게 보여질 내 스토어 정보를 설정해주세요.
        </p>

        <!-- Banner Upload -->
        <div class="mt-8">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            스토어 배너 <span class="text-slate-400 font-normal">(선택)</span>
          </label>
          <BannerUpload
            v-model="bannerFile"
            :existing-url="existingBannerUrl"
            @remove="bannerRemoved = true"
          />
        </div>

        <!-- Logo Upload -->
        <div class="mt-6">
          <LogoUploadCircle v-model="logoFile" :existing-url="existingLogoUrl" />
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
          <p class="text-sm font-semibold text-slate-600 mb-3">심사 승인된 정보</p>
          <div class="space-y-2">
            <div class="flex items-center">
              <span class="text-sm text-slate-400 w-28">사업자등록번호</span>
              <span class="text-sm text-slate-700">
                {{ existingRegistrationNumber ?? applicationData?.businessRegistrationNumber ?? '000-00-00000' }}
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
            {{ isEditMode ? '수정 저장하기' : '프로필 저장하고 시작하기' }}
          </template>
        </button>
        </template>
      </div>
    </div>
  </main>
</template>
