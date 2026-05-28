// service-worker.js
// Auto-actualización: el usuario NUNCA tiene que limpiar cache manualmente.
//
// Estrategia de cache:
// - HTML/navegación: network-first (siempre busca lo nuevo, cae a cache solo offline)
// - Assets con hash de Vite (/assets/*.js, *.css): cache-first (el nombre cambia con cada build)
// - APIs externas (Supabase, Telegram): passthrough (nunca se cachean)
//
// Estrategia de actualización:
// - skipWaiting(): el SW nuevo se activa sin esperar a que cierren las pestañas
// - clients.claim(): el SW nuevo toma control de todas las pestañas abiertas
// - El cliente (main.jsx) detecta el SW nuevo y recarga automáticamente

// CACHE_VERSION cambia en cada deploy. Vite reemplaza __BUILD_HASH__ si configuras
// el define en vite.config.js; si no, usa la fecha de build como fallback.
const CACHE_VERSION = 'enfermereando-__BUILD_HASH__';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const STATIC_ASSETS = ['/manifest.json'];

self.addEventListener('install', (event) => {
  // Activar inmediatamente sin esperar a que cierren las pestañas viejas
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())  // tomar control de todas las pestañas ya
  );
});

// Permitir que el cliente fuerce la activación (usado por el botón "actualizar")
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('telegram.org') ||
    url.hostname.includes('picsum.photos') ||
    url.hostname.includes('api.telegram.org')
  ) {
    return;
  }

  if (url.origin !== self.location.origin) return;

  const isHTML =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first para HTML
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
    return;
  }

  // Cache-first para assets versionados por Vite
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});