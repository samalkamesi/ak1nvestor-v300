#!/usr/bin/env node
/**
 * _s2u2o27-aritmetikgrind.mjs — AUTO-S2 omgång 27 u2: SRT3 + HFG.
 * ALLA identiteter mot källans fält INNAN någon skrivning sker.
 * ABORT vid ENDA miss (omg13/16/23/25-läxan: felet är leveransens —
 * rätta förväntat värde ENDAST om källbelägget bär det, aldrig målet).
 */
import { readFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const uni = JSON.parse(readFileSync(UNI, "utf8"));
if (uni.some((r) => r.ticker === "SRT3.DE" || r.ticker === "HFG.DE")) {
  console.log("ABORT: rad finns redan (inte idempotent tom yta)");
  process.exit(1);
}

let ok = 0, fel = 0;
const nara = (namn, räknat, förväntat, tol = 0.011) => {
  const d = Math.abs(räknat - förväntat) / Math.max(Math.abs(förväntat), 1e-9);
  const GRÖN = d <= tol;
  if (!GRÖN) fel++;
  else ok++;
  console.log(`${GRÖN ? "OK " : "FEL"} ${namn}: räknat ${räknat.toFixed(4)} mot ${förväntat} (d ${(d * 100).toFixed(2)} %)`);
};
const lika = (namn, a, b) => { const g = a === b; g ? ok++ : fel++; console.log(`${g ? "OK " : "FEL"} ${namn}: ${a} === ${b}`); };

/* ───────────────────────── SARTORIUS (SRT3.DE) ───────────────────────── */
console.log("\n═══ SRT3 — kurs/mcap ═══");
nara("mcap-replik 61.96 bas (15 410/248.70)", 15410 / 248.70, 61.96, 0.003); // källans mcap-fält bär TTM-bas — BAS-SPRIDNING vs aktiefält 69.04 (dokumenterad)
nara("BVPS-match: 39.20 × 69.05 = common-EK FY25", 39.20 * 69.05, 2707, 0.002);

console.log("\n═══ SRT3 — värdering ═══");
nara("P/E 15410/196.1", 15410 / 196.1, 78.58, 0.002);
nara("fwd-EPS-bas 15410/60.69", 15410 / 60.69, 253.9, 0.005);
nara("prognosTilläxt pe/fwdPe−1", 78.58 / 60.69 - 1, 0.2949, 0.004);
nara("PEG spårkonvention pe/prognosT-%", 78.58 / 29.49, 2.66, 0.01);
nara("PS 15410/3582", 15410 / 3582, 4.30, 0.003);
nara("PB total-EK 15410/3998", 15410 / 3998, 3.85, 0.003);
nara("P/FCF 15410/470.5", 15410 / 470.5, 32.75, 0.003);
nara("EV-replik TTM 15410+4052−291.3", 15410 + 4052 - 291.3, 19170.7, 0.001);
nara("EV-källfält bas 20350−15410", 20350 - 15410, 4940, 0.005); // dokumenterad bas-spridning mot TTM-nettoskuld 3761 (källan bär äldre GMI-bas ≈ FY2023:s 4917)
nara("EV/EBIT 20350/616.1", 20350 / 616.1, 33.20, 0.007);

console.log("\n═══ SRT3 — marginaler TTM ═══");
nara("brutto 1637.0/3582", (1637.0 / 3582) * 100, 45.71, 0.004);
nara("EBIT 616.1/3582", (616.1 / 3582) * 100, 17.20, 0.004);
nara("netto 196.1/3582", (196.1 / 3582) * 100, 5.48, 0.006);
nara("FCF 470.5/3582", (470.5 / 3582) * 100, 13.14, 0.004);
nara("fcfYield 470.5/15410", (470.5 / 15410) * 100, 3.05, 0.004);

console.log("\n═══ SRT3 — kassaflöde/balans ═══");
nara("OCF−capex 912.0−441.5", 912.0 - 441.5, 470.5, 0.001);
nara("FCF FY25 837.0−441.9", 837.0 - 441.9, 395.1, 0.002);
nara("nettoskuld TTM 4052−291.3", 4052 - 291.3, 3760.7, 0.001);
nara("D/E 4052/3998", 4052 / 3998, 1.01, 0.005);
nara("skatt statistics 124.7/404.4", (124.7 / 404.4) * 100, 30.84, 0.003);
nara("DPS-klipp 0.74/1.44−1", 0.74 / 1.44 - 1, -0.4861, 0.003);

console.log("\n═══ SRT3 — serier FY2021-25 ═══");
nara("omsCAGR (3538/3449)^(1/4)−1", Math.pow(3538 / 3449, 1 / 4) - 1, 0.0064, 0.02);
nara("resCAGR (154.9/318.9)^(1/4)−1", Math.pow(154.9 / 318.9, 1 / 4) - 1, -0.1652, 0.01);
nara("omsTillvaxtTTM spårkonvention 3582/3538", 3582 / 3538 - 1, 0.0124, 0.02);
nara("EPS×aktier FY23 3.01×68.42", 3.01 * 68.42, 205.9, 0.005); // CapIQ 205.2 korsbelagt — GMI-vyns nyrad skjuten ett år (dokumenterat)
nara("EPS×aktier FY25 2.24×69.05", 2.24 * 69.05, 154.7, 0.005);
nara("moat-femårsmedel brutto", (46.26 + 45.09 + 46.16 + 52.62 + 53.31) / 5, 48.69, 0.002);
nara("moat-spread 53.31−45.09", 53.31 - 45.09, 8.22, 0.005);
nara("Bioprocess+Lab FY25 2865+673", 2865 + 673, 3538, 0.001);

/* ───────────────────────── HELLOFRESH (HFG.DE) ───────────────────────── */
console.log("\n═══ HFG — kurs/mcap ═══");
nara("mcap-replik 144.08×2.633", 144.08 * 2.633, 379.5, 0.02); // källfält 385.13 bär TTM-basen 146.2 — spridning 1.5 % (aktiebasen −8.15 % YoY, dokumenterad)
nara("BVPS-match 4.39×144.4", 4.39 * 144.4, 633.9, 0.003);

console.log("\n═══ HFG — värdering ═══");
nara("PS 385.13/6356", 385.13 / 6356, 0.0606, 0.02);
nara("PB total common 385.13/633.5", 385.13 / 633.5, 0.6079, 0.005);
nara("P/FCF 385.13/117.9", 385.13 / 117.9, 3.266, 0.005);
nara("EV-replik 385.13+503.8", 385.13 + 503.8, 888.9, 0.005);
nara("EV-källfält", 885.73, 885.73, 0.001);
nara("EV/Sales 885.73/6356", 885.73 / 6356, 0.139, 0.02);
nara("EV/EBIT 885.73/54.8", 885.73 / 54.8, 16.16, 0.003);
nara("fwd-EPS 2.633/6.86", 2.633 / 6.86, 0.3838, 0.004);
nara("prognosT vändning (0.3838+0.24)/0.24", (2.633 / 6.86 + 0.24) / 0.24, 2.599, 0.005); // ELUX-mönstret: vändningsräkning ur källans fwd-PE

console.log("\n═══ HFG — marginaler TTM ═══");
nara("brutto 3840/6356", (3840 / 6356) * 100, 60.42, 0.003);
nara("EBIT 54.8/6356", (54.8 / 6356) * 100, 0.86, 0.01);
nara("netto −34.8/6356", (-34.8 / 6356) * 100, -0.55, 0.02);
nara("FCF 117.9/6356", (117.9 / 6356) * 100, 1.86, 0.01);
nara("fcfYield 117.9/385.13", (117.9 / 385.13) * 100, 30.61, 0.003);

console.log("\n═══ HFG — kassaflöde/balans ═══");
nara("FCF TTM 199.2−81.3", 199.2 - 81.3, 117.9, 0.001);
nara("nettoskuld 750.7−246.9", 750.7 - 246.9, 503.8, 0.001);
nara("D/E 750.7/630.3", 750.7 / 630.3, 1.19, 0.005);
nara("skatt-identitet pretax−tax", -4.0 - 31.9, -35.9, 0.03); // ≈ netto −34.8 (±minoritet/valuta, dokumenterat)
nara("aktiebas 173.54→144.4", (144.4 / 173.54 - 1) * 100, -16.79, 0.01);
nara("återköp FY25 39.6+93.0", 39.6 + 93.0, 132.6, 0.001);

console.log("\n═══ HFG — serier FY2021-25 ═══");
nara("omsCAGR (6761/5993)^(1/4)−1", Math.pow(6761 / 5993, 1 / 4) - 1, 0.0306, 0.02);
nara("omsTillvaxtTTM spårkonvention 6356/6761", 6356 / 6761 - 1, -0.0599, 0.01);
nara("moat-femårsmedel brutto", (61.67 + 62.49 + 64.78 + 65.55 + 65.86) / 5, 64.07, 0.002);
nara("moat-spread 65.86−61.67", 65.86 - 61.67, 4.19, 0.005);
nara("brutto-FALL fyra år 65.86→61.67", (61.67 / 65.86 - 1) * 100, -6.36, 0.005);

console.log(`\n══════════ GRIND: ${ok} OK · ${fel} FEL ══════════`);
if (fel > 0) { console.log("ABORT — ingen skrivning sker"); process.exit(1); }
console.log("GRÖN — append får ske");
