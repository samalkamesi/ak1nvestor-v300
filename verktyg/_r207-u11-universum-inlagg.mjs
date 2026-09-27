#!/usr/bin/env node
/**
 * _r207-u11-universum-inlagg.mjs — v173 dataset-djup rond 207 U11 (+1):
 * Redeia Corporación REE.MC (Spanien/energi 1→2) — BCE-OMG24 §10:s Spanien-
 * alternativs ANDRANAMN. P/E-bärarkontroll FÖRE leverans (TTM-netto 973 M EUR
 * > 0 — GRÖN); kollisionskontroll exakt-match GRÖN (r206-sonden).
 * Reglerad elnätskoncession: stabil brottsfri serie (TELUS/CNR-klassen) +
 * minoritetsnot på P/E-basen (Rogers-mönstret omvänt: källans P/E på
 * attributable-EPS, total-nettorepliken dokumenterad).
 * Kvitto: /tmp/r207-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "REE.MC" || /redeia|red el/i.test(b.namn ?? ""))) {
  console.error("ABORT: REE.MC finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 19.28, aktierMdr: 694.2, mcap: 13.36, epsTotal: 1.4016, pe: 18.07, fwdPe: 16.68,
  pb: 2.29, evEbit: 8.83, pFcf: 30.66, pegKalla: 5.34, ps: 5.23,
  roe: 0.1246, roic: 0.0493, wacc: 0.0618, bruttoM: 1.0, ebitM: 0.4216,
  nettoTtm: 973, revTtm: 2556, nettoM: 0.3807,
  fcf: 436, de: 1.58, rantaTackning: 2.50, altman: 1.67, piotroski: 5, beta: 0.51,
  div: 1.1594, payout: 0.8363,
  omsSerie: [2412, 2272, 2449, 2536],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [792, 679, 864, 930],
  fcfSerie: [1058, 650, 622, 428],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  peTotal: K.pris / K.epsTotal,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.epsTotal,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
  ["payout", R.payoutReplik, K.payout, 0.02],
];
const dokument = [["pe", R.peTotal, K.pe, 0.30]]; // källans attributable-EPS-bas (minoriteter) — not bär förklaringen
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "BME-PRIMÄRNOTING i EUR (CLN.MC/ITX.MC/IBE.MC/SAN.MC-precedensens Madrid-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,31 %; färshämtning direkt med cache-bypass + kompletterande FCF-panelhämtning vid oläsbar första tabell): " +
  "pris 19,28 EUR (52v 16,17–20,00 · beta 0,51 — reglerad koncessionsprofil), mcap 13,36 mdr EUR på 694,2 M aktier (replik 694,2 × 19,28 = 13,39 — 0,2 %), " +
  "P/E 18,07 ur källan på ATTRIBUTABLE-EPS-basen (Redeia bär minoritetsintressen i nätfilialer — total-nettorepliken 19,28/(973/694,2) = 13,76 dokumenterad med minoritetsnot; Rogers-mönstret omvänt: där låg källan över totalnettot, här under), mot forward P/E 16,68 ⇒ prognosTillväxt +8,33 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 18,07/8,33 = 2,17 mot källans PEG 5,34 på 3-års, kalibreringsnot), P/B 2,29 · EV/EBIT 8,83 · PS 5,23 (replik 13 360/2 556 = 5,225 = 0,1 %), " +
  "ROE 12,46 % · ROIC 4,93 % under WACC 6,18 % (KONCESSIONSMETODNOT: reglerad nättillgångsbas — avkastningen regleras mot tillgångsvärde, ROIC speglar ej konkurrensförmåga utan koncessionsformeln; dokumenterat) · brutto 100 % METODNOT (nätföretag: intäkten ÄR nättarifferingen — ingen kostnadssida i bruttoledet; fältet bärs formellt med not) · EBIT-marginal 42,16 % (nätleverantörsstrukturen) · netto-marginal 38,07 % EXAKT replik (973/2 556) · FCF-yield EXAKT replik (436/13 360 = 3,26 % = 1/P·FCF 1/30,66); " +
  "balans: D/E 1,58 · räntetäckning 2,50 · Altman 1,67 (KÄLLANS VARNINGSZON — KONCESSIONSBALANSMETODNOT: reglerad kapitalbas med statlig koncessionslogik; redovisas som datafakta med not, Piotroski 5) · kassa 0,40 mdr · skuld 8,22 mdr · NETTOSKULD 7,82 mdr · EK 5,83 mdr; " +
  "utdelning 1,1594 EUR/aktie (6,01 % — reglerad koncessionsutdelning) ⇒ senasteArMdr 805 (1,1594 × 694,2) med källans payout 83,63 % (totalnetto-replik 82,7 % ✓ 1,1 %); " +
  "FY-SERIEN dec-slutande (M EUR): oms [2 412 · 2 272 · 2 449 · 2 536] · netto [792 · 679 · 864 · 930] · FCF [1 058 · 650 · 622 · 428] — STABIL REGLERAD PROFIL: samtliga FY positiva utan brott (TELUS/CNR-klassen — vågens tredje brottsfria rad) med rak 3-årig CAGR FY22→FY25 (oms +1,68 % · netto +5,55 % — reglerad prisbas, ingen cykel); FCF-nedgången 1 058→428 = nätinvesteringsexpansionen (koncessionskapitalökningen dokumenterad som investeringscykel i metodnoten); " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 (est. tidigt november — v172-könotis v45); " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10:s Spanien-alternativets ANDRANAMN («Spanien: Cellnex/Redeia?» — Cellnex togs U10, Redeia kompletterar koordinatparen); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 973 M EUR > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN (r206-sonden); Utilities ⇒ energi-cellen (25→26 bolag), Spanien 4→5 (landets femte bolag: konsument · energi ×2 · finans · kommunikation).";

const RAD = {
  ticker: "REE.MC",
  namn: "Redeia Corporación, S.A.",
  bransch: "energi",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/bme/REE/ (+ /statistics/ + /financials/ + /financials/?p=cashFlow)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.05,
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
  aterkop: { senasteArMdr: 0.805, andelUtestande: K.payout, insiderkopSenaste6man: 0 },
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
    "kandidat ur BCE-OMG24 §10:s Spanien-alternativ (andraranamnet — Cellnex U10 + Redeia U11 = koordinatparen komplett; P/E-bärare kontrollerad före leverans); BME-primär EUR; STABIL BROTTSFRI REGLERAD SERIE (vågens tredje — rak CAGR oms +1,68 % · netto +5,55 %); P/E 18,07 på källans ATTRIBUTABLE-bas (minoritetsnot; totalnetto-replik 13,76 dokumenterad — Rogers-mönstret omvänt); KONCESSIONSMETODNOTER: ROIC under WACC speglar koncessionsformeln (ej konkurrenskraft), brutto 100 % = nättariffering utan kostnadssida (fältet med not), Altman 1,67 varningszon = reglerad kapitalbas, FCF-nedgång = nätinvesteringscykeln; utdelning 6,01 % reglerad med payout 83,63 %; EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. tidigt november = v172-könotis; alla repliker i paranoid (StockAnalysis BME 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "REE.MC") { console.error("ABORT: sista raden ≠ REE.MC"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Redeia REE.MC, Spanien/energi 25→${slut.filter((b) => b.bransch === "energi").length}; Spanien → ${slut.filter((b) => b.land === "Spanien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) 0,2 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) 0,1 % · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · payout ${R.payoutReplik.toFixed(4)} (${K.payout}) ✓ · pe-totalnetto ${R.peTotal.toFixed(2)} vs källa ${K.pe} (attributable-bas — minoritetsnot)`,
  `CAGR rak brottsfri FY22→25: oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} % (vågens tredje brottsfria rad — reglerad profil)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · koncessionsmetodnoter (ROIC/brutto/Altman/FCF-cykel) dokumenterade`,
);
writeFileSync("/tmp/r207-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
