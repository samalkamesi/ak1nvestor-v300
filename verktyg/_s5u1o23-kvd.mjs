#!/usr/bin/env node
/**
 * KVD PREKOLL — s5-u1 (manifest auto-s5-1789910709805, omgång 23): am-09-marginalhandeln.
 * Körs FÖRE registerinsert. Kontroller: struktur 18 fält, kapitelkontrakt,
 * aritmetik (oberoende omräkning), juridikgrind, språkgrind, korslänkar,
 * R2-ytor, konstiga tecken. Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const SLUG = "am-09-marginalhandeln";
const KURS = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + SLUG + ".json", "utf8"));
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const pass = [], fail = [], varning = [];
const testa = (villkor, namn, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ── 1. Struktur: 18 fält i kontraktsordning (am-serien: chapters sist, som am-08) ──
const FALT = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "learn", "why", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"];
testa(JSON.stringify(Object.keys(KURS)) === JSON.stringify(FALT), "S1 struktur: exakt 18 fält i kontraktsordning", Object.keys(KURS).join(","));

// ── 2. Kapitelkontrakt: 6 kap à 4 min, blocktyper ────────────────────────────
testa(KURS.chapters.length === 6 && KURS.chapters_list.length === 6, "S2 sex kapitel i både chapters och chapters_list");
testa(KURS.chapters.every((k, i) => k.num === i + 1 && k.minutes === 4 && KURS.chapters_list[i].num === k.num && KURS.chapters_list[i].title === k.title && typeof k.intro === "string" && k.intro.length > 50), "S3 kapitelnummering + titelparitet + 4 min/kap + intro");
const BLOCKTYPER = KURS.chapters.flatMap((k) => k.blocks.map((b) => b.type));
testa(BLOCKTYPER.every((t) => ["text", "definition", "tabell", "insight", "utmaning"].includes(t)), "S4 blocktyper kanoniska", BLOCKTYPER.join(","));
testa(KURS.chapters.every((k) => k.blocks.every((b) => Object.keys(b).length === 2 && b.type && typeof b.content === "string" && b.content.length > 80)), "S4b block exakt {type, content} med substans");
const sistaKapStart = BLOCKTYPER.length - KURS.chapters[KURS.chapters.length - 1].blocks.length;
const utmaningIx = BLOCKTYPER.indexOf("utmaning");
testa(BLOCKTYPER.filter((t) => t === "utmaning").length === 1 && utmaningIx >= sistaKapStart, `S5 exakt en utmaning, i sista kapitlet (block ${utmaningIx + 1} av ${BLOCKTYPER.length}, kapitelstart ${sistaKapStart + 1})`);
testa(KURS.chapterCount === 6 && KURS.totalMinutes === 24 && KURS.minutes === 24 && KURS.xp === 50, "S6 yttre tal: 6/24/24/50");
testa(KURS.level === "Intermediär" && KURS.category === "AKTIEMARKNADEN I PRAKTIKEN" && KURS.weight === "—", "S7 nivå + kategori + vikt", `${KURS.level}/${KURS.category}/${KURS.weight}`);
testa(KURS.history && ["origin", "evolution", "modern"].every((k) => typeof KURS.history[k] === "string" && KURS.history[k].length > 200), "S7b history med origin/evolution/modern");

// ── 3. Aritmetik: oberoende omräkning av kursens alla ekvationer ─────────────
const r1 = (x) => Math.round(x * 10) / 10;
const arit = [
  ["portföljsumma 150+100+50=300", 150 + 100 + 50 === 300],
  ["Vreta 150×0,70=105,0", 150 * 0.7 === 105],
  ["Lystra 100×0,50=50,0", 100 * 0.5 === 50],
  ["Granhult 50×0,25=12,5", 50 * 0.25 === 12.5],
  ["belåningsbart 105+50+12,5=167,5", Math.abs(105 + 50 + 12.5 - 167.5) < 1e-9],
  ["värdeandel 167,5/300→55,8 %", r1((167.5 / 300) * 100) === 55.8],
  ["exponering 200+100=300", 200 + 100 === 300],
  ["belåningsgrad 100/300→33,3 %", r1((100 / 300) * 100) === 33.3],
  ["värdeandel start 200/300→66,7 %", r1((200 / 300) * 100) === 66.7],
  ["summan av grad+andel = 100 %", r1((100 / 300) * 100 + r1((200 / 300) * 100)) === 100],
  ["−20 %: 300×0,8=240 · 240−100=140 · 140/240→58,3 %", r1((240 - 100) / 240 * 100) === 58.3],
  ["−40 %: 300×0,6=180 · 180−100=80 · 80/180→44,4 %", r1((180 - 100) / 180 * 100) === 44.4],
  ["−50 %: 300×0,5=150 · 150−100=50 · 50/150→33,3 %", r1((150 - 100) / 150 * 100) === 33.3],
  ["−55 %: 300×0,45=135 · 135−100=35 · 35/135→25,9 %", r1((135 - 100) / 135 * 100) === 25.9],
  ["hävstång 300/200=1,5", 300 / 200 === 1.5],
  ["eget fall 1,5×55=82,5 % · 200×0,175=35", 1.5 * 55 === 82.5 && 200 * 0.175 === 35.00000000000001 || Math.abs(200 * 0.175 - 35) < 1e-9],
  ["kravåtgärd 35/0,30=116,7 · 135−116,7=18,3 (tusen)", Math.abs(35 / 0.3 - 116.6666667) < 1e-4 && Math.abs(135 - 35 / 0.3 - 18.3333) < 1e-3],
  ["efter åtgärd 35/116,7→30,0 %", r1((35 / (135 - 18.3333)) * 100) === 30],
  ["ränta 100 000×0,0595=5 950", 100000 * 0.0595 === 5950.000000000001 || Math.abs(100000 * 0.0595 - 5950) < 1e-6],
  ["månad 5 950/12=495,8≈496", Math.abs(5950 / 12 - 495.833) < 1e-2],
  ["plusår 300 000×0,08=24 000 · 24 000−5 950=18 050", 300000 * 0.08 === 24000 && 24000 - 5950 === 18050],
  ["plusår netto 18 050/200 000→9,0 %", r1((18050 / 200000) * 100) === 9],
  ["minusår −24 000−5 950=−29 950", -24000 - 5950 === -29950],
  ["minusår netto −29 950/200 000→−15,0 %", r1((-29950 / 200000) * 100) === -15],
  ["asymmetri +1,0 mot −7,0 pp", 9 - 8 === 1 && Math.abs(-15 - -8 - -7) < 1e-9],
  ["formel 1,5×8−0,5×5,95=9,025", Math.abs(1.5 * 8 - 0.5 * 5.95 - 9.025) < 1e-9],
  ["formel spegel 1,5×(−8)−0,5×5,95=−14,975", Math.abs(1.5 * -8 - 0.5 * 5.95 + 14.975) < 1e-9],
  ["brytpunkt: netto=a ⟺ a=r (1,5a−0,5r=a)", Math.abs(1.5 * 5.95 - 0.5 * 5.95 - 5.95) < 1e-9],
  ["låneandel 100/200=0,5", 100 / 200 === 0.5],
  ["takfälla: exponering 200+167,5=367,5 · andel 200/367,5→54,4 %", r1((200 / 367.5) * 100) === 54.4],
  ["takfälla −30 %: 367,5×0,7=257,25 · eget 89,75 · andel→34,9 %", Math.abs(367.5 * 0.7 - 257.25) < 1e-9 && Math.abs(257.25 - 167.5 - 89.75) < 1e-9 && r1((89.75 / 257.25) * 100) === 34.9],
  ["takfälla −40 %: 367,5×0,6=220,5 · eget 53,0 · andel→24,0 % (under 30)", Math.abs(367.5 * 0.6 - 220.5) < 1e-9 && Math.abs(220.5 - 167.5 - 53) < 1e-9 && r1((53 / 220.5) * 100) === 24],
];
for (const [namn, ok] of arit) testa(ok, "A " + namn);

// ── 4. Signaturtal i text: nyckeltalen ska finnas i texten ───────────────────
const allText = JSON.stringify(KURS);
for (const tal of ["33,3 procent", "66,7 procent", "167 500", "55,8 procent", "58,3 procent", "44,4 procent", "25,9 procent", "18 300", "1,5", "82,5 procent", "5,95 procent", "5 950", "496", "9,0 procent", "15,0 procent", "9,025", "34,9 procent", "24,0", "54,4 procent", "116 700", "300 000", "200 000", "100 000"])
  testa(allText.includes(tal), "T text bär talet »" + tal + "«");

// ── 5. Juridikgrind ──────────────────────────────────────────────────────────
const radsfraser = ["köp denna aktie", "sälj denna aktie", "du bör köpa", "du bör sälja", "vi rekommenderar att köpa", "rekommenderar köp", "tipsa om aktien", "skynda att köpa", "nu är det läge", "du bör belåna", "låna så mycket"];
for (const f of radsfraser) testa(!allText.toLowerCase().includes(f), "J1 ingen rådsfras »" + f + "«");
testa(allText.includes("inte uppmaningar att köpa eller sälja"), "J2 utbildningsframing + skyddsrad");
testa(allText.includes("PÅHITTADE TAL"), "J3 påhittade tal deklarerade (versalt)");
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "2022:482"];
for (const l of lagrum) testa(!allText.includes(l), "J4 inget lagrum »" + l + "« i kurs");
// Kuraterad läxa (omgång 22:s arv): nakna årtal i historikberättelsen (Securities
// Exchange Act 1934) är EJ lagrum — vakt gäller lagrumsFORMATET NNNN:NNN.
testa(!/\b(19|20)\d{2}:\d{3}\b/.test(allText), "J4b inget lagrumsformat NNNN:NNN i kurs");
testa(!/\b(köp|sälj|handla)\s+(aktien|aktierna|befintliga)\b/i.test(allText), "J5 inga orderfraser");

// ── 6. Språkgrind ─────────────────────────────────────────────────────────────
const raw = readFileSync(ROT + "/data/kurser-tillagg/" + SLUG + ".json", "utf8");
const cjk = raw.match(/[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g) || [];
testa(cjk.length === 0, "L1 inga CJK-tecken", cjk.join(""));
testa((raw.match(/[\u0400-\u04FF]/g) || []).length === 0, "L1b inga kyrilliska tecken");
testa(!raw.includes("\u00AD"), "L1c inga mjuka bindestreck (U+00AD)");
const typoCitat = raw.match(/[\u201C\u201D\u2018\u2019]/g) || [];
testa(typoCitat.length === 0, "L2 inga typografiska citat", typoCitat.join(""));
testa(!raw.includes("\t"), "L3 inga tabbar");
testa(!/ {2}/.test(raw.replace(/\n */g, "")), "L4 inga dubbla mellanslag i värden");
const englackor = ["margin call", "margin trading", "leveraged portfolio", "maintenance margin", "obviously", "basically", "in conclusion", "we can see that", "as we have learned", "let us", "keep in mind", "it is important to note", "forced liquidation"];
const textLower = allText.toLowerCase();
for (const e of englackor) testa(!textLower.includes(e), "L5 ingen engläcka »" + e + "«");
// Kuraterad läxa (omgång 22:s arv): "hävstångs" är kursens egen legitima
// sammansättningsstavelse (hävstångsvinsten, hävstångsförlusten) — kontrollen
// straffar inte rättstavade ord; därför borta ur listan.
const spurlar = ["läsåren", "läsåres", "indexetsvändningen", "varde-karta", "readjust", "belånings konto", "psystematisk", "naturligaotta", "_differentierat", "margin call", "value-"];
for (const s of spurlar) testa(!raw.includes(s), "L6 ingen spurläcka »" + s + "«");
const svartlista = ["Tjuguonde", "bankernes", "premielen", "kontruktets", "DRAVS", "STIGR", "förfalloidag", "depositionsplåt", "börsständiga", "konungakröning", "ekonomytens", "måtta vind", "abstrakta"];
for (const s of svartlista) testa(!raw.includes(s), "L7 svartlisteträff »" + s + "«");

