import api from './api'

interface PushStatusResponse {
  success: boolean
  data: { publicKey?: string; subscribed?: boolean }
}

function decodeApplicationServerKey(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - value.length % 4) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const bytes = new Uint8Array(raw.length)
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index)
  return bytes
}

function locationPayload() {
  const latitude = localStorage.getItem('imara_weather_lat')
  const longitude = localStorage.getItem('imara_weather_lon')
  return {
    locationName: localStorage.getItem('imara_weather_location') || 'Musanze',
    latitude: latitude == null ? null : Number(latitude),
    longitude: longitude == null ? null : Number(longitude),
  }
}

export const pushService = {
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  },

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null
    const registration = await navigator.serviceWorker.ready
    return registration.pushManager.getSubscription()
  },

  async subscribeCurrentDevice(): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') return false
    const keyResponse = await api.request<PushStatusResponse>('/push/public-key', { redirectOnUnauthorized: false })
    const publicKey = keyResponse.data.publicKey
    if (!publicKey) throw new Error('Push notifications are not configured yet')
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeApplicationServerKey(publicKey),
    })
    await api.request<PushStatusResponse>('/push/subscribe', {
      method: 'POST',
      requiresAuth: true,
      redirectOnUnauthorized: false,
      body: JSON.stringify({ subscription: subscription.toJSON(), ...locationPayload() }),
    })
    return true
  },

  async unsubscribeCurrentDevice(): Promise<void> {
    const subscription = await this.getSubscription()
    if (!subscription) return
    await api.request<PushStatusResponse>('/push/unsubscribe', {
      method: 'DELETE',
      requiresAuth: true,
      redirectOnUnauthorized: false,
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined)
    await subscription.unsubscribe()
  },
}
