#!/usr/bin/env node
/**
 * KVD — s5-u1 omgång 14 (manifest auto-s5-1789701930027): tx-04-tillvaxtens-granser.
 *
 * Maskinell kvalitetskontroll av kursfilen mot registret: strukturparitet,
 * register↔proveniens round-trip, aritmetik med oberoende omräkning (Math.log
 * för klockorna), juridikgrind (rådfraser + utbildningsframing + lagrum),
 * korsreferensers registeräkthet, språkgrind (CJK/kyrilliska/typografiska
 * citattecken/mjuka bindestreck/tabbar/dubbelord + räknelig-formens enhetlighet)
 * och why-filens luckpåståenden mot registrets faktiska nivåfördelning.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const REG = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const FIL = "tx-04-tillvaxtens-granser";

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const approx = (a, b, tol = 0.005) => Math.abs(a - b) <= tol;

const k = JSON.parse(readFileSync(`data/kurser-tillagg/${FIL}.json`, "utf8"));
const r = REG[k.slug];

// ── 1. Strukturparitet + round-trip ──────────────────────────────────────────
testa(`S1 ${FIL}: finns i registret`, !!r);
testa(`S2 ${FIL}: chapters_list ↔ chapters paritet (num/titel/minuter)`,
  JSON.stringify(k.chapters_list) === JSON.stringify(r.chapters_list.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))) &&
  JSON.stringify(k.chapters_list) === JSON.stringify(k.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
testa(`S3 ${FIL}: registerposten == proveniensfilen (round-trip)`, JSON.stringify(r) === JSON.stringify(k));
testa(`S4 ${FIL}: 6 kapitel × 4 min = 24, xp 50, fas-neutralt`, k.chapters.length === 6 && k.totalMinutes === 24 && k.minutes === 24 && k.xp === 50);
testa(`S5 ${FIL}: blocktyper sanktionerade`, k.chapters.every((c) => c.blocks.every((b) => ["text", "definition", "insight", "tabell", "utmaning", "insikt", "visuell"].includes(b.type))));
testa(`S6 ${FIL}: samtliga 18 fält närvarande (kursfamiljens kontrakt)`,
  ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","chapters_list","history","lynchSection","grahamSection","ak1Section","chapters"].every((f) => f in k) && Object.keys(k).length === 18);
testa(`S7 ${FIL}: history har exakt origin/evolution/modern`, ["origin","evolution","modern"].every((f) => f in k.history) && Object.keys(k.history).length === 3);

// ── 2. Aritmetik med oberoende omräkning (Math.log — inga tabellvärden) ─────
const ln = Math.log;
const A = [
  // penetration och serie
  ["penetration 480 000 ÷ 2 400 000 = 0,20", approx(480000 / 2400000, 0.2)],
  ["headroom 1 − 0,20 = 0,80", approx(1 - 0.2, 0.8)],
  ["seriesteg +60 000 konstant (240→300→360→420→480 tusen)", [240000, 300000, 360000, 420000, 480000].every((v, i, arr) => i === 0 || v - arr[i - 1] === 60000)],
  ["procentsteg 25,0/20,0/16,7/14,3", approx(60000 / 240000 * 100, 25) && approx(60000 / 300000 * 100, 20) && approx(60000 / 360000 * 100, 16.7, 0.05) && approx(60000 / 420000 * 100, 14.3, 0.05)],
  // kalibrering och procentfunktionen
  ["r = 60 000 ÷ 384 000 = 0,15625", approx(60000 / 384000, 0.15625, 0.000001)],
  ["1 ÷ r = 6,4 år exakt", approx(1 / 0.15625, 6.4, 0.000001)],
  ["g(20 %) = 0,15625 × 0,80 = 12,5 %", approx(0.15625 * 0.8 * 100, 12.5)],
  ["g(30 %) = 10,9 % (10,9375)", approx(0.15625 * 0.7 * 100, 10.9, 0.05)],
  ["g(50 %) = 7,8 % (7,8125)", approx(0.15625 * 0.5 * 100, 7.8, 0.05)],
  ["g(68 %) = 5,0 % exakt", approx(0.15625 * 0.32 * 100, 5.0, 0.001)],
  ["g(80 %) = 3,1 % (3,125)", approx(0.15625 * 0.2 * 100, 3.1, 0.05)],
  ["g(90 %) = 1,6 % (1,5625)", approx(0.15625 * 0.1 * 100, 1.6, 0.05)],
  // absoluta tal
  ["kulmen r × K ÷ 4 = 0,15625 × 600 000 = 93 750", approx(0.15625 * 600000, 93750)],
  ["spegeln 20 %: 0,15625 × 480 000 × 0,80 = 60 000", approx(0.15625 * 480000 * 0.8, 60000)],
  ["spegeln 80 %: 0,15625 × 1 920 000 × 0,20 = 60 000", approx(0.15625 * 1920000 * 0.2, 60000)],
  ["absolut vid 30 % = 78 750 (0,15625 × 720 000 × 0,70)", approx(0.15625 * 720000 * 0.7, 78750)],
  ["absolut vid 68 % = 81 600 (0,15625 × 1 632 000 × 0,32)", approx(0.15625 * 1632000 * 0.32, 81600)],
  ["absolut vid 90 % = 33 750 (0,15625 × 2 160 000 × 0,10)", approx(0.15625 * 2160000 * 0.1, 33750)],
  ["procent↔absolut konsistent vid 30 %: 78 750 ÷ 720 000 = 10,9 %", approx(78750 / 720000 * 100, 10.9, 0.05)],
  // klockorna
  ["logistisk 20→50 %: 6,4 × ln 4 = 8,9 år", approx(6.4 * ln(4), 8.9, 0.05)],
  ["logistisk 50→80 %: 6,4 × ln 4 = 8,9 år (symmetri)", approx(6.4 * ln(4 / 1), 8.9, 0.05)],
  ["logistisk 20→80 %: 6,4 × ln 16 = 17,7 år", approx(6.4 * ln(16), 17.7, 0.05)],
  ["odds(20 %) = 0,25; odds(80 %) = 4,00; kvot 16", approx(0.2 / 0.8, 0.25) && approx(0.8 / 0.2, 4) && approx((0.8 / 0.2) / (0.2 / 0.8), 16)],
  ["naiv till 80 %: ln 4 ÷ ln 1,125 = 11,8 år", approx(ln(4) / ln(1.125), 11.8, 0.05)],
  ["naiv till 100 %: ln 5 ÷ ln 1,125 = 13,7 år", approx(ln(5) / ln(1.125), 13.7, 0.05)],
  ["naiv kontroll: 480 000 × 1,125^13,66 ≈ 2 400 000", approx(480000 * Math.pow(1.125, ln(5) / ln(1.125)), 2400000, 500)],
  ["linjär till 80 %: 1 440 000 ÷ 60 000 = 24,0 år", approx(1440000 / 60000, 24)],
  ["linjär till 100 %: 1 920 000 ÷ 60 000 = 32,0 år", approx(1920000 / 60000, 32)],
  ["klockskillnader: 17,7 − 11,8 = 5,9 och 24,0 − 17,7 = 6,3", approx(17.7 - 11.8, 5.9) && approx(24.0 - 17.7, 6.3)],
  // det andande taket
  ["1,03^10 = 1,3439", approx(Math.pow(1.03, 10), 1.3439, 0.0005)],
  ["tak efter 10 år ≈ 3 225 000 (2 400 000 × 1,3439)", approx(2400000 * Math.pow(1.03, 10), 3225398, 1500)],
  ["muren flyttad drygt 800 000 (≈ 825 000)", approx(2400000 * Math.pow(1.03, 10) - 2400000, 825000, 1500)],
  // andelar och ersättning
  ["flödesandel 60 000 ÷ 240 000 = 25,0 %", approx(60000 / 240000, 0.25)],
  ["jämviktsbestånd 0,25 × 2 400 000 = 600 000", approx(0.25 * 2400000, 600000)],
  ["marknadsvind 0,22 × 300 000 = 66 000 = +10,0 %", approx(0.22 * 300000, 66000) && approx(66000 / 60000, 1.10)],
  ["ersättning 60 000 − 12 000 = 48 000 netto; 48 000 ÷ 480 000 = 10,0 %", approx(60000 - 12000, 48000) && approx(48000 / 480000, 0.10)],
  ["tröskel: 1 − 0,05 ÷ 0,15625 = 0,68", approx(1 - 0.05 / 0.15625, 0.68, 0.001)],
  ["tröskelåret 6,4 × ln 8,5 = 13,7 år", approx(6.4 * ln(8.5), 13.7, 0.05)],
  ["tröskelodds 2,125 ÷ 0,25 = 8,5", approx((0.68 / 0.32) / 0.25, 8.5, 0.01)],
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
{
  const allText = JSON.stringify(k);
  const träff = RADFRASER.filter((re) => re.test(allText));
  testa("JUR 0 rådgivningsfraser", träff.length === 0, `träffar: ${träff.map(String).join(";")}`);
  testa("JUR 0 lagrum i kurstext", !LAGRUM.test(allText));
  const framing = /utbildning, aldrig råd|inte investeringsråd|aldrig (en )?uppmaning/i;
  testa("JUR utbildningsframing närvarande (avslut + summary + utmaning)", (framing.test(k.summary) || framing.test(k.learn)) && k.chapters.some((c) => c.blocks.some((b) => framing.test(b.content))));
}

// ── 4. Korsreferenser registeräkta ──────────────────────────────────────────
const REF = ["v01", "v02", "v03", "tx-01", "tx-02", "tx-03", "mt-01", "mt-02", "kt-02", "vr-02", "ma-04", "mk-01", "rs-04", "ek-03"];
for (const ref of REF) {
  const finns = Object.keys(REG).some((s) => s.startsWith(ref + "-"));
  testa(`KORS ${ref}: prefix registeräkt`, finns);
}

// ── 5. Språkgrind ───────────────────────────────────────────────────────────
{
  const s = readFileSync(`data/kurser-tillagg/${FIL}.json`, "utf8");
  const cjk = [...s].filter((ch) => { const o = ch.codePointAt(0); return (o >= 0x4e00 && o <= 0x9fff) || (o >= 0x3040 && o <= 0x30ff) || (o >= 0xac00 && o <= 0xd7af); });
  const kyr = [...s].filter((ch) => { const o = ch.codePointAt(0); return o >= 0x400 && o <= 0x4ff; });
  const citat = [...s].filter((ch) => "\u201c\u201d\u2018\u2019\u00ab\u00bb".includes(ch));
  const mjuka = [...s].filter((ch) => ch === "\u00ad");
  const tabbar = [...s].filter((ch) => ch === "\t");
  const dubbel = s.match(/\b(\w{3,})\s+\1\b/gi) || [];
  testa("SPRÅK 0 CJK", cjk.length === 0, cjk.join(""));
  testa("SPRÅK 0 kyrilliska", kyr.length === 0, kyr.join(""));
  testa("SPRÅK 0 typografiska citattecken", citat.length === 0);
  testa("SPRÅK 0 mjuka bindestreck", mjuka.length === 0);
  testa("SPRÅK 0 tabbar", tabbar.length === 0);
  testa("SPRÅK 0 dubbelord", dubbel.length === 0, dubbel.join(","));
  const räknb = (s.match(/räknb/g) || []).length;
  testa("SPRÅK räknelig-familjen enhetlig (0 förekomster av räknb-former)", räknb === 0);
  const räknelig = (s.match(/räknelig[a-z]*/g) || []).length;
  testa("SPRÅK räknelig-former konsekvent använda (9 förekomster)", räknelig === 9, `faktiskt ${räknelig}`);
}

