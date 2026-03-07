<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Store, ArrowRight, Clock, XCircle, CheckCircle, ChevronRight } from 'lucide-vue-next'
import { useSellerApplication, type SellerApplicationStatus, type SellerApplicationResponse, type SellerProfileResponse } from '@/composables/useSellerApplication'

const props = defineProps<{
  applicationStatus: SellerApplicationStatus
  applicationData?: SellerApplicationResponse | null
  hasProfile?: boolean
  profileData?: SellerProfileResponse | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'reapply'): void
}>()

const router = useRouter()
const { formatDate, cancelApplication } = useSellerApplication()

// Computed case type
const caseType = computed(() => {
  if (props.applicationStatus === null) return 'NOT_APPLIED'
  if (props.applicationStatus === 'PENDING') return 'PENDING'
  if (props.applicationStatus === 'REJECTED') return 'REJECTED'
  if (props.applicationStatus === 'APPROVED' && !props.hasProfile) return 'APPROVED_NO_PROFILE'
  if (props.applicationStatus === 'APPROVED' && props.hasProfile) return 'APPROVED_WITH_PROFILE'
  return 'NOT_APPLIED'
})

const handleApply = () => {
  router.push('/seller/apply')
}

const handleCancel = async () => {
  if (confirm('정말 신청을 취소하시겠어요?')) {
    await cancelApplication()
    emit('cancel')
  }
}

const handleReapply = () => {
  emit('reapply')
  router.push('/seller/apply')
}

const handleSetupProfile = () => {
  router.push('/seller/profile/setup')
}

const handleGoToSellerCenter = () => {
  router.push('/mypage/seller')
}
</script>

<template>
  <!-- CASE A: 미신청 상태 -->
  <div 
    v-if="caseType === 'NOT_APPLIED'"
    class="bg-gradient-to-br from-sky-50 to-teal-50 rounded-2xl p-6 border border-sky-100"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Store class="w-5 h-5 text-sky-500" />
          판매자로 시작하세요
        </h3>
        <p class="text-slate-500 text-sm mt-1">
          수족관 운영자 또는 홈 브리더로 등록하면 상품 등록과 경매 진행이 가능합니다.
        </p>
      </div>
      <button
        @click="handleApply"
        class="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-colors whitespace-nowrap"
      >
        판매자 전환 신청
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- CASE B: 심사 중 -->
  <div 
    v-else-if="caseType === 'PENDING'"
    class="bg-amber-50 rounded-2xl p-6 border border-amber-100"
  >
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-xl font-bold text-amber-800 flex items-center gap-2">
          <Clock class="w-5 h-5" />
          판매자 심사가 진행 중입니다
        </h3>
        <span class="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
          심사 중
        </span>
      </div>
    </div>

    <!-- Application Summary -->
    <div v-if="applicationData" class="bg-white rounded-xl p-4 mt-4 space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-slate-400">상호명</span>
        <span class="text-slate-700 font-medium">{{ applicationData.businessName }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-400">사업자등록번호</span>
        <span class="text-slate-700 font-medium">{{ applicationData.businessRegistrationNumber }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-400">신청일</span>
        <span class="text-slate-700 font-medium">{{ formatDate(applicationData.createdAt) }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between mt-4">
      <p class="text-xs text-amber-600">
        보통 1~3 영업일 내에 처리됩니다.
      </p>
      <button
        @click="handleCancel"
        class="text-sm text-slate-400 hover:text-red-400 transition-colors"
      >
        신청 취소
      </button>
    </div>
  </div>

  <!-- CASE C: 반려됨 -->
  <div 
    v-else-if="caseType === 'REJECTED'"
    class="bg-red-50 rounded-2xl p-6 border border-red-100"
  >
    <h3 class="text-xl font-bold text-red-800 flex items-center gap-2">
      <XCircle class="w-5 h-5" />
      판매자 신청이 반려되었습니다
    </h3>

    <!-- Rejection Reason -->
    <div v-if="applicationData?.rejectionReason" class="bg-white rounded-xl p-4 mt-3 border border-red-100">
      <p class="text-xs text-red-400 font-semibold">반려 사유:</p>
      <p class="text-slate-700 mt-1">{{ applicationData.rejectionReason }}</p>
    </div>

    <button
      @click="handleReapply"
      class="mt-4 px-6 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-colors"
    >
      재신청하기
    </button>
  </div>

  <!-- CASE D: 승인됨 + 프로필 미완성 -->
  <div 
    v-else-if="caseType === 'APPROVED_NO_PROFILE'"
    class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100"
  >
    <h3 class="text-xl font-bold text-emerald-800 flex items-center gap-2">
      <CheckCircle class="w-5 h-5" />
      판매자 승인이 완료되었습니다!
    </h3>
    <p class="text-slate-600 mt-1">
      판매자 프로필을 작성하면 상품 등록과 경매를 시작할 수 있어요.
    </p>

    <!-- Progress Stepper -->
    <div class="flex items-center justify-center gap-4 mt-6">
      <!-- Step 1: 완료 -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
          <CheckCircle class="w-5 h-5" />
        </div>
        <span class="text-xs text-emerald-600 mt-1 font-medium">신청</span>
      </div>
      
      <div class="w-12 h-0.5 bg-emerald-300"></div>
      
      <!-- Step 2: 현재 -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold animate-pulse ring-4 ring-sky-200">
          2
        </div>
        <span class="text-xs text-sky-600 mt-1 font-medium">프로필 작성</span>
      </div>
      
      <div class="w-12 h-0.5 bg-slate-200"></div>
      
      <!-- Step 3: 대기 -->
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold">
          3
        </div>
        <span class="text-xs text-slate-400 mt-1 font-medium">상품 등록</span>
      </div>
    </div>

    <button
      @click="handleSetupProfile"
      class="w-full mt-6 px-6 py-4 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-600 transition-colors"
    >
      판매자 프로필 작성하기
    </button>
  </div>

  <!-- CASE E: 승인 + 프로필 완성 -->
  <div 
    v-else-if="caseType === 'APPROVED_WITH_PROFILE'"
    class="bg-white rounded-2xl p-6 border border-sky-100"
  >
    <div class="flex items-center gap-4">
      <!-- Logo -->
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center overflow-hidden flex-shrink-0">
        <img 
          v-if="profileData?.logoImageUrl" 
          :src="profileData.logoImageUrl" 
          :alt="profileData.businessName"
          class="w-full h-full object-cover"
        />
        <Store v-else class="w-8 h-8 text-white" />
      </div>

      <!-- Info -->
      <div class="flex-1">
        <h3 class="text-lg font-bold text-slate-900">
          {{ profileData?.businessName || '내 스토어' }}
        </h3>
        <p class="text-sky-500 text-sm font-semibold">
          팔로워 {{ profileData?.followerCount || 0 }}명
        </p>
      </div>

      <!-- Action -->
      <button
        @click="handleGoToSellerCenter"
        class="flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-colors"
      >
        판매자 센터로 이동
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
