#!/usr/bin/env node
// s5-u3 omgång 19 — engångsfix av se-18: struktur (18 fält, inga followups),
// talparitet (10-fartygsflotta, 6 ÷ 10 = 0,60 certifikatsandel) + språkrensning.
import { readFileSync, writeFileSync } from "node:fs";
const FIL = "/home/ak1a/AK1/data/kurser-tillagg/se-18-rederi-och-shipping.json";
const j = JSON.parse(readFileSync(FIL, "utf8"));
delete j.level_note;
for (const c of j.chapters) for (const b of c.blocks) delete b.followups;

const FIX = [
  // — språk: engelska läckor, sammanslagningar, felord —
  ["Sjöfarten är Nordens äldsta exportgren", "Sjöfarten är en av Nordens äldsta exportgrenar"],
  ["fartyget itself kapitalposten", "fartyget blev i sig en kapitalpost"],
  ["kursmässigt productiv", "kursmässigt givande"],
  ["världskrungens bopror och botten växlade", "krigens och krisernas böljor växlade topp mot botten"],
  ["Vinterna gör kvinnan vis, heter det gamla ordspråket, men rederibranschens variant är den omvända: goda år beställer nya fartyg.", "Rederibranschens variant av vishetsläran är den omvända: goda år beställer nya fartyg."],
  ["omöttligt och välbehållet", "intakt och välbehållet"],
  ["cykelns possible present", "cykelns möjliga present"],
  ["history.Evolutionens generella lektion", "cykelns generella lektion"],
  ["bottnens budkännare", "bottnens budbärare"],
  ["rk-07:s fråga om hävlingar", "rk-07:s fråga om kurssäkring"],
  ["Peter Lynchplacerade", "Peter Lynch placerade"],
  ["vm-10:s assetbased-tanke", "vm-10:s substansmetod"],
  ["Grahams marginal kan mätas", "Grahams säkerhetsmarginal kan mätas"],
  ["som en flygbolagssektorn", "som flygsektorn"],
  ["en ledningshandsling", "ett ledningshandsval"],
  ["Ma-04:s konjunkturindikatorer", "ma-04:s konjunkturindikatorer"],
  ["halverat på intakt förtöjning", "utan att något hänt fartyget"],
  ["halverat värde på intakt förtöjning", "halverat värde utan att något hänt fartyget"],
  // — talparitet: tolv → tio fartyg, 5 ÷ 12 → 6 ÷ 10 överallt —
  ["med tolv fartyg: sju i spot och fem på tidscertifikat — 5 ÷ 12 = 0,42 i certifikatsandel", "med tio fartyg: fyra i spot och sex på tidscertifikat — 6 ÷ 10 = 0,60 i certifikatsandel"],
  ["och med en flotta på tolv fartyg är det 25 miljoner dollar i blödning", "och med en flotta på tio fartyg är det 21 miljoner dollar i blödning"],
  ["Nordviks fem av tolv fartyg på ettårscertifikat till 35 000", "Nordviks sex av tio fartyg på ettårscertifikat till 35 000"],
  ["Nordviks 5 ÷ 12 = 0,42 säger", "Nordviks 6 ÷ 10 = 0,60 säger"],
  ["certifikatsandel 5 ÷ 12 = 0,42", "certifikatsandel 6 ÷ 10 = 0,60"],
  ["hela skillnaden mellan de två scenario-kolumnerna ligger i fem av tolv fartyg", "hela skillnaden mellan de två scenario-kolumnerna ligger i sex av tio fartyg"],
  ["med andelen 5 ÷ 12 = 0,42", "med andelen 6 ÷ 10 = 0,60"],
];

const byt = (s) => { let n = s; for (const [a, b] of FIX) n = n.split(a).join(b); return n; };
for (const f of ["title", "summary", "why", "learn"]) j[f] = byt(j[f]);
for (const k of ["origin", "evolution", "modern"]) j.history[k] = byt(j.history[k]);
for (const f of ["lynchSection", "grahamSection", "ak1Section"]) j[f] = byt(j[f]);
for (const c of j.chapters) {
  c.title = byt(c.title); c.intro = byt(c.intro);
  for (const b of c.blocks) b.content = byt(b.content);
}

const kolla = ["itself", "productiv", "possible", "bopror", "followups", "5 ÷ 12", "fem av tolv", "twelve", "multipleral"];
const str = JSON.stringify(j);
const kvar = kolla.filter((x) => str.includes(x));
writeFileSync(FIL, JSON.stringify(j, null, 2) + "\n", "utf8");
console.log(kvar.length ? "KVARSTÅR: " + kvar.join(", ") : "RENSAT — struktur " + Object.keys(j).length + " fält");
