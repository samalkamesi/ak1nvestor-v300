// v359-push: felsök + push mot prod (explicit ref, merge-bas-diagnos)
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const LOGG = "/tmp/v359-push.log";
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };
const kör = (namn, args, tidsgrans = 120_000) => {
  try {
    const ut = execFileSync("git", args, { encoding: "utf8", timeout: tidsgrans, cwd: ROT });
    logga(`${namn} OK: ${ut.trim().slice(0, 400)}`);
    return true;
  } catch (e) {
    logga(`${namn} FEL: ${String(e.message).slice(0, 250)}`);
    logga(`  stderr: ${String(e.stderr || "").slice(0, 400)}`);
    return false;
  }
};

// Diagnos först
kör("FETCH_HEAD-innehåll", ["--no-pager", "log", "-1", "--format=%h %s", "FETCH_HEAD"]);
kör("prod/develop", ["--no-pager", "log", "-1", "--format=%h %s", "prod/develop"]);
kör("HEAD", ["--no-pager", "log", "-1", "--format=%h %s", "HEAD"]);
kör("merge-base", ["--no-pager", "merge-base", "HEAD", "prod/develop"]);

// Fetch (färskt) + merge explicit mot prod/develop
if (kör("fetch", ["fetch", "prod"])) {
  kör("merge", ["merge", "--no-edit", "-m", "merge: prod -> develop — r359 (fabrikens zcode-100x inhämtad)", "prod/develop"]);
  kör("push", ["push", "prod", "develop"]);
}
logga("SLUT");
