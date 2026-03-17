import { getToken, onMessage } from 'firebase/messaging'
import { messaging, VAPID_KEY } from '@/lib/firebase'
import { api } from '@/lib/axios'

/**
 * FCM 토큰 발급 → 서버 등록
 * - 알림 권한 요청 포함
 * - 이미 등록된 토큰과 동일하면 재전송 안 함
 */
export async function registerFcmToken(): Promise<void> {
  try {
    // 브라우저 지원 확인
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    // 권한 요청
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    // 서비스워커가 활성화될 때까지 대기 (main.ts에서 등록)
    const registration = await navigator.serviceWorker.ready

    // FCM 토큰 발급
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (!token) return

    // 이전 토큰과 같으면 재등록 불필요
    const prev = localStorage.getItem('fcm_token')
    if (prev === token) return

    // 서버에 토큰 저장
    await api.post('/members/me/notifications/fcm-token', { token })
    localStorage.setItem('fcm_token', token)
  } catch (e) {
    // 권한 거부 등 조용히 무시
    console.warn('[FCM] 토큰 등록 실패:', e)
  }
}

/**
 * 포그라운드 푸시 수신 핸들러 등록
 * (앱이 열려있을 때 수신된 메시지 처리)
 */
export function listenForegroundMessage(callback: (title: string, body: string) => void): () => void {
  const unsubscribe = onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'AquaHub'
    const body = payload.notification?.body ?? ''
    callback(title, body)
  })
  return unsubscribe
}
