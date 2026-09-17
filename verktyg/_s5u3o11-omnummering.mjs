#!/usr/bin/env node
// Omnummering ek-03 → ek-04 (u1:s ek-03-arbetsflodet nådde registret först —
// register-först-presedens) + textanpassningar mot det nya serieläget.
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";

const REPO = "/home/ak1a/AK1";
const REG = `${REPO}/public/deep-courses.json`;
const GL = `${REPO}/data/kurser-tillagg/ek-03-backtestens-hantverk.json`;
const NY = `${REPO}/data/kurser-tillagg/ek-04-backtestens-hantverk.json`;

// 1) Registret: ta bort min ek-03-rad kirurgiskt
const reg = JSON.parse(readFileSync(REG, "utf8"));
if (!reg["ek-03-backtestens-hantverk"]) {
  console.log("AVBRYT: min ek-03-rad finns inte i registret (redan omhandterad?)");
  process.exit(1);
}
if (reg["ek-04-backtestens-hantverk"]) {
  console.log("AVBRYT: ek-04 är redan upptaget!");
  process.exit(1);
}
delete reg["ek-03-backtestens-hantverk"];
writeFileSync(REG, `${JSON.stringify(reg, null, 2)}\n`, "utf8");
console.log("register: ek-03-backtestens-hantverk borttagen (tillfälligt), nu " + Object.keys(reg).length + " kurser");

// 2) Kursfilen: ny slug + textanpassningar mot u1:s ek-03-arbetsflöde
let t = readFileSync(GL, "utf8");
const fix = [
  ['"slug": "ek-03-backtestens-hantverk"', '"slug": "ek-04-backtestens-hantverk"'],
  [
    "Efter kursen läses ek-01 och ek-02 som ritningar till en provbänk — inte till ett svar.",
    "Efter kursen läses ek-01, ek-02 och ek-03:s arbetsflöde som delar av samma provbänk — inte som svar.",
  ],
  [
    "är denna kurs EKOSYSTEM-familjens verktygskurs — den tredje i ek-serien (efter ek-01:s röstlängdning och ek-02:s labbkarta) och familjens första nivåbärande Intermediär: efter kartan och röstlängdningen behövs provbänken som gör systemen prövbara.",
    "är denna kurs EKOSYSTEM-familjens provbänk — det fjärde steget i ek-serien (efter ek-01:s röstlängdning, ek-02:s labbkarta och ek-03:s arbetsflöde): arbetsflödet äger analysens fem stationer från rådata till logg, och provbänken äger nästa fråga — hur en färdig regel prövas mot historien utan att historien luras.",
  ],
  [
    "EKOSYSTEM-familjen är labbets ritningsskåp: ek-02 ritar huset (motorerna och deras ordning), ek-01 äger röstlängdningen (SAM-viktningen)",
    "EKOSYSTEM-familjen är labbets ritningsskåp: ek-02 ritar huset (motorerna och deras ordning), ek-03 äger arbetsflödet (analysens fem stationer i bestämd ordning), ek-01 äger röstlängdningen (SAM-viktningen)",
  ],
  [
    "är denna kurs provbänken mellan ritningarna och systemen: ek-02 ritar labbet (motorernas karta), AKM1-kursen äger variabelregeln",
    "är denna kurs provbänken mellan ritningarna och systemen: ek-02 ritar labbet (motorernas karta), ek-03 äger arbetsflödet (stationerna i EN analys), AKM1-kursen äger variabelregeln",
  ],
];
let n = 0;
for (const [a, b] of fix) {
  const c = t.split(a).length - 1;
  if (c !== 1) { console.log("VARNING träffar " + c + ": " + a.slice(0, 60)); continue; }
  t = t.replace(a, b); n++;
}
writeFileSync(NY, t, "utf8");
unlinkSync(GL);
console.log(n + " textanpassningar; ny fil ek-04 skriven, ek-03-fil borttagen");

// 3) Validera
const k = JSON.parse(readFileSync(NY, "utf8"));
if (k.slug !== "ek-04-backtestens-hantverk") { console.log("FEL: slug ej uppdaterad"); process.exit(1); }
console.log("ek-04-backtestens-hantverk klar för insert");
