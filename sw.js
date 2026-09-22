// Bewusst kein Fetch-Handler und kein Cache: private Dashboard-Daten bleiben
// vollstaendig ausserhalb des Service Workers. Er wird nur fuer Push benoetigt.

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) { payload = {}; }
  const title = typeof payload.title === 'string' ? payload.title : 'Objektlupe';
  const body = typeof payload.body === 'string' ? payload.body : 'Neues passendes Objekt verfügbar.';
  const url = typeof payload.url === 'string' && payload.url.startsWith(self.location.origin + '/')
    ? payload.url
    : `${self.location.origin}/#/`;
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'objektlupe-new-object',
    data: { url },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url;
  if (typeof target !== 'string') return;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => client.url.startsWith(self.location.origin));
    if (existing) return existing.focus().then(() => existing.navigate(target));
    return self.clients.openWindow(target);
  }));
});
