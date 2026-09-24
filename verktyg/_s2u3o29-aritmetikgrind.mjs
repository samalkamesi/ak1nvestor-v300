#!/usr/bin/env node
/**
 * s2-u3 omg29 (manifest auto-s2-1790237704889) — ARITMETIKGRIND för
 * INDIENTRION BHARTIARTL.NS + SUNPHARMA.NS + LT.NS.
 * Regler (omg16/23/25/27-mönstret): varje KRAV jämför maskinberäknad
 * replik mot källans fält; RÖT ut ⇒ exit 1 och bolagsunivers.json ORÖRD
 * (skrivningen sker ENDAST av universum-inlagg-skriptet efter GRÖN här).
 * Källor: StockAnalysis NSE (S&P GMI-underlag, kanon 2026-09-24, intraday
 * 13:50 IST) ×5 ytor per bolag + Yahoo chart-API paranoid ×3.
 */
const M = 1e6; // miljoner INR

// ── Källfält (ordagrant ur hämtningarna 2026-09-24) ──────────────────────────
const K = {
  bharti: {
    pris: 1803.00, mcapM: 11420000*M, evM: 13240000*M, pe: 39.49, fwd: 27.46, ps: 5.19, pb: 5.69,
    evEbit: 18.55, evEbitda: 10.59, fcfYieldPct: 6.77, roePct: 20.15, roicPct: 15.15, waccPct: 4.61,
    rantaTackning: 3.91, de: 1.00, beta5y: -0.00, dps: 24.00, divYieldPct: 1.33, payoutPct: 39.18,
    revTTM: 2200493 * M, nettoTTM: 289147 * M, epsTTM: 47.86, ebitMargPct: 32.25, nettoMargPct: 13.14,
    fcfMargPct: 35.12, bruttoMargPct: 67.86, omsTillPct: 19.6,
    rev: [1165469, 1391448, 1499824, 1729852, 2109728].map(x => x * M),
    netto: [42549, 83459, 74670, 335561, 266952].map(x => x * M),
    fcf: [284760, 392680, 407067, 604245, 770540].map(x => x * M),
    ek: [937056, 1064443, 1055639, 1534677, 1959634, 2006467].map(x => x * M), // FY22–26 + TTM (total, inkl NCI)
    ekCommonTTM: 1618151 * M, minoritetTTM: 388316 * M, bvpsTTM: 259.48,
    skuldTTM: 2014802 * M, nettoskuldTTM: -1430709 * M,
    aktierFiling: [5881, 5965, 6044, 6090, 6089, 6236].map(x => x * M),
    bruttoFY: [59.43, 62.09, 63.40, 64.84, 67.65], peHist: [101.08, 51.73, 97.35, 30.91, 40.71],
    yahoo: 1800.80,
  },
  sun: {
    pris: 1856.70, mcapM: 4470000*M, evM: 4190000*M, pe: 37.00, fwd: 34.47, ps: 7.47, pb: 5.33,
    evEbit: 30.49, evEbitda: 25.09, fcfYieldPct: 1.97, roicPct: 19.01, waccPct: 4.93,
    rantaTackning: 37.93, de: 0.06, beta: 0.12, dps: 16.00, divYieldPct: 0.86,
    revTTM: 599105 * M, nettoTTM: 120956 * M, epsTTM: 50.40, ebitTTM: 137965 * M, bruttoTTM: 472835 * M,
    ebitMargPct: 23.03, nettoMargPct: 20.19, fcfMargPct: 15.07, bruttoMargPct: 78.92,
    rev: [386545, 438857, 484969, 525784, 584620].map(x => x * M),
    netto: [32727, 84736, 95764, 109290, 114794].map(x => x * M),
    fcf: [74895, 28738, 99332, 119435, 88098].map(x => x * M),
    ek: [510661, 593155, 671259, 724860, 838797, 838797].map(x => x * M), // total inkl NCI; TTM samma som FY26
    ekCommon: [480112, 559954, 636668, 722180, 835701].map(x => x * M),
    bvps: [200.10, 233.38, 265.35, 300.99, 348.31],
    aktier: 2399 * M, aktierTTM: 2392 * M,
    kassa: 335166 * M, skuld: 46273 * M, nettokassa: 288893 * M,
    bruttoFY: [71.86, 74.21, 76.41, 78.02, 78.66], peHist: [67.06, 27.84, 40.60, 38.08, 36.73],
    yahoo: 1851.20,
  },
  lt: {
    pris: 3867.40, mcapM: 5400000*M, evM: 6080000*M, pe: 32.57, fwd: 25.25, ps: 1.82, pb: 4.20,
    evEbit: 19.51, evEbitda: 17.22, fcfYieldPct: 2.21, roicPct: 13.21, waccPct: 6.00,
    rantaTackning: 12.05, de: 0.98, beta: 0.51, dps: 38.00, divYieldPct: 0.98,
    revTTM: 2969008 * M, nettoTTM: 165897 * M, epsTTM: 108.03, ebitTTM: 313749 * M, bruttoTTM: 1111145 * M,
    ebitMargPct: 10.57, nettoMargPct: 5.59, fcfMargPct: 4.09, bruttoMargPct: 37.43,
    rev: [1587506, 1861940, 2251890, 2598063, 2916180].map(x => x * M),
    netto: [86693, 104707, 130591, 150371, 160840].map(x => x * M),
    fcf: [160530, 186332, 137498, 47325, 119318].map(x => x * M),
    ek: [953737, 1035672, 1025497, 1154037, 1285305, 1285305].map(x => x * M), // total inkl NCI
    ekCommon: [824077, 893260, 863592, 976556, 1092898].map(x => x * M),
    bvps: [586.52, 635.55, 628.22, 710.12, 794.47],
    aktier: [1405, 1405, 1375, 1375, 1376].map(x => x * M),
    kassa: 766147 * M, skuld: 1254966 * M, nettoskuld: -488819 * M,
    bruttoFY: [38.66, 39.09, 37.29, 36.57, 36.91], peHist: [28.65, 29.05, 39.73, 31.93, 29.97],
    orderbacklog: [3575950, 3970330, 4758090, 5791370, 7403270].map(x => x * M),
    yahoo: 3856.00,
  },
};

