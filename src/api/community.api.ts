import { api } from '@/lib/axios'
import { unwrap, type PageResponse } from './types'

export interface BoardCategoryResponse {
  id: number
  name: string
  type: 'NOTICE' | 'FREE' | 'WIKI' | 'QNA'
  description: string | null
  displayOrder: number
}

export interface PostSummaryResponse {
  id: number
  categoryName: string
  title: string
  authorNickName: string
  viewCount: number
  likeCount: number
  commentCount: number
  thumbnailUrl: string | null
  createdAt: string
}

export interface PostDetailResponse {
  id: number
  categoryId: number
  categoryName: string
  title: string
  content: string
  imageUrls: string[]
  authorNickName: string
  viewCount: number
  likeCount: number
  commentCount: number
  liked: boolean
  createdAt: string
  updatedAt: string
}

export interface CommentResponse {
  id: number
  authorNickName: string | null
  content: string
  deleted: boolean
  createdAt: string
  replies: CommentResponse[]
}

export const communityApi = {
  getCategories: () =>
    api.get<{ success: boolean; data: BoardCategoryResponse[] }>('/community/categories').then(unwrap),

  getPosts: (params?: { categoryId?: number; page?: number; size?: number; sort?: string }) =>
    api.get<{ success: boolean; data: PageResponse<PostSummaryResponse> }>('/community/posts', { params }).then(unwrap),

  getPost: (postId: number) =>
    api.get<{ success: boolean; data: PostDetailResponse }>(`/community/posts/${postId}`).then(unwrap),

  createPost: (body: { categoryId: number; title: string; content: string; imageUrls: string[] }) =>
    api.post<{ success: boolean; data: PostDetailResponse }>('/community/posts', body).then(unwrap),

  updatePost: (postId: number, body: { title: string; content: string; imageUrls: string[] }) =>
    api.patch<{ success: boolean; data: PostDetailResponse }>(`/community/posts/${postId}`, body).then(unwrap),

  deletePost: (postId: number) =>
    api.delete(`/community/posts/${postId}`),

  recordView: (postId: number) =>
    api.post(`/community/posts/${postId}/view`),

  toggleLike: (postId: number) =>
    api.post<{ success: boolean; data: { liked: boolean } }>(`/community/posts/${postId}/like`).then(unwrap),

  getComments: (postId: number) =>
    api.get<{ success: boolean; data: CommentResponse[] }>(`/community/posts/${postId}/comments`).then(unwrap),

  addComment: (postId: number, body: { content: string; parentId?: number }) =>
    api.post<{ success: boolean; data: CommentResponse }>(`/community/posts/${postId}/comments`, body).then(unwrap),

  updateComment: (commentId: number, content: string) =>
    api.patch<{ success: boolean; data: CommentResponse }>(`/community/comments/${commentId}`, { content }).then(unwrap),

  deleteComment: (commentId: number) =>
    api.delete(`/community/comments/${commentId}`),
}
