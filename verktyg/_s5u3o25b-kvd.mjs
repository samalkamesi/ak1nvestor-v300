#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789962309223, omgång 25, byggare 3/3, försök 2 =
 * 06:05-dispatchen) — KVD-PREKOLL, -b-varianten (försök 1 lever parallellt
 * och äger bf-17/od-09/kt-09 inklusive deras kvd under _s5u3o25-kvd.mjs;
 * denna fil är MIN kanoniska kbd för se-23-stalsektorn + arvvalideringen av
 * bf-17/od-09 som syskonet landat i registret).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regN = Object.keys(reg).length;

let PASS = 0, FEL = 0, VARNING = 0;
const ok = (v, namn, detalj = "") => {
  if (v) { PASS++; console.log("  PASS " + namn + (detalj ? " — " + detalj : "")); }
  else { FEL++; console.log("  FEL  " + namn + (detalj ? " — " + detalj : "")); }
};
const nj = (a, b, tol, namn) => {
  const d = Math.abs(a - b);
  ok(d <= tol, namn, "beräknat " + (Math.round(a * 10000) / 10000) + " mot kursens " + b + " (diff " + (Math.round(d * 10000) / 10000) + ")");
};
const las = (p) => JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + p + ".json", "utf8"));

console.log("KVD-PREKOLL s5-u3 o25 f2-b — registerläge " + regN + " (syskon-försök 1:s bf-17/od-09/kt-09 landade; u2 läkt c25fb8ca)");

const K = {};
for (const slug of ["bf-17-nutidsbias-och-den-hyperboliska-kurvan", "od-09-forsakringsskrivandet", "se-23-stalsektorn"]) {
  let c = null;
  try { c = las(slug); } catch { /* vakt nedan */ }
  ok(!!c, "fil tolkas: " + slug);
  if (c) K[slug] = c;
}
const bf = K["bf-17-nutidsbias-och-den-hyperboliska-kurvan"];
const od = K["od-09-forsakringsskrivandet"];
const se = K["se-23-stalsektorn"];

// ── 1. Strukturella vakter ───────────────────────────────────────────────────
console.log("\n── Struktur (18 fält, 6 kap à 4 min, block, slug, nivå)");
for (const [namn, c, kat] of [["bf-17", bf, "BETEENDEFINANS"], ["od-09", od, "OPTIONS & DERIVAT"], ["se-23", se, "SEKTORANALYS"]]) {
  ok(Object.keys(c).length === 18, namn + ": 18 fält", Object.keys(c).length + " st");
  ok(c.category === kat, namn + ": kategori " + kat);
  ok(c.chapters.length === 6 && c.chapters_list.length === 6, namn + ": 6 kapitel");
  ok(c.chapters.every((k) => k.minutes === 4 && k.intro && Array.isArray(k.blocks) && k.blocks.length >= 2), namn + ": varje kap 4 min + intro + minst 2 block");
  ok(c.chapters.reduce((s, k) => s + k.minutes, 0) === c.totalMinutes && c.totalMinutes === 24, namn + ": minsumma 24 = totalMinutes");
  ok(c.chapters_list.every((l, i) => l.title === c.chapters[i].title && l.num === c.chapters[i].num), namn + ": chapters_list speglar chapters");
  ok(/^[a-z0-9][a-z0-9-]*$/.test(c.slug), namn + ": slug ren ASCII");
  ok(["Nybörjare", "Intermediär", "Avancerad"].includes(c.level), namn + ": nivå giltig (" + c.level + ")");
  ok(c.xp === 50, namn + ": xp 50");
  ok(!JSON.stringify(c).includes("­"), namn + ": inga mjuka bindestreck");
  ok(c.why.length > 900 && c.learn.length > 1000 && c.summary.length > 1200, namn + ": why/learn/summary-längd", "why " + c.why.length + " · learn " + c.learn.length + " · summary " + c.summary.length);
  ok(Object.keys(c.history).join(",") === "origin,evolution,modern" && Object.values(c.history).every((t) => t.length > 200), namn + ": history origin+evolution+modern");
  ok(c.lynchSection.length > 450 && c.grahamSection.length > 450 && c.ak1Section.length > 400, namn + ": tre mästarsectioner", "lynch " + c.lynchSection.length + " · graham " + c.grahamSection.length + " · ak1 " + c.ak1Section.length);
  const juridik = (c.summary + " " + c.chapters[c.chapters.length - 1].blocks[0].content).toLowerCase();
  ok(/placeringsråd|placeringsbeslut|utbildning om mekanismer|utbildning i mekanismer|aldrig råd om placeringar|på utbildningens villkor/.test(juridik), namn + ": utbildningsframing närvarande");
  ok(!/köp denna|sälj denna|bör du köpa|rekommenderar köp/i.test(JSON.stringify(c)), namn + ": inga rådsformuleringar");
  ok(!/kraverFas|13999|9999|449 kr|799 kr/i.test(JSON.stringify(c)), namn + ": R2 ren (inga pris-/tier-ytor)");
}

