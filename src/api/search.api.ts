import { api } from '@/lib/axios'
import { unwrap } from './types'
import type { ProductType, WaterType, Difficulty } from './product.api'

export interface SearchResult {
  id: string
  name: string
  price: number
  shippingFee: number
  stock: number
  lowStockWarning: boolean
  sellerNickName: string
  sellerId: string | null
  tags: string[]
  status: 'ACTIVE' | 'SOLD_OUT'
  productType: ProductType
  thumbnailUrl: string | null
  waterType: WaterType | null
  difficulty: Difficulty | null
  averageRating: number
  reviewCount: number
}

export type SearchSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'review_desc'

export interface SearchParams {
  keyword?: string
  page?: number
  size?: number
  sort?: SearchSortOption
  productType?: ProductType | ''
  waterType?: WaterType | ''
  difficulty?: Difficulty | ''
  isCompatible?: boolean
  minPrice?: number
  maxPrice?: number
  freeShipping?: boolean
  minRating?: number
  brand?: string
}

export const searchApi = {
  search: (params: SearchParams) =>
    api.get<{ success: boolean; data: SearchResult[]; message: string }>('/search', {
      params: {
        keyword:     params.keyword     ?? '',
        page:        params.page        ?? 0,
        size:        params.size        ?? 20,
        sort:        params.sort        ?? 'relevance',
        productType: params.productType || undefined,
        waterType:   params.waterType   || undefined,
        difficulty:  params.difficulty  || undefined,
        isCompatible: params.isCompatible || undefined,
        minPrice:    params.minPrice,
        maxPrice:    params.maxPrice,
        freeShipping: params.freeShipping || undefined,
        minRating:   params.minRating,
        brand:       params.brand       || undefined,
      },
    }).then(unwrap),

  autocomplete: (keyword: string) =>
    api.get<{ success: boolean; data: string[]; message: string }>('/search/autocomplete', {
      params: { keyword },
    }).then(unwrap),

  popular: () =>
    api.get<{ success: boolean; data: string[]; message: string }>('/search/popular')
      .then(unwrap),
}
