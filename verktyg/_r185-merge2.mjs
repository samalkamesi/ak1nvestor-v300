// rond 185: merge prod/develop (fas-sync-fix) + push + byggstatus-sond
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { statSync } from "node:fs";
const REPO = "/home/ak1a/agent/ak1";
const ut = [];
function git(args, tak = 300000) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", timeout: tak });
}
function steg(namn, fn) {
  try { ut.push(`${namn}: OK ${String(fn()).trim().slice(0, 300)}`); return true; }
  catch (e) { ut.push(`${namn}: FEL ${String(e.stderr || e.message).slice(0, 800)}`); return false; }
}
steg("MERGE", () => git(["merge", "prod/develop", "-m", "merge: emottag prod — fas-sync-fix 9726a9bd (member_type följer med inloggning) + v170-kurerna 9961cfc2"]));
if (ut.some(r => r.startsWith("MERGE: FEL"))) {
  writeFileSync("/tmp/v185-merge.txt", ut.join("\n") + "\n"); console.log("FEL-VID-MERGE"); process.exit(1);
}
steg("PUSH", () => git(["push", "prod", "develop"], 120000));
steg("HASH", () => git(["rev-parse", "--short", "HEAD"]));
try {
  const s = statSync("/home/ak1a/AK1/.next/BUILD_ID");
  ut.push("BUILD_ID-prod: " + s.mtime.toISOString());
} catch (e) { ut.push("BUILD_ID-prod: oläslig " + e.message.slice(0, 80)); }
writeFileSync("/tmp/v185-merge.txt", ut.join("\n") + "\n");
console.log("LEVERERAD");