// ── 2. Seriekontroll: syskonets två + min ena ────────────────────────────────
console.log("\n── Serieordning (syskonets bf-17/od-09 + kt-09 i registret; min se-23 föregångare i, jag ej)");
ok(!!reg["bf-17-nutidsbias-och-den-hyperboliska-kurvan"], "bf-17 i registret (syskon-försök 1:s leverans)");
ok(!!reg["od-09-forsakringsskrivandet"], "od-09 i registret (syskon-försök 1:s leverans)");
ok(!!reg["kt-09-budpremien-och-budprocessen"], "kt-09 i registret (syskon-försök 1:s leverans)");
ok(!!reg["se-22-byggentreprenaden"], "se-23:s föregångare se-22 i registret");
ok(!reg["se-23-stalsektorn"], "se-23 ej i registret ännu (min insert kommer)");
const bfN = Object.keys(reg).filter((s) => s.startsWith("bf-")).length;
const odN = Object.keys(reg).filter((s) => s.startsWith("od-")).length;
const seN = Object.keys(reg).filter((s) => s.startsWith("se-")).length;
ok(bfN === 17 && odN === 9 && seN === 22, "familjelängd bf 17 / od 9 / se 22 (efter min insert: se 23)", bfN + "/" + odN + "/" + seN);
ok(bf.level === "Avancerad" && od.level === "Avancerad" && se.level === "Intermediär", "nivåval (bf/od Avancerad, se Intermediär)");

// ── 3. Grannexistens ─────────────────────────────────────────────────────────
console.log("\n── Grannexistens (refererade kurser finns i registret)");
const grannar = {
  "bf-17": ["bf-04-investera-som-en-robot", "bf-12-prospektteori", "bf-16-slumpens-serier"],
  "od-09": ["od-01-optionens-greker", "od-02-implicit-volatilitet", "od-08-binomialtradet-och-replikeringen", "am-09-marginalhandeln"],
  "se-23": ["rk-15-cykelrisk", "vr-02-normaliserade-multipler", "vr-06-jamforelsebolagen", "ma-08-bostadsmarknadens-mekanik", "se-20-gruv-och-metallsektorn", "se-22-byggentreprenaden", "km-041-industrisektorn", "km-045-materialsektorn", "km-047-utilitysektorn", "mt-05-byteskostnader-och-inlasning", "st-01-soliditet-och-rantetackning", "pc-01-case-atlas-copco", "se-02-halvledarsektorn"],
};
for (const [namn, slugs] of Object.entries(grannar)) {
  for (const s of slugs) ok(!!reg[s], namn + " → granne finns: " + s);
}
ok(Object.keys(reg).some((k) => k.startsWith("km-007")), "bf-17 → granne km-007 (DCF) finns");
ok(Object.keys(reg).some((k) => k.startsWith("vm-02")), "bf-17 → granne vm-02 (diskonteringen) finns");
ok(Object.keys(reg).some((k) => k.startsWith("km-054")), "bf-17 → granne km-054 (räntan) finns");
ok(Object.keys(reg).some((k) => k.startsWith("km-014")), "od-09 → granne km-014 (paroller) finns");
ok(Object.keys(reg).some((k) => k.startsWith("rk-12")), "od-09 → granne rk-12 (svarta svanar) finns");
ok(Object.keys(reg).some((k) => k.startsWith("ma-04")), "se-23 → granne ma-04 (konjunkturindikatorer) finns");

