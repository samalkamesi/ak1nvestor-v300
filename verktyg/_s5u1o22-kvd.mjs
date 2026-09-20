#!/usr/bin/env node
/**
 * KVD PREKOLL — s5-u1 (manifest auto-s5-1789888503136, omgång 22): rs-09-personalrisken.
 * Körs FÖRE registerinsert. Kontroller: struktur 18 fält, kapitelkontrakt,
 * aritmetik (oberoende omräkning), juridikgrind, språkgrind, korslänkar,
 * R2-ytor, konstiga tecken. Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const SLUG = "rs-09-personalrisken";
const KURS = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + SLUG + ".json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const pass = [], fail = [], varning = [];
const testa = (villkor, namn, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ── 1. Struktur: 18 fält (rs-seriens ordning: chapters sist, som rs-08) ──────
const FALT = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "learn", "why", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"];
testa(JSON.stringify(Object.keys(KURS)) === JSON.stringify(FALT), "S1 struktur: exakt 18 fält i kontraktsordning", Object.keys(KURS).join(","));

// ── 2. Kapitelkontrakt: 6 kap à 4 min, blocktyper ────────────────────────────
testa(KURS.chapters.length === 6 && KURS.chapters_list.length === 6, "S2 sex kapitel i både chapters och chapters_list");
testa(KURS.chapters.every((k, i) => k.num === i + 1 && k.minutes === 4 && KURS.chapters_list[i].num === k.num && KURS.chapters_list[i].title === k.title), "S3 kapitelnummering + titelparitet + 4 min/kap");
const BLOCKTYPER = KURS.chapters.flatMap((k) => k.blocks.map((b) => b.type));
testa(BLOCKTYPER.every((t) => ["text", "definition", "tabell", "insight", "utmaning"].includes(t)), "S4 blocktyper kanoniska", BLOCKTYPER.join(","));
const sistaKapStart = BLOCKTYPER.length - KURS.chapters[KURS.chapters.length - 1].blocks.length;
const utmaningIx = BLOCKTYPER.indexOf("utmaning");
testa(BLOCKTYPER.filter((t) => t === "utmaning").length === 1 && utmaningIx >= sistaKapStart, `S5 exakt en utmaning, i sista kapitlet (block ${utmaningIx + 1} av ${BLOCKTYPER.length}, kapitelstart ${sistaKapStart + 1})`);
testa(KURS.chapterCount === 6 && KURS.totalMinutes === 24 && KURS.minutes === 24 && KURS.xp === 50, "S6 yttre tal: 6/24/24/50");
testa(KURS.level === "Intermediär" && KURS.category === "RISK" && KURS.weight === "—", "S7 nivå + kategori + vikt", `${KURS.level}/${KURS.category}/${KURS.weight}`);

// ── 3. Aritmetik: oberoende omräkning av kursens alla ekvationer ─────────────
const r1 = (x) => Math.round(x * 10) / 10;
const arit = [
  ["kartsumma 5+4+3=12", 5 + 4 + 3 === 12],
  ["kärnkvot Vreta 5/12→41,7 %", r1((5 / 12) * 100) === 41.7],
  ["kärnkvot Lystra 1/14→7,1 %", r1((1 / 14) * 100) === 7.1],
  ["semesterprov 5−2=3 oskyddade", 5 - 2 === 3],
  ["buret ansvar 60/200=30 %", (60 / 200) * 100 === 30],
  ["återhämtning 4+8=12 mån", 4 + 8 === 12],
  ["tapp 60×0,20=12 Mkr", 60 * 0.2 === 12],
  ["resultatpåverkan 12×0,35=4,2", 12 * 0.35 === 4.199999999999999 || Math.abs(12 * 0.35 - 4.2) < 1e-9],
  ["direkta 1,8+0,7=2,5", 1.8 + 0.7 === 2.5],
  ["trappan 4,2+2,5=6,7", Math.abs(4.2 + 2.5 - 6.7) < 1e-9],
  ["mot resultat 6,7/22,3→30,0 %", r1((6.7 / 22.3) * 100) === 30],
  ["avgångar 200×0,12=24", 200 * 0.12 === 24],
  ["årsräkning 24×0,45=10,8", 24 * 0.45 === 10.8],
  ["intäktsandel 10,8/200=5,4 %", (10.8 / 200) * 100 === 5.399999999999999 || Math.abs(10.8 / 200 * 100 - 5.4) < 1e-9],
  ["branschsnitt 200×0,08=16", 200 * 0.08 === 16],
  ["snittkostnad 16×0,45=7,2", 16 * 0.45 === 7.2],
  ["retention 10,8−7,2=3,6", Math.abs(10.8 - 7.2 - 3.6) < 1e-9],
  ["överlapp 3×0,5=1,5 mån", 3 * 0.5 === 1.5],
  ["åtgärdskostnad 1,5×0,07=0,105", Math.abs(1.5 * 0.07 - 0.105) < 1e-12],
  ["väntevärde 0,30×2,2=0,66", 0.3 * 2.2 === 0.66],
  ["kvot 0,66/0,105→6,3", r1(0.66 / 0.105) === 6.3],
];
for (const [namn, ok] of arit) testa(ok, "A " + namn);

// ── 4. Signaturtal i text (parsad): nyckeltalen ska finnas i texten ──────────
const allText = JSON.stringify(KURS);
for (const tal of ["41,7 procent", "7,1 procent", "30 procent av omsättningen", "12 månader till full produktion", "4,2", "2,5 miljoner", "6,7 miljoner", "30,0 procent", "24 gånger 0,45", "10,8", "5,4 procent", "7,2", "3,6 miljoner", "1,5 månaders", "0,105", "0,66", "6,3", "N=1", "kärnkvoten", "semesterprovet"])
  testa(allText.includes(tal), "T text bär talet »" + tal + "«");

// ── 5. Juridikgrind ──────────────────────────────────────────────────────────
const radsfraser = ["köp denna aktie", "sälj denna aktie", "du bör köpa", "du bör sälja", "vi rekommenderar att köpa", "rekommenderar köp", "tipsa om aktien", "skynda att köpa", "nu är det läge"];
for (const f of radsfraser) testa(!allText.toLowerCase().includes(f), "J1 ingen rådsfras »" + f + "«");
testa(allText.includes("inte uppmaningar att köpa eller sälja"), "J2 utbildningsframing + skyddsrad");
testa(allText.includes("PÅHITTADE TAL"), "J3 påhittade tal deklarerade");
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
for (const l of lagrum) testa(!allText.includes(l), "J4 inget lagrum »" + l + "« i kurs");
testa(!/\b(köp|sälj|handla)\s+(aktien|aktierna|befintliga)\b/i.test(allText), "J5 inga orderfraser");

// ── 6. Språkgrind ─────────────────────────────────────────────────────────────
const raw = readFileSync(ROT + "/data/kurser-tillagg/" + SLUG + ".json", "utf8");
const cjk = raw.match(/[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g) || [];
testa(cjk.length === 0, "L1 inga CJK-tecken", cjk.join(""));
testa(!raw.includes("\u00AD"), "L1b inga mjuka bindestreck (U+00AD)", (raw.match(/\u00AD/g) || []).length + " st");
const typoCitat = raw.match(/[\u201C\u201D\u2018\u2019]/g) || [];
testa(typoCitat.length === 0, "L2 inga typografiska citat", typoCitat.join(""));
testa(!raw.includes("\t"), "L3 inga tabbar");
testa(!/  +/.test(raw.replace(/\n */g, "")), "L4 inga dubbla mellanslag i värden");
// engläckor (rak grep i textvärden)
const englackor = ["key person risk", "human resources", "talent management", "obviously", "basically", "in conclusion", "we can see that", "as we have learned", "let us", "keep in mind", "it is important to note", "bus factor", "knowledge spillover", "succession planning"];
const textLower = allText.toLowerCase();
for (const e of englackor) testa(!textLower.includes(e), "L5 ingen engläcka »" + e + "«");
// konstiga sammansättningar/läckor från arbetsprocessen (egna tidigare stavfel + redskapsläckor)
const spurlar = ["huvads", "persons flytt", "räkta", "kärnkvote ", "nyckelpersob", "successionsteset", "semsterprov", "System", "prsedit"];
for (const s of spurlar) testa(!raw.includes(s), "L6 ingen spurläcka »" + s + "«");
// svartlista från s5-seriens tidigare fynd (extra vakt)
const svartlista = ["Tjuguonde", "bankernes", "premielen", "kontruktets", "DRAVS", "STIGR", "förfalloidag", "depositionsplåt", "börsständiga", "konungakröning", "ekonomytens", "måtta vind", "abstrakta"];
for (const s of svartlista) testa(!raw.includes(s), "L7 svartlisteträff »" + s + "«");

