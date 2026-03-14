import { api } from '@/lib/axios'
import { unwrap } from './types'

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED'
export type PaymentMethod = 'KAKAO' | 'NAVER' | 'CARD'

export interface PaymentResponse {
  id: number
  orderId: number
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt: string | null
  cancelledAt: string | null
  createdAt: string
}

export interface PaymentVerifyRequest {
  paymentId: string
  orderId: number
}

export const paymentApi = {
  // POST /api/payments/verify — PG 결제 검증 (결제 완료 후 호출)
  verify: (body: PaymentVerifyRequest) =>
    api.post<{ success: boolean; data: PaymentResponse; message: string }>(
      '/payments/verify', body
    ).then(unwrap),

  // GET /api/payments/orders/{orderId} — 주문별 결제 정보 조회
  getByOrder: (orderId: number) =>
    api.get<{ success: boolean; data: PaymentResponse; message: string }>(
      `/payments/orders/${orderId}`
    ).then(unwrap),

  // POST /api/payments/orders/{orderId}/cancel — 결제 취소
  cancel: (orderId: number) =>
    api.post<{ success: boolean; data: PaymentResponse; message: string }>(
      `/payments/orders/${orderId}/cancel`
    ).then(unwrap),
}
