<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Fish, Eye, EyeOff, Check, X, Loader2 } from 'lucide-vue-next'
import { useDebouncedFn } from '../composables/useDebounce'

const router = useRouter()

// Step management
const currentStep = ref(1)
const totalSteps = 3

// Step 1: Basic info
const email = ref('')
const emailCode = ref('')
const emailSent = ref(false)
const emailVerified = ref(false)
const emailTimer = ref(0)
let emailTimerInterval: ReturnType<typeof setInterval> | null = null

const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

// Step 2: Additional info
const nickname = ref('')
const nicknameStatus = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
const phone = ref('')
const memberType = ref<'buyer' | 'seller' | 'breeder' | null>(null)
const referralCode = ref('')

// Step 3: Interests
const interests = ref<string[]>([])
const auctionAlert = ref(false)
const agreeAll = ref(false)
const agreeTerms = ref(false)
const agreePrivacy = ref(false)
const agreeMarketing = ref(false)

const interestTags = [
  '열대어', '해수어', '수초', '새우', '거북·파충류',
  '고급 플레코', '구피', '금붕어', '아로와나', '수족관 용품', '먹이·사료'
]

const memberTypes = [
  { value: 'buyer', icon: '🐠', label: '일반 구매자', description: '생물과 용품을 구매하고 싶어요' },
  { value: 'seller', icon: '🏪', label: '수족관 운영자', description: '입점하여 판매하고 싶어요' },
  { value: 'breeder', icon: '🔬', label: '홈 브리더', description: '직접 키운 개체를 경매하고 싶어요' },
]

// Password strength
const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', '약함', '보통', '강함', '매우 강함']
  return labels[passwordStrength.value]
})

const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-500']

// Password match
const passwordsMatch = computed(() => {
  return password.value === passwordConfirm.value && password.value.length > 0
})

// Progress percentage
const progressPercent = computed(() => {
  return ((currentStep.value - 1) / (totalSteps - 1)) * 100
})

