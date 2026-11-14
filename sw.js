/* TaqwaLife service worker: cache offline + notifikasi push */
const V = 'taqwalife-v22'; // naikkan angka ini setiap kali file aplikasi diperbarui
const SHELL = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './css/style.css', './js/config.js', './js/core.js', './js/security.js', './js/storage.js', './js/data.js', './js/auth.js', './js/navigation.js', './js/theme.js', './js/views.js', './js/actions.js', './js/notifications.js', './js/prayer-times.js', './js/backup-share.js', './js/family.js', './js/hafalan.js', './js/challenges.js', './js/agenda.js', './js/about.js', './js/kajian.js', './js/doa.js', './js/ibadah-extra.js', './js/account.js', './js/menu.js', './js/push.js', './js/main.js'];
const HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com', 'cdnjs.cloudflare.com'];

// Respons hasil pengalihan (redirect) tidak boleh dipakai untuk halaman; salin menjadi respons biasa.
const clean = async res => {
  if (!res.redirected) return res;
  const b = await res.clone().blob();
  return new Response(b, { status: 200, statusText: 'OK', headers: res.headers });
};
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(async u => {
    const res = await fetch(u, { cache: 'reload' });
    if (!res.ok) throw new Error(u);
    await c.put(u, await clean(res));
  }))).then(() => self.skipWaiting()));
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
  // Halaman utama: selalu dilayani dari salinan './' agar aplikasi terpasang tetap terbuka (online maupun offline).
  if (r.mode === 'navigate') {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match('./');
      const net = fetch('./', { cache: 'no-cache' }).then(async res => {
        if (res && res.ok) await c.put('./', await clean(res));
        return res;
      }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      const res = await net;
      return res ? clean(res) : Response.error();
    }));
    return;
  }
  e.respondWith(
    caches.open(V).then(async c => {
      const hit = await c.match(r, { ignoreSearch: true });
      const net = fetch(r).then(async res => {
        if (res && res.ok && !res.redirected) c.put(r, res.clone());
        else if (res && res.type === 'opaque') c.put(r, res.clone());
        return res;
      }).catch(() => hit || Response.error());
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
    icon: 'icon-192.png', badge: 'icon-192.png', data: { url: './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => l.length ? l[0].focus() : self.clients.openWindow('./')));
});
