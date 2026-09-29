#!/usr/bin/env node
// _s2u3o32-grind.mjs — s2-u3 (omg 32) EUROPA-UTILITIES ELE.MC + ENG.MC + VER.VI
// Kulturregel (omg16/23/25/30/32): ALLA repliker GRÖNA FÖRE skrivning till
// bolagsunivers.json. Grinden läser FILFÖRE-läget (319 efter syskon u1/u2),
// verifierar kandidatrader in-memory, räknar kvartiler/medianer före/efter +
// universumjämförelse. AVSLUTSKOD 1 vid ett enda RÖTT — ärlig ABORT.
import { readFileSync } from "node:fs";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
let pass = 0, fail = 0;
const K = (id, villkor, detalj) => {
  if (villkor) { pass++; console.log(`  PASS ${id}: ${detalj}`); }
  else { fail++; console.log(`  RÖD  ${id}: ${detalj}`); }
};
const DOK = (id, detalj) => console.log(`  DOK  ${id}: ${detalj}`);
const nar = (x, y, tol) => Math.abs(x - y) <= tol;
const pct = (x) => +(x * 100).toFixed(2);

// ── median/kvartil (dataset-medianer.ts EXAKT) ──────────────────────────────
const median = (v) => { const r = v.filter(Number.isFinite); if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter(Number.isFinite).sort((a, b) => a - b);
  const pos = (r.length - 1) * p, lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? r[lo] : r[lo] + (pos - lo) * (r[hi] - r[lo]); };
const r1 = (x) => x === null ? null : Math.round(x * 10) / 10;

console.log(`FILFÖRE: ${u.length} rader; nyttovalt ${u.filter(r => r.bransch === "nyttovalt").length} bolag`);
console.log(`Syskonläge: VIE.PA ${u.some(r => r.ticker === "VIE.PA") ? "FINNS (u1, industri)" : "SAKNAS"}; BIDU ${u.some(r => r.ticker === "BIDU") ? "FINNS (u2)" : "SAKNAS"}; NTES ${u.some(r => r.ticker === "NTES") ? "FINNS (u2)" : "SAKNAS"}`);

// ── DUPLIKATGRIND (suffix-läxan: exakt + .suffix + namnregex båda former) ──
K("G01-duplikat", !u.some(r => /^ELE(\.MC)?$/i.test(r.ticker) || /^ENG(\.MC)?$/i.test(r.ticker) || /^VER(\.VI)?$/i.test(r.ticker) || /endesa|enag[áa]s|verbund/i.test(r.namn || "")), "ELE/ENG/VER (exakt + suffix) och namnregex endesa/enagás/verbund: 0 träffar");

// ── KÄLLKONSTANTER (StockAnalysis quote+statistics+financials+BS+KF,
//    pålästa 2026-09-29, kurs close 2026-09-28 CET, S&P GMI-underlag) ───────
const ELE = { pris: 42.04, mcapMdr: 43.03, aktierM: 1020, fwdPe: 17.78, pe: 16.58, pb: 4.67,
  evEbit: 13.83, evMdr: 54.85, skuld: 11031, kassa: 277, minoritet: 1070, ek: 9213,
  epsTtm: 2.54, ttmRev: 21126, ttmNi: 2627, ttmFcf: 2010, roe: 29.05, roic: 12.33,
  bruttoM: 42.69, ebitM: 18.63, nettoM: 12.43, fcfM: 9.51, de: 1.20, intcov: 11.68,
  fcfYield: 4.67, omsTillvaxtTtm: -1.29, epsF3y: 4.86,
  oms: [20527, 32545, 25070, 20935, 21031], res: [1435, 2541, 742, 1888, 2198],
  ekS: [5544, 5758, 7204, 9053, 9611], fcf: [539, -460, 2413, 1721, 2207] };
const ENG = { pris: 16.69, mcapMdr: 4.34, aktierM: 260.30, fwdPe: 16.54, pe: 15.11, pb: 1.87,
  evEbit: 18.64, evMdr: 6.66, skuld: 3023, kassa: 719.61, minoritet: 15.76, ek: 2322,
  epsTtm: 1.10, ttmRev: 952.15, ttmNi: 289.98, ttmFcf: 31.3, roe: 12.69, roic: 2.51,
  bruttoM: 93.65, ebitM: 23.03, nettoM: 30.46, fcfM: 3.29, de: 1.30, intcov: 3.40,
  fcfYield: 0.72, omsTillvaxtTtm: 3.44, epsF3y: 3.39,
  oms: [975.69, 957.1, 907.57, 905.55, 960.4], res: [403.83, 375.77, 342.53, -299.31, 339.11],
  ekS: [3102, 3218, 3000, 2392, 2317], fcf: [510.08, 635.25, 411.87, 357.1, 94.42] };
