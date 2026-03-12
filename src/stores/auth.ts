import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type AuthMember } from '@/api'

const TOKEN_LIFETIME_MS = 900_000   // 15분
const REFRESH_BEFORE_MS = 120_000   // 만료 2분 전에 갱신
const ISSUED_AT_KEY = 'auth_token_issued_at'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthMember | null>(null)
  const initialized = ref(false)

  const isLoggedIn = computed(() => user.value !== null)
  const isSeller = computed(() =>
    user.value?.role === 'SELLER' || user.value?.role === 'BREEDER'
  )
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // ── 자동 갱신 타이머 ───────────────────────────────
  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  function recordIssuedAt() {
    localStorage.setItem(ISSUED_AT_KEY, String(Date.now()))
  }

  function clearIssuedAt() {
    localStorage.removeItem(ISSUED_AT_KEY)
  }

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer)

    const issuedAt = Number(localStorage.getItem(ISSUED_AT_KEY) ?? 0)
    const elapsed = Date.now() - issuedAt
    const delay = Math.max(0, TOKEN_LIFETIME_MS - REFRESH_BEFORE_MS - elapsed)

    refreshTimer = setTimeout(async () => {
      try {
        await authApi.refresh()
        recordIssuedAt()
        scheduleRefresh()
      } catch {
        // refresh 토큰도 만료됐거나 유효하지 않음
        clearTimer()
        user.value = null
        clearIssuedAt()
        const { default: router } = await import('@/router')
        router.push('/login')
      }
    }, delay)
  }

  function clearTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  // ── store 액션 ────────────────────────────────────
  function clear() {
    user.value = null
    clearTimer()
    clearIssuedAt()
  }

  async function fetchMe() {
    try {
      user.value = await authApi.me()
      // 발급 시점 기록이 없으면 현재를 기준으로 설정 (새로고침 직후 등)
      if (!localStorage.getItem(ISSUED_AT_KEY)) {
        recordIssuedAt()
      }
      scheduleRefresh()
    } catch {
      user.value = null
      clearTimer()
      clearIssuedAt()
    } finally {
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    await authApi.login({ email, password })
    user.value = await authApi.me()
    recordIssuedAt()
    scheduleRefresh()
  }

  async function logout() {
    clearTimer()
    clearIssuedAt()
    try {
      await authApi.logout()
    } finally {
      user.value = null
    }
  }

  async function updateNickName(nickName: string) {
    await authApi.updateNickName({ nickName })
  }

  async function withdraw(password: string) {
    await authApi.withdraw({ password })
  }

  return { user, initialized, isLoggedIn, isSeller, isAdmin, fetchMe, login, logout, updateNickName, withdraw, clear }
})
