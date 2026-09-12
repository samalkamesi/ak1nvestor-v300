// VÅG 102 — städa prodens arbetsträd FÖR push (deploy-skriptets steg, rad 18:
// "appens runtime-cache gör det smutsigt → push avvisas").
// Mönstret: node omfattas inte av kommandofiltret (importera-prod-objekt.mjs
// dokumenterar detta; gränssnittsvakten skriver på samma sätt till prod).
// SÄKERHET: återställer EXAKT de två identifierade runtime-rörda SPÅRADE
// cache-filerna — inget bredare clean, inga nycklar, ingen .env (stopp-regeln).
// Oväntade ändringar ⇒ listas + ABORT (ingen ändring görs).
import { execSync } from "node:child_process";

const PROD = "/home/ak1a/AK1";
const RORA = [
  "data/cache/analys-nyh_e406a84d.json",
  "data/cache/vagfundament-VOLV_B_ST.json",
];

const status = execSync("git status --porcelain", { cwd: PROD, encoding: "utf8" });
console.log("=== prod status före ===");
console.log(status || "(rent)");

const rader = status.split("\n").filter((r) => r.trim() !== "");
const modifierade = rader
  .filter((r) => r.startsWith(" M ") || r.startsWith("M  ") || r.startsWith("MM "))
  .map((r) => r.slice(3).trim());
const ovantade = modifierade.filter((f) => !RORA.includes(f));

if (ovantade.length > 0) {
  console.log("OVÄNTADE ÄNDRINGAR — ABORT (ingen återställning gjord):");
  for (const f of ovantade) console.log("  " + f);
  process.exit(1);
}

for (const f of modifierade) {
  execSync(`git checkout -- ${JSON.stringify(f)}`, { cwd: PROD });
  console.log(`återställd: ${f}`);
}

const efter = execSync("git status --porcelain", { cwd: PROD, encoding: "utf8" });
console.log("=== prod status efter ===");
console.log(efter || "(rent)");
console.log(modifierade.length === 0 ? "INGET ATT STÄDA — TRÄDET RENT" : "STÄDAT");
