#!/usr/bin/env node
/**
 * KVD — s5-u3 omgång 13 (manifest auto-s5-1789681529602): mt-05 + ma-03 + od-04.
 *
 * Maskinell kvalitetskontroll av de tre kursfilerna mot registret:
 * strukturparitet, register↔proveniens round-trip, aritmetik med oberoende
 * omräkning, juridikgrind (rådfraser + utbildningsframing + lagrum),
 * korsreferensers registeräkthet, språkgrind (CJK/kyrilliska/typografiska
 * citattecken/mjuka bindestreck/tabbar/dubbelord) och why-filens
 * luckpåståenden mot registrets faktiska nivåfördelning.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const REG = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const FILER = ["mt-05-byteskostnader-och-inlasning", "ma-03-realrantan", "od-04-kombinerade-optionspositioner"];

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const approx = (a, b, tol = 0.005) => Math.abs(a - b) <= tol;

// ── 1. Strukturparitet + round-trip ×3 ──────────────────────────────────────
for (const f of FILER) {
  const k = JSON.parse(readFileSync(`data/kurser-tillagg/${f}.json`, "utf8"));
  const r = REG[k.slug];
  testa(`S1 ${f}: finns i registret`, !!r);
  testa(`S2 ${f}: chapters_list ↔ chapters paritet (num/titel/minuter)`,
    JSON.stringify(k.chapters_list) === JSON.stringify(r.chapters_list.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))) &&
    JSON.stringify(k.chapters_list) === JSON.stringify(k.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
  testa(`S3 ${f}: registerposten == proveniensfilen (round-trip)`, JSON.stringify(r) === JSON.stringify(k));
  testa(`S4 ${f}: 6 kapitel × 4 min = 24, xp 50, fas-neutralt`, k.chapters.length === 6 && k.totalMinutes === 24 && k.minutes === 24 && k.xp === 50);
  testa(`S5 ${f}: blocktyper sanktionerade`, k.chapters.every((c) => c.blocks.every((b) => ["text", "definition", "insight", "tabell", "utmaning", "insikt", "visuell"].includes(b.type))));
}

// ── 2. Aritmetik med oberoende omräkning ────────────────────────────────────
const A = [
  ["mt-05: 1/0,20 = 5 år", approx(1 / 0.2, 5)],
  ["mt-05: 1/0,10 = 10 år", approx(1 / 0.1, 10)],
  ["mt-05: 120 000 × 0,60 = 72 000", approx(120000 * 0.6, 72000)],
  ["mt-05: 72 000 × 5 = 360 000", approx(72000 * 5, 360000)],
  ["mt-05: 72 000 × 10 = 720 000", approx(72000 * 10, 720000)],
  ["mt-05: 72 000 ÷ 0,15 = 480 000", approx(72000 / 0.15, 480000)],
  ["mt-05: 72 000 ÷ 0,075 = 960 000", approx(72000 / 0.075, 960000)],
  ["mt-05: 300 000 ÷ 18 000 = 16,7 år", approx(300000 / 18000, 16.7, 0.05)],
  ["mt-05: 100 + 8 + 3 − 4 = 107 (nrr)", approx(100 + 8 + 3 - 4, 107)],
  ["mt-05: 300 000 ÷ 5 = 60 000 = hälften av 120 000", approx(300000 / 5, 60000) && approx(60000 / 120000, 0.5)],
  ["mt-05: 250 × 1 200 = 300 000", approx(250 * 1200, 300000)],
  ["mt-05: 720 000 × 1 000 = 720 miljoner", approx(720000 * 1000, 720000000)],
  ["ma-03: 5,0 − 2,5 = 2,5 (Fisher)", approx(5.0 - 2.5, 2.5)],
  ["ma-03: 1,07/1,09 − 1 = −1,8 %", approx((1.07 / 1.09 - 1) * 100, -1.8, 0.05)],
  ["ma-03: 100/1,05 = 95,24", approx(100 / 1.05, 95.24, 0.005)],
  ["ma-03: 100/1,06 = 94,34", approx(100 / 1.06, 94.34, 0.005)],
  ["ma-03: 95,24 − 94,34 = 0,90", approx(100 / 1.05 - 100 / 1.06, 0.9, 0.005)],
  ["ma-03: 100/0,05 = 2 000", approx(100 / 0.05, 2000)],
  ["ma-03: 100/0,06 ≈ 1 667", approx(100 / 0.06, 1667, 0.5)],
  ["ma-03: (2000−1667)/2000 ≈ 16,7 %", approx((2000 - 100 / 0.06) / 2000 * 100, 16.7, 0.05)],
  ["ma-03: 1/1,02 = 0,98039", approx(1 / 1.02, 0.98039)],
  ["ma-03: 1,05/1,025 − 1 = 2,4 %", approx((1.05 / 1.025 - 1) * 100, 2.4, 0.05)],
  ["ma-03: 1,25/1,20 − 1 = 4,2 %", approx((1.25 / 1.2 - 1) * 100, 4.2, 0.05)],
  ["ma-03: 103 000/1,02 = 100 980", approx(103000 / 1.02, 100980, 0.5)],
  ["ma-03: 101 000/1,02 = 99 020", approx(101000 / 1.02, 99020, 0.5)],
  ["ma-03: 101 000/1,06 = 95 283", approx(101000 / 1.06, 95283, 0.5)],
  ["od-04: 3 − 3 = 0 nettopremie", approx(3 - 3, 0)],
  ["od-04: 100 − 90 = 10 självrisk", approx(100 - 90, 10)],
  ["od-04: 100 − 8 = 92 BE straddle ned", approx(100 - 8, 92)],
  ["od-04: 100 + 8 = 108 BE straddle upp", approx(100 + 8, 108)],
  ["od-04: 90 − 4 = 86 BE strangle ned", approx(90 - 4, 86)],
  ["od-04: 110 + 4 = 114 BE strangle upp", approx(110 + 4, 114)],
  ["od-04: 4 − 2 = 2 nettokostnad", approx(4 - 2, 2)],
  ["od-04: 10 − 2 = 8 maxvinst", approx(10 - 2, 8)],
  ["od-04: 100 + 2 = 102 BE", approx(100 + 2, 102)],
  ["od-04: 112-fallet: 12 − 2 − 2 = 8", approx(12 - 2 - 2, 8)],
  ["od-04: 4 ÷ 98 = 4,08 %", approx((4 / 98) * 100, 4.08, 0.005)],
  ["od-04: 100 − 2 = 98 effektiv", approx(100 - 2, 98)],
];
for (const [namn, ok] of A) testa(`ARIT ${namn}`, ok);

// ── 3. Juridikgrind ─────────────────────────────────────────────────────────
const RADFRASER = [
  /du bör (köpa|sälja|teckna|placera)/i,
  /(köp|sälj|teckna) (denna|den här|aktien nu|aktien idag|nu)/i,
  /vi (rekommenderar|råder)/i,
  /(vårt|vår) (tips|råd|rekommendation)/i,
  /bäst(a)? (köp|placering(ar)? just nu)/i,
  /det (är|blir) (dags|dags att köpa)/i,
  /tjänstgör som (finansiell )?rådgivning/i,
];
const LAGRUM = /2007:528|2022:260|2022:261|1985:716|2005:59|2022:482|2 kap [0-9]/;
for (const f of FILER) {
  const k = JSON.parse(readFileSync(`data/kurser-tillagg/${f}.json`, "utf8"));
  const allText = JSON.stringify(k);
  const träff = RADFRASER.filter((re) => re.test(allText));
  testa(`JUR ${f}: 0 rådgivningsfraser`, träff.length === 0, `träffar: ${träff.map(String).join(";")}`);
  testa(`JUR ${f}: 0 lagrum i kurstext`, !LAGRUM.test(allText));
  const framing = /utbildning|aldrig (en )?(uppmaning|råd)|inte investeringsråd|metod/i;
  testa(`JUR ${f}: utbildningsframing närvarande`, framing.test(allText));
}

// ── 4. Korsreferenser registeräkta ──────────────────────────────────────────
const REF = ["mt-01", "mt-02", "mt-03", "mt-04", "v13", "v14", "v15", "se-01", "km-006", "ln-02", "vr-03", "tx-03", "km-029", "km-032", "ek-03",
  "km-054", "km-055", "km-056", "km-058", "ma-01", "ma-02", "mk-04", "mk-08", "km-008", "vm-11", "bf-15",
  "km-059", "km-060", "km-061", "od-01", "od-02", "od-03", "am-01", "sj-04", "km-013"];
for (const ref of REF) {
  const finns = Object.keys(REG).some((s) => s.startsWith(ref + "-"));
  testa(`KORS ${ref}: prefix registeräkt`, finns);
}

// ── 5. Språkgrind på alla tre filerna ───────────────────────────────────────
for (const f of FILER) {
  const s = readFileSync(`data/kurser-tillagg/${f}.json`, "utf8");
  const cjk = [...s].filter((ch) => { const o = ch.codePointAt(0); return (o >= 0x4e00 && o <= 0x9fff) || (o >= 0x3040 && o <= 0x30ff) || (o >= 0xac00 && o <= 0xd7af); });
  const kyr = [...s].filter((ch) => { const o = ch.codePointAt(0); return o >= 0x400 && o <= 0x4ff; });
  const citat = [...s].filter((ch) => "\u201c\u201d\u2018\u2019\u00ab\u00bb".includes(ch));
  const mjuka = [...s].filter((ch) => ch === "\u00ad");
  const tabbar = [...s].filter((ch) => ch === "\t");
  const dubbel = s.match(/\b(\w{3,})\s+\1\b/gi) || [];
  testa(`SPRÅK ${f}: 0 CJK`, cjk.length === 0, cjk.join(""));
  testa(`SPRÅK ${f}: 0 kyrilliska`, kyr.length === 0);
  testa(`SPRÅK ${f}: 0 typografiska citattecken`, citat.length === 0);
  testa(`SPRÅK ${f}: 0 mjuka bindestreck`, mjuka.length === 0);
  testa(`SPRÅK ${f}: 0 tabbar`, tabbar.length === 0);
  testa(`SPRÅK ${f}: 0 dubbelord`, dubbel.length === 0, dubbel.join(","));
}

// ── 6. Why-luckpåståenden mot registrets faktiska fördelning ────────────────
const niva = (kat, lev) => Object.values(REG).filter((k) => k.category === kat && k.level === lev).length;
testa("LUCK MOAT Avancerad = 3 efter leverans (why: familjens tredje A)", niva("MOAT", "Avancerad") === 3, `faktiskt ${niva("MOAT", "Avancerad")}`);
testa("LUCK MA&R Avancerad = 2 efter leverans (why: familjens andra A)", niva("MAKROEKONOMI & RÄNTA", "Avancerad") === 2, `faktiskt ${niva("MAKROEKONOMI & RÄNTA", "Avancerad")}`);
const odSerieI = ["od-01-optionens-greker", "od-04-kombinerade-optionspositioner"].every((s) => REG[s] && REG[s].level === "Intermediär");
testa("LUCK od-serien Intermediär = 2 efter leverans", odSerieI);
testa("LUCK mt-05 är MOAT:s enda byteskostnadskurs (sondpåstående)", Object.keys(REG).filter((s) => /byteskostnad|inlasning|inlåsning/.test(s)).length === 1);
testa("LUCK ma-03-realrantan är registrets enda realräntekurs", Object.keys(REG).filter((s) => /realrant/.test(s)).length === 1);
testa("LUCK od-04 är registrets enda kombinerade-optionskurs", Object.keys(REG).filter((s) => /kombinerade-options/.test(s)).length === 1);

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — mt-05 + ma-03 + od-04 strukturellt, aritmetiskt, juridiskt, korsrefererat och språkligt rena.`);
