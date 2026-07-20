self.addEventListener('push', (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch { payload = { message: event.data?.text() } }
  const title = payload.title || 'IMARA'
  const options = {
    body: payload.message || 'You have a new farming update.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: payload.tag || 'imara-update',
    data: { url: payload.url || '/dashboard' },
    renotify: payload.priority === 'high',
    vibrate: payload.priority === 'high' ? [200, 100, 200, 100, 200] : [150, 80, 150],
    actions: [{ action: 'open', title: 'Open IMARA' }],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
    const existing = windows.find((client) => client.url.startsWith(self.location.origin))
    if (existing) {
      await existing.navigate(targetUrl)
      return existing.focus()
    }
    return self.clients.openWindow(targetUrl)
  }))
})
