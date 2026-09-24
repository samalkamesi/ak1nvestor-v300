#!/usr/bin/env node
// _s2u1o30-grind.mjs — AUTO-S2 omgång 30 u1 (manifest auto-s2-1790237704889):
// ARITMETIKGRIND för INPEX 1605.T. Källtal nedan är SKRIVNA DIREKT ur
// hämtningen 2026-09-24 (StockAnalysis tyo/1605, S&P GMI) — radens fält
// importeras och kontrolleras MOT dem. Ett enda RÖTT = ABORT (exit 1),
// universumfilen rörs ALDRIG här. Enheterna: JPY hela; serier i hela yen.
import { RAAD } from "./_s2u1o30-inpex-rad.mjs";

// ── källtal (hämtade 2026-09-24) ────────────────────────────────────────────
const K = {
  kurs: 3834, prevClose: 3913, epsTTM: 369.2, peKalla: 10.6, peFwdKalla: 8.92,
  bvpsTTM: 4390.36, commonEkTTM: 5102570, minoritetTTM: 248382, totalEkTTM: 5350952,
  skuldTTM: 1318323, kassaTTM: 216190, nettoskuldKalla: 1102.133,
  omsTTM: 1962979, bruttoTTM: 1102424, ebitTTM: 998113, nettoTTM: 433456,
  fcfTTM: 420793, daTTM: 378948, debtEbitdaKalla: 0.96,
  deKalla: 0.25, roeKalla: 0.0927, roicKalla: 0.0632, waccKalla: 0.0311,
  rantaTackKalla: 17.34, dps: 112, payoutKalla: 0.2727,
  oms: [1244369, 2324660, 2164516, 2265837, 2011351],          // M ¥ 2021–2025
  brutto: [675448, 1381246, 1316436, 1350527, 1146836],        // M ¥
  netto: [223048, 438276, 321708, 427344, 393836],             // M ¥
  ek: [3346409, 4038360, 4499033, 5137832, 5022903],           // M ¥ total-EK
  fcf: [304987, 564184, 535996, 353676, 399867],               // M ¥
  utdelning: [46718, 80399, 90147, 100248, 111412],            // M ¥ betalda
  aterkop: [69999, 121191, 99999, 130000, 90411],              // M ¥
};

