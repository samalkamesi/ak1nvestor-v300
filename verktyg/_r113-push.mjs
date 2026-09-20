// ROND 113: push-only vänteloop (committen finns lokalt — bara push saknas;
// prod-trädet spärrat av fabriksbarns pågående leverans).
// o123: execSync-strängform → execFileSync-array (K2-mall; ofarliga literaler
// men doktrinen mäter FORM — mimosa v1.6 synliggjorde glidningen).
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const ROTA = "/home/ak1a/agent/ak1";
const LOGG = `${ROTA}/data/vakten/r113-commit.log`;
const rad = (s) => appendFileSync(LOGG, s + "\n", "utf8");

rad(`─── R113 push-only ${new Date().toISOString()} ───`);
for (let forsok = 1; forsok <= 20; forsok++) {
  try {
    const ut = execFileSync("git", ["push", "prod", "develop"], { cwd: ROTA, encoding: "utf8", timeout: 120_000 });
    rad("PUSH GRÖN (push-only)\n" + ut.slice(0, 300));
    process.exit(0);
  } catch (e) {
    rad(`push avvisad (only ${forsok}/20): ${String(e.message ?? e).split("\n")[0].slice(0, 120)}`);
  }
  try {
    execFileSync("git", ["fetch", "prod", "develop"], { cwd: ROTA, encoding: "utf8", timeout: 120_000 });
    execFileSync("git", ["merge", "prod/develop", "--no-edit"], { cwd: ROTA, encoding: "utf8", timeout: 180_000 });
  } catch {
    /* merge av scen: redan uppdaterad */
  }
  await new Promise((r) => setTimeout(r, 60_000));
}
rad("PUSH VÄNTAR FORTARANDE efter 20 försök — nästa iteration tar cykeln");
