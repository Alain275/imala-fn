import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { toast } from 'sonner'
import {
  notificationsService,
  Notification,
} from '@/services/notifications'

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refetch: () => void
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const POLL_INTERVAL_MS = 60_000

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  // Always-current snapshot used in mutation callbacks to avoid stale closures
  const notificationsRef = useRef<Notification[]>([])
  notificationsRef.current = notifications

  const refetch = useCallback(() => setVersion(v => v + 1), [])

  // Fetch recent 20 notifications for the bell panel
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    notificationsService.getNotifications({ limit: 20 })
      .then(data => {
        if (!cancelled) {
          setNotifications(data.notifications)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to load notifications'
        toast.error(message)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [version])

  // Fetch + poll unread count
  const fetchUnreadCount = useCallback(() => {
    notificationsService.getUnreadCount()
      .then(count => setUnreadCount(count))
      .catch(() => { /* silent — don't disrupt the UI on a background poll failure */ })
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const id = setInterval(fetchUnreadCount, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchUnreadCount])

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await notificationsService.markAsRead(id)
    } catch (err: unknown) {
      // Revert
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n))
      setUnreadCount(prev => prev + 1)
      const message = err instanceof Error ? err.message : 'Failed to mark notification as read'
      toast.error(message)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const snapshot = notificationsRef.current
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try {
      await notificationsService.markAllRead()
    } catch (err: unknown) {
      setNotifications(snapshot)
      fetchUnreadCount()
      const message = err instanceof Error ? err.message : 'Failed to mark all as read'
      toast.error(message)
    }
  }, [fetchUnreadCount])

  const remove = useCallback(async (id: string) => {
    const snapshot = notificationsRef.current
    const target = snapshot.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (target && !target.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await notificationsService.deleteNotification(id)
    } catch (err: unknown) {
      setNotifications(snapshot)
      if (target && !target.isRead) setUnreadCount(prev => prev + 1)
      const message = err instanceof Error ? err.message : 'Failed to delete notification'
      toast.error(message)
    }
  }, [])

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, refetch, markAsRead, markAllRead, remove }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
