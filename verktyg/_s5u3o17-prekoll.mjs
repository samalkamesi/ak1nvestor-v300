#!/usr/bin/env node
/**
 * PREKOLL — s5-u3 manifest auto-s5-1789766125084 (omgång 17):
 * ma-06-aktiernas-riskpremie + ek-06-bayesianska-omviktningen + od-07-terminskontraktet.
 * Alla grindar FÖRE registerinsert: struktur, språk, korsreferenser, juridik, aritmetik.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const REG = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const MINA = ["ma-06-aktiernas-riskpremie", "ek-06-bayesianska-omviktningen", "od-07-terminskontraktet"];
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

for (const slug of MINA) {
  const k = JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/${slug}.json`, "utf8"));
  const blob = JSON.stringify(k);
  const fam = slug.slice(0, 2);

  // ── 1. Struktur ──
  testa(`${slug} slug-fil-paritet`, k.slug === slug);
  testa(`${slug} 6 kapitel à 4 min`, k.chapters.length === 6 && k.chapters.every((c) => c.minutes === 4), `${k.chapters.length} kap`);
  testa(`${slug} chapterCount/totalMinutes/minutes = 6/24/24`, k.chapterCount === 6 && k.totalMinutes === 24 && k.minutes === 24);
  testa(`${slug} xp 50`, k.xp === 50);
  testa(`${slug} chapters_list ≡ chapters (num/titel/minuter)`, k.chapters_list.length === 6 && k.chapters.every((c, i) => c.num === k.chapters_list[i].num && c.title === k.chapters_list[i].title && c.minutes === k.chapters_list[i].minutes));
  testa(`${slug} blocktyper giltiga`, k.chapters.every((c) => c.blocks.length >= 2 && c.blocks.every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b.type))));
  testa(`${slug} why + learn + history + tre mästarsektioner`, typeof k.why === "string" && k.why.length > 400 && typeof k.learn === "string" && k.learn.length > 400 && k.history && k.history.origin && k.history.evolution && k.history.modern && k.lynchSection && k.grahamSection && k.ak1Section);
  testa(`${slug} nivå i familjens spektrum`, ["Nybörjare", "Intermediär", "Avancerad"].includes(k.level));
  testa(`${slug} kategori oförändrad i serien`, (() => { const syster = Object.keys(REG).find((s) => s.startsWith(fam + "-")); return syster ? REG[syster].category === k.category : false; })(), k.category);

  // ── 2. Språkgrind ──
  const cjk = (blob.match(/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff]/g) || []).length;
  const finska = (blob.match(/\b(myös|että|tämä|ovah|koska|hän on)\b/g) || []).length;
  const dbel = (blob.match(/ (?= )/g) || []).length; // dubbla mellanslag inuti strängar (JSON-escapes har inga)
  const tabb = (blob.match(/\t/g) || []).length;
  const mjuk = (blob.match(/\u00ad/g) || []).length;
  const citat = (blob.match(/[\u201C\u201D\u2018\u2019]/g) || []).length;
  const svartlista = ["premielen", "kontruktets", "bankernes", "abstract", "myös", "förfalloidag", "Tjuguonde", "kläd", "vårridar", "lugnepoker", "småturer", "utesende", "husmorseplast", "konungakr", "AMLANDE", "MARGINELLA", "depositionsplåt", "börsständiga", "DRAVS", "skillnetet", "ekonomytens", "måtta vind"];
  const svart = svartlista.filter((w) => blob.includes(w));
  testa(`${slug} språkgrind: 0 CJK/0 finska/0 dubbla/0 tabb/0 mjuka/0 typcitat`, cjk === 0 && finska === 0 && dbel === 0 && tabb === 0 && mjuk === 0 && citat === 0, `cjk=${cjk} fi=${finska} dbl=${dbel} tab=${tabb} mjuk=${mjuk} cit=${citat}`);
  testa(`${slug} svartlista ren`, svart.length === 0, svart.join(","));

  // ── 3. Korsreferenser registeräkta (prefix-match mot slugar) ──
  const refMatch = [...blob.matchAll(/([a-z]{2})-(\d{2,3})/g)].map((m) => m[1] + "-" + m[2]);
  const egnaPrefix = fam + "-";
  const brutna = [];
  for (const r of new Set(refMatch)) {
    if (r.startsWith(egnaPrefix)) continue; // egen serie — finns i registret efter insert
    const finns = Object.keys(REG).some((s) => s === r || s.startsWith(r + "-") || s.startsWith(r));
    if (!finns) brutna.push(r);
  }
  testa(`${slug} korsreferenser registeräkta (0 brutna)`, brutna.length === 0, [...new Set(brutna)].join(","));

  // ── 4. Juridikgrind ──
  const rad = ["köp aktien", "sälj aktien", "du bör köpa", "vi rekommenderar att köpa", "placera dina pengar i", "satsa på", "ta positionen", "investera i denna"];
  const radTraff = rad.filter((r) => blob.toLowerCase().includes(r));
  const utbildning = /utbildning/i.test(k.summary) || /utbildning/i.test(blob.slice(-3000));
  testa(`${slug} juridikgrind: 0 rådsfraser`, radTraff.length === 0, radTraff.join(","));
  testa(`${slug} utbildningsframing närvarande`, utbildning);

  // ── 5. Aritmetik (signaturtal oberoende omräknade + närvaro i text) ──
  const arit = [];
  if (slug.startsWith("ma-06")) {
    const nr = [
      ["8,0 − 2,0 = 6,0", Math.abs(8.0 - 2.0 - 6.0) < 1e-9],
      ["6/40 = 15 %", Math.abs(6 / 40 - 0.15) < 1e-9],
      ["1/40 = 2,5 %", Math.abs(1 / 40 - 0.025) < 1e-9],
      ["6,0/17 ≈ 0,35", Math.abs(6.0 / 17 - 0.3529) < 0.001],
      ["1,08³⁰ = 10,1", Math.abs(Math.pow(1.08, 30) - 10.06) < 0.01],
      ["1,02³⁰ = 1,81", Math.abs(Math.pow(1.02, 30) - 1.811) < 0.001],
      ["10,1/1,81 = 5,6", Math.abs(10.1 / 1.81 - 5.58) < 0.01],
      ["2,0 + 6,0 = 8,0", 2.0 + 6.0 === 8.0],
      ["8/0,08 = 100", 8 / 0.08 === 100],
      ["8/0,09 ≈ 88,9", Math.round((8 / 0.09) * 10) / 10 === 88.9],
      ["8/0,07 ≈ 114,3", Math.round((8 / 0.07) * 10) / 10 === 114.3],
      ["100 − 88,9 = 11,1", Math.abs(100 - 88.9 - 11.1) < 1e-9],
      ["1/0,08 = 12,5", 1 / 0.08 === 12.5],
      ["1/0,09 ≈ 11,1", Math.round((1 / 0.09) * 10) / 10 === 11.1],
      ["1/0,07 ≈ 14,3", Math.round((1 / 0.07) * 10) / 10 === 14.3],
      ["9,0 − 3,0 = 6,0", 9.0 - 3.0 === 6.0],
    ];
    const narvaro = ["8,0 minus 2,0", "6,0 procentenheter", "1,08", "1,81", "88,9", "114,3", "12,5", "10,1"];
    arit.push(...nr.map(([n, ok]) => [n, ok]));
    arit.push(["talnärvaro", narvaro.every((t) => blob.includes(t))]);
  }
  if (slug.startsWith("ek-06")) {
    const nr = [
      ["0,40×0,90 = 0,36", Math.abs(0.4 * 0.9 - 0.36) < 1e-9],
      ["0,60×0,10 = 0,06", Math.abs(0.6 * 0.1 - 0.06) < 1e-9],
      ["0,36/0,42 = 0,86", Math.abs(0.36 / 0.42 - 0.857) < 0.001],
      ["0,80×0,55 = 0,44", Math.abs(0.8 * 0.55 - 0.44) < 1e-9],
      ["0,20×0,45 = 0,09", Math.abs(0.2 * 0.45 - 0.09) < 1e-9],
      ["0,44/0,53 = 0,83", Math.abs(0.44 / 0.53 - 0.830) < 0.001],
      ["30×1,2 = 36", 30 * 1.2 === 36],
      ["25×0,75 = 18,75", 25 * 0.75 === 18.75],
      ["20×1,2 = 24", 20 * 1.2 === 24],
      ["15×0,75 = 11,25", 15 * 0.75 === 11.25],
      ["10×1,2 = 12", 10 * 1.2 === 12],
      ["summa 102", 36 + 18.75 + 24 + 11.25 + 12 === 102],
      ["36/102 = 35,3", Math.abs(36 / 102 - 0.353) < 0.001],
      ["18,75/102 = 18,4", Math.abs(18.75 / 102 - 0.184) < 0.001],
      ["24/102 = 23,5", Math.abs(24 / 102 - 0.235) < 0.001],
      ["11,25/102 = 11,0", Math.abs(11.25 / 102 - 0.110) < 0.001],
      ["12/102 = 11,8", Math.abs(12 / 102 - 0.118) < 0.001],
      ["35,3+18,4+23,5+11,0+11,8 = 100,0", Math.abs(35.3 + 18.4 + 23.5 + 11.0 + 11.8 - 100.0) < 0.01],
      ["0,75×1,2 ≈ 0,90", Math.abs(0.75 * 1.2 - 0.9) < 1e-9],
      ["0,75×1,44 = 1,08", Math.abs(0.75 * 1.44 - 1.08) < 1e-9],
      ["1,2³ = 1,73", Math.abs(Math.pow(1.2, 3) - 1.728) < 0.001],
      ["0,75⁴ = 0,32", Math.abs(Math.pow(0.75, 4) - 0.316) < 0.001],
      ["1,2⁸ = 4,30", Math.abs(Math.pow(1.2, 8) - 4.30) < 0.01],
      ["1,2⁷ = 3,58", Math.abs(Math.pow(1.2, 7) - 3.583) < 0.001],
      ["0,75⁵ = 0,24", Math.abs(Math.pow(0.75, 5) - 0.237) < 0.001],
      ["1,2⁶ = 2,99", Math.abs(Math.pow(1.2, 6) - 2.986) < 0.001],
      ["0,75⁶ = 0,18", Math.abs(Math.pow(0.75, 6) - 0.178) < 0.001],
      ["1,2⁵ = 2,49", Math.abs(Math.pow(1.2, 5) - 2.488) < 0.001],
      ["0,75⁷ = 0,13", Math.abs(Math.pow(0.75, 7) - 0.133) < 0.001],
      ["1,2⁴ = 2,07", Math.abs(Math.pow(1.2, 4) - 2.074) < 0.001],
      ["0,75⁸ = 0,10", Math.abs(Math.pow(0.75, 8) - 0.100) < 0.001],
      ["4,30×0,32 = 1,36", Math.abs(4.2998 * 0.3164 - 1.36) < 0.01],
      ["3,58×0,24 = 0,85", Math.abs(3.5832 * 0.2373 - 0.85) < 0.01],
      ["2,99×0,18 = 0,53", Math.abs(2.986 * 0.178 - 0.531) < 0.01],
      ["2,49×0,13 = 0,33", Math.abs(2.4883 * 0.1335 - 0.332) < 0.01],
      ["2,07×0,10 = 0,21", Math.abs(2.0736 * 0.1001 - 0.2076) < 0.01],
      ["30×1,36 ≈ 40,8", Math.abs(30 * 1.3605 - 40.8) < 0.02],
      ["15×0,21 = 3,2", Math.abs(15 * 0.2076 - 3.11) < 0.1],
      ["40+5+30,6+14,9+9,5 = 100,0", Math.abs(40 + 5 + 30.6 + 14.9 + 9.5 - 100.0) < 1e-9],
      ["8/12 = 67 %", Math.abs(8 / 12 - 0.667) < 0.001],
      ["5/12 = 42 %", Math.abs(5 / 12 - 0.417) < 0.001],
      ["7/12 = 58 %", Math.abs(7 / 12 - 0.583) < 0.001],
      ["4/12 = 33 %", Math.abs(4 / 12 - 0.333) < 0.001],
      ["6/12 = 50 %", 6 / 12 === 0.5],
    ];
    const narvaro = ["0,36", "0,42", "0,86", "0,44", "0,53", "0,83", "18,75", "102", "35,3", "11,25", "11,8", "1,36", "0,85", "4,30", "3,58", "40,8", "100,0"];
    arit.push(...nr.map(([n, ok]) => [n, ok]));
    arit.push(["talnärvaro", narvaro.every((t) => blob.includes(t))]);
  }
  if (slug.startsWith("od-07")) {
    const nr = [
      ["100×1,015 ≈ 101,5", Math.abs(100 * 1.015 - 101.5) < 1e-9],
      ["101,5 − 1,0 = 100,5", Math.abs(101.5 - 1.0 - 100.5) < 1e-9],
      ["100,5 − 100 = 0,5", Math.abs(100.5 - 100 - 0.5) < 1e-9],
      ["101,5 − 2,0 = 99,5", 101.5 - 2.0 === 99.5],
      ["100×0,015 = 1,5", 100 * 0.015 === 1.5],
      ["100×1,020 − 1,0 = 101,0", Math.abs(100 * 1.020 - 1.0 - 101.0) < 1e-9],
      ["102,0 − 100,5 = 1,5", Math.abs(102.0 - 100.5 - 1.5) < 1e-9],
      ["100,5 − 99,0 = 1,5", Math.abs(100.5 - 99.0 - 1.5) < 1e-9],
      ["2 000×100 = 200 000", 2000 * 100 === 200000],
      ["200 000×0,08 = 16 000", 200000 * 0.08 === 16000],
      ["200 000×0,02 = 4 000", 200000 * 0.02 === 4000],
      ["4 000/16 000 = 25 %", 4000 / 16000 === 0.25],
      ["200 000/16 000 = 12,5", 200000 / 16000 === 12.5],
      ["100 000 000/200 000 = 500", 100000000 / 200000 === 500],
      ["200×100 = 20 000", 200 * 100 === 20000],
      ["20 000×500 = 10,0 M", 20000 * 500 === 10000000],
      ["100 M×0,10 = 10,0 M", 100000000 * 0.1 === 10000000],
      ["−10,0 + 10,0 = 0", -10000000 + 10000000 === 0],
      ["2 000×0,98 = 1 960", 2000 * 0.98 === 1960],
    ];
    const narvaro = ["101,5", "100,5", "99,5", "200 000", "16 000", "4 000", "25 procent", "12,5", "500", "10,0 miljoner", "1 800", "200 000"];
    arit.push(...nr.map(([n, ok]) => [n, ok]));
    arit.push(["talnärvaro", narvaro.every((t) => blob.includes(t))]);
  }
  const felArit = arit.filter(([, ok]) => !ok);
  testa(`${slug} aritmetik ${arit.length} kontroller oberoende omräknade`, felArit.length === 0, felArit.map(([n]) => n).join(","));
}

// ── 6. Temaunikhet: mina tre slugar får inte finnas i registret (FÖRE insert —
//     EFTER insert är identiska poster den förväntade rundgången, då PASS som "post-insert") ──
const dup = MINA.filter((s) => REG[s]);
const dupAvvikande = dup.filter((s) => JSON.stringify(REG[s]) !== JSON.stringify(JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/${s}.json`, "utf8"))));
if (dup.length === 0) testa("0 duplikat i registret (pre-insert-läge)", true);
else if (dupAvvikande.length === 0) testa(`post-insert rundgång: ${dup.length} poster bitidentiska med kursfilerna (prekoll omkört efter synk)`, true);
else testa("duplikat med AVVIKANDE innehåll", false, dupAvvikande.join(","));

console.log(pass.join("\n"));
if (fail.length) {
  console.error("\n" + fail.join("\n"));
  console.error(`\nPREKOLL RÖD: ${pass.length} PASS, ${fail.length} FAIL`);
  process.exit(1);
}
console.log(`\nPREKOLL GRÖN: ${pass.length} PASS 0 FAIL — tre kurser klara för registerinsert.`);
