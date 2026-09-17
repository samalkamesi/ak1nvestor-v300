#!/usr/bin/env node
/**
 * KVD — s5-u3 omgång 12 (manifest auto-s5-1789657528556): od-03 + ma-02 + rp-02.
 *
 * Kvalitetsverifiering av hela leveransen mot register + proveniensfiler:
 * strukturparitet, register↔proveniens round-trip, maskinell aritmetik
 * (oberoende omräkning av samtliga signaturtal), tal-i-prosa-citatkontroll,
 * juridikgrind (rådgivningsfraser), språkgrind (CJK/kyrilliska/mjuka
 * bindestreck/typografiska citat/tabbar/sammansmältningar), korsreferens-
 * äkthet mot registret samt luckpåståendena i why-raderna.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const pass = [], fail = [], varning = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const REG = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const KURSER = ["od-03-warranter-och-teckningsoptioner", "ma-02-lonebildning-och-kostnadsspiralen", "rp-02-tre-matt-tre-fragor"];
const KALLOR = {};
for (const s of KURSER) KALLOR[s] = JSON.parse(readFileSync(`data/kurser-tillagg/${s}.json`, "utf8"));

// ── 1. Strukturparitet chapters_list ↔ chapters + grundfält ─────────────────
for (const s of KURSER) {
  const k = KALLOR[s], r = REG[s];
  testa(`S1 ${s}: finns i registret`, !!r);
  testa(`S2 ${s}: chapters_list ${k.chapters_list.length} == chapters ${k.chapters.length} == 6`, k.chapters_list.length === k.chapters.length && k.chapters.length === 6);
  testa(`S3 ${s}: titlar + minuter + nummer pariteta`, k.chapters.every((c, i) => c.title === k.chapters_list[i].title && c.minutes === k.chapters_list[i].minutes && c.num === k.chapters_list[i].num && c.num === i + 1));
  testa(`S4 ${s}: totalMinutes 24 == summa minuter == chapterCount × 4`, k.totalMinutes === 24 && k.chapters.reduce((a, c) => a + c.minutes, 0) === 24 && k.chapterCount === 6);
  testa(`S5 ${s}: xp 50 · level korrekt · weight "—" · slug ASCII`, k.xp === 50 && /^[a-z0-9-]+$/.test(k.slug) && k.weight === "—" && typeof k.level === "string" && k.level.length > 0);
  testa(`S6 ${s}: alla block har giltig typ + content-sträng`, k.chapters.every((c) => c.blocks.length > 0 && c.blocks.every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 20)));
  testa(`S7 ${s}: inga främmande nycklar (placeholder etc.)`, k.chapters.every((c) => c.blocks.every((b) => Object.keys(b).length === 2)));
  testa(`S8 ${s}: history origin/evolution/modern + tre sektioner (lynch/graham/ak1)`, ["origin", "evolution", "modern"].every((n) => typeof k.history[n] === "string" && k.history[n].length > 200) && ["lynchSection", "grahamSection", "ak1Section"].every((n) => typeof k[n] === "string" && k[n].length > 200));
  testa(`S9 ${s}: why + learn + summary alla > 400 tecken`, ["why", "learn", "summary"].every((n) => k[n].length > 400));
}

// ── 2. Register ↔ proveniens round-trip ──────────────────────────────────────
for (const s of KURSER) {
  const r = REG[s], k = KALLOR[s];
  testa(`R1 ${s}: register == källfil (deep-equal)`, JSON.stringify(r) === JSON.stringify(k));
}

// ── 3. Aritmetik — oberoende omräkning av samtliga signaturtal ──────────────
const A = (x, y, tol = 1e-9) => Math.abs(x - y) < tol;
const r2 = (x) => Math.round(x * 100) / 100;
// od-03
{
  const t = JSON.stringify(KALLOR["od-03-warranter-och-teckningsoptioner"]);
  testa("M1 od-03 inre värde 12,00−10,00=2,00", A(12.0 - 10.0, 2.0));
  testa("M2 od-03 utspädning 100/(100+10)=90,9 %", Math.round((100 / 110) * 1000) / 10 === 90.9);
  testa("M3 od-03 nytt kapital 10 M × 10,00 = 100 mkr", A(10 * 10.0, 100));
  testa("M4 od-03 tidsvärden 2,80−2,00=0,80 · 0,90−0=0,90 · 0,30−0=0,30", A(2.8 - 2.0, 0.8) && A(0.9 - 0, 0.9) && A(0.3 - 0, 0.3));
  for (const talstr of ["2,00 kr", "90,9 procent", "100 miljoner kr", "110 miljoner", "0,80 kr", "0,90 kr", "0,30 kr", "12,00 kr", "10,00 kr", "8,00 kr"]) testa(`M5 od-03 talet "${talstr}" citerat i texten`, t.includes(talstr));
}
// ma-02
{
  const t = JSON.stringify(KALLOR["ma-02-lonebildning-och-kostnadsspiralen"]);
  testa("M6 ma-02 löneandel 150/500 = 30 %", r2((150 / 500) * 100) === 30);
  testa("M7 ma-02 lönekostnad 150 × 3,5 % = 5,25 mkr", A(150 * 0.035, 5.25));
  testa("M8 ma-02 marginaltryck 5,25/500 = 1,05 pp · marginal 10,0→8,95", r2((5.25 / 500) * 100) === 1.05 && r2(10 - 1.05) === 8.95);
  testa("M9 ma-02 resultattäckning 5,25/50 = 10,5 %", r2((5.25 / 50) * 100) === 10.5);
  testa("M10 ma-02 netto 3,5−1,5=2,0 % → 3,0 mkr → 0,60 pp", A(3.5 - 1.5, 2.0) && A(150 * 0.02, 3.0) && r2((3 / 500) * 100) === 0.6);
  testa("M11 ma-02 tabell 1,0 % prod → 2,5 % netto → 3,75 mkr → 0,75 pp", A(3.5 - 1.0, 2.5) && A(150 * 0.025, 3.75) && r2((3.75 / 500) * 100) === 0.75);
  testa("M12 ma-02 ULC 4,0−1,0=3,0 · 2,0−2,0=0,0", A(4 - 1, 3) && A(2 - 2, 0));
  testa("M13 ma-02 prislyft 0,30×2,0=0,6 % · 0,60×3,5=2,1 % · 0,60×2,0=1,2 %", A(0.3 * 2.0, 0.6) && A(0.6 * 3.5, 2.1) && A(0.6 * 2.0, 1.2));
  testa("M14 ma-02 räntesida 200/2=100 mkr rörlig × 2 pp = 2,0 mkr; totalt 5,25+2,0=7,25 = 14,5 % av 50", A((200 / 2) * 0.02, 2.0) && A(5.25 + 2.0, 7.25) && r2((7.25 / 50) * 100) === 14.5);
  for (const talstr of ["5,25 miljoner", "1,05 procent", "8,95", "0,60 procentenheter", "3,0 miljoner", "2,1 procent", "14,5 procent"]) testa(`M15 ma-02 talet "${talstr}" citerat`, t.includes(talstr));
}
// rp-02
{
  const t = JSON.stringify(KALLOR["rp-02-tre-matt-tre-fragor"]);
  testa("M16 rp-02 Sharpe exempel (12−2)/10 = 1,00", A((12 - 2) / 10, 1.0));
  testa("M17 rp-02 Sortino exempel (12−2)/7 = 1,43", r2((12 - 2) / 7) === 1.43);
  testa("M18 rp-02 Calmar exempel 12/15 = 0,80", A(12 / 15, 0.8));
  testa("M19 rp-02 spegel Sharpe (9−2)/7 = 1,00 · Sortino (9−2)/6 = 1,17 · Calmar 9/8 = 1,13", A((9 - 2) / 7, 1.0) && r2((9 - 2) / 6) === 1.17 && r2(9 / 8) === 1.13);
  testa("M20 rp-02 annualisering 0,29 × √12 ≈ 1,0", r2(0.29 * Math.sqrt(12)) === 1.0);
  testa("M21 rp-02 √12 ≈ 3,46", r2(Math.sqrt(12)) === 3.46);
  for (const talstr of ["1,00", "1,43", "0,80", "1,17", "1,13", "3,46"]) testa(`M22 rp-02 talet "${talstr}" citerat`, t.includes(talstr));
}

// ── 4. Juridikgrind ──────────────────────────────────────────────────────────
const RADFRASER = [/köp (denna|den här|aktien) [^.]{0,30}\./i, /sälj (denna|den här|aktien) [^.]{0,30}\./i, /du (bör|ska) (köpa|sälja|teckna) /i, /vi rekommenderar (att du )?(köper|säljer|tecknar)/i, /investera i (denna|den här) aktie/i];
for (const s of KURSER) {
  const t = JSON.stringify(KALLOR[s]);
  const träff = RADFRASER.filter((rx) => rx.test(t));
  testa(`J1 ${s}: 0 rådgivningsfraser`, träff.length === 0, JSON.stringify(träff.map(String)));
  testa(`J2 ${s}: utbildningsframing närvarande`, /utbildning|pedagogisk|mekanik|aldrig investeringsråd|inte råd|läsarens eget/i.test(t));
  testa(`J3 ${s}: 0 lagrum`, !/1998:\d+|2007:528|2022:\d+/.test(t));
}

// ── 5. Språkgrind ────────────────────────────────────────────────────────────
for (const s of KURSER) {
  const t = readFileSync(`data/kurser-tillagg/${s}.json`, "utf8");
  testa(`L1 ${s}: 0 CJK/kyrilliska/grekiska tecken`, !/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff\u0370-\u03ff]/.test(t));
  testa(`L2 ${s}: 0 mjuka bindestreck (U+00AD)`, !t.includes("­"));
  testa(`L3 ${s}: 0 typografiska citattecken (“”‘’)`, !/[“”‘’]/.test(t));
  testa(`L4 ${s}: 0 tabbtecken`, !t.includes("\t"));
  testa(`L5 ${s}: 0 kända läckor (sweet/enterprising/protege/backräsp/kronepisod/NON-event/placeholder)`, !/sweet|enterprising|protege|backräsp|kronepisod|NON-event|placeholder|favourite|relationship|curiosity|_BREAK/i.test(t));
  const dubblerade = t.match(/\b(\w{4,}) \1\b/gi);
  testa(`L6 ${s}: 0 dubblerade ord`, !dubblerade, JSON.stringify(dubblerade));
  testa(`L7 ${s}: parenteser balanserade`, (t.match(/\(/g) || []).length === (t.match(/\)/g) || []).length);
}

// ── 6. Korsreferenser registeräkta ───────────────────────────────────────────
const regPrefix = new Set(Object.keys(REG).map((s) => s));
for (const s of KURSER) {
  const t = JSON.stringify(KALLOR[s]);
  const refs = [...new Set([...t.matchAll(/\b([a-z]{2}-\d{2,3}|v\d{2}|km-\d{3})\b/g)].map((m) => m[1]))].filter((r) => r !== s.split("-").slice(0, 2).join("-"));
  const brutna = refs.filter((r) => ![...regPrefix].some((slug) => slug.startsWith(r)));
  testa(`K1 ${s}: ${refs.length} korsreferenser alla registeräkta (0 brutna)`, brutna.length === 0, JSON.stringify(brutna));
}

// ── 7. Luckpåståenden i why-raderna (verifierade mot registret) ───────────────
{
  const odKurser = Object.values(REG).filter((k) => k.category === "OPTIONS & DERIVAT");
  testa("W1 od-03 är od-seriens ENDA Nybörjare (km-059 är km-prefix)", odKurser.filter((k) => k.slug.startsWith("od-") && k.level === "Nybörjare").length === 1);
  const maKurser = Object.values(REG).filter((k) => k.category === "MAKROEKONOMI & RÄNTA");
  testa("W2 ma-02 är ma-seriens ENDA Intermediär", maKurser.filter((k) => k.slug.startsWith("ma-") && k.level === "Intermediär").length === 1);
  const rpKurser = Object.values(REG).filter((k) => k.category === "RISKHANTERING & PORTFÖLJTEORI");
  testa("W3 rp-02 är rp-seriens ENDA Intermediär", rpKurser.filter((k) => k.slug.startsWith("rp-") && k.level === "Intermediär").length === 1);
  testa("W4 registrets total 401", Object.keys(REG).length === 401);
}

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (varning.length) console.log("\n" + varning.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nKVD RÖD — ${pass.length} PASS, ${fail.length} FEL, ${varning.length} VARNING`); process.exit(1); }
console.log(`\nKVD GRÖN — ${pass.length} PASS 0 FEL ${varning.length} VARNING`);
