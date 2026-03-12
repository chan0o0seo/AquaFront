<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye, EyeOff, AlertTriangle, Check, LogOut, Trash2, Loader2, Mail } from 'lucide-vue-next'
import type { AuthMember } from '@/api'
import { memberApi } from '@/api/member.api'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps<{ user: AuthMember }>()

// ── 기본 정보 폼 (로컬 복사본) ──────────────────────
const formName     = ref(props.user.name)
const formNickName = ref(props.user.nickName)
const formPhone    = ref(props.user.phoneNumber)
const formMarketing = ref(props.user.marketingAgreed)

watch(() => props.user, (u) => {
  formName.value     = u.name
  formNickName.value = u.nickName
  formPhone.value    = u.phoneNumber
  formMarketing.value = u.marketingAgreed
})

const isSavingProfile = ref(false)
const profileSaved    = ref(false)
const profileError    = ref('')

async function saveProfile() {
  if (isSavingProfile.value) return
  isSavingProfile.value = true
  profileError.value = ''
  try {
    await memberApi.updateProfile({
      name:            formName.value,
      nickName:        formNickName.value,
      phoneNumber:     formPhone.value,
      marketingAgreed: formMarketing.value,
      profileImageUrl: props.user.profileImageUrl,
    })
    await authStore.fetchMe()
    profileSaved.value = true
    setTimeout(() => { profileSaved.value = false }, 2000)
  } catch (e: any) {
    profileError.value = e?.response?.data?.message ?? '저장에 실패했습니다.'
  } finally {
    isSavingProfile.value = false
  }
}

// ── 비밀번호 변경 (이메일 인증 코드 방식) ──────────────
const verificationCode  = ref('')
const newPassword       = ref('')
const confirmPassword   = ref('')
const showNewPw         = ref(false)
const showConfirmPw     = ref(false)
const codeSent          = ref(false)
const isSendingCode     = ref(false)
const isChangingPw      = ref(false)
const codeTimer         = ref(0)
const pwError           = ref('')
const pwSuccess         = ref(false)
let codeTimerInterval: ReturnType<typeof setInterval> | null = null

const codeTimerLabel = computed(() => {
  const m = Math.floor(codeTimer.value / 60)
  const s = codeTimer.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function startCodeTimer() {
  codeTimer.value = 300
  if (codeTimerInterval) clearInterval(codeTimerInterval)
  codeTimerInterval = setInterval(() => {
    if (codeTimer.value > 0) {
      codeTimer.value--
    } else {
      clearInterval(codeTimerInterval!)
      codeSent.value = false
    }
  }, 1000)
}

async function sendVerifyEmail() {
  if (isSendingCode.value) return
  isSendingCode.value = true
  pwError.value = ''
  try {
    await memberApi.sendPasswordVerifyEmail()
    codeSent.value = true
    verificationCode.value = ''
    startCodeTimer()
  } catch (e: any) {
    pwError.value = e?.response?.data?.message ?? '인증 코드 발송에 실패했습니다.'
  } finally {
    isSendingCode.value = false
  }
}

const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return null
  return newPassword.value === confirmPassword.value
})

const isPasswordFormValid = computed(() =>
  codeSent.value &&
  verificationCode.value.length > 0 &&
  newPassword.value.length >= 8 &&
  passwordsMatch.value === true
)

async function changePassword() {
  if (!isPasswordFormValid.value || isChangingPw.value) return
  isChangingPw.value = true
  pwError.value = ''
  try {
    await memberApi.changePassword({
      verificationCode: verificationCode.value,
      newPassword: newPassword.value,
    })
    clearInterval(codeTimerInterval!)
    codeSent.value = false
    verificationCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    pwSuccess.value = true
    setTimeout(() => { pwSuccess.value = false }, 2000)
  } catch (e: any) {
    pwError.value = e?.response?.data?.message ?? '비밀번호 변경에 실패했습니다.'
  } finally {
    isChangingPw.value = false
  }
}

