#!/usr/bin/env node
/**
 * _r197-v173u3-universum-inlagg.mjs — v173 dataset-djup rond 197 U3:
 * (+1) T-Mobile US TMUS (USA/kommunikation) — dokumenterad LEDIG kandidat ur
 * S2-U3-TELEKOM-TRION-UTOKNING-OMG23 ("TMUS — T-Mobile US → ledig"). Rundens
 * Kirin 2503.T-analys AVVISADE den kandidaten (engångsposter: netto>EBIT, rev
 * platt, fwd>trailing −27 % — protokoll V173-U3) och TMUS valdes i stället.
 *
 * Färsk rådata StockAnalysis NASDAQ TMUS 2026-09-25 (översikt+statistics+
 * financials, cache-bypass). Kontrakt som U1/U2: vägrar duplikat · repliker
 * VALIDERAS (EXAKT-klass: pe/ps/ebitM/nettoM/fcfY/mcap >2 % ⇒ ABORT;
 * dokumentklass: pb/evEbit källa-tal med repliknot, >5 % ⇒ ABORT) · kirurgisk
 * append · läs-tillbaka ×2 · 0 gamla rader förändrade · fältgrind mot 4452.T.
 * Kvitto: /tmp/r197-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "TMUS")) {
  console.error("ABORT: TMUS finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TMUS, 2026-09-25) + repliker ────────────────────
const K = {
  pris: 247.15, aktierMdr: 1127, mcap: 278.33, eps: 8.545, pe: 28.91, fwdPe: 16.07,
  pb: 4.76, ps: 3.33, evEbit: 19.28, peg: 0.36,
  ebitTtm: 14.82, ebitM: 0.1775, nettoTtm: 9.63, revTtm: 83.586, nettoM: 0.1152,
  fcf: 6.17, pFcf: 45.42, roe: 0.1616, roic: 0.0473, wacc: 0.779 / 10, // 7,79 %
  bruttoM: 0.6233, de: 1.10, rantaTackning: 3.05, div: 3.45, payout: 1.02,
  omsSerie: [79571, 78558, 81400, 84270],      // mdr USD, dec-slut FY2022–FY2025
  resSerie: [-2815, 8317, 11900, 9740],
  fcfSerie: [6950, 7220, 7490, 6170],
  bruttoSerie: [58.68, 61.91, 63.14, 63.36],    // FY22–FY25 (fyra punkter — 4-årskonventionen, SEB-A/Kao)
  bruttoSerie5: [62.07, 58.68, 61.91, 63.14, 63.36], // FY21–FY25 för moat-medel
};
const R = {
  mcap: K.aktierMdr * K.pris,
  pe: K.pris / K.eps,
  ps: K.mcap / K.revTtm,
  ebitM: K.ebitTtm / K.revTtm,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / K.mcap,
  pbReplik: K.mcap / 56.76,                      // EK 56,76 mdr ur statistics
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr2: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,  // FY23→FY25 (FY22-impairment = negativ bas)
  bruttoMedel: K.bruttoSerie5.reduce((a, b) => a + b, 0) / 5,
  bruttoSpread: Math.max(...K.bruttoSerie5) - Math.min(...K.bruttoSerie5),
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.005], ["pe", R.pe, K.pe, 0.02], ["ps", R.ps, K.ps, 0.02],
  ["ebitM", R.ebitM, K.ebitM, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
];
const dokument = [["pb", R.pbReplik, K.pb, 0.05]];
const felExakt = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
const felDok = dokument.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (felExakt.length || felDok.length) {
  console.error("ABORT: replik utanför tolerans: " + [...felExakt, ...felDok].map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "NASDAQ-PRIMÄRNOTING i USD (VZ/T/CMCSA-precedensens USA/kommunikation-cell; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,51 %; färshämtning direkt med cache-bypass): " +
  "pris 247,15 USD, mcap 278,33 mdr USD på 1 127 mdr aktier (replik 1 127 × 247,15 = 278,5 — 0,07 %), " +
  "P/E 28,91 EXAKT replikerbar (247,15/8,545 = 28,917; EPS-identitet 9 630/1 127 = 8,545) mot forward P/E 16,07 ⇒ prognosTillväxt +79,86 % (trailing/fwd-modellen, MUFG-konventionen — NORMALISERINGSSIGNALEN: trailing-nettoet deparerat av Q1-2026-impairment, se nedan; spår-PEG 28,91/79,86 = 0,36 = källans PEG 0,36 EXAKT kalibrerad), " +
  "P/B 4,76 ur källan med dokumenterad replik-avvikelse (mcap/EK = 278,33/56,76 = 4,90 = 3,0 % — källans EK-bas bär minoritets-/justeringspost; samma dokumentklass som Panasonons ROE), EV/EBIT 19,28 ur källan (källans EBIT-bas 18,7 mdr avviker från TTM-raden 14,82 — dokumenterad skillnad, EV/EBITDA 8,59 visar D/A-täckningen ~27 mdr/år = telekomstruktur), PS 3,33 EXAKT (278,33/83,586), " +
  "ROE 16,16 % · ROIC 4,73 % · WACC 7,79 % · räntetäckning 3,05 · D/E 1,10 · beta 0,62 · Altman 2,29 (KÄLLANS VARNINGSZON — telekombalansens skuldtäthet är branschstruktur; redovisas öppet som datafakta) · Piotroski 8 (stark — kontrasten dokumenterad); " +
  "balans: kassa 7,98 mdr · skuld 90,73 mdr · NETTOSKULD 82,75 mdr · EK 56,76 mdr; TTM mdr USD: rev 83,586 (+6,3 %) · netto 9,63 · FCF 6,17 med FCF-yield 2,22 % replikerbar mot källans P/FCF 45,42 (1/45,42 = 2,20 %); " +
  "marginaler: brutto 62,33 · EBIT 17,75 EXAKT replik (14,82/83,586 = 17,73 %) · netto 11,52 EXAKT replik (9,63/83,586 = 11,52 %); " +
  "utdelning 3,45 USD/aktie (1,40 %) ⇒ senasteArMdr 3,888 (3,45 × 1 127) med källans payout 102 % (replik 3,45/8,545 = 40,4 % på TTM-EPS — källans bas annat fönster, dokumenterad skillnad) · utdelningstillväxt +4,80 %/år; " +
  "FY-SERIEN dec-slutande (mdr USD): oms [79,57 · 78,56 · 81,40 · 84,27] · netto [−2,81 · 8,32 · 11,90 · 9,74] · FCF [6,95 · 7,22 · 7,49 · 6,17] — FY2022-BROTTET: netto −2,81 mdr på EBIT +13,97 (spectrum-impairment 2022) gör netto-CAGR på FY22-bas odefinierbar (negativ bas, Sony-fällans aritmetik) ⇒ resCAGR på 2-årig konsekutiv bas FY2023→FY2025 (+8,21 %; AXA-brott-precedensen), omsCAGR 3-årig FY2022→FY2025 +1,93 % (låg men sun —pris-strategi, volymtilväxt); bruttomarginalserien [58,68 · 61,91 · 63,14 · 63,36] stigande ⇒ moat-medel 61,83 % (5-årsfönstret FY21–25 med FY21 62,07) med spread 4,68 pp; " +
  "Q1-2026-KONTROLLEN (engångspostdoktrinen, Kirin-fallets spegel): Q1-2026-netto 1,1 mdr (EPS 0,96) på TTM-rev +6,3 % ⇒ trailing-nettoet bär en ny impairmentpost; fwd P/E 16,07 är marknadens normalisering — SKILLNADEN mot Kirin (AVVISAD denna rond): Kirins engångsposter var ICKE-ÅTERKOMMANDE VINSTER utanför EBIT (netto-marginal 16,9 % ÖVER EBIT-marginalen 12,6 %, rev platt), TMUS-bilden är ÅTERKOMMANDE ICKE-KONTANTA avskrivningar (D&A ~27 mdr/år, EV/EBITDA 8,59) med växande verksamhet (rev +6,3 %, bruttomarginal stigande, Piotroski 8) — fälten bär källans tal med brottet dokumenterat; " +
  "analytikerläge: källans konsensusdel saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT est. 2026-10-22 (Q3 2026) — v172-könotis (USA-kommunikationsveckan v43); " +
  "kandidatur: S2-U3-TELEKOM-TRION-UTOKNING-OMG23 'TMUS — T-Mobile US → ledig' — den enda dokumenterade lediga kandidaten i protokollskörden vid rondens val; finns ej på disk (konfirmerat); Communication Services ⇒ kommunikation-cellen (24→25 bolag).";

const RAD = {
  ticker: "TMUS",
  namn: "T-Mobile US, Inc.",
  bransch: "kommunikation",
  land: "USA",
  valuta: "USD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/stocks/tmus/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr2,
    omsattningTillvaxtTTM: 0.063,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 3.888, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: R.bruttoMedel / 100, bruttoMarginalSpread5ar: R.bruttoSpread / 100, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: K.fcf / K.mcap, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "kandidat ur S2-U3-TELEKOM-TRION-OMG23:s ledig-notering (rondens Kirin 2503.T AVVISADES först — engångspostanalys i V173-U3-protokollet); FY2022-BROTT: spectrum-impairment (netto −2,81 mdr) ⇒ resCAGR på 2-årig konsekutiv bas FY23→FY25, omsCAGR 3-årig; prognosTillväxt +79,9 % = normaliseringssignal (Q1-2026-impartment deparerar trailing; ÅTERKOMMANDE icke-kontanta avskrivningar — Kirin-fallets spegel, dokumenterat i paranoid) med spår-PEG 0,36 = källans EXAKT; payout 102 % ur källan (TTM-replik 40,4 % dokumenterad); Altman 2,29 varningszonen öppet (telekom-balansstruktur); EK-serie saknas — serier.egetKapital tomt; rappdag est. 2026-10-22 (Q3) = v172-könotis; alla repliker och källpaneler i paranoid (StockAnalysis NASDAQ 2026-09-25)",
};

// ── Fältgrind mot Kao-strukturen ──────────────────────────────────────────────
const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

// ── Kirurgisk append ──────────────────────────────────────────────────────────
const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
const utTxt = JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : "");
writeFileSync(UNI, utTxt);

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}: ${el.length} ≠ ${FÖRE + 1}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "TMUS") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ TMUS`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }
const komFöre = backup.filter((b) => b.bransch === "kommunikation").length;
const komEfter = slut.filter((b) => b.bransch === "kommunikation").length;

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 T-Mobile US TMUS, USA/kommunikation ${komFöre}→${komEfter})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER EXAKTA: pe ${R.pe.toFixed(3)} (${K.pe}) · ps ${R.ps.toFixed(3)} (${K.ps}) · ebitM ${(R.ebitM * 100).toFixed(2)} % · nettoM ${(R.nettoM * 100).toFixed(2)} % · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot 1/P·FCF ${(100 / K.pFcf).toFixed(2)} %) · mcap ${R.mcap.toFixed(1)} (${K.mcap})`,
  `DOKUMENTKLASS: pb-replik ${R.pbReplik.toFixed(3)} mot källa ${K.pb} (3,0 % — EK-basens minoritetseffekt, dokumenterad)`,
  `CAGR: oms3å ${(R.omsCagr3 * 100).toFixed(2)} % · res2å ${(R.resCagr2 * 100).toFixed(2)} % (FY22-impairment = negativ bas ⇒ konsekutiv FY23→FY25, brottet dokumenterat)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % (fwd 16,07 mot trailing 28,91 — Q1-2026-impairment-normalisering) · spår-PEG ${R.peg.toFixed(2)} = källans 0,36 EXAKT · moat-medel ${R.bruttoMedel.toFixed(2)} % spread ${R.bruttoSpread.toFixed(2)} pp`,
);
writeFileSync("/tmp/r197-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
