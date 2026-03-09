<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff, AlertTriangle, Check, LogOut, Trash2 } from 'lucide-vue-next'

// Profile section
const nickname = ref('아쿠아리스트')
const phone = ref('')
const isSavingProfile = ref(false)
const profileSaved = ref(false)

// Password section
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showConfirmPw = ref(false)

// Modal
const showDeleteModal = ref(false)

// ---- Computed ----

const passwordStrength = computed(() => {
  const len = newPassword.value.length
  if (len === 0) return null
  if (len < 8) return 'weak'
  if (len < 12) return 'medium'
  return 'strong'
})

const passwordStrengthLabel = computed(() => {
  const map = { weak: '약함', medium: '보통', strong: '강함' }
  return passwordStrength.value ? map[passwordStrength.value] : ''
})

const passwordStrengthWidth = computed(() => {
  const map = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' }
  return passwordStrength.value ? map[passwordStrength.value] : 'w-0'
})

const passwordStrengthColor = computed(() => {
  const map = { weak: 'bg-red-400', medium: 'bg-amber-400', strong: 'bg-emerald-500' }
  return passwordStrength.value ? map[passwordStrength.value] : ''
})

const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return null
  return newPassword.value === confirmPassword.value
})

const isPasswordFormValid = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    passwordsMatch.value === true
  )
})

// ---- Actions ----

function saveProfile() {
  if (isSavingProfile.value || profileSaved.value) return
  isSavingProfile.value = true
  setTimeout(() => {
    isSavingProfile.value = false
    profileSaved.value = true
    setTimeout(() => {
      profileSaved.value = false
    }, 1500)
  }, 1000)
}

function changePassword() {
  if (!isPasswordFormValid.value) return
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

function logout() {
  // stub
}

function confirmDelete() {
  showDeleteModal.value = false
  // stub: actual delete logic
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-black text-slate-900 mb-6">계정 설정</h1>

    <!-- Section 1: 기본 정보 -->
    <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
      <h2 class="text-lg font-bold text-slate-900 mb-5">기본 정보</h2>

      <div class="space-y-4">
        <!-- 닉네임 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">닉네임</label>
          <input
            v-model="nickname"
            type="text"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <!-- 이메일 (읽기 전용) -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
          <input
            type="email"
            value="aqua@example.com"
            disabled
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-400 bg-slate-50 cursor-not-allowed"
          />
          <p class="text-xs text-slate-400 mt-1.5">이메일은 변경할 수 없습니다</p>
        </div>

        <!-- 휴대폰 번호 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">휴대폰 번호</label>
          <input
            v-model="phone"
            type="tel"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
            placeholder="010-0000-0000"
          />
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end mt-6">
        <button
          @click="saveProfile"
          :disabled="isSavingProfile"
          class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors duration-150 cursor-pointer"
        >
          <span v-if="isSavingProfile" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <Check v-else-if="profileSaved" class="w-4 h-4" />
          <span>{{ profileSaved ? '저장됨' : '저장하기' }}</span>
        </button>
      </div>
    </div>

    <!-- Section 2: 비밀번호 변경 -->
    <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
      <h2 class="text-lg font-bold text-slate-900 mb-5">비밀번호 변경</h2>

      <div class="space-y-4">
        <!-- 현재 비밀번호 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">현재 비밀번호</label>
          <div class="relative">
            <input
              v-model="currentPassword"
              :type="showCurrentPw ? 'text' : 'password'"
              class="w-full border border-sky-100 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
              placeholder="현재 비밀번호"
            />
            <button
              type="button"
              @click="showCurrentPw = !showCurrentPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <EyeOff v-if="showCurrentPw" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 새 비밀번호 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">새 비밀번호</label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNewPw ? 'text' : 'password'"
              class="w-full border border-sky-100 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
              placeholder="새 비밀번호 (8자 이상)"
            />
            <button
              type="button"
              @click="showNewPw = !showNewPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <EyeOff v-if="showNewPw" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>

          <!-- 길이 힌트 -->
          <p v-if="newPassword.length > 0 && newPassword.length < 8" class="text-xs text-slate-400 mt-1.5">
            8자 이상 입력해주세요
          </p>

          <!-- Strength Bar -->
          <div v-if="newPassword.length > 0" class="mt-2">
            <div class="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="[passwordStrengthWidth, passwordStrengthColor]"
              />
            </div>
            <p class="text-xs mt-1" :class="{
              'text-red-400': passwordStrength === 'weak',
              'text-amber-500': passwordStrength === 'medium',
              'text-emerald-500': passwordStrength === 'strong'
            }">
              비밀번호 강도: {{ passwordStrengthLabel }}
            </p>
          </div>
        </div>

        <!-- 새 비밀번호 확인 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">새 비밀번호 확인</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPw ? 'text' : 'password'"
              class="w-full border border-sky-100 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
              :class="confirmPassword && !passwordsMatch ? 'border-red-300 focus:ring-red-300' : ''"
              placeholder="비밀번호 재입력"
            />
            <button
              type="button"
              @click="showConfirmPw = !showConfirmPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <EyeOff v-if="showConfirmPw" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>

          <!-- Match feedback -->
          <p v-if="passwordsMatch === false" class="flex items-center gap-1 text-xs text-red-500 mt-1.5">
            <AlertTriangle class="w-3.5 h-3.5" />
            비밀번호가 일치하지 않습니다
          </p>
          <p v-else-if="passwordsMatch === true" class="flex items-center gap-1 text-xs text-emerald-500 mt-1.5">
            <Check class="w-3.5 h-3.5" />
            비밀번호가 일치합니다
          </p>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button
          @click="changePassword"
          :disabled="!isPasswordFormValid"
          class="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors duration-150 cursor-pointer"
        >
          비밀번호 변경
        </button>
      </div>
    </div>

    <!-- Section 3: 위험 구역 -->
    <div class="bg-red-50/30 rounded-2xl border border-red-100 p-6">
      <h2 class="text-lg font-bold text-red-600 mb-5">위험 구역</h2>

      <!-- 로그아웃 -->
      <div class="flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <LogOut class="w-5 h-5 text-slate-500" />
          <span class="text-slate-700 font-medium">로그아웃</span>
        </div>
        <button
          @click="logout"
          class="border border-slate-200 text-slate-600 rounded-full px-4 py-2 text-sm hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
        >
          로그아웃
        </button>
      </div>

      <div class="border-t border-red-100 my-1" />

      <!-- 회원 탈퇴 -->
      <div class="flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <Trash2 class="w-5 h-5 text-red-400" />
          <div>
            <span class="text-slate-700 font-medium block">회원 탈퇴</span>
            <span class="text-slate-400 text-sm">탈퇴 시 모든 데이터가 삭제됩니다</span>
          </div>
        </div>
        <button
          @click="showDeleteModal = true"
          class="border border-red-200 text-red-500 rounded-full px-4 py-2 text-sm hover:bg-red-50 transition-colors duration-150 cursor-pointer"
        >
          탈퇴하기
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg">
          <div class="flex flex-col items-center text-center">
            <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle class="w-7 h-7 text-red-500" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">정말 탈퇴하시겠어요?</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-6">
              탈퇴하면 계정, 주문 내역, 찜 목록 등<br />모든 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false"
              class="flex-1 border border-slate-200 text-slate-600 font-semibold rounded-full py-3 text-sm hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
            >
              취소
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full py-3 text-sm transition-colors duration-150 cursor-pointer"
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}
.modal-enter-from .bg-white {
  transform: scale(0.95);
}
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
