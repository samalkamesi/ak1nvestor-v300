#!/usr/bin/env node
/**
 * _r198-v173u4-universum-inlagg.mjs — v173 dataset-djup rond 198 U4 (+1):
 * Rogers Communications RCI-B (Kanada/kommunikation 2→3 mot matta 5, TSX-primär
 * CAD — BCE/TELUS-precedensen) — BCE-OMG24 §10:s FÖRSTAKOORDINAT ("RCU Rogers +
 * TELUS (båda P/E-bärare sannolikt)"), konfirmerad P/E-bärare 15,92 enligt
 * Sony/Honda-doktrinen (TTM-netto +1 838 M CAD > 0, kontrollerad FÖRE leverans).
 *
 * Kontrakt som U1/U2/U3: duplikatgrind · repliker VALIDERAS (EXAKT: mcap/nettoM/
 * fcfY/pe-på-EPS-bas; dokument: payout) · kirurgisk append · läs-tillbaka ×2 ·
 * 0 gamla rader förändrade · fältgrind mot 4452.T. Kvitto: /tmp/r198-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "RCI-B" || /rogers/i.test(b.namn ?? ""))) {
  console.error("ABORT: Rogers/RCI-B finns redan på disken");
  process.exit(1);
}

// ── Källvärden (StockAnalysis TSX RCI.B, 2026-09-25) + repliker ───────────────
const K = {
  pris: 49.28, aktierMdr: 536.7, mcap: 26.50, eps: 3.10, pe: 15.92, fwdPe: 13.20,
  pb: 2.36, evEbit: 8.53, pFcf: 35.45, roe: 0.1443, roic: 0.0391, wacc: 0.0679,
  bruttoM: 0.5555, ebitM: 0.1886, nettoTtm: 1838, revTtm: 20269, nettoM: 0.0907,
  fcf: 748, de: 1.79, rantaTackning: 2.54, altman: 1.73, piotroski: 6, beta: 0.63,
  div: 2.00, payout: 0.5811,
  omsSerie: [15396, 19308, 20204, 20604],   // M CAD, dec-slut FY2022–FY2025
  resSerie: [1535, 2557, 1743, 1769],
  fcfSerie: [2088, 2433, 2446, 748],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  pe: K.pris / K.eps,
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr2: Math.pow(K.omsSerie[3] / K.omsSerie[1], 1 / 2) - 1,  // konsekutiv post-Shaw FY23→FY25
  resCagr2: Math.pow(K.resSerie[3] / K.resSerie[1], 1 / 2) - 1,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,  // över brottet (loggas)
  payoutReplik: K.div / K.eps,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["pe", R.pe, K.pe, 0.02],
  ["nettoM", R.nettoM, K.nettoM, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TSX-PRIMÄRNOTING i CAD, klass B (BCE/TELUS-precedensens Toronto/CAD-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,20 %; färshämtning direkt med cache-bypass): " +
  "pris 49,28 CAD (52v 35,10–51,99 · beta 0,63), mcap 26,50 mdr CAD på 536,7 M aktier (replik 536,7 × 49,28 = 26,45 — 0,2 %), " +
  "P/E 15,92 EXAKT replikerbar på källans EPS-bas (49,28/3,10 = 15,90; EPS-identiteten 1 838/536,7 = 3,425 gäller netto INKLUSIVE minoritetsintressen — källans EPS 3,10 bär NCI-avdrag ~174 M, Rogers Sports & Media-partnerskap; dokumenterad bas-skillnad) mot forward P/E 13,20 ⇒ prognosTillväxt +20,61 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 15,92/20,61 = 0,77, källans PEG 1,94 på 3-års som kalibreringsnot), P/B 2,36 · EV/EBIT 8,53, " +
  "P/FCF 35,45 med FCF-yield EXAKT replik (748/26 500 = 2,823 % mot 1/35,45 = 2,821 %), " +
  "ROE 14,43 % · ROIC 3,91 % (under WACC 6,79 % — telekom-JV-struktur med minoritetsavdrag i kapitalbasen; dokumenterat) · brutto 55,55 % · EBIT-marginal 18,86 % · netto-marginal 9,07 % EXAKT replik (1 838/20 269 = 9,066 %) · FCF 748 M med FCF-marginal 3,7 % replik (748/20 269); " +
  "balans: D/E 1,79 · räntetäckning 2,54 · Altman 1,73 (KÄLLANS VARNINGSZON — telekombalans; redovisas öppet, Piotroski 6 bredvid) · kassa 1,52 mdr · skuld 30,15 mdr · NETTOSKULD 28,63 mdr CAD · EK 11,33 mdr; " +
  "utdelning 2,00 CAD/aktie (4,05 %) ⇒ senasteArMdr 1 073 (2,00 × 536,7) med källans payout 58,11 % (replik 2,00/3,10 = 64,5 % på källans EPS-bas — dokumentklass); " +
  "FY-SERIEN dec-slutande (M CAD): oms [15 396 · 19 308 · 20 204 · 20 604] · netto [1 535 · 2 557 · 1 743 · 1 769] · FCF [2 088 · 2 433 · 2 446 · 748] — SHAW-BROTTET FY2023: förvärvet (april 2023, ~26 mdr CAD) ger omsättningshoppet +25,5 % i ett steg (struktur, ej organiskt) OCH FY23-nettot 2 557 bär fair value-engångsposter; därför CAGR på 2-årig KONSEKUTIV post-Shaw-bas FY2023→FY2025 (oms +3,29 % · netto −16,80 % — nettofallet mot engångspoståret är aritmetiskt, dokumenterat) medan 3-årig rak bas (oms +10,25 %) skulle misstolka Shaw-hoppet som tillväxt — AXA-brott-precedensen; FCF-KOLLAPSEN FY2025 (748 mot 2 446) = capex-/spectrumcykel (5G-expansion), syns i P/FCF 35,45; EPS-serien [2,59 · 4,32 · 2,95 · 2,99]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT est. 2026-10-22 (Q3 2026) — v172-könotis; " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10 kö-notis FÖRSTAKOORDINAT ('RCU Rogers + TELUS, båda P/E-bärare sannolikt') — P/E-bärarkriteriet kontrollerat FÖRE leverans enligt Sony/Honda-doktrinen: TTM-netto +1 838 M CAD > 0, P/E mätt 15,92; disk-kollisionskontroll exakt-match (rond 197:s läxa) GRÖN; Communication Services ⇒ kommunikation-cellen (25→26 bolag; Kanada 4→5 — TELUS-raden 3→4 rättningen r196:s läxa tillämpad från start denna gång).";

const RAD = {
  ticker: "RCI-B",
  namn: "Rogers Communications Inc.",
  bransch: "kommunikation",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/RCI-B/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr2,
    resultatCAGR5ar: R.resCagr2,
    omsattningTillvaxtTTM: 0.11,
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
  aterkop: { senasteArMdr: 1.073, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "kandidat ur BCE-OMG24 §10:s kö-notis (förstakoordinat; P/E-bärare kontrollerad FÖRE leverans: TTM-netto +1 838 M > 0); TSX klass B i CAD; SHAW-BROTT FY2023 (förvärv +25,5 % omsättningshopp; FY23-netto bär fair value-engångsposter) ⇒ CAGR på 2-årig konsekutiv post-Shaw-bas (oms +3,29 % · netto −16,80 % mot engångspoståret — dokumenterat); FCF-kollaps FY2025 748 M = capex-/spectrumcykel; P/E-replik EXAKT på källans EPS-bas 3,10 (NCI-avdrag ~174 M dokumenterat); ROIC under WACC (JV-struktur); Altman 1,73 varningszonen öppet (Piotroski 6); EK-serie saknas — serier.egetKapital tomt; rappdag est. 2026-10-22 = v172-könotis; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "RCI-B") { console.error(`ABORT: läs-tillbaka ${i}: sista raden ≠ RCI-B`); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }
const komEfter = slut.filter((b) => b.bransch === "kommunikation").length;
const kanEfter = slut.filter((b) => b.land === "Kanada").length;

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Rogers Communications RCI-B, Kanada/kommunikation → ${komEfter}; Kanada-cellen → ${kanEfter})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) · pe ${R.pe.toFixed(2)} (${K.pe}, EPS-bas 3,10 — NCI-not) · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · fcfY ${(R.fcfY * 100).toFixed(3)} % (mot ${(100 / K.pFcf).toFixed(3)} %) EXAKT`,
  `CAGR (post-Shaw konsekutiv FY23→25): oms ${(R.omsCagr2 * 100).toFixed(2)} % · netto ${(R.resCagr2 * 100).toFixed(2)} % (mot engångspoståret FY23 — dokumenterat); 3-årig rak hade gett oms +${(R.omsCagr3 * 100).toFixed(1)} % (Shaw-hopp — ej organiskt)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · payout 58,11 % (källa; replik 64,5 % dokumentklass) · Altman 1,73 öppet`,
);
writeFileSync("/tmp/r198-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