// ── 4. Sondbelägg (se-23:s why mot FÖRTILLSTÅNDET = registret minus se-23) ───
console.log("\n── Sondbelägg (se-23:s 0-påståenden mot registret utan se-23)");
const regUtanSe23 = {};
for (const [k, v] of Object.entries(reg)) if (k !== "se-23-stalsektorn") regUtanSe23[k] = v;
const stackAll = JSON.stringify(regUtanSe23).toLowerCase();
for (const term of ["stålcykeln", "järnmalmspriset", "grossistpris", "elektriskt stål"]) {
  ok(!stackAll.includes(term), "se-23: «" + term + "» 0 kursägare");
}
ok(stackAll.includes("kapacitetsutnyttjande"), "se-23: kapacitetsutnyttjande finns hos grannar (se-02/ma-04)");
ok(se.why.includes("se-02:s halvledarfab") && se.why.includes("ma-04"), "se-23: why-raden dokumenterar kapacitetsgränssnittet");
ok(!stackAll.includes("förädlingstrappan"), "se-23: «förädlingstrappan» 0 kursägare");

// ── 5. Aritmetik bf-17 (arvvalidering) ───────────────────────────────────────
console.log("\n── Aritmetik bf-17 (beta-delta och prislappen)");
nj(0.7 * 0.96 * 1200, 806.4, 0.05, "beta × delta × 1200 = 806,4");
nj(Math.pow(0.96, 5) * 1000, 815.4, 0.05, "0,96^5 × 1000 = 815,4");
nj(Math.pow(0.96, 6) * 1200, 939.4, 0.1, "0,96^6 × 1200 = 939,4");
nj(Math.pow(1.05, 52), 12.6, 0.05, "1,05^52 ≈ 12,6");
nj(Math.pow(1.08, 30), 10.06, 0.005, "1,08^30 = 10,06");
nj(Math.pow(1.08, 30) * 100000, 1006000, 500, "full återinvestering 1 006 000");
nj(Math.pow(1.04, 30), 3.24, 0.005, "1,04^30 = 3,24");
nj(Math.pow(1.04, 30) * 100000, 324000, 500, "konsumerad utdelning 324 000");
nj(0.04 * 100000 * (Math.pow(1.04, 30) - 1) / 0.04, 224000, 500, "uppätna utdelningar ≈ 224 000");
nj(324000 + 224000, 548000, 0.5, "324 000 + 224 000 = 548 000");
nj(1006000 - 548000, 458000, 0.5, "mellanskillnad 458 000");
nj(0.7 * 0.96, 0.672, 0.0005, "0,7 × 0,96 = 0,672");
nj(1000 / (0.7 * 0.96), 1488, 1, "gränsen X = 1000/0,672 ≈ 1 488");
nj(Math.pow(1.06, 30), 5.74, 0.005, "1,06^30 = 5,74");
nj(Math.pow(1.06, 30) * 100000, 574000, 500, "574 000 (utmaning fall 3)");
nj(0.02 * 100000 * (Math.pow(1.04, 30) - 1) / 0.04, 112000, 500, "uppätna ≈ 112 000 (utmaning fall 3)");
nj(4000 * Math.pow(1.04, 29), 12527, 60, "sista årets utdelning ≈ 12 500");

// ── 6. Aritmetik od-09 (arvvalidering) ───────────────────────────────────────
console.log("\n── Aritmetik od-09 (premiens anatomi och väntevärdet)");
nj(100 - 98, 2.0, 0.001, "inre värde 100 − 98 = 2,00");
nj(3.5 - 2.0, 1.5, 0.001, "tidsvärde 3,50 − 2,00 = 1,50");
nj(0.78 * 1.5 - 0.22 * 5.5, -0.04, 0.005, "väntevärde 0,78 × 1,50 − 0,22 × 5,50 = −0,04");
nj(0.22 * 5.5 / 0.78, 1.55, 0.01, "breakeven-premie 0,22 × 5,50 ÷ 0,78 ≈ 1,55");
nj(1500 / 95000 * 100, 1.58, 0.005, "premie på säkerhet 1 500/95 000 = 1,58 %");
nj(1500 / 95000 * 4 * 100, 6.3, 0.05, "årsbasis ≈ 6,3 %");
nj(95000 / 19000, 5.0, 0.01, "belåningskraft ≈ 5×");
nj(1.5 + 2.0, 3.5, 0.001, "wheel-varv 1,50 + 2,00 = 3,50");
nj(95 * 100, 9500, 0.5, "maxförlust naken put 95 × 100 = 9 500");
nj(95 * 0.7, 66.5, 0.01, "30 % under lösenpris: aktien 66,50");
nj(10 * 100 * (95 - 66.5), 28500, 0.5, "utmaning: 10 × 100 × 28,5 = 28 500");
nj(88 - 95 + 1.5, -5.5, 0.001, "tilldelningsnetto: aktien 88, köp till 95, plus premien = −5,50");
ok(1995 - 233 === 1762, "Barings 233 år (grundad 1762, slut 1995)");
ok(1000 * 1.5 === 1500 && 1000 * 95 === 95000, "10 kontrakt à 100 aktier: åtagande 95 000");

