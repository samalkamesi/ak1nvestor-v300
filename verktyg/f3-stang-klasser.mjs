#!/usr/bin/env node
/**
 * F3-STÄNGNING AV DOKTRINKLASSER (rond 125, [organ:Φ]) — maskinell
 * bedömning av F3-api:s öppna fynd (+F2:s patch-kö-rad), bevis per rad:
 *
 *   KLASS D — deploy-MEDEL ("/x ej mätbar (deploybygg pågår)"): fyndradens
 *   bevisfält bär '/tmp/ak1a-deploy.lock hålls' = feljägarens EGEN flock-
 *   mätning (primärbevis, starkare än loggmatchning). o113 §driftfönster:
 *   vaktlösning kan inte mäta mitt i ett pågående bygg. Tilläggs-bevis ur
 *   prod-synk.log när deployhändelse träffar ±15 min.
 *
 *   KLASS S — självläkta ("/x övergående nätverksfel — självläkt"): eget
 *   bevisfält 'omtest OK efter 20 s' = rond 50-omtestet läkte felet.
 *
 *   KLASS G — HÖG "/godkannande → 500" (2026-09-19 08:13/08:29/08:43Z):
 *   ÄKT fel, rot KURAD av ROND 87 (commit c7e8be1d: ??-fallback + formfilter
 *   i lib/studio/godkannande.ts, blob ac447b98) och LIVE-BEVISAD av ROND 88
 *   (sond 11:03 lokal: GET 200 med 36 poster, 401 o-auth, felloggen ren).
 *   Dom: rotkurad. Fynden föll i gapet pushad-men-obebyggd-kur (push 10:28
 *   lokal → bygge 11:01 lokal). INVARIANS: verktyget vägrar stänga om något
 *   G-fynd är nyare än kur-live-tiden 09:01:27Z (då finns levande fel kvar).
 *
 *   KLASS P — patch-kö-stopp-salvan (F3 "server död vid omtest"-kaskad +
 *   F2 "ak1a = stopped"): prod-synkens patch-kö stoppar MEDVETET pm2 under
 *   byggfönstret (o48/r58-kuren: tomt .next = inga ISR-skrivare = inget
 *   race) och main():s finally garanterar återstart (o48-garantin). Fönstret
 *   läses GENERellt ur synkloggen: 'pm2 stoppad under byggfönstret' → nästa
 *   'pm2 återstartad'. Bevis 2026-09-20: stopp 09:57:25Z, återstart 10:03:30Z,
 *   jakten 09:57:53Z mitt i fönstret.
 *
 * Kontrakt: bedömningens ts = fyndets EXAKTA ts, domdTs = nu, giltig
 * domklass, idempotent per nyckel, fyndfilen orörd (o22).
 * Körs: node verktyg/f3-stang-klasser.mjs [--torr]
 */
import fs from "node:fs";

const PROD = "/home/ak1a/AK1";
const YTA = "/home/ak1a/agent/ak1";
const FYND = `${PROD}/data/vakten/feljakt-fynd.jsonl`;
const SYNK = `${PROD}/data/vakten/prod-synk.log`;
const LEDGER = `${YTA}/data/vakten/feljakt-bedomningar.jsonl`;
const torr = process.argv.includes("--torr");
const nu = new Date().toISOString();

const lasJsonl = (p) => {
  try {
    return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
};
const fynd = lasJsonl(FYND);
const bedomda = new Set(lasJsonl(LEDGER).map((b) => `${b.ts}|${b["spår"] ?? b.spar ?? ""}|${b.fynd ?? ""}`));

// deploy-/patchhändelser ur synkloggen
const deployMs = [];
const patchFonster = [];
try {
  const txt = fs.readFileSync(SYNK, "utf8");
  let re = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})Z\s+([^\\\n]+)/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const ms = Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
    if (Number.isNaN(ms)) continue;
    const vad = m[5];
    if (/NY KOD|DEPLOYAD|bygg MISSLYCKADES|bygg OOM-dödat|NEXT-LÄKEBACKUP|MÅL återarmat/.test(vad)) deployMs.push(ms);
    const stopp = /pm2 stoppad under byggfönstret/.test(vad);
    const start = /pm2 återstartad/.test(vad);
    if (stopp) patchFonster.push({ start: ms, slut: null });
    else if (start && patchFonster.length && patchFonster[patchFonster.length - 1].slut === null) patchFonster[patchFonster.length - 1].slut = ms;
  }
} catch { /* inga fönster ⇒ klass P stänger inget */ }
const iPatchFonster = (ms) => patchFonster.find((f) => ms >= f.start - 60_000 && ms <= (f.slut ?? f.start + 20 * 60_000));
const deployNara = (ms) => deployMs.find((t) => Math.abs(t - ms) <= 15 * 60 * 1000);
const iso = (ms) => new Date(ms).toISOString();

