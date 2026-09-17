#!/usr/bin/env node
// granssnitt-konsol.mjs — ren klassificerare: konsolfel som är deploy-
// signaturer (spår 8, s8-u1 omgång 5, 2026-09-16).
//
// BAKGRUND (bevis: data/vakten/granssnitt-2026-09-16T1003.json, gitignorerad
// körningsdata): gränsnittsvakten mätte /kurser 10:02:14Z mitt i prod-synkens
// byggfönster (första försöket OOM-dödat 10:02:39, omförsök per poll —
// worklog c4491ece). HUVUDDOKUMENTET svarade 200 (HTML levererad) men 31
// DELRESURSER under _next/static (chunks-CSS, woff-media) svarade 500 —
// stilmallen laddade aldrig, sidan mättes OSTYLAD och MAT_SKRIPT producerade
// 30 SKENKONTRASTER i en rapport med status "ok" (light-temat; dark mätt
// efter OOM-dörren med 1 fel/0 kontraster). Regel B (våg 142) täckte bara
// huvuddokumentets goto-5xx och goto-KASTENS net::ERR_ — delresursfel som
// bara loggas i konsolen passerade rakt igenom.
//
// Denna modul är REN (ingen IO, inga imports) så den kan testas offline av
// verktyg/testa-granssnitt-konsol.mjs. Gränsnittsvakten importerar
// klassificeraren och kombinerar den med deployPagar() i samma fail-safe
// som goto-grenen: signatur + AKTIV deploy ⇒ avbryt svepet utan larm
// ("avbruten — deploy pågår", exit 0); signatur + frisk bas ⇒ verkligt fel
// som larmar som tidigare (o24 §5: instrumentet MÅSTE särskilja "måttobjekt
// trasigt" från "kunde inte mäta" — här: mätvärden från ostylad sida är
// aldrig sanning).
//
// Signaturer (sanningskällor: 10:03-rapportens äkta strängar + våg 142:s
// dokumenterade 2026-09-13-fall "500-felsidor, chunk-404,
// ERR_CONNECTION_REFUSED"):
//   1. "Failed to load resource" + "status of 5xx" — delresurs-500 under
//      pågående .next-omskrivning (10:03-fallets exakta signatur)
//   2. "Failed to load resource" + "status of 404" + [.../_next/static/...]
//      i plats-prefixet — chunk-404 när nytt byggs hash-rotation låtit gamla
//      chunknamn dö (2026-09-13-fallet)
//   3. "Failed to load resource" + "net::ERR_" — delresurs-anslutningsbrott
//      (pm2-omstartens fönster)
// Icke-_next-404 (t.ex. saknad bild i innehåll) är ett ÄKTA innehållsfel —
// aldrig deploy-signatur; det ska larma.

export function konsolFelIndikerarDeployStorning(konsolFel) {
  return (konsolFel || []).some((rad) => {
    if (typeof rad !== "string" || !rad.includes("Failed to load resource")) return false;
    if (/status of 5\d\d/.test(rad)) return true;
    if (/status of 404/.test(rad) && /\[https?:\/\/[^[\]]*\/_next\/static\//.test(rad)) return true;
    return rad.includes("net::ERR_");
  });
}
