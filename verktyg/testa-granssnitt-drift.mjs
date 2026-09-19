#!/usr/bin/env node
// SVIT: gränsnitt-drift (o86, spår 8 s8-u3 2026-09-19) — gränsnittsvaktens
// driftblindhet: tillgångshälsa i basen + drift-tak EFTER svepet.
// =============================================================================
// Körs DEN RIKTIGA koden (import av granssnitt-drift.mjs — konsol/urval-
// precedenterna) + källkontrakt på wiringen i granssnittsvakt.mjs (v168/
// revertgrid-mönstret: sviten läser källan och påstår kontrakten). Fixturerna
// är strukturellt ordagranterna ur rotfallet 2026-09-19T0520 (88 stil-lös +
// 8 http-500 på 24 sidor) och referenssvepen T2330 (äkta kontrastfynd) +
// T0014 (o81:s gröna EFTER) — REPLAY av verklig drift, inte påhittad data.
import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  urlForstaCss,
  ärInfraStatus,
  börAvstaMätning,
  driftVerdiktor,
  DRIFT_TAK_PROCENT_STANDARD,
  DRIFT_MIN_SIDOR_STANDARD,
} from "./granssnitt-drift.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fel = 0;
const KOLL = (namn, villkor, detalj = "") => {
  if (villkor) {
    pass++;
    console.log(`  PASS ${namn}`);
  } else {
    fel++;
    console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`);
  }
};

console.log("granssnitt-drift (o86): urlForstaCss");
{
  // Attributordning ordagrant ur prod-HTML 2026-09-19 (/_next/static/chunks/…)
  const htmlNext = `<!doctype html><html lang="sv"><head><meta charset="utf-8">
<link rel="preload" as="style" href="/_next/static/chunks/141v07yf1uzq3.css"/>
<link rel="stylesheet" href="/_next/static/chunks/141v07yf1uzq3.css" data-precedence="next"/>
<link rel="stylesheet" href="/_next/static/chunks/1y8-o7vbgoakh.css" data-precedence="next_static"/>
</head><body><div id="__next"></div></body></html>`;
  KOLL(
    "N1: första stylesheet-href ur Next-HTML",
    urlForstaCss(htmlNext) === "/_next/static/chunks/141v07yf1uzq3.css",
    `fick: ${urlForstaCss(htmlNext)}`,
  );
  KOLL(
    "N2: omvänd attributordning (href före rel) fångas",
    urlForstaCss('<link href="/x/y.css" rel="stylesheet"/>') === "/x/y.css",
  );
  KOLL("N3: HTML utan CSS-länk ⇒ null (ej blockerande)", urlForstaCss("<html><body>hej</body></html>") === null);
  KOLL("N4: ogiltig indata ⇒ null", urlForstaCss(undefined) === null && urlForstaCss("") === null);
}

console.log("granssnitt-drift (o86): ärInfraStatus — statusordförråd ur vaktens grenar");
{
  const infra = [
    "http 500 (serverfel)",
    "http 503 (serverfel efter deploy)",
    "stil-lös sida (CSS ej laddad)",
    "http 500 (serverfel) + stil-lös",
    "delresurs-fel kvar efter deploy",
    "icke-sida (json 500)",
    "fel: net::ERR_CONNECTION_REFUSED at http://localhost:3000/kurser",
    "fel: Error: net::ERR_FAILED",
  ];
  for (const s of infra) KOLL(`I+: "${s.slice(0, 40)}" ⇒ infra`, ärInfraStatus(s) === true);
  const akta = [
    "ok",
    "icke-sida (429 egen throttle)",
    "icke-sida (json 200)",
    "admin-flik",
    "fel: TimeoutError: Navigation timeout of 25000 ms exceeded", // sidspecifik — ÄKTA klass (T2330)
    "",
    undefined,
  ];
  for (const s of akta) KOLL(`I-: "${String(s).slice(0, 40)}" ⇒ ej infra`, ärInfraStatus(s) === false);
}

console.log("granssnitt-drift (o86): börAvstaMätning — tillgångshälsan i pre-gate");
{
  KOLL(
    "A1: deploylås upptaget ⇒ avstå (deploy-orsak)",
    (() => { const d = börAvstaMätning({ lasUpptagen: true, basSida: 200, basCss: 200 }); return d.avsta && d.orsak.startsWith("deploylås"); })(),
  );
  KOLL(
    "A2: bassida 500 ⇒ avstå",
    börAvstaMätning({ lasUpptagen: false, basSida: 500, basCss: null }).avsta === true,
  );
  KOLL(
    "A3: ROTFALLET — HTML 200 men CSS 500 ⇒ avstå (tillgångslagret)",
    (() => { const d = börAvstaMätning({ lasUpptagen: false, basSida: 200, basCss: 500 }); return d.avsta && d.orsak.includes("tillgångslagret"); })(),
  );
  KOLL(
    "A4: HTML 200 men CSS-hämtning kastade (0) ⇒ avstå",
    börAvstaMätning({ lasUpptagen: false, basSida: 200, basCss: 0 }).avsta === true,
  );
  KOLL(
    "A5: HTML 200 utan CSS-markör (null) ⇒ mät (taket vaktar)",
    börAvstaMätning({ lasUpptagen: false, basSida: 200, basCss: null }).avsta === false,
  );
  KOLL(
    "A6: HTML 200 + CSS 200 ⇒ mät",
    börAvstaMätning({ lasUpptagen: false, basSida: 200, basCss: 200 }).avsta === false,
  );
  KOLL(
    "A7: bassida 0 (hämtning kastade) ⇒ avstå",
    börAvstaMätning({ lasUpptagen: false, basSida: 0, basCss: null }).avsta === true,
  );
}

console.log("granssnitt-drift (o86): driftVerdiktor — replay av verkliga svep");
{
  // F1 — ROTFALLET T0520, sidlistan ordagrant ur rapporten (deterministisk
  // fixture — runtime-rapporten raderas av retention): 24 sidor × 4
  // kombinationer, 88 stil-lös + 8 http-500 (/studio + /admin), 184 "fel".
  const unikaT0520 = [
    "/", "/studio", "/admin", "/dataset/konsument/tyskland",
    "/blogg/5-vanliga-nyborjarmisstag-svenska-aktier",
    "/blogg/analys-h-och-m-hennes-och-mauritz-2026",
    "/blogg/analys-industrivarden-2026",
    "/blogg/analys-investor-2026",
    "/blogg/analys-np3-fastigheter-2026",
    "/blogg/analys-truecaller-2026",
    "/blogg/arr-tillvaxt-vad-atkommande-intakter-sager",
    "/blogg/branschmedianer-akm2",
    "/blogg/divergens-fundament-ot-pris",
    "/blogg/forskningslaget-grona-av-100",
    "/blogg/hur-gor-man-en-snabb-fundamental-aktieanalys",
    "/blogg/hur-raknar-man-roe",
    "/blogg/hur-vi-analyserade-volvo-cars",
    "/blogg/intaktsdiversifiering-risken-som-inte-syns-i-pe",
    "/blogg/komplett-guide-svensk-aktieanalys-2026",
    "/blogg/kvickrakningsformeln-sa-mater-du-likviditet",
    "/blogg/mr-market-psykologi-svenska-borsen",
    "/blogg/pb-tal-nar-jamfor-man-bokvarde-ratt",
    "/blogg/peg-multipeln-svagheter-2026",
    "/blogg/ps-tal-nar-ar-det-anvandbart",
  ];
  const kombosT0520 = [];
  for (const sida of unikaT0520) {
    for (let i = 0; i < 4; i++) {
      kombosT0520.push({ sida, status: sida === "/studio" || sida === "/admin" ? "http 500 (serverfel)" : "stil-lös sida (CSS ej laddad)" });
    }
  }
  const d1 = driftVerdiktor({ kombinationer: kombosT0520 });
  KOLL(
    "D1: T0520-replay ⇒ DRIFT (100 % infra, 24 sidor)",
    d1.drift && d1.andel === 100 && d1.sidor === 24 && d1.infra === 96 && d1.total === 96,
    JSON.stringify(d1),
  );

  // F2 — T2330-klassen (o81:s ÄKTA fynd): 81 ok + 66 admin-flik + 5 timeout.
  const sidorT2330 = ["/a", "/b", "/c", "/d", "/e"]; // 5 ok-sidor + admin-flikar
  const kombosT2330 = [];
  for (const s of sidorT2330) kombosT2330.push({ sida: s, status: "ok", felAntal: 2 });
  for (let i = 0; i < 66; i++) kombosT2330.push({ sida: "/admin", status: "admin-flik", felAntal: i % 3 === 0 ? 1 : 0 });
  for (const s of ["/x1", "/x2", "/x3", "/x4", "/x5"]) kombosT2330.push({ sida: s, status: "fel: TimeoutError: Navigation timeout of 25000 ms exceeded" });
  const d2 = driftVerdiktor({ kombinationer: kombosT2330 });
  KOLL(
    "D2: T2330-replay (äkta kontrastfynd + timeout) ⇒ EJ drift",
    !d2.drift && d2.infra === 0,
    JSON.stringify(d2),
  );

  // F3 — grönt svep (T0014-klassen, o81:s EFTER): 176 ok.
  const kombosGrona = Array.from({ length: 176 }, (_, i) => ({ sida: `/s${Math.floor(i / 4)}`, status: "ok" }));
  KOLL(
    "D3: grönt svep ⇒ EJ drift",
    (() => { const d = driftVerdiktor({ kombinationer: kombosGrona }); return !d.drift && d.infra === 0 && d.total === 176; })(),
  );

  // F4 — ÄKTA enstaka siddefekt: 1 sida http-500 av 24 (4,2 %) — får ALDRIG
  // kasseras av taket (det är precis så en äkta defekt ser ut på frisk bas).
  const kombosDefekt = [];
  for (let s = 0; s < 24; s++) {
    for (let i = 0; i < 4; i++) {
      kombosDefekt.push({ sida: `/s${s}`, status: s === 7 ? "http 500 (serverfel)" : "ok" });
    }
  }
  const d4 = driftVerdiktor({ kombinationer: kombosDefekt });
  KOLL("D4: en trasig sida av 24 ⇒ EJ drift (äkta fynd larmar)", !d4.drift && d4.andel < 30, JSON.stringify(d4));

  // F5 — tröskel exakt: 40 kombos, 12 infra (30,0 %) på 3 olika sidor ⇒ drift.
  const kombosGrans = [];
  for (let i = 0; i < 12; i++) kombosGrans.push({ sida: `/infra${Math.floor(i / 4)}`, status: "stil-lös sida (CSS ej laddad)" });
  for (let i = 0; i < 28; i++) kombosGrans.push({ sida: `/ok${Math.floor(i / 4)}`, status: "ok" });
  const d5 = driftVerdiktor({ kombinationer: kombosGrans });
  KOLL("D5: exakt på taket (30,0 %, 3 sidor) ⇒ drift (>= semantics)", d5.drift && d5.andel === 30, JSON.stringify(d5));

  // F6 — SNABB-lägets småsvep: 12 kombos, 8 infra men ENDAST 2 olika sidor
  // ⇒ sidglovet håller taket stängt (småsvep mäts hellre än kasseras).
  const kombosSma = [];
  for (let i = 0; i < 8; i++) kombosSma.push({ sida: `/död${Math.floor(i / 4)}`, status: "stil-lös sida (CSS ej laddad)" });
  for (let i = 0; i < 4; i++) kombosSma.push({ sida: "/levande", status: "ok" });
  const d6 = driftVerdiktor({ kombinationer: kombosSma });
  KOLL("D6: småsvep 67 % infra på 2 sidor ⇒ EJ drift (sidgolv)", !d6.drift, JSON.stringify(d6));

  // F7 — tomma/ogiltiga kombinationer ⇒ ej drift, inget kast.
  KOLL("D7: tomt svep ⇒ EJ drift", driftVerdiktor({ kombinationer: [] }).drift === false);
  KOLL("D8: ogiltig indata ⇒ EJ drift", driftVerdiktor({ kombinationer: null }).drift === false);
  // D9 — admin-flik-rader ("/admin·Flik") räknas mot SIDAN (·-split): 40
  // trasiga flikkombos = 100 % andel men ENDAST 1 unik sida ⇒ sidglovet
  // håller taket stängt (och bevisar att flikar inte blåser upp sidantalet).
  {
    const k = [];
    for (let i = 0; i < 40; i++) k.push({ sida: `/admin·Flik ${i % 10}`, status: "stil-lös sida (CSS ej laddad)" });
    const d = driftVerdiktor({ kombinationer: k });
    KOLL("D9: 40 admin-flik-kombos ⇒ 1 unik sida (·-split) ⇒ EJ drift", d.sidor === 1 && !d.drift, JSON.stringify(d));
  }

  // D10 — defaults: tak 30 %, golv 3 sidor.
  KOLL(
    "D10: standardtrösklar 30 %/3 sidor",
    DRIFT_TAK_PROCENT_STANDARD === 30 && DRIFT_MIN_SIDOR_STANDARD === 3,
  );
  // D11 — överridning: tak 90 ⇒ T0520 ligger fortfarande över (100 %) men
  // gränsfallet D5 (30 %) faller bort — överridningen ägs av anroparen.
  KOLL(
    "D11: takProcent-överridning respekteras",
    (() => {
      const grans = kombosGrans;
      return driftVerdiktor({ kombinationer: grans, takProcent: 90 }).drift === false &&
        driftVerdiktor({ kombinationer: grans, takProcent: 30 }).drift === true;
    })(),
  );
}

console.log("granssnitt-drift (o86): källkontrakt — wiringen i granssnittsvakt.mjs");
{
  const kalla = fs.readFileSync(path.join(ROT, "verktyg", "granssnittsvakt.mjs"), "utf8");
  KOLL(
    "W1: vakten importerar drift-modulen",
    kalla.includes('from "./granssnitt-drift.mjs"'),
  );
  KOLL(
    "W2: driftVerdiktor anropas i vakten (tak EFTER svep)",
    kalla.includes("driftVerdiktor({ kombinationer: rapport.kombinationer"),
  );
  KOLL(
    "W3: överridningarna GRANSSNITT_DRIFT_TAK/MIN_SIDOR finns",
    kalla.includes("GRANSSNITT_DRIFT_TAK") && kalla.includes("GRANSSNITT_DRIFT_MIN_SIDOR"),
  );
  KOLL(
    "W4: basHalsa mäter tillgången (urlForstaCss används)",
    kalla.includes("urlForstaCss(await r.text())"),
  );
  KOLL(
    "W5: nyckelordet UPPSKJUTEN bevaras i stdout (o85-wrapperns klassläsning)",
    kalla.includes("GRÄNSSNITTSVAKTEN: UPPSKJUTEN"),
  );
  KOLL(
    "W6: nyckelordet AVBRUTEN bevaras i status (o85-wrapperns klassläsning)",
    kalla.includes('"avbruten — deploy pågår"'),
  );
  KOLL(
    "W7: DRIFTARTEFAKT-rad för driftsläsaren + rapport.drift-block",
    kalla.includes("GRÄNSSNITTSVAKTEN: DRIFTARTEFAKT") && kalla.includes("rapport.drift = {"),
  );
  KOLL(
    "W8: driftartefakt nollställer fyndräknet (exit-0-doktrinen)",
    /rapport\.fel = 0; \/\/ skenfynden/.test(kalla),
  );
}

console.log(`\nSVIT granssnitt-drift: ${pass} PASS · ${fel} FAIL`);
process.exit(fel > 0 ? 1 : 0);
