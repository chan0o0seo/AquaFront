import { api } from '@/lib/axios'
import { unwrap } from './types'

export type InquiryCategory = 'ORDER_PAYMENT' | 'AUCTION' | 'PRODUCT' | 'SELLER' | 'ACCOUNT' | 'OTHER'
export type InquiryStatus = 'PENDING' | 'ANSWERED'

export interface InquiryResponse {
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

export interface CreateInquiryRequest {
  category: InquiryCategory
  title: string
  content: string
  email: string
}

export const inquiryApi = {
  create: (body: CreateInquiryRequest) =>
    api.post<{ success: boolean; data: InquiryResponse }>('/inquiries', body).then(unwrap),

  getMyInquiries: () =>
    api.get<{ success: boolean; data: InquiryResponse[] }>('/inquiries/me').then(unwrap),
}
