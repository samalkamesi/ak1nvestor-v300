/* AK1A Research Lab — service worker (PWA)
 * Strategi: nätverksförst för sidor (alltid färskt innehåll), cache-först för
 * statiska assets. Offline: senast cachad sida + offline-fallback.
 */
const VERSION = "ak1a-v2";
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
      // Hygien: radera ev. felstatussvar (404/5xx) som gamla versioner cachat
      .then(() =>
        caches.open(VERSION).then((cache) =>
          cache.keys().then((reqs) =>
            Promise.all(
              reqs.map((req) =>
                cache.match(req).then((res) => {
                  if (res && res.status >= 400) return cache.delete(req);
                })
              )
            )
          )
        )
      )
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

  // Sidor: nätverksförst, cache-fallback vid offline.
  // Endast lyckade svar (2xx) cachas — en 404 får aldrig fastna i cachen.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const kopia = res.clone();
          caches.open(VERSION).then((c) => c.put(req, kopia));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cachad) => cachad || caches.match("/")))
  );
});
