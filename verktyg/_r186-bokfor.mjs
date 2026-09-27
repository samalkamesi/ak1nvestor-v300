// rond 186 (omkörning): ENBART git-leveransen — worklog/beslutsminne är redan appenderade (förra skriptet dog på gitadd, EFTER appenderna)
import { execFileSync as run } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
const CWD = "/home/ak1a/agent/ak1";
// sanity: worklog bär exakt EN rond 186-rad (dubbelappend-skydd)
const wl = readFileSync(CWD + "/worklog.md", "utf8");
const antal = (wl.match(/ROND 186 \[organ:Φ\]/g) || []).length;
if (antal !== 1) { console.error("AVBRYTER: worklog bär " + antal + " rond 186-rader (väntat 1)"); process.exit(1); }
run("git", ["add", "worklog.md",
  "verktyg/_r185-drift.mjs", "verktyg/_r185-merge.mjs", "verktyg/_r185-merge2.mjs", "verktyg/_r185-vanta.mjs",
  "verktyg/_r186-verifiera.mjs", "verktyg/_r186-bokfor.mjs"], { cwd: CWD, encoding: "utf8" });
const ut = run("git", ["commit", "-F", "/tmp/r186-commitmsg.txt"], { cwd: CWD, encoding: "utf8" });
const push = run("git", ["push", "prod", "develop"], { cwd: CWD, encoding: "utf8" });
const head = run("git", ["rev-parse", "--short", "HEAD"], { cwd: CWD, encoding: "utf8" }).trim();
const status = run("git", ["status", "--porcelain"], { cwd: CWD, encoding: "utf8" }).trim();
writeFileSync("/tmp/r186-kvitto.txt",
  "COMMIT: " + ut.trim().split("\n")[0] + "\nHEAD: " + head + "\nPUSH: " + push.trim() + "\nSTATUS EFTER:\n" + (status || "(rent)") + "\n");
console.log("LEVERERAD HEAD=" + head);
