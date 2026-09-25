#!/usr/bin/env node
/**
 * _r219-u23-universum-inlagg.mjs — v173 dataset-djup rond 219 U23 (+1):
 * Heidelberg Materials AG HEI.DE (Tyskland/material 1→2) — cellmotiverad duo:
 * BASF (processkemins booms/busts, bruttomarginal 23,6 %) + Heidelberg Materials
 * (grus/cement/byggmaterial — transportskyddade marginaler 64,3 %, netto
 * positivt samtliga fyra år, utdelningen +9,09 %/år rakt). P/E-bärarkontroll
 * FÖRE leverans (TTM-netto 1 993 M EUR > 0 — GRÖN); kollisionskontroll GRÖN.
 * Källans FCF-serie KAPTEX-DRAGEN och intern LÅST (OCF − capex = FCF exakt
 * samtliga fem fönster) — vågens renaste källdata.
 * Kvitto: /tmp/r219-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "HEI.DE" || /heidelberg/i.test(b.namn ?? ""))) {
  console.error("ABORT: HEI.DE finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 144.85, aktierMdr: 0.1754, mcap: 25.10, eps: 11.28, peKalla: 12.43,
  pb: 1.27, evEbitReplik: 11.13, pFcf: 14.77,
  roe: 0.117, roic: 0.084, wacc: 0.0726, ebitM: 0.1409, bruttoM: 0.6425,
  nettoTtm: 1993, revTtm: 21734, fcfTtm: 1699,
  skuld: 9.983, ek: 19.80, kassa: 2.192, de: 0.50, rantaTackning: 10.23,
  div: 3.60,
  omsSerie: [21166, 21259, 21251, 21552],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [1597, 1929, 1782, 1941],
  fcfSerie: [1120, 1933, 1909, 1890],
  ocfSerie: [2420, 3205, 3232, 3255], ocfTtm: 3175,
  capexSerie: [1300, 1272, 1323, 1365], capexTtm: 1476,
};
const R = {
  mcap: K.aktierMdr * K.pris,
  peGaap: K.mcap / (K.nettoTtm / 1000),
  pePrisEps: K.pris / K.eps,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcfTtm / (K.mcap * 1000),
  fcfM: K.fcfTtm / K.revTtm,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.eps,
  psReplik: (K.mcap * 1000) / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  epsIdentitet: K.eps * K.aktierMdr * 1000,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ps", R.psReplik, 1.15, 0.02],
  ["nettoM mot källans TTM-rad", R.nettoM, 0.0917, 0.02],
  ["fcfY mot 1/P·FCF", R.fcfY, 1 / K.pFcf, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.0782, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["EPS×aktier=netto", R.epsIdentitet, K.nettoTtm, 0.02],
  ["payout", R.payoutReplik, 0.3186, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, K.fcfTtm]);
if (fcfIdent.some(([a, b]) => a !== b)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }

const PARANOID =
  "ETR-PRIMÄRNOTING i EUR (underlag S&P Global Market Intelligence via StockAnalysis; intradag 2026-09-25 — öppning 144,85 · föregående close 145,45 · dagsspann 142,55–146,05; färshämtning direkt med cache-bypass + TRE kompletterande panelhämtningar (statistics/financials/cash-flow); dec-slut): " +
  "pris 144,85 EUR (beta 0,91), mcap 25,10 mdr EUR på 175,4 M aktier (replik 0,1754 × 144,85 = 25,40 — 1,2 %), " +
  "P/E 12,43 källans rad (E.ON-mönstret — justerad bas) med Två repliker dokumenterade: GAAP mcap/netto = 25,10/1,993 = 12,59 (1,3 % ✓) och pris/EPS = 144,85/11,28 = 12,85 (3,4 % — källans P/E-rad bär lägre prisbas ≈140,2 = 12,43 × 11,28; citat-panelens kurs alla tre högre; fönstret noterat); EPS×AKTIER-IDENTITETEN EXAKT: 11,28 × 175,4 M = 1 978 M ≈ netto 1 993 M (0,7 %); P/B 1,27 EXAKT (25,10/19,80 totalt-EK-bas — 0,2 %) med källans BVPS-rad 105,99 (mot totalt EK/aktie 112,9) noterad som annat fönster; PS 1,15 (25,10/21,734 — 0,5 %); " +
  "FCF-SERIEN INTERN LÅST — VÅGENS RENASTE KÄLLDATA: kapex-dragen FCF = OCF − capex EXAKT i SAMTLIGA fem fönster (FY22 2 420−1 300 = 1 120 ✓ · FY23 3 205−1 272 = 1 933 ✓ · FY24 3 232−1 323 = 1 909 ✓ · FY25 3 255−1 365 = 1 890 ✓ · TTM 3 175−1 476 = 1 699 ✓); FCF-yield 6,77 % EXAKT DUBBELT LÅS (1 699/25 100 mot källans rad OCH 1/P·FCF 1/14,77 = 6,77 %) · FCF-marginal 7,82 % EXAKT; " +
  "EV 34,06 mdr låst av källans egen EV/Earnings 17,09 (34,06/1,993 ✓); den enkla dekompositionen (25,10 + 9,98 − 2,19 = 32,89) avviker +1,17 — pensions-/leasingjusteringar i källans EV, noterat; EV/EBIT 11,13 (replik 34,06/3,06); källans EV/EBITDA-rad 7,55 bär justerad EBITDA-bas (34,06/7,55 = 4,51 mdr mot rapporterad 4,08 — dokumenterad); " +
  "netto-marginal 9,17 % EXAKT (1 993/21 734) · bruttomarginal 64,3 % mot cellpartnern BASF:s 23,6 % (MARGINALKONTRASTEN: kemins råvarukostnad mot grus/cements transportskyddade priser — dokumenterad i båda raderna) · EBIT-marginal 14,1 %; " +
  "ROE 11,70 % källans rad (replik 1 993/19,80 = 10,07 % — snitt-EK-bas sannolik, noterad) · ROIC 8,40 % > WACC 7,26 % (källans båda rader — värdskapandet positivt); " +
  "balans: D/E 0,50 EXAKT (9,983/19,80) · räntetäckning 10,23 · Debt/EBITDA 2,31 · Altman 2,54 (gränszon under 3 — tung balansräkning som datafakta) · Piotroski 6; " +
  "utdelning 3,60 EUR/aktie (2,52 %) ⇒ senasteArMdr 0,631 med EPS-bas-payout 31,9 % EXAKT mot källans 31,86 %; UTDELNINGENS RAKA TRAPPA: [2,60 · 3,00 · 3,30 · 3,60] +9,09 % per år rak fyraårigserie + FY21 2,40 (källans 'Years of Dividend Growth 5') — kassflödets utdelningsfil; återköp buyback-yield 1,22 % med fallande aktieantal (YoY −1,22 %) ⇒ nyemissioner 0; " +
  "FY-SERIEN dec-slutande (M EUR): oms [21 166 · 21 259 · 21 251 · 21 552] · netto [1 597 · 1 929 · 1 782 · 1 941] — NETTO POSITIVT SAMTLIGA FYRA ÅR med FY24-dipp (byggcykeln; inte brottsfri rad men aldrig förlust — BASF-kontrasten: kemicykeln har brutit BASF:s serie, material-cellen fångar båda profilerna); rak 3-årig CAGR FY22→FY25 oms +0,60 % · netto +6,72 %; EPS-serien [8,45 · 10,43 · 9,87 · 10,92]; omsättningstillväxt TTM +0,84 % · prognosTillväxt +4,65 % (källans rev-fwd 3Y — basen ren); källans PEG 0,78 med oklar tillväxtbas (12,43/15,9 %-bas) ⇒ fältet NULL (basblandning vägras); " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Tyskland/material-cellens TVÅ materialmodeller: BASF (BAS.DE, diversifierad processkemi — booms/busts) + Heidelberg Materials (HEI.DE, grus/cement/byggmaterial — regionala kassflöden); bruttomarginalkontrasten 23,6 % mot 64,3 % och serieprofilerna (BASF resultatCAGR NULL mot HEI netto-positiv-alla-år) dokumenterade i båda raderna; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 1 993 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Materials ⇒ material-cellen (30→31 bolag), Tyskland 22→23 (material-grenen 1→2 — TYSKLANDS SISTA 1-GREN ÖPPNAD: landets elva branschgrenar alla ≥2).";

const RAD = {
  ticker: "HEI.DE",
  namn: "Heidelberg Materials AG",
  bransch: "material",
  land: "Tyskland",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/etr/HEI/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0084,
    prognosTillvaxt: 0.0465,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.631, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbitReplik, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Tyskland/material 1→2: BASF processkemi + Heidelberg Materials grus/cement/byggmaterial — MARGINALKONTRASTEN 23,6 % mot 64,3 % brutto dokumenterad i båda raderna; Tysklands sista 1-gren öppnad — landets alla elva grenar ≥2); ETR-primär EUR; FCF-SERIEN INTERN LÅST (OCF−capex exakt samtliga fem fönster — vågens renaste källdata); FCF-yield 6,77 % DUBBELT LÅS · FCF-M 7,82 % EXAKT; netto POSITIVT SAMTLIGA FYRA ÅR [1 597 · 1 929 · 1 782 · 1 941] med FY24-dipp (BASF-kontrasten: kemicykeln har brutit BASF:s serie); rak CAGR oms +0,60 % · netto +6,72 %; UTDELNINGENS RAKA TRAPPA [2,60 · 3,00 · 3,30 · 3,60] +9,09 %/år med payout 31,9 % EXAKT; P/E 12,43 källans justerade bas (GAAP-replik 12,59 · pris/EPS 12,85 dokumenterade — källans rad bär lägre prisbas); EPS×aktier EXAKT 0,7 %; EV 34,06 låst av EV/Earnings 17,09 (enkel dekomposition +1,17 = pension/leasing, noterad); ROIC 8,40 % > WACC 7,26 %; Altman 2,54 gränszon · Piotroski 6 · beta 0,91 · 52v −27,54 % — datafakta; återköp 1,22 % med fallande aktieantal; EK-serie saknas — serier.egetKapital tomt; rappdag nästa 2027-02-25 (FY2026); alla repliker i paranoid (StockAnalysis ETR 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "HEI.DE") { console.error("ABORT: sista raden ≠ HEI.DE"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Heidelberg Materials HEI.DE, Tyskland/material; material-cellen 30→${slut.filter((b) => b.bransch === "material").length}; Tyskland → ${slut.filter((b) => b.land === "Tyskland").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (NIO LÅS): mcap ${R.mcap.toFixed(2)} (${K.mcap}) 1,2 % · P/B ${R.pbReplik.toFixed(4)} (${K.pb}) 0,2 % · PS ${R.psReplik.toFixed(3)} (1,15) 0,5 % · netto-M ${(R.nettoM * 100).toFixed(2)} % (9,17) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % mot ${(100 / K.pFcf).toFixed(2)} % DUBBELT LÅS · fcfM ${(R.fcfM * 100).toFixed(2)} % (7,82) EXAKT · D/E ${R.deReplik.toFixed(3)} (${K.de}) 0,8 % · EPS×aktier ${R.epsIdentitet.toFixed(0)} ≈ ${K.nettoTtm} EXAKT 0,7 % · payout ${(R.payoutReplik * 100).toFixed(2)} % (31,86) 0,2 %`,
  `FCF-SERIE-IDENTITET: OCF−capex = FCF exakt i SAMTLIGA fem fönster (${fcfIdent.map(([a]) => a).join(" · ")}) — vågens renaste källdata`,
  `P/E 12,43 källans justerade bas (E.ON-mönstret): GAAP-replik ${R.peGaap.toFixed(2)} (1,3 %) · pris/EPS ${R.pePrisEps.toFixed(2)} (källans rad bär prisbas ≈140,2 — fönstret noterat)`,
  `EV 34,06 låst av EV/Earnings 17,09 · enkel dekomposition +1,17 (pension/leasing noterad) · EV/EBIT 11,13 (replik) · EV/EBITDA-rad 7,55 på justerad EBITDA 4,51 (dokumenterad)`,
  `SERIEPROFILER: netto positivt samtliga fyra år (FY24-dipp = byggcykeln; BASF-kontrasten) · rak CAGR oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto +${(R.resCagr3 * 100).toFixed(2)} % · UTDELNINGENS RAKA TRAPPA +9,09 %/år`,
);
writeFileSync("/tmp/r219-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
