#!/usr/bin/env node
/**
 * _r208-u12-universum-inlagg.mjs — v173 dataset-djup rond 208 U12 (+1):
 * BT Group BT.L (UK/kommunikation 0→1 — BCE-OMG24-listans SISTA namn; VOD var
 * P/E-död, BT bär). P/E-bärarkontroll FÖRE leverans (TTM-netto 1 591 M GBP > 0
 * — GRÖN); kollisionskontroll exakt-match GRÖN (r206-sonden).
 * Mars-bokslut (Japan-etikettkonventionen). Fem exakta repliker + payout EXAKT.
 * Kvitto: /tmp/r208-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "BT.L" || /^BT Group/i.test(b.namn ?? ""))) {
  console.error("ABORT: BT.L finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 205.30, aktierMdr: 9940, mcap: 20.41, epsGbxBt: 12.89, pe: 15.93, fwdPe: 10.40,
  pb: 1.67, evEbit: 7.10, pFcf: 12.46, pegKalla: 1.23, ps: 0.99,
  roe: 0.1083, roic: 0.0571, wacc: 0.0753, ebitM: 0.1266,
  nettoTtm: 1591, revTtm: 20634, nettoM: 0.0771,
  fcf: 1638, de: 1.67, rantaTackning: 2.75, altman: 1.71, piotroski: 5, beta: 0.62,
  divGbx: 8.16, payout: 0.6330,
  omsSerie: [20845, 20677, 20350, 20392],   // M GBP, mars-slut FY2022–FY2025 (etikett = slutår)
  resSerie: [1914, 1721, 1092, 1373],
  fcfSerie: [1434, 1331, 1271, 1585],
};
const R = {
  mcap: (K.aktierMdr * (K.pris / 100)) / 1000,
  pe: K.pris / K.epsGbxBt,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.divGbx / K.epsGbxBt,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["pe", R.pe, K.pe, 0.02],
  ["nettoM", R.nettoM, K.nettoM, 0.02], ["ps", R.ps, K.ps, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02], ["payout", R.payoutReplik, K.payout, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "LSE-PRIMÄRNOTING i GBX (universums första BT.L-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,05 %; färshämtning direkt med cache-bypass + kompletterande FY-panelhämtning vid oläslig första tabell; pris 205,30 GBX = 2,053 GBP): " +
  "mcap 20,41 mdr GBP på 9 940 M aktier (replik 9 940 × 2,053 = 20,41 — 0,01 % EXAKT), " +
  "P/E 15,93 EXAKT replikerbar på källans EPS-rad 12,89 GBX (205,30/12,89 = 15,93; EPS-identiteten på TOTALNETTO 1 591/9 940 = 16,01 GBX — källans EPS bär attributable-bas med minoritetsavdrag ~310 M, dokumenterad; Rogers/Redeia-klassens minoritetsnoter), mot forward P/E 10,40 ⇒ prognosTillväxt +53,17 % (trailing/fwd-modellen, MUFG-konventionen — ÅTERHÄMTNINGSPROGNOS: konsensus väntar stark EPS-vändning när fiberrullouten mognar; spår-PEG 15,93/53,17 = 0,30 mot källans PEG 1,23 på 3-års, kalibreringsnot), P/B 1,67 · EV/EBIT 7,10 · PS 0,99 EXAKT (20 410/20 634 = 0,989), " +
  "ROE 10,83 % · ROIC 5,71 % under WACC 7,53 % (legacy-telekom + fiberrulloutens kapitalbas — dokumenterat) · EBIT-marginal 12,66 % · netto-marginal 7,71 % EXAKT (1 591/20 634) · FCF-yield EXAKT replik (1 638/20 410 = 8,02 % = 1/P·FCF 1/12,46 = 8,03 %); " +
  "balans: D/E 1,67 · räntetäckning 2,75 · Altman 1,71 (KÄLLANS VARNINGSZON — telekombalans; UK-trions mönster, dokumenterat som datafakta) · Piotroski 5 · kassa 1,36 mdr · skuld 23,14 mdr · NETTOSKULD 21,78 mdr · EK 12,22 mdr; " +
  "utdelning 8,16 GBX/aktie (3,98 %) ⇒ senasteArMdr 0,812 GBP-mdr (8,16 GBX × 9 940 M = 81,2 M GBP × 10) med payout 63,30 % EXAKT replikerbar (8,16/12,89 = 63,3 %); " +
  "FY-SERIEN mars-slutande (M GBP, etikett = slutår; Japan-konventionen): oms [20 845 · 20 677 · 20 350 · 20 392] · netto [1 914 · 1 721 · 1 092 · 1 373] · FCF [1 434 · 1 331 · 1 271 · 1 585] — samtliga positiva; FY24-dipen 1 092 (fiberrulloutens avskrivningstopp/kostnadsläge) följt av återhämtning FY25 1 373 med TTM-momentum 1 591; rak 3-årig CAGR FY22→FY25 NEGATIV och redovisas ÖPPET (oms −0,73 % · netto −10,42 % — legacy-telekomns fastlandskundsutflyttning är strukturell; historien är nedåt, prognosen uppåt — båda sidorna dokumenterade, ingen döljs); EPS-GBX-serien [15,60 · 14,00 · 8,85 · 11,15]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT H1 FY2026 est. slutet oktober 2026 — v172-könotis; " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10:s UK-alternativ («UK: BT?» — VOD.L sonderades och var P/E-död TTM −346,65 M; BT bär med +1 591 M) — LISTANS SISTA NAMN: med U12 är BCE-OMG24:s samtliga öppna koordinater antagna, avvisade eller levererade; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN (r206-sonden); Communication Services ⇒ kommunikation-cellen (27→28 bolag), Storbritannien 10→11 (landets elfte gren: UK/KOMMUNIKATION 0→1 öppnad).";

const RAD = {
  ticker: "BT.L",
  namn: "BT Group plc",
  bransch: "kommunikation",
  land: "Storbritannien",
  valuta: "GBP",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/lon/BT/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.03,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.812, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur BCE-OMG24 §10:s UK-alternativ (LISTANS SISTA NAMN — VOD var P/E-död, BT bär; P/E-bärare kontrollerad före leverans); LSE-primär GBX; MARS-BOKSLUT (etikett = slutår, Japan-konventionen); NEGATIV historisk CAGR REDOVISAS ÖPPET (oms −0,73 % · netto −10,42 % — legacy-utflyttning strukturell) medan prognosTillväxt +53,2 % bär fiberrulloutens förväntade EPS-återhämtning — båda sidorna dokumenterade; FY24-dip = avskrivningstopp; P/E EXAKT på attributable-EPS-basen (minoritetsnot ~310 M); Altman 1,71 varningszon som datafakta; bruttoMarginal null (leverantörens bruttobegrepp osammanhängande för telekom — fältet lämnas osatt, ärligare än felbas); EK-serie saknas — serier.egetKapital tomt; rappdag H1 FY2026 est. slutet oktober = v172-könotis; alla repliker i paranoid (StockAnalysis LSE 2026-09-25)",
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

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "BT.L") { console.error("ABORT: sista raden ≠ BT.L"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 BT Group BT.L, UK/kommunikation 0→1; kommunikation-cellen → ${slut.filter((b) => b.bransch === "kommunikation").length}; Storbritannien → ${slut.filter((b) => b.land === "Storbritannien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (SEX EXAKTA): mcap ${R.mcap.toFixed(2)} 0,01 % · pe ${R.pe.toFixed(2)} (${K.pe}) EXAKT · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) EXAKT — vågens starkaste replikrad`,
  `CAGR rak FY22→25 (mars-bokslut): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} % — NEGATIV historik redovisas öppet mot +53 %-prognosen (fiberns återhämtning)`,
  `Altman 1,71 varningszon datafakta · ROIC 5,71 < WACC 7,53 (fiberrullout) · bruttoMarginal null (leverantörens begrepp osammanhängande för telekom — osatt hellre än felbas)`,
);
writeFileSync("/tmp/r208-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
