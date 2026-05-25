// service-worker.js
// Estrategia:
// - HTML (incluido index.html): network-first → siempre busca la versión nueva, cae al cache solo si está offline
// - Assets con hash (JS, CSS): cache-first → Vite los versiona por nombre, así que cachearlos es seguro
// - APIs externas: passthrough → no las tocamos
//
// IMPORTANTE: incrementa CACHE_VERSION cada vez que hagas un deploy con cambios visibles
// para forzar la invalidación del cache en todos los clientes.
const CACHE_VERSION = 'enfermereando-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const STATIC_ASSETS = [
  '/manifest.json',
];

// Install: precachear lo mínimo. NO incluimos / ni /index.html porque queremos network-first para HTML.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('telegram.org') ||
    url.hostname.includes('picsum.photos')
  ) {
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Estrategia 1: HTML (navegación) → network-first
  // Esto garantiza que cualquier cambio en index.html o en las rutas se vea de inmediato.
  const isHTML = request.mode === 'navigate' ||
                 (request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Estrategia 2: assets con hash (Vite genera /assets/index-XXXXX.js, así que el nombre cambia
  // con cada build → cache-first es seguro porque un asset viejo siempre tiene un nombre viejo).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});