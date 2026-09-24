#!/usr/bin/env node
/** s5-u2 o25 — rättningspass: artefaktrensning av de två kursfilerna (en-gångs). */
import { readFileSync, writeFileSync } from "node:fs";
const ROT = "/home/ak1a/AK1";
const filer = ["data/kurser-tillagg/bk-08-intaktredovisningen.json", "data/kurser-tillagg/roic-05-den-ekonomiska-vinsten.json"];

const regexFixar = [
  [/Viktningen lär två saker\..*?(?=För det första att räntans skatteavdrag)/s, "Viktningen lär två saker. "],
  [/Tröskeln är tillväxtens vendetta\.\.\. Tröskeln gör/, "Tröskeln gör"],
  [/till en riktning istället för en synonym:/, "till en riktning i stället för en storlek:"],
  [/FÖR Sörverk är tillväxten en lidandets\.\.\. är varje/, "FÖR Sörverk är varje"],
  [/och all värdeöver-skott\.\.\. och allt värdeöverskott/, "och allt värdeöverskott"],
  [/varför ALSO g\.\.\. varför också g/, "varför också g"],
  [/Multipel-läsningen följer direkt: värde delat med kapital är 1 plus EVA delat med kapital gånger\.\.\. är ett plus kvoten av spridning\.\.\. kapitaltäckningsförhållandet alltså rörelsens egen bokförda multiple, fallen ur en division i stället ur en marknadsstämd jämförelse\./, "Multipelläsningen följer direkt: förhållandet mellan värde och kapital — 1,33 vid g 0 och 1,52 vid g 3 — är rörelsens egen bokförda multipel, fallen ur en division i stället för en marknadsstämd jämförelse."],
  [/diskonterar över-skottet\.\.\. överskottet över kapitalhyran/, "diskonterar överskottet över kapitalhyran"],
  [/nämnaren är spridningens\.\.\. nämnaren bär/, "nämnaren bär"],
  [/multiple:n är deras förhållande/, "multipeln är deras förhållande"],
  [/rörelsedish\.\.\. rönelsedelen är förtjänad/, "rörelsededelen är förtjänad"],
  [/avskrivningens inbyggda födelsedags present\.\.\. present till resultatet/, "avskrivningens inbyggda present till resultatet"],
  [/fördelar förvärvsväxta bolag/, "fördelar förvärvsvuxna bolag"],
  [/förran risken/, "förrän risken"],
  [/Lynches stadiga växtare/, "Lynchs stadiga växtare"],
];

let totalt = 0;
for (const fil of filer) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  let n = 0;
  for (const [re, ny] of regexFixar) { const fore = t; t = t.replace(re, ny); if (t !== fore) n++; }
  writeFileSync(ROT + "/" + fil, t, "utf8");
  console.log(fil.split("/").pop() + ": " + n + " rättnader");
  totalt += n;
}

// Skanning: kvarvarande artefakter
for (const fil of filer) {
  const t = readFileSync(ROT + "/" + fil, "utf8");
  const fynd = [];
  const ell = [...t.matchAll(/\.\.\./g)].length;
  if (ell) fynd.push("tre-punkter ×" + ell + ": " + [...t.matchAll(/.{25}\.\.\..{15}/g)].slice(0, 6).map(m => m[0].replace(/\s+/g, " ")).join(" ␤ "));
  const cyr = t.match(/[\u0400-\u04FF]+/g);
  if (cyr) fynd.push("kyrilliskt: " + [...new Set(cyr)].join(","));
  const cjk = t.match(/[\u4e00-\u9FFF]+/g);
  if (cjk) fynd.push("CJK: " + [...new Set(cjk)].join(","));
  const dubbel = t.match(/"(?:[^"\\]|\\.)*  (?:[^"\\]|\\.)*"/g);
  if (dubbel) fynd.push("dubbla mellanslag i strängar: " + dubbel.length);
  const komm = t.match(/[a-zåäö],[a-zåäö]/g);
  if (komm) fynd.push("komma utan luft: " + [...new Set(komm)].join(","));
  console.log((fynd.length ? "FYND " : "REN   ") + fil.split("/").pop() + (fynd.length ? "\n  " + fynd.join("\n  ") : ""));
}
console.log("totalt " + totalt + " rättnader");
