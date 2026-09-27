// rond 185: sondera prod-trädets nya commits (push avvisad — fetch först)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const REPO = "/home/ak1a/agent/ak1";
const ut = [];
function git(args, tak = 60000) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", timeout: tak });
}
ut.push("FETCH: " + git(["fetch", "prod", "develop"]).trim());
ut.push("--- SAKNADE COMMITS (HEAD..prod/develop) ---");
ut.push(git(["log", "--oneline", "HEAD..prod/develop"]).trim());
ut.push("--- VÅRA COMMITS EJ I PROD (prod/develop..HEAD) ---");
ut.push(git(["log", "--oneline", "prod/develop..HEAD"]).trim());
ut.push("--- ÄNDRADE FILER I SAKNADE ---");
ut.push(git(["diff", "--stat", "HEAD...prod/develop"]).trim());
writeFileSync("/tmp/v185-sond.txt", ut.join("\n") + "\n");
console.log("SONDERAD");
