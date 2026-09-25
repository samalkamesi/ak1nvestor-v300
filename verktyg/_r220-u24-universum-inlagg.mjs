#!/usr/bin/env node
/**
 * _r220-u24-universum-inlagg.mjs — v173 dataset-djup rond 220 U24 (+1):
 * Astellas Pharma 4503.T (Japan/halso 2→3) — OMPRÖVNINGEN LEVERERAD:
 * U17 avvisade Astellas pa P/E-bärarkriteriet (TTM-mätvärde −47 mdr JPY);
 * dagens färskpanel (S&P, uppdaterad 2026-09-24) bär TTM-netto +364,9 mdr JPY
 * med HEL FY-serien positiv [124,1 · 98,7 · 17,0 · 50,7 · 291,5] — vändningen
 * konfirmerad, mätvärdet supersederat (dokumenterat). Cellens tredje modell:
 * Takeda (global diversifierad) · Daiichi Sankyo (onkologi-EU-sprint) ·
 * Astellas (specialty-vändningen: patentklippurdalen FY24 → FY26-rekord).
 * Källans FCF-serie kapex-dragen och intern LÅST (OCF − capex exakt alla fem
 * fönster — HEI-klassen). P/E-bärarkontroll FÖRE leverans GRÖN.
 * Kvitto: /tmp/r220-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "4503.T" || /astellas/i.test(b.namn ?? ""))) {
  console.error("ABORT: 4503.T finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 2359, aktierMdr: 1790, mcap: 4230, eps: 203.04, peKalla: 11.62,
  pb: 2.18, evEbitReplik: 9.69, psKalla: 1.86,
  roe: 0.213, roic: 0.1618, wacc: 0.0434, ebitM: 0.2079, bruttoM: 0.8082,
  nettoTtm: 364.941, revTtm: 2274.365, fcfTtm: 534.297,
  skuld: 589.87, ek: 1940, kassa: 244.70, evKalla: 4580, de: 0.30, rantaTackning: 41.87,
  div: 80.00,
  omsSerie: [1518.619, 1603.672, 1912.323, 2139.245],   // mdr JPY, mars-slut FY2023–FY2026 (märkta slutåret)
  resSerie: [98.714, 17.045, 50.747, 291.535],
  fcfSerie: [291.326, 134.419, 157.509, 502.465],
  ocfSerie: [327.767, 172.475, 194.512, 560.188], ocfTtm: 591.827,
  capexSerie: [36.441, 38.056, 37.003, 57.723], capexTtm: 57.530,
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  peLock: K.pris / K.eps,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  epsIdentitet: (K.eps * K.aktierMdr) / 1000,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02],
  ["pe mot källrad", R.peLock, K.peKalla, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.1605, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.2349, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["EPS×aktier=netto", R.epsIdentitet, K.nettoTtm, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, K.fcfTtm]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (underlag S&P Global Market Intelligence via StockAnalysis; intradag 2026-09-25 — öppning 2 389 · föregående close 2 359 · dagsspann 2 379–2 413; källans P/E-rad låser mot close-kursen; färshämtning direkt med cache-bypass + FYRA paneler (quote/statistics/financials/cash-flow); APRIL–MARS-bokslut, serien märkt räkenskapsårets SLUTÅR): " +
  "pris 2 359 JPY (beta 0,09 — lägst i vågen), mcap 4 230 mdr JPY på 1,79 mdr aktier (replik 1,79 × 2 359 = 4 222,6 — 0,2 %), " +
  "OMPRÖVNINGSDOKUMENTATIONEN (rond 220, U17:s avvisning): U17 mätte TTM-netto −47 mdr JPY och avvisade på Sony/Honda-doktrinen; DAGENS FÄRSKPANEL (S&P uppdaterad 2026-09-24) bär TTM-netto +364,9 mdr JPY (+347 %) med HELA FY-serien positiv [124,1 · 98,7 · 17,0 · 50,7 · 291,5 mdr] — något negativt fönster finns ej i panelen ⇒ U17:s mätvärde bokförs som SUPERSIDERAT av källpanelens uppdatering (ärlighetsprincipen: avvisningen var korrekt mot sitt underlag; leveransen är korrekt mot sitt), " +
  "P/E 11,62 källans rad EXAKT mot close-basen (2 359/203,04 = 11,62 — 0,01 %) · fwd P/E 11,37 (marknadens implied EPS +2,2 % — referens; prognosTillväxt NULL: ingen explicit prognosrad i panelutdraget, basblandning vägras) · P/B 2,18 EXAKT (4 230/1 940 — 0,02 %) · PS 1,86 EXAKT · EPS×AKTIER-IDENTITETEN 203,04 × 1,79 = 363,4 ≈ netto 364,9 (0,4 %), " +
  "EV-DEKOMPOSITIONEN REN (vågens enda): 4 230 + 589,87 − 244,70 = 4 575,2 vs källans EV 4 580 — 0,1 %, inga dolda poster; EV/EBIT 9,69 (replik 4 580/472,87); " +
  "FCF-SERIEN INTERN LÅST (HEI-klassen): OCF − capex = FCF EXAKT samtliga fem fönster (FY23 327,8−36,4 = 291,3 ✓ · FY24 172,5−38,1 = 134,4 ✓ · FY25 194,5−37,0 = 157,5 ✓ · FY26 560,2−57,7 = 502,5 ✓ · TTM 591,8−57,5 = 534,3 ✓); FCF-marginal 23,49 % EXAKT (534,3/2 274,4) · FCF-yield 12,63 % (534,3/4 230) · FCF/aktie 297,27 källrad; " +
  "VÄNDNINGEN KONFIRMERAD (datafakta, ingen prognos): netto [98,7 · 17,0 · 50,7 · 291,5] — patentklippurdalen FY2024 (Xtandi-era) och återhämtningen till FY26-rekord; rak 3-årig CAGR FY23→FY26 oms +12,10 % · netto +43,45 %; omsättningstillväxt TTM +16,93 %; EPS-serien [54,09 · 9,47 · 28,24 · 162,22]; " +
  "marginaler: brutto 80,8 % (farmacins immateriella struktur — cellens högsta) · EBIT 20,79 % · netto 16,05 % EXAKT (364,9/2 274,4) med NORMAL ordning (netto < EBIT — ingen engångspostsignatur, Kirin-U3-fallets koll gjord); CF-panelens netto-rad FY26 376,6 mot IS-panelens 291,5 = minoritetsgap 85 mdr (TTM-fönstret sammanfaller: båda 364,9) — fönsterdokumentation; " +
  "ROE 21,30 % källans rad (replik 364,9/1 940 = 18,8 % — snitt-EK-bas sannolik, noterad) · ROIC 16,18 % mot WACC 4,34 % (gap +11,8 punkter — vågens bredaste; patentmoatens avtryck) · " +
  "balans: D/E 0,30 EXAKT (589,87/1 940) · räntetäckning 41,87 · Debt/EBITDA 0,88 · Altman 2,73 (gränszon) · Piotroski 7; " +
  "utdelning 80,00 JPY/aktie (3,35 %) ⇒ senasteArMdr 143,2 med EPS-bas-payout 39,4 % (källans rad 38,29 % annat fönster, noterad); " +
  "kandidatur: OMPRÖVAD KANDIDAT enligt U17:s dokumenterade villkor — Japan/halso-cellens TREDJE modell: Takeda (4502.T, global diversifierad farmaka) · Daiichi Sankyo (4568.T, onkologi-EU-sprint) · Astellas (4503.T, specialty-vändningen); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 364,9 mdr JPY > 0) med omprövningskedjan dokumenterad; kollisionskontroll exakt-match GRÖN; Health Care ⇒ halso-cellen (28→29 bolag), Japan 26→27 (halso-grenen 2→3).";

const RAD = {
  ticker: "4503.T",
  namn: "Astellas Pharma Inc.",
  bransch: "halso",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/4503/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.1693,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.143, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbitReplik, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2023", "2024", "2025", "2026"],
    omsattning: K.omsSerie.map((x) => x * 1e9),
    resultat: K.resSerie.map((x) => x * 1e9),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e9),
  },
  notering:
    "omprövad kandidat (rond 220): U17 avvisade pa P/E-bäraren (mätvärde −47 mdr JPY); dagens färskpanel bär TTM +364,9 mdr med HEL FY-serien positiv [124,1 · 98,7 · 17,0 · 50,7 · 291,5] — vändningen konfirmerad, mätvärdet supersederat (kedjan dokumenterad i paranoid); Japan/halso 2→3: cellens tredje modell (Takeda diversifierad · Daiichi Sankyo onkologi-sprint · Astellas specialty-VÄNDNINGEN: patentklippurdalen FY24 → FY26-rekord 291,5; rak CAGR oms +12,10 % · netto +43,45 %); TYO-primär JPY, mars-slut (serien märkt slutåret); P/E 11,62 EXAKT mot close-basen; EV-DEKOMPOSITIONEN REN (0,1 % — vågens enda utan dolda poster); FCF-serien intern låst (OCF−capex exakt fem fönster, HEI-klassen) med FCF-M 23,49 % EXAKT och yield 12,63 %; brutto-M 80,8 % cellens högsta; ROIC 16,18 % mot WACC 4,34 % (gap +11,8 p — vågens bredaste, patentmoaten); netto < EBIT (Kirin-U3-kollen gjord); minoritetsgapet CF/IS FY26 85 mdr dokumenterat; payout EPS-bas 39,4 % (källrad 38,29 % annat fönster); Altman 2,73 · Piotroski 7 · beta 0,09; prognosTillväxt NULL (fwd-implied +2,2 % endast referens); rappdag 2026-10-30 INOM v172-fönstret; EK-serie saknas — serier.egetKapital tomt; alla repliker i paranoid (StockAnalysis TYO 2026-09-25)",
};

const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));

for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "4503.T") { console.error("ABORT: sista raden ≠ 4503.T"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Astellas Pharma 4503.T, Japan/halso 2→3; halso-cellen 28→${slut.filter((b) => b.bransch === "halso").length}; Japan → ${slut.filter((b) => b.land === "Japan").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (NIO LÅS): mcap ${R.mcap.toFixed(1)} (${K.mcap}) 0,2 % · P/E ${R.peLock.toFixed(2)} (${K.peKalla}) EXAKT 0,01 % · PS ${R.psReplik.toFixed(3)} (1,86) 0,02 % · P/B ${R.pbReplik.toFixed(3)} (${K.pb}) 0,02 % · EV ${R.evReplik.toFixed(1)} (${K.evKalla}) 0,1 % REN · netto-M ${(R.nettoM * 100).toFixed(2)} % (16,05) EXAKT · fcfM ${(R.fcfM * 100).toFixed(2)} % (23,49) EXAKT · D/E ${R.deReplik.toFixed(3)} (0,30) · EPS×aktier ${R.epsIdentitet.toFixed(1)} ≈ ${K.nettoTtm} 0,4 %`,
  `FCF-SERIE-IDENTITET: OCF−capex = FCF exakt i SAMTLIGA fem fönster (${fcfIdent.map(([a]) => a.toFixed(1)).join(" · ")}) — HEI-klassen`,
  `OMPRÖVNINGEN: U17:s −47 mdr-mätvärde supersederat (dagens panel: TTM +364,9, FY-serien HELT positiv) — kedjan dokumenterad`,
  `VÄNDNINGEN: netto [98,7 · 17,0 · 50,7 · 291,5] · rak CAGR oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto +${(R.resCagr3 * 100).toFixed(2)} % · ROIC-gap +11,8 p (vågens bredaste)`,
);
writeFileSync("/tmp/r220-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
