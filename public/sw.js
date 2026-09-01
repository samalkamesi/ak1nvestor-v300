/* AK1A Research Lab — service worker (PWA)
 * Strategi: nätverksförst för sidor (alltid färskt innehåll), cache-först för
 * statiska assets. Offline: senast cachad sida + offline-fallback.
 */
const VERSION = "ak1a-v1";
const OFFLINE_URLS = ["/", "/laroplan", "/kurser"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nycklar) => Promise.all(nycklar.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // API-anrop cachas aldrig (chatbot, portfölj, djupanalys)
  if (url.pathname.startsWith("/api/")) return;

  // Statiska assets: cache-först (fingerprintade, immutabla)
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/ak1a/")) {
    event.respondWith(
      caches.match(req).then(
        (cachad) =>
          cachad ||
          fetch(req).then((res) => {
            const kopia = res.clone();
            caches.open(VERSION).then((c) => c.put(req, kopia));
            return res;
          })
      )
    );
    return;
  }

  // Sidor: nätverksförst, cache-fallback vid offline
  event.respondWith(
    fetch(req)
      .then((res) => {
        const kopia = res.clone();
        caches.open(VERSION).then((c) => c.put(req, kopia));
        return res;
      })
      .catch(() => caches.match(req).then((cachad) => cachad || caches.match("/")))
  );
});
