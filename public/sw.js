// ============================================================
// CAMPUSBAZAAR: PRODUCTION SERVICE WORKER FOR WEB PUSH
// ============================================================
// Handles push notifications and notification click navigation
// Automatically focuses existing tabs to prevent duplicate tabs
// ============================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ============================================================
// PUSH EVENT: Receive and display system notification
// ============================================================
self.addEventListener('push', (event) => {
  let payload = {
    title: 'CampusBazaar',
    body: 'You have a new update on CampusBazaar.',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const title = payload.title || 'CampusBazaar';
  const targetUrl = (payload.data && payload.data.url) ? payload.data.url : '/';

  const notificationOptions = {
    body: payload.body || 'You have a new notification.',
    icon: payload.icon || '/favicon.svg',
    badge: payload.badge || '/favicon.svg',
    tag: payload.tag || targetUrl || 'campus-bazaar-notification',
    data: {
      ...payload.data,
      url: targetUrl
    },
    vibrate: [100, 50, 100],
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// ============================================================
// NOTIFICATION CLICK: Focus tab and navigate to listing or chat
// ============================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  let targetPath = notifData.url || '/';

  // Construct absolute URL based on the current origin
  const fullTargetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If a tab already matches the destination exactly, focus it
      for (const client of windowClients) {
        if (client.url === fullTargetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // 2. If any CampusBazaar tab is open on this origin, navigate it to destination and focus
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'navigate' in client && 'focus' in client) {
          client.focus();
          return client.navigate(fullTargetUrl);
        }
      }

      // 3. If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullTargetUrl);
      }
    })
  );
});
