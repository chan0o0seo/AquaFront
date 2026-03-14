import { api } from '@/lib/axios'
import { unwrap } from './types'

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CONFIRMED' | 'CANCELLED'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   '결제 대기',
  PAID:      '결제완료',
  SHIPPING:  '배송중',
  DELIVERED: '배송완료',
  CONFIRMED: '구매확정',
  CANCELLED: '취소됨',
}

export interface OrderItemResponse {
  orderItemId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderResponse {
  orderId: number
  status: OrderStatus
  items: OrderItemResponse[]
  buyerNickName: string
  recipientName: string
  phoneNumber: string
  zipCode: string
  address: string
  detailAddress: string | null
  totalAmount: number
  shippingFee: number
  courier: string | null
  trackingNumber: string | null
  createdAt: string
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[]
  recipientName: string
  phoneNumber: string
  zipCode: string
  address: string
  detailAddress?: string
}

export const orderApi = {
  // POST /api/orders
  createOrder: (body: CreateOrderRequest) =>
    api.post<{ success: boolean; data: OrderResponse; message: string }>('/orders', body)
      .then(unwrap),

  // GET /api/orders — 내 주문 목록
  getMyOrders: () =>
    api.get<{ success: boolean; data: OrderResponse[]; message: string }>('/orders')
      .then(unwrap),

  // GET /api/orders/:orderId — 주문 상세
  getOrderDetail: (orderId: number) =>
    api.get<{ success: boolean; data: OrderResponse; message: string }>(`/orders/${orderId}`)
      .then(unwrap),

  // POST /api/orders/:orderId/confirm — 구매 확정
  confirmOrder: (orderId: number) =>
    api.post(`/orders/${orderId}/confirm`),

  // DELETE /api/orders/:orderId — 주문 취소
  cancelOrder: (orderId: number) =>
    api.delete(`/orders/${orderId}`),
}
