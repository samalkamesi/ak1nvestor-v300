#!/usr/bin/env node
/**
 * _r196-v173u2-universum-inlagg.mjs — v173 dataset-djup rond 196 U2 (+1 bolag):
 * Panasonic Holdings 6752.T (Japan/teknik — cellen har bara 8035.T) — kandidatur
 * dokumenterad i S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md ("sektorn Technology
 * i källan ⇒ hade landat i Japan/teknik"); färsk rådata StockAnalysis TYO
 * 2026-09-25 (översikt+statistics+financials, cache-bypass, direkt färsk).
 *
 * Kontrakt (U1-_r195-mönstret): vägrar duplikat · repliker beräknas och
 * VALIDERAS mot källvärdena (avvikelse > 2 % ⇒ ABORT; P/B via mcap/EK) ·
 * kirurgisk append med filens indent · läs-tillbaka ×2 · 0 gamla rader
 * förändrade · fältstrukturgrind mot 4452.T.
 * Kvitto: /tmp/r196-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "6752.T")) {
  console.error("ABORT: 6752.T finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TYO 6752, 2026-09-25 09:46 JST) + repliker ──────
const K = {
  pris: 4517.0, aktierMdr: 2.33, mcap: 10530, eps: 108.45, pe: 41.57, fwdPe: 20.29,
  ekMdr: 5570, pb: 1.89, ps: 1.29, ebitTtm: 553.016, ebitM: 0.0677,
  nettoTtm: 253.247, revTtm: 8170.945, nettoM: 0.0310, fcf: 236.972, fcfY: 0.0225,
  skuld: 1553.993, de: 0.28, roe: 0.0525, roic: 0.0680, roce: 0.0749,
  bruttoM: 0.3180, fcfM: 0.0290, div: 54.0, omsTtm: -0.0076,
  omsSerie: [7388791, 8378942, 8496420, 8458185, 8048722],   // mdr JPY, mars-slut FY2022–FY2026
  resSerie: [255323, 265493, 443978, 366193, 189537],
  fcfSerie: [18663, 231389, 319428, 23751, 1334],
  bruttoSerie: [28.21, 27.00, 29.39, 31.34, 31.51],          // %
};
const R = {
  mcap: K.aktierMdr * K.pris,
  pe: K.pris / K.eps,
  pb: K.mcap / K.ekMdr,                                     // källans P/B-bas: mcap/EK (BVPS-raden bär vägt tal)
  ps: K.mcap / K.revTtm,
  ebitM: K.ebitTtm / K.revTtm,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / K.mcap,
  de: K.skuld / K.ekMdr,
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),                 // spår-PEG (Kao-konventionen)
  omsCagr4: Math.pow(K.omsSerie[4] / K.omsSerie[0], 1 / 4) - 1,
  resCagr4: Math.pow(K.resSerie[4] / K.resSerie[0], 1 / 4) - 1,
  bruttoMedel: K.bruttoSerie.reduce((a, b) => a + b, 0) / 5,
  bruttoSpread: Math.max(...K.bruttoSerie) - Math.min(...K.bruttoSerie),
};
const avv = (a, b) => Math.abs(a / b - 1);
const kontroller = [
  ["mcap", R.mcap, K.mcap, 0.005], ["pe", R.pe, K.pe, 0.02], ["pb", R.pb, K.pb, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["ebitM", R.ebitM, K.ebitM, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["fcfY", R.fcfY, K.fcfY, 0.02], ["de", R.de, K.de, 0.02],
];
const fel = kontroller.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (8035.T/8306.T/4452.T-precedensen; underlag S&P Global Market Intelligence + Financial Modeling Prep via StockAnalysis; intradag 2026-09-25 09:46 JST delayed +0,20 %; färshämtning direkt med cache-bypass): " +
  "pris 4 517,00 JPY (prev close 4 508; day range 4 435–4 525; 52v 1 553–4 982 med +178,36 % på 52 veckor — AI/datacenter-rally), mcap 10,53 T JPY på 2,33 mdr aktier (replik 2,33 × 4 517 = 10 525 — 0,05 % ✓; aktiebasen +0,00 % YoY = inga nyemissioner), " +
  "P/E 41,57 (aktiebasreplik 4 517/108,45 = 41,65 = 0,2 % spridning; EPS-identitet 108,45 × 2,33 = 252,7 mdr mot TTM-netto 253,2 ✓ 0,2 %) mot forward P/E 20,29 ⇒ prognosTillväxt +104,98 % (trailing/fwd-modellen, MUFG-konventionen — konsensus väntar EPS nästan dubblad framåt på AI-infrastruktur/datacenter-effekt, Q1 FY2027-transkriptet bekräftar uppwards reviderade prognoser; spår-PEG 41,57/104,98 = 0,40 mot källans PEG 0,49 på 3-års som kalibreringsnot), " +
  "P/B 1,89 EXAKT replik på källans bas mcap/EK (10 530/5 570 = 1,890; BVPS-raden 2 315,33 bär vägt aktietal), EV/EBIT 19,28 (EV 11,13 T; EV-replik mcap+nettoskuld = 10,97 T — 1,5 % minority-skillnad, dokumenterad), PS 1,29 EXAKT (10 530/8 170,9), " +
  "ROE 5,25 % ur källans panel (replik netto/EK(TTM) = 253,2/5 570 = 4,55 % — källan bär annat EK-underlag, sannolikt snitt-EK; dokumenterad skillnad), ROIC 6,80 % · ROCE 7,49 % · WACC 7,99 % · räntetäckning 14,77 · D/E 0,28 EXAKT replik (1 553,99/5 570 = 0,279) · beta 0,85 · Altman 2,23 (UNDER 3 — källans egen flagga för förhöjd risk; redovisas öppet som datafakta) · Piotroski 7; " +
  "balans: kassa 1,12 T · skuld 1,55 T · NETTOSKULD 436,61 mdr (−186,99/aktie) · EK 5,57 T · WC 1,19 T; TTM JPY mdr: rev 8 170,9 (−0,76 %) · netto 253,2 (−31,0 %) · OCF 816,0 · capex −579,0 · FCF 237,0 med FCF-yield 2,25 % EXAKT replik (237/10 530) och P/FCF 44,4; " +
  "marginaler: brutto 31,80 · EBIT 6,77 EXAKT replik (553,0/8 170,9) · netto 3,10 EXAKT replik (253,2/8 170,9) · FCF 2,90 EXAKT (237,0/8 170,9); " +
  "utdelning 54,00 JPY/aktie (1,20 %) ⇒ senasteArMdr 125,8 (54 × 2,33) med källans payout 36,88 % (replik 54/108,45 = 49,8 % på TTM-EPS — källans bas annat fönster, dokumenterad) och FCF-payout 46,31 % · utdelningstillväxt −2,08 % YoY · buyback-yield −0,00 %; ex-dividendag 2026-09-29; " +
  "FY-SERIEN mars-slutande (mdr JPY): oms [7 388,8 · 8 378,9 · 8 496,4 · 8 458,2 · 8 048,7] · netto [255,3 · 265,5 · 444,0 · 366,2 · 189,5] · FCF [18,7 · 231,4 · 319,4 · 23,8 · 1,3] — STRUKTURBROTT FY2026: Automotive-segmentet DEKONSOLIDERAT (segmentraden försvinner FY26; Q4-FY26-transkriptet: 'Sales and profit declined in FY 2026 due to restructuring and Automotive deconsolidation') ⇒ FY26-dipen netto 189,5 (−48,2 %) bär engångs-/strukturposter och omsättningstillbakagången är delvis avknoppning, ej organisk — CAGR-fälten bär 4-årig HEL serie med brottet dokumenterat (oms +2,16 % · netto −7,18 %); bruttomarginalserie [28,21 · 27,00 · 29,39 · 31,34 · 31,51] ⇒ moat-medel 29,49 % med spread 4,51 pp (stadigt stigande); EK-historik per år saknas i panelerna (endast current 5,57 T) ⇒ serier.egetKapital tomt; " +
  "analytikerläge Buy · 16 st · medelmål 4 861,19 JPY (datafakta, ej rekommendation) · intäktsprognos 3 år +3,78 %; NÄSTA RAPPORT 2026-10-30 (Q2 FY2027) — v172-könotis (dagen efter Oriental Land 10-29); " +
  "kandidatur: S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20 'Panasonic 6752.T (P/E 39,53) — FALLER: sektorn Technology i källan ⇒ hade landat i Japan/teknik' — precis cellen med endast 8035.T; läget 2026-09-25 P/E 41,57 mot dokumentets 39,53 (2026-09-19) = nivåkonsekvent (veckans kursrörelse); sektorn Technology i källan ⇒ teknik-cellen (28→29 bolag i branschen, 22:a Japan-bolaget).";

const RAD = {
  ticker: "6752.T",
  namn: "Panasonic Holdings Corporation",
  bransch: "teknik",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/6752/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr4,
    resultatCAGR5ar: R.resCagr4,
    omsattningTillvaxtTTM: K.omsTtm,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcfM,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: 14.77, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 125.8, andelUtestande: 0.3688, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: R.bruttoMedel / 100, bruttoMarginalSpread5ar: R.bruttoSpread / 100, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: 19.28, peg: R.peg, fcfYield: K.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur S2-U3-OMG20-komplementet (Technology-sektorn ⇒ Japan/teknik-cellen med endast 8035.T); STRUKTURBROTT FY2026 (Automotive deconsoliderat + restrukturering): FY26-nettodipen −48 % bär engångsposter och omsättningstillbakagången är delvis avknoppning — CAGR på 4-årig hel serie med brottet dokumenterat i paranoid (oms +2,2 % · netto −7,2 %); prognosTillväxt +105 % (forward P/E 20,29 mot trailing 41,57 — konsensus väntar EPS-dubbling på AI/datacenter) ⇒ spår-PEG 0,40 (källans 0,49 kalibreringsnot); ROE 5,25 % ur källan (TTM-replik 4,55 % dokumenterad); Altman 2,23 under 3 — källans riskflagga redovisas öppet; EK-serie saknas — serier.egetKapital tomt; rapportdag 2026-10-30 (Q2 FY2027) = v172-könotis; alla repliker och källpaneler i paranoid (StockAnalysis TYO 2026-09-25)",
};

// ── Fältgrind mot Kao-strukturen (Japan-syskon) ───────────────────────────────
const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

// ── Kirurgisk append med filens eget indent ───────────────────────────────────
const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
const ut = JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : "");
writeFileSync(UNI, ut);

// ── Läs-tillbaka ×2 + per-index bitidentitet på de gamla raderna ─────────────
const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}: ${el.length} ≠ ${FÖRE + 1}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "6752.T") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ 6752.T`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }
const teknikFöre = backup.filter((b) => b.bransch === "teknik").length;
const teknikEfter = slut.filter((b) => b.bransch === "teknik").length;

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Panasonic Holdings 6752.T, Japan/teknik ${teknikFöre}→${teknikEfter})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: pe ${R.pe.toFixed(3)} (källa ${K.pe}) · pb ${R.pb.toFixed(4)} (${K.pb}, mcap/EK-bas) · ps ${R.ps.toFixed(3)} (${K.ps}) · mcap ${R.mcap.toFixed(0)} (${K.mcap}) · ebitM ${(R.ebitM * 100).toFixed(2)} % · nettoM ${(R.nettoM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % · D/E ${R.de.toFixed(3)} (${K.de}) — alla inom tolerans`,
  `CAGR: oms4å ${(R.omsCagr4 * 100).toFixed(2)} % · res4å ${(R.resCagr4 * 100).toFixed(2)} % (hel serie; FY26-strukturbrott: Automotive-deconsolidering + restrukturering dokumenterat)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % (fwd P/E 20,29 mot trailing 41,57 — EPS-dubblingskonsensus) · spår-PEG ${R.peg.toFixed(2)} (källans 0,49 kalibreringsnot) · moat-medel ${R.bruttoMedel.toFixed(2)} % spread ${R.bruttoSpread.toFixed(2)} pp`,
);
writeFileSync("/tmp/r196-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
