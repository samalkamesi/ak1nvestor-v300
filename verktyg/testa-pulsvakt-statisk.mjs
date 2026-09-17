#!/usr/bin/env node
// TEST: pulsvaktens (d)-steg — statiskt kontraktstest, ren beslutslogik
// (s8-u2, 2026-09-16). Ingen IO, inga nätverk, inga flock-anrop.
// Scenarierna mappas mot incidenten 2026-09-16 10:02–10:2x (o29): HTML 200
// medan samtliga _next/static-tillgångar 500:ade, samt deployfönstrets
// transienta variant och fastlåst-deploy-eskaleringen.
// Körs: node verktyg/testa-pulsvakt-statisk.mjs → "PASS n/n" och exit 0.
import {
  begransaRefs,
  extraheraStatiskaRefs,
  statisktBeslut,
  STATISK_REF_TAK,
  SUPPRESS_VARV_TAK,
} from "./pulsvakt-statisk.mjs";

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

const FRISK = [
  { url: "/_next/static/chunks/app.css", status: 200 },
  { url: "/_next/static/chunks/main.js", status: 200 },
  { url: "/_next/static/media/font.woff2", status: 200 },
];
const INCIDENT = [
  { url: "/_next/static/chunks/0dkvqmwqb0ena.css", status: 500 },
  { url: "/_next/static/chunks/2fvnot_pbumt6.css", status: 500 },
  { url: "/_next/static/media/68d403cf9f2c68c5-s.p.woff2", status: 500 },
];

// ── grön / sida-nere pass-through ────────────────────────────────────────────
const bGron = statisktBeslut({ sidaStatus: 200, tillgangar: FRISK, deployPagar: false });
krav("S1 friska tillgångar → gron, ingen larmnivå", bGron.status === "gron" && bGron.niva === null && !bGron.raknaSomFynd);

const bNere = statisktBeslut({ sidaStatus: 502, tillgangar: [], deployPagar: false });
krav(
  "S2 sida-nere → niva null (steget (a) äger klassen, (d) duplicerar aldrig larm)",
  bNere.status === "sida-nere" && bNere.niva === null && !bNere.raknaSomFynd,
);

const bTom = statisktBeslut({ sidaStatus: 200, tillgangar: [], deployPagar: false });
krav("S3 HTML utan _next/static-refs → gron (inget att kontraktstesta)", bTom.status === "gron" && !bTom.raknaSomFynd);

// ── trasig-bygg: incidentklassen ─────────────────────────────────────────────
const bIncident = statisktBeslut({ sidaStatus: 200, tillgangar: INCIDENT, deployPagar: false });
krav(
  "S4 INCIDENTFALLET (10:02): HTML 200 + 3/3 tillgångar 500 → trasig-bygg, HÖGPRIO, räknas",
  bIncident.status === "trasig-bygg" && bIncident.niva === "hogprio" && bIncident.raknaSomFynd,
);
krav(
  "S4b larmtexten bär läkningsdoktrinen: ombygge ägt av prod-synk/kraschvakt, omstart hjälper INTE",
  bIncident.text.includes("ombygge") && bIncident.text.includes("prod-synk") && bIncident.text.includes("INTE"),
);
krav(
  "S4c larmtexten bär konkreta trasiga prov (status+url ur incidentens chunks)",
  bIncident.text.includes("500 /_next/static/chunks/0dkvqmwqb0ena.css"),
);

const bNoll = statisktBeslut({
  sidaStatus: 200,
  tillgangar: [{ url: "/_next/static/chunks/x.js", status: 0 }],
  deployPagar: false,
});
krav(
  "S5 status 0 (nätverksfel på tillgången) → trasig-bygg högprio, ej grön pass-through",
  bNoll.status === "trasig-bygg" && bNoll.niva === "hogprio",
);

const bBlandad = statisktBeslut({
  sidaStatus: 200,
  tillgangar: [...FRISK.slice(0, 2), { url: "/_next/static/chunks/borta.js", status: 404 }],
  deployPagar: false,
});
krav(
  "S6 delvis trasig (1 av 3, 404-hashrotation) → trasig-bygg (ALLA ska svara 200)",
  bBlandad.status === "trasig-bygg" && bBlandad.text.includes("1/3"),
);