// Email verification timer
const formatTimer = computed(() => {
  const minutes = Math.floor(emailTimer.value / 60)
  const seconds = emailTimer.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const sendEmailVerification = () => {
  emailSent.value = true
  emailTimer.value = 179 // 2:59
  emailTimerInterval = setInterval(() => {
    emailTimer.value--
    if (emailTimer.value <= 0) {
      if (emailTimerInterval) clearInterval(emailTimerInterval)
      emailSent.value = false
    }
  }, 1000)
}

const verifyEmailCode = () => {
  if (emailCode.value.length === 6) {
    emailVerified.value = true
    if (emailTimerInterval) clearInterval(emailTimerInterval)
  }
}

// Nickname check
const checkNickname = useDebouncedFn(async () => {
  if (!nickname.value) {
    nicknameStatus.value = 'idle'
    return
  }
  nicknameStatus.value = 'checking'
  await new Promise(resolve => setTimeout(resolve, 800))
  // Simulate: "test" is taken, others are available
  nicknameStatus.value = nickname.value.toLowerCase() === 'test' ? 'taken' : 'available'
}, 500)

watch(nickname, () => {
  if (nickname.value) {
    nicknameStatus.value = 'checking'
    checkNickname()
  } else {
    nicknameStatus.value = 'idle'
  }
})

// Interest toggle
const toggleInterest = (tag: string) => {
  const index = interests.value.indexOf(tag)
  if (index === -1) {
    interests.value.push(tag)
  } else {
    interests.value.splice(index, 1)
  }
}

// Agreement sync
watch(agreeAll, (newVal) => {
  agreeTerms.value = newVal
  agreePrivacy.value = newVal
  agreeMarketing.value = newVal
})

watch([agreeTerms, agreePrivacy, agreeMarketing], ([t, p, m]) => {
  agreeAll.value = t && p && m
})

// Step validation
const step1Valid = computed(() => {
  return email.value && emailVerified.value && password.value.length >= 8 && passwordsMatch.value
})

const step2Valid = computed(() => {
  return nickname.value && nicknameStatus.value === 'available' && memberType.value
})

const step3Valid = computed(() => {
  return agreeTerms.value && agreePrivacy.value
})

// Navigation
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitRegistration = () => {
  if (step3Valid.value) {
    router.push('/register/complete')
  }
}

onUnmounted(() => {
  if (emailTimerInterval) clearInterval(emailTimerInterval)
})
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <main class="flex-1 flex items-center justify-center py-16 px-4 mt-16">
      <div class="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-sky-100 p-10">
        <!-- Logo Area -->
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-2 mb-1">
            <Fish class="w-8 h-8 text-sky-500" />
            <span class="text-2xl font-black text-sky-600">아쿠아 Hub</span>
          </div>
        </div>

        <!-- Step Indicator -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <div 
              v-for="step in totalSteps" 
              :key="step"
              class="flex flex-col items-center"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
                :class="step <= currentStep ? 'bg-sky-500 text-white' : 'bg-sky-200 text-sky-600'"
              >
                {{ step }}
              </div>
              <span class="text-xs text-slate-500 mt-1">
                {{ step === 1 ? '기본 정보' : step === 2 ? '추가 정보' : '관심 설정' }}
              </span>
            </div>
          </div>
          <div class="h-1 bg-sky-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-sky-500 transition-all duration-300"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>

        <!-- Step Content -->
        <Transition name="slide-fade" mode="out-in">
          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 1" key="step1">
            <h2 class="text-2xl font-black text-slate-900 mb-6">기본 정보 입력</h2>

            <!-- Social Signup -->
            <div class="flex flex-col gap-3 mb-6">
              <button class="w-full bg-[#FEE500] text-[#3C1E1E] rounded-full py-3 flex items-center justify-center gap-2 font-semibold hover:brightness-95 transition-all duration-150">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.88 5.32 4.66 6.72l-.88 3.24c-.08.29.24.55.51.41l3.87-2.57c.6.09 1.2.2 1.84.2 5.5 0 10-3.58 10-8s-4.5-8-10-8z"/>
                </svg>
                카카오로 시작하기
              </button>
              <button class="w-full bg-[#03C75A] text-white rounded-full py-3 flex items-center justify-center gap-2 font-semibold hover:brightness-95 transition-all duration-150">
                <span class="text-lg font-black">N</span>
                네이버로 시작하기
              </button>
            </div>

            <div class="flex items-center gap-3 my-6">
              <hr class="flex-1 border-sky-100" />
              <span class="text-sm text-slate-400">또는 이메일로 가입</span>
              <hr class="flex-1 border-sky-100" />
            </div>

            <!-- Email -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
                <div class="flex gap-2">
                  <input
                    v-model="email"
                    type="email"
                    placeholder="aqua@example.com"
                    :disabled="emailVerified"
                    class="flex-1 px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150 disabled:bg-slate-50"
                  />
                  <button
                    @click="sendEmailVerification"
                    :disabled="!email || emailVerified"
                    class="text-sm bg-sky-50 text-sky-600 border border-sky-200 rounded-lg px-3 py-2 hover:bg-sky-100 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {{ emailVerified ? '인증완료' : '인증 메일 발송' }}
                  </button>
                </div>
                <div v-show="emailSent && !emailVerified" class="mt-2 text-amber-500 font-mono text-sm">
                  {{ formatTimer }}
                </div>
              </div>

              <!-- Email Code -->
              <div v-show="emailSent && !emailVerified">
                <label class="block text-sm font-semibold text-slate-700 mb-2">이메일 인증 코드</label>
                <div class="flex gap-2">
                  <input
                    v-model="emailCode"
                    type="text"
                    maxlength="6"
                    placeholder="인증번호 6자리"
                    class="flex-1 px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
                  />
                  <button
                    @click="verifyEmailCode"
                    :disabled="emailCode.length !== 6"
                    class="text-sm bg-sky-500 text-white rounded-lg px-4 py-2 hover:bg-sky-600 transition disabled:opacity-50"
                  >
                    확인
                  </button>
                </div>
              </div>

              <!-- Verified State -->
              <div v-show="emailVerified" class="flex items-center gap-1 text-emerald-500 text-sm">
                <Check class="w-4 h-4" />
                <span>인증 완료</span>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="8자 이상 입력"
                    class="w-full px-4 py-3 pr-12 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Eye v-show="!showPassword" class="w-5 h-5" />
                    <EyeOff v-show="showPassword" class="w-5 h-5" />
                  </button>
                </div>
                <!-- Strength Meter -->
                <div v-show="password" class="mt-2">
                  <div class="flex gap-1 mb-1">
                    <div
                      v-for="i in 4"
                      :key="i"
                      class="h-1 flex-1 rounded-full transition-colors"
                      :class="i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'"
                    ></div>
                  </div>
                  <span class="text-xs" :class="passwordStrength >= 3 ? 'text-emerald-500' : passwordStrength >= 2 ? 'text-amber-500' : 'text-red-500'">
                    {{ strengthLabel }}
                  </span>
                </div>
              </div>

              <!-- Password Confirm -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">비밀번호 확인</label>
                <div class="relative">
                  <input
                    v-model="passwordConfirm"
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    placeholder="비밀번호 다시 입력"
                    class="w-full px-4 py-3 pr-12 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
                  />
                  <button
                    type="button"
                    @click="showPasswordConfirm = !showPasswordConfirm"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Eye v-show="!showPasswordConfirm" class="w-5 h-5" />
                    <EyeOff v-show="showPasswordConfirm" class="w-5 h-5" />
                  </button>
                </div>
                <div v-show="passwordConfirm && !passwordsMatch" class="mt-1 text-red-500 text-sm flex items-center gap-1">
                  <X class="w-4 h-4" />
                  <span>비밀번호가 일치하지 않습니다</span>
                </div>
                <div v-show="passwordsMatch" class="mt-1 text-emerald-500 text-sm flex items-center gap-1">
                  <Check class="w-4 h-4" />
                  <span>비밀번호가 일치합니다</span>
                </div>
              </div>
            </div>

            <button
              @click="nextStep"
              :disabled="!step1Valid"
              class="w-full mt-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 단계
            </button>
          </div>

          <!-- Step 2: Additional Info -->
          <div v-else-if="currentStep === 2" key="step2">
            <h2 class="text-2xl font-black text-slate-900 mb-6">추가 정보 입력</h2>

            <div class="space-y-4">
              <!-- Nickname -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">닉네임</label>
                <input
                  v-model="nickname"
                  type="text"
                  placeholder="아쿠아리스트 닉네임"
                  class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
                />
                <div class="mt-1 text-sm flex items-center gap-1">
                  <template v-if="nicknameStatus === 'checking'">
                    <Loader2 class="w-4 h-4 animate-spin text-slate-400" />
                    <span class="text-slate-400">확인 중...</span>
                  </template>
                  <template v-else-if="nicknameStatus === 'available'">
                    <Check class="w-4 h-4 text-emerald-500" />
                    <span class="text-emerald-500">사용 가능한 닉네임입니다</span>
                  </template>
                  <template v-else-if="nicknameStatus === 'taken'">
                    <X class="w-4 h-4 text-red-500" />
                    <span class="text-red-500">이미 사용 중인 닉네임입니다</span>
                  </template>
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">휴대폰 번호</label>
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
                />
              </div>

              <!-- Member Type -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-3">회원 유형</label>
                <div class="grid grid-cols-1 gap-3">
                  <button
                    v-for="type in memberTypes"
                    :key="type.value"
                    @click="memberType = type.value as 'buyer' | 'seller' | 'breeder'"
                    class="rounded-2xl border-2 p-4 cursor-pointer transition-all duration-150 text-left"
                    :class="memberType === type.value ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'"
                  >
                    <div class="flex items-start gap-3">
                      <span class="text-2xl">{{ type.icon }}</span>
                      <div>
                        <div class="font-semibold text-slate-900">{{ type.label }}</div>
                        <div class="text-sm text-slate-500">{{ type.description }}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Referral Code -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">추천인 코드 (선택)</label>
                <input
                  v-model="referralCode"
                  type="text"
                  placeholder="추천인 코드 (선택)"
                  class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
                />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                @click="prevStep"
                class="flex-1 border border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-600 rounded-full px-8 py-3 transition-all duration-200"
              >
                이전
              </button>
              <button
                @click="nextStep"
                :disabled="!step2Valid"
                class="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 단계
              </button>
            </div>
          </div>

          <!-- Step 3: Interests -->
          <div v-else-if="currentStep === 3" key="step3">
            <h2 class="text-2xl font-black text-slate-900 mb-2">어떤 물생활에 관심있나요?</h2>
            <p class="text-slate-500 text-sm mb-6">관심 분야를 선택하면 맞춤 콘텐츠를 보여드려요 (복수 선택)</p>

            <!-- Interest Tags -->
            <div class="flex flex-wrap gap-2 mb-6">
              <button
                v-for="tag in interestTags"
                :key="tag"
                @click="toggleInterest(tag)"
                class="rounded-full px-4 py-2 text-sm border transition-all duration-150 cursor-pointer"
                :class="interests.includes(tag) 
                  ? 'border-sky-400 bg-sky-500 text-white' 
                  : 'border-sky-100 bg-sky-50 text-slate-600 hover:border-sky-200'"
              >
                {{ tag }}
              </button>
            </div>

            <!-- Auction Alert -->
            <div class="flex items-center gap-2 mb-6">
              <input
                v-model="auctionAlert"
                type="checkbox"
                id="auctionAlert"
                class="w-4 h-4 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500"
              />
              <label for="auctionAlert" class="text-sm text-slate-600">경매 시작 및 종료 임박 알림 받기</label>
            </div>

            <!-- Agreements -->
            <div class="border-t border-sky-100 pt-6 space-y-3">
              <div class="flex items-center gap-2">
                <input
                  v-model="agreeAll"
                  type="checkbox"
                  id="agreeAll"
                  class="w-5 h-5 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500"
                />
                <label for="agreeAll" class="font-bold text-slate-900">이용약관 전체 동의</label>
              </div>

              <div class="ml-7 space-y-2">
                <div class="flex items-center gap-2">
                  <input
                    v-model="agreeTerms"
                    type="checkbox"
                    id="agreeTerms"
                    class="w-4 h-4 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500"
                  />
                  <label for="agreeTerms" class="text-sm text-slate-600">서비스 이용약관 (필수)</label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model="agreePrivacy"
                    type="checkbox"
                    id="agreePrivacy"
                    class="w-4 h-4 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500"
                  />
                  <label for="agreePrivacy" class="text-sm text-slate-600">개인정보 처리방침 (필수)</label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model="agreeMarketing"
                    type="checkbox"
                    id="agreeMarketing"
                    class="w-4 h-4 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500"
                  />
                  <label for="agreeMarketing" class="text-sm text-slate-600">마케팅 정보 수신 동의 (선택)</label>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                @click="prevStep"
                class="flex-1 border border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-600 rounded-full px-8 py-3 transition-all duration-200"
              >
                이전
              </button>
              <button
                @click="submitRegistration"
                :disabled="!step3Valid"
                class="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                가입 완료
              </button>
            </div>
          </div>
        </Transition>

        <!-- Login Link -->
        <div class="text-center mt-6">
          <span class="text-slate-500 text-sm">이미 계정이 있으신가요?</span>
          <router-link to="/login" class="text-sky-500 font-semibold hover:underline ml-1">로그인</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
