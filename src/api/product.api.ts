import { api } from '@/lib/axios'
import { unwrap, type PageResponse } from './types'

export type ProductType = 'FISH' | 'INVERTEBRATE' | 'PLANT' | 'EQUIPMENT' | 'FOOD' | 'ACCESSORY'
export type WaterType = 'FRESHWATER' | 'SALTWATER' | 'BRACKISH'
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface ProductImage {
  id: number
  imageUrl: string
  sortOrder: number
  representative: boolean
}

export interface ProductSummary {
  id: number
  name: string
  price: number
  shippingFee: number
  images: ProductImage[]
  productType: ProductType
  sellerNickName: string
  sellerId: string
  averageRating: number
  reviewCount: number
  stock: number
  status: 'ACTIVE' | 'SOLD_OUT'
  lowStockWarning: boolean
  tags: string[]
}

export interface ProductDetail extends ProductSummary {
  description: string | null
  categoryName: string | null
  waterType: WaterType | null
  difficulty: Difficulty | null
  waterTemperatureMin: number | null
  waterTemperatureMax: number | null
  phMin: number | null
  phMax: number | null
  isCompatible: boolean | null
  minimumTankSize: number | null
  brand: string | null
}

/** images 배열에서 대표 이미지 URL을 추출 */
export function getThumbnailUrl(product: Pick<ProductSummary, 'images'>): string | null {
  return product.images.find(i => i.representative)?.imageUrl ?? product.images[0]?.imageUrl ?? null
}

export interface ProductSearchParams {
  keyword?: string
  productType?: ProductType
  waterType?: WaterType
  difficulty?: Difficulty
  minPrice?: number
  maxPrice?: number
  sellerId?: number
  page?: number
  size?: number
  sort?: string
}

export interface Review {
  id: number
  reviewerId: string | null
  reviewerNickName: string
  rating: number
  content: string | null
  imageUrls: string[]
  createdAt: string
  secret: boolean
  /** true면 현재 뷰어에게 내용이 가려진 상태 */
  masked: boolean
}

export interface ReviewRequest {
  rating: number
  content: string
  imageUrls?: string[]
  secret?: boolean
}

export const productApi = {
  // GET /api/products?keyword=&productType=&...
  search: (params: ProductSearchParams) =>
    api.get<{ success: boolean; data: ProductSummary[]; message: string }>('/products', { params })
      .then(unwrap),

  // GET /api/products/:id
  getDetail: (productId: number) =>
    api.get<{ success: boolean; data: ProductDetail; message: string }>(`/products/${productId}`)
      .then(unwrap),

  // GET /api/products/:id/reviews?page=
  getReviews: (productId: number, page = 0, size = 10) =>
    api.get<{ success: boolean; data: PageResponse<Review>; message: string }>(
      `/products/${productId}/reviews`,
      { params: { page, size } }
    ).then(unwrap),

  // POST /api/products/:id/reviews
  createReview: (productId: number, body: ReviewRequest) =>
    api.post<{ success: boolean; data: Review; message: string }>(`/products/${productId}/reviews`, body)
      .then(unwrap),

  // PATCH /api/products/:id/reviews/:reviewId
  updateReview: (productId: number, reviewId: number, body: ReviewRequest) =>
    api.patch<{ success: boolean; data: Review; message: string }>(`/products/${productId}/reviews/${reviewId}`, body)
      .then(unwrap),

  // DELETE /api/products/:id/reviews/:reviewId
  deleteReview: (productId: number, reviewId: number) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),

  // POST /api/products/:id/wishlist (토글: true=추가됨, false=제거됨)
  toggleWishlist: (productId: number) =>
    api.post<{ success: boolean; data: boolean; message: string }>(`/products/${productId}/wishlist`)
      .then(unwrap),

  // GET /api/products/:id/wishlist/status (현재 찜 여부)
  getWishlistStatus: (productId: number) =>
    api.get<{ success: boolean; data: boolean; message: string }>(`/products/${productId}/wishlist/status`)
      .then(unwrap),

  // GET /api/products/:id/reviews/eligible (리뷰 작성 가능 여부 - 로그인 필요)
  getReviewEligibility: (productId: number) =>
    api.get<{ success: boolean; data: boolean; message: string }>(`/products/${productId}/reviews/eligible`)
      .then(unwrap),

  // GET /api/members/me/wishlist
  getMyWishlist: () =>
    api.get<{ success: boolean; data: ProductSummary[]; message: string }>(
      '/members/me/wishlist'
    ).then(unwrap),
}