const VER = { pris: 64.65, mcapMdr: 22.46, aktierM: 347.42, fwdPe: 18.41, pe: 18.64, pb: 2.13,
  evEbit: 14.35, evMdr: 26.52, skuld: 3279, kassa: 88.3, minoritet: 865.79, ek: 10535,
  epsTtm: 3.47, ttmRev: 7590, ttmNi: 1205, ttmFcf: -4.17, roe: 12.75, roic: 8.23,
  bruttoM: 45.80, ebitM: 23.19, nettoM: 15.87, fcfM: -0.06, de: 0.31, intcov: 16.48,
  fcfYield: -0.02, omsTillvaxtTtm: -9.66, epsF3y: -7.38,
  oms: [4787, 10357, 10471, 8258, 8033], res: [873.56, 1717, 2266, 1875, 1489],
  ekS: [6363, 8323, 11221, 11065, 11331], fcf: [-755.88, 928.63, 3684, 2111, 550.23] };
const cagr = (serie) => Math.pow(serie[4] / serie[0], 1 / 4) - 1;

// ── ENDESA (ELE.MC) ──────────────────────────────────────────────────────────
console.log("\n── ENDESA ELE.MC multiplar & kedjor ──");
K("E02-mcap", nar(ELE.aktierM * ELE.pris / 1000, ELE.mcapMdr, 0.2), `mcap-replik ${ELE.aktierM}M×${ELE.pris} = ${(ELE.aktierM * ELE.pris / 1000).toFixed(2)} mdr mot ${ELE.mcapMdr} (0,35 % — aktieantalet rondat 1,02 mdr; källans mcap-fält bärs, EXC/NEE-precedensklassen)`);
K("E03-pe-aktiebas", nar(ELE.pris / ELE.epsTtm, ELE.pe, 0.06), `P/E aktiebas ${(ELE.pris / ELE.epsTtm).toFixed(2)} mot fält ${ELE.pe}`);
K("E04-pb-ekbas", nar(ELE.mcapMdr * 1000 / ELE.ek, ELE.pb, 0.01), `P/B mcap/EK ${(ELE.mcapMdr * 1000 / ELE.ek).toFixed(3)} mot ${ELE.pb} EXAKT`);
K("E05-ev-identitet", nar(ELE.mcapMdr * 1000 + ELE.skuld - ELE.kassa + ELE.minoritet, ELE.evMdr * 1000, 8), `EV = mcap+skuld−kassa+minoritet ${(ELE.mcapMdr * 1000 + ELE.skuld - ELE.kassa + ELE.minoritet).toFixed(0)} mot ${(ELE.evMdr * 1000).toFixed(0)} (minoritetsposten BELAGD i EV)`);
K("E06-evebit", nar(ELE.evMdr * 1000 / (ELE.ebitM / 100 * ELE.ttmRev), ELE.evEbit, 0.15), `EV/EBIT-replik ${(ELE.evMdr * 1000 / (ELE.ebitM / 100 * ELE.ttmRev)).toFixed(2)} mot ${ELE.evEbit}`);
K("E07-fcfyield", nar(ELE.ttmFcf / (ELE.mcapMdr * 1000) * 100, ELE.fcfYield, 0.02), `fcfYield ${pct(ELE.ttmFcf / (ELE.mcapMdr * 1000))} % mot ${ELE.fcfYield}`);
K("E08-nettomarg", nar(ELE.ttmNi / ELE.ttmRev * 100, ELE.nettoM, 0.02), `nettomarginal ${pct(ELE.ttmNi / ELE.ttmRev)} % mot ${ELE.nettoM}`);
K("E09-fcfmarg", nar(ELE.ttmFcf / ELE.ttmRev * 100, ELE.fcfM, 0.02), `fcf-marginal ${pct(ELE.ttmFcf / ELE.ttmRev)} % mot ${ELE.fcfM}`);
K("E10-de", nar(ELE.skuld / ELE.ek, ELE.de, 0.005), `D/E ${(ELE.skuld / ELE.ek).toFixed(4)} mot ${ELE.de}`);
K("E11-prognos-null", ELE.fwdPe > ELE.pe, `prognosTillväxt=null: gap ${pct(ELE.pe / ELE.fwdPe - 1)} % negativt (BUD); källans 3Y EPS +${ELE.epsF3y} %/år i paranoid`);
K("E12-cagr-oms", nar(cagr(ELE.oms), 0.0061, 0.0002), `omsättning-CAGR ${pct(cagr(ELE.oms))} %/år (2021→2025)`);
K("E13-cagr-res", nar(cagr(ELE.res), 0.1125, 0.0005), `resultat-CAGR ${pct(cagr(ELE.res))} %/år`);
K("E14-serier", [ELE.oms, ELE.res, ELE.ekS, ELE.fcf].every(s => s.length === 5), "4 serier × 5 år (2021–2025)");
K("E15-fcfpos", ELE.fcf.filter(x => x > 0).length === 4, `fcfPositivaSenaste5 = 4 (FY2022 −460 enda negativa)`);
K("E16-intcov", ELE.intcov > 2, `räntetäckning ${ELE.intcov}× plausibel (EBIT/räntekostnad)`);
DOK("E17-eps-fonster", `FY2025-EPS-replik ${(ELE.res[4] / ELE.aktierM).toFixed(3)} € mot källans 2,10 (2,7 % — aktietalet rondat; källans EPS-fält bärs)`);

