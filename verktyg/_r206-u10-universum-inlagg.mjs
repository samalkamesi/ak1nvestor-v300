#!/usr/bin/env node
/**
 * _r206-u10-universum-inlagg.mjs — v173 dataset-djup rond 206 U10 (+1):
 * Cellnex Telecom CLN.MC (Spanien/kommunikation 0→1 — landets fjärde gren) —
 * BCE-OMG24 §10:s EGET alternativ ("Spanien: Cellnex/Redeia?" — TEF var P/E-död).
 * P/E-bärarkontroll FÖRE leverans (TTM-netto 518 M EUR > 0 — GRÖN, doktrinens
 * TTM-villkor uppfyllt; VÄNDNINGSSERIEN gör dock netto-CAGR NULL — negativa
 * basår FY22–FY24, Sony/Honda-aritmetiken). Kollisionskontroll exakt-match GRÖN.
 * Kvitto: /tmp/r206-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "CLN.MC" || /cellnex/i.test(b.namn ?? ""))) {
  console.error("ABORT: CLN.MC finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 33.50, aktierMdr: 429.3, mcap: 14.41, epsGaap: 1.207, pe: 21.96, fwdPe: 16.68,
  pb: 2.71, evEbit: 12.91, pFcf: 23.71, pegKalla: 1.05, ps: 3.55,
  roe: 0.1236, roic: 0.0387, wacc: 0.0619, bruttoM: 0.9173, ebitM: 0.2727,
  nettoTtm: 518, revTtm: 4055, nettoM: 0.1277,
  fcf: 608, de: 3.69, rantaTackning: 1.62, altman: 1.01, piotroski: 6, beta: 0.70,
  div: 0.671,
  omsSerie: [3305, 3624, 3895, 4042],   // M EUR, dec-slut FY2022–FY2025
  resSerie: [-855, -956, -1004, 350],
  fcfSerie: [151, 373, 554, 620],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  peGaap: K.pris / K.epsGaap,
  nettoM: K.nettoTtm / K.revTtm,
  ps: (K.mcap * 1000) / K.revTtm,
  fcfY: K.fcf / (K.mcap * 1000),
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / K.epsGaap,
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcap, K.mcap, 0.02], ["nettoM", R.nettoM, K.nettoM, 0.02],
  ["ps", R.ps, K.ps, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02],
];
const dokument = [["pe", R.peGaap, K.pe, 0.30]]; // justerad bas (nedskrivningar ur) — dokumentklass med vid tak, not bär förklaringen
const fel = [...exakt, ...dokument].filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "BME-PRIMÄRNOTING i EUR (första CLN.MC/ITX.MC/IBE.MC/SAN.MC-konventionens Madrid-rad med kommunikation; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,29 %; färshämtning direkt med cache-bypass + kompletterande FY-panelhämtning vid oläsbar första tabell): " +
  "pris 33,50 EUR (52v 27,36–36,79 · beta 0,70), mcap 14,41 mdr EUR på 429,3 M aktier (replik 429,3 × 33,50 = 14,38 — 0,2 %), " +
  "P/E 21,96 ur källan på bolagets JUSTERADE bas (Cellnex rapporterar adjusted net profit med nedskrivningar exkluderade — GAAP-repliken 33,50/1,207 = 27,75 avviker 26 %; dokumentklass med bas-not, CNR/CPKC/ABX-klassen men djupare eftersom nedskrivningarna ÄR historiken) mot forward P/E 16,68 ⇒ prognosTillväxt +31,65 % (trailing/fwd-modellen, MUFG-konventionen — VÄNDNINGENS normalisering; spår-PEG 21,96/31,65 = 0,69 mot källans PEG 1,05, kalibreringsnot), P/B 2,71 · EV/EBIT 12,91 · PS 3,55 EXAKT replik (14 410/4 055 = 3,554), " +
  "ROE 12,36 % · ROIC 3,87 % långt under WACC 6,19 % (TORNBOLAGSMETODNOT: leasing-/kontraktsstrukturen gör ROIC missvisande — långa platskontrakt (8-20 år) finansierar tornen och EV-kedjan bär bilden; dokumenterat) · brutto 91,73 % (tjänstebolagsstruktur — tornhyra har ingen kostnadssida i bruttoledet) · EBIT-marginal 27,27 % · netto-marginal 12,77 % EXAKT replik (518/4 055) · FCF-yield EXAKT replik (608/14 410 = 4,22 % = 1/P·FCF 1/23,71); " +
  "balans: D/E 3,69 (!) · räntetäckning 1,62 · Altman 1,01 (DJUP VARNINGSZON — tornbolagets skuldbygge är AFFÄRS MODELLEN: kontraktsbundna kassaflöden finansierar låningen; redovisas öppet som datafakta med metodnot, Piotroski 6) · kassa 1,18 mdr · skuld 12,65 mdr · NETTOSKULD 11,47 mdr · EK 5,30 mdr; " +
  "utdelning 0,671 EUR/aktie (2,00 %) ⇒ senasteArMdr 288 (0,671 × 429,3) med källans payout 28,10 % på justerad bas (GAAP-replik 55,6 % — bas-not); " +
  "FY-SERIEN dec-slutande (M EUR): oms [3 305 · 3 624 · 3 895 · 4 042] · netto [−855 · −956 · −1 004 · +350] · FCF [151 · 373 · 554 · 620] — VÄNDNINGSBROTTET FY2025: tre nedskrivningsår (goodwill på tornportföljen, känd Cellnex-historia) följs av första positiva året +350 med TTM +518 (momentum); P/E-BÄRARKONTROLLENS ÅTSKILLNAD: doktrinens TTM-villkor uppfyllt (netto > 0 ⇒ P/E bär) men SERIENS negativa basår FY22–FY24 gör netto-CAGR ODEFINIERBAR (Sony/Honda-aritmetiken) ⇒ resultatCAGR5ar NULL med vändningsdokumentation — fältet återtas när konsekutiv positiv bas finns; omsCAGR rak FY22→FY25 +6,90 % (organisk volymtillväxt på torn); EPS-GAAP-serien [−1,99 · −2,23 · −2,34 · +0,82]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q3 2026 (est. slutet oktober/early november — v172-könotis); " +
  "kandidatur: S2-U1-BCE-UTOKNING-OMG24 §10:s EGET Spanien-alternativ («cellerna kräver källvändning (TTM>0) ELLER P/E-bärande alternativ (Spanien: Cellnex/Redeia? UK: BT?) innan öppning») — källvändningen SKEDDE (TTM>0) och Cellnex är förstanamnet; TEF/VOD förblev P/E-döda men alternativet lever; kollisionskontroll exakt-match GRÖN; Communication Services ⇒ kommunikation-cellen (29→30 bolag), Spanien 3→4 (landets FJÄRDE gren: konsument · energi · finans · kommunikation).";

const RAD = {
  ticker: "CLN.MC",
  namn: "Cellnex Telecom, S.A.",
  bransch: "kommunikation",
  land: "Spanien",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/bme/CLN/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: 0.026,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: K.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 2,
  },
  aterkop: { senasteArMdr: 0.288, andelUtestande: 0.281, insiderkopSenaste6man: 0 },
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
    "kandidat ur BCE-OMG24 §10:s EGNA Spanien-alternativ (källvändningen skedde: TTM>0 — TEF förblev P/E-död men alternativet lever; P/E-bärare kontrollerad före leverans); BME-primär EUR; VÄNDNINGSBROTT FY2025 (tre nedskrivningsår ⇒ första positiva; TTM-momentum +518) ⇒ resultatCAGR NULL (negativa basår — Sony/Honda-aritmetiken; fältet återtas vid konsekutiv positiv bas) medan omsCAGR rak +6,90 % organisk; P/E 21,96 på källans JUSTERADE bas (nedskrivningar ur — GAAP-replik 27,75 dokumenterad); D/E 3,69 + Altman 1,01 djup varningszon som datafakta med TORNBOLAGSMETODNOT (kontraktsbundna kassaflöden finansierar skuldbygget; ROIC missvisande för modellen); payout 28,10 % på justerad bas (GAAP-replik 55,6 % not); nyemissioner 2 senaste 5 åren (kapitalhöjningar 2020-2021-perioden); EK-serie saknas — serier.egetKapital tomt; rappdag Q3 est. slutet oktober = v172-könotis; alla repliker i paranoid (StockAnalysis BME 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "CLN.MC") { console.error("ABORT: sista raden ≠ CLN.MC"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Cellnex CLN.MC, Spanien/kommunikation 0→1; kommunikation-cellen → ${slut.filter((b) => b.bransch === "kommunikation").length}; Spanien → ${slut.filter((b) => b.land === "Spanien").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(2)} (${K.mcap}) 0,2 % · nettoM ${(R.nettoM * 100).toFixed(2)} % EXAKT · ps ${R.ps.toFixed(3)} (${K.ps}) EXAKT · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · pe-GAAP ${R.peGaap.toFixed(2)} vs källa ${K.pe} (justerad bas — dokumentklass med not)`,
  `CAGR: oms rak ${(R.omsCagr3 * 100).toFixed(2)} % · netto NULL (vändningsserie: −855/−956/−1 004/+350 — Sony/Honda-aritmetiken, fältet återtas vid positiv bas)`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % (vändningens normalisering) · spår-PEG ${R.peg.toFixed(2)} · D/E 3,69 + Altman 1,01 med TORNBOLAGSMETODNOT`,
);
writeFileSync("/tmp/r206-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
