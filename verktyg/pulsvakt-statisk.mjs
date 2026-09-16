// pulsvakt-statisk.mjs — pulsvaktens FJÄRDE sinne: statiskt kontraktstest
// (spår 8, s8-u2, 2026-09-16 — svar på o29 §6 bokning 2: pulsvakten/larmvägen).
//
// BAKGRUND (incidenten 2026-09-16 10:02–10:2x UTC, bevisad av s8-u1 omg 5):
// prod-synkens bygg OOM-dödades mitt i .next-omskrivningen → .next/static
// TOM medan körande pm2 levererade HTML ur minne/ISR → ALLA _next/static =
// 500, kundsynligt ostylat i 20+ min, och pulsvakten var GRÖN hela vägen —
// (a) GET / = 200 och (b) /api/sok = 200 säger inget om de TILLGÅNGAR
// HTML:en refererar. Detta stänger den blindheten: HTML:en är kontraktet
// (statisk-sondens §4-princip) — varje _next/static-ref SKA svara 200.
//
// REN LOGIK I EGEN MODUL (granssnitt-konsol-mönstret): pulsvakt.mjs är ett
// toppnivå-daemonskript vars entré STARTAR den eviga loopen vid import —
// beslutsfunktionen bor därför här så verktyg/testa-pulsvakt-statisk.mjs
// kan testa DEN RIKTIGA koden offline utan att starta vakten.
//
// DOKTRIN (viktigt, skrivet efter incidenten): trasig-bygg triggar ALDRIG
// pm2-omstart. Omstart förlorar den cachade HTML:en (det sista som fungerar)
// och lagar inget — tillgångarna är BORTA från disken. Läkning = ombygge
// under deploylåset, som prod-synken/kraschvakten äger. Vakten SIGNALERAR.
//
// Transient-undertryckning (våg 142 + o29 §3:s fail-safe, samma princip):
// under AKTIVT deploylås (flock /tmp/ak1a-deploy.lock hålls) skrivs .next
// om medan gamla pm2 serverar → kortvariga 500 är VÄNTADE och ska inte
// larma. Undertrycket har ett TAK: fastlåst/svältande bygg som aldrig
// landar är i sig ett incidenttillstånd (RAM-grynnan 10:17–10:4x) → efter
// SUPPRESS_VARV_TAK varv eskaleras till högprio ändå.

import { bedom, extraheraStatiskaRefs } from "./statisk-sond.mjs";

// Återexport: pulsvakten + testerna importerar allt (d)-relaterat från ETT ställe.
export { extraheraStatiskaRefs };

/** Tak på antal HEAD-kontrollerade refs per varv (incidenten bar 25;
 *  stora sidor ~50–80 — dedupe sker i extraheraStatiskaRefs). */
export const STATISK_REF_TAK = 80;

/** Undertryckta varv under deploylås innan eskalering (≈ 30 min med 60 s/varv). */
export const SUPPRESS_VARV_TAK = 30;

/** Begränsa refs-listan (daemonhämtningen tillämpar detta före HEAD-loop). */
export function begransaRefs(refs, tak = STATISK_REF_TAK) {
  return (refs || []).slice(0, tak);
}

/** Beslut för pulsvaktens (d)-steg.
 *  IN:  sidaStatus (HTML:ens statuskod), tillgangar [{url,status}],
 *       deployPagar — boolean ELLER lös-funktion; funktionen anropas ENDAST
 *       när fyndbilden är trasig-bygg (friska varv ska aldrig betala ett
 *       flock-exec), supprimeradeVarv — tidigare varv i rad under lås.
 *  UT:  { status, niva, text, raknaSomFynd }
 *       status: gron | sida-nere | supprimerad-deploy | supprimerad-fastlast | trasig-bygg
 *       niva:    null (ingen åtgärd) | info | hogprio
 *       raknaSomFynd: sant endast för tillstånd som (d)-steget ska larma om.
 */
export function statisktBeslut({ sidaStatus, tillgangar, deployPagar = false, supprimeradeVarv = 0 }) {
  const dom = bedom({ sidaStatus, tillgangar });

  if (dom.status === "gron") {
    return { status: "gron", niva: null, text: dom.orsak, raknaSomFynd: false };
  }

  if (dom.status === "sida-nere") {
    // (a) framsidekontrollen äger klassen (dess felräkning + omstart-logik) —
    // (d) duplicerar aldrig larm för en nere-sida.
    return { status: "sida-nere", niva: null, text: dom.orsak, raknaSomFynd: false };
  }

  // ── trasig-bygg: deploy-undertryckning eller högprio-signal ─────────────
  const prov = dom.trasiga.slice(0, 3).map((t) => `${t.status} ${t.url}`).join(" · ");
  const lage = `${dom.trasiga.length}/${tillgangar.length} statiska tillgångar fel (${prov})`;
  const deploy =
    typeof deployPagar === "function" ? Boolean(deployPagar()) : Boolean(deployPagar);

  if (deploy) {
    if (supprimeradeVarv + 1 >= SUPPRESS_VARV_TAK) {
      return {
        status: "supprimerad-fastlast",
        niva: "hogprio",
        text:
          `trasig-bygg undertryckt ${supprimeradeVarv + 1} varv i rad under deploylås — ` +
          `fastlåst/svältande bygg? ${lage}; lagning = ombygge (prod-synk/kraschvakt äger)`,
        raknaSomFynd: true,
      };
    }
    return {
      status: "supprimerad-deploy",
      niva: "info",
      text: `trasig-bygg men deploy pågår (ak1a-deploy.lock hålls) — transient, avvaktar; ${lage}`,
      raknaSomFynd: false,
    };
  }

  return {
    status: "trasig-bygg",
    niva: "hogprio",
    text:
      `HTML 200 men ${lage} — kundsynligt ostylat; LAGNING = ombygge under ` +
      `deploylåset (prod-synk/kraschvakt äger); pm2-omstart hjälper INTE`,
    raknaSomFynd: true,
  };
}
