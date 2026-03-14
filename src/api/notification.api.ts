import { api } from '@/lib/axios'

export type NotificationType = 'AUCTION_STARTED' | 'AUCTION_WON'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  message: string
  referenceId: number | null
  read: boolean
  createdAt: string
}

export const notificationApi = {
  getAll: (): Promise<NotificationItem[]> =>
    api.get<{ success: boolean; data: NotificationItem[] }>('/notifications')
      .then(r => r.data.data),

  markRead: (id: number) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
}
