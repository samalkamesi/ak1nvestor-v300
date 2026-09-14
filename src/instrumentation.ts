/**
 * SJÄLVVÄRMANDE SERVER (våg 149 — vaktfynd 2026-09-14T0717; v150-låsning)
 * =====================================================================
 * Bevisat fall: pm2-restart 07:14:58, gränsnittsvaktens första /admin-
 * träff 07:19 timeout:ade (>25 s domcontentloaded) på den kalla
 * servern; alla efterföljande träffar (4 teman/skärmar + 40 flikar)
 * gröna. Deploy-skriptet värmer bara roten "/" — övriga routes möter
 * kall JIT vid förstagångsbesöket, tungast /admin.
 *
 * Kur: register() körs vid varje serverstart (next start) och värmer
 * tunga routes i bakgrunden — ingen kund och ingen vakt träffar den
 * kalla svansen, oavsett vem som startade om processen (deploy, OOM,
 * kraschvakt). Loopback är whitelistat i middleware; värmen loggas
 * som "[varm]" med statuskod och tid.
 *
 * VÅG 150 — SÄKERHETSLÅSNING: måladresserna är FULLT LITERALA loopback-
 * URL:er (inga mallsträngar vid fetch — Mimosas SSRF-vakt: HÄRDKODADE
 * 127.0.0.1-adresser kan inte styras av indata). Porten är låst till
 * prod-sanningen 3000 (pm2 'ak1a'); avvikande PORT = värmningen missar
 * tyst och skadar aldrig serverstarten.
 */

// Fullt litterala loopback-adresser — ALDRIG användarstyrbara.
const VARMA_SOKVAGAR = [
  "http://127.0.0.1:3000/",
  "http://127.0.0.1:3000/admin",
  "http://127.0.0.1:3000/studio",
  "http://127.0.0.1:3000/kurser",
  "http://127.0.0.1:3000/labb",
  "http://127.0.0.1:3000/blogg",
] as const;

export async function register(): Promise<void> {
  // Endast prod-servern (next start): aldrig under bygget, aldrig dev.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.NODE_ENV !== "production") return;

  const vanta = (ms: number) => new Promise<void>((los) => setTimeout(los, ms));

  // Bakgrund: register() ska aldrig blockera eller krascha serverstarten.
  void (async () => {
    // Vänta ut porten (omstart, portbindning kan ta några sekunder).
    for (let i = 0; i < 60; i++) {
      try {
        const sond = await fetch(VARMA_SOKVAGAR[0], { signal: AbortSignal.timeout(2000) });
        if (sond.ok) break;
      } catch {
        /* porten ej öppen än */
      }
      await vanta(2000);
    }
    for (const url of VARMA_SOKVAGAR) {
      const sida = url.slice("http://127.0.0.1:3000".length);
      const t0 = Date.now();
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
        console.log(`[varm] ${sida} → ${r.status} på ${Date.now() - t0} ms`);
      } catch (fel) {
        console.warn(`[varm] ${sida} misslyckades efter ${Date.now() - t0} ms: ${String(fel).slice(0, 100)}`);
      }
      await vanta(500);
    }
    console.log("[varm] klar — servern varm efter omstart");
  })();
}
