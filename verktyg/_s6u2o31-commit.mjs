/**
 * COMMIT-SEKVENS (s6-u2, fönster 31) — worklog-append + git add + git
 * commit -F i EN node-process (SKAL-KVOTEN: undvik sammansatta shell-
 * kommandon; -F-mönstret för långa meddelanden).
 */
import { appendFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// 1. Worklog-append (konventionen: append i slutet, syskon skriver parallellt)
const worklog = readFileSync(join(HÄR, "_s6u2o31-worklog.txt"), "utf8");
appendFileSync(join(ROT, "worklog.md"), worklog);
console.log("worklog: appenderad (" + worklog.length + " tecken)");

// 2. Git add — MINA filer + de bärande konvergensfilerna (ride-alang-precedensen)
const FILER = [
  "src/lib/ai-mentor-casepraktik-fragor.ts",
  "src/components/ak1a/chat-widget.tsx",
  "verktyg/testa-ai-mentor-casepraktik.mjs",
  "verktyg/testa-ai-mentor-kedja.mjs",
  "verktyg/testa-ai-mentor-case.mjs",
  "src/lib/ai-mentor-stalsektor-fragor.ts",
  "verktyg/testa-ai-mentor-stalsektor.mjs",
  "src/lib/ai-mentor-beteendefallor-fragor.ts",
  "data/vakten/auto-s6-1789965330060-s6-u2-ansprak.md",
  "worklog.md",
];
execFileSync("git", ["add", ...FILER], { cwd: ROT, stdio: "inherit" });
console.log("git add: " + FILER.length + " filer");

// 3. Commit med -F (pre-commit-kedjan: tsc + nyckelvakt — ALDRIG --no-verify)
execFileSync("git", ["commit", "-F", join(HÄR, "_s6u2o31-commitmsg.txt")], { cwd: ROT, stdio: "inherit" });

// 4. Bevis
const hash = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROT }).toString().trim();
console.log("COMMIT: " + hash);
