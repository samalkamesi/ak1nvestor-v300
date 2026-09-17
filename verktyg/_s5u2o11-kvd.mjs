#!/usr/bin/env node
/**
 * KVD — s5-u2 omgång 11 (2026-09-17): pe-03 förvärvsmaskinen + mt-04 vallgravens födelse.
 * Maskinella kontroller mot kursfilerna + registret (efter insert):
 * strukturparitet, nivå/kategori, ASCII-slug, aritmetik (oberoende omräkning),
 * korslänkar prefixmatch registret, juridikgrind (rådfraser + utbildningsframing),
 * språkgrind (CJK/mjuka bindestreck/typografiska citat/tabb). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const FILER = ["data/kurser-tillagg/pe-03-forvarvsmaskinen.json", "data/kurser-tillagg/mt-04-vallgravens-fodelse.json"];
const FORV = {
  "pe-03-forvarvsmaskinen": "PRIVATE EQUITY & INVESTMENTBOLAG",
  "mt-04-vallgravens-fodelse": "MOAT",
};
let pass = 0, fel = 0, varning = 0;
const P = (ok, namn, detalj = "") => { if (ok) { pass++; } else { fel++; console.error(`  FEL: ${namn} ${detalj}`); } };

for (const fil of FILER) {
  const k = JSON.parse(readFileSync(fil, "utf8"));
  const namn = k.slug;
  console.log(`\n── ${namn} (${fil}) ──`);

  // 1. Strukturparitet
  P(k.slug === namn && /^[a-z0-9][a-z0-9-]*$/.test(k.slug), "slug ren ASCII");
  P(k.category === FORV[namn], `kategori ${FORV[namn]}`, `fick ${k.category}`);
  P(k.level === "Intermediär", "nivå Intermediär", `fick ${k.level}`);
  P(k.chapterCount === 6 && k.chapters_list.length === 6 && k.chapters.length === 6, "6 kapitel överallt");
  P(k.totalMinutes === 24 && k.minutes === 24, "24 minuter");
  P(k.chapters.reduce((s, c) => s + c.minutes, 0) === k.totalMinutes, "kapitelminuter summerar 24");
  P(k.xp === 50, "XP 50");
  for (const nyckel of ["title", "summary", "why", "learn", "lynchSection", "grahamSection", "ak1Section"])
    P(typeof k[nyckel] === "string" && (nyckel === "title" ? k[nyckel].length > 20 : k[nyckel].length > 100), `${nyckel} närvarande`);
  for (const nyckel of ["origin", "evolution", "modern"])
    P(typeof k.history?.[nyckel] === "string" && k.history[nyckel].length > 100, `history.${nyckel} närvarande`);
  for (let i = 0; i < 6; i++) {
    P(k.chapters_list[i].title === k.chapters[i].title && k.chapters_list[i].num === k.chapters[i].num, `chapters_list ↔ chapters kap ${i + 1}`);
    P(k.chapters[i].blocks.length >= 2 && k.chapters[i].blocks.some(b => b.type === "text"), `kap ${i + 1} har textblock`);
  }
  P(k.chapters[0].title.startsWith("Grunderna") && k.chapters[4].title === "Fällor och missvisningar" && k.chapters[5].title.startsWith("Mästerskap"), "kapitelmönster Grunderna/…/Fällor/Mästerskap");

  // 2. Språkgrind (hela filen som text)
  const t = JSON.stringify(k);
  P(!/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(t), "0 CJK");
  P(!/\u00ad/.test(t), "0 mjuka bindestreck");
  P(!/[\u201C\u201D\u2018\u2019]/.test(t), "0 typografiska citattecken (parafras, aldrig citat)");
  P(!/\t/.test(t), "0 tabbar");

  // 3. Juridikgrind: rådimperativ + utbildningsframing
  const radfraser = [/\bköp [a-zåäö]/i, /\bsälj [a-zåäö]/i, /\binvestera i [a-zåäö]/i, /\bplacera i [a-zåäö]/i, /\bvi rekommenderar/i, /\bdet bästa köpet/i, /\btipsa dig att\b/i];
  P(radfraser.every(re => !re.test(t)), "juridikgrind: 0 rådsfraser");
  P(/varken .*uppdrag att föreskriva|utbildning/i.test(t) && /föreskriva/.test(t), "utbildningsframing närvarande (föreskriva-passus)");
  const lag = (t.match(/2007:528|1995:1554|2005:59|2022:26[01]/g) || []);
  P(lag.length === 0, "0 lagrum i kurstexten (kurser bär inte lagrum — mentorgrindens yta)", lag.join(","));

  // 4. Korslänkar prefixmatch registret
  const regSlugs = Object.keys(r);
  const lankPrefix = namn === "pe-03-forvarvsmaskinen"
    ? ["pe-01", "pe-02", "ib-01", "ks-01", "ks-03", "ks-05", "ks-06", "st-01", "st-04", "km-067", "km-068", "rk-11", "tx-01", "tx-02", "v10"]
    : ["mt-01", "mt-02", "mt-03", "roic-01", "ln-05", "tx-01", "tx-03", "vr-01", "pe-01"];
  for (const pfx of lankPrefix) {
    const finns = regSlugs.some(s => s.startsWith(pfx));
    P(finns, `korslänk ${pfx} registeräkta`);
    P(t.includes(pfx), `korslänk ${pfx} nämns i texten`);
  }

  // 5. Registret: kursen inserterad med rätt familjestorlek
  P(!!r[namn], "kursen finns i registret");
  const familj = Object.values(r).filter(x => x.category === FORV[namn]).length;
  console.log(`  info: familjen ${FORV[namn]} = ${familj} kurser i registret`);
}

// 6. Aritmetik — oberoende omräkning + närvaro i text (pe-03)
{
  console.log("\n── aritmetik pe-03 ──");
  const t = JSON.stringify(JSON.parse(readFileSync(FILER[0], "utf8")));
  const kontroller = [
    ["600 × 0,06 = 36 (ränta)", 600 * 0.06 === 36, t.includes("600 × 0,06 = 36")],
    ["100 − 20 − 10 = 70 (kassaflöde)", 100 - 20 - 10 === 70, t.includes("100 − 20 − 10 = 70")],
    ["70 − 36 = 34 (amortering)", 70 - 36 === 34, t.includes("70 − 36 = 34")],
    ["600 − 5 × 40 = 400 (skuld efter 5 år)", 600 - 5 * 40 === 400, t.includes("600 − 5 × 40 = 400")],
    ["400 × 0,06 = 24 (lägre ränta)", 400 * 0.06 === 24, t.includes("400 × 0,06 = 24")],
    ["130 × 11 = 1 430 (utfallspris)", 130 * 11 === 1430, t.includes("130 × 11 = 1 430")],
    ["1 430 − 400 = 1 030 (eget kapital)", 1430 - 400 === 1030, t.includes("1 430 − 400 = 1 030")],
    ["1 030 ÷ 400 = 2,6x", Math.abs(1030 / 400 - 2.575) < 0.001, t.includes("1 030 ÷ 400") && t.includes("2,6")],
    ["1 430 ÷ 1 000 = 1,4x", Math.abs(1430 / 1000 - 1.43) < 0.001, t.includes("1 430 ÷ 1 000") && t.includes("1,4")],
    ["100 ÷ 36 = 2,8", Math.abs(100 / 36 - 2.78) < 0.01, t.includes("100 ÷ 36 = 2,8")],
    ["80 ÷ 36 = 2,2", Math.abs(80 / 36 - 2.22) < 0.01, t.includes("80 ÷ 36 = 2,2")],
    ["80 − 20 − 10 = 50 (nedsida före ränta)", 80 - 20 - 10 === 50, t.includes("80 − 20 − 10 = 50")],
    ["50 − 36 = 14 (nedsida efter ränta)", 50 - 36 === 14, t.includes("50 − 36 = 14")],
    ["10x köpmultipel: 1 000 ÷ 100", 1000 / 100 === 10, t.includes("tio gånger") || t.includes("10")],
  ];
  for (const [namn, räkna, text] of kontroller) P(räkna && text, namn, `(räkning ${räkna}, text ${text})`);
}

// 7. Aritmetik — oberoende omräkning + närvaro i text (mt-04)
{
  console.log("\n── aritmetik mt-04 ──");
  const t = JSON.stringify(JSON.parse(readFileSync(FILER[1], "utf8")));
  const kontroller = [
    ["10 × 9 ÷ 2 = 45 förbindelser", (10 * 9) / 2 === 45, t.includes("10 × 9 ÷ 2 = 45")],
    ["20 × 19 ÷ 2 = 190 förbindelser", (20 * 19) / 2 === 190, t.includes("20 × 19 ÷ 2 = 190")],
    ["190 ÷ 45 = 4,2", Math.abs(190 / 45 - 4.22) < 0.01, t.includes("190 ÷ 45 = 4,2")],
    ["(100 + 20) ÷ 10 = 12 per kund", (100 + 20) / 10 === 12, t.includes("(100 + 20) ÷ 10 = 12")],
    ["(100 + 200) ÷ 100 = 3 per kund", (100 + 200) / 100 === 3, t.includes("(100 + 200) ÷ 100 = 3")],
    ["80 − 120 = −40 (tio kunder)", 80 - 120 === -40, t.includes("80 − 120 = minus 40")],
    ["800 − 300 = 500 (hundra kunder)", 800 - 300 === 500, t.includes("800 − 300 = 500")],
    ["52 × 5 = 260 hållna leveranser", 52 * 5 === 260, t.includes("52") && t.includes("260")],
    ["10 ÷ 500 = 2 % (år 1)", 10 / 500 === 0.02, t.includes("10 — två procent")],
    ["45 ÷ 500 = 9 % (år 5)", Math.abs(45 / 500 - 0.09) < 1e-9, t.includes("45 — nio procent")],
    ["90 ÷ 500 = 18 % (år 10)", Math.abs(90 / 500 - 0.18) < 1e-9, t.includes("90 — arton procent")],
    ["patent 20 år", t.includes("tjugo år"), true],
  ];
  for (const [namn, räkna, text] of kontroller) P(räkna && text, namn, `(räkning ${räkna}, text ${text})`);
}

// 8. Serieföljd i registret: pe-03 efter pe-02, mt-04 efter mt-03 (insertverktygets serieordning)
{
  console.log("\n── serieföljd ──");
  const slugs = Object.keys(r);
  const pePos = slugs.indexOf("pe-03-forvarvsmaskinen"), pe02 = slugs.indexOf("pe-02-utfasningar-och-irr-mekanik");
  const mtPos = slugs.indexOf("mt-04-vallgravens-fodelse"), mt03 = slugs.indexOf("mt-03-vallgraven-i-siffror");
  P(pePos > pe02 && pePos >= 0, "pe-03 efter pe-02 i registerordning");
  P(mtPos > mt03 && mtPos >= 0, "mt-04 efter mt-03 i registerordning");
}

console.log(`\n═══ KVD: ${pass} PASS · ${fel} FEL · ${varning} VARNING ═══`);
process.exit(fel === 0 ? 0 : 1);
