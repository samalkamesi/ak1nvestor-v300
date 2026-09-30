// v215-push: fetch prod → merge FETCH_HEAD → push prod develop (node-kanal)
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = "/tmp/v215-push.log";
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => {
  fs.appendFileSync(LOGG, s + "\n");
  console.log(s);
};

const steg = [
  ["fetch", ["fetch", "prod"]],
  ["merge", ["merge", "--no-edit", "-m", "merge: prod -> develop — v215 (fabriksbarn cce1e314 inhämtat)", "FETCH_HEAD"]],
  ["push", ["push", "prod", "develop"]],
];

for (const [namn, args] of steg) {
  try {
    const ut = execFileSync("git", args, { encoding: "utf8", timeout: 120_000, cwd: ROT });
    logga(`${namn} OK: ${ut.trim().slice(0, 500)}`);
  } catch (e) {
    logga(`${namn} FEL: ${String(e.message).slice(0, 300)}`);
    logga(`stdout: ${String(e.stdout || "").slice(0, 400)}`);
    logga(`stderr: ${String(e.stderr || "").slice(0, 400)}`);
    process.exit(1);
  }
}
logga("KLAR — develop pushad till prod");
