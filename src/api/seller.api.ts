import { api } from '@/lib/axios'
import { unwrap } from './types'
import type { ProductDetail } from './product.api'

export type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface SellerApplicationRequest {
  businessName: string
  businessRegistrationNumber: string
  businessAddress: string
  businessPhoneNumber: string
}

export interface SellerApplicationResponse {
  id: number
  businessName: string
  businessRegistrationNumber: string
  businessAddress: string
  businessPhoneNumber: string
  status: SellerApplicationStatus
  rejectionReason?: string
  createdAt: string
  processedAt?: string
}

export interface SellerProfileResponse {
  id: number
  memberId: string        // UUID
  nickName: string
  businessName: string
  businessRegistrationNumber: string
  businessAddress: string
  businessPhoneNumber: string
  storeDescription?: string
  logoImageUrl?: string
  bannerImageUrl?: string
  followerCount: number
  createdAt: string
  updatedAt: string
}

export interface SellerProfileUpdateRequest {
  businessName: string
  businessAddress: string
  businessPhoneNumber: string
  storeDescription?: string
  logoImageUrl?: string
  bannerImageUrl?: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  shippingFee: number
  stock: number
  productType: string
  parentCategoryName?: string  // 대분류 (없으면 루트)
  categoryName?: string        // 소분류 (없으면 대분류가 최종)
  imageUrls: string[]
  tags?: string[]
  waterType?: string
  difficulty?: string
  waterTemperatureMin?: number
  waterTemperatureMax?: number
  phMin?: number
  phMax?: number
  minimumTankSize?: number
  brand?: string
}

export interface SellerStats {
  totalProducts: number
  soldCount: number
  activeAuctions: number
  followerCount: number
  monthlyRevenue: number
}

export interface FollowedSellerResponse {
  sellerId: string        // UUID
  nickName: string
  businessName: string
  logoImageUrl?: string
  storeDescription?: string
}

