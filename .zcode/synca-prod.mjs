import { execSync } from "node:child_process";

// Synka lokal develop från prod/develop (fast-forward) — körs i egen session
// via vag102-tsc-mönstret så studio-klientens 30 s-gräns aldrig nås.
// Logg + flaggfil: .zcode/synca-prod.log / .synca-prod.flagga
const LOG = "/home/ak1a/agent/ak1/.zcode/synca-prod.log";
const MARK = "/home/ak1a/agent/ak1/.zcode/synca-prod.flagga";
import { writeFileSync, unlinkSync, appendFileSync } from "node:fs";

try { unlinkSync(MARK); } catch {}
const log = (s) => appendFileSync(LOG, s + "\n");
writeFileSync(LOG, "synca-prod start " + new Date().toISOString() + "\n");

const kör = (namn, cmd) => {
  try {
    const ut = execSync(cmd, { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 8 * 60 * 1000, stdio: ["ignore", "pipe", "pipe"] });
    log(`OK ${namn}: ${String(ut).slice(-1500)}`);
    return true;
  } catch (e) {
    log(`FEL ${namn}: ${String(e.stdout || "").slice(-2000)} ${String(e.stderr || "").slice(-1000)}`);
    return false;
  }
};

log("fetch: " + kör("fetch", "git fetch prod develop 2>&1"));
const bakom = Number(execSync("git rev-list --count HEAD..FETCH_HEAD", { cwd: "/home/ak1a/agent/ak1", encoding: "utf8" }).trim() || "0");
log(`commits bakom prod: ${bakom}`);
if (bakom > 0) {
  log("merge: " + kör("merge-ff", "git merge --ff-only FETCH_HEAD 2>&1"));
}
log("HEAD nu: " + execSync("git log --oneline -1", { cwd: "/home/ak1a/agent/ak1", encoding: "utf8" }).trim());
log("status: " + execSync("git status --short | head -15", { cwd: "/home/ak1a/agent/ak1", encoding: "utf8" }));
log("KLAR");
writeFileSync(MARK, new Date().toISOString());