let pass = 0, fail = 0;
const t = (namn, falt, replik, tol = 0.005) => {
  const ok = typeof falt === "number" && Math.abs(falt - replik) <= tol;
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${namn}: fält ${falt} mot replik ${replik.toFixed(6)} (tol ${tol})`);
};
const cagr = (slut, bas, ar) => Math.pow(slut / bas, 1 / ar) - 1;

// 1. värderingskedjan (kurskoherent publikationskedja)
t("P/E replik kurs/EPS", RAAD.vardering.pe, K.kurs / K.epsTTM, 0.01);
t("P/B replik kurs/BVPS", RAAD.vardering.pb, K.kurs / K.bvpsTTM, 0.005);
t("mcap mdr", RAAD.marknadsKapitalMdr, (K.kurs * (K.commonEkTTM / K.bvpsTTM)) / 1000, 1);
t("mcap prev-close-källans 4,55 T", (K.prevClose * (K.commonEkTTM / K.bvpsTTM)) / 1000, 4547.7, 1); // källspridning dokumenterad
t("nettoskuld", (K.skuldTTM - K.kassaTTM) / 1000, K.nettoskuldKalla, 0.001);
t("EV/EBIT", RAAD.vardering.evEbit, (RAAD.marknadsKapitalMdr + K.nettoskuldKalla) / (K.ebitTTM / 1000), 0.01);
t("Debt/EBITDA (källspridning)", K.skuldTTM / (K.ebitTTM + K.daTTM), K.debtEbitdaKalla, 0.005);

// 2. marginalerna (kvartals-exakta ur TTM)
t("bruttoMarginal", RAAD.lonksamhet.bruttoMarginal, K.bruttoTTM / K.omsTTM, 0.0002);
t("ebitMarginal", RAAD.lonksamhet.ebitMarginal, K.ebitTTM / K.omsTTM, 0.0002);
t("nettoMarginal", RAAD.lonksamhet.nettoMarginal, K.nettoTTM / K.omsTTM, 0.0002);
t("fcfMarginal", RAAD.lonksamhet.fcfMarginal, K.fcfTTM / K.omsTTM, 0.0002);
t("fcfYield", RAAD.vardering.fcfYield, K.fcfTTM / 1000 / RAAD.marknadsKapitalMdr, 0.0005);

// 3. tillväxt
t("omsattningCAGR5ar (2021→2025, 4 år)", RAAD.tillvaxt.omsattningCAGR5ar, cagr(K.oms[4], K.oms[0], 4), 0.0005);
t("resultatCAGR5ar", RAAD.tillvaxt.resultatCAGR5ar, cagr(K.netto[4], K.netto[0], 4), 0.0005);
t("omsattningTillvaxtTTM", RAAD.tillvaxt.omsattningTillvaxtTTM, -0.0757, 0.0001);
t("prognosTillvaxt fwd-EPS-vägen", RAAD.tillvaxt.prognosTillvaxt, K.kurs / K.peFwdKalla / K.epsTTM - 1, 0.001);
t("peg = pe/prognosprocent", RAAD.vardering.peg, RAAD.vardering.pe / (RAAD.tillvaxt.prognosTillvaxt * 100), 0.01);

// 4. moat i FRACTION (omg29-u1:s konvention; Komatsu-raden bär procent = de 16 kända)
const bm = K.brutto.map((g, i) => g / K.oms[i]);
t("moat.medel5ar", RAAD.moat.bruttoMarginalMedel5ar, bm.reduce((a, b) => a + b, 0) / 5, 0.0002);
t("moat.spread5ar", RAAD.moat.bruttoMarginalSpread5ar, Math.max(...bm) - Math.min(...bm), 0.0002);

// 5. stabilitet + återbäring
t("skuldEgenkapital", RAAD.stabilitet.skuldEgenkapital, K.skuldTTM / K.totalEkTTM, 0.005);
t("rantaTackning (källfält)", RAAD.stabilitet.rantaTackning, K.rantaTackKalla, 0.005);
t("minoritetsposten", K.minoritetTTM / K.totalEkTTM, 0.0464, 0.0005); // 4,6 % av total-EK — dokumenterad BAS-SPLITTRA
t("aterkop senasteAr = utdelning FY2025", RAAD.aterkop.senasteArMdr, K.utdelning[4] / 1000, 0.001);
t("shareholder yield FY2025", (K.utdelning[4] + K.aterkop[4]) / 1000 / RAAD.marknadsKapitalMdr, 0.0453, 0.0005);
t("utdelningsandel av FCF FY2025", (K.utdelning[4] + K.aterkop[4]) / K.fcf[4], 0.5046, 0.001);
t("payout TTM-bas", (K.dps * (K.commonEkTTM / K.bvpsTTM)) / K.nettoTTM, 0.3003, 0.0005); // källans 27,27 % är prognosbas — TTM-basen 30,0 % dokumenterad

// 6. källfält utan full replik (källspridningsdokumentation)
t("roe källfält", RAAD.lonksamhet.roe, K.roeKalla, 0);
t("roic källfält", RAAD.lonksamhet.roic, K.roicKalla, 0);
t("ROIC−WACC spread", RAAD.lonksamhet.roic - K.waccKalla, 0.0321, 0.0001);
t("roe replik common-EK (källspridning)", K.nettoTTM / K.commonEkTTM, 0.0850, 0.0005);

// 7. serier (hela yen, fem år, bokslutsbytesåret 2021 dokumenterat)
const ser = RAAD.serier;
t("serielängd summa 20", ser.omsattning.length + ser.resultat.length + ser.egetKapital.length + ser.fcf.length, 20, 0);
t("omsättning 2021 hela yen", ser.omsattning[0], K.oms[0] * 1e6, 0);
t("omsättning 2025 hela yen", ser.omsattning[4], K.oms[4] * 1e6, 0);
t("resultat 2025 hela yen", ser.resultat[4], K.netto[4] * 1e6, 0);
t("egetKapital 2025 hela yen (total-EK)", ser.egetKapital[4], K.ek[4] * 1e6, 0);
t("fcf 2025 hela yen", ser.fcf[4], K.fcf[4] * 1e6, 0);
t("fcfPositivaSenaste5", RAAD.stabilitet.fcfPositivaSenaste5, K.fcf.filter((x) => x > 0).length, 0);
t("BVPS-trappan 2021→2025", cagr(4073.44, 2253.17, 4), 0.1595, 0.005); // dokumentationsrad ur källans BVPS-kolumn

// 8. textvakt (CJK/typografiska citat/hårda mellanslag)
const text = JSON.stringify(RAAD);
const fusk = text.match(/[\u3000-\u9fff\uff00-\uffef\u201c\u201d\u2018\u2019\u00a0]/g);
if (fusk) { fail++; console.log("FAIL språkgrind: " + JSON.stringify(fusk.slice(0, 5))); }
else { pass++; console.log("PASS språkgrind: 0 CJK/typografiska/hårda mellanslag"); }
const lag = text.toLowerCase();
const radvakt = ["köp denna", "köp aktien", "köp nu", "sälj aktien", "sälj nu", "rekommenderar köp", "rekommenderar sälj", "bör köpa", "bör sälja", "råder vi", "investera i aktien"].filter((o) => lag.includes(o));
if (radvakt.length) { fail++; console.log("FAIL rådordsvakt: " + radvakt.join(",")); }
else { pass++; console.log("PASS rådordsvakt: 0 träffar"); }
if (RAAD.moat.bruttoMarginalMedel5ar <= 1 && RAAD.moat.bruttoMarginalSpread5ar <= 1) { pass++; console.log("PASS moat-FRACTION-konvention (omg29-u1)"); }
else { fail++; console.log("FAIL moat-konvention: fraction 0–1 krävs"); }

console.log(`\nGRIND: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) { console.log("ABORT — universumfilen rörs ej"); process.exit(1); }
