import { api } from '@/lib/axios'
import { unwrap, type PageResponse } from './types'

export type AuctionStatus = 'LIVE' | 'UPCOMING' | 'ENDED'

export interface AuctionSummary {
  id: number
  name: string
  sellerId: number
  sellerNickName: string
  currentBid: number
  startBid: number
  bidCount: number
  endsAt: string          // ISO 문자열 — 프론트에서 카운트다운 계산
  status: AuctionStatus
  thumbnailUrl: string | null
  category: string
  tags: string[]
}

export interface AuctionDetail extends AuctionSummary {
  description: string | null
  imageUrls: string[]
  minimumBidUnit: number  // 최소 입찰 단위 (예: 1000)
  myBid: number | null    // 내가 현재 입찰한 금액 (미입찰 시 null)
  bids: BidHistory[]
}

export interface BidHistory {
  id: number
  bidderNickName: string  // 익명 처리 (예: '홍**')
  amount: number
  createdAt: string
  isMine: boolean
}

export interface PlaceBidRequest {
  amount: number
}

export interface AuctionSearchParams {
  status?: AuctionStatus
  category?: string
  keyword?: string
  page?: number
  size?: number
}

export const auctionApi = {
  // GET /api/auctions?status=LIVE&category=어류&page=0
  getList: (params?: AuctionSearchParams) =>
    api.get<{ success: boolean; data: PageResponse<AuctionSummary>; message: string }>(
      '/auctions/active',
      { params }
    ).then(unwrap),

  // GET /api/auctions/:auctionId
  getDetail: (auctionId: number) =>
    api.get<{ success: boolean; data: AuctionDetail; message: string }>(`/auctions/${auctionId}`)
      .then(unwrap),

  // POST /api/auctions/:auctionId/bids
  placeBid: (auctionId: number, body: PlaceBidRequest) =>
    api.post<{ success: boolean; data: BidHistory; message: string }>(
      `/auctions/${auctionId}/bids`,
      body
    ).then(unwrap),

  // GET /api/members/me/auctions?page= — 내가 입찰한 경매 목록
  getMyBids: (page = 0) =>
    api.get<{ success: boolean; data: PageResponse<AuctionSummary>; message: string }>(
      '/members/me/auctions',
      { params: { page } }
    ).then(unwrap),
}