export interface CommissionPolicyResponse {
  id: number
  productType: string | null    // null = 전체 적용
  rate: number                  // 수수료율 (%, 예: 5.0)
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CommissionPolicyRequest {
  productType?: string
  rate: number
  description?: string
}

export const sellerApi = {
  // ── 판매자 신청 ──────────────────────────────────
  // POST /api/seller-applications
  apply: (body: SellerApplicationRequest) =>
    api.post<{ success: boolean; data: SellerApplicationResponse; message: string }>(
      '/seller-applications', body
    ).then(unwrap),

  // GET /api/seller-applications/me
  getMyApplication: () =>
    api.get<{ success: boolean; data: SellerApplicationResponse; message: string }>(
      '/seller-applications/me'
    ).then(unwrap),

  // ── 관리자 전용 ───────────────────────────────────
  // GET /api/admin/seller-applications — PENDING 신청 목록
  getPendingApplications: () =>
    api.get<{ success: boolean; data: SellerApplicationResponse[]; message: string }>(
      '/admin/seller-applications'
    ).then(unwrap),

  // POST /api/admin/seller-applications/{id}/approve
  approveApplication: (id: number) =>
    api.post(`/admin/seller-applications/${id}/approve`),

  // POST /api/admin/seller-applications/{id}/reject
  rejectApplication: (id: number, reason: string) =>
    api.post(`/admin/seller-applications/${id}/reject`, { reason }),

  // ── 판매자 프로필 ─────────────────────────────────
  // GET /api/seller/profile — 내 프로필
  getMyProfile: () =>
    api.get<{ success: boolean; data: SellerProfileResponse; message: string }>(
      '/seller/profile'
    ).then(unwrap),

  // PATCH /api/seller/profile — 프로필 수정
  updateProfile: (body: SellerProfileUpdateRequest) =>
    api.patch<{ success: boolean; data: SellerProfileResponse; message: string }>(
      '/seller/profile', body
    ).then(unwrap),

  // GET /api/sellers — 전체 판매자 목록
  getAll: () =>
    api.get<{ success: boolean; data: SellerProfileResponse[]; message: string }>(
      '/sellers'
    ).then(unwrap),

  // GET /api/sellers/:memberId/profile — 공개 프로필
  getStore: (memberId: string) =>
    api.get<{ success: boolean; data: SellerProfileResponse; message: string }>(
      `/sellers/${memberId}/profile`
    ).then(unwrap),

  // GET /api/sellers/:memberId/products — 판매자 상품 목록
  getSellerProducts: (memberId: string) =>
    api.get<{ success: boolean; data: import('./product.api').ProductSummary[]; message: string }>(
      `/sellers/${memberId}/products`
    ).then(unwrap),

  // ── 팔로우 ────────────────────────────────────────
  // POST /api/sellers/:sellerId/follow — 팔로우/언팔로우 토글 (true=팔로우, false=언팔로우)
  toggleFollow: (sellerId: string) =>
    api.post<{ success: boolean; data: boolean; message: string }>(
      `/sellers/${sellerId}/follow`
    ).then(unwrap),

  // GET /api/sellers/:sellerId/follow/status
  isFollowing: (sellerId: string) =>
    api.get<{ success: boolean; data: boolean; message: string }>(
      `/sellers/${sellerId}/follow/status`
    ).then(unwrap),

  // GET /api/members/me/following — 내가 팔로우한 판매자 목록
  getFollowing: () =>
    api.get<{ success: boolean; data: FollowedSellerResponse[]; message: string }>(
      '/members/me/following'
    ).then(unwrap),

  // ── 판매자 상품 ───────────────────────────────────
  // GET /api/products/me
  getMyProducts: () =>
    api.get<{ success: boolean; data: ProductDetail[]; message: string }>(
      '/products/me'
    ).then(unwrap),

  // POST /api/products
  createProduct: (body: CreateProductRequest) =>
    api.post<{ success: boolean; data: ProductDetail; message: string }>(
      '/products', body
    ).then(unwrap),

  // PATCH /api/products/:id
  updateProduct: (productId: number, body: Partial<CreateProductRequest>) =>
    api.patch<{ success: boolean; data: ProductDetail; message: string }>(
      `/products/${productId}`, body
    ).then(unwrap),

  // PATCH /api/products/:id/stock
  updateStock: (productId: number, stock: number) =>
    api.patch<{ success: boolean; data: ProductDetail; message: string }>(
      `/products/${productId}/stock`, { stock }
    ).then(unwrap),

  // PATCH /api/products/:id/status — ACTIVE ↔ SOLD_OUT 토글
  toggleStatus: (productId: number) =>
    api.patch<{ success: boolean; data: ProductDetail; message: string }>(
      `/products/${productId}/status`
    ).then(unwrap),

  // DELETE /api/products/:id
  deleteProduct: (productId: number) =>
    api.delete(`/products/${productId}`),

  // ── 판매자 통계 ───────────────────────────────────
  // GET /api/seller/stats
  getStats: () =>
    api.get<{ success: boolean; data: SellerStats; message: string }>('/seller/stats')
      .then(unwrap),

  // ── 상품 이미지 (개별 관리) ────────────────────────
  uploadProductImages: (productId: number, formData: FormData) =>
    api.post<{ success: boolean; data: import('./product.api').ProductImage[]; message: string }>(
      `/products/${productId}/images`, formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(unwrap),

  reorderProductImages: (productId: number, imageIds: number[]) =>
    api.patch(`/products/${productId}/images/order`, { imageIds }),

  setRepresentativeImage: (productId: number, imageId: number) =>
    api.patch(`/products/${productId}/images/${imageId}/representative`),

  deleteProductImage: (productId: number, imageId: number) =>
    api.delete(`/products/${productId}/images/${imageId}`),

  // ── 수수료 정책 (관리자) ───────────────────────────
  getCommissionPolicies: () =>
    api.get<{ success: boolean; data: CommissionPolicyResponse[]; message: string }>(
      '/admin/commission-policies'
    ).then(unwrap),

  createCommissionPolicy: (body: CommissionPolicyRequest) =>
    api.post<{ success: boolean; data: CommissionPolicyResponse; message: string }>(
      '/admin/commission-policies', body
    ).then(unwrap),

  updateCommissionPolicy: (id: number, body: CommissionPolicyRequest) =>
    api.put<{ success: boolean; data: CommissionPolicyResponse; message: string }>(
      `/admin/commission-policies/${id}`, body
    ).then(unwrap),

  deleteCommissionPolicy: (id: number) =>
    api.delete(`/admin/commission-policies/${id}`),

  // ── 판매자 주문 관리 ──────────────────────────────
  getSellerOrders: (status?: string) =>
    api.get<{ success: boolean; data: import('./order.api').OrderResponse[]; message: string }>(
      '/seller/orders', { params: status ? { status } : {} }
    ).then(unwrap),

  shipOrder: (orderId: number, body: { courier: string; trackingNumber: string }) =>
    api.patch<{ success: boolean; data: import('./order.api').OrderResponse; message: string }>(
      `/seller/orders/${orderId}/ship`, body
    ).then(unwrap),

  deliverOrder: (orderId: number) =>
    api.patch<{ success: boolean; data: import('./order.api').OrderResponse; message: string }>(
      `/seller/orders/${orderId}/deliver`
    ).then(unwrap),

  cancelSellerOrder: (orderId: number) =>
    api.patch(`/seller/orders/${orderId}/cancel`),
}