// ── 로그아웃 / 탈퇴 ──────────────────────────────────
const showDeleteModal = ref(false)
const deletePassword  = ref('')
const showDeletePw    = ref(false)
const isDeleting      = ref(false)
const deleteError     = ref('')

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletePassword.value  = ''
  showDeletePw.value    = false
  deleteError.value     = ''
}

async function handleDelete() {
  if (!deletePassword.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await authStore.withdraw(deletePassword.value)
    authStore.clear()
    router.push('/withdraw/complete')
  } catch (e: any) {
    deleteError.value = e?.response?.data?.message ?? '비밀번호가 올바르지 않습니다.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-black text-slate-900 mb-6">계정 설정</h1>

    <!-- Section 1: 기본 정보 -->
    <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
      <h2 class="text-lg font-bold text-slate-900 mb-5">기본 정보</h2>

      <div class="space-y-4">
        <!-- 이름 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">이름 (실명)</label>
          <input
            v-model="formName"
            type="text"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
            placeholder="홍길동"
          />
        </div>

        <!-- 닉네임 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">닉네임</label>
          <input
            v-model="formNickName"
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
            :value="user.email"
            disabled
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-400 bg-slate-50 cursor-not-allowed"
          />
          <p class="text-xs text-slate-400 mt-1.5">이메일은 변경할 수 없습니다</p>
        </div>

        <!-- 휴대폰 번호 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">휴대폰 번호</label>
          <input
            v-model="formPhone"
            type="tel"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
            placeholder="010-0000-0000"
          />
        </div>

        <!-- 마케팅 수신 동의 -->
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="formMarketing"
            type="checkbox"
            class="w-4 h-4 rounded accent-sky-500"
          />
          <span class="text-sm text-slate-600">마케팅 정보 수신 동의</span>
        </label>
      </div>

      <p v-if="profileError" class="mt-3 text-xs text-red-500">{{ profileError }}</p>

      <div class="flex justify-end mt-6">
        <button
          @click="saveProfile"
          :disabled="isSavingProfile"
          class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors cursor-pointer"
        >
          <Loader2 v-if="isSavingProfile" class="w-4 h-4 animate-spin" />
          <Check v-else-if="profileSaved" class="w-4 h-4" />
          <span>{{ profileSaved ? '저장됨' : '저장하기' }}</span>
        </button>
      </div>
    </div>

    <!-- Section 2: 비밀번호 변경 -->
    <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
      <h2 class="text-lg font-bold text-slate-900 mb-5">비밀번호 변경</h2>

      <div class="space-y-4">
        <!-- 인증 코드 발송 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">이메일 인증</label>
          <div class="flex gap-2">
            <input
              :value="user.email"
              disabled
              class="flex-1 border border-sky-100 rounded-xl px-4 py-3 text-slate-400 bg-slate-50 cursor-not-allowed text-sm"
            />
            <button
              @click="sendVerifyEmail"
              :disabled="isSendingCode"
              class="flex items-center gap-1.5 px-4 py-3 bg-sky-50 text-sky-600 border border-sky-200 rounded-xl text-sm font-medium hover:bg-sky-100 transition disabled:opacity-50 whitespace-nowrap"
            >
              <Loader2 v-if="isSendingCode" class="w-3.5 h-3.5 animate-spin" />
              <Mail v-else class="w-3.5 h-3.5" />
              {{ codeSent ? '재발송' : '코드 발송' }}
            </button>
          </div>
          <div v-if="codeSent" class="mt-1 text-amber-500 font-mono text-xs">
            {{ codeTimerLabel }} 내에 인증 코드를 입력하세요
          </div>
        </div>

        <!-- 인증 코드 입력 -->
        <div v-if="codeSent">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">인증 코드</label>
          <input
            v-model="verificationCode"
            type="text"
            maxlength="6"
            placeholder="이메일로 받은 6자리 코드"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
          />
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
            <button type="button" @click="showNewPw = !showNewPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <EyeOff v-if="showNewPw" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="newPassword.length > 0 && newPassword.length < 8" class="text-xs text-slate-400 mt-1.5">8자 이상 입력해주세요</p>
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
            <button type="button" @click="showConfirmPw = !showConfirmPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <EyeOff v-if="showConfirmPw" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="passwordsMatch === false" class="flex items-center gap-1 text-xs text-red-500 mt-1.5">
            <AlertTriangle class="w-3.5 h-3.5" />비밀번호가 일치하지 않습니다
          </p>
          <p v-else-if="passwordsMatch === true" class="flex items-center gap-1 text-xs text-emerald-500 mt-1.5">
            <Check class="w-3.5 h-3.5" />비밀번호가 일치합니다
          </p>
        </div>
      </div>

      <p v-if="pwError" class="mt-3 text-xs text-red-500">{{ pwError }}</p>
      <p v-if="pwSuccess" class="mt-3 text-xs text-emerald-500 flex items-center gap-1">
        <Check class="w-3.5 h-3.5" />비밀번호가 변경되었습니다
      </p>

      <div class="flex justify-end mt-6">
        <button
          @click="changePassword"
          :disabled="!isPasswordFormValid || isChangingPw"
          class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors cursor-pointer"
        >
          <Loader2 v-if="isChangingPw" class="w-4 h-4 animate-spin" />
          비밀번호 변경
        </button>
      </div>
    </div>

    <!-- Section 3: 위험 구역 -->
    <div class="bg-red-50/30 rounded-2xl border border-red-100 p-6">

      <div class="flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <LogOut class="w-5 h-5 text-slate-500" />
          <span class="text-slate-700 font-medium">로그아웃</span>
        </div>
        <button
          @click="handleLogout"
          class="border border-slate-200 text-slate-600 rounded-full px-4 py-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
        >
          로그아웃
        </button>
      </div>

      <div class="border-t border-red-100 my-1" />

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
          class="border border-red-200 text-red-500 rounded-full px-4 py-2 text-sm hover:bg-red-50 transition-colors cursor-pointer"
        >
          탈퇴하기
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="closeDeleteModal"
      >
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
          <div class="flex flex-col items-center text-center mb-5">
            <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle class="w-7 h-7 text-red-500" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">정말 탈퇴하시겠어요?</h3>
            <p class="text-slate-500 text-sm leading-relaxed">
              탈퇴하면 계정, 주문 내역, 찜 목록 등<br />모든 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">비밀번호 확인</label>
            <div class="relative">
              <input
                v-model="deletePassword"
                :type="showDeletePw ? 'text' : 'password'"
                :class="deleteError ? 'border-red-400 focus:ring-red-400' : 'border-red-200 focus:ring-red-300'"
                class="w-full border rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:ring-2 focus:outline-none transition"
                placeholder="현재 비밀번호를 입력하세요"
                @input="deleteError = ''"
                @keydown.enter="handleDelete"
              />
              <button type="button" @click="showDeletePw = !showDeletePw"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <EyeOff v-if="showDeletePw" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="deleteError" class="flex items-center gap-1 text-xs text-red-500 mt-1.5">
              <AlertTriangle class="w-3.5 h-3.5 flex-shrink-0" />{{ deleteError }}
            </p>
            <p v-else class="text-xs text-slate-400 mt-1.5">탈퇴 확인을 위해 비밀번호를 입력해주세요</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="closeDeleteModal"
              class="flex-1 border border-slate-200 text-slate-600 font-semibold rounded-full py-3 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              @click="handleDelete"
              :disabled="!deletePassword || isDeleting"
              class="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full py-3 text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
              <span>{{ isDeleting ? '처리 중...' : '탈퇴하기' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white { transform: scale(0.95); }
.modal-leave-to .bg-white { transform: scale(0.95); }
</style>
