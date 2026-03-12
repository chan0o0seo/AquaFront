import { api } from '@/lib/axios'
import { unwrap } from './types'
import type { ProductType } from './product.api'

export interface SearchResult {
  id: string
  name: string
  price: number
  shippingFee: number
  stock: number
  lowStockWarning: boolean
  sellerNickName: string
  tags: string[]
  status: 'ACTIVE' | 'SOLD_OUT'
  productType: ProductType
  thumbnailUrl: string | null
}

export type SearchSortOption = 'relevance' | 'price_asc' | 'price_desc'

export const searchApi = {
  // GET /api/search?keyword=&page=&size=&sort=&productType=
  search: (params: {
    keyword: string
    page?: number
    size?: number
    sort?: SearchSortOption
    productType?: ProductType | ''
  }) =>
    api.get<{ success: boolean; data: SearchResult[]; message: string }>('/search', {
      params: {
        keyword: params.keyword,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'relevance',
        productType: params.productType || undefined,
      },
    }).then(unwrap),

  // GET /api/search/autocomplete?keyword=
  autocomplete: (keyword: string) =>
    api.get<{ success: boolean; data: string[]; message: string }>('/search/autocomplete', {
      params: { keyword },
    }).then(unwrap),

  // GET /api/search/popular
  popular: () =>
    api.get<{ success: boolean; data: string[]; message: string }>('/search/popular')
      .then(unwrap),
}