// ── Grindkropp ────────────────────────────────────────────────────────────────
const kraav = [];
const relPct = (a, b) => Math.abs(a - b) / Math.abs(b) * 100;
const add = (id, namn, raknat, vant, toleransPct) => kraav.push({
  id, namn, raknat, vant, avv: relPct(raknat, vant), ok: relPct(raknat, vant) <= toleransPct,
});
const cagr = (a, b, ar) => Math.pow(b / a, 1 / ar) - 1;

// ═══ BHARTIARTL ═══
const b = K.bharti;
add("B01", "PE-replik mcap/netto", b.mcapM / b.nettoTTM, b.pe, 0.1);
add("B02", "PS-replik mcap/revTTM", b.mcapM / b.revTTM, b.ps, 0.1);
add("B03", "PB-replik mcap/EK-total-TTM", b.mcapM / b.ek[5], b.pb, 0.2);
add("B04", "BVPS-replik EK-common-TTM/aktierTTM", b.ekCommonTTM / b.aktierFiling[5], b.bvpsTTM, 0.1);
add("B05", "minoritetsidentitet EK-total−common", (b.ek[5] - b.ekCommonTTM) / M, b.minoritetTTM / M, 0.5);
add("B06", "nettomarginal nettoTTM/revTTM", b.nettoTTM / b.revTTM * 100, b.nettoMargPct, 0.1);
add("B07", "fcfYield-replik FCF-TTM/mcap", 772800 * M / b.mcapM * 100, b.fcfYieldPct, 0.2);
add("B08", "fcfmarginal-replik FCF-TTM/revTTM", 772800 * M / b.revTTM * 100, b.fcfMargPct, 0.1);
add("B09", "D/E-replik skuldTTM/EK-totalTTM", b.skuldTTM / b.ek[5], b.de, 0.5);
add("B10", "DPS-yield 24/1803", b.dps / b.pris * 100, b.divYieldPct, 0.5);
add("B11", "prognosTillväxt pe/fwd−1", (b.pe / b.fwd - 1) * 100, 43.79, 0.1);
add("B12", "omsCAGR FY22→26", cagr(b.rev[0], b.rev[4], 4) * 100, 16.0, 1.0);
add("B13", "resCAGR FY22→26", cagr(b.netto[0], b.netto[4], 4) * 100, 58.3, 1.0);
add("B14", "FCF 5/5 positiva", b.fcf.every(x => x > 0) ? 1 : 0, 1, 0);
add("B15", "brutto-medel5 (moat)", b.bruttoFY.reduce((x, y) => x + y) / 5, 63.482, 0.1);
add("B16", "brutto-spread5 (moat)", Math.max(...b.bruttoFY) - Math.min(...b.bruttoFY), 8.22, 0.1);
add("B17", "Yahoo-band |1803,00−1800,80|/1800,80", relPct(b.pris, b.yahoo), 0.12, 100); // avv IS the band
add("B18", "EV-kedja mcap+nettoskuld vs källa (dokumenterad källspridning)", (b.mcapM - b.nettoskuldTTM) / M, b.evM / M, 3.1);
add("B19", "EBIT-marginalfältets belopp (32,25 % av revTTM)", b.ebitMargPct / 100 * b.revTTM / M, 709659, 0.5);
add("B20", "aktiebas trippel: filing×pris vs mcap (dokumenterad spridning)", b.aktierFiling[5] * b.pris / M, b.mcapM / M, 2.0);

