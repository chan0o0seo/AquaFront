import { api } from '@/lib/axios'
import { unwrap } from './types'

export type SettlementStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface SettlementResponse {
  id: number
  sellerId: string
  orderId: number
  amount: number
  commissionAmount: number
  netAmount: number
  status: SettlementStatus
  settledAt: string | null
  createdAt: string
}

export interface MonthlySettlementReport {
  year: number
  month: number
  totalAmount: number
  totalCommission: number
  totalNetAmount: number
  settlementCount: number
  settlements: SettlementResponse[]
}

export interface SettlementAccountResponse {
  id: number
  bankName: string
  accountNumber: string
  accountHolder: string
  createdAt: string
  updatedAt: string
}

export interface SettlementAccountRequest {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export const settlementApi = {
  // ── 정산 ────────────────────────────────────────
  // GET /api/seller/settlements
  getSettlements: () =>
    api.get<{ success: boolean; data: SettlementResponse[]; message: string }>(
      '/seller/settlements'
    ).then(unwrap),

  // GET /api/seller/settlements/{settlementId}
  getSettlementDetail: (settlementId: number) =>
    api.get<{ success: boolean; data: SettlementResponse; message: string }>(
      `/seller/settlements/${settlementId}`
    ).then(unwrap),

  // GET /api/seller/settlements/{settlementId}/pdf — Blob 반환
  downloadPdf: (settlementId: number) =>
    api.get(`/seller/settlements/${settlementId}/pdf`, { responseType: 'blob' }),

  // GET /api/seller/settlements/report/monthly?year=&month=
  getMonthlyReport: (year: number, month: number) =>
    api.get<{ success: boolean; data: MonthlySettlementReport; message: string }>(
      '/seller/settlements/report/monthly',
      { params: { year, month } }
    ).then(unwrap),

  // ── 정산 계좌 ────────────────────────────────────
  // GET /api/seller/settlement-account
  getAccount: () =>
    api.get<{ success: boolean; data: SettlementAccountResponse; message: string }>(
      '/seller/settlement-account'
    ).then(unwrap),

  // POST /api/seller/settlement-account
  createAccount: (body: SettlementAccountRequest) =>
    api.post<{ success: boolean; data: SettlementAccountResponse; message: string }>(
      '/seller/settlement-account', body
    ).then(unwrap),

  // PUT /api/seller/settlement-account
  updateAccount: (body: SettlementAccountRequest) =>
    api.put<{ success: boolean; data: SettlementAccountResponse; message: string }>(
      '/seller/settlement-account', body
    ).then(unwrap),

  // ── 관리자: 정산 일괄 처리 ──────────────────────
  // POST /api/admin/settlements/batch
  batchProcess: () =>
    api.post('/admin/settlements/batch'),
}
