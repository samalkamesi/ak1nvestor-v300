#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1790027118738, omgång 27) — KVD för
 * roic-06-bankernas-lonsamhet + st-08-bindningsrisken.
 * Struktur · aritmetik (oberoende omräkning) · juridikgrind · språkgrind ·
 * korslänkar registeräkta · R2-pristal · sondbelägg · round-trip.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const MINA = ["roic-06-bankernas-lonsamhet", "st-08-bindningsrisken"];

let PASS = 0, FEL = 0, VARNING = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };
const varna = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { VARNING++; console.log("  VARN " + n + (d ? " — " + d : "")); } };

// ── 1. Struktur + round-trip ────────────────────────────────────────────────
console.log("═══ STRUKTUR + ROUND-TRIP");
for (const s of MINA) {
  const kalla = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + s + ".json", "utf8"));
  ok(JSON.stringify(kalla) === JSON.stringify(reg[s]), s + ": källa = register bitidentiskt");
  ok(kalla.chapters.length === 6 && kalla.chapterCount === 6, s + ": 6 kapitel");
  ok(kalla.chapters_list.map((c) => c.title).join("|") === kalla.chapters.map((c) => c.title).join("|"), s + ": chapters_list == kapiteltitlar");
  ok(kalla.minutes === kalla.totalMinutes && kalla.minutes === kalla.chapters.reduce((a, c) => a + c.minutes, 0), s + ": minuter konsekventa (24)");
  ok(kalla.xp === 50, s + ": XP 50");
  ok(/^[a-z0-9][a-z0-9-]*$/.test(kalla.slug) && kalla.slug === s, s + ": slug ASCII-konvention");
  const blocktyper = kalla.chapters.flatMap((c) => c.blocks.map((b) => b.type));
  ok(blocktyper.every((t) => ["text", "definition", "insight", "tabell", "utmaning"].includes(t)), s + ": blocktyper giltiga (" + [...new Set(blocktyper)].join("/") + ")");
  ok(kalla.chapters.every((c) => c.blocks.every((b) => Object.keys(b).length === 2)), s + ": block exakt {type, content}");
  ok(blocktyper.includes("utmaning") && kalla.chapters[5].blocks.some((b) => b.type === "utmaning"), s + ": utmaning i slutkapitlet");
  ok(["summary", "why", "learn", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section"].every((k) => typeof kalla[k] === "string" || (k === "chapters_list" && Array.isArray(kalla[k])) || (k === "history" && typeof kalla[k] === "object")), s + ": alla sektioner närvarande");
}

// ── 2. Aritmetik (oberoende omräkning av kursens alla deklarerade ekvationer) ─
console.log("═══ ARITMETIK");
const A = (v, n) => ok(v, n);
// roic-06: Norra Bank
A(11000 * 0.045 === 495 && 9000 * 0.01 === 90 && 2400 * 0.03 === 72, "rö-06 räntekomponenter 495/90/72");
A(495 - (90 + 72) === 333, "rö-06 räntenetto 333");
A(333 + 156 === 489 && 489 - 300 === 189, "rö-06 totalintäkter 489, före förlust 189");
A(11000 * 0.003 === 33 && 189 - 33 === 156, "rö-06 kreditförlust 33, resultat 156");
A(156 * 0.75 === 117, "rö-06 netto 117 (25 % skatt)");
A(Math.abs(117 / 640 - 0.1828) < 0.0001, "rö-06 ROE 18,3 %");
A(Math.abs(189 / 12040 - 0.0157) < 0.0001, "rö-06 ROIC-försök 1,57 %");
A(Math.abs(117 / 489 - 0.2393) < 0.0001 && Math.abs(489 / 12040 - 0.0406) < 0.0001 && Math.abs(12040 / 640 - 18.8125) < 0.001, "rö-06 DuPont 23,9 % × 0,041 × 18,8");
A(9000 + 2400 + 640 === 12040, "rö-06 balansen 12 040 = inlåning + marknad + EK");
A(7000 * 0.35 === 2450 && 2450 + 4000 === 6450 && Math.abs(516 / 6450 - 0.08) < 0.0001, "rö-06 riskvägda 6 450, kärnkapitalrelation exakt 8,0 %");
A(11000 * 0.007 === 77 && 156 - 77 === 79 && Math.abs(77 / 156 - 0.494) < 0.001, "rö-06 förlustbåge: +0,70 pp = 77 = 49 % av resultatet");
A(Math.abs(300 / 489 - 0.6135) < 0.0001, "rö-06 C/I 61 %");
A(Math.abs(640 / 12040 - 0.0532) < 0.0001, "rö-06 soliditet 5,3 %");
// st-08: Sund Värme
A(600 * 0.06 === 36 && 600 * 0.05 === 30, "st-08 räntor 36/30");
A(200 * 0.05 + 400 * 0.06 === 34, "st-08 trappränta 34");
A(Math.abs(90 / 36 - 2.5) < 1e-9 && Math.abs(90 / 30 - 3) < 1e-9 && Math.abs(90 / 34 - 2.647) < 0.001, "st-08 täckningar 2,50/3,00/2,65");
A(600 * 0.09 === 54 && 10 + 400 * 0.09 === 46, "st-08 stressräntor 54/46");
A(Math.abs(70 / 54 - 1.296) < 0.001 && Math.abs(70 / 30 - 2.333) < 0.001 && Math.abs(70 / 46 - 1.522) < 0.001, "st-08 stresstäckningar 1,30/2,33/1,52");
A(600 + 380 === 980 && Math.abs(380 / 980 - 0.3878) < 0.0001 && Math.abs(600 / 380 - 1.579) < 0.001, "st-08 balans 980, soliditet 38,8 %, skuldsättningsgrad 1,58");
A(200 * 0.065 === 13 && 10 + 13 + 12 === 35 && 10 + 13 + 18 === 41 && Math.abs(70 / 41 - 1.707) < 0.001, "st-08 swap: 13 swapfasta, ränta 35 lugnt / 41 stress, täckning 1,71");
A(200 * 0.005 === 1, "st-08 swappåslag 1/år");
A(5.0 - 2.2 === 2.8, "st-08 break-even 2,80 %");

// ── 3. Juridikgrind ─────────────────────────────────────────────────────────
console.log("═══ JURIDIKGRIND");
for (const s of MINA) {
  const txt = JSON.stringify(reg[s]).toLowerCase();
  const radfraser = ["köp denna aktie", "sälj denna aktie", "rekommenderar köp", "rekommenderar sälj", "bör du köpa", "bör du sälja", "mina bästa aktier", "investera i denna"];
  ok(!radfraser.some((f) => txt.includes(f)), s + ": 0 rådsfraser");
  ok(!/\b(2007:528|2022:260|2022:261|1985:716|2022:482|2005:59)\b/.test(txt), s + ": 0 lagrum (ingen blandningsrisk — kursen äger ingen juridik)");
  ok(txt.includes("inte investeringsråd") || txt.includes("ingen uppmaning att köpa"), s + ": utbildningsframing närvarande");
  ok(txt.includes("påhittad") || txt.includes("påhittade"), s + ": exempel tal deklarerade påhittade");
}

// ── 4. Språkgrind ───────────────────────────────────────────────────────────
console.log("═══ SPRÅKGRIND");
for (const s of MINA) {
  const rå = readFileSync(ROT + "/data/kurser-tillagg/" + s + ".json", "utf8");
  ok(!/[\u0370-\u03ff\u0400-\u04ff\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff]/.test(rå), s + ": 0 CJK/kyrilliska/grekiska/arabiska");
  ok(!/[\u00ad\u200b\u200c\u200d\ufeff\t]/.test(rå), s + ": 0 mjuka bindestreck/osynliga/tabb");
  const dubbel = rå.match(/\b(\w{3,})\s+\1\b/gi);
  ok(!dubbel, s + ": 0 dubbelord" + (dubbel ? " (" + dubbel.join(",") + ")" : ""));
  ok(!/[a-zåäö]  +[a-zåäö]/.test(rå), s + ": 0 dubbla mellanslag");
  ok(!/\S :/.test(rå), s + ": 0 mellanslag-före-kolon");
  const engelska = ["itself", "something", "financiar", "betalbar", "self ", "facing ", "the ", "and ", "with "].filter((w) => new RegExp("\\b" + w.trim() + "\\b", "i").test(rå.replace(/"[a-zA-Z]+":/g, "").replace(/\\"/g, "")));
  ok(engelska.length === 0, s + ": 0 engelska-läckor" + (engelska.length ? " (" + engleska.join(",") + ")" : ""));
}

// ── 5. Korslänkar registeräkta (prefixmatch) ────────────────────────────────
console.log("═══ KORSLÄNKAR");
const regSlugs = Object.keys(reg);
const regPrefix = new Set(regSlugs.map((s) => s.split("-").slice(0, 2).join("-")));
for (const s of MINA) {
  const refs = [...JSON.stringify(reg[s]).matchAll(/\b((?:se|ln|roic|st|rk|ks|km|ma|od|bf|kt|pe|ib|vr|ud|tx|bk|rs|am|ek|mt|mk|pf|pc|sj)-\d{1,2})\b/g)].map((m) => m[1]);
  const unika = [...new Set(refs)];
  const saknade = unika.filter((r) => !regPrefix.has(r));
  ok(saknade.length === 0, s + ": " + unika.length + " kursreferenser registeräkta" + (saknade.length ? " — SAKNAS: " + saknade.join(", ") : " (" + unika.join(", ") + ")"));
}

// ── 6. R2: pristal ──────────────────────────────────────────────────────────
console.log("═══ R2");
for (const s of MINA) {
  const txt = JSON.stringify(reg[s]);
  ok(!/(249|449|799|9 ?999|13 ?999)\s*(kr|kronor)/.test(txt), s + ": 0 tjänstepristal");
}

// ── 7. Sondbelägg: kärntermerna ägs nu ENDAST av mina kurser ────────────────
console.log("═══ SONDBELÄGG");
function textAv(kurs) {
  const delar = [kurs.title, kurs.summary, kurs.why, kurs.learn, kurs.lynchSection, kurs.grahamSection, kurs.ak1Section];
  if (Array.isArray(kurs.chapters_list)) delar.push(...kurs.chapters_list.flatMap((c) => [c?.title, c?.text].filter(Boolean)));
  if (Array.isArray(kurs.chapters)) delar.push(...kurs.chapters.flatMap((c) => [c?.title, c?.text, ...(c?.bullets || [])].filter(Boolean)));
  if (kurs.history) delar.push(JSON.stringify(kurs.history));
  return delar.filter(Boolean).join("\n").toLowerCase();
}
const alla = Object.values(reg).map((k) => ({ slug: k.slug, txt: textAv(k) }));
const agare = (term) => alla.filter((k) => k.txt.includes(term)).map((k) => k.slug);
for (const [term,vantad] of [
  ["riskvägt", "roic-06-bankernas-lonsamhet"],
  ["utlåningsmarginal", "roic-06-bankernas-lonsamhet"],
  ["kreditförlustnivå", "roic-06-bankernas-lonsamhet"],
  ["bindningsrisk", "st-08-bindningsrisken"],
]) {
  const a = agare(term);
  const Frida = a.filter((s) => s !== vantad);
  ok(Frida.length === 0 && a.includes(vantad), `«${term}» ägs av ${vantad}` + (Frida.length ? " — FRÄMMANDE: " + Frida.join(",") : " (träffar: " + a.join(",") + ")"));
}

// ── 8. Larvag-synk GRÖN ─────────────────────────────────────────────────────
console.log("═══ LÄRVÄGSSYNK");
const synk = JSON.parse(readFileSync(ROT + "/data/vakten/larvag-synk.json", "utf8"));
ok(synk.status === "grön" && synk.registerAntal === 492 && synk.kartaAntal === 492 && synk.konstantAntal === 492, "larvag-synk GRÖN 492 = 492 = 492");
ok(Object.keys(reg).length === 492, "registret 492 kurser");

console.log("────");
console.log(`KVD: ${PASS} PASS · ${FEL} FEL · ${VARNING} VARNING`);
process.exit(FEL ? 1 : 0);
