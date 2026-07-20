import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { authService } from "@/services/auth"
import { notificationsService, type Notification } from "@/services/notifications"
import { weatherService } from "@/services/weather"
import { pushService } from "@/services/push"

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  browserPermission: NotificationPermission | "unsupported"
  pushSupported: boolean
  pushSubscribed: boolean
  refetch: () => void
  requestBrowserPermission: () => Promise<void>
  disablePushNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)
const PUBLIC_STORAGE_KEY = "imara_public_notifications"
const REFRESH_MS = 5 * 60 * 1000

function readPublic(): Notification[] {
  try { return JSON.parse(localStorage.getItem(PUBLIC_STORAGE_KEY) || "[]") as Notification[] }
  catch { return [] }
}

function writePublic(items: Notification[]) {
  localStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(items.slice(0, 30)))
}

function publicWelcome(): Notification {
  const now = new Date().toISOString()
  return {
    id: "public:welcome", userId: "public", type: "system", priority: "low", isRead: false,
    title: "Welcome to IMARA alerts", message: "You can receive public weather and farming reminders without creating an account.",
    createdAt: now, updatedAt: now, data: { actionUrl: "/dashboard" },
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const [isAuthed, setIsAuthed] = useState(() => authService.isAuthenticated())
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "unsupported"
  )
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const pushSupported = typeof window !== "undefined" && pushService.isSupported()
  const initialized = useRef(false)
  const previousIds = useRef(new Set<string>())
  const notificationsRef = useRef<Notification[]>([])
  notificationsRef.current = notifications
  const unreadCount = notifications.filter((item) => !item.isRead).length

  const refetch = useCallback(() => setVersion((value) => value + 1), [])

  const showBrowserAlerts = useCallback((items: Notification[]) => {
    if (!initialized.current || browserPermission !== "granted") return
    for (const item of items) {
      if (!previousIds.current.has(item.id) && !item.isRead && item.priority !== "low") {
        const alert = new window.Notification(item.title, { body: item.message, icon: "/icons/icon-192x192.png", tag: item.id })
        alert.onclick = () => { window.focus(); window.location.assign(item.data?.actionUrl || "/dashboard") }
      }
    }
  }, [browserPermission])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let items: Notification[]
      if (authService.isAuthenticated()) {
        const location = localStorage.getItem("imara_weather_location") || authService.getCurrentUser()?.location || "Musanze"
        const weatherAlerts = await weatherService.getFarmingAlerts(location).catch(() => [])
        await notificationsService.syncReminders(weatherAlerts).catch(() => 0)
        const response = await notificationsService.getNotifications({ limit: 30 })
        items = response.notifications
      } else {
        const stored = readPublic()
        const firstVisit = localStorage.getItem(PUBLIC_STORAGE_KEY) === null
        const base = (firstVisit ? [publicWelcome(), ...stored] : stored).filter((item) =>
          item.type !== "weather" || !item.data?.validTo || new Date(String(item.data.validTo)).getTime() >= Date.now()
        )
        const location = localStorage.getItem("imara_weather_location") || "Musanze"
        const weatherAlerts = await weatherService.getFarmingAlerts(location).catch(() => [])
        const byId = new Map(base.map((item) => [item.id, item]))
        for (const alert of weatherAlerts) {
          const id = `public:weather:${alert.id}:${alert.validFrom.slice(0, 10)}`
          if (!byId.has(id)) byId.set(id, {
            id, userId: "public", type: "weather", priority: alert.priority, title: alert.title, message: alert.message,
            isRead: false, createdAt: new Date().toISOString(), data: { actionUrl: "/dashboard/weather", validFrom: alert.validFrom, validTo: alert.validTo },
          })
        }
        items = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        writePublic(items)
      }
      showBrowserAlerts(items)
      setNotifications(items)
      previousIds.current = new Set(items.map((item) => item.id))
      initialized.current = true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Notifications could not be loaded")
    } finally { setLoading(false) }
  }, [showBrowserAlerts])

  useEffect(() => { void load() }, [load, version, isAuthed])
  useEffect(() => {
    if (!pushSupported) return
    void pushService.getSubscription().then((subscription) => setPushSubscribed(Boolean(subscription)))
    if (window.Notification.permission === "granted") {
      // Re-registering is safe and links an anonymous device after the user signs in.
      void pushService.subscribeCurrentDevice().then(setPushSubscribed).catch(() => setPushSubscribed(false))
    }
  }, [isAuthed, pushSupported])
  useEffect(() => {
    const timer = window.setInterval(refetch, REFRESH_MS)
    const authChanged = () => { setIsAuthed(authService.isAuthenticated()); setVersion((value) => value + 1) }
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") refetch() }
    const refreshPushLocation = () => {
      if (window.Notification?.permission === "granted") void pushService.subscribeCurrentDevice().then(setPushSubscribed).catch(() => undefined)
    }
    const addPublicNotification = (event: Event) => {
      if (authService.isAuthenticated()) { refetch(); return }
      const detail = (event as CustomEvent<Partial<Notification>>).detail
      if (!detail?.title || !detail.message) return
      const now = new Date().toISOString()
      updatePublic((items) => [{
        id: detail.id || `public:event:${Date.now()}`, userId: "public", type: detail.type || "system",
        priority: detail.priority || "medium", title: detail.title!, message: detail.message!, isRead: false,
        createdAt: now, data: detail.data,
      }, ...items])
    }
    window.addEventListener("user-updated", authChanged)
    window.addEventListener("storage", authChanged)
    window.addEventListener("imara-notifications-refresh", refetch)
    window.addEventListener("imara-public-notification", addPublicNotification)
    window.addEventListener("imara-location-updated", refreshPushLocation)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => { window.clearInterval(timer); window.removeEventListener("user-updated", authChanged); window.removeEventListener("storage", authChanged); window.removeEventListener("imara-notifications-refresh", refetch); window.removeEventListener("imara-public-notification", addPublicNotification); window.removeEventListener("imara-location-updated", refreshPushLocation); document.removeEventListener("visibilitychange", refreshWhenVisible) }
  }, [refetch])

  const requestBrowserPermission = useCallback(async () => {
    if (!pushService.isSupported()) { setBrowserPermission("unsupported"); return }
    const permission = await window.Notification.requestPermission()
    setBrowserPermission(permission)
    if (permission === "granted") {
      try {
        const subscribed = await pushService.subscribeCurrentDevice()
        setPushSubscribed(subscribed)
        toast.success("Alerts enabled on this device")
      } catch (error) {
        setPushSubscribed(false)
        toast.error(error instanceof Error ? error.message : "This device could not be subscribed")
      }
    }
  }, [])

  const disablePushNotifications = useCallback(async () => {
    await pushService.unsubscribeCurrentDevice()
    setPushSubscribed(false)
    toast.success("Push alerts disabled on this device")
  }, [])

  const updatePublic = (updater: (items: Notification[]) => Notification[]) => {
    const next = updater(notificationsRef.current)
    setNotifications(next)
    writePublic(next)
  }

  const markAsRead = useCallback(async (id: string) => {
    if (!authService.isAuthenticated()) { updatePublic((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item)); return }
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item))
    try { await notificationsService.markAsRead(id) } catch { refetch() }
  }, [refetch])

  const markAllRead = useCallback(async () => {
    if (!authService.isAuthenticated()) { updatePublic((items) => items.map((item) => ({ ...item, isRead: true }))); return }
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
    try { await notificationsService.markAllRead() } catch { refetch() }
  }, [refetch])

  const remove = useCallback(async (id: string) => {
    if (!authService.isAuthenticated()) { updatePublic((items) => items.filter((item) => item.id !== id)); return }
    setNotifications((items) => items.filter((item) => item.id !== id))
    try { await notificationsService.deleteNotification(id) } catch { refetch() }
  }, [refetch])

  return <NotificationsContext.Provider value={{ notifications, unreadCount, loading, browserPermission, pushSupported, pushSubscribed, refetch, requestBrowserPermission, disablePushNotifications, markAsRead, markAllRead, remove }}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider")
  return context
}
