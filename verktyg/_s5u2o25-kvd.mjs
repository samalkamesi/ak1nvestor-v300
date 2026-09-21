#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789962309223, omgång 25) — KVD-KONTROLL av de två
 * nya kursfilerna FÖRE register-synk: JSON-giltighet, strukturparitet
 * chapters_list↔chapters, aritmetisk verifiering av samtliga räkneexempel,
 * språkgrind (läckor/kinesiska/kyrilliska/tre-punkter/dubbla mellanslag) och
 * slug-regeln.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["bk-08-intaktredovisningen", "roic-05-den-ekonomiska-vinsten"];
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
  ok(k.category === (slug.startsWith("bk-") ? "BOKFÖRING & ÅRSREDOVISNING" : "LÖNSAMHET"), "kategori exakt", k.category);
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
  ok(k.level === (slug.startsWith("bk-") ? "Intermediär" : "Avancerad"), "level enligt klaim", k.level);
  ok(k.xp === 50, "xp 50 (seriestandard)");
  ok(typeof k.why === "string" && k.why.length > 400, "why-raden (varför-raden) finns och är motiverad", k.why.length + " tecken");
  ok(k.history && k.history.origin && k.history.evolution && k.history.modern, "history origin/evolution/modern");
  ok(typeof k.lynchSection === "string" && typeof k.grahamSection === "string" && typeof k.ak1Section === "string", "lynch/graham/ak1-sektioner");
  ok(k.summary.includes("inte investeringsråd"), "utbildningsdisclaimern i summary");
}

// ── 2. Aritmetik — bk-08 (IFRS 15, påhittade tal) ─────────────────────────────
console.log("═══ ARITMETIK bk-08 (påhittade tal)");
ok(approx(600 + 300 + 100, 1000, 0.001), "fristående priser 600 + 300 + 100 = 1 000");
ok(approx(900 * 0.6, 540, 0.001) && approx(900 * 0.3, 270, 0.001) && approx(900 * 0.1, 90, 0.001), "allokering 540 · 270 · 90");
ok(approx(540 + 270 + 90, 900, 0.001), "allokerade priser summerar till paketpriset 900");
ok(approx((400 / 1000) * 270, 108, 0.001), "över tid: 0,40 × 270 = 108");
ok(approx(90 * (6 / 24), 22.5, 0.001), "support rakt: 90 × 6/24 = 22,5");
ok(approx(540 + 108 + 22.5, 670.5, 0.001), "årets redovisade intäkt = 670,5");
ok(approx(690 - 670.5, 19.5, 0.001), "avtalsskuld 690 − 670,5 = 19,5");
ok(approx(670.5 - 640, 30.5, 0.001), "spegelfallets avtalstillgång 30,5");
ok(approx(270 - 108, 162, 0.001) && approx(90 - 22.5, 67.5, 0.001) && approx(162 + 67.5, 229.5, 0.001), "backlog 162 + 67,5 = 229,5");
ok(approx(270 + 60, 330, 0.001), "bonus 60 följer implementeringen: 270 + 60 = 330");
ok(approx(900 + 60, 960, 0.001), "pris efter frigiven bonus 960");
ok(approx(100 - 20, 80, 0.001) && approx(20 / 100, 0.2, 0.001), "huvudagent: netto 20 av brutto 100 (20 procent)");

