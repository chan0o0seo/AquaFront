import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  error => {
    const url: string = error.config?.url ?? ''
    const status: number = error.response?.status

    // 아래 엔드포인트는 401/403이 와도 리다이렉트하지 않고 컴포넌트에서 처리
    // 아래 엔드포인트는 401/403 리다이렉트를 호출부에서 직접 처리
    const isAuthCheck = url.includes('/members/me') || url.includes('/members/withdraw') || url.includes('/auth/refresh')

    if (!isAuthCheck && (status === 401 || status === 403)) {
      useAuthStore().clear()
      router.push('/login')
    } else if (status === 500) {
      router.push('/error')
    }
    return Promise.reject(error)
  }
)
