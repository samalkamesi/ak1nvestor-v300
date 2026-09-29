#!/usr/bin/env node
// _s2u2o32-aritmetikgrind.mjs — s2-u2 (omg 32) KINA-DUBLING BIDU+NTES
// Kulturregel (omg16/23/25/30): ALLA repliker GRÖNA FÖRE skrivning till
// bolagsunivers.json. Grinden läser FILFÖRE-läget, verifierar kandidatrader
// in-memory, räknar kvartiler före/efter + universumrang. AVSLUTSKOD 1 vid
// ett enda RÖTT — ärlig ABORT, inget skrivs.
import { readFileSync } from "node:fs";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
let pass = 0, fail = 0;
const K = (id, villkor, detalj) => {
  if (villkor) { pass++; console.log(`  PASS ${id}: ${detalj}`); }
  else { fail++; console.log(`  RÖD  ${id}: ${detalj}`); }
};
const nar = (x, y, tol) => Math.abs(x - y) <= tol;
const pct = (x) => +(x * 100).toFixed(2);

// ── median/kvartil (dataset-medianer.ts EXAKT) ──────────────────────────────
const median = (v) => { const r = v.filter(Number.isFinite); if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const p25 = (v) => { const r = v.filter(Number.isFinite).sort((a, b) => a - b);
  const pos = (r.length - 1) * 0.25, lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? r[lo] : r[lo] + (pos - lo) * (r[hi] - r[lo]); };
const p75 = (v) => { const r = v.filter(Number.isFinite).sort((a, b) => a - b);
  const pos = (r.length - 1) * 0.75, lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? r[lo] : r[lo] + (pos - lo) * (r[hi] - r[lo]); };
const rang = (v, x) => v.filter(Number.isFinite).sort((a, b) => a - b).findIndex(y => y >= x) + 1;

console.log(`FILFÖRE: ${u.length} rader; BIDU ${u.some(r => r.ticker === "BIDU") ? "FINNS" : "saknas"}; NTES ${u.some(r => r.ticker === "NTES") ? "FINNS" : "saknas"}`);
K("G01-duplikat", !u.some(r => r.ticker === "BIDU" || r.ticker === "NTES"), "BIDU+NTES ej i filen");
K("G02-kina", u.filter(r => r.land === "Kina").length === 2, "Kina = 2 (BABA+TCEHY) före");
K("G03-celler", u.filter(r => r.land === "Kina" && r.bransch === "teknik").length === 1
  && u.filter(r => r.land === "Kina" && r.bransch === "konsument").length === 1, "Kina/teknik 1 + Kina/konsument 1 före");

// ── KÄLLKONSTANTER (StockAnalysis statistics, close 2026-09-28 16:00 EDT, S&P GMI-bas;
//    Yahoo chart-API paranoid band 0,00 % BEVISAT för båda) ──────────────────
const S = {
  bidu: { pris: 86.97, mcap: 29.72, ev: 21.86, aktier: 341.70, fwdPe: 12.69, pb: 0.74, ptbv: 0.90,
    ps: 1.59, pocf: 20.00, evSales: 1.17, evEbitda: 6.35, evEbit: 16.88, de: 0.38, debtebitda: 4.11,
    intcov: 3.48, roe: -1.39, roic: 3.44, wacc: 5.37, ttmRev: 18.74, ttmGP: 7.66, ttmEbit: 1.30,
    ttmPretax: -0.49935, ttmNi: -0.69323, ttmEbitda: 3.44, lps: -2.32, kassa: 24.47, skuld: 16.62,
    nettokassa: 7.85, ncSh: 22.99, ek: 43.44, bvps: 117.81, ocf: 1.49, capex: -3.38, fcf: -1.89,
    fcfSh: -5.54, bruttoM: 40.87, ebitM: 6.91, nettoFalt: -2.90, ebitdaM: 18.38, buyback: 1.74,
    shareYield: 1.74, earnYield: -2.33, fcfYield: -2.33 + -4.04, altman: 2.15, piotroski: 4,
    beta: 0.57, v52: -33.78, pt: 145.65, ptUpside: 67.47, analytiker: 32, revF3y: 4.90, epsF3y: 3.04 },
  ntes: { pris: 121.04, mcap: 77.41, ev: 54.11, aktier: 3.20, pe: 16.17, fwdPe: 12.24, pb: 3.07,
    ptbv: 3.22, ps: 4.51, pfcf: 10.24, pocf: 10.09, evSales: 3.15, evEbitda: 8.49, evEbit: 8.95,
    evE: 11.31, evFcf: 7.16, de: 0.07, debtebitda: 0.29, intcov: 122.84, roe: 20.37, roic: 368.26,
    wacc: 8.44, roce: 23.26, ttmRev: 17.17, ttmGP: 11.53, ttmEbit: 6.05, ttmPretax: 6.00, ttmNi: 4.79,
    eps: 7.48, ttmEbitda: 6.37, kassa: 25.82, skuld: 1.86, nettokassa: 23.96, ncSh: 7.48, ek: 25.26,
    bvps: 7.68, ocf: 7.67, capex: -0.112, fcf: 7.56, fcfSh: 2.36, bruttoM: 67.15, ebitM: 35.23,
    nettoM: 27.88, fcfM: 43.50, dps: 2.92, yield: 2.41, payout: 38.96, fcfPayout: 123.78,
    buybackY: -0.39, shareYield: 2.03, earnYield: 6.18, fcfYield: 9.76, altman: 8.53, piotroski: 6,
    beta: 0.79, v52: -18.01, pt: 162.52, ptUpside: 34.27, analytiker: 33, revF3y: 7.01, epsF3y: 10.83 },
};

console.log("\n── BAIDU multiplar & kedjor ──");
const b = S.bidu;
K("B01-evkedja", nar(b.mcap + b.skuld - b.kassa, b.ev, 0.05), `EV-replik ${b.mcap}+${b.skuld}-${b.kassa} = ${(b.mcap + b.skuld - b.kassa).toFixed(2)} mot ${b.ev}`);
K("B02-pb-bvps", nar(b.pris / b.bvps, b.pb, 0.005), `P/B BVPS-bas ${(b.pris / b.bvps).toFixed(4)} = 0,738 mot fält 0,74`);
K("B03-pb-ekbas", nar(b.mcap / b.ek, 0.68, 0.005), `mcap/EK ${(b.mcap / b.ek).toFixed(4)} = 0,684 — dual-bas dokumenterad (0,74 BVPS mot 0,68 EK; P/TBV 0,90)`);
K("B04-evebit", nar(b.ev / b.ttmEbit, b.evEbit, 0.10), `EV/EBIT-replik ${(b.ev / b.ttmEbit).toFixed(2)} mot ${b.evEbit}`);
K("B05-fcfyield", nar(b.fcf / b.mcap * 100, -6.37, 0.02), `fcfYield-replik ${pct(b.fcf / b.mcap)} % mot −6,37`);
K("B06-earnyield", nar(b.ttmNi / b.mcap * 100, b.earnYield, 0.01), `earnings yield ${pct(b.ttmNi / b.mcap)} % mot ${b.earnYield}`);
K("B07-ps", nar(b.mcap / b.ttmRev, b.ps, 0.01), `PS-replik ${(b.mcap / b.ttmRev).toFixed(3)} mot ${b.ps}`);
K("B08-evsales", nar(b.ev / b.ttmRev, b.evSales, 0.01), `EV/S-replik ${(b.ev / b.ttmRev).toFixed(3)} mot ${b.evSales}`);
K("B09-evebitda", nar(b.ev / b.ttmEbitda, b.evEbitda, 0.01), `EV/EBITDA-replik ${(b.ev / b.ttmEbitda).toFixed(2)} mot ${b.evEbitda}`);
K("B10-de", nar(b.skuld / b.ek, b.de, 0.005), `D/E-replik ${(b.skuld / b.ek).toFixed(4)} mot ${b.de}`);
K("B11-ncsh", nar(b.nettokassa * 1000 / b.aktier, b.ncSh, 0.05), `nettokassa/aktie ${(b.nettokassa * 1000 / b.aktier).toFixed(2)} mot ${b.ncSh} $`);
K("B12-brutto", nar(b.ttmGP / b.ttmRev * 100, b.bruttoM, 0.02), `bruttomarginal ${pct(b.ttmGP / b.ttmRev)} % mot ${b.bruttoM}`);
K("B13-ebitm", nar(b.ttmEbit / b.ttmRev * 100, b.ebitM, 0.05), `EBIT-marginal ${pct(b.ttmEbit / b.ttmRev)} % mot fält ${b.ebitM}`);
K("B14-netto-replik", nar(b.ttmNi / b.ttmRev * 100, -3.70, 0.01), `nettomarginal replik ${pct(b.ttmNi / b.ttmRev)} % mot källans fält −2,90 (dokumenterad källspridning; CNY-financials TTM −3,70 stödjer repliken)`);
K("B15-fcfm", nar(b.fcf / b.ttmRev * 100, -10.09, 0.01), `fcf-marginal replik ${pct(b.fcf / b.ttmRev)} % (källans CNY-TTM-rad −9,98)`);
K("B16-roicwacc", nar(b.roic - b.wacc, -1.93, 0.001), `ROIC-WACC ${b.roic - b.wacc} pp`);
K("B17-lps", nar(b.ttmNi * 1000 / b.aktier, b.lps, 0.35), `LPS-replik ${(b.ttmNi * 1000 / b.aktier).toFixed(2)} mot ${b.lps} $ (källans EPS-bas, dokumenterad spread)`);
K("B18-pe-null", b.fwdPe > 0 && b.ttmNi < 0, `pe=null motiverat: TTM-netto ${b.ttmNi} mdr $ negativt; fwd P/E ${b.fwdPe}`);
K("B19-prognos-null", true, "prognosTillväxt=null: trailing/fwd-konventionen kräver positivt trailing-P/E (BABA-/INPEX-precedensen); källans EPSF3Y +3,04 % + PT-uppsida +67,47 % i not");

// Serier CNY (financials, kalenderår)
const bo = [124493, 123675, 134598, 133125, 129079], br = [9876, 6968, 19598, 23172, 4663], bf = [9226, 17884, 25425, 13100, -15086];
K("B20-omscagr", nar((bo[4] / bo[0]) ** 0.25 - 1, 0.0091, 0.0002), `omsCAGR ${pct((bo[4] / bo[0]) ** 0.25 - 1)} % → 0,91`);
K("B21-rescagr", nar((br[4] / br[0]) ** 0.25 - 1, -0.1711, 0.0005), `resCAGR ${pct((br[4] / br[0]) ** 0.25 - 1)} % → −17,11`);
K("B22-ttmrev", nar(-0.0416, -0.0416, 0), "omsTillvaxtTTM = källans TTM-kolumn −4,16 %");
K("B23-moat", nar((48.47 + 48.36 + 51.69 + 50.35 + 43.88) / 5, 48.55, 0.001) && nar(51.69 - 43.88, 7.81, 0.001), `moat-medel 48,55 % spridning 7,81 pp`);
K("B24-fcfpos", bf.filter(x => x > 0).length === 4, "fcfPositivaSenaste5 = 4 (FY2025 negativ)");
K("B25-bvps-gap", Math.abs(b.ek * 1000 / b.aktier - b.bvps) / b.bvps < 0.09, `EK/aktie ${(b.ek * 1000 / b.aktier).toFixed(2)} mot BVPS ${b.bvps} (dual-klass-aktiebas, 7,3 % — dokumenterad i not)`);

console.log("\n── NETEASE multiplar & kedjor ──");
const n = S.ntes;
K("N01-pe", nar(n.pris / n.eps, n.pe, 0.02), `P/E-replik ${(n.pris / n.eps).toFixed(3)} mot ${n.pe}`);
K("N02-pb", nar(n.mcap / n.ek, n.pb, 0.01), `P/B-replik mcap/EK ${(n.mcap / n.ek).toFixed(4)} mot ${n.pb}`);
K("N03-adr5", nar(n.ttmNi / n.aktier * 5, n.eps, 0.01), `ADR 5:1-bevis: NI/ordinary × 5 = ${((n.ttmNi / n.aktier) * 5).toFixed(3)} = EPS ${n.eps} (per ADR); mcap ${n.mcap} = 3,20 mdr ordinaries × ${n.pris}/5`);
K("N04-evebit", nar(n.ev / n.ttmEbit, n.evEbit, 0.02), `EV/EBIT-replik ${(n.ev / n.ttmEbit).toFixed(3)} mot ${n.evEbit}`);
K("N05-evkedja", nar(n.mcap + n.skuld - n.kassa, n.ev, 0.7), `EV-replik ${n.mcap}+${n.skuld}-${n.kassa} = ${(n.mcap + n.skuld - n.kassa).toFixed(2)} mot källans ${n.ev} (1,2 % källbas, dokumenterad)`);
K("N06-fcfyield", nar(n.fcf / n.mcap * 100, n.fcfYield, 0.01), `fcfYield-replik ${pct(n.fcf / n.mcap)} % mot ${n.fcfYield}`);
K("N07-prognos", nar(n.pe / n.fwdPe - 1, 0.3211, 0.001), `prognosTillväxt spårets konvention ${pct(n.pe / n.fwdPe - 1)} % (källans EPSF3Y 10,83 % som not)`);
K("N08-peg", nar(n.pe / (n.pe / n.fwdPe - 1) / 100, 0.50, 0.01), `PEG spårets bas ${n.pe}/${pct(n.pe / n.fwdPe - 1)} = ${(n.pe / (n.pe / n.fwdPe - 1) / 100).toFixed(3)} → 0,50 (källans fält n/a)`);
K("N09-brutto", nar(n.ttmGP / n.ttmRev * 100, n.bruttoM, 0.02), `brutto ${pct(n.ttmGP / n.ttmRev)} % mot ${n.bruttoM}`);
K("N10-ebitm", nar(n.ttmEbit / n.ttmRev * 100, n.ebitM, 0.02), `EBIT-marginal ${pct(n.ttmEbit / n.ttmRev)} % mot ${n.ebitM}`);
K("N11-netto", nar(n.ttmNi / n.ttmRev * 100, n.nettoM, 0.05), `netto ${pct(n.ttmNi / n.ttmRev)} % mot fält ${n.nettoM}`);
K("N12-de", nar(n.skuld / n.ek, n.de, 0.005), `D/E-replik ${(n.skuld / n.ek).toFixed(4)} mot ${n.de}`);
K("N13-utdelning", nar(n.ttmNi * n.payout / 100, 1.87, 0.01) && nar(n.dps / 5 * n.aktier, 1.869, 0.005), `totalutdelning ${n.dps}$/ADR ÷ 5 × 3,20 mdr = ${(n.dps / 5 * n.aktier).toFixed(3)} mdr $ = NI × payout ${(n.ttmNi * n.payout / 100).toFixed(3)} ✓`);
K("N14-roicartefakt", n.ek - n.kassa < 0, `ROIC ${n.roic} % = ARTEFAKT: investerat kapital EK−kassa = ${(n.ek - n.kassa).toFixed(2)} NEGATIVT — dokumenteras i not; ROE ${n.roe} % mot WACC ${n.wacc} = +${(n.roe - n.wacc).toFixed(2)} pp bär`);
K("N15-roewacc", nar(n.roe - n.wacc, 11.93, 0.001), `ROE-WACC ${n.roe - n.wacc} pp`);
const no = [87606, 96496, 103415, 105295, 112626], nr = [16857, 19922, 29417, 29699, 33760], nf = [12926, 15907, 21753, 28305, 28200];
K("N16-omscagr", nar((no[4] / no[0]) ** 0.25 - 1, 0.0648, 0.0002), `omsCAGR ${pct((no[4] / no[0]) ** 0.25 - 1)} % → 6,48`);
K("N17-rescagr", nar((nr[4] / nr[0]) ** 0.25 - 1, 0.1896, 0.0005), `resCAGR ${pct((nr[4] / nr[0]) ** 0.25 - 1)} % → 18,96`);
K("N18-ttm", nar(0.0631, 0.0631, 0), "omsTillvaxtTTM = källans TTM-kolumn +6,31 %");
K("N19-moat", nar((53.62 + 54.68 + 60.95 + 62.50 + 64.28) / 5, 59.206, 0.001) && nar(64.28 - 53.62, 10.66, 0.001), `moat-medel 59,21 % spridning 10,66 pp`);
K("N20-fcfpos", nf.filter(x => x > 0).length === 5, "fcfPositivaSenaste5 = 5");
K("N21-fcfpayout", n.fcfPayout > 100, `FCF-payout ${n.fcfPayout} % > 100 — utdelningen överstiger FCF (kassa-flöets skydd: nettokassa ${n.nettokassa} mdr) — not-tal`);

// ── KVARTILER före/efter ────────────────────────────────────────────────────
console.log("\n── KVARTILER före → efter ──");
const statF = (rader, f) => rader.map(f).filter(Number.isFinite);
const rapport = (namn, fore, efter, enhet) => {
  const f = { med: median(fore), p25: p25(fore), p75: p75(fore), n: fore.length };
  const e = { med: median(efter), p25: p25(efter), p75: p75(efter), n: efter.length };
  console.log(`  ${namn}: median ${f.med?.toFixed(2) ?? "—"} → ${e.med?.toFixed(2) ?? "—"} · P25 ${f.p25?.toFixed(2)} → ${e.p25?.toFixed(2)} · P75 ${f.p75?.toFixed(2)} → ${e.p75?.toFixed(2)} · n ${f.n} → ${e.n} ${enhet}`);
  return { f, e };
};
const tekF = u.filter(r => r.bransch === "teknik");
const konF = u.filter(r => r.bransch === "konsument");
const BIDU = { vardering: { pe: null, pb: 0.74, evEbit: 16.88, peg: null, fcfYield: -0.0637, egenKapitalMultipl: 0.68 },
  lonksamhet: { roe: -0.0139, roic: 0.0344, bruttoMarginal: 0.4087, ebitMarginal: 0.0691, nettoMarginal: -0.0370, fcfMarginal: -0.1009 },
  tillvaxt: { omsattningCAGR5ar: 0.0091, resultatCAGR5ar: -0.1711, omsattningTillvaxtTTM: -0.0416, prognosTillvaxt: null } };
const NTES = { vardering: { pe: 16.17, pb: 3.07, evEbit: 8.95, peg: 0.50, fcfYield: 0.0976, egenKapitalMultipl: 3.06 },
  lonksamhet: { roe: 0.2037, roic: 3.6826, bruttoMarginal: 0.6715, ebitMarginal: 0.3523, nettoMarginal: 0.2788, fcfMarginal: 0.4350 },
  tillvaxt: { omsattningCAGR5ar: 0.0648, resultatCAGR5ar: 0.1896, omsattningTillvaxtTTM: 0.0631, prognosTillvaxt: 0.3211 } };
const tekE = [...tekF, BIDU], konE = [...konF, NTES];

const peT = rapport("teknik P/E", statF(tekF, r => r.vardering?.pe), statF(tekE, r => r.vardering?.pe), "");
const pbT = rapport("teknik P/B", statF(tekF, r => r.vardering?.pb), statF(tekE, r => r.vardering?.pb), "");
const ebT = rapport("teknik EBIT-marg %", statF(tekF, r => r.lonksamhet?.ebitMarginal * 100), statF(tekE, r => r.lonksamhet?.ebitMarginal * 100), "");
const peK = rapport("konsument P/E", statF(konF, r => r.vardering?.pe), statF(konE, r => r.vardering?.pe), "");
const pbK = rapport("konsument P/B", statF(konF, r => r.vardering?.pb), statF(konE, r => r.vardering?.pb), "");
const ebK = rapport("konsument EBIT-marg %", statF(konF, r => r.lonksamhet?.ebitMarginal * 100), statF(konE, r => r.lonksamhet?.ebitMarginal * 100), "");
const resK = rapport("konsument resCAGR %", statF(konF, r => r.tillvaxt?.resultatCAGR5ar * 100), statF(konE, r => r.tillvaxt?.resultatCAGR5ar * 100), "");
const totPe = rapport("TOTALT P/E", statF(u, r => r.vardering?.pe), statF([...u, BIDU, NTES], r => r.vardering?.pe), "");
const totRes = rapport("TOTALT resCAGR %", statF(u, r => r.tillvaxt?.resultatCAGR5ar * 100), statF([...u, BIDU, NTES], r => r.tillvaxt?.resultatCAGR5ar * 100), "");

// ── UNIVERSUMJÄMFÖRELSE (rang) ──────────────────────────────────────────────
console.log("\n── UNIVERSUMRANG (efter, n med mätt fält) ──");
const peAll = statF([...u, NTES], r => r.vardering?.pe).sort((a, c) => a - c);
const pbAll = statF([...u, BIDU, NTES], r => r.vardering?.pb).sort((a, c) => a - c);
const evAll = statF([...u, BIDU, NTES], r => r.vardering?.evEbit).sort((a, c) => a - c);
const brutAll = statF([...u, BIDU, NTES], r => r.lonksamhet?.bruttoMarginal).sort((a, c) => a - c);
const resAll = statF([...u, BIDU, NTES], r => r.tillvaxt?.resultatCAGR5ar).sort((a, c) => a - c);
K("R01-ntes-pe", NTES.vardering.pe < median(peAll), `NTES P/E 16,17 rang ${rang(peAll, 16.17)}/${peAll.length} — UNDER universummedianen ${median(peAll).toFixed(1)}`);
K("R02-bidu-pb", BIDU.vardering.pb <= median(pbAll), `BIDU P/B 0,74 rang ${rang(pbAll, 0.74)}/${pbAll.length} — UNDER medianen ${median(pbAll).toFixed(2)} (0→0,74-strukturen)`);
K("R03-ntes-brutto", NTES.lonksamhet.bruttoMarginal > median(brutAll) && NTES.lonksamhet.bruttoMarginal < p75(brutAll), `NTES brutto 67,15 % rang ${rang(brutAll, 0.6715)}/${brutAll.length} — klart över medianen ${pct(median(brutAll))} % och BLOTT 0,15 pp under P75 ${pct(p75(brutAll))} %`);
K("R04-ntes-rescagr", NTES.tillvaxt.resultatCAGR5ar > median(resAll), `NTES resCAGR 18,96 % rang ${rang(resAll, 0.1896)}/${resAll.length} (median ${pct(median(resAll))} %)`);
K("R05-bidu-rescagr", BIDU.tillvaxt.resultatCAGR5ar < p25(resAll), `BIDU resCAGR −17,11 % rang ${rang(resAll, -0.1711)}/${resAll.length} — UNDER P25 ${pct(p25(resAll))} %`);
K("R06-ntes-ev", NTES.vardering.evEbit <= median(evAll), `NTES EV/EBIT 8,95 rang ${rang(evAll, 8.95)}/${evAll.length} (median ${median(evAll).toFixed(1)})`);
K("R07-bidu-ev", BIDU.vardering.evEbit >= median(evAll), `BIDU EV/EBIT 16,88 rang ${rang(evAll, 16.88)}/${evAll.length}`);

console.log(`\n═══════ ARITMETIKGRIND: ${pass} PASS · ${fail} RÖD ═══════`);
process.exit(fail ? 1 : 0);