// ═══ SUNPHARMA ═══
const s = K.sun;
add("S01", "PE-replik mcap/netto", s.mcapM / s.nettoTTM, s.pe, 0.2);
add("S02", "PB-replik mcap/EK-total", s.mcapM / s.ek[4], s.pb, 0.2);
add("S03", "BVPS-replik EK-common-FY26/aktier", s.ekCommon[4] / s.aktier, s.bvps[4], 0.2);
add("S04", "nettomarginal nettoTTM/revTTM", s.nettoTTM / s.revTTM * 100, s.nettoMargPct, 0.1);
add("S05", "EBIT-marginal ebitTTM/revTTM", s.ebitTTM / s.revTTM * 100, s.ebitMargPct, 0.1);
add("S06", "bruttomarginal bruttoTTM/revTTM", s.bruttoTTM / s.revTTM * 100, s.bruttoMargPct, 0.1);
add("S07", "fcfmarginal FY26 FCF/rev", s.fcf[4] / s.rev[4] * 100, s.fcfMargPct, 0.1);
add("S08", "fcfYield FCF/mcap", s.fcf[4] / s.mcapM * 100, s.fcfYieldPct, 0.2);
add("S09", "D/E skuld/EK", s.skuld / s.ek[4], s.de, 10); // fält 0,06 avrundat grovt — rå 0,0552
add("S10", "nettokassa/aktie", s.nettokassa / s.aktier, 120.41, 0.2);
add("S11", "EV-replik mcap−nettokassa", (s.mcapM - s.nettokassa) / M, s.evM / M, 0.3);
add("S12", "kassa−skuld=nettokassa", (s.kassa - s.skuld) / M, s.nettokassa / M, 0.1);
add("S13", "prognosTillväxt pe/fwd−1", (s.pe / s.fwd - 1) * 100, 7.34, 0.5);
add("S14", "omsCAGR FY22→26", cagr(s.rev[0], s.rev[4], 4) * 100, 10.9, 1.0);
add("S15", "resCAGR FY22→26", cagr(s.netto[0], s.netto[4], 4) * 100, 36.9, 1.0);
add("S16", "FCF 5/5 positiva", s.fcf.every(x => x > 0) ? 1 : 0, 1, 0);
add("S17", "brutto-medel5 (moat)", s.bruttoFY.reduce((x, y) => x + y) / 5, 75.832, 0.1);
add("S18", "brutto-spread5 (moat)", Math.max(...s.bruttoFY) - Math.min(...s.bruttoFY), 6.80, 0.1);
add("S19", "ROE härledd netto/EK (källa n/a)", s.nettoTTM / s.ek[4] * 100, 14.42, 0.5);
add("S20", "Yahoo-band", relPct(s.pris, s.yahoo), 0.30, 100);
add("S21", "DPS-yield 16/1856,70", s.dps / s.pris * 100, s.divYieldPct, 0.5);
add("S22", "minoritetsidentitet FY24 NCI i EK-total (Taro-fallet FY25: NCI 34592→2679)", (s.ek[2] - s.ekCommon[2]) / M, 34591, 0.1);