// ── 3. Aritmetik — roic-05 (EVA, påhittade tal) ──────────────────────────────
console.log("═══ ARITMETIK roic-05 (påhittade tal)");
ok(approx(250 * 0.72, 180, 0.001), "NOPAT 250 × 0,72 = 180");
ok(approx(0.09 * 1500, 135, 0.001) && approx(180 - 135, 45, 0.001), "kapitalhyra 135, EVA 45");
ok(approx(180 / 1500, 0.12, 0.0001) && approx(0.12 - 0.09, 0.03, 0.0001) && approx(0.03 * 1500, 45, 0.001), "spridningen: 12 % − 9 % = 3 % × 1 500 = 45");
ok(approx(1000 * 0.10, 100, 0.001), "EK-hyra 1 000 × 10 % = 100");
ok(approx(9.72 * 0.72, 7.0, 0.01) && approx(500 * 0.0972 * 0.72, 35, 0.1), "skuld efter skatt 9,72 % × 0,72 = 7,0 % → 35 kr");
ok(approx((100 + 35) / 1500, 0.09, 0.0005), "WACC (100 + 35)/1 500 = 9,0 %");
ok(approx(105 / 1500, 0.07, 0.0001) && approx(105 - 135, -30, 0.001) && approx((0.07 - 0.09) * 1500, -30, 0.001), "Sörverk: ROIC 7 %, EVA −30 (båda vägarna)");
ok(approx(105 / 0.72, 145.8, 0.1), "Sörverks vinst före skatt 105/0,72 ≈ 146");
ok(approx(45 / 0.09, 500, 0.001) && approx(1500 + 500, 2000, 0.001) && approx(2000 / 1500, 1.333, 0.001), "Norrverk g=0: 2 000 (1,33×)");
ok(approx(45 * 1.03, 46.35, 0.001) && approx(46.35 / 0.06, 772.5, 0.001) && approx(1500 + 772.5, 2272.5, 0.001) && approx(2272.5 / 1500, 1.515, 0.001), "Norrverk g=3 %: 2 272,5 (1,52×)");
ok(approx(-30 / 0.09, -333.3, 0.1) && approx(1500 - 333.3, 1166.7, 0.1), "Sörverk g=0: 1 166,7");
ok(approx(-30 * 1.03, -30.9, 0.001) && approx(-30.9 / 0.06, -515, 0.001) && approx(1500 - 515, 985, 0.001), "Sörverk g=3 %: 985");
ok(approx(-30 * 1.05, -31.5, 0.001) && approx(-31.5 / 0.04, -787.5, 0.001) && approx(1500 - 787.5, 712.5, 0.001), "Sörverk g=5 %: 712,5 — tillväxten fördjupar hålet");
ok(approx(0.15 * 0.8, 0.12, 0.0001) && approx(0.06 * 2.0, 0.12, 0.0001), "två vägar samma ROIC: 15 %×0,8 = 6 %×2,0 = 12 %");
ok(approx(0.09 * 100, 9.0, 0.001) && approx(0.09 * 75, 6.75, 0.001) && approx(0.09 * 50, 4.5, 0.001) && approx(0.09 * 25, 2.25, 0.001), "avskrivningens hyror 9,0 · 6,75 · 4,50 · 2,25");