// ── 7. Korslänkar registeräkta ───────────────────────────────────────────────
const korslankMönster = [...allText.matchAll(/\b(rs-0[1-8]|km-026|mt-03)\b/g)].map((m) => m[1]);
testa(korslankMönster.length >= 16, "K1 minst 16 korslänkar", `${korslankMönster.length} st: ${[...new Set(korslankMönster)].join(", ")}`);
for (const ref of [...new Set(korslankMönster)]) {
  const finns = Object.keys(reg).some((s) => s.startsWith(ref));
  testa(finns, "K2 serien »" + ref + "« finns i registret");
}
const grannLista = ["rs-02-kundkoncentration", "rs-05-riskavsnittet-mellan-raderna", "rs-06-riskens-anatomi", "rs-07-leverantorsrisken", "rs-08-modellrisken", "km-026-relaterade-parter", "mt-03-vallgraven-i-siffror"];
for (const g of grannLista) testa(!!reg[g], "K3 granncursen finns: " + g);

// ── 8. R2 + syskon ───────────────────────────────────────────────────────────
testa(!/(9\s?999|13\s?999|249|449|799)\s*(kr|kronor)/i.test(allText) && !/kr\/(mån|månad)/i.test(allText) && !/(fas\s*[23]-pris|prissättning av (kurs|fas))/i.test(allText), "R2 ingen tjänstepris-/tier-yta");
testa(!reg[SLUG], "R3 kursen ännu inte i registret (prekoll före insert)");
testa(KURS.slug === SLUG && /^[a-z0-9-]+$/.test(KURS.slug), "R4 slug ren ASCII");

// ── 9. Längder (rs-seriens standard: över rs-08 på varje yta) ────────────────
console.log(`─ längder: summary ${KURS.summary.length} · learn ${KURS.learn.length} · why ${KURS.why.length} · lynch ${KURS.lynchSection.length} · graham ${KURS.grahamSection.length} · ak1 ${KURS.ak1Section.length} (rs-08: 343/709/1159/638/716/874)`);
testa(KURS.why.length > 700 && KURS.learn.length > 700 && KURS.summary.length > 300, "S8 yttor i seriens standard (summary/learn/why)");

console.log(pass.join("\n"));
if (varning.length) console.log("\n" + varning.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD PREKOLL RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD PREKOLL GRÖN: ${pass.length} PASS 0 FAIL — rs-09 klar för insert.`);