// ═══ LT ═══
const l = K.lt;
add("L01", "PE-replik mcap/netto", l.mcapM / l.nettoTTM, l.pe, 0.2);
add("L02", "PB-replik mcap/EK-total", l.mcapM / l.ek[4], l.pb, 0.2);
add("L03", "BVPS-replik EK-common-FY26/aktier", l.ekCommon[4] / l.aktier[4], l.bvps[4], 0.2);
add("L04", "nettomarginal nettoTTM/revTTM", l.nettoTTM / l.revTTM * 100, l.nettoMargPct, 0.1);
add("L05", "EBIT-marginal ebitTTM/revTTM", l.ebitTTM / l.revTTM * 100, l.ebitMargPct, 0.1);
add("L06", "bruttomarginal bruttoTTM/revTTM", l.bruttoTTM / l.revTTM * 100, l.bruttoMargPct, 0.1);
add("L07", "fcfmarginal FY26", l.fcf[4] / l.rev[4] * 100, l.fcfMargPct, 0.2);
add("L08", "fcfYield FCF/mcap", l.fcf[4] / l.mcapM * 100, l.fcfYieldPct, 0.2);
add("L09", "D/E skuld/EK", l.skuld / l.ek[4], l.de, 1.0);
add("L10", "nettoskuld-identitet kassa−skuld", (l.kassa - l.skuld) / M, l.nettoskuld / M, 0.1);
add("L11", "prognosTillväxt pe/fwd−1", (l.pe / l.fwd - 1) * 100, 28.99, 0.2);
add("L12", "omsCAGR FY22→26", cagr(l.rev[0], l.rev[4], 4) * 100, 16.4, 1.0);
add("L13", "resCAGR FY22→26", cagr(l.netto[0], l.netto[4], 4) * 100, 16.7, 1.0);
add("L14", "FCF 5/5 positiva", l.fcf.every(x => x > 0) ? 1 : 0, 1, 0);
add("L15", "brutto-medel5 (moat)", l.bruttoFY.reduce((x, y) => x + y) / 5, 37.704, 0.1);
add("L16", "brutto-spread5 (moat)", Math.max(...l.bruttoFY) - Math.min(...l.bruttoFY), 2.52, 0.1);
add("L17", "ROE härledd netto/EK (källa n/a)", l.nettoTTM / l.ek[4] * 100, 12.91, 0.5);
add("L18", "Yahoo-band", relPct(l.pris, l.yahoo), 0.30, 100);
add("L19", "DPS-yield 38/3867,40", l.dps / l.pris * 100, l.divYieldPct, 0.5);
add("L20", "orderbacklog-CAGR FY22→26", cagr(l.orderbacklog[0], l.orderbacklog[4], 4) * 100, 19.95, 1.0);
add("L21", "minoritetsidentitet FY26 NCI", (l.ek[4] - l.ekCommon[4]) / M, 192407, 0.5);

// ── Dom ───────────────────────────────────────────────────────────────────────
let roda = 0;
for (const k of kraav) {
  const status = k.ok ? "GRÖN" : "RÖD";
  if (!k.ok) roda++;
  console.log(`${status} ${k.id} ${k.namn}: räknat ${typeof k.raknat === "number" ? k.raknat.toFixed(4) : k.raknat} · väntat ${typeof k.vant === "number" ? k.vant.toFixed(4) : k.vant} · avv ${k.avv.toFixed(2)} %`);
}
console.log(`\n${kraav.length - roda}/${kraav.length} GRÖNA · ${roda} RÖDA`);
if (roda > 0) { console.error("ABORT: aritmetikgrinden RÖD — bolagsunivers.json förblir orörd tills alla kraav gröna"); process.exit(1); }
console.log("ARITMETIKGRIND GRÖN — universum-inlagg får skriva.");
