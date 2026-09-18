#!/usr/bin/env node
/**
 * KVD — s5-u1 omgång 13 (2026-09-17): st-05 refinansieringsmuren.
 * Maskinella kontroller mot kursfilen + registret (efter insert):
 * strukturparitet, nivå/kategori, ASCII-slug, aritmetik (oberoende omräkning),
 * korslänkar prefixmatch registret, juridikgrind (rådfraser + utbildningsframing + 0 lagrum),
 * språkgrind (CJK/kyrilliska/mjuka bindestreck/typografiska citat/tabb/anomalitecken/dubbelord).
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const r = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const FIL = "data/kurser-tillagg/st-05-refinansieringsmuren.json";
const SLUG = "st-05-refinansieringsmuren";
const KAT = "STABILITET";
let pass = 0, fel = 0, varning = 0;
const P = (ok, namn, detalj = "") => { if (ok) { pass++; } else { fel++; console.error(`  FEL: ${namn} ${detalj}`); } };

const k = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`── ${k.slug} (${FIL}) ──`);

// 1. Strukturparitet (familjekonventionen: Grunderna/Konstruktion/Praktisk/Mätning/Fällor/Mästerskap)
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
P(k.chapters[0].blocks.some(b => b.type === "definition") && k.chapters[4].blocks.some(b => b.type === "definition"), "definition-block i kap 1 och 5");
P(k.chapters[1].blocks.some(b => b.type === "tabell") && k.chapters[2].blocks.some(b => b.type === "tabell") && k.chapters[3].blocks.some(b => b.type === "tabell"), "tabell-block i kap 2, 3 och 4");
P(k.chapters[5].blocks.some(b => b.type === "insight") && k.chapters[5].blocks.some(b => b.type === "utmaning"), "insight + utmaning i kap 6");

// 2. Språkgrind (hela filen som text)
const t = JSON.stringify(k);
P(!/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff]/.test(t), "0 CJK/kyrilliskt");
P(!/\u00ad/.test(t), "0 mjuka bindestreck");
P(!/[\u201C\u201D\u2018\u2019]/.test(t), "0 typografiska citattecken (parafras, aldrig citat)");
P(!/\t/.test(t), "0 tabbar");
const tillatna = /[^\x00-\x7FåäöÅÄÖéèàìòóùü×÷·—–→−≈]/g;
const anomalier = [...new Set((t.match(tillatna) || []).map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`))];
P(anomalier.length === 0, "0 anomalitecken (whitelist: åäö + matematiska tecken)", anomalier.join(","));
const dubbel = t.match(/\b(\w{3,})\s+\1\b/gi);
P(dubbel === null, "0 dubbelord", dubbel ? [...new Set(dubbel)].join(" | ") : "");

// 3. Juridikgrind: rådimperativ + utbildningsframing + 0 lagrum
const radfraser = [/\bköp [a-zåäö]/i, /\bsälj [a-zåäö]/i, /\binvestera i [a-zåäö]/i, /\bplacera i [a-zåäö]/i, /\bvi rekommenderar/i, /\bdet bästa köpet/i, /\btipsa dig att\b/i];
P(radfraser.every(re => !re.test(t)), "juridikgrind: 0 rådsfraser");
P(/utbildning, aldrig råd/i.test(t), "utbildningsframing närvarande");
const lag = (t.match(/2007:528|1995:1554|2005:59|2022:26[01]/g) || []);
P(lag.length === 0, "0 lagrum i kurstexten (kurser bär inte lagrum — mentorgrindens yta)", lag.join(","));

// 4. Korslänkar prefixmatch registret + nämnda i texten
const regSlugs = Object.keys(r);
for (const pfx of ["st-01", "st-02", "st-03", "st-04", "ks-02", "ks-03", "ks-05", "ks-06", "ln-04", "rk-01", "rs-04", "ek-03", "ma-01", "mk-04", "ud-09", "v10-", "v11-"]) {
  P(regSlugs.some(s => s.startsWith(pfx)), `korslänk ${pfx} registeräkta`);
  P(t.includes(pfx.replace(/-$/, "")), `korslänk ${pfx} nämns i texten`);
}

// 5. Registret: inserterad, familjestorlek, serieordning
P(!!r[SLUG], "kursen finns i registret");
const familj = Object.values(r).filter(x => x.category === KAT);
P(familj.length === 8, "STABILITET-familjen = 8 kurser", `fick ${familj.length}`);
const nycklar = Object.keys(r);
P(nycklar.indexOf(SLUG) === nycklar.indexOf("st-04-stabilitet-genom-kreditcykeln") + 1, "serieordning: st-05 direkt efter st-04");
P(JSON.stringify(r[SLUG]) === JSON.stringify(k), "registerposten identisk med kursfilen");
console.log(`  info: registret ${nycklar.length} kurser`);

// 6. Aritmetik — oberoende omräkning + närvaro i text
{
  console.log("── aritmetik st-05 ──");
  const kontroller = [
    ["profilsumma 200+400+350+150+100 = 1 200,0", 200 + 400 + 350 + 150 + 100 === 1200, t.includes("200,0 · 400,0 · 350,0 · 150,0 · 100,0")],
    ["klunga 400,0 + 350,0 = 750,0", 400 + 350 === 750, t.includes("400,0 + 350,0 = 750,0")],
    ["klungmått 750/1200 = 62,5 procent", Math.abs(750 / 1200 - 0.625) < 1e-12, t.includes("750,0 ÷ 1 200,0 = 62,5 procent")],
    ["mur/kassa+ram 750/200 = 3,75×", Math.abs(750 / 200 - 3.75) < 1e-12, t.includes("750,0 ÷ 200,0")],
    ["bärare 80+120+2×60 = 320,0", 80 + 120 + 2 * 60 === 320, t.includes("80,0 + 120,0 + 2 × 60,0")],
    ["mur-kvot 750/320 = 2,3×", Math.abs(750 / 320 - 2.34) < 0.005, t.includes("750,0 ÷ 320,0 = 2,3×")],
    ["jämn profil 240×5 = 1 200", 240 * 5 === 1200, t.includes("240,0 × 5")],
    ["jämn mur 240+240 = 480,0 = 40,0 procent", 240 + 240 === 480 && Math.abs(480 / 1200 - 0.4) < 1e-12, t.includes("480,0 (40,0 procent)")],
    ["klunga mer än jämn: 750−480 = 270,0", 750 - 480 === 270, t.includes("750,0 − 480,0")],
    ["ränta 0,030 × 1 200,0 = 36,0", 0.03 * 1200 === 36, t.includes("0,030 × 1 200,0")],
    ["täckning 137,0 ÷ 36,0 = 3,8×", Math.abs(137 / 36 - 3.806) < 0.001, t.includes("137,0 ÷ 36,0 = 3,8×")],
    ["uppslag 3,5 pp × 750,0 = 26,3", Math.abs(0.035 * 750 - 26.25) < 1e-9, t.includes("3,5 procentenheter × 750,0 = 26,3")],
    ["ny ränta 750×0,065 + 450×0,03 = 62,3 (48,8 + 13,5)", Math.abs(750 * 0.065 + 450 * 0.03 - 62.25) < 1e-9 && Math.abs(48.8 + 13.5 - 62.3) < 1e-9, t.includes("48,8 + 13,5 = 62,3")],
    ["ny täckning 137,0 ÷ 62,3 = 2,2×", Math.abs(137 / 62.25 - 2.201) < 0.001, t.includes("137,0 ÷ 62,3 = 2,2×")],
    ["jämn uppslag 0,035 × 480,0 = 16,8", Math.abs(0.035 * 480 - 16.8) < 1e-9, t.includes("0,035 × 480,0 = 16,8")],
    ["jämn ränta 480×0,065 + 720×0,03 = 52,8", Math.abs(480 * 0.065 + 720 * 0.03 - 52.8) < 1e-9, t.includes("52,8")],
    ["skillnad 62,3 − 52,8 = 9,5", Math.abs(62.3 - 52.8 - 9.5) < 1e-9, t.includes("62,3 − 52,8")],
    ["amortering 375,0/60,0 = 6,3×", Math.abs(375 / 60 - 6.25) < 1e-12, t.includes("375,0 ÷ 60,0 = 6,3×")],
    ["känslighet +1,0 pp = 7,5", 0.01 * 750 === 7.5, t.includes("7,5 miljoner per år")],
    ["känslighet +5,0 pp = 37,5", 0.05 * 750 === 37.5, t.includes("(0,05 × 750,0)")],
    ["jämn mur-kvot 480/320 = 1,5×", Math.abs(480 / 320 - 1.5) < 1e-12, t.includes("480,0 ÷ 320,0 = 1,5×")],
    ["andelssumma 16,7+33,3+29,2+12,5+8,3 = 100,0", Math.abs(16.7 + 33.3 + 29.2 + 12.5 + 8.3 - 100.0) < 0.01, t.includes("16,7 procent")],
  ];
  for (const [namn, rakna, text] of kontroller) P(rakna && text, namn, `(räkning ${rakna}, text ${text})`);
}

// 7. Territorium: grannarnas stenar orörda — st-05 äger klungan/kalendern, inte grannarnas ytor
P(!/bindningsmekanikens djup|bindningstablå/.test(t), "ks-03:s instrumentyta ej övertagen");
P((t.match(/st-04/g) || []).length >= 1 && !/kreditcykelns fyra faser/.test(t), "st-04:s cykelyta refererad, ej ombyggd");
P(!/covenant-test|covenantgrad/.test(t), "ks-05:s covenantyta ej övertagen");
P(!/z-score-formeln|Z = /.test(t), "st-03:s modellformler ej övertagna");

console.log(`\nKVD: ${pass} PASS · ${fel} FEL · ${varning} VARNING`);
process.exit(fel > 0 ? 1 : 0);
