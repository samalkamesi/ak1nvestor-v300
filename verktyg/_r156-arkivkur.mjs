// Rond 96 — härda arkivfilen i prod-trädet (data/vakten gitignorerad; kuras på disk)
import fs from "node:fs";

const P = "/home/ak1a/AK1/data/vakten/skrap-arkiv/2026-09-22-engangsverktyg-o153/_s2u2o26-commit.mjs";
let t = fs.readFileSync(P, "utf8");
const fore = t;

t = t.replace(
  'import { execSync } from "node:child_process";',
  'import { execSync, execFileSync } from "node:child_process";'
);
t = t.replace(
  'execSync(`git add ${paths.join(" ")}`, { stdio: "inherit" });',
  'execFileSync("git", ["add", ...paths], { stdio: "inherit" });'
);

if (t === fore) { console.log("INGEN ÄNDRING — mönster matchade ej!"); process.exit(1); }
fs.writeFileSync(P, t);
console.log("arkivfil härdad. Kontroll:");
console.log(t.split("\n").filter(r => /execFileSync|execSync/.test(r)).join("\n"));
