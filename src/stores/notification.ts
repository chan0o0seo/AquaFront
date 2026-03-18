import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Client } from '@stomp/stompjs'
import { notificationApi, type NotificationItem } from '@/api/notification.api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  let client: Client | null = null

  async function load() {
    try {
      notifications.value = await notificationApi.getAll()
    } catch {
      // 미인증 상태이면 무시
    }
  }

  function connect() {
    if (client?.active) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    client = new Client({
      brokerURL: `${protocol}//${window.location.host}/ws/auction`,
      onConnect: () => {
        client!.subscribe('/user/queue/notifications', (msg) => {
          const item: NotificationItem = JSON.parse(msg.body)
          if (!notifications.value.find(n => n.id === item.id)) {
            notifications.value.unshift(item)
          }
        })
      },
      reconnectDelay: 5000,
    })
    client.activate()
  }

  function disconnect() {
    client?.deactivate()
    client = null
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
