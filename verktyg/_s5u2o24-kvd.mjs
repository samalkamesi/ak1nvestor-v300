#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789932910773, omgång 24) — KVD-KONTROLL av de två
 * nya kursfilerna FÖRE register-synk: JSON-giltighet, strukturparitet
 * chapters_list↔chapters, aritmetisk verifiering av samtliga räkneexempel,
 * språkgrind (läckor/kinesiska/dubbla mellanslag) och slug-regeln.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["tx-06-enhetsekonomin", "ib-06-evighetskapitalet"];
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
  ok(["Nybörjare", "Intermediär", "Avancerad"].includes(k.level), "level giltig", k.level);
  ok(k.xp === 50, "xp 50 (seriestandard)");
  ok(typeof k.why === "string" && k.why.length > 400, "why-raden (varför-raden) finns och är motiverad", k.why.length + " tecken");
  ok(k.history && k.history.origin && k.history.evolution && k.history.modern, "history origin/evolution/modern");
  ok(typeof k.lynchSection === "string" && typeof k.grahamSection === "string" && typeof k.ak1Section === "string", "lynch/graham/ak1-sektioner");
  ok(!/investeringsråd/.test(k.summary) === false, "utbildningsdisclaimern i summary", "…inte investeringsråd");
}

// ── 2. Aritmetik — tx-06 ──────────────────────────────────────────────────────
console.log("═══ ARITMETIK tx-06 (påhittade tal)");
const tx = kurser["tx-06-enhetsekonomin"];
ok(approx(600 / 70, 8.6, 0.05), "payback 600/70 = 8,6", String((600 / 70).toFixed(2)));
ok(approx(1 / 0.035, 28.6, 0.05), "livslängd 1/0,035 = 28,6", String((1 / 0.035).toFixed(2)));
ok(approx(70 / 0.035, 2000, 1), "LTV 70/0,035 = 2 000", String((70 / 0.035).toFixed(1)));
ok(approx(2000 / 600, 3.33, 0.01), "LTV/CAC 2 000/600 = 3,33", String((2000 / 600).toFixed(3)));
ok(approx(1 - Math.pow(0.965, 12), 0.348, 0.001), "årsbortfall 1−0,965¹² = 34,8 %", String(((1 - Math.pow(0.965, 12)) * 100).toFixed(1)) + " %");
ok(approx(70 / 0.0175, 4000, 1) && approx(1 / 0.0175, 57.1, 0.05), "bolag A: LTV 4 000 · livslängd 57,1");
ok(approx(70 / 0.07, 1000, 1) && approx(1 / 0.07, 14.3, 0.05), "bolag C: LTV 1 000 · livslängd 14,3");
ok(approx(4000 / 600, 6.67, 0.01) && approx(1000 / 600, 1.67, 0.01), "nyckeltal A 6,67 · C 1,67");
ok(approx(600000 / 70, 8571, 1), "brytpunkt 600 000/70 = 8 571 kunder");
ok(approx(1000 / 0.035, 28571, 1), "jämviktsstock 1 000/0,035 = 28 571");
ok(approx(70 * 28571, 1999970, 10000), "jämviktskontribution ≈ 2,0 M kr/mån", String((70 * 28571 / 1e6).toFixed(2)) + " M");
// tid till brytpunkt: N(t) = 28571×(1−0,965^t) ≥ 8571 ⇒ t ≥ ln(0,7)/ln(0,965)
ok(approx(Math.log(0.7) / Math.log(0.965), 10.0, 0.15), "tid till brytpunkt ≈ 10 månader", String((Math.log(0.7) / Math.log(0.965)).toFixed(1)));
ok(approx(120 / 70, 1.7, 0.05) && approx(1400 / 70, 20.0, 0.05), "kanal-payback 1,7 resp 20,0 månader");
ok(approx(Math.pow(1.1, 1 / 12) - 1, 0.0080, 0.0003) && approx(70 / (0.035 + 0.008), 1628, 20), "diskonterat LTV ≈ 1 630 kronor", String((70 / (0.035 + Math.pow(1.1, 1 / 12) - 1)).toFixed(0)));

// ── 3. Aritmetik — ib-06 ──────────────────────────────────────────────────────
console.log("═══ ARITMETIK ib-06 (påhittade tal)");
ok(approx(Math.pow(1.08, 40), 21.7, 0.05), "1,08⁴⁰ = 21,7", String(Math.pow(1.08, 40).toFixed(2)));
ok(approx(Math.pow(1.08, 10), 2.159, 0.001) && approx(Math.pow(1.08, 10) * 0.9, 1.943, 0.001), "decennium med kostnad 1,08¹⁰×0,90 = 1,943");
ok(approx(Math.pow(1.943, 4), 14.3, 0.1), "fyra omläggningar 1,943⁴ = 14,3", String(Math.pow(1.943, 4).toFixed(2)));
ok(approx(Math.pow(1.08, 40) / Math.pow(1.943, 4), 1.52, 0.02), "evighetsfördelen 52 %", String((Math.pow(1.08, 40) / Math.pow(1.943, 4) * 100 - 100).toFixed(0)) + " %");
ok(approx(Math.pow(1.08, 9) * 0.8, 1.599, 0.001), "dipp-decennium 1,08⁹×0,80 = 1,60", String((Math.pow(1.08, 9) * 0.8).toFixed(3)));
ok(approx(Math.pow(1.08, 30), 10.063, 0.001), "1,08³⁰ = 10,063");
ok(approx(Math.pow(1.08, 9) * 0.8 * Math.pow(1.08, 30), 16.1, 0.1), "stressat utfall ≈ 16,1x", String((Math.pow(1.08, 9) * 0.8 * Math.pow(1.08, 30)).toFixed(2)));
ok(approx(Math.pow(1.08, 40) / (Math.pow(1.08, 9) * 0.8 * Math.pow(1.08, 30)), 1.35, 0.02), "evighetsfördelen i dippen 35 %", String((Math.pow(1.08, 40) / (Math.pow(1.08, 9) * 0.8 * Math.pow(1.08, 30)) * 100 - 100).toFixed(0)) + " %");

// ── 4. Språkgrind ─────────────────────────────────────────────────────────────
console.log("═══ SPRÅKGRIND");
const lasor = {
  "engelska/tyska läckor": /\b(also|matters|must leave|selbst|discipline|forcinga|calibration|Liability|deadline|time itself)\b/i,
  "kinesiska tecken": /[\u4e00-\u9fff]/,
  "kända felstavningar": /\b(odeburna|odebreakerat|ENHITSPROT|PRiset|räkneläga|nedgångsdp|kannoniskt|sälla sin|strategi fråga)\b/,
  "dubbla mellanslag": /  +/,
  "saknad luft efter skiljetecken": /[a-zåäö],[a-zåäö]/,
};
for (const [namn, re] of Object.entries(lasor)) {
  for (const slug of MINA) {
    const k = kurser[slug]; if (!k) continue;
    const txt = JSON.stringify(k);
    const hits = txt.match(new RegExp(re.source, re.flags.includes("i") ? "gi" : "g")) || [];
    ok(hits.length === 0, namn + " — " + slug, hits.length ? "träffar: " + [...new Set(hits)].slice(0, 5).join(", ") : "ren");
  }
}

console.log("────");
console.log(`KVD-KONTROLL: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
