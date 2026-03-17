<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Fish, AlertCircle, Loader2 } from 'lucide-vue-next'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const key = route.query.key as string

// ── 프리필 정보 ──────────────────────────────────────────────
interface PendingInfo {
  provider: string
  email: string
  nickname: string
  profileImageUrl: string | null
}

const info = ref<PendingInfo | null>(null)
const loadError = ref(false)

// ── 폼 상태 ──────────────────────────────────────────────────
const nickName = ref('')
const termsAgreed = ref(false)
const privacyAgreed = ref(false)
const marketingAgreed = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

const providerLabel = computed(() => info.value?.provider === 'KAKAO' ? '카카오' : '네이버')
const canSubmit = computed(() => nickName.value.trim().length >= 2 && termsAgreed.value && privacyAgreed.value)

onMounted(async () => {
  if (!key) { router.replace('/login'); return }
  try {
    const res = await api.get<{ success: boolean; data: PendingInfo }>('/auth/oauth2/pending', {
      params: { key },
    })
    info.value = res.data.data
    nickName.value = info.value.nickname ?? ''
  } catch {
    loadError.value = true
  }
})

async function handleSubmit() {
  if (!canSubmit.value || isLoading.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    await api.post('/auth/oauth2/signup', {
      key,
      nickName: nickName.value.trim(),
      termsAgreed: termsAgreed.value,
      privacyAgreed: privacyAgreed.value,
      marketingAgreed: marketingAgreed.value,
    })
    await authStore.fetchMe()
    router.replace('/')
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? '회원가입에 실패했습니다. 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <main class="flex-1 flex items-center justify-center py-16 px-4 mt-16">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-lg border border-sky-100 p-10">

        <!-- 로고 -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-2 mb-1">
            <Fish class="w-8 h-8 text-sky-500" />
            <span class="text-2xl font-black text-sky-600">아쿠아 Hub</span>
          </div>
          <p class="text-sm text-slate-400 mt-1">물생활의 모든 것, 한 곳에서</p>
        </div>

        <!-- 키 만료 오류 -->
        <div v-if="loadError" class="text-center py-8 space-y-4">
          <AlertCircle class="w-12 h-12 text-red-400 mx-auto" />
          <p class="text-slate-700 font-semibold">링크가 만료되었습니다</p>
          <p class="text-sm text-slate-400">소셜 로그인을 다시 시도해주세요.</p>
          <button @click="router.replace('/login')"
            class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors">
            로그인 페이지로
          </button>
        </div>

        <!-- 회원가입 폼 -->
        <template v-else-if="info">
          <h1 class="text-2xl font-black text-slate-900 mb-1">소셜 회원가입</h1>
          <p class="text-sm text-slate-400 mb-6">
            <span class="font-semibold text-slate-600">{{ providerLabel }}</span> 계정으로 아쿠아 Hub에 가입합니다.
          </p>

          <!-- 프로필 미리보기 -->
          <div class="flex items-center gap-4 p-4 bg-sky-50 rounded-2xl border border-sky-100 mb-6">
            <img v-if="info.profileImageUrl" :src="info.profileImageUrl" alt="프로필"
              class="w-12 h-12 rounded-full object-cover border-2 border-sky-200" />
            <div v-else class="w-12 h-12 rounded-full bg-sky-200 flex items-center justify-center text-sky-600 font-bold text-lg">
              {{ info.nickname?.[0] ?? '?' }}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ info.nickname }}</p>
              <p class="text-xs text-slate-400 truncate">{{ info.email }}</p>
            </div>
          </div>

          <div class="space-y-5">
            <!-- 닉네임 -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">닉네임 <span class="text-red-400">*</span></label>
              <input
                v-model="nickName"
                type="text"
                maxlength="20"
                placeholder="사용할 닉네임 (2자 이상)"
                class="w-full px-4 py-3 rounded-xl border border-sky-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              <p class="text-xs text-slate-400 mt-1">소셜 계정에서 가져온 닉네임을 수정할 수 있습니다.</p>
            </div>

            <!-- 약관 동의 -->
            <div class="space-y-3 pt-1">
              <p class="text-sm font-semibold text-slate-700">약관 동의</p>

              <label class="flex items-center gap-3 cursor-pointer group">
                <input v-model="termsAgreed" type="checkbox" class="w-4 h-4 rounded accent-sky-500" />
                <span class="text-sm text-slate-700 group-hover:text-sky-600 transition-colors">
                  <span class="text-red-400 font-semibold">[필수] </span>이용약관 동의
                </span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <input v-model="privacyAgreed" type="checkbox" class="w-4 h-4 rounded accent-sky-500" />
                <span class="text-sm text-slate-700 group-hover:text-sky-600 transition-colors">
                  <span class="text-red-400 font-semibold">[필수] </span>개인정보 처리방침 동의
                </span>
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <input v-model="marketingAgreed" type="checkbox" class="w-4 h-4 rounded accent-sky-500" />
                <span class="text-sm text-slate-600 group-hover:text-sky-600 transition-colors">
                  <span class="text-slate-400 font-semibold">[선택] </span>마케팅 정보 수신 동의
                </span>
              </label>
            </div>

            <!-- 오류 -->
            <div v-if="errorMsg" class="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle class="w-4 h-4 flex-shrink-0" />
              <span>{{ errorMsg }}</span>
            </div>

            <!-- 제출 -->
            <button
              @click="handleSubmit"
              :disabled="!canSubmit || isLoading"
              class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
              <span>{{ isLoading ? '가입 중...' : '가입 완료하기' }}</span>
            </button>

            <p class="text-center text-sm text-slate-400">
              이미 계정이 있으신가요?
              <router-link to="/login" class="text-sky-500 font-semibold hover:underline">로그인</router-link>
            </p>
          </div>
        </template>

        <!-- 로딩 -->
        <div v-else class="flex justify-center py-12">
          <span class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>

      </div>
    </main>
  </div>
</template>
