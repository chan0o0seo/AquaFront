<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Fish, Eye, EyeOff, AlertCircle, X, CheckCircle2, Loader2, Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api'
import { checkPasswordRules, isPasswordValid } from '@/utils/password'

const router = useRouter()
const authStore = useAuthStore()

// ── 로그인 ────────────────────────────────────────────────────
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

const isFormValid = computed(() => email.value.length > 0 && password.value.length > 0)

const handleLogin = async () => {
  if (!isFormValid.value) return
  isLoading.value = true
  hasError.value = false
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    hasError.value = true
    errorMessage.value = err?.response?.data?.message ?? '이메일 또는 비밀번호가 올바르지 않습니다.'
  } finally {
    isLoading.value = false
  }
}

// ── 이메일 찾기 모달 ──────────────────────────────────────────
type FindEmailStep = 'form' | 'result'
const showFindEmail = ref(false)
const findEmailStep = ref<FindEmailStep>('form')
const findName = ref('')
const findPhone = ref('')
const foundEmail = ref('')
const findEmailLoading = ref(false)
const findEmailError = ref('')

function openFindEmail() {
  findEmailStep.value = 'form'
  findName.value = ''
  findPhone.value = ''
  foundEmail.value = ''
  findEmailError.value = ''
  showFindEmail.value = true
}

async function submitFindEmail() {
  if (!findName.value.trim() || !findPhone.value.trim()) return
  findEmailLoading.value = true
  findEmailError.value = ''
  try {
    foundEmail.value = await authApi.findEmail(findName.value.trim(), findPhone.value.trim())
    findEmailStep.value = 'result'
  } catch (err: any) {
    findEmailError.value = err?.response?.data?.message ?? '일치하는 회원 정보를 찾을 수 없습니다.'
  } finally {
    findEmailLoading.value = false
  }
}

// ── 비밀번호 재설정 모달 ──────────────────────────────────────
type ResetStep = 'email' | 'code' | 'password' | 'done'
const showResetPw = ref(false)
const resetStep = ref<ResetStep>('email')
const resetEmail = ref('')
const resetCode = ref('')
const resetNewPw = ref('')
const resetNewPwConfirm = ref('')
const showResetPw1 = ref(false)
const showResetPw2 = ref(false)
const resetLoading = ref(false)
const resetError = ref('')
const sendCodeCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

function openResetPw() {
  resetStep.value = 'email'
  resetEmail.value = ''
  resetCode.value = ''
  resetNewPw.value = ''
  resetNewPwConfirm.value = ''
  resetError.value = ''
  sendCodeCooldown.value = 0
  showResetPw.value = true
}

async function sendResetCode() {
  if (!resetEmail.value.trim() || resetLoading.value) return
  resetLoading.value = true
  resetError.value = ''
  try {
    await authApi.sendPasswordResetCode(resetEmail.value.trim())
    resetStep.value = 'code'
    startCooldown()
  } catch (err: any) {
    resetError.value = err?.response?.data?.message ?? '코드 발송에 실패했습니다.'
  } finally {
    resetLoading.value = false
  }
}

function startCooldown() {
  sendCodeCooldown.value = 60
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    if (sendCodeCooldown.value <= 0) { clearInterval(cooldownTimer!); return }
    sendCodeCooldown.value--
  }, 1000)
}

async function resendCode() {
  if (sendCodeCooldown.value > 0) return
  resetLoading.value = true
  resetError.value = ''
  try {
    await authApi.sendPasswordResetCode(resetEmail.value.trim())
    startCooldown()
  } catch (err: any) {
    resetError.value = err?.response?.data?.message ?? '코드 재발송에 실패했습니다.'
  } finally {
    resetLoading.value = false
  }
}

function proceedToPassword() {
  if (!resetCode.value.trim()) return
  resetStep.value = 'password'
  resetError.value = ''
}

const resetPwRules = computed(() => checkPasswordRules(resetNewPw.value))
const resetPwValid = computed(() =>
  isPasswordValid(resetNewPw.value) && resetNewPw.value === resetNewPwConfirm.value
)

async function submitResetPassword() {
  if (!resetPwValid.value || resetLoading.value) return
  resetLoading.value = true
  resetError.value = ''
  try {
    await authApi.resetPassword(resetEmail.value.trim(), resetCode.value.trim(), resetNewPw.value)
    resetStep.value = 'done'
  } catch (err: any) {
    resetError.value = err?.response?.data?.message ?? '비밀번호 재설정에 실패했습니다. 코드를 다시 확인해주세요.'
  } finally {
    resetLoading.value = false
  }
}
</script>

