#!/usr/bin/env node
// s5-u1 o23 — rätta kända stavfel/sammansmältningar i am-09-kursfilen FÖRE KVD.
// Paren [från, till] appliceras rekursivt på alla strängvärden i JSON.
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/kurser-tillagg/am-09-marginalhandeln.json";
const FIX = [
  ["indexetsvändningen till vara", "indexets vändning till vara"],
  ["och en varde-karta", "och en värdekarta"],
  ["för nästa belånings konto", "för nästa belåningskonto"],
  ["de djupaste readjusterna", "de djupaste nedgångarna"],
  ["med psystematisk försäljning", "med systematisk försäljning"],
  ["länge_differentierat", "länge differentierat"],
  ["naturligaotta varningsklocka", "naturliga varningsklocka"],
  ["läsårens", "läsarens"],
  ["läsåren", "läsaren"],
  ["läsåres", "läsares"],
];

const data = JSON.parse(readFileSync(FIL, "utf8"));
let slag = 0;
function ga(obj, sond) {
  if (typeof obj === "string") {
    let s = obj;
    for (const [fran, till] of FIX) {
      const fore = s.split(fran).length - 1;
      if (fore > 0) { s = s.split(fran).join(till); slag += fore; console.log(`rättad ×${fore}: "${fran}" → "${till}"`); }
    }
    return s;
  }
  if (Array.isArray(obj)) return obj.map((x) => ga(x, sond));
  if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) obj[k] = ga(obj[k], sond); return obj; }
  return obj;
}
ga(data, "");
writeFileSync(FIL, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`KLAR: ${slag} rättningar skrivna.`);

// Efterkontroll: kända fel borta? dubbla mellanslag? tabbar? typografiska citat? underscore?
const raw = readFileSync(FIL, "utf8");
const kvar = FIX.map(([f]) => f).filter((f) => (f === "läsaren" ? false : raw.includes(f)));
console.log("kända fel kvar:", kvar.length ? kvar : "inga");
console.log("dubbla mellanslag (utom nyradsindentering):", (raw.replace(/\n */g, "").match(/ {2}/g) || []).length);
console.log("tabbar:", (raw.match(/\t/g) || []).length);
console.log("typografiska citat:", (raw.match(/[\u201C\u201D\u2018\u2019]/g) || []).length);
console.log("underscore i text:", (raw.match(/_/g) || []).length);
console.log("mjuka bindestreck:", (raw.match(/\u00AD/g) || []).length);
console.log("CJK:", (raw.match(/[\u3400-\u9FFF\u3040-\u30FF\uAC00-\D7AF]/g) || []).length);
