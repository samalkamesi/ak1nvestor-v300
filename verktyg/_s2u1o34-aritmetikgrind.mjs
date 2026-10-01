#!/usr/bin/env node
// _s2u1o34-aritmetikgrind.mjs — s2-u1 (manifest auto-s2-1790861711679)
// CELLTRION 068270.KS: aritmetikgrind FÖRE append. Kanontal ordagrant ur
// data/vakten/auto-s2-1790861711679-s2u1-radata.md (SA fem ytor 2026-10-10
// → 2026-10-01 14:16Z). ABORT-konstruktion: RÖD kontroll = exit 1, inget skrivs.
// Enhet M KRW om ej annat. proc = relativ avvikelse i procent.
import { readFileSync } from "node:fs";

// ── kanontal (ordagrant ur SA-ytorna; M KRW) ─────────────────────────────────
const K = {
  pris: 183600,            // översiktens huvudtal (₩, tusentalskomma-format)
  aktier: 228.43,          // M, statistics
  aktierFiling: 240,       // M, balansytan
  mcapT: 41.94,            // T KRW, översikt+statistics
  evT: 44.69,              // T KRW, statistics
  pe: 26.84, fwdPe: 29.59, peg: 1.07,
  pb: 2.32, ptbv: 7.85,
  evEbit: 29.13, evEarn: 28.36,
  epsTTM: 6840.22,
  revTTM: 4897805, bruttoTTM: 3029878, ebitTTM: 1545713, nettoTTM: 1576119,
  ocfTTM: 995898, capexTTM: 172827, fcfTTM: 823072,
  kassaTTM: 1258167, skuldTTM: 3866738, minorTTM: 145391,
  ekTotalTTM: 18048160, ekCommonTTM: 17902769, ekTotalFY25: 17352530,
  tbvTTM: 5340415,
  de: 0.21, ranteback: 16.46,
  roe: 0.0911, roic: 0.0665, wacc: 0.0560,
  dps: 714.286, payout: 0.1065, fcfPayout: 0.1982,
  utdBetaldFY25: 153764,  // M KRW
  rev: [1893401, 2283967, 2176432, 3557304, 4162495],
  netto: [579465, 537836, 535648, 422692, 1029613],
  fcf: [847780, -110305, 327112, 766812, 537827],
  ek: [4050375, 4274204, 17125794, 17580062, 17352530], // total shareholders' equity
  bruttoM: [57.44, 45.21, 48.33, 47.27, 59.27],          // %
};

// ── radens fält (som append-skriptet kommer skriva) ─────────────────────────
const R = {
  pris: 183600,
  marknadsKapitalMdr: 41940, // mdr KRW (41,94T)
  pe: 26.84, pb: 2.32, evEbit: 29.13, peg: 1.07, fcfYield: 0.0196,
  omsCAGR: 0.2170, resCAGR: 0.1545, omsTillvTTM: 0.1766, prognosTillv: -0.0929,
  roe: 0.0911, roic: 0.0665,
  bruttoM: 0.6186, ebitM: 0.3156, nettoM: 0.3218, fcfM: 0.1680,
  de: 0.21, ranteback: 16.46, fcfPos: 4,
  utdMdr: 153.764, andelUtestande: 0.0484,
  moatMedel: 0.5150, moatSpread: 0.1406,
  serierOms: [1893401000000, 2283967000000, 2176432000000, 3557304000000, 4162495000000],
  serierRes: [579465000000, 537836000000, 535648000000, 422692000000, 1029613000000],
  serierEk: [4050375000000, 4274204000000, 17125794000000, 17580062000000, 17352530000000],
  serierFcf: [847780000000, -110305000000, 327112000000, 766812000000, 537827000000],
};

const proc = (ber, falt) => Math.abs((ber - falt) / falt) * 100;
const kontroller = [];
const KONT = (namn, ber, falt, tol, not) =>
  kontroller.push({ namn, ber, falt, avv: proc(ber, falt), tol, not, ok: proc(ber, falt) <= tol });

