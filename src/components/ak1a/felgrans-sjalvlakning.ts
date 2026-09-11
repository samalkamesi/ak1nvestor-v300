/**
 * FELGRÄNS-SJÄLVLÄKNING (VÅG 101) — kundens återkommande "Något gick fel".
 *
 * Bakgrund: efter deployer kan besökare sitta kvar på STALA JS-chunks
 * (gammal/väntande service worker + chunk-cache i HTTP-cachen) → Next:s
 * dynamiska import misslyckas → felgränsen ("Ett fel uppstod vid laddning
 * av sidan"). Det är INTE ett applikationsfel — det går att LÄKA.
 *
 * Strategi (tre lager):
 *   1. SJÄLVLÄKNING: när fel-texten känns igen som chunk/modul-laddning
 *      rensas SW + ALLA cachear automatiskt och sidan laddas om — EN gång
 *      per session (sessionStorage-vakt "ak1a-sjalvlakning", inga loopar).
 *   2. MANUELL VÄG: knappen "Rensa & hem" får samma fullständiga rensning
 *      (SW-avregistrering + alla cachear + localStorage) och går till /.
 *   3. TELEMETRI (PII-fritt): varje felgräns beacon:ar EN gång till
 *      /api/trafik med { typ:"felgrans", kategori:"chunk"|"ovrig",
 *      url: pathname } — endast sökväg utan query, ALDRIG session/IP/
 *      felmeddelande-text. Syns i adminpanelens trafikvy.
 *
 * Ren klientmodul (importeras av felgränserna i (huvud)/(ar)/(en) — alla
 * browser-API:er vaktas med typeof så modulen är ofarlig vid SSR).
 */

/** sessionStorage-vakt — självläkning max EN gång per session/flik. */
export const LAKNINGS_NYCKEL = "ak1a-sjalvlakning";

/**
 * Kända chunk/modul-laddningsfel i Next (App Router + webpack/turbopack):
 *  - "Failed to fetch dynamically imported module: …"   (Chrome/Edge/Firefox)
 *  - "Importing a module script failed."                (Safari)
 *  - "ChunkLoadError: Loading chunk 42 failed."         (webpack-namn + text)
 * Riktiga applikationsfel matchar inte mönstren → gränssnittet visas normalt.
 */
const CHUNK_MONSTER: readonly RegExp[] = [
  /failed to fetch dynamically imported module/i,
  /dynamically imported module/i,
  /importing a module script failed/i,
  /chunkloaderror/i,
  /loading (?:css )?chunk [\w.-]+ failed/i,
];

/** Är felet ett chunk/modul-laddningsfel (→ självläkning)? */
export function arChunkFel(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { message?: unknown; name?: unknown };
  const text = `${typeof e.message === "string" ? e.message : ""} ${typeof e.name === "string" ? e.name : ""}`;
  return CHUNK_MONSTER.some((m) => m.test(text));
}

// ── Fullständig rensning (delas av självläkning + "Rensa & hem") ─────────────

/**
 * Avregistrerar service workern OCH raderar ALLA cachear. Tyst vid fel —
 * rensningen är ett försök att läka, aldrig ett fel i sig. Nya besök
 * registrerar SW:n igen (pwa-registrerare) med färsk version.
 */
async function fullstandigRensning(): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.unregister();
    }
  } catch {
    /* SW-frågan misslyckades — fortsätt ändå */
  }
  try {
    if (typeof caches !== "undefined") {
      const nycklar = await caches.keys();
      await Promise.all(nycklar.map((n) => caches.delete(n)));
    }
  } catch {
    /* cache-frågan misslyckades — fortsätt ändå */
  }
}

/** Knappen "Rensa & hem": fullständig rensning + localStorage + navigera hem. */
export async function rensaOchHem(): Promise<void> {
  await fullstandigRensning();
  try {
    window.localStorage.clear();
  } catch {
    /* minne nekat */
  }
  window.location.assign("/");
}

// ── Telemetri (PII-fritt) ────────────────────────────────────────────────────

/**
 * Beacon:ar felgräns-rapport till /api/trafik (typ "felgrans").
 * Fält: kategori + pathname — INGA personuppgifter (ingen query, session,
 * IP eller fel-text). sendBeacon överlever omladdningen; tyst vid fel.
 */
function rapporteraFel(kategori: "chunk" | "ovrigt"): void {
  try {
    const payload = JSON.stringify({
      typ: "felgrans",
      kategori,
      url: window.location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/trafik", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/trafik", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => undefined);
    }
  } catch {
    /* mätning får ALDRIG störa läkningen */
  }
}

// ── Felgränsens enda ingång ──────────────────────────────────────────────────

/**
 * Anropas EN gång per fel från felgränsens useEffect:
 *   1. telemetri beacon:as (chunk | ovrigt),
 *   2. chunk-fel → automatisk självläkning EN gång per session: fullständig
 *      rensning + location.reload() (sidor är nätverks-först i SW → färskt
 *      HTML, tom cache → färskta chunks),
 *   3. övriga (riktiga app-fel) → inget automatiskt — gränssnittet visas.
 */
export function hanteraFelgransFel(error: unknown): void {
  const chunk = arChunkFel(error);
  rapporteraFel(chunk ? "chunk" : "ovrigt");
  if (!chunk) return;

  let redanLakt = false;
  try {
    redanLakt = window.sessionStorage.getItem(LAKNINGS_NYCKEL) === "1";
    if (!redanLakt) window.sessionStorage.setItem(LAKNINGS_NYCKEL, "1");
  } catch {
    redanLakt = false; // minne nekat → våga läka (engångsrisken: en extra omladdning)
  }
  if (redanLakt) return;

  void (async () => {
    await fullstandigRensning();
    window.location.reload();
  })();
}
