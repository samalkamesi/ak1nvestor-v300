// Rond 96 — verifieringskedja: arkivkur + syntaxkontroll x6 + mimosa-snabbprob
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ARKIV = "/home/ak1a/AK1/data/vakten/skrap-arkiv/2026-09-22-engangsverktyg-o153/_s2u2o26-commit.mjs";

// 1. arkivkur (idempotent)
let t = fs.readFileSync(ARKIV, "utf8");
const fore = t;
t = t.replace('import { execSync } from "node:child_process";', 'import { execSync, execFileSync } from "node:child_process";');
t = t.replace('execSync(`git add ${paths.join(" ")}`, { stdio: "inherit" });', 'execFileSync("git", ["add", ...paths], { stdio: "inherit" });');
if (t !== fore) { fs.writeFileSync(ARKIV, t); console.log("arkivkur: SKREV härdning"); }
else {
  const har = fs.readFileSync(ARKIV, "utf8");
  console.log("arkivkur:", har.includes('execFileSync("git", ["add"') ? "redan härdat" : "FEL — mönster matchade ej");
}

// 2. syntaxkontroll x6
const filer = [
  ARKIV,
  "/home/ak1a/agent/ak1/verktyg/_r147-dod.mjs",
  "/home/ak1a/agent/ak1/verktyg/_r147-omstart.mjs",
  "/home/ak1a/agent/ak1/verktyg/_r153-dod-sond.mjs",
  "/home/ak1a/agent/ak1/verktyg/_s1u2-wihlborgs-q3-kontroll.mjs",
  "/home/ak1a/agent/ak1/verktyg/_s7u2o139efter-kor.mjs",
];
let allaOk = true;
for (const f of filer) {
  try {
    execFileSync("node", ["--check", f], { timeout: 30000 });
    console.log("SYNTAX OK:", f);
  } catch (e) {
    allaOk = false;
    console.log("SYNTAX FEL:", f, String(e.stderr || e.message).slice(0, 200));
  }
}

// 3. mimosa-snabbprob mot de 6 filerna (verktyget finns i prod)
console.log("\n=== MIMOSA PROB (prod-trädets verktyg) ===");
try {
  const ut = execFileSync("node", ["/home/ak1a/AK1/verktyg/mimosa-paritet.mjs", "--hjalp"], { cwd: "/home/ak1a/AK1", timeout: 30000, encoding: "utf8" }).slice(0, 400);
  console.log(ut);
} catch (e) {
  console.log("(--hjalp saknas kanske:", String(e.stderr || e.message).slice(0, 150) + ")");
}

console.log("\nALLA SYNTAX OK:", allaOk);
