import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  error => {
    const url: string = error.config?.url ?? ''
    const status: number = error.response?.status

    const isAuthCheck = url.includes('/members/me') || url.includes('/members/withdraw') || url.includes('/auth/refresh')

    if (!isAuthCheck && status === 401) {
      // 미인증 (토큰 없음/만료) → 로그아웃 후 로그인으로
      useAuthStore().clear()
      router.push('/login')
    } else if (status === 500) {
      router.push('/error')
    }
    return Promise.reject(error)
  }
)
