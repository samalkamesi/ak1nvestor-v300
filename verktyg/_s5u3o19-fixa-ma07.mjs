#!/usr/bin/env node
// s5-u3 omgång 19 — engångsfix av ma-07: struktur (18 fält, inga followups),
// mjuka bindestreck, engelska läckor + skrivfel.
import { readFileSync, writeFileSync } from "node:fs";
const FIL = "/home/ak1a/AK1/data/kurser-tillagg/ma-07-valutakursens-mekanik.json";
const j = JSON.parse(readFileSync(FIL, "utf8"));
for (const c of j.chapters) for (const b of c.blocks) delete b.followups;

const FIX = [
  // — engelska läckor —
  ["både obviously sann och famously otillräcklig", "både självklart sann och ökändt otillräcklig"],
  ["RK-07:s hedginglära och se-17:s sektorexempel", "rk-07:s lära om kurssäkring och se-17:s sektorexempel"],
  ["rk-07:s hedginglära är bolagssidan av same fråga", "rk-07:s säkringslära är bolagssidan av samma fråga"],
  // — mjuka bindestreck —
  ["hög­räntevalutan", "högräntevalutan"],
  ["handels­viktad", "handelsviktad"],
  // — skrivfel och trasiga meningar —
  ["en_not", "en not"],
  ["den som denne steg lär äntligen läsa mekaniskt i stället för magiskt", "som detta steg äntligen lär läsa mekaniskt i stället för magiskt"],
  ["Mellanvärldskrisernas guldkablar", "Mellankrigstidens guldkablar"],
  ["Sveriges egen höstdräkt i dramat", "Sveriges egen roll i dramat"],
  ["samma borgare, samma prisregel", "samma burgare, samma prisregel"],
  ["negerar inte ett boltigent arbete", "negerar inte ett solidt arbete"],
  ["makrons mest missförstådda tal", "familjens mest missförstådda tal"],
  ["är historien full av Tillfällen då kursexemplen ätit både spannmålet och sädeskärnan", "är historien full av tillfällen då kursexponeringen ätit hela skillnaden och mer därtill"],
  ["4,0 − 1,0 = 3,0 procent i spannmål", "4,0 − 1,0 = 3,0 procent i ränteskillnad"],
  ["i spannmål — betald i kursexponering", "i ränteskillnad — betald i kursexponering"],
  ["spannmål, inte spådom", "aritmetik, inte spådom"],
  ["valutasvarigheten är ett mätbart blad", "valutakänsligheten är en mätbar egenskap"],
  ["de största dolda drivrutinerna", "de största dolda drivkrafterna"],
  ["riskaptiten", "riskviljan"],
];

const byt = (s) => { let n = s; for (const [a, b] of FIX) n = n.split(a).join(b); return n; };
for (const f of ["title", "summary", "why", "learn"]) j[f] = byt(j[f]);
for (const k of ["origin", "evolution", "modern"]) j.history[k] = byt(j.history[k]);
for (const f of ["lynchSection", "grahamSection", "ak1Section"]) j[f] = byt(j[f]);
for (const c of j.chapters) {
  c.title = byt(c.title); c.intro = byt(c.intro);
  for (const b of c.blocks) b.content = byt(b.content);
}

const kolla = ["obviously", "famously", "hedging", "followups", "borgare", "en_not", "boltigent", "spannmål", "\u00AD"];
const str = JSON.stringify(j);
const kvar = kolla.filter((x) => str.includes(x));
writeFileSync(FIL, JSON.stringify(j, null, 2) + "\n", "utf8");
console.log(kvar.length ? "KVARSTÅR: " + kvar.join(", ") : "RENSAT — struktur " + Object.keys(j).length + " fält");