<template>
  <div>
  <div class="min-h-screen bg-white flex flex-col">
    <main class="flex-1 flex items-center justify-center py-16 px-4 mt-16">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-lg border border-sky-100 p-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-2 mb-1">
            <Fish class="w-8 h-8 text-sky-500" />
            <span class="text-2xl font-black text-sky-600">아쿠아 Hub</span>
          </div>
          <p class="text-sm text-slate-400 mt-1">물생활의 모든 것, 한 곳에서</p>
        </div>

        <h1 class="text-3xl font-black text-slate-900 mb-6">로그인</h1>

        <!-- Social Login -->
        <div class="flex flex-col gap-3">
          <a href="/oauth2/authorization/kakao"
            class="w-full bg-[#FEE500] text-[#3C1E1E] rounded-full py-3 flex items-center justify-center gap-2 font-semibold hover:brightness-95 transition-all duration-150">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.88 5.32 4.66 6.72l-.88 3.24c-.08.29.24.55.51.41l3.87-2.57c.6.09 1.2.2 1.84.2 5.5 0 10-3.58 10-8s-4.5-8-10-8z"/>
            </svg>
            카카오로 계속하기
          </a>
          <a href="/oauth2/authorization/naver"
            class="w-full bg-[#03C75A] text-white rounded-full py-3 flex items-center justify-center gap-2 font-semibold hover:brightness-95 transition-all duration-150">
            <span class="text-lg font-black">N</span>
            네이버로 계속하기
          </a>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <hr class="flex-1 border-sky-100" />
          <span class="text-sm text-slate-400">또는 이메일로 로그인</span>
          <hr class="flex-1 border-sky-100" />
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
            <input
              v-model="email"
              type="email"
              placeholder="aqua@example.com"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호 입력"
                class="w-full px-4 py-3 pr-12 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <Eye v-show="!showPassword" class="w-5 h-5" />
                <EyeOff v-show="showPassword" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input v-model="rememberMe" type="checkbox" id="rememberMe"
              class="w-4 h-4 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500" />
            <label for="rememberMe" class="text-sm text-slate-600">로그인 상태 유지</label>
          </div>

          <div v-show="hasError" class="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle class="w-4 h-4" />
            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-show="isLoading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            <span>{{ isLoading ? '로그인 중...' : '로그인' }}</span>
          </button>
        </form>

        <!-- Links -->
        <div class="flex items-center justify-center gap-4 mt-6">
          <button @click="openResetPw" class="text-sm text-slate-400 hover:text-sky-500 transition-colors">비밀번호 찾기</button>
          <span class="text-slate-300">·</span>
          <button @click="openFindEmail" class="text-sm text-slate-400 hover:text-sky-500 transition-colors">이메일 찾기</button>
        </div>

        <!-- Sign Up -->
        <div class="text-center mt-6">
          <span class="text-slate-500 text-sm">아직 계정이 없으신가요?</span>
          <router-link to="/register" class="text-sky-500 font-semibold hover:underline ml-1">회원가입</router-link>
        </div>
      </div>
    </main>
  </div>

  <!-- ── 이메일 찾기 모달 ──────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showFindEmail"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click.self="showFindEmail = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-slate-900">이메일 찾기</h2>
          <button @click="showFindEmail = false" class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- 결과 화면 -->
        <div v-if="findEmailStep === 'result'" class="text-center py-4 space-y-4">
          <CheckCircle2 class="w-12 h-12 text-emerald-500 mx-auto" />
          <div>
            <p class="text-sm text-slate-500 mb-1">가입된 이메일 주소</p>
            <p class="text-lg font-bold text-slate-900">{{ foundEmail }}</p>
          </div>
          <button
            @click="showFindEmail = false"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors"
          >
            로그인하기
          </button>
        </div>

        <!-- 입력 화면 -->
        <div v-else class="space-y-4">
          <p class="text-sm text-slate-500">가입 시 등록한 이름과 전화번호를 입력해주세요.</p>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">이름</label>
            <input
              v-model="findName"
              type="text"
              placeholder="홍길동"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">전화번호</label>
            <input
              v-model="findPhone"
              type="tel"
              placeholder="010-1234-5678"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
          </div>
          <div v-if="findEmailError" class="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />{{ findEmailError }}
          </div>
          <button
            @click="submitFindEmail"
            :disabled="!findName.trim() || !findPhone.trim() || findEmailLoading"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="findEmailLoading" class="w-4 h-4 animate-spin" />
            이메일 찾기
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── 비밀번호 재설정 모달 ──────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showResetPw"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click.self="showResetPw = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-slate-900">비밀번호 찾기</h2>
          <button @click="showResetPw = false" class="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center gap-2 mb-6">
          <div v-for="(label, i) in ['이메일', '인증', '비밀번호']" :key="i" class="flex items-center gap-2">
            <div class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors"
              :class="['email','code','password'].indexOf(resetStep) >= i
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 text-slate-400'"
            >{{ i + 1 }}</div>
            <span class="text-xs text-slate-400 hidden sm:block">{{ label }}</span>
            <span v-if="i < 2" class="text-slate-200 text-xs">›</span>
          </div>
        </div>

        <!-- 완료 -->
        <div v-if="resetStep === 'done'" class="text-center py-4 space-y-4">
          <CheckCircle2 class="w-12 h-12 text-emerald-500 mx-auto" />
          <div>
            <p class="font-bold text-slate-900">비밀번호가 재설정되었습니다</p>
            <p class="text-sm text-slate-400 mt-1">새 비밀번호로 로그인해주세요.</p>
          </div>
          <button
            @click="showResetPw = false"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors"
          >
            로그인하기
          </button>
        </div>

        <!-- Step 1: 이메일 입력 -->
        <div v-else-if="resetStep === 'email'" class="space-y-4">
          <p class="text-sm text-slate-500">가입된 이메일 주소로 인증 코드를 보내드립니다.</p>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">이메일</label>
            <input
              v-model="resetEmail"
              type="email"
              placeholder="aqua@example.com"
              @keyup.enter="sendResetCode"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
          </div>
          <div v-if="resetError" class="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />{{ resetError }}
          </div>
          <button
            @click="sendResetCode"
            :disabled="!resetEmail.trim() || resetLoading"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="resetLoading" class="w-4 h-4 animate-spin" />
            인증 코드 받기
          </button>
        </div>

        <!-- Step 2: 코드 입력 -->
        <div v-else-if="resetStep === 'code'" class="space-y-4">
          <p class="text-sm text-slate-500"><span class="font-semibold text-slate-700">{{ resetEmail }}</span>로 발송된 6자리 코드를 입력해주세요.</p>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">인증 코드</label>
            <input
              v-model="resetCode"
              type="text"
              maxlength="6"
              placeholder="000000"
              @keyup.enter="proceedToPassword"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all text-center text-xl font-mono tracking-widest"
            />
          </div>
          <div v-if="resetError" class="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />{{ resetError }}
          </div>
          <button
            @click="proceedToPassword"
            :disabled="resetCode.length < 6"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
          <button
            @click="resendCode"
            :disabled="sendCodeCooldown > 0 || resetLoading"
            class="w-full text-sm text-slate-400 hover:text-sky-500 transition-colors disabled:cursor-not-allowed"
          >
            {{ sendCodeCooldown > 0 ? `${sendCodeCooldown}초 후 재발송 가능` : '코드 재발송' }}
          </button>
        </div>

        <!-- Step 3: 새 비밀번호 -->
        <div v-else-if="resetStep === 'password'" class="space-y-4">
          <p class="text-sm text-slate-500">새로운 비밀번호를 설정해주세요. (8자 이상)</p>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">새 비밀번호</label>
            <div class="relative">
              <input
                v-model="resetNewPw"
                :type="showResetPw1 ? 'text' : 'password'"
                placeholder="8자 이상, 대문자, 특수문자 포함"
                class="w-full px-4 py-3 pr-12 rounded-xl border border-sky-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              <button type="button" @click="showResetPw1 = !showResetPw1"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Eye v-show="!showResetPw1" class="w-4 h-4" /><EyeOff v-show="showResetPw1" class="w-4 h-4" />
              </button>
            </div>
            <div v-if="resetNewPw.length > 0" class="mt-2 space-y-1">
              <p class="flex items-center gap-1.5 text-xs" :class="resetPwRules.minLength ? 'text-emerald-500' : 'text-slate-400'">
                <Check v-if="resetPwRules.minLength" class="w-3 h-3" />
                <span v-else class="w-3 font-bold">·</span>
                8자 이상
              </p>
              <p class="flex items-center gap-1.5 text-xs" :class="resetPwRules.hasUpper ? 'text-emerald-500' : 'text-slate-400'">
                <Check v-if="resetPwRules.hasUpper" class="w-3 h-3" />
                <span v-else class="w-3 font-bold">·</span>
                대문자 포함 (A-Z)
              </p>
              <p class="flex items-center gap-1.5 text-xs" :class="resetPwRules.hasSpecial ? 'text-emerald-500' : 'text-slate-400'">
                <Check v-if="resetPwRules.hasSpecial" class="w-3 h-3" />
                <span v-else class="w-3 font-bold">·</span>
                특수문자 포함 (!@#$% 등)
              </p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">새 비밀번호 확인</label>
            <div class="relative">
              <input
                v-model="resetNewPwConfirm"
                :type="showResetPw2 ? 'text' : 'password'"
                placeholder="비밀번호 재입력"
                @keyup.enter="submitResetPassword"
                class="w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
                :class="resetNewPwConfirm && !resetPwValid ? 'border-red-300' : 'border-sky-100'"
              />
              <button type="button" @click="showResetPw2 = !showResetPw2"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Eye v-show="!showResetPw2" class="w-4 h-4" /><EyeOff v-show="showResetPw2" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="resetNewPwConfirm && resetNewPw !== resetNewPwConfirm" class="text-red-400 text-xs mt-1">
              비밀번호가 일치하지 않습니다.
            </p>
          </div>
          <div v-if="resetError" class="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />{{ resetError }}
          </div>
          <button
            @click="submitResetPassword"
            :disabled="!resetPwValid || resetLoading"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="resetLoading" class="w-4 h-4 animate-spin" />
            비밀번호 재설정
          </button>
        </div>
      </div>
    </div>
  </Teleport>
  </div>
</template>
