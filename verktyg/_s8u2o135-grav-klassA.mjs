#!/usr/bin/env node
// _s8u2o135-grav-klassA.mjs — spår 8 s8-u2 (o135): klass A-grävning — de 10 öppna
// prod-synk-fyndens fulla bevisfält + loggkontext per fönster ur prod-synk.log.
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const oppna = JSON.parse(fs.readFileSync(path.join(ROT, "data/vakten/_s8u2o135-oppna.json"), "utf8"));
const synkLogg = fs.readFileSync(path.join(ROT, "data/vakten/prod-synk.log"), "utf8").split("\n");

const klassA = oppna.oppnaLista.filter(
  (f) => f["spår"] === "F5-logg" && typeof f.fynd === "string" && f.fynd.includes("prod-synk.log")
);

console.log(`KLASS A: ${klassA.length} fynd`);
for (const f of klassA) {
  console.log(`\n=== FYND ts=${f.ts} allvar=${f.allvar}`);
  console.log(`fynd: ${f.fynd}`);
  console.log(`bevis: ${String(f.bevis).slice(0, 700)}`);
}

// Hjälp: hitta loggradens egen tidsstämpel i beviset (format 2026-09-18T17:4x:xx)
console.log("\n\n=== PROD-SYNK.LOG: MISSLYCKADES/DEPLOYAD/TIDSLINJE (sista 40 träffar) ===");
const traffar = [];
for (let i = 0; i < synkLogg.length; i++) {
  const rad = synkLogg[i];
  if (/MISSLYCKADES|DEPLOYAD|RADRENSAD|VÄNTAR|KASSERAD|AVBRUTEN|OOM|läke|LÄKE/i.test(rad)) {
    traffar.push(rad);
  }
}
for (const rad of traffar.slice(-40)) console.log(rad.slice(0, 300));
console.log(`\n(loggen har ${synkLogg.length} rader, ${traffar.size ?? traffar.length} nyckelrader totalt)`);
