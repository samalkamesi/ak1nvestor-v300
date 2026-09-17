#!/usr/bin/env node
/**
 * KVD — s5-u1 omgång 12 (2026-09-17): vr-04 avkastningens tre källor.
 * Maskinella kontroller mot kursfilen + registret (efter insert):
 * strukturparitet (vr-familjens mönster), nivå/kategori, ASCII-slug,
 * aritmetik (oberoende omräkning), korslänkar prefixmatch registret,
 * juridikgrind (rådfraser + utbildningsframing + 0 lagrum),
 * språkgrind (CJK/mjuka bindestreck/typografiska citat/tabb/anomalitecken).
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const FIL = "data/kurser-tillagg/vr-04-avkastningens-tre-kallor.json";
const SLUG = "vr-04-avkastningens-tre-kallor";
const KAT = "VÄRDERING";
let pass = 0, fel = 0, varning = 0;
const P = (ok, namn, detalj = "") => { if (ok) { pass++; } else { fel++; console.error(`  FEL: ${namn} ${detalj}`); } };

const k = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`── ${k.slug} (${FIL}) ──`);

// 1. Strukturparitet (vr-familjens konvention: Grunderna/Konstruktion/Praktisk/Mätning/Fällor/Mästerskap)
P(k.slug === SLUG && /^[a-z0-9][a-z0-9-]*$/.test(k.slug), "slug ren ASCII");
P(k.category === KAT, `kategori ${KAT}`, `fick ${k.category}`);
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
// Blockmönster (ek-03-modellen anpassad för vr-04): definition i 1+5, tabell i 2+3+4, insight+utmaning i 6
P(k.chapters[0].blocks.some(b => b.type === "definition") && k.chapters[4].blocks.some(b => b.type === "definition"), "definition-block i kap 1 och 5");
P(k.chapters[1].blocks.some(b => b.type === "tabell") && k.chapters[2].blocks.some(b => b.type === "tabell") && k.chapters[3].blocks.some(b => b.type === "tabell"), "tabell-block i kap 2, 3 och 4");
P(k.chapters[5].blocks.some(b => b.type === "insight") && k.chapters[5].blocks.some(b => b.type === "utmaning"), "insight + utmaning i kap 6");

// 2. Språkgrind (hela filen som text)
const t = JSON.stringify(k);
P(!/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(t), "0 CJK");
P(!/\u00ad/.test(t), "0 mjuka bindestreck");
P(!/[\u201C\u201D\u2018\u2019]/.test(t), "0 typografiska citattecken (parafras, aldrig citat)");
P(!/\t/.test(t), "0 tabbar");
// Anomalitecken: utanför ASCII + svenska tecken + kursens matematiska typsnitt
const tillatna = /[^\x00-\x7FåäöÅÄÖàáéèìíòóùúü×÷·—–→−≈¹⁰]/g;
const anomalier = [...new Set((t.match(tillatna) || []).map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`))];
P(anomalier.length === 0, "0 anomalitecken (whitelist: åäö + matematiska tecken)", anomalier.join(","));

// 3. Juridikgrind: rådimperativ + utbildningsframing + 0 lagrum
const radfraser = [/\bköp [a-zåäö]/i, /\bsälj [a-zåäö]/i, /\binvestera i [a-zåäö]/i, /\bplacera i [a-zåäö]/i, /\bvi rekommenderar/i, /\bdet bästa köpet/i, /\btipsa dig att\b/i];
P(radfraser.every(re => !re.test(t)), "juridikgrind: 0 rådsfraser");
P(/utbildning, aldrig råd/.test(t), "utbildningsframing närvarande (vr-familjens passus)");
const lag = (t.match(/2007:528|1995:1554|2005:59|2022:26[01]/g) || []);
P(lag.length === 0, "0 lagrum i kurstexten (kurser bär inte lagrum — mentorgrindens yta)", lag.join(","));

// 4. Korslänkar prefixmatch registret + nämnda i texten
const regSlugs = Object.keys(r);
for (const pfx of ["vr-01", "vr-02", "vr-03", "km-009", "kt-02", "tx-03", "ud-09", "v20-", "ln-02", "ek-03", "v04-"]) {
  P(regSlugs.some(s => s.startsWith(pfx)), `korslänk ${pfx} registeräkta`);
  P(t.includes(pfx.replace(/-$/, "")), `korslänk ${pfx} nämns i texten`);
}

// 5. Registret: inserterad, familjestorlek, serieordning
P(!!r[SLUG], "kursen finns i registret");
const familj = Object.values(r).filter(x => x.category === KAT);
P(familj.length === 7, "VÄRDERING-familjen = 7 kurser", `fick ${familj.length}`);
const nycklar = Object.keys(r);
P(nycklar.indexOf(SLUG) === nycklar.indexOf("vr-03-multipelns-anatomi") + 1, "serieordning: vr-04 direkt efter vr-03");
P(JSON.stringify(r[SLUG]) === JSON.stringify(k), "registerposten identisk med kursfilen");
console.log(`  info: registret ${nycklar.length} kurser`);

// 6. Aritmetik — oberoende omräkning + närvaro i text (spegelparet + trapptestet)
{
  console.log("── aritmetik vr-04 ──");
  const kontroller = [
    ["20,0 × 10,00 = 200,0 (startpris fall A)", 20 * 10 === 200, t.includes("20,0 × 10,00 = 200,0")],
    ["12,5 × 16,00 = 200,0 (slutpris fall A)", 12.5 * 16 === 200, t.includes("12,5 × 16,00 = 200,0")],
    ["1,60 × 0,625 = 1,000 (identiteten fall A)", Math.abs(1.6 * 0.625 - 1) < 1e-9, t.includes("1,60 × 0,625 = 1,000")],
    ["60 − 37,5 = 22,5 (den additiva bluffen, namngiven som fel)", Math.abs(60 - 37.5 - 22.5) < 1e-9, t.includes("60 − 37,5 = 22,5")],
    ["10 + 4 × 1,50 = 16,00 (vinstvägen)", 10 + 4 * 1.5 === 16, t.includes("10 + 4 × 1,50 = 16,00")],
    ["vinstsumma 65,00 (10+11,50+13+14,50+16)", Math.abs(10 + 11.5 + 13 + 14.5 + 16 - 65) < 1e-9, t.includes("65,00")],
    ["0,4 × 65,00 = 26,00 (utdelningssumman)", Math.abs(0.4 * 65 - 26) < 1e-9, t.includes("0,4 × 65,00 = 26,00")],
    ["kvarväxt 39,00 = 65,00 − 26,00", 65 - 26 === 39, t.includes("39,00")],
    ["26,00 ÷ 200,0 = 13,0 (total fall A)", Math.abs(26 / 200 - 0.13) < 1e-9, t.includes("26,00 ÷ 200,0 = 13,0")],
    ["12,5 × 10,00 = 125,0 (startpris fall B)", 12.5 * 10 === 125, t.includes("12,5 × 10,00 = 125,0")],
    ["20,0 × 16,00 = 320,0 (slutpris fall B)", 20 * 16 === 320, t.includes("20,0 × 16,00 = 320,0")],
    ["320,0 ÷ 125,0 = 2,56 (prisavkastning fall B)", Math.abs(320 / 125 - 2.56) < 1e-9, t.includes("320,0 ÷ 125,0 = 2,56")],
    ["1,60 × 1,60 = 2,56 (procent på procent)", Math.abs(1.6 * 1.6 - 2.56) < 1e-9, t.includes("1,60 × 1,60 = 2,56")],
    ["320,0 − 125,0 = 195,0 (prisuppgång)", 320 - 125 === 195, t.includes("320,0 − 125,0 = 195,0")],
    ["195,0 + 26,00 = 221,0 (ordad summa: är 221,0 kronor)", 195 + 26 === 221, t.includes("är 221,0 kronor på insatsen 125,0")],
    ["221,0 ÷ 125,0 = 1,768 (total fall B)", Math.abs(221 / 125 - 1.768) < 0.0005, t.includes("221,0 ÷ 125,0 = 1,768")],
    ["26,00 ÷ 125,0 = 20,8 (utdelningsbidrag fall B)", Math.abs(26 / 125 - 0.208) < 0.0005, t.includes("26,00 ÷ 125,0 = 20,8")],
    ["1,06 × 1,02 = 1,0812 (påtagligt i trapptestet)", Math.abs(1.06 * 1.02 - 1.0812) < 0.0001, t.includes("1,06 × 1,02 = 1,0812")],
    ["1,10 ÷ 1,0812 = 1,017 (den oköpbara posten/år)", Math.abs(1.1 / 1.0812 - 1.017) < 0.0005, t.includes("1,10 ÷ 1,0812 = 1,017")],
    ["1,017¹⁰ ≈ 1,19 (tioårsbehovet)", Math.abs(Math.pow(1.1 / 1.0812, 10) - 1.19) < 0.01, t.includes("1,017¹⁰ ≈ 1,19")],
  ];
  for (const [namn, rakna, text] of kontroller) P(rakna && text, namn, `(räkning ${rakna}, text ${text})`);
}

// 7. Territorium: grannarnas stenar orörda — vr-04 äger tidslinjen, inte grannarnas ytor
P(!/fyra motorer/.test(t), "vr-03:s territorium (fyra motorer) ej övertaget");
P(!/tvärsnitt/.test(t) || (t.match(/vr-01/g) || []).length >= 1, "vr-01-referenser finns där tvärsnitt nämns");
P(!/normaliseringsmetod|median-EBIT/.test(t), "vr-02:s normaliseringsmetodik ej övertagen");

console.log(`\nKVD: ${pass} PASS · ${fel} FEL · ${varning} VARNING`);
process.exit(fel > 0 ? 1 : 0);
