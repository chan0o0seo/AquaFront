import { api } from '@/lib/axios'
import { unwrap } from './types'

export interface ProfileUpdateRequest {
  name: string
  nickName: string
  phoneNumber: string
  profileImageUrl?: string
  marketingAgreed: boolean
}

export interface ChangePasswordRequest {
  verificationCode: string
  newPassword: string
}

export interface DeliveryAddressRequest {
  recipientName: string
  phoneNumber: string
  zipCode: string
  address: string
  detailAddress?: string
}

export interface DeliveryAddressResponse {
  id: number
  recipientName: string
  phoneNumber: string
  zipCode: string
  address: string
  detailAddress?: string
  isDefault: boolean
  createdAt: string
}

export const memberApi = {
  // PATCH /api/members/me — 프로필 수정 (name, nickName, phoneNumber, profileImageUrl, marketingAgreed)
  updateProfile: (body: ProfileUpdateRequest) =>
    api.patch('/members/me', body),

  // POST /api/members/me/password/verify-email — 비밀번호 변경용 인증 코드 발송
  sendPasswordVerifyEmail: () =>
    api.post('/members/me/password/verify-email'),

  // PATCH /api/members/me/password — 비밀번호 변경 (이메일 코드 방식)
  changePassword: (body: ChangePasswordRequest) =>
    api.patch('/members/me/password', body),

  // PATCH /api/members/me/password/direct — 비밀번호 변경 (현재 비밀번호 방식)
  changePasswordDirect: (currentPassword: string, newPassword: string) =>
    api.patch('/members/me/password/direct', { currentPassword, newPassword }),

  // ── 배송지 ────────────────────────────────────────
  // GET /api/members/me/addresses
  getAddresses: () =>
    api.get<{ success: boolean; data: DeliveryAddressResponse[]; message: string }>(
      '/members/me/addresses'
    ).then(unwrap),

  // POST /api/members/me/addresses
  addAddress: (body: DeliveryAddressRequest) =>
    api.post<{ success: boolean; data: DeliveryAddressResponse; message: string }>(
      '/members/me/addresses', body
    ).then(unwrap),

  // PATCH /api/members/me/addresses/:id
  updateAddress: (id: number, body: DeliveryAddressRequest) =>
    api.patch<{ success: boolean; data: DeliveryAddressResponse; message: string }>(
      `/members/me/addresses/${id}`, body
    ).then(unwrap),

  // DELETE /api/members/me/addresses/:id
  deleteAddress: (id: number) =>
    api.delete(`/members/me/addresses/${id}`),

  // PATCH /api/members/me/addresses/:id/default
  setDefaultAddress: (id: number) =>
    api.patch<{ success: boolean; data: DeliveryAddressResponse; message: string }>(
      `/members/me/addresses/${id}/default`
    ).then(unwrap),
}
