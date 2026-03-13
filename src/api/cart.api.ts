import { api } from '@/lib/axios'
import type { ApiResponse } from './types'

export interface CartItemResponse {
  productId: number
  name: string
  price: number
  shippingFee: number
  stock: number
  status: 'ACTIVE' | 'SOLD_OUT'
  productType: string
  thumbnailUrl: string | null
  sellerNickName: string
  quantity: number
  lowStockWarning: boolean
}

function unwrap<T>(res: { data: ApiResponse<T> }) {
  return res.data.data as T
}

export const cartApi = {
  getCart: () =>
    api.get<ApiResponse<CartItemResponse[]>>('/cart').then(unwrap),

  addItem: (productId: number, quantity: number) =>
    api.post<ApiResponse<CartItemResponse>>('/cart/items', { productId, quantity }).then(unwrap),

  updateItem: (productId: number, quantity: number) =>
    api.patch<ApiResponse<CartItemResponse>>(`/cart/items/${productId}`, { quantity }).then(unwrap),

  removeItem: (productId: number) =>
    api.delete(`/cart/items/${productId}`),

  clearCart: () =>
    api.delete('/cart'),
}