// ── 7. Aritmetik se-23 (min nya) ─────────────────────────────────────────────
console.log("\n── Aritmetik se-23 (ugnens hävstång, två klockor, två vägar, trappan)");
nj(3400 - 1900, 1500, 0.5, "bidrag/ton 3 400 − 1 900 = 1 500");
nj(1500 * 4.0 - 4000, 2000, 0.5, "fullt: RÖK 6 000 − 4 000 = +2 000");
nj(1500 * 3.2 - 4000, 800, 0.5, "80 %: RÖK 4 800 − 4 000 = +800");
nj(1500 * 2.4 - 4000, -400, 0.5, "60 %: RÖK 3 600 − 4 000 = −400");
nj(2000 - -400, 2400, 0.5, "resultatsväng 2 400 på volymfall 40 %");
nj(0.4 * 1500, 600, 0.5, "600 Mkr per 10 procentenheter volym");
nj(4000 / 4.0, 1000, 0.5, "fasta/ton vid fullt 1 000");
nj(4000 / 3.2, 1250, 0.5, "fasta/ton vid 80 % 1 250");
nj(4000 / 2.4, 1667, 0.5, "fasta/ton vid 60 % ≈ 1 667");
nj(0.7 * 3400 + 0.3 * 2720, 3196, 0.5, "blandat pris 3 196");
nj((3400 - 3196) / 3400 * 100, 6.0, 0.01, "prisfall 6,0 %");
nj(0.7 * 1500 + 0.3 * 820, 1296, 0.5, "blandat bidrag 1 296");
nj((1500 - 1296) / 1500 * 100, 13.6, 0.05, "bidragsfall 13,6 %");
nj(((1500 - 1296) / 1500) / ((3400 - 3196) / 3400), 2.3, 0.05, "hävstång ≈ 2,3× (2,27 avrundat)");
nj(0.5 * 3400 + 0.5 * 2720, 3060, 0.5, "50/50-pris 3 060");
nj(0.5 * 1500 + 0.5 * 820, 1160, 0.5, "50/50-bidrag 1 160");
nj((1500 - 1160) / 1500 * 100, 22.7, 0.05, "50/50-bidragsfall 22,7 %");
nj(1100 + 350 + 200 + 250, 1900, 0.5, "malmvägens korg 1 900");
nj(1200 + 400 + 100 + 200, 1900, 0.5, "skrotvägens korg 1 900");
nj(1100 * 0.30, 330, 0.5, "malmchock +30 % = 330 kr/ton");
nj(400 * 0.50, 200, 0.5, "elchock +50 % = 200 kr/ton");
nj(700 / 0.8, 875, 0.5, "Kvarnviken fasta/ton 875 vid fullt");
nj(0.48 * 1500 - 700, 20, 0.5, "Kvarnviken vid 60 %: 720 − 700 = +20");
nj(12000 / 1.0, 12000, 0.5, "etapp 12 mdr ÷ 1,0 Mton = 12 000 kr per årston");
nj(12000 - 5500, 6500, 0.5, "Velox bidrag/ton 6 500");
nj(0.3 * 6500 - 900, 1050, 0.5, "Velox RÖK 1 950 − 900 = 1 050");
nj(0.3 * 12000, 3600, 0.5, "Velox omsättning 3 600");
nj(1050 / 3600 * 100, 29.2, 0.05, "Velox marginal 29,2 %");
nj(2000 / (4.0 * 3400) * 100, 14.7, 0.05, "Forshammar marginal 14,7 %");
nj(2.8 * 1500 - 4000, 200, 0.5, "utmaning f1: 4 200 − 4 000 = +200");
nj(1296 * 4.0 - 4000, 1184, 0.5, "utmaning f2: 5 184 − 4 000 = +1 184");
nj(0.4 * 1500 - 700, -100, 0.5, "utmaning f3: 600 − 700 = −100");

console.log("\nKVD-PREKOLL-b: " + PASS + " PASS · " + FEL + " FEL · " + VARNING + " VARNING");
process.exit(FEL > 0 ? 1 : 0);
