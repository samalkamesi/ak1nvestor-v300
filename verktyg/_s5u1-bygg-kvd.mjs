#!/usr/bin/env node
/**
 * KVD — s5-u1 (manifest auto-s5-1789962309223): se-22-byggentreprenaden.
 * Maskinell leveranskontroll FÖRE registersynk:
 *   A aritmetik — varje talpåstående omräknat oberoende (flyttal rundade)
 *   B strukturparitet — chapters_list ↔ chapters, totalt, block exakt {type, content}
 *   C korslänkar — varje slug-referens lever i registret (kursens eget slug undantas)
 *   D juridikgrind — 0 rådsfraser, utbildningsframing, PÅHITTADE-markör, 0 lagrum
 *   E språkgrind — 0 CJK/kyrilliska/citat/tabbar/dubbla mellanslag/underscore + engelska
 *   F format — slug ASCII, level, xp, minutes, weight
 *   G R2 — ingen pris-/tier-/publiceringsyta
 *
 * LÄXA v1→v2 (kontrollens egna fel, dokumenterade): (1) flyttal — 900*1.08 är
 * 972.0000000000001 i IEEE 754, alla produktkontroller rundas; (2) texten byggs
 * av strängVÄRDEN rekursivt — JSON-nycklar (chapters_list) läckte in i E6;
 * (3) suffixmatchning utan inledande \b — «bolagen» innehåller «lagen» och
 * «garantier» innehåller «tier», alla ordgrindar har \b på BÅDA sidor;
 * (4) kursens eget slug-fält räknas inte som korslänk (självreferens).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const kurs = JSON.parse(readFileSync("data/kurser-tillagg/se-22-byggentreprenaden.json", "utf8"));
const reg = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const pass = [], fail = [];
const testa = (n, v, d) => (v ? pass : fail).push(`${v ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`);

// Text = Alla strängVÄRDEN (nycklar undantas; slug-fältet uteslutet ur korslänk/logikgrindar)
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
const text = vardeText(kurs);
const textUtanSlug = vardeText(kurs, "slug");

// ── A aritmetik (oberoende omräkning, rundade) ──
const n = (x) => Math.round(x * 100) / 100;
const A = {
  k1_täckning: n(18000 / 6000) === 3.0,
  k1_nystock: 18000 + 4800 - 6000 === 16800,
  k1_nytäckning: n(16800 / 6000) === 2.8,
  k2_plan: 1000 - 900 === 100 && n((100 / 1000) * 100) === 10.0,
  k2_uf8: Math.round(900 * 1.08) === 972 && 1000 - 972 === 28 && n((28 / 1000) * 100) === 2.8,
  k2_uf12: Math.round(900 * 1.12) === 1008 && 1000 - 1008 === -8,
  k2_p8: n(0.5 * (972 - 900)) === 36 && 972 - 36 === 936 && 1000 - 936 === 64 && n((64 / 1000) * 100) === 6.4,
  k2_p12: n(0.5 * (1008 - 900)) === 54 && 1008 - 54 === 954 && 1000 - 954 === 46 && n((46 / 1000) * 100) === 4.6,
  k3_plan: 800 - 740 === 60 && n((60 / 800) * 100) === 7.5,
  k3_intäkt: n(0.6 * 800) === 480 && n(0.6 * 740) === 444 && 480 - 444 === 36,
  k3_kassa: 460 - 400 === 60 && 480 - 460 === 20,
  k4_behåll: n(0.05 * 800) === 40 && 40 - 12 === 28,
  k4_år2: n(0.3 * 800) === 240 && n(0.3 * 740) === 222 && 240 - 222 === 18 && 300 - 320 === -20,
  k4_år3: n(0.1 * 800) === 80 && n(0.1 * 740) === 74 && 80 - 74 === 6 && 40 - 20 === 20,
  k4_summa_vinst: 36 + 18 + 6 === 60 && 800 - 740 === 60,
  k4_summa_kassa: 60 - 20 + 20 === 60,
  k4_fakturor: 460 + 300 + 40 === 800,
  k4_betalt: 400 + 320 + 20 === 740,
  k5_tunnhet: n(0.03 * 6000) === 180,
  k5_starter: 400 - 300 === 100,
  k6_del1: 18000 + 4800 - 6000 === 16800 && n(16800 / 6000) === 2.8,
  k6_kostnad: Math.round(900 * 1.06) === 954 && n(0.5 * 54) === 27 && 954 - 27 === 927 && 1000 - 927 === 73 && n((73 / 1000) * 100) === 7.3,
};
for (const [k, v] of Object.entries(A)) testa("A " + k, v);

// Signaturtal närvarande i värdetexten
for (const tal of ["18 000", "16 800", "2,8", "972", "1 008", "936", "954", "444", "740", "10,0", "2,8 procent", "6,4", "4,6", "7,3"]) {
  testa("A tal «" + tal + "» närvarande", text.includes(tal));
}

// ── B strukturparitet ──
testa("B1 chapterCount 6", kurs.chapterCount === 6);
testa("B2 chapters längd 6", kurs.chapters.length === 6);
testa("B3 chapters_list längd 6", kurs.chapters_list.length === 6);
const summa = kurs.chapters_list.reduce((s, c) => s + c.minutes, 0);
testa("B4 totalMinutes = summan (24)", kurs.totalMinutes === summa && summa === 24, `summa=${summa}`);
testa("B5 minutes 24", kurs.minutes === 24);
for (let i = 0; i < 6; i++) {
  testa(`B6 kap ${i + 1} paritet list↔chapters`, kurs.chapters_list[i].num === kurs.chapters[i].num && kurs.chapters_list[i].title === kurs.chapters[i].title && kurs.chapters_list[i].minutes === kurs.chapters[i].minutes);
}
const BLOCKTYPER = new Set(["text", "definition", "insight", "tabell", "utmaning"]);
for (let i = 0; i < 6; i++) {
  const c = kurs.chapters[i];
  testa(`B7 kap ${i + 1} 3 block`, c.blocks.length === 3);
  testa(`B8 kap ${i + 1} block exakt {type, content}`, c.blocks.every((b) => Object.keys(b).length === 2 && BLOCKTYPER.has(b.type) && typeof b.content === "string" && b.content.length > 40));
  testa(`B9 kap ${i + 1} mönster text-X-insight`, c.blocks[0].type === "text" && c.blocks[2].type === "insight");
  testa(`B10 kap ${i + 1} intro finns`, typeof c.intro === "string" && c.intro.length > 40);
}
testa("B11 kap 6 block 2 = utmaning", kurs.chapters[5].blocks[1].type === "utmaning");
const learnAntal = kurs.learn.split(" · ").length;
testa("B12 learn 8 punkter", learnAntal === 8, `${learnAntal}`);
for (const f of ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "why", "learn", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"]) {
  testa("B13 fält " + f, f in kurs);
}
testa("B14 history 3 nycklar", Object.keys(kurs.history).join(",") === "origin,evolution,modern");
testa("B15 why-längd 1000-1400", kurs.why.length >= 1000 && kurs.why.length <= 1400, String(kurs.why.length));
testa("B16 summary-längd 1600-2200", kurs.summary.length >= 1600 && kurs.summary.length <= 2200, String(kurs.summary.length));

// ── C korslänkar (mot värdetexten, eget slug undantaget) ──
const kort = [...new Set([...textUtanSlug.matchAll(/\b(se-\d{2}|ma-\d{2}|km-\d{3}|v\d{2}|bk-\d{2}|ln-\d{2}|rk-\d{2}|rs-\d{2})\b/g)].map((m) => m[1]))];
let saknade = [];
for (const k of kort) {
  const kand = Object.keys(reg).filter((s) => s === k || s.startsWith(k + "-"));
  if (!kand.some((s) => reg[s])) saknade.push(k);
}
testa("C1 korslänkar registeräkta (" + kort.length + " st)", saknade.length === 0, saknade.join(", ") || "alla lever");

// ── D juridikgrind ──
const radsfraser = /(du bör köp|du bör sälj|investera i denna|placera dina pengar i|rekommenderar att du köper|köp denna aktie|råder dig att)/i;
testa("D1 0 rådsfraser", !radsfraser.test(text));
testa("D2 utbildningsframing", /utbildning i mekanismer|pedagogisk/i.test(text));
testa("D3 PÅHITTADE-markör", /påhittat|pedagogiskt konstruerade/i.test(text));
testa("D4 0 lagrumsformat NNNN:NNN", !/\b(1[0-9]{3}|20[0-9]{2}):\d+\b/.test(text));
testa("D5 0 lagrum (\b på båda sidor — «bolagen» är inte «lagen»)", !/\b(lagen|lagrum|balken)\b/i.test(textUtanSlug));

// ── E språkgrind (mot värdetexten) ──
testa("E1 0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff]/.test(text));
testa("E2 0 kyrilliska", !/[\u0400-\u04ff]/.test(text));
testa("E3 0 typografiska citat", !/[\u201c\u201d\u2018\u2019«»]/.test(text));
testa("E4 0 tabbar", !/\t/.test(text));
testa("E5 0 dubbla mellanslag", !/[^ \n]  +[^ \n]/.test(text));
testa("E6 0 underscore-läcka i värden", !/[a-zåäö]_[a-zåäö]/i.test(text));
testa("E7 0 mjuka bindestreck", !/\u00ad/.test(text));
const ENG = ["the", "and", "with", "from", "that", "this", "not", "are", "is", "of", "in", "on", "by", "it", "as", "at", "or", "to", "be", "was", "for"];
const traffa = ENG.filter((w) => new RegExp("\\b" + w + "\\b", "g").test(textUtanSlug.replace(/\bIFRS\b/g, "").replace(/\bbacklog\b/g, "").replace(/\bAB\b/g, "")));
testa("E8 0 engelska funktionord", traffa.length === 0, traffa.join(", ") || "ren");

// ── F format ──
testa("F1 slug ren ASCII", /^[a-z0-9-]+$/.test(kurs.slug));
testa("F2 level Intermediär", kurs.level === "Intermediär");
testa("F3 xp 50", kurs.xp === 50);
testa("F4 category SEKTORANALYS", kurs.category === "SEKTORANALYS");
testa("F5 weight —", kurs.weight === "—");
testa("F6 slug ledig i registret", !reg[kurs.slug]);

// ── G R2 (\b på båda sidor — «garantier» är inte «tier») ──
testa("G1 0 tjänstepris-yta", !/(kr\/mån|per månad|prenumeration|9 999|13 999|249|449|799)/.test(text));
testa("G2 0 tier-/fasvägg", !/\b(kraverFas|Fas 2|Fas 3|tier)\b/.test(text));
testa("G3 0 publiceringslöfte", !/(publicera på|utgivning|lanserar i bloggen)/.test(text));

console.log(`\nKVD se-22-byggentreprenaden: ${pass.length} PASS, ${fail.length} FEL`);
for (const f of fail) console.log("  " + f);
process.exit(fail.length ? 1 : 0);