// ── 7. Korslänkar registeräkta ───────────────────────────────────────────────
const korslankMönster = [...allText.matchAll(/\b(am-0[1-8]|km-030|km-04|bf-15|v1[01]|st-06|pf-01|rs-04|ud-09|bk-02|vr-03)\b/g)].map((m) => m[1]);
testa(korslankMönster.length >= 16, "K1 minst 16 korslänkar", `${korslankMönster.length} st: ${[...new Set(korslankMönster)].join(", ")}`);
for (const ref of [...new Set(korslankMönster)]) {
  const finns = Object.keys(reg).some((s) => s.startsWith(ref));
  testa(finns, "K2 serien »" + ref + "« finns i registret");
}
const grannLista = ["am-01-likviditet-och-spread", "am-06-kortlage-och-aktieutlaning", "am-08-etfens-inre-mekanik", "km-030-margin-of-safety", "bf-15-bubblans-anatomi", "v10-skuldsattningsgrad", "v11-likviditet", "st-06-likviditetsreserven", "pf-01-portfoljbyggande"];
for (const g of grannLista) testa(!!reg[g], "K3 granncursen finns: " + g);

// ── 8. R2 + syskon ───────────────────────────────────────────────────────────
testa(!/(9\s?999|13\s?999|249|449|799)\s*(kr|kronor)/i.test(allText) && !/kr\/(mån|månad)/i.test(allText) && !/(fas\s*[23]-pris|prissättning av (kurs|fas))/i.test(allText), "R2 ingen tjänstepris-/tier-yta");
testa(!reg[SLUG], "R3 kursen ännu inte i registret (prekoll före insert)");
testa(KURS.slug === SLUG && /^[a-z0-9-]+$/.test(KURS.slug), "R4 slug ren ASCII");

// ── 9. Längder (seriens standard: över am-08:s yttor där tillämpligt) ────────
console.log(`─ längder: summary ${KURS.summary.length} · learn ${KURS.learn.length} · why ${KURS.why.length} · lynch ${KURS.lynchSection.length} · graham ${KURS.grahamSection.length} · ak1 ${KURS.ak1Section.length} (am-08: 1904/1146/1246)`);
testa(KURS.why.length > 700 && KURS.learn.length > 700 && KURS.summary.length > 300, "S8 yttor i seriens standard (summary/learn/why)");

console.log(pass.join("\n"));
if (varning.length) console.log("\n" + varning.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD PREKOLL RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD PREKOLL GRÖN: ${pass.length} PASS 0 FAIL — am-09 klar för insert.`);
