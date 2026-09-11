/* AK1A Research Lab — service worker (PWA)
 * Strategi: nätverksförst för sidor (alltid färskt innehåll), cache-först för
 * statiska assets. Offline: senast cachad sida + offline-fallback.
 *
 * VÅG 78 TELEFON-BUGGEN (styrelsens beslut — GÄLLANDE NORM): en SW-uppdatering
 * får ALDRIG tvinga fram en sidladdning eller avbryta ett pågående besök.
 * Därför finns INGEN skipWaiting() och INGEN clients.claim() här — en ny
 * SW-version blir väntande och börjar gälla först när gamla flikar stängs,
 * dvs. vid nästa naturliga navigering/nytt besök. sw.js ska heller ALDRIG få
 * någon reload-logik (varken direkt eller via postMessage till sidan).
 *
 * HISTORIK — v5:S NÖDLÄGE (VÅG 100-incidenten, AVSLUTAT): efter många
 * deployer satt besökare fast på stala JS-delar (v3-väntande SW + gamla
 * chunk-cachear → "Något gick fel"-felgränsen). v5 bröt EN gång den
 * tålmodiga policyn med skipWaiting + clientsClaim för att städa ut allt
 * omedelbart. Nödläget är över: v6 ÅTERGÅR till våg 78-normen ovan.
 * Skyddet mot stala chunkar sköts i stället av felgränsernas SJÄLVLÄKNING
 * (src/components/ak1a/felgrans-sjalvlakning.ts): vid chunk-laddningsfel
 * avregistreras SW:n, ALLA cachear raderas och sidan laddas om EN gång per
 * session — applikationen läker sig själv, SW:n tvingar aldrig omladdning.
 */
const VERSION = "ak1a-v7";
const OFFLINE_URLS = ["/", "/laroplan", "/kurser"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await cache.addAll(OFFLINE_URLS);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Städa ALLA äldre versioners cachear (även v5-nödlagrets "ak1a-v5").
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
