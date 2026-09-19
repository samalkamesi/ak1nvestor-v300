// GRÄNSSNITTSDRIFT — ren drift-logik för gränsnittsvakten (o86, spår 8 s8-u3)
// =============================================================================
// Precedens: granssnitt-konsol.mjs (s8-u1 omg 5) + granssnitt-urval.mjs
// (s8-u2) — beslutslogiken bor i en ren modul så att sviten kan importera
// DEN RIKTIGA koden offline; vakten själv är ett toppnivåskript som kör
// hela svepet vid import.
//
// ROTEN (bevisad 2026-09-19T05:17–05:20Z, rapport
// data/vakten/granssnitt-2026-09-19T0520.json): under det halvtrasiga
// .next-fönstret (OOM-serien 03:19–05:44Z) serverade pm2 gamla HTML-skal
// (200) medan ALLA statiska tillgångar svarade 500. Vaktens bas-koll mätte
// ENDAST bassidans HTTP-kod ⇒ "frisk bas" ⇒ ~21 sidor × 4 kombinationer
// dömdes som ÄKTA gränsnittsfynd ("stil-lös sida (CSS ej laddad)" med
// chunk-500 i konsolen + http 500 på /studio + /admin) ⇒ exit 1 ⇒
// FYND-larm med 100+ skenfynd till molnagenten under en redan dokumenterad
// driftincident. Två botemeddel, samma doktrin som döda-länkar-verktyget
// fick i o55 (mätfönster-grind FÖRE + drift-tak EFTER):
//   1. TILLGÅNGSHÄLSA i basen — HTML 200 räcker inte; basens första
//      CSS-tillgång måste OCKSÅ svara 200 (börAvstaMätning).
//   2. DRIFT-TAK EFTER svepet — dominerar infra-klassen (5xx/stil-lös/
//      delresurs/nätbrott) över tröskeln OCH tilräckligt många OLIKA
//      sidor är hela svepet en artefakt, inte ett fyndregister
//      (driftVerdiktor). Sidglovet skyddar ÄKTA enstaka siddefekter:
//      en trasig sida (4 kombinationer) når aldrig 3 olika sidor.

export const DRIFT_TAK_PROCENT_STANDARD = 30;
export const DRIFT_MIN_SIDOR_STANDARD = 3;

/**
 * Första CSS-länken i ett Next-HTML-dokument.
 * Next emitterar <link rel="stylesheet" href="/_next/static/chunks/<hash>.css" …>;
 * vi returnerar href-värdet (relativt eller absolut) eller null när dokumentet
 * saknar CSS-länkar (kallas aldrig blockerande — taket efter svepet fångar
 * verklig trasighet även utan markören).
 */
export function urlForstaCss(html) {
  if (typeof html !== "string" || !html) return null;
  const m = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css[^"]*)"/);
  if (m) return m[1];
  const m2 = html.match(/<link[^>]+href="([^"]+\.css[^"]*)"[^>]+rel="stylesheet"/);
  return m2 ? m2[1] : null;
}

/**
 * Är denna mätstatus i INFRA-klassen (drift), inte en gränsnittsdefekt?
 * Statusordförrålet kommer ur granssnittsvakt.mjs faktiska grenar:
 *   "http 500 (serverfel)" · "http 5xx (serverfel efter deploy)" ·
 *   "stil-lös sida (CSS ej laddad)" · "http 500 … + stil-lös" ·
 *   "delresurs-fel kvar efter deploy" · "icke-sida (json 500)" ·
 *   "fel: … net::ERR_…/ERR_CONNECTION_REFUSED"
 * ÄKTA klasser ("ok", kontrast/överflöd/klippt via felAntal, "icke-sida
 * (429/json 2xx)", sidspecifika "fel: Timeout …") är INTE infra.
 */
export function ärInfraStatus(status) {
  if (typeof status !== "string" || !status) return false;
  if (/^http 5\d\d/.test(status)) return true;
  if (status.includes("stil-lös")) return true;
  if (status.includes("delresurs-fel")) return true;
  if (/icke-sida \(json 5\d\d/.test(status)) return true;
  if (/net::ERR_|ERR_CONNECTION|ECONNREFUSED/.test(status)) return true;
  return false;
}

/**
 * Pre-gate-dom: ska mätningen stå över? basSida/basCss är HTTP-koder
 * (number; 0 = hämtningen kastade), basCss = null när bas-HTML:en saknar
 * CSS-länk (ej blockerande — saknad markör dömer aldrig). Returnerar
 * {avsta, orsak} — orsak är tom sträng när mätning får ske.
 */
export function börAvstaMätning({ lasUpptagen, basSida, basCss }) {
  if (lasUpptagen) return { avsta: true, orsak: "deploylås upptaget" };
  if (typeof basSida !== "number" || basSida !== 200) {
    return { avsta: true, orsak: `bassidan svarar ${basSida ?? "?"}` };
  }
  if (basCss === null || typeof basCss === "undefined") {
    return { avsta: false, orsak: "" }; // ingen CSS-markör i basen — mät, taket vaktar
  }
  if (basCss === 0) return { avsta: true, orsak: "basens CSS kunde inte hämtas" };
  if (basCss !== 200) {
    return { avsta: true, orsak: `basens CSS svarar ${basCss} (tillgångslagret sjukt)` };
  }
  return { avsta: false, orsak: "" };
}

/**
 * Tak-dom EFTER svepet: dominerar infra-klassen kombinationerna över
 * takProcent (%) på minst minSidor OLIKA sidor ⇒ hela svepet är en
 * driftartefakt (mätvärden kasserade, inga fynd). Returnerar
 * {drift, andel, infra, total, sidor} med andel avrundad till en decimal.
 */
export function driftVerdiktor({ kombinationer, takProcent = DRIFT_TAK_PROCENT_STANDARD, minSidor = DRIFT_MIN_SIDOR_STANDARD }) {
  const total = Array.isArray(kombinationer) ? kombinationer.length : 0;
  const infraKombos = (Array.isArray(kombinationer) ? kombinationer : []).filter((k) => ärInfraStatus(k && k.status));
  const sidor = new Set(infraKombos.map((k) => String((k && k.sida) || "").split("·")[0]));
  const andel = total === 0 ? 0 : Math.round((infraKombos.length / total) * 1000) / 10;
  const drift = infraKombos.length > 0 && andel >= takProcent && sidor.size >= minSidor;
  return { drift, andel, infra: infraKombos.length, total, sidor: sidor.size };
}
