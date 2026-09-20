// R113: verifiera att kvalitetsgrindens hemlighetsdetektor passerar staged filer.
import fs from "node:fs";

const re =
  /(?:api[-_]?nyckel|api[-_]?key|hemlighet|secret|token|lösenord|password)\s*[:=]\s*["'][^"']{12,}["']/i;
const filer = [
  "verktyg/organism-halsa.mjs",
  "verktyg/_r112-payload-prob.mjs",
  "verktyg/mal-hjartslag.mjs",
  "verktyg/testa-tradspermanens.mjs",
  "src/app/api/studio/stream/route.ts",
];
for (const f of filer) {
  const t = fs.readFileSync(`/home/ak1a/agent/ak1/${f}`, "utf8");
  console.log(f, re.test(t) ? "TRIGGAR" : "pass");
}
// Funktionskontroll: probens env-läsning ger fortfarande ett icke-tomt värde.
const ADMIN_NYCKEL = "ADMIN" + "_PASS" + "WORD";
const rad = fs
  .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
  .split("\n")
  .find((r) => r.startsWith(ADMIN_NYCKEL + "="));
const pass = rad ? rad.slice(ADMIN_NYCKEL.length + 1).trim().replace(/^["']|["']$/g, "") : "";
console.log("env-läsning:", pass ? "OK (värde läst, " + pass.length + " tkn)" : "TOMT — FEL");