// ── 4. Språkgrind (på PARSAT innehåll — ingen formateringsbrus) ───────────────
console.log("═══ SPRÅKGRIND");
const lasor = {
  "engelska/tyska läckor": /\b(also|matters|must|itself|leave|selbst|calibration|deadline|multiple:n|inclusive|vendue)\b/i,
  "kinesiska tecken": /[\u4e00-\u9fff]/,
  "kyrilliska tecken": /[\u0400-\u04FF]/,
  "tankeartefakter (tre punkter)": /\.\.\./,
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

// ── 5. Juridikgrind + R2 (värden, inte nycklar; \b på båda sidor) ─────────────
console.log("═══ JURIDIK + R2");
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
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
  ok(/påhittat|pedagogiskt konstruerade/i.test(text), slug + ": PÅHITTADE-markör");
  ok(!/\b(1[0-9]{3}|20[0-9]{2}):\d+\b/.test(text), slug + ": 0 lagrumsformat");
  ok(!/\b(lagen|lagrum|balken)\b/i.test(textUtanSlug), slug + ": 0 lagrum");
  ok(!/[\u201c\u201d\u2018\u2019«»]/.test(text), slug + ": 0 typografiska citat");
  ok(!/\t/.test(text) && !/\u00ad/.test(text), slug + ": 0 tabbar/mjuka bindestreck");
  ok(!/[a-zåäö]_[a-zåäö]/i.test(text), slug + ": 0 underscore-läcka");
  // R2 — exakta pris-tal; «prenumeration» är kursämne och etablerat (30 kurser i registret)
  ok(!/(kr\/mån|9 999|13 999|\b249\b|\b449\b|\b799\b)/.test(text), slug + ": R2 0 pris-tal");
  ok(!/\b(kraverFas|Fas 2|Fas 3|tier)\b/.test(text), slug + ": R2 0 tier-/fasvägg");
  ok(!/(publicera på|utgivning|lanserar i bloggen)/.test(text), slug + ": R2 0 publiceringslöfte");
  // E8 — engelska funktionord med dokumenterad whitelist («not» = en not,
  // «in» = partikel; «isär», måttord och boktitlar substitueras före test)
  const rensad = textUtanSlug
    .replace(/\bIFRS\b/g, "").replace(/\bEVA\b/g, "").replace(/\bNOPAT\b/g, "")
    .replace(/\bWACC\b/g, "").replace(/\bROIC\b/g, "").replace(/\bbacklog\b/g, "")
    .replace(/margin of safety/g, "").replace(/analysis-for-financial-management/g, "")
    .replace(/expectations-investing/g, "").replace(/\bisär\b/g, "X");
  const ENG = ["the", "and", "with", "from", "that", "this", "are", "of", "on", "by", "it", "as", "at", "or", "to", "be", "was", "for"];
  const traffa = ENG.filter((w) => new RegExp("\\b" + w + "\\b", "g").test(rensad));
  ok(traffa.length === 0, slug + ": 0 engelska funktionord (whitelist not/in dokumenterad)", traffa.length ? traffa.join(", ") : "ren");
  // Korslänkar — varje serie-referens lever i registret
  const seriePrefix = [...new Set(Object.keys(reg).filter((s) => /^[a-z]{1,5}-\d/.test(s)).map((s) => s.split("-")[0]))];
  const reKors = new RegExp("\\b(" + seriePrefix.join("|") + ")-(\\d{2,3})\\b", "g");
  const egenPrefix = slug.split("-").slice(0, 2).join("-");
  const kort = [...new Set([...textUtanSlug.matchAll(reKors)].map((m) => m[1] + "-" + m[2]))].filter((x) => x !== egenPrefix);
  const saknade = kort.filter((x) => !Object.keys(reg).some((s) => s === x || s.startsWith(x + "-")));
  ok(saknade.length === 0, slug + ": korslänkar registeräkta (" + kort.length + " st)", saknade.length ? saknade.join(", ") : kort.join(" "));
  ok(!!reg[slug] && JSON.stringify(reg[slug]) === JSON.stringify(kurser[slug]), slug + ": registret bär rättad text (efterleverans-läge)", "registerpost == källfil");
}

// ── 6. Blockkonvention + signaturtal (familj: kap 1-5 slutar insight; kap 6 bär utmaning) ──
console.log("═══ BLOCKKONVENTION + SIGNATURTAL");
for (const slug of MINA) {
  const k = kurser[slug]; if (!k) continue;
  const text = vardeText(k);
  let konvention = true;
  k.chapters.forEach((c, i) => {
    if (c.blocks[0].type !== "text") konvention = false;
    if (i < 5 && c.blocks[2].type !== "insight") konvention = false;
    if (i === 5 && !c.blocks.some((b) => b.type === "utmaning")) konvention = false;
  });
  ok(konvention, slug + ": kap 1-5 = text först + insight sist; kap 6 bär utmaning");
  const signatur = slug.startsWith("bk-08")
    ? ["540", "270", "90", "960", "330", "108", "22,5", "670,5", "162", "67,5", "229,5", "690", "19,5", "30,5", "1 000"]
    : ["180", "135", "45", "2 000", "2 272,5", "1 166,7", "985", "712,5", "9,0", "6,75", "4,50", "2,25", "46,35"];
  const saknas = signatur.filter((t) => !text.includes(t));
  ok(saknas.length === 0, slug + ": signaturtal närvarande (" + signatur.length + " st)", saknas.length ? "saknas: " + saknas.join(", ") : "alla");
  const learnAntal = k.learn.split(" · ").length;
  ok(learnAntal >= 7 && learnAntal <= 8, slug + ": learn 7-8 punkter", String(learnAntal));
}

console.log("────");
console.log(`KVD-KONTROLL: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
