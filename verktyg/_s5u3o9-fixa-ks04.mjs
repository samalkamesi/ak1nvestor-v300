import { readFileSync, writeFileSync } from "node:fs";
const p = "data/kurser-tillagg/ks-04-konvertibler-och-hybridkapital.json";
let t = readFileSync(p, "utf8");
const byt = [
  ['"level": "Intermediär",\n  "why":', '"why":'],
  ["innehavaren haraktiens fall till liten del", "innehavaren bär aktiens fall till liten del"],
  ["medFörväntat stigande kurs", "med förväntat stigande kurs"],
  ["atycka som hör hemma i kapitalallokeringens fem vägor", "att tänka som hör hemma i kapitalallokeringens fem vägar"],
  ["optionsvärderätten", "valrätten"],
  ["utdelningen är fast och sidoparkerad i kön", "utdelningen är fast och står tidigt i kön"],
  ["bär värdetransfereringen", "bär värdeöverförigen"],
  ["Hybridepollaren (förlorar avkastningen)", "Hybridägaren (förlorar avkastningen)"],
  ["Hybridepollaren i kris", "Hybridägaren i kris"],
  ["prissettingen", "prissättningen"],
  ["prisrutAN", "prisrutan"],
  ["vemsömmönstret man litar på", "vems mönster man litar på"],
  ["obekvämt mittemellan hans eget schackbräde", "obekvämt mellan hans egna lådor"],
  ["inte omöjliga att äga klopt", "inte omöjliga att äga klokt"],
  ["| Steg | Instrument | Bär av | Får före |", "| Steg | Instrument | Avkastning | Får före |"]
];
let n = 0;
for (const [a, b] of byt) {
  if (!t.includes(a)) { console.log("SAKNAS: [" + a.slice(0, 60) + "]"); continue; }
  t = t.split(a).join(b); n++;
}
writeFileSync(p, t);
console.log("Rättade " + n + " av " + byt.length);
console.log("CJK:", JSON.stringify(t.match(/[\u4e00-\u9fff\u3040-\u30ff]+/g)));
const j = JSON.parse(t);
console.log("JSON giltigt | level:", j.level, "| level-förekomster i råtext:", (t.match(/"level":/g) || []).length);
