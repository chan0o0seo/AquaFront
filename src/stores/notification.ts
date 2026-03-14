import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi, type NotificationItem } from '@/api/notification.api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  let es: EventSource | null = null
  let shouldReconnect = false

  async function load() {
    try {
      notifications.value = await notificationApi.getAll()
    } catch {
      // 미인증 상태이면 무시
    }
  }

  function createConnection() {
    es = new EventSource('/api/notifications/stream', { withCredentials: true })

    es.addEventListener('notification', (event: MessageEvent) => {
      const item: NotificationItem = JSON.parse(event.data)
      // 중복 방지
      if (!notifications.value.find(n => n.id === item.id)) {
        notifications.value.unshift(item)
      }
    })

    es.onerror = () => {
      es?.close()
      es = null
      if (shouldReconnect) {
        // 5초 후 재연결 시도 (네트워크 단절 등 일시적 오류 복구)
        setTimeout(createConnection, 5_000)
      }
    }
  }

  function connect() {
    if (es) return
    shouldReconnect = true
    createConnection()
  }

  function disconnect() {
    shouldReconnect = false
    es?.close()
    es = null
    notifications.value = []
  }

  async function markRead(id: number) {
    await notificationApi.markRead(id)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  async function markAllRead() {
    await notificationApi.markAllRead()
    notifications.value.forEach(n => { n.read = true })
  }

  return { notifications, unreadCount, load, connect, disconnect, markRead, markAllRead }
})
