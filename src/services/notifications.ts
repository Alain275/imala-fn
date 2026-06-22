import api from './api'

export type NotificationType = 'weather' | 'market' | 'disease' | 'soil' | 'training' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface NotificationsResponse {
  notifications: Notification[]
  pagination: Pagination
}

export interface GetNotificationsParams {
  type?: NotificationType
  isRead?: boolean
  page?: number
  limit?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

async function notifRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const result = await api.request<ApiResponse<T>>(endpoint, {
    requiresAuth: true,
    ...options,
  })
  if (!result.success) throw new Error(`Notifications API error: ${endpoint}`)
  return result.data
}

export const notificationsService = {
  getNotifications(params: GetNotificationsParams = {}): Promise<NotificationsResponse> {
    const qs = new URLSearchParams()
    if (params.type) qs.set('type', params.type)
    if (params.isRead !== undefined) qs.set('isRead', String(params.isRead))
    if (params.page !== undefined) qs.set('page', String(params.page))
    if (params.limit !== undefined) qs.set('limit', String(params.limit))
    const query = qs.toString()
    return notifRequest<NotificationsResponse>(`/notifications${query ? `?${query}` : ''}`)
  },

  async getUnreadCount(): Promise<number> {
    // Defensive: backend may return { count: number } or a bare number
    const raw = await notifRequest<{ count: number } | number>('/notifications/unread-count')
    if (typeof raw === 'number') {
      return raw
    }
    if (typeof raw === 'object' && raw !== null && 'count' in raw) {
      return raw.count ?? 0
    }
    return 0
  },

  markAsRead(id: string): Promise<void> {
    return notifRequest<void>(`/notifications/${id}/read`, { method: 'PATCH' })
  },

  markAllRead(): Promise<void> {
    return notifRequest<void>('/notifications/mark-all-read', { method: 'PATCH' })
  },

  deleteNotification(id: string): Promise<void> {
    return notifRequest<void>(`/notifications/${id}`, { method: 'DELETE' })
  },
}
