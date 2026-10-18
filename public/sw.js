/*
 * Service worker de Senda (PWA). Solo guarda en el teléfono lo que no es del estudiante:
 *   - la pantalla de arranque (/abrir.html) y su logotipo, para que la app instalada abra al instante;
 *   - los archivos de la app con hash (/_next/static/...), que nunca cambian, para no descargarlos cada vez.
 * Ninguna página, respuesta de la API ni texto del estudiante pasa por la caché: todo lo demás va directo a la red.
 */
const VERSION = "senda-v2";
const SHELL = ["/abrir.html", "/icons/splash-lockup.svg"];
const MAX_STATIC_ENTRIES = 200;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** Recorta la caché para que no crezca con cada despliegue (los más viejos primero). */
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_STATIC_ENTRIES; i++) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Pantalla de arranque: al instante desde la caché y se actualiza en segundo plano.
  if (SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(url.pathname);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(url.pathname, response.clone());
            return response;
          })
          .catch(() => cached);
        if (cached) {
          event.waitUntil(network);
          return cached;
        }
        return network;
      }),
    );
    return;
  }

  // Archivos con hash de Next.js: inmutables, primero la caché.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
          event.waitUntil(trim(cache));
        }
        return response;
      }),
    );
  }
});