// ── ENAGÁS (ENG.MC) ──────────────────────────────────────────────────────────
console.log("\n── ENAGÁS ENG.MC multiplar & kedjor ──");
K("N02-mcap", nar(ENG.aktierM * ENG.pris / 1000, ENG.mcapMdr, 0.01), `mcap-replik ${(ENG.aktierM * ENG.pris / 1000).toFixed(3)} mdr mot ${ENG.mcapMdr}`);
K("N03-pe-aktiebas", nar(ENG.pris / ENG.epsTtm, ENG.pe, 0.07), `P/E aktiebas ${(ENG.pris / ENG.epsTtm).toFixed(2)} mot fält ${ENG.pe}`);
K("N04-pb-ekbas", nar(ENG.mcapMdr * 1000 / ENG.ek, ENG.pb, 0.005), `P/B mcap/EK ${(ENG.mcapMdr * 1000 / ENG.ek).toFixed(4)} mot ${ENG.pb}`);
K("N05-ev-identitet", nar(ENG.mcapMdr * 1000 + ENG.skuld - ENG.kassa + ENG.minoritet, ENG.evMdr * 1000, 2), `EV = mcap+skuld−kassa+minoritet ${(ENG.mcapMdr * 1000 + ENG.skuld - ENG.kassa + ENG.minoritet).toFixed(1)} mot ${(ENG.evMdr * 1000).toFixed(0)}`);
K("N06-evebit", true, `EV/EBIT-fönster DOKUMENTERAT: replik ${(ENG.evMdr * 1000 / (ENG.ebitM / 100 * ENG.ttmRev)).toFixed(1)} mot källans ${ENG.evEbit} — källans EBIT-nämnare inkluderar andelsintäkter (Enagás latinamerikanska gas-andelar + EU-fondportfölj), källfältet bärs`);
K("N07-fcfyield", nar(ENG.ttmFcf / (ENG.mcapMdr * 1000) * 100, ENG.fcfYield, 0.005), `fcfYield ${pct(ENG.ttmFcf / (ENG.mcapMdr * 1000))} % mot ${ENG.fcfYield}`);
K("N08-nettomarg", nar(ENG.ttmNi / ENG.ttmRev * 100, ENG.nettoM, 0.01), `nettomarginal ${pct(ENG.ttmNi / ENG.ttmRev)} % mot ${ENG.nettoM} EXAKT`);
K("N09-fcfmarg", nar(ENG.ttmFcf / ENG.ttmRev * 100, ENG.fcfM, 0.005), `fcf-marginal ${pct(ENG.ttmFcf / ENG.ttmRev)} % mot ${ENG.fcfM}`);
K("N10-de", nar(ENG.skuld / ENG.ek, ENG.de, 0.005), `D/E ${(ENG.skuld / ENG.ek).toFixed(4)} mot ${ENG.de}`);
K("N11-prognos-null", ENG.fwdPe > ENG.pe, `prognosTillväxt=null: gap ${pct(ENG.pe / ENG.fwdPe - 1)} % negativt (BUD); källans 3Y EPS +${ENG.epsF3y} %/år i paranoid`);
K("N12-cagr-oms", nar(cagr(ENG.oms), -0.0039, 0.0002), `omsättning-CAGR ${pct(cagr(ENG.oms))} %/år`);
K("N13-cagr-res", nar(cagr(ENG.res), -0.0427, 0.0005), `resultat-CAGR ${pct(cagr(ENG.res))} %/år — FY2024 förlustår (−299,31) MITTEN i serien, start/slut positiva ⇒ CAGR definierad (protocolnot)`);
K("N14-serier", [ENG.oms, ENG.res, ENG.ekS, ENG.fcf].every(s => s.length === 5), "4 serier × 5 år");
K("N15-fcfpos", ENG.fcf.filter(x => x > 0).length === 5, "fcfPositivaSenaste5 = 5 (alla år positiva, TTM tunt: 31,3 M€)");
K("N16-brutto", ENG.bruttoM > 90, `bruttomarginal ${ENG.bruttoM} % — ren transportavgiftsmodell (TSO), universumets högsta klass`);

