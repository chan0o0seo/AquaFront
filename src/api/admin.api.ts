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

export type MemberRole = 'BUYER' | 'SELLER' | 'ADMIN'

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
  topFixed: boolean
  createdAt: string
}

// ── 고객센터 문의 ─────────────────────────────────────────────────────────────

type InquiryCategory = 'ORDER_PAYMENT' | 'AUCTION' | 'PRODUCT' | 'SELLER' | 'ACCOUNT' | 'OTHER'
type InquiryStatus = 'PENDING' | 'ANSWERED'

export interface AdminInquiryResponse {
  id: number
  category: InquiryCategory
  title: string
  content: string
  email: string
  status: InquiryStatus
  adminReply: string | null
  repliedAt: string | null
  createdAt: string
}

// ── 대시보드 ──────────────────────────────────────────────────────────────────

export interface DashboardPopularProduct {
  productId: number
  name: string
  soldCount: number
}

export interface DashboardPopularCategory {
  categoryName: string
  soldCount: number
}

export interface AdminDashboardResponse {
  todayRevenue: number
  thisMonthRevenue: number
  todayOrderCount: number
  thisMonthOrderCount: number
  thisMonthCancelCount: number
  cancelRate: number
  thisMonthRefundCount: number
  refundRate: number
  todayNewMembers: number
  thisMonthNewMembers: number
  activeAuctions: number
  scheduledAuctions: number
  popularProducts: DashboardPopularProduct[]
  popularCategories: DashboardPopularCategory[]
}

// ── 어드민 주문 ────────────────────────────────────────────────────────────────

export type AdminOrderStatus = 'PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CONFIRMED' | 'CANCELLED'

