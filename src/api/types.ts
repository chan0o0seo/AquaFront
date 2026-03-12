// 백엔드 표준 응답 { success, data, message }
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

// 페이지네이션 공통 구조
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number       // 현재 페이지 (0-based)
  size: number
  last: boolean
}

// 표준 응답에서 data 필드만 꺼내는 헬퍼
export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data
}