// ── deploy-undertryckning (fail-safe båda riktningar) ────────────────────────
const bDeploy = statisktBeslut({ sidaStatus: 200, tillgangar: INCIDENT, deployPagar: true });
krav(
  "S7 trasig-bygg under AKTIVT deploylås → info-transient, räknas INTE som fynd",
  bDeploy.status === "supprimerad-deploy" && bDeploy.niva === "info" && !bDeploy.raknaSomFynd,
);

const bFast = statisktBeslut({
  sidaStatus: 200,
  tillgangar: INCIDENT,
  deployPagar: true,
  supprimeradeVarv: SUPPRESS_VARV_TAK - 1,
});
krav(
  `S8 undertryckt ${SUPPRESS_VARV_TAK} varv i rad (fastlåst/svältande bygg) → eskalerar högprio`,
  bFast.status === "supprimerad-fastlast" && bFast.niva === "hogprio" && bFast.raknaSomFynd,
);

const bNastFast = statisktBeslut({
  sidaStatus: 200,
  tillgangar: INCIDENT,
  deployPagar: true,
  supprimeradeVarv: SUPPRESS_VARV_TAK - 2,
});
krav(
  "S8b ett varv FÖRE taket → fortfarande info (eskalering vid exakt taket, inte före)",
  bNastFast.status === "supprimerad-deploy" && bNastFast.niva === "info",
);

const bFrigjord = statisktBeslut({
  sidaStatus: 200,
  tillgangar: INCIDENT,
  deployPagar: false,
  supprimeradeVarv: 5,
});
krav(
  "S9 låset frigjort men tillgångarna fortfarande borta → OMEDELBART högprio (10:02-fallet: OOM:at bygg släpper låset, skadan kvarstår)",
  bFrigjord.status === "trasig-bygg" && bFrigjord.niva === "hogprio",
);

// ── lös deployPagar: flock-proben betalas ENDAST vid trasig fyndbild ────────
let anrop = 0;
const sond = () => { anrop++; return false; };
statisktBeslut({ sidaStatus: 200, tillgangar: FRISK, deployPagar: sond });
krav("S10 FRISK fyndbild → lös-funktionen anropas ALDRIG (0 flock-exec per friskt varv)", anrop === 0);
statisktBeslut({ sidaStatus: 200, tillgangar: INCIDENT, deployPagar: sond });
krav("S11 trasig fyndbild → funktionen anropas EXAKT en gång", anrop === 1);

// ── ref-taket ────────────────────────────────────────────────────────────────
const manga = Array.from({ length: STATISK_REF_TAK + 40 }, (_, i) => `/_next/static/chunks/c${i}.js`);
krav(
  `S12 begransaRefs: ${STATISK_REF_TAK + 40} refs → tak ${STATISK_REF_TAK} (bounded HEAD-loop per varv)`,
  begransaRefs(manga).length === STATISK_REF_TAK && begransaRefs(manga)[0] === manga[0],
);
krav("S12b begransaRefs: null/undefined → tom lista (hämtningsfel täcks)", begransaRefs(null).length === 0);

// ── ände-till-ände: incident-HTML → refs → beslut (ren kedja, sonsuffix) ─────
const INCIDENT_HTML = `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="/_next/static/chunks/0dkvqmwqb0ena.css" data-precedence="next">
<link rel="stylesheet" href="/_next/static/chunks/2fvnot_pbumt6.css" data-precedence="next">
</head><body><script src="/_next/static/chunks/3s6nzrbk-8mnv.js" async=""></script></body></html>`;
const refsUrHtml = extraheraStatiskaRefs(INCIDENT_HTML);
const bKedja = statisktBeslut({
  sidaStatus: 200,
  tillgangar: refsUrHtml.map((url) => ({ url, status: 500 })),
  deployPagar: false,
});
krav(
  "S13 kedjan HTML→extraktion→beslut: 3 refs ur incident-HTML, alla 500 → trasig-bygg 3/3 högprio",
  bKedja.status === "trasig-bygg" && bKedja.text.includes("3/3") && bKedja.niva === "hogprio",
);

// ── rapport ─────────────────────────────────────────────────────────────────
console.log(`TESTA-PULSVAKT-STATISK: ${pass}/${pass + fel.length} PASS`);
if (fel.length) {
  console.error("FALLENDE KRAV:");
  for (const f of fel) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("ALLA KRAV GRÖNA — pulsvaktens (d)-beslutslogik: gron/sida-nere/trasig-bygg/supprimerad/fastlåst + lös deployPagar + ref-tak");
