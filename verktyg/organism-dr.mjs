#!/usr/bin/env node
/**
 * ORGANISM-DR — bevisbaserad katastrofövning (våg 130; PNAS off-ekvilibrium
 * + § forskningsunderlag: "granska agenter i oväntade lägen")
 * =====================================================================
 * Klassiska DR-test simulerar fel — här gör vi DET BÄTTRE: verifikation
 * ur verkligheten. Varje återhämtningsmekanism ska ha en BEVISAD aktivering
 * i loggarna (verkligt fel inträffat + verklig återhämtning sedd).
 * En mekanism utan bevis = "OEVD" (övad i teorin, ej i verkligheten) —
 * DR-rapporten flaggar den; ronden kan då framkalla en KONTROLLERAD övning.
 *
 * Skriver: data/vakten/dr-rapport.md (senaste) + dr-logg.txt (historik)
 * Körs: manuellt + data-hygienen (söndagar) — rapporten läses av ronder.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");

function las(fil, maxRader = 400) {
  try {
    return fs.readFileSync(fil, "utf8").trim().split("\n").slice(-maxRader);
  } catch {
    return [];
  }
}

function sist(rad, del) {
  for (let i = rad.length - 1; i >= 0; i--) if (rad[i].includes(del)) return rad[i].slice(0, 110);
  return null;
}

// ── Mekanismer → bevisdelsträngar i respektive logg ─────────────────────────
const mekanismer = [
  {
    namn: "Web-vakten (502 → pm2-restart)",
    logg: "hjartslag.log",
    bevis: "WEB-VAKT: appen",
  },
  {
    namn: "Zombie-måls-väckaren (sovande loop → kick)",
    logg: "hjartslag.log",
    bevis: "ZOMBIE-MÅL: målet finns",
  },
  {
    namn: "Mål-återställning (borttappat mål → malSatt)",
    logg: "hjartslag.log",
    bevis: "MÅL återställt",
  },
  {
    namn: "Kilad turn → omstart (studsade kickar)",
    logg: "hjartslag.log",
    bevis: "SJÄLVHEALNING",
  },
  {
    namn: "Hjärt-kick (stillastående → arbete)",
    logg: "hjartslag.log",
    bevis: "HJÄRTSLAG: kickar",
  },
  {
    namn: "Automatdeploy (ny kod → byggt + 200)",
    logg: "prod-synk.log",
    bevis: "DEPLOYAD automatiskt",
  },
  {
    namn: "Bygg-stoppregler (revert vid felbygge)",
    logg: "prod-synk.log",
    bevis: "revert",
  },
  {
    namn: "Bygg-låset (flock serialiserar)",
    logg: "prod-synk.log",
    bevisDel: ["NY KOD"],
    bevis: "NY KOD",
  },
  {
    namn: "Vakt-larm (fynd → agentens kö)",
    logg: "cron-ut.log",
    bevis: "LARMAT",
  },
  {
    namn: "Rondpunktlighet (schema = klockan)",
    logg: "styrelse-rond.log",
    bevis: "ROND skickad: OK",
  },
];

const rader = [];
const nu = new Date().toISOString().slice(0, 19);
let bevisade = 0;
for (const m of mekanismer) {
  const loggRader = las(path.join(VAKT, m.logg));
  const rad = sist(loggRader, m.bevis);
  if (rad) {
    bevisade++;
    rader.push(`✅ BEVISAD — ${m.namn}\n   ${rad}`);
  } else {
    rader.push(`⚠️ OEVD (ej bevisad i verkligheten) — ${m.namn} — överväg kontrollerad övning`);
  }
}

const samman = `DR-RAPPORT ${nu}: ${bevisade}/${mekanismer.length} återhämtningsvägar BEVISADE i verkligheten`;
const rapport = [`# Organism-DR — bevisbaserad katastrofövning`, "", samman, "", ...rader, ""].join("\n");

fs.mkdirSync(VAKT, { recursive: true });
fs.writeFileSync(path.join(VAKT, "dr-rapport.md"), rapport);
fs.appendFileSync(path.join(VAKT, "dr-logg.txt"), `${nu} ${samman}\n`);

console.log(samman);
rader.forEach((r) => console.log(" " + r.split("\n")[0]));
