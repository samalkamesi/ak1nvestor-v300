/* AK1A Research Lab — service worker (PWA)
 * Strategi: nätverksförst för sidor (alltid färskt innehåll), cache-först för
 * statiska assets. Offline: senast cachad sida + offline-fallback.
 *
 * VÅG 78 TELEFON-BUGGEN (styrelsens beslut): en SW-uppdatering får ALDRIG
 * tvinga fram en sidladdning eller avbryta ett pågående besök. Därför finns
 * INGEN skipWaiting() och INGEN clients.claim() här — en ny SW-version blir
 * väntande och börjar gälla först när gamla flikar stängs, dvs. vid nästa
 * naturliga navigering/nytt besök. sw.js ska heller ALDRIG få någon
 * reload-logik (varken direkt eller via postMessage till sidan).
 */
const VERSION = "ak1a-v5";
const OFFLINE_URLS = ["/", "/laroplan", "/kurser"];

// VÅG 100-INCIDENTENS NÖDLÄGE: efter dagens många deployer sitter besökare
// fast på STALA JS-delar (v3-väntande SW + gamla chunk-cachear → "Något gick
// fel"-felgränsen). v5 bryter den försiktiga vänta-på-navigering-policyn EN
// gång: skipWaiting + clientsClaim tar över omedelbart och activate städar
// ALLA äldre versioners cachear. Sidan som redan lever laddas om vid nästa
// klick — inget tvångs-omladdningsloopande. NÄSTA version (v6) återgår till
// den tålmodiga policyn (våg 78-beslutet består som norm).
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      self.skipWaiting();
      const cache = await caches.open(VERSION);
      await cache.addAll(OFFLINE_URLS);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const nycklar = await caches.keys();
      await Promise.all(nycklar.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      const cache = await caches.open(VERSION);
      const reqs = await cache.keys();
      await Promise.all(
        reqs.map(async (req) => {
          const res = await cache.match(req);
          if (res && res.status >= 400) await cache.delete(req);
        })
      );
    })()
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
