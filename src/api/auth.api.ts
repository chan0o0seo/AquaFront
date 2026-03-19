import { api } from '@/lib/axios'
import { unwrap } from './types'

export interface LoginRequest {
  email: string
  password: string
}

export interface EmailSendRequest {
  email: string
}

export interface SignUpRequest {
  email: string
  password: string
  name: string
  nickName: string
  phoneNumber: string
  profileImageUrl?: string
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
  role: 'BUYER' | 'SELLER'
}

export interface EmailVerifyRequest {
  email: string
  code: string
}

export interface NicknameUpdateRequest {
  nickName: string
}

export interface WithdrawRequest {
  password: string
}

export interface AuthMember {
  id: string
  email: string
  name: string
  nickName: string
  phoneNumber: string
  profileImageUrl?: string
  marketingAgreed: boolean
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  oauthProvider?: 'KAKAO' | 'NAVER' | null
}

export const authApi = {
  // POST /api/auth/login — 쿠키만 세팅, data는 Void
  login: async (body: LoginRequest) => {
    await api.post('/auth/login', body)
  },

  // POST /api/auth/email/send — 인증 코드 발송
  sendVerificationEmail: async (body: EmailSendRequest) => {
    await api.post('/auth/email/send', body)
  },

  // POST /api/auth/email/verify — 인증 코드 검증
  verifyEmail: async (body: EmailVerifyRequest) => {
    await api.post('/auth/email/verify', body)
  },

  // GET /api/auth/nickname/check?nickName=... → true: 중복, false: 사용가능
  checkNickname: (nickName: string, signal?: AbortSignal) =>
    api.get<{ success: boolean; data: boolean; message: string }>('/auth/nickname/check', {
      params: { nickName },
      signal,
    }).then(unwrap),

  // POST /api/auth/signup
  signup: (body: SignUpRequest) =>
    api.post('/auth/signup', body),

  // POST /api/auth/refresh — refresh 토큰 쿠키로 access token 재발급
  refresh: () =>
    api.post('/auth/refresh'),

  // POST /api/auth/logout
  logout: () =>
    api.post('/auth/logout'),

  // GET /api/auth/me — 현재 로그인 사용자 정보
  me: () =>
    api.get<{ success: boolean; data: AuthMember; message: string }>('/members/me')
      .then(unwrap),

  // GET /api/auth/email/check?email=... → true: 중복, false: 사용가능
  checkEmail: (email: string, signal?: AbortSignal) =>
    api.get<{ success: boolean; data: boolean; message: string }>('/auth/email/check', {
      params: { email },
      signal,
    }).then(unwrap),

  updateNickName: async (body: NicknameUpdateRequest) => {
    await api.patch('/members/me/nick', body)
  },

  withdraw: async (body: WithdrawRequest) => {
    await api.delete('/members/me', { data: body })
  },

  // POST /api/auth/find-email — 이름+전화번호로 이메일 찾기 (마스킹)
  findEmail: (name: string, phoneNumber: string): Promise<string> =>
    api.post<{ success: boolean; data: string; message: string }>(
      '/auth/find-email', { name, phoneNumber }
    ).then(unwrap),

  // POST /api/auth/password/send-code — 비밀번호 재설정 코드 발송
  sendPasswordResetCode: async (email: string) => {
    await api.post('/auth/password/send-code', { email })
  },

  // POST /api/auth/password/reset — 코드 검증 + 새 비밀번호 설정
  resetPassword: async (email: string, verificationCode: string, newPassword: string) => {
    await api.post('/auth/password/reset', { email, verificationCode, newPassword })
  },
}
