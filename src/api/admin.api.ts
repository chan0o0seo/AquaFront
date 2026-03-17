import { api } from '@/lib/axios'
import { unwrap } from './types'

// ── 공통 ─────────────────────────────────────────────────────────────────────

export interface AdminPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ── 회원 ─────────────────────────────────────────────────────────────────────

export type MemberRole = 'BUYER' | 'SELLER' | 'BREEDER' | 'ADMIN'

export interface AdminMemberResponse {
  id: string
  email: string
  name: string
  nickName: string
  phoneNumber: string
  profileImageUrl?: string
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
  role: MemberRole
  createdAt: string
  updatedAt: string
}

/** @deprecated use AdminPage<AdminMemberResponse> */
export type AdminMemberPage = AdminPage<AdminMemberResponse>

// ── 상품 ─────────────────────────────────────────────────────────────────────

export type AdminProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'DELETED'

export interface AdminProductResponse {
  id: number
  name: string
  price: number
  stock: number
  status: AdminProductStatus
  productType: string
  sellerNickName: string
  sellerId: string
  thumbnailUrl: string | null
  createdAt: string
}

// ── 경매 ─────────────────────────────────────────────────────────────────────

export type AdminAuctionStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'

export interface AdminAuctionResponse {
  id: number
  productName: string
  imageUrls: string[]
  sellerNickName: string
  sellerId: string
  startPrice: number
  currentPrice: number
  buyNowPrice: number | null
  startAt: string
  endAt: string
  status: AdminAuctionStatus
  bidCount: number
  createdAt: string
}

// ── 커뮤니티 ─────────────────────────────────────────────────────────────────

export interface AdminPostResponse {
  id: number
  categoryName: string
  title: string
  authorNickName: string
  viewCount: number
  likeCount: number
  commentCount: number
  deleted: boolean
  createdAt: string
}

// ── API ───────────────────────────────────────────────────────────────────────

export const adminApi = {
  // ── 회원 ──────────────────────────────────────────
  getMembers: (params: { keyword?: string; role?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminMemberResponse>; message: string }>(
      '/admin/members',
      { params: { page: params.page ?? 0, size: params.size ?? 15, keyword: params.keyword || undefined, role: params.role || undefined } }
    ).then(unwrap),

  getMember: (id: string) =>
    api.get<{ success: boolean; data: AdminMemberResponse; message: string }>(
      `/admin/members/${id}`
    ).then(unwrap),

  deleteMember: (id: string) =>
    api.delete(`/admin/members/${id}`),

  updateRole: (id: string, role: MemberRole) =>
    api.patch<{ success: boolean; data: AdminMemberResponse; message: string }>(
      `/admin/members/${id}/role`, { role }
    ).then(unwrap),

  // ── 상품 ──────────────────────────────────────────
  getProducts: (params: { keyword?: string; status?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminProductResponse>; message: string }>(
      '/admin/products',
      { params: { page: params.page ?? 0, size: params.size ?? 15, keyword: params.keyword || undefined, status: params.status || undefined } }
    ).then(unwrap),

  getProduct: (id: number) =>
    api.get<{ success: boolean; data: AdminProductResponse; message: string }>(
      `/admin/products/${id}`
    ).then(unwrap),

  updateProductStatus: (id: number, status: AdminProductStatus) =>
    api.patch<{ success: boolean; data: AdminProductResponse; message: string }>(
      `/admin/products/${id}/status`, { status }
    ).then(unwrap),

  deleteProduct: (id: number) =>
    api.delete(`/admin/products/${id}`),

  // ── 경매 ──────────────────────────────────────────
  getAuctions: (params: { status?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminAuctionResponse>; message: string }>(
      '/admin/auctions',
      { params: { page: params.page ?? 0, size: params.size ?? 15, status: params.status || undefined } }
    ).then(unwrap),

  getAuction: (id: number) =>
    api.get<{ success: boolean; data: AdminAuctionResponse; message: string }>(
      `/admin/auctions/${id}`
    ).then(unwrap),

  cancelAuction: (id: number) =>
    api.patch<{ success: boolean; data: AdminAuctionResponse; message: string }>(
      `/admin/auctions/${id}/cancel`
    ).then(unwrap),

  // ── 커뮤니티 ────────────────────────────────────────
  getPosts: (params: { keyword?: string; includeDeleted?: boolean; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminPostResponse>; message: string }>(
      '/admin/community/posts',
      { params: { page: params.page ?? 0, size: params.size ?? 15, keyword: params.keyword || undefined, includeDeleted: params.includeDeleted ?? false } }
    ).then(unwrap),

  deletePost: (id: number) =>
    api.delete(`/admin/community/posts/${id}`),

  deleteComment: (id: number) =>
    api.delete(`/admin/community/comments/${id}`),

  // ── 푸시 알림 ────────────────────────────────────────
  sendTestPush: (body: { targetEmail: string; title: string; body: string; imageUrl?: string }) =>
    api.post('/admin/notifications/push/test', body),

  sendMarketingPush: (body: { title: string; body: string; imageUrl?: string }) =>
    api.post('/admin/notifications/push/marketing', body),
}