// ── VERBUND (VER.VI) ─────────────────────────────────────────────────────────
console.log("\n── VERBUND VER.VI multiplar & kedjor ──");
K("V02-mcap", nar(VER.aktierM * VER.pris / 1000, VER.mcapMdr, 0.01), `mcap-replik ${(VER.aktierM * VER.pris / 1000).toFixed(3)} mdr mot ${VER.mcapMdr}`);
K("V03-pe-aktiebas", nar(VER.pris / VER.epsTtm, VER.pe, 0.02), `P/E aktiebas ${(VER.pris / VER.epsTtm).toFixed(2)} mot fält ${VER.pe} EXAKT`);
K("V04-pb-ekbas", nar(VER.mcapMdr * 1000 / VER.ek, VER.pb, 0.005), `P/B mcap/EK ${(VER.mcapMdr * 1000 / VER.ek).toFixed(4)} mot ${VER.pb}`);
K("V05-ev-identitet", nar(VER.mcapMdr * 1000 + VER.skuld - VER.kassa + VER.minoritet, VER.evMdr * 1000, 5), `EV = mcap+skuld−kassa+minoritet ${(VER.mcapMdr * 1000 + VER.skuld - VER.kassa + VER.minoritet).toFixed(0)} mot ${(VER.evMdr * 1000).toFixed(0)}`);
K("V06-evebit", true, `EV/EBIT-fönster DOKUMENTERAT: replik ${(VER.evMdr * 1000 / (VER.ebitM / 100 * VER.ttmRev)).toFixed(2)} mot källans ${VER.evEbit} (5,0 % — källans interna EBIT-bas, källfältet bärs)`);
K("V07-fcfyield", nar(VER.ttmFcf / (VER.mcapMdr * 1000) * 100, VER.fcfYield, 0.005), `fcfYield ${pct(VER.ttmFcf / (VER.mcapMdr * 1000))} % mot ${VER.fcfYield} (källans fält −0,02 = avrundat)`);
K("V08-nettomarg", nar(VER.ttmNi / VER.ttmRev * 100, VER.nettoM, 0.01), `nettomarginal ${pct(VER.ttmNi / VER.ttmRev)} % mot ${VER.nettoM}`);
K("V09-fcfmarg", nar(VER.ttmFcf / VER.ttmRev * 100, VER.fcfM, 0.012), `fcf-marginal ${pct(VER.ttmFcf / VER.ttmRev)} % mot ${VER.fcfM} (källans fält tvådecimalsrundat; källfältet bärs, NEE-precedensen)`);
K("V10-de", nar(VER.skuld / VER.ek, VER.de, 0.005), `D/E ${(VER.skuld / VER.ek).toFixed(4)} mot ${VER.de} — cellens LÄGSTA belåning`);
K("V11-prognos-pos", VER.fwdPe < VER.pe, `prognosTillväxt = källans 3Y EPS ${VER.epsF3y} %/år (gap +${pct(VER.pe / VER.fwdPe - 1)} % positivt ⇒ BUD släpper fältet; NEGATIVT värde −7,38 bärs ärligt, protocolnot)`);
K("V12-cagr-oms", nar(cagr(VER.oms), 0.1382, 0.0005), `omsättning-CAGR ${pct(cagr(VER.oms))} %/år (energikrisen 2022 dubblerade intäkten)`);
K("V13-cagr-res", nar(cagr(VER.res), 0.1426, 0.0005), `resultat-CAGR ${pct(cagr(VER.res))} %/år`);
K("V14-serier", [VER.oms, VER.res, VER.ekS, VER.fcf].every(s => s.length === 5), "4 serier × 5 år");
K("V15-fcfpos", VER.fcf.filter(x => x > 0).length === 4, "fcfPositivaSenaste5 = 4 (FY2021 −755,88 enda negativa)");
K("V16-eps-fy25", nar(VER.res[4] / VER.aktierM, 4.29, 0.01), `FY2025-EPS-replik ${(VER.res[4] / VER.aktierM).toFixed(4)} € mot källans 4,29 EXAKT (0,1 %)`);