export interface AdminOrderItemResponse {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export interface AdminOrderResponse {
  orderId: number
  status: AdminOrderStatus
  buyerNickName: string
  buyerEmail: string
  items: AdminOrderItemResponse[]
  recipientName: string
  phoneNumber: string
  address: string
  detailAddress: string
  totalAmount: number
  shippingFee: number
  courier: string | null
  trackingNumber: string | null
  createdAt: string
}

// ── 어드민 결제 ────────────────────────────────────────────────────────────────

export type AdminPaymentStatus = 'PAID' | 'CANCELLED'

export interface AdminPaymentResponse {
  id: number
  orderId: number
  buyerNickName: string
  buyerEmail: string
  paymentId: string
  amount: number
  status: AdminPaymentStatus
  payMethod: string
  pgProvider: string
  createdAt: string
}

// ── 신고 ──────────────────────────────────────────────────────────────────────

export type ReportTargetType = 'MEMBER' | 'PRODUCT' | 'POST' | 'COMMENT'
export type AdminReportStatus = 'PENDING' | 'PROCESSED' | 'DISMISSED'

export interface AdminReportResponse {
  id: number
  reporterNickName: string
  reporterEmail: string
  targetType: ReportTargetType
  targetId: number
  reason: string
  status: AdminReportStatus
  processorNickName: string | null
  processNote: string | null
  createdAt: string
}

// ── 통계 ──────────────────────────────────────────────────────────────────────

export interface AdminSellerStatsResponse {
  sellerId: string
  sellerNickName: string
  sellerEmail: string
  totalSalesAmount: number
  totalCommission: number
  totalNetAmount: number
  settlementCount: number
}

export interface AdminProductStatsResponse {
  productId: number
  productName: string
  sellerNickName: string
  soldCount: number
  totalRevenue: number
}

// ── 감사 로그 ─────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'MEMBER_WARN' | 'MEMBER_SUSPEND' | 'MEMBER_UNSUSPEND'
  | 'MEMBER_ROLE_CHANGE' | 'MEMBER_DELETE'
  | 'POLICY_CREATE' | 'POLICY_UPDATE' | 'POLICY_DELETE'
  | 'SETTLEMENT_COMPLETE' | 'SETTLEMENT_FAIL'
  | 'ORDER_STATUS_CHANGE' | 'ORDER_CANCEL'
  | 'REPORT_PROCESS'

export type AuditTargetType = 'MEMBER' | 'COMMISSION_POLICY' | 'SETTLEMENT' | 'ORDER' | 'REPORT'

export interface AuditLogResponse {
  id: number
  actorEmail: string
  action: AuditAction
  targetType: AuditTargetType
  targetId: string | null
  detail: string | null
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
  getPosts: (params: { keyword?: string; includeDeleted?: boolean; categoryType?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminPostResponse>; message: string }>(
      '/admin/community/posts',
      { params: { page: params.page ?? 0, size: params.size ?? 15, keyword: params.keyword || undefined, includeDeleted: params.includeDeleted ?? false, categoryType: params.categoryType || undefined } }
    ).then(unwrap),

  toggleTopFix: (id: number) =>
    api.patch<{ success: boolean; data: AdminPostResponse; message: string }>(
      `/admin/community/posts/${id}/top-fix`
    ).then(unwrap),

  deletePost: (id: number) =>
    api.delete(`/admin/community/posts/${id}`),

  deleteComment: (id: number) =>
    api.delete(`/admin/community/comments/${id}`),

  // ── 고객센터 문의 ────────────────────────────────────────
  getInquiries: (params: { keyword?: string; category?: string; status?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminInquiryResponse>; message: string }>(
      '/admin/inquiries',
      { params: { page: params.page ?? 0, size: params.size ?? 20, keyword: params.keyword || undefined, category: params.category || undefined, status: params.status || undefined } }
    ).then(unwrap),

  replyInquiry: (id: number, replyContent: string) =>
    api.patch<{ success: boolean; data: AdminInquiryResponse; message: string }>(
      `/admin/inquiries/${id}/reply`, { replyContent }
    ).then(unwrap),

  // ── 푸시 알림 ────────────────────────────────────────
  sendTestPush: (body: { targetEmail: string; title: string; body: string; imageUrl?: string }) =>
    api.post('/admin/notifications/push/test', body),

  sendMarketingPush: (body: { title: string; body: string; imageUrl?: string }) =>
    api.post('/admin/notifications/push/marketing', body),

  // ── 대시보드 ────────────────────────────────────────
  getDashboard: () =>
    api.get<{ success: boolean; data: AdminDashboardResponse; message: string }>(
      '/admin/dashboard'
    ).then(unwrap),

  // ── 어드민 주문 ────────────────────────────────────────
  getAdminOrders: (params: { status?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminOrderResponse>; message: string }>(
      '/admin/orders',
      { params: { page: params.page ?? 0, size: params.size ?? 20, status: params.status || undefined } }
    ).then(unwrap),

  getAdminOrder: (orderId: number) =>
    api.get<{ success: boolean; data: AdminOrderResponse; message: string }>(
      `/admin/orders/${orderId}`
    ).then(unwrap),

  updateAdminOrderStatus: (orderId: number, status: AdminOrderStatus) =>
    api.patch<{ success: boolean; data: AdminOrderResponse; message: string }>(
      `/admin/orders/${orderId}/status`, { status }
    ).then(unwrap),

  cancelAdminOrder: (orderId: number) =>
    api.delete(`/admin/orders/${orderId}`),

  // ── 어드민 결제 ────────────────────────────────────────
  getAdminPayments: (params: { status?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminPaymentResponse>; message: string }>(
      '/admin/payments',
      { params: { page: params.page ?? 0, size: params.size ?? 20, status: params.status || undefined } }
    ).then(unwrap),

  cancelAdminPayment: (id: number, reason?: string) =>
    api.post(`/admin/payments/${id}/cancel`, null, { params: { reason } }),

  // ── 신고 관리 ────────────────────────────────────────
  getReports: (params: { status?: string; targetType?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AdminReportResponse>; message: string }>(
      '/admin/reports',
      { params: { page: params.page ?? 0, size: params.size ?? 20, status: params.status || undefined, targetType: params.targetType || undefined } }
    ).then(unwrap),

  processReport: (id: number, action: string, processNote?: string) =>
    api.patch<{ success: boolean; data: AdminReportResponse; message: string }>(
      `/admin/reports/${id}/process`, { action, processNote }
    ).then(unwrap),

  // ── 회원 제재 ────────────────────────────────────────
  warnMember: (id: string) =>
    api.post<{ success: boolean; data: AdminMemberResponse; message: string }>(
      `/admin/members/${id}/warn`
    ).then(unwrap),

  suspendMember: (id: string, suspendedUntil: string) =>
    api.post<{ success: boolean; data: AdminMemberResponse; message: string }>(
      `/admin/members/${id}/suspend`, { suspendedUntil }
    ).then(unwrap),

  unsuspendMember: (id: string) =>
    api.delete<{ success: boolean; data: AdminMemberResponse; message: string }>(
      `/admin/members/${id}/suspend`
    ).then(unwrap),

  // ── 통계 ──────────────────────────────────────────
  getSellerStats: (from: string, to: string) =>
    api.get<{ success: boolean; data: AdminSellerStatsResponse[]; message: string }>(
      '/admin/statistics/sellers', { params: { from, to } }
    ).then(unwrap),

  getProductStats: (since: string, limit = 30) =>
    api.get<{ success: boolean; data: AdminProductStatsResponse[]; message: string }>(
      '/admin/statistics/products', { params: { since, limit } }
    ).then(unwrap),

  // ── 감사 로그 ──────────────────────────────────────
  getAuditLogs: (params: { action?: string; targetType?: string; from?: string; to?: string; page?: number; size?: number }) =>
    api.get<{ success: boolean; data: AdminPage<AuditLogResponse>; message: string }>(
      '/admin/audit-logs',
      { params: { page: params.page ?? 0, size: params.size ?? 30, action: params.action || undefined, targetType: params.targetType || undefined, from: params.from || undefined, to: params.to || undefined } }
    ).then(unwrap),

  cleanupAuditLogs: (before: string) =>
    api.delete<{ success: boolean; data: { deleted: number }; message: string }>(
      '/admin/audit-logs/cleanup', { params: { before } }
    ).then(unwrap),
}