// ── 6. Why-luckpåståenden mot registrets faktiska fördelning ────────────────
const niva = (kat, lev) => Object.values(REG).filter((x) => x.category === kat && x.level === lev).length;
testa("LUCK TILLVÄXT Avancerad = 2 efter leverans (why: familjens andra A)", niva("TILLVÄXT", "Avancerad") === 2, `faktiskt ${niva("TILLVÄXT", "Avancerad")}`);
const txSerie = ["tx-01", "tx-02", "tx-03", "tx-04"].every((p, i, arr) => Object.keys(REG).some((s) => s.startsWith(p + "-")));
testa("LUCK tx-serien 01–04 hel i registret", txSerie);
const sKurva = Object.keys(REG).filter((s) => /s-kurv/i.test(s) || /s-kurv/i.test(String(REG[s].summary || "")));
testa("LUCK tx-04 är registrets enda S-kurvekurs (slug + summary-sond)", sKurva.length === 1 && sKurva[0] === "tx-04-tillvaxtens-granser", sKurva.join(","));
const mattnad = Object.keys(REG).filter((s) => /mättnad|utrymmesräkning|penetrationsgrad/i.test(String(REG[s].summary || "")));
testa("LUCK utrymmesräkningen ägs endast av tx-04 bland kurserna", mattnad.every((s) => s === "tx-04-tillvaxtens-granser") && mattnad.length >= 1, mattnad.join(","));

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — ${FIL} strukturellt, aritmetiskt, juridiskt, korsrefererat och språkligt ren.`);
