// Service worker de la app instalable.
// - Todo se pide primero a internet (siempre la última versión) y se guarda una copia.
// - Sin conexión se usan las copias y, si la página no está, un aviso.
// - Nunca guarda la API, el chat ni el vídeo.
// Al cambiar archivos de la web, sube VERSION para que los usuarios reciban la nueva.

const VERSION = 'lrc-v21';
const PRECACHE = [
  '/', '/offline.html', '/offline.js', '/style.css', '/app.js', '/i18n.js', '/legal.js',
  '/logo.svg', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/fonts/plus-jakarta-sans.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/') || url.pathname === '/admin' || url.pathname.startsWith('/admin.')) return;

  // Páginas: primero internet; sin conexión, la copia guardada o el aviso
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/offline.html'))),
    );
    return;
  }

  // Archivos: primero internet (para no mezclar versiones tras una actualización) y
  // se guarda una copia; sin conexión, la copia guardada
  event.respondWith(
    fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone(); // hay que copiarla antes de devolverla
        caches.open(VERSION).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req)),
  );
});

// Notificaciones (llamadas de amigos, solicitudes…) aunque la web esté cerrada
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: event.data?.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'La Ruleta Caliente', {
    body: data.body || '',
    tag: data.tag,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
  }));
});

// Al tocar la notificación: abre la web (o la pestaña que ya estaba abierta)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const tab of tabs) {
      // Ya hay una pestaña abierta: se trae al frente sin recargarla (no corta una videollamada)
      if (new URL(tab.url).origin === self.location.origin) { await tab.focus(); tab.postMessage({ type: 'open', url }); return undefined; }
    }
    return self.clients.openWindow(url);
  })());
});
