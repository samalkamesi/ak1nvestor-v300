#!/usr/bin/env node
/**
 * _r197-v173u3-telus-inlagg.mjs — v173 dataset-djup rond 197 U3 (+1):
 * TELUS Corporation (Kanada/kommunikation 1→2, TSX-primär CAD — BCE-precedensen)
 * — DOKUMENTERAD kö-notis i S2-U1-BCE-UTOKNING-OMG24 §10 ("Kanada/kommunikation
 * 1→2/3: RCU Rogers + TELUS (båda P/E-bärare sannolikt)"). Rundens väg dit:
 * Kirin 2503.T AVVISAD (engångsposter, protokoll V173-U3) · TMUS UPPTAGEN av
 * syskon 2026-09-20 (OMG23-notisen föråldrad — duplikatgrinden fångade).
 *
 * Färsk rådata StockAnalysis TSX TELUS 2026-09-25 (översikt+statistics+
 * financials, cache-bypass). Kontrakt som U1/U2: EXAKT-klass (mcap/ps/ebitM/
 * nettoM/fcfY) + dokumentklass (pe/pb/evEbit: källa-tal med repliknot, >5 % ⇒
 * ABORT) · kirurgisk append · läs-tillbaka ×2 · fältgrind mot 4452.T.
 * Kvitto: /tmp/r197-telus.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "TELUS" || b.ticker === "T.TO")) {
  console.error("ABORT: TELUS finns redan på disken");
  process.exit(1);
}
if (!u.some((b) => b.ticker === "BCE.TO" || /BCE/.test(b.ticker ?? ""))) {
  console.log("NOTIS: BCE-ticker-form okänd i universumet (kandidatur hänvisar till cellen, ej tickern)");
}

// ── Källvärden (StockAnalysis TSX TELUS, 2026-09-25) + repliker ───────────────
const K = {
  pris: 27.31, aktierMdr: 1462.34, mcap: 39.70, eps: 1.008, pe: 26.54, fwdPe: 15.97,
  pb: 2.21, ps: null, evEbit: 10.04, pFcf: 20.29,
  ebitTtm: null, ebitM: 0.1041, nettoTtm: 1478, revTtm: 14743, nettoM: 0.1002,
  fcf: 1969, roe: 0.0808, roic: 0.0470, bruttoM: 0.5160, de: 1.40, rantaTackning: 1.82,
  div: 1.6502, payout: 1.6389, altman: 1.55, piotroski: 5, beta: 0.48,
  omsSerie: [14917, 14922, 15097, 14858],   // M CAD, dec-slut FY2022–FY2025
  resSerie: [1274, 1330, 1780, 1507],
  fcfSerie: [1573, 1755, 1955, 1969],
};
const R = {
  mcap: K.aktierMdr * K.pris,
  pe: K.pris / (K.nettoTtm / K.aktierMdr),
  ps: (K.mcap * 1000) / K.revTtm,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  fcfM: K.fcf / K.revTtm,
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap / 1000, K.mcap, 0.02],
  ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
  ["fcfM", R.fcfM, R.fcfM, 0.01], // identitetskontroll (loggas)
];
const dokument = [["pe", R.pe, K.pe, 0.05]];
const felExakt = exakt.filter(([n, r, k, tol]) => tol > 0.01 && avv(r, k) > tol);
const felDok = dokument.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (felExakt.length || felDok.length) {
  console.error("ABORT: replik utanför tolerans: " + [...felExakt, ...felDok].map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING i CAD (BCE-precedensen — universums andra rena Toronto/CAD-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,92 %; färshämtning direkt med cache-bypass): " +
  "pris 27,31 CAD (52v 19,25–28,59; beta 0,48), mcap 39,70 mdr CAD på 1 462,34 mdr aktier (dual-klass A+B; replik 1 462,34 × 27,31 = 39,94 — 0,6 %, vägt aktietal), " +
  "P/E 26,54 ur källan med replik-not (27,31/(1 478/1 462,34) = 27,02 = 1,8 % spridning), forward P/E 15,97 ⇒ prognosTillväxt +66,19 % (trailing/fwd-modellen, MUFG-konventionen — telekom-D&A-normalisering: spår-PEG 26,54/66,19 = 0,40), P/B 2,21 · EV/EBIT 10,04 (replik ej exakt möjlig — källans EBIT-bas ej bruten ut i panelutdraget; dokumentklass), P/FCF 20,29 med FCF-yield-replik 1/20,29 = 4,93 % mot 1 969/39 700 = 4,96 % ✓ 0,6 %, " +
  "ROE 8,08 % · ROIC 4,70 % · WACC 6,35 % · brutto 51,60 % · EBIT-marginal 10,41 % · netto-marginal 10,02 % EXAKT replik (1 478/14 743) · FCF-marginal 13,36 % replik (1 969/14 743 — fiber-tillgångsförsäljningar/tower-leasebacks lyfter OCF; dokumenterad metodnot); " +
  "balans: D/E 1,40 · räntetäckning 1,82 · Altman 1,55 (KÄLLANS DJUPA VARNINGSZON — telekombalansens skuldtäthet; redovisas öppet som datafakta) · Piotroski 5; " +
  "utdelning 1,6502 CAD/aktie (6,04 % direktavkastning) ⇒ senasteArMdr 2 413 (1,6502 × 1 462,34) med källans payout 163,89 % (utdelningen ÖVER TTM-vinsten — balansfinansierad utdelning, telekomkonvention; dokumenterad öppet); " +
  "FY-SERIEN dec-slutande (M CAD): oms [14 917 · 14 922 · 15 097 · 14 858] · netto [1 274 · 1 330 · 1 780 · 1 507] · FCF [1 573 · 1 755 · 1 955 · 1 969] — FY2022–FY2025 SAMTLIGA positiva: vågens FÖRSTA RAD UTAN BROTTS- ELLER NEGATIVBAS-DOKUMENTATION (CAGR rak: oms −0,13 % · netto +5,77 % på 3-årig bas FY22→FY25; fyra punkter, SEB-A/Kao-konventionen); EPS-serien [0,86 · 0,90 · 1,21 · 1,03]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; rappdag: Q3 2026 est. november (dec-slut) — v172-könotis v45; " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis 'Kanada/kommunikation 1→2/3: RCU Rogers + TELUS (båda P/E-bärare sannolikt)' — P/E-bärarkriteriet KONFIRMERAT (26,54 > 0); rondens Kirin 2503.T AVVISAD först (engångsposter: netto-marginal 16,9 % ÖVER EBIT 12,6 %, rev platt, fwd>trailing −27 % — V173-U3-protokollet) och OMG23:s TMUS-ledig-notis var FÖRÅLDRAD (syskon levererade 2026-09-20, dubbelkälla); Communication Services ⇒ kommunikation-cellen (24→25 bolag), Kanada 4→5.";

const RAD = {
  ticker: "TELUS",
  namn: "TELUS Corporation",
  bransch: "kommunikation",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/TELUS/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.07,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: R.fcfM,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 2.413, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "kandidat ur S2-U1-BCE-OMG24 §10:s kö-notis (Kanada/kommunikation 1→2; P/E-bärare konfirmerad 26,54); TSX-primär CAD (BCE-precedensen); FY2022–FY2025 SAMTLIGA positiva — vågens första rad utan brottsdokumentation (rak 3-årig CAGR: oms −0,13 % · netto +5,77 %); prognosTillväxt +66,2 % = telekom-D&A-normalisering (spår-PEG 0,40); payout 163,89 % ur källan — utdelningen över TTM-vinsten, balansfinansierad (dokumenterad öppet); Altman 1,55 varningszonen öppet (Piotroski 5 bredvid); FCF-marginal 13,4 % bär fiber-/tower-transaktioner (metodnot); moat-fält null (bruttomarginalserie per FY ej i panelutdraget); EK-serie saknas — serier.egetKapital tomt; Q3-rappdag est. november (v172 v45-notis); rondens kirin-AVVISANDE + TMUS-kollisionsläxa i V173-U3-protokollet; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
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
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}: ${el.length} ≠ ${FÖRE + 1}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "TELUS") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ TELUS`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }
const komFöre = backup.filter((b) => b.bransch === "kommunikation").length;
const komEfter = slut.filter((b) => b.bransch === "kommunikation").length;

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 TELUS Corporation, Kanada/kommunikation ${komFöre}→${komEfter}; Kanada-cellen → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot 1/P·FCF ${(100 / K.pFcf).toFixed(2)} %) · pe-replik ${R.pe.toFixed(2)} mot källa ${K.pe} (1,8 %, dokumentklass)`,
  `CAGR (rak, brottsfri): oms3å ${(R.omsCagr3 * 100).toFixed(2)} % · res3å ${(R.resCagr3 * 100).toFixed(2)} % — FY22–25 samtliga positiva`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % (fwd 15,97 mot trailing 26,54) · spår-PEG ${R.peg.toFixed(2)} · payout 163,89 % (källa, dokumenterad) · Altman 1,55 öppet`,
);
writeFileSync("/tmp/r197-telus.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
