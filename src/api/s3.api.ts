import { api } from '@/lib/axios'
import axios from 'axios'
import { unwrap } from './types'

export interface PresignedUrlResponse {
  presignedUrl: string  // S3에 PUT 요청할 URL
  fileUrl: string       // 업로드 후 실제 접근 URL
}

export const s3Api = {
  // 1단계: presigned URL 발급
  // POST /api/s3/presigned-url
  getPresignedUrl: (fileName: string, contentType: string) =>
    api.post<{ success: boolean; data: PresignedUrlResponse; message: string }>(
      '/s3/presigned-url',
      { fileName, contentType }
    ).then(unwrap),

  // 2단계: presigned URL로 S3에 직접 PUT 업로드 (api 인스턴스 아닌 순수 axios 사용)
  uploadToS3: (presignedUrl: string, file: File) =>
    axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    }),
}

// 파일 1개를 업로드하고 최종 URL을 반환하는 헬퍼
export async function uploadFile(file: File): Promise<string> {
  const { presignedUrl, fileUrl } = await s3Api.getPresignedUrl(file.name, file.type)
  await s3Api.uploadToS3(presignedUrl, file)
  return fileUrl
}

// 파일 여러 개를 병렬 업로드하고 URL 목록 반환
export async function uploadFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadFile))
}
