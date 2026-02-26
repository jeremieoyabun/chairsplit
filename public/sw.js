// ChairSplit Service Worker — Push Notifications

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()))

self.addEventListener("push", (event) => {
  if (!event.data) return
  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: "ChairSplit", body: event.data.text() }
  }

  const { title = "ChairSplit", body = "", icon = "/images/logo-chairsplit.png", url = "/" } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/images/logo-chairsplit.png",
      data: { url },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
