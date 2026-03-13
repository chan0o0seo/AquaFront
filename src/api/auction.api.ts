import { api } from '@/lib/axios'
import { unwrap } from './types'

export type AuctionStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'

export interface AuctionResponse {
  id: number
  productName: string
  productDescription: string | null
  imageUrls: string[]
  species: string | null
  sellerNickName: string
  startPrice: number
  currentPrice: number
  buyNowPrice: number | null
  currentWinnerNickName: string | null
  startAt: string
  endAt: string
  status: AuctionStatus
  createdAt: string
  bidCount: number
}

export interface BidResponse {
  id: number
  auctionId: number
  bidderNickName: string
  amount: number
  bidAt: string
}

export interface MyBidResponse {
  auctionId: number
  productName: string
  imageUrls: string[]
  sellerNickName: string
  status: AuctionStatus
  endAt: string
  startPrice: number
  currentPrice: number
  myHighestBid: number
  winning: boolean
}

export const auctionApi = {
  getActive: () =>
    api.get<{ success: boolean; data: AuctionResponse[] }>('/auctions/active').then(unwrap),

  getScheduled: () =>
    api.get<{ success: boolean; data: AuctionResponse[] }>('/auctions/scheduled').then(unwrap),

  getDetail: (auctionId: number) =>
    api.get<{ success: boolean; data: AuctionResponse }>(`/auctions/${auctionId}`).then(unwrap),

  getBids: (auctionId: number) =>
    api.get<{ success: boolean; data: BidResponse[] }>(`/auctions/${auctionId}/bids`).then(unwrap),

  placeBid: (auctionId: number, body: { amount: number }) =>
    api.post<{ success: boolean; data: BidResponse }>(`/auctions/${auctionId}/bids`, body).then(unwrap),

  buyNow: (auctionId: number) =>
    api.post<{ success: boolean; data: AuctionResponse }>(`/auctions/${auctionId}/buy-now`).then(unwrap),

  getMyBids: () =>
    api.get<{ success: boolean; data: MyBidResponse[] }>('/auctions/me/bids').then(unwrap),

  getSellerAuctions: () =>
    api.get<{ success: boolean; data: AuctionResponse[] }>('/auctions/seller/me').then(unwrap),

  createAuction: (formData: FormData) =>
    api.post<{ success: boolean; data: AuctionResponse }>('/auctions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap),
}