const KUR_LIVE = Date.parse("2026-09-19T09:01:27Z"); // ROND 88:s live-sond
// endast de ÄKTA HÖG-fynden (deploy-MEDEL-varianten "(deploybygg pågår)" tillhör klass D)
const gFynd = fynd.filter((f) => (f["spår"] ?? f.spar) === "F3-api" && /\/godkannande → 500$/.test(f.fynd ?? ""));
const senasteG = gFynd.map((f) => Date.parse(f.ts)).reduce((a, b) => Math.max(a, b), 0);
const gFarStangas = senasteG > 0 && senasteG <= KUR_LIVE;

const nya = [];
const r = { D: 0, S: 0, G: 0, P_f3: 0, P_f2: 0, hoppad: 0, G_nekad: gFynd.length > 0 && !gFarStangas };
for (const f of fynd) {
  const spar = f["spår"] ?? f.spar;
  const nyckel = `${f.ts}|${spar ?? ""}|${f.fynd ?? ""}`;
  if (bedomda.has(nyckel)) { r.hoppad++; continue; }
  const bevis = String(f.bevis ?? "");
  const tsMs = Date.parse(f.ts);
  const base = { ts: f.ts, domdTs: nu, "spår": spar, allvar: f.allvar, fynd: f.fynd };

  // KLASS P — patch-kö-stopp (F2 stopped-raden + F3-kaskadsalvan i fönstret)
  const fonster = (spar === "F2-process" || spar === "F3-api") && /stopped|server död vid omtest|omtest misslyckades/.test(`${f.fynd} ${bevis}`) ? iPatchFonster(tsMs) : null;
  if (fonster) {
    if (spar === "F2-process") r.P_f2++; else r.P_f3++;
    nya.push({ ...base, dom: "transient-design",
      rotorsaka: "Prod-synkens PATCH-KÖ stoppar MEDVETET pm2 under byggfönstret (o48/r58-kuren: tomt .next = inga ISR-skrivare = inget race mot nytt bygge) och main():s finally garanterar återstart (o48-garantin). Feljägarens jakt föll mitt i det designade stoppet — samtliga API-endpoints döda är stoppets väntade följd, inte ett API-fel.",
      kur: "o48/r58-kuren + o48-garantin (finally-återstart) — designat och bevakat fönster; återstarten bevisad i synkloggen.",
      bevis: `Synkloggen: 'pm2 stoppad under byggfönstret' ${iso(fonster.start)} → 'pm2 återstartad' ${fonster.slut ? iso(fonster.slut) : "(fönstret öppet)"}; fyndet ${f.ts} mitt i fönstret. Fyndbevis: "${bevis.slice(0, 100)}"`,
      lag: "1 (tidsbevis ur synkloggen) · 2 (rot: designat byggfönster) · 6 (dom med giltig klass)",
      protokoll: "rond 125 [organ:Φ] + o48/r58-kuren + o113 §driftfönster" });
    continue;
  }

  if (spar !== "F3-api") continue;

  // KLASS D — deploy-lås (feljägarens egen flock-mätning = primärbevis)
  if (/\/tmp\/ak1a-deploy\.lock hålls/.test(bevis)) {
    r.D++;
    const d = deployNara(tsMs);
    nya.push({ ...base, dom: "transient-design",
      rotorsaka: "Pågående deploybygg: feljägarens EGEN flock-mätning (/tmp/ak1a-deploy.lock hölls vid mättillfället) — npm ci + build + pm2-omstart gör appen väntat osvarande (o113 §driftfönster; doktrin o47 §2).",
      kur: "Doktrin + feljägarens rond 44-deploygrind (klassen bokförs MEDEL automatiskt när låset hålls).",
      bevis: `Fyndradens eget bevisfält: "${bevis.slice(0, 110)}"${d ? ` + synkloggens deployhändelse ${iso(d)} (Δ ${Math.round(Math.abs(d - tsMs) / 1000)} s)` : ""}`,
      lag: "1 (primärbevis i fyndraden) · 2 (rot: deployfönster) · 6 (dom med giltig klass)",
      protokoll: "rond 125 [organ:Φ] + o113 §driftfönster + rond 124-mönstret" });
    continue;
  }

  // KLASS S — självläkt
  if (/övergående nätverksfel — självläkt/.test(f.fynd ?? "")) {
    r.S++;
    nya.push({ ...base, dom: "transient-design",
      rotorsaka: "Övergående lastspik/omstartsfönster — rond 50-omtestet (20 s) läkte felet innan dom.",
      kur: "Rond 50-omtestet (doktrin); FYNN nr 2+3-vaccinen härdar klassen vid deploy-efterdyning.",
      bevis: `Fyndradens eget bevisfält: "${bevis.slice(0, 110)}"`,
      lag: "1 (omtestmätning i fyndraden) · 6 (dom med giltig klass)",
      protokoll: "rond 125 [organ:Φ] + rond 50" });
    continue;
  }

  // KLASS G — godkannande-500 (INVARANS: inget nyare än kur-live-tiden)
  if (/\/godkannande → 500/.test(f.fynd ?? "") && gFarStangas) {
    r.G++;
    nya.push({ ...base, dom: "rotkurad",
      rotorsaka: "ÄKTA fel: lib/studio/godkannande.ts kastade TypeError i lasGodkannandePoster vid saknad/felformad post — ROND 87 grävde roten och kurade (commit c7e8be1d: ??-fallback på rad 263 + formfilter). Fyndet föll i gapet PUSHAD-MEN-OBEYGGD KUR: kuren pushad 10:28 lokal men bygget landade först 11:01 lokal — jakterna 10:13/10:29/10:43 lokal mätte fortfarande gamla koden.",
      kur: "ROND 87-kur c7e8be1d LIVE-BEVISAD av ROND 88:s sond (11:03 lokal, BUILD_ID x1966Je1fB4eouYckWHNh bär blob ac447b98): authad GET 200 med 36 poster, o-auth 401, felloggen ren efter 09:07-lokal-epoken. Lärdom bokförd i DRIFTSBOKEN: live-kvitto mäts mot BUILD_ID, aldrig commit-HEAD.",
      bevis: `Invarians maskinellt verifierad av detta verktyg: SENASTE /godkannande→500-fyndet ${new Date(senasteG).toISOString()} ≤ kur-live-tid 2026-09-19T09:01:27Z (ROND 88) — inget levande fel kvar. Worklog ROND 88-rad (sondprotokollet).`,
      lag: "1 (ROND 88:s sond + denna invarians) · 2 (rot kurad i biblioteket, ej symptomet) · 6 (klassen kommer inte tillbaka — bevisat sedan 09-19)",
      protokoll: "rond 125 [organ:Φ] + ROND 87/88 (worklog) + DRIFTSBOK-notis" });
  }
}

const summering = `F3-STÄNGNING ${torr ? "(torrkörning) " : ""}klass D=${r.D} · S=${r.S} · G=${r.G}${r.G_nekad ? " (NEKAD: fynd nyare än kur-live-tid!)" : ""} · P(f3)=${r.P_f3} · P(f2)=${r.P_f2} · redan bedömda hoppade=${r.hoppad}`;
if (torr || nya.length === 0) { console.log(summering); process.exit(0); }
fs.appendFileSync(LEDGER, nya.map((b) => JSON.stringify(b)).join("\n") + "\n");
console.log(`${summering}\n${nya.length} bedömningar appendade — commit + push + prod-lage-verifiering återstår.`);