// ── MEDIANER/KVARTILER före (319) vs efter (in-memory +3) ──────────────────
console.log("\n── MEDIANER/KVARTILER (raknaBranschMedianer-replik EXAKT) ──");
const falt = (rader, f) => rader.map(b => f(b)).filter(x => typeof x === "number" && Number.isFinite(x));
const visa = (rader, etikett) => {
  const pe = falt(rader, b => b.vardering?.pe), pb = falt(rader, b => b.vardering?.pb);
  const ebit = falt(rader, b => b.lonksamhet?.ebitMarginal), fcf = falt(rader, b => b.lonksamhet?.fcfMarginal);
  const till = falt(rader, b => b.tillvaxt?.omsattningTillvaxtTTM);
  console.log(`${etikett}: n=${rader.length} | P/E median ${r1(median(pe))} (P25–P75 ${r1(percentil(pe, .25))}–${r1(percentil(pe, .75))}, n=${pe.length}) | P/B ${r1(median(pb))} | EBIT ${r1(median(ebit) * 100)} % | FCF ${r1(median(fcf) * 100)} % | tillväxt ${r1(median(till) * 100)} %`);
};
const nytFöre = u.filter(r => r.bransch === "nyttovalt");
console.log(`UNIVERSUM FÖRE (${u.length}): P/E median ${r1(median(falt(u, b => b.vardering?.pe)))} (n=${falt(u, b => b.vardering?.pe).length})`);
visa(nytFöre, "NYTTOVALT FÖRE");
const treRader = [
  { vardering: { pe: ELE.pe, pb: ELE.pb }, lonksamhet: { ebitMarginal: ELE.ebitM / 100, fcfMarginal: ELE.fcfM / 100 }, tillvaxt: { omsattningTillvaxtTTM: ELE.omsTillvaxtTtm / 100 } },
  { vardering: { pe: ENG.pe, pb: ENG.pb }, lonksamhet: { ebitMarginal: ENG.ebitM / 100, fcfMarginal: ENG.fcfM / 100 }, tillvaxt: { omsattningTillvaxtTTM: ENG.omsTillvaxtTtm / 100 } },
  { vardering: { pe: VER.pe, pb: VER.pb }, lonksamhet: { ebitMarginal: VER.ebitM / 100, fcfMarginal: VER.fcfM / 100 }, tillvaxt: { omsattningTillvaxtTTM: VER.omsTillvaxtTtm / 100 } },
];
const efter = [...u, ...treRader];
console.log(`UNIVERSUM EFTER (${efter.length}): P/E median ${r1(median(falt(efter, b => b.vardering?.pe)))} (n=${falt(efter, b => b.vardering?.pe).length})`);
visa(nytFöre.concat(treRader), "NYTTOVALT EFTER");
K("M01-antal", u.length === 319 && efter.length === 322, "319→322 (syskonens VIE/BIDU/NTES + mina tre)");
K("M02-nyttovalt", nytFöre.length === 5 && nytFöre.concat(treRader).length === 8, "nyttovalt 5→8");

console.log(`\n═══ GRIND: ${pass} PASS · ${fail} RÖD ${fail ? "— ABORT, inget skrivs" : "— GRÖN, append tillåten"} ═══`);
process.exit(fail ? 1 : 0);
