/* TaqwaLife service worker: cache offline + notifikasi push */
const V = 'taqwalife-v2.1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  if (!same && !HOSTS.includes(u.hostname)) return;
  e.respondWith(
    caches.open(V).then(async c => {
      const hit = await c.match(r, { ignoreSearch: true });
      const net = fetch(r).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) c.put(r, res.clone());
        return res;
      }).catch(() => hit || (r.mode === 'navigate' ? c.match('./index.html') : undefined));
      return hit || net;
    })
  );
});
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (x) {}
  const n = d.notification || d.data || {};
  e.waitUntil(self.registration.showNotification(n.title || 'TaqwaLife', {
    body: n.body || 'Saatnya melanjutkan amal yaumi Anda.',
    icon: 'icon-192.png', badge: 'icon-192.png', data: { url: './index.html' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => l.length ? l[0].focus() : self.clients.openWindow('./index.html')));
});
