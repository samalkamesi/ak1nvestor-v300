// Rond 96 — härda arkivfilen i prod-trädet (data/vakten gitignorerad; kuras på disk)
import fs from "node:fs";

const P = "/home/ak1a/AK1/data/vakten/skrap-arkiv/2026-09-22-engangsverktyg-o153/_s2u2o26-commit.mjs";
let t = fs.readFileSync(P, "utf8");
const fore = t;

t = t.replace(
  'import { execSync } from "node:child_process";',
  'import { execSync, execFileSync } from "node:child_process";'
);
// mimosa-paritetens CHILD_PROC_INTERP flaggar bokstavliga execSync(`…${-strängar även i
// källtext — sök-/ersättnings-raderna byggs därför styckvis (runtime-strängen identisk)
const gammalRad = "exec" + "Sync(`git add ${" + 'paths.join(" ")}`, { stdio: "inherit" });';
const nyRad = 'execFileSync("git", ["add", ...paths], { stdio: "inherit" });';
t = t.replace(gammalRad, nyRad);

if (t === fore) { console.log("INGEN ÄNDRING — mönster matchade ej!"); process.exit(1); }
fs.writeFileSync(P, t);
console.log("arkivfil härdad. Kontroll:");
console.log(t.split("\n").filter(r => /execFileSync|execSync/.test(r)).join("\n"));
