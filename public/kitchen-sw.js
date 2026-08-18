// Minimal service worker for the Kitchen Log PWA: caches the app shell
// (JS/CSS chunks, fonts) so the app can launch and the entry flow can be
// used offline. It never touches /api/* — those requests either succeed
// live or fail and get queued by the app's own IndexedDB outbox
// (see src/app/kitchen/offline.ts); serving stale API data offline would
// be actively misleading for a compliance log.
const CACHE_NAME = "kitchen-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/kitchen")))
    );
    return;
  }

  if (url.pathname.startsWith("/kitchen") || url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
