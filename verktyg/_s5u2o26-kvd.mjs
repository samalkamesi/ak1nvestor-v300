#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789989925484, omgång 26) — KVD-KONTROLL av de två nya
 * kursfilerna FÖRE register-synk: JSON-giltighet, strukturparitet
 * chapters_list↔chapters, aritmetisk verifiering av samtliga räkneexempel
 * (oberoende omräkning), språkgrind, juridikgrind, R2 och slug-regeln.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["st-07-skuggskulderna", "pe-08-avgiftsmaskinen"];
let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };
const approx = (faktiskt, vantat, tol) => Math.abs(faktiskt - vantat) <= tol;

// ── 1. JSON + struktur ────────────────────────────────────────────────────────
const kurser = {};
for (const slug of MINA) {
  console.log("═══ " + slug);
  let k = null;
  try { k = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8")); } catch (e) { FEL++; console.log("  FEL  JSON-tolkning: " + e.message); continue; }
  kurser[slug] = k;
  ok(k.slug === slug, "slug-fält == filnamn");
  ok(/^[a-z0-9][a-z0-9-]*$/.test(k.slug), "slug ren ASCII");
  ok(typeof k.title === "string" && typeof k.category === "string" && Array.isArray(k.chapters), "title/category/chapters närvarande");
  ok(k.category === (slug.startsWith("st-") ? "STABILITET" : "PRIVATE EQUITY & INVESTMENTBOLAG"), "kategori exakt", k.category);
  ok(k.chapters.length === k.chapterCount, "chapterCount == chapters.length", String(k.chapters.length));
  const summa = k.chapters.reduce((s, c) => s + c.minutes, 0);
  ok(summa === k.totalMinutes && summa === k.minutes, "totalMinutes == minutes == summan av kapitelminuter", String(summa));
  ok(k.chapters_list.length === k.chapters.length, "chapters_list längd == chapters");
  let paritet = true;
  k.chapters_list.forEach((c, i) => {
    const m = k.chapters[i];
    if (!m || m.num !== c.num || m.title !== c.title || m.minutes !== c.minutes) paritet = false;
  });
  ok(paritet, "strukturparitet chapters_list↔chapters (num/titlar/minuter)");
  ok(k.chapters.every((c) => c.blocks && c.blocks.length >= 2 && c.blocks.every((b) => ["text", "tabell", "definition", "insight", "utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 40)), "blocktyper giltiga + innehåll i alla block");
  ok(k.level === (slug.startsWith("st-") ? "Intermediär" : "Avancerad"), "level enligt klaim", k.level);
  ok(k.xp === 50, "xp 50 (seriestandard)");
  ok(typeof k.why === "string" && k.why.length > 400, "why-raden (varför-raden) finns och är motiverad", k.why.length + " tecken");
  ok(k.history && k.history.origin && k.history.evolution && k.history.modern, "history origin/evolution/modern");
  ok(typeof k.lynchSection === "string" && typeof k.grahamSection === "string" && typeof k.ak1Section === "string", "lynch/graham/ak1-sektioner");
  ok(k.summary.includes("inte investeringsråd"), "utbildningsdisclaimern i summary");
}

// ── 2. Aritmetik — st-07 (skuggskulder, påhittade tal, oberoende omräkning) ───
console.log("═══ ARITMETIK st-07 (påhittade tal)");
ok(approx(45 + 15 + 42, 102, 0.001), "bruttoskugga 45 + 15 + 42 = 102");
ok(approx(180 + 102, 282, 0.001), "justerad skuld 180 + 102 = 282");
ok(approx(180 / 120, 1.50, 0.001) && approx(282 / 120, 2.35, 0.001), "skuldsättningsgrad rapporterad 1,50 → justerad 2,35");
ok(approx(120 / 300, 0.400, 0.0005) && approx(180 / 300, 0.60, 0.0005) && approx(282 / 300, 0.94, 0.0005), "skuldandel av tillgångar 60 % → 94 % (soliditet 40,0 %)");
ok(approx((180 + 45) / 120, 1.875, 0.001), "borgen allena: 225/120 = 1,88");
ok(approx(102 / 120, 0.85, 0.001), "förbindelsekvot 102/120 = 0,85");
ok(approx(102 / 480, 0.2125, 0.0005), "förbindelseandel 102/480 = 0,21");
ok(approx(12 - 9, 3.0, 0.001) && approx(9 * 1.2, 10.8, 0.001) && approx(12 - 10.8, 1.2, 0.001), "kontrakt: täckning 3,0 → 1,2 vid kostnad +20 %");
ok(approx(5 * 3, 15.0, 0.001) && approx(5 * 1.2, 6.0, 0.001) && approx(15 - 6, 9.0, 0.001), "stocken: 15,0 → 6,0, tapp 9,0");
ok(approx(12 - 13, -1.0, 0.001), "förlustzon: 12,0 − 13,0 = −1,0");
ok(approx(200 * 0.7, 140, 0.001) && approx(140 - 120, 20, 0.001), "panttak: (200 × 0,70) − 120 = 20");
ok(approx(25 + 30, 55, 0.001), "reserv 25 + 30 = 55 mot amortering 40");
ok(approx((20 + 5) / 100, 0.25, 0.001), "utmaning A: 25/100 = 0,25");
ok(approx((70 + 10 + 30) / 90, 1.222, 0.001), "utmaning B: 110/90 = 1,22");
ok(approx(15 / 120, 0.125, 0.001), "utmaning C: 15/120 = 0,13");

// ── 3. Aritmetik — pe-08 (avgiftsmaskinen, påhittade tal) ─────────────────────
console.log("═══ ARITMETIK pe-08 (påhittade tal)");
ok(approx(0.02 * 1000, 20, 0.001) && approx(8 * 20, 160, 0.001), "fee 20/år × 8 år = 160");
ok(approx(1000 - 160, 840, 0.001) && approx(840 / 1000 - 1, -0.16, 0.001), "plant läge: 840 = −16 %");
ok(approx(800 * 0.02, 16, 0.001), "fee på investerat 800 × 2 % = 16");
ok(approx(1700 - 1000, 700, 0.001), "bruttovinst 1 700 − 1 000 = 700");
ok(approx(5 * 0.08, 0.40, 0.0001) && approx(0.40 * 1000, 400, 0.001), "tröskel enkel ränta: 5 × 8 % = 400");
ok(approx(Math.pow(1.08, 5), 1.4693, 0.0001) && approx(0.4693 * 1000, 469, 0.5), "ränta på ränta: 1,08^5 = 1,4693 → 469 (skillnad 69)");
ok(approx(0.2 * 300, 60, 0.001) && approx(60 / 700, 0.0857, 0.0005), "utan uppfångst: 60 av 700 = 8,6 %");
const X = 0.2 * 400 / 0.8;
ok(approx(X, 100, 0.001), "uppfångstekvationen X = 0,20 × (400 + X) → X = 100");
ok(approx(100 / (400 + 100), 0.20, 0.0001), "kontroll: 100/500 = 20,0 % exakt");
ok(approx(700 - 400 - 100, 200, 0.001) && approx(0.8 * 200, 160, 0.001) && approx(0.2 * 200, 40, 0.001), "resten 200 delas 160/40");
ok(approx(100 + 40, 140, 0.001) && approx(140 / 700, 0.20, 0.0001), "carry 140 = 20,0 % av 700");
ok(approx(1000 + 400 + 160, 1560, 0.001) && approx(1560 + 140, 1700, 0.001), "LP 1 560; stängning 1 560 + 140 = 1 700");
ok(approx(1560 / 1000, 1.56, 0.0001) && approx(Math.pow(1.56, 1 / 6) - 1, 0.077, 0.001), "LP 56,0 % = 7,7 % per år i sex år");
ok(approx(100 + 140, 240, 0.001) && approx(240 / 1000, 0.24, 0.0001), "GP totalt 240 = 24 % av förbandet");
ok(approx(140 / 560, 0.25, 0.0001), "nettokvoten 140/560 = 25,0 %");
ok(approx(700 - 200, 500, 0.001) && approx(0.2 * 500, 100, 0.001) && approx(140 - 100, 40, 0.001), "clawback: 20 % av 500 = 100, åter 40");
ok(approx(0.2 * 300, 60, 0.001) && approx(300 - 200, 100, 0.001) && approx(0.2 * 100, 20, 0.001) && approx(60 - 20, 40, 0.001), "deal-by-deal: carry 60, rätt 20, åter 40");
ok(approx(1000 - 20, 980, 0.001), "J-kurvan år 1: 1 000 − 20 = 980");
// Utmaningens stängningstest (b): 1 800
ok(approx(0.2 * 800, 160, 0.001) && approx(1000 + 400 + 240, 1640, 0.001) && approx(1640 + 160, 1800, 0.001), "utmaning (b): carry 160, LP 1 640, stängning 1 800");

// ── 4. Språkgrind (på PARSAT innehåll) ────────────────────────────────────────
console.log("═══ SPRÅKGRIND");
const lasor = {
  "kinesiska/kyrilliska tecken": /[\u4e00-\u9fff\u0400-\u04FF]/,
  "tankeartefakter (tre punkter)": /\.\.\./,
  "dubbla mellanslag": / {2,}/,
  "mjuka bindestreck": /\u00ad/,
  "saknad luft efter skiljetecken": /[a-zåäö],[a-zåäö]/,
  "typografiska citat": /[\u201c\u201d\u2018\u2019«»]/,
  "tabb": /\t/,
};
for (const [namn, re] of Object.entries(lasor)) {
  for (const slug of MINA) {
    const k = kurser[slug]; if (!k) continue;
    const txt = JSON.stringify(k);
    const hits = txt.match(new RegExp(re.source, "g")) || [];
    ok(hits.length === 0, namn + " — " + slug, hits.length ? "träffar: " + [...new Set(hits)].slice(0, 5).join(", ") : "ren");
  }
}

// ── 5. Juridikgrind + R2 (värden, inte nycklar) ───────────────────────────────
console.log("═══ JURIDIK + R2");
const vardeText = (o, uteslutNyckel) => {
  const ut = [];
  const ga = (x, nyckel) => {
    if (typeof x === "string") { if (nyckel !== uteslutNyckel) ut.push(x); return; }
    if (Array.isArray(x)) { x.forEach((e) => ga(e, nyckel)); return; }
    if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) ga(v, k);
  };
  ga(o, null);
  return ut.join("\n");
};
for (const slug of MINA) {
  const k = kurser[slug]; if (!k) continue;
  const text = vardeText(k);
  const textUtanSlug = vardeText(k, "slug");
  ok(!/(du bör köp|du bör sälj|investera i denna|placera dina pengar i|rekommenderar att du köper|köp denna aktie|råder dig att)/i.test(text), slug + ": 0 rådsfraser");
  ok(/utbildning i|pedagogisk/i.test(text), slug + ": utbildningsframing");
  ok(/påhittat|påhittade/i.test(text), slug + ": PÅHITTADE-markör");
  ok(!/\b(1[0-9]{3}|20[0-9]{2}):\d+\b/.test(text), slug + ": 0 lagrumsformat");
  ok(!/\b(lagen|lagrum|balken)\b/i.test(textUtanSlug), slug + ": 0 lagrum");
  ok(!/\t/.test(text) && !/\u00ad/.test(text), slug + ": 0 tabbar/mjuka bindestreck");
  ok(!/[a-zåäö]_[a-zåäö]/i.test(text), slug + ": 0 underscore-läcka");
  ok(!/(kr\/mån|9 999|13 999|\b249\b|\b449\b|\b799\b)/.test(text), slug + ": R2 0 pris-tal");
  ok(!/\b(kraverFas|Fas 2|Fas 3|tier)\b/.test(text), slug + ": R2 0 tier-/fasvägg");
  ok(!/(publicera på|utgivning|lanserar i bloggen)/.test(text), slug + ": R2 0 publiceringslöfte");
  // E8 — engelska funktionord; «American Research and Development» = verkligt fondbeteckning (proper noun, whitelist enligt o25-boktitels-presedens)
  const rensad = textUtanSlug
    .replace(/American Research and Development/g, "").replace(/carried interest/g, "K")
    .replace(/catch-up/g, "U").replace(/waterfall/g, "T").replace(/clawback/g, "Å")
    .replace(/hurdle/g, "H").replace(/fee\b/g, "F").replace(/\bisär\b/g, "X");
  const ENG = ["the", "and", "with", "from", "that", "this", "are", "of", "on", "by", "it", "as", "at", "or", "to", "be", "was", "for"];
  const traffa = ENG.filter((w) => new RegExp("\\b" + w + "\\b", "g").test(rensad));
  ok(traffa.length === 0, slug + ": 0 engelska funktionord (whitelist dokumenterad)", traffa.length ? traffa.join(", ") : "ren");
}

// ── 6. Korslänkar registeräkta + blockkonvention + signaturtal ────────────────
console.log("═══ KORSLÄNKOR + BLOCKKONVENTION + SIGNATURTAL");
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
for (const slug of MINA) {
  const k = kurser[slug]; if (!k) continue;
  const textUtanSlug = vardeText(k, "slug");
  const seriePrefix = [...new Set(Object.keys(reg).filter((s) => /^[a-z]{1,5}-\d/.test(s)).map((s) => s.split("-")[0]))];
  const reKors = new RegExp("\\b(" + seriePrefix.join("|") + ")-(\\d{2,3})\\b", "g");
  const egenPrefix = slug.split("-").slice(0, 2).join("-");
  const kort = [...new Set([...textUtanSlug.matchAll(reKors)].map((m) => m[1] + "-" + m[2]))].filter((x) => x !== egenPrefix);
  const saknade = kort.filter((x) => !Object.keys(reg).some((s) => s === x || s.startsWith(x + "-")));
  ok(saknade.length === 0, slug + ": korslänkar registeräkta (" + kort.length + " st)", saknade.length ? saknade.join(", ") : kort.join(" "));
  let konvention = true;
  k.chapters.forEach((c, i) => {
    if (c.blocks[0].type !== "text") konvention = false;
    if (i < 5 && c.blocks[2].type !== "insight") konvention = false;
    if (i === 5 && !c.blocks.some((b) => b.type === "utmaning")) konvention = false;
  });
  ok(konvention, slug + ": kap 1-5 = text först + insight sist; kap 6 bär utmaning");
  const signatur = slug.startsWith("st-")
    ? ["45", "15", "42", "102", "180", "282", "1,50", "2,35", "0,85", "94", "10,8", "15,0", "6,0", "9,0", "20", "55", "1,88", "0,21", "1,22"]
    : ["1 000", "160", "840", "700", "400", "100", "200", "160", "140", "1 560", "1 700", "56,0", "7,7", "240", "25,0", "469", "980", "8,6", "40"];
  const text = vardeText(k);
  const saknas = signatur.filter((t) => !text.includes(t));
  ok(saknas.length === 0, slug + ": signaturtal närvarande (" + signatur.length + " st)", saknas.length ? "saknas: " + saknas.join(", ") : "alla");
  const learnAntal = k.learn.split(" · ").length;
  ok(learnAntal >= 7 && learnAntal <= 8, slug + ": learn 7-8 punkter", String(learnAntal));
}

console.log("────");
console.log(`KVD-KONTROLL: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
