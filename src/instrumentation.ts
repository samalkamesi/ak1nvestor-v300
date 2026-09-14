/**
 * SJÄLVVÄRMANDE SERVER (våg 149 — vaktfynd 2026-09-14T0717)
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
 */

export async function register(): Promise<void> {
  // Endast prod-servern (next start): aldrig under bygget, aldrig dev.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.NODE_ENV !== "production") return;

  const bas = `http://127.0.0.1:${process.env.PORT || "3000"}`;
  const vanta = (ms: number) => new Promise<void>((los) => setTimeout(los, ms));

  // Tungaste träden först — /admin är fyndets route; roten är referens.
  const SIDOR = ["/", "/admin", "/studio", "/kurser", "/labb", "/blogg"];

  // Bakgrund: register() ska aldrig blockera eller krascha serverstarten.
  void (async () => {
    // Vänta ut porten (omstart, portbindning kan ta några sekunder).
    for (let i = 0; i < 60; i++) {
      try {
        const sond = await fetch(`${bas}/`, { signal: AbortSignal.timeout(2000) });
        if (sond.ok) break;
      } catch {
        /* porten ej öppen än */
      }
      await vanta(2000);
    }
    for (const sida of SIDOR) {
      const t0 = Date.now();
      try {
        const r = await fetch(`${bas}${sida}`, { signal: AbortSignal.timeout(60_000) });
        console.log(`[varm] ${sida} → ${r.status} på ${Date.now() - t0} ms`);
      } catch (fel) {
        console.warn(`[varm] ${sida} misslyckades efter ${Date.now() - t0} ms: ${String(fel).slice(0, 100)}`);
      }
      await vanta(500);
    }
    console.log("[varm] klar — servern varm efter omstart");
  })();
}
