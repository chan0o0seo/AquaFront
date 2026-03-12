<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Fish, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

const isFormValid = computed(() => {
  return email.value.length > 0 && password.value.length > 0
})

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
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center py-16 px-4 mt-16">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-lg border border-sky-100 p-10">
        <!-- Logo Area -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-2 mb-1">
            <Fish class="w-8 h-8 text-sky-500" />
            <span class="text-2xl font-black text-sky-600">아쿠아 Hub</span>
          </div>
          <p class="text-sm text-slate-400 mt-1">물생활의 모든 것, 한 곳에서</p>
        </div>

        <!-- Heading -->
        <h1 class="text-3xl font-black text-slate-900 mb-6">로그인</h1>

        <!-- Social Login Buttons -->
        <div class="flex flex-col gap-3">
          <button 
            class="w-full bg-[#FEE500] text-[#3C1E1E] rounded-full py-3 flex items-center justify-center gap-2 font-semibold hover:brightness-95 transition-all duration-150"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.88 5.32 4.66 6.72l-.88 3.24c-.08.29.24.55.51.41l3.87-2.57c.6.09 1.2.2 1.84.2 5.5 0 10-3.58 10-8s-4.5-8-10-8z"/>
            </svg>
            카카오로 계속하기
          </button>
          <button 
            class="w-full bg-[#03C75A] text-white rounded-full py-3 flex items-center justify-center gap-2 font-semibold hover:brightness-95 transition-all duration-150"
          >
            <span class="text-lg font-black">N</span>
            네이버로 계속하기
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <hr class="flex-1 border-sky-100" />
          <span class="text-sm text-slate-400">또는 이메일로 로그인</span>
          <hr class="flex-1 border-sky-100" />
        </div>

        <!-- Email/Password Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
            <input
              v-model="email"
              type="email"
              placeholder="aqua@example.com"
              class="w-full px-4 py-3 rounded-xl border border-sky-100 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-150"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호 입력"
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
          </div>

          <!-- Remember Me -->
          <div class="flex items-center gap-2">
            <input
              v-model="rememberMe"
              type="checkbox"
              id="rememberMe"
              class="w-4 h-4 rounded border-sky-200 text-sky-500 focus:ring-sky-400 accent-sky-500"
            />
            <label for="rememberMe" class="text-sm text-slate-600">로그인 상태 유지</label>
          </div>

          <!-- Error Message -->
          <div v-show="hasError" class="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle class="w-4 h-4" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-show="isLoading" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
            <span v-show="!isLoading">로그인</span>
            <span v-show="isLoading">로그인 중...</span>
          </button>
        </form>

        <!-- Links Row -->
        <div class="flex items-center justify-center gap-4 mt-6">
          <a href="#" class="text-sm text-slate-400 hover:text-sky-500 transition-colors">비밀번호 찾기</a>
          <span class="text-slate-300">·</span>
          <a href="#" class="text-sm text-slate-400 hover:text-sky-500 transition-colors">이메일 찾기</a>
        </div>

        <!-- Sign Up CTA -->
        <div class="text-center mt-6">
          <span class="text-slate-500 text-sm">아직 계정이 없으신가요?</span>
          <router-link to="/register" class="text-sky-500 font-semibold hover:underline ml-1">회원가입</router-link>
        </div>
      </div>
    </main>
  </div>
</template>
