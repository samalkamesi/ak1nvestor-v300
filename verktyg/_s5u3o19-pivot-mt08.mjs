#!/usr/bin/env node
// s5-u3 omgång 19 — PIVOT mt-07 → mt-08 (register-först-presedens: syskonets
// mt-07-prisfullmakten nådde registret under mitt byggfönster) + sista KVD-fixarna.
import { readFileSync, writeFileSync, renameSync } from "node:fs";
const ROT = "/home/ak1a/AK1";

// ── mt-07 → mt-08 (filbyte + textmönster) ────────────────────────────────────
const GAMMAL = ROT + "/data/kurser-tillagg/mt-07-kvalitetspremien.json";
const NYFIL = ROT + "/data/kurser-tillagg/mt-08-kvalitetspremien.json";
const j = JSON.parse(readFileSync(GAMMAL, "utf8"));
j.slug = "mt-08-kvalitetspremien";
const FIX = [
  ["MULTIPLERAL", "MULTIPEL"],
  ["MOAT-familjens sjunde steg och tredje Avancerade nivå — kröningen efter mt-03:s mätning och mt-05:s byteskostnader — öppnar",
   "MOAT-familjens åttonde steg och fjärde Avancerade nivå — kröningen efter mt-07:s prisfullmakt, mt-03:s mätning och mt-05:s byteskostnader — öppnar"],
  ["Sond mot 440 kurser: kvalitetspremie, moat och multipel, rätt pris och kvalitetsfälla ger alla noll kursägare — vr-03 äger multipelns anatomi, km-027 äger PEG-måttet, kt-02 äger förväntningsläsningen, bf-15 äger bubblan — ingen äger förhållandet moat mot pris som egen yta.",
   "Gränsen mot syskonsteget: mt-07 äger bolagets prisfullmakt — maktens test av vallgraven, om bolaget kan höja sina egna priser; denna kurs äger ägarens pris — marknadens pris på samma kvalitet. Sond mot registret: kvalitetspremie, moat och multipel, rätt pris och kvalitetsfälla — noll kursägare; vr-03 äger multipelns anatomi, km-027 äger PEG-måttet, kt-02 äger förväntningsläsningen, bf-15 äger bubblan."],
  ["men ingen äger PREMIE-förhållandet moat mot pris, läran om när kvalitet är betald i förväg och när den är en present. mt-07 kröner serien med just den frågan: N:1 I:3 A:2 blir A:3, och vallgravsfamiljen når sitt pris.",
   "men ingen äger PREMIE-förhållandet moat mot pris, läran om när kvalitet är betald i förväg och när den är en present. mt-08 kröner serien med just den frågan: med prisfullmakten som bolagets sida (steg sju) blir kvalitetspremien ägarens sida (steg åtta), och vallgravsfamiljen når sitt pris."],
  ["Moatfamiliens sju steg i en båge: se vallgraven, mät den, prisa den.",
   "Moatfamiljens steg i en båge: se vallgraven, mät den, pröva dess makt — och prisa den."],
  ["det är moatfamiliens sjunde steg", "det är moatfamiljens åttonde steg"],
];
const byt = (s) => { let n = s; for (const [a, b] of FIX) n = n.split(a).join(b); return n; };
for (const f of ["title", "summary", "why", "learn"]) j[f] = byt(j[f]);
for (const k of ["origin", "evolution", "modern"]) j.history[k] = byt(j.history[k]);
for (const f of ["lynchSection", "grahamSection", "ak1Section"]) j[f] = byt(j[f]);
for (const c of j.chapters) {
  c.title = byt(c.title); c.intro = byt(c.intro);
  for (const b of c.blocks) b.content = byt(b.content);
}
writeFileSync(NYFIL, JSON.stringify(j, null, 2) + "\n", "utf8");
renameSync(GAMMAL, ROT + "/verktyg/_s5u3o19-mt07-urslag.txt.pivoted");
renameSync(ROT + "/verktyg/_s5u3o19-mt07-urslag.txt.pivoted", ROT + "/verktyg/_s5u3o19-mt07-urslag.txt");

// ── se-18: tabellraden som gav falskt fönster 5 000 = 25 000 ────────────────
const FIL2 = ROT + "/data/kurser-tillagg/se-18-rederi-och-shipping.json";
const s = JSON.parse(readFileSync(FIL2, "utf8"));
for (const c of s.chapters) for (const b of c.blocks) {
  b.content = b.content.split("drift 12 000 + finansiering 8 000 + administration 5 000 = 25 000")
    .join("drift 12 000, finansiering 8 000, administration 5 000 — summan 12 000 + 8 000 + 5 000 = 25 000");
}
writeFileSync(FIL2, JSON.stringify(s, null, 2) + "\n", "utf8");

// ── ma-07: é-accenten i idén (grinden vill 0 accenter) ──────────────────────
const FIL3 = ROT + "/data/kurser-tillagg/ma-07-valutakursens-mekanik.json";
const m = JSON.parse(readFileSync(FIL3, "utf8"));
for (const c of m.chapters) for (const b of c.blocks) {
  b.content = b.content.split("gjorde idén världsberömd").join("gjorde tänket världsberömt");
}
writeFileSync(FIL3, JSON.stringify(m, null, 2) + "\n", "utf8");

// ── verifiering ──────────────────────────────────────────────────────────────
for (const [fil, slug] of [[NYFIL, "mt-08-kvalitetspremien"], [FIL2, "se-18-rederi-och-shipping"], [FIL3, "ma-07-valutakursens-mekanik"]]) {
  const t = readFileSync(fil, "utf8");
  const o = JSON.parse(t);
  const kvar = ["MULTIPLERAL", "multipleral", "idén", "é"].filter((x) => t.includes(x));
  console.log(slug, "| slug ok:", o.slug === slug, "| kvarstående:", kvar.length ? kvar.join(",") : "inga");
}