const mcapM = K.mcapT * 1e6; // 41 940 000 M
// 1. kurs-identiteter
KONT("P/E = pris/EPS", K.pris / K.epsTTM, R.pe, 0.05, "183 600/6 840,22 = 26,8417");
KONT("mcap-replik = pris×aktier", K.pris * K.aktier, mcapM, 0.15, "183 600×228,43 M (M KRW — första körningens RÖD var egen enhetsbugg, /1e6 bort)");
KONT("marknadsKapitalMdr (mdr KRW)", R.marknadsKapitalMdr, mcapM / 1000, 0.01, "41,94T = 41 940 mdr");
// 2. EV-familjen
const evRepl = (mcapM + K.skuldTTM - K.kassaTTM + K.minorTTM) / 1e6; // T
KONT("EV-identitet mcap+skuld-kassa+minoritet", evRepl, K.evT, 0.05, "ENI-konventionen med minoritet");
KONT("EV/Earnings replik", (K.evT * 1e6) / K.nettoTTM, R.evEbit === 29.13 ? K.evEarn : 0, 0.05, "44 690 000/1 576 119");
KONT("EV/EBIT fält vs replik (dok. spridning)", (K.evT * 1e6) / K.ebitTTM, K.evEbit, 1.0, "källans EV/EBIT-bas — 0,75 % spannm dokumenteras");
// 3. marginaler (TTM)
KONT("bruttomarginal", K.bruttoTTM / K.revTTM, R.bruttoM, 0.05, "3 029 878/4 897 805");
KONT("EBIT-marginal", K.ebitTTM / K.revTTM, R.ebitM, 0.05, "1 545 713/4 897 805");
KONT("nettomarginal", K.nettoTTM / K.revTTM, R.nettoM, 0.05, "1 576 119/4 897 805");
KONT("FCF-marginal", K.fcfTTM / K.revTTM, R.fcfM, 0.05, "823 072/4 897 805");
KONT("FCF = OCF − capex", (K.ocfTTM - K.capexTTM) / K.fcfTTM, 1, 0.005, "995 898−172 827 = 823 071");
// 4. värderingsmultiplar
KONT("P/B = mcap/EK-total", mcapM / K.ekTotalTTM, R.pb, 0.2, "41,94T/18,048T (källans bas)");
KONT("P/TBV = pris/(TBV/aktier)", K.pris / (K.tbvTTM / K.aktier), K.ptbv, 0.05, "183 600/23 377,6 = 7,853 EXAKT");
KONT("BVPS-bas = commonEK/filingAktier", (K.ekCommonTTM / K.aktierFiling) / 74595.25, 1, 0.01, "17 902 769/240 = 74 595 — splittran dokumenterad");
KONT("fcfYield = FCF/mcap", K.fcfTTM / mcapM, R.fcfYield, 0.5, "823 072/41,94T = 1,963 %");
KONT("PEG-bas ≈ EPS-prognos 3Y", R.pe / (K.peg * 100), 0.2494, 1.5, "26,84/1,07 = 25,08 % mot +24,94 % — källans bas");
// 5. tillväxt
KONT("omsCAGR 2021→2025", Math.pow(K.rev[4] / K.rev[0], 1 / 4) - 1, R.omsCAGR, 0.5, "(4 162 495/1 893 401)^¼");
KONT("resCAGR 2021→2025", Math.pow(K.netto[4] / K.netto[0], 1 / 4) - 1, R.resCAGR, 0.5, "(1 029 613/579 465)^¼");
KONT("omsTillv TTM (mall: TTM/senaste FY)", K.revTTM / K.rev[4] - 1, R.omsTillvTTM, 0.05, "källans TTM/TTM +30,64 % dokumenterad i notering");
KONT("prognosTillv = pe/fwdPe − 1", R.pe / K.fwdPe - 1, R.prognosTillv, 0.05, "26,84/29,59 − 1 = −9,29 % (fwd>trailing)");
// 6. lönsamhet + struktur
KONT("D/E = skuld/EK-total", K.skuldTTM / K.ekTotalTTM, R.de, 2.5, "3 866 738/18 048 160 = 0,2142 (fält 0,21 tvådec.)");
KONT("ROIC-övertryck mot WACC", K.roic - K.wacc, 0.0105, 0.5, "6,65−5,60 = +1,05 pp");
KONT("ROE replik-spann (dok. källbas)", K.nettoTTM / K.ekTotalTTM, R.roe, 5, "8,73 % slut-EK-replik mot källans 9,11 % fält — medelbas, bärs med not");
KONT("DPS-yield = DPS/pris", K.dps / K.pris, 0.0039, 2, "714,286/183 600 = 0,389 %");
KONT("utd betald FY2025 (mdr)", K.utdBetaldFY25 / 1000, R.utdMdr, 0.01, "153 764 M = 153,764 mdr KRW");
// 7. moat
const medel = K.bruttoM.reduce((a, b) => a + b) / 5;
KONT("moat medel 5 år", medel / 100, R.moatMedel, 0.05, "(57,44+45,21+48,33+47,27+59,27)/5");
KONT("moat spread 5 år", (Math.max(...K.bruttoM) - Math.min(...K.bruttoM)) / 100, R.moatSpread, 0.05, "59,27−45,21 = 14,06 pp");
// 8. serier (fem fönster, absoluta tal M KRW → tusen miljoner)
K.rev.forEach((v, i) => KONT(`serie oms ${2021 + i}`, K.rev[i] * 1e6, R.serierOms[i], 0.001, "M→absolut"));
K.netto.forEach((v, i) => KONT(`serie res ${2021 + i}`, K.netto[i] * 1e6, R.serierRes[i], 0.001, "M→absolut"));
K.ek.forEach((v, i) => KONT(`serie EK ${2021 + i}`, K.ek[i] * 1e6, R.serierEk[i], 0.001, "M→absolut"));
K.fcf.forEach((v, i) => KONT(`serie FCF ${2021 + i}`, K.fcf[i] * 1e6, R.serierFcf[i], 0.001, "M→absolut"));
// 9. fcfPositivaSenaste5
const pos = K.fcf.filter(v => v > 0).length;
KONT("fcfPositivaSenaste5", pos, R.fcfPos, 0.001, "4/5 — FY2022 −110 305");

// ── rapport ──────────────────────────────────────────────────────────────────
let rod = 0;
for (const k of kontroller) {
  const status = k.ok ? "PASS" : "FEL";
  if (!k.ok) rod++;
  console.log(`${status.padEnd(4)} ${k.namn.padEnd(44)} ber ${typeof k.ber === "number" ? k.ber.toFixed(6) : k.ber} · fält ${typeof k.falt === "number" ? k.falt.toFixed(6) : k.falt} · avv ${k.avv.toFixed(3)} % (tol ${k.tol} %) — ${k.not}`);
}
console.log(`\nARITMETIKGRIND: ${kontroller.length - rod}/${kontroller.length} GRÖN${rod ? ` — ${rod} RÖD, ABORT (inget skrivs)` : " — append väntas"}`);
if (rod) process.exit(1);
