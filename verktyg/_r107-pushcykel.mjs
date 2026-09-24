#!/usr/bin/env node
// ROND 107 — push-cykel: fetch, merge (om det behövs), push — ett steg, loggat.
import { execFileSync } from "node:child_process";
const git = (args) => execFileSync("git", args, { encoding: "utf8", timeout: 60_000 });
const lokal = git(["rev-parse", "--short", "HEAD"]).trim();
let prodHead = "(okänd)";
try { prodHead = git(["rev-parse", "--short", "prod/develop"]).trim(); } catch { /* ej hämtad */ }
console.log("före: lokal", lokal, "· prod/develop-ref", prodHead);
console.log(git(["fetch", "prod"]).trim() || "fetch tyst");
const efterFetch = git(["rev-parse", "--short", "prod/develop"]).trim();
const anfader = (() => {
  try { execFileSync("git", ["merge-base", "--is-ancestor", "prod/develop", "HEAD"], { stdio: "pipe", timeout: 30_000 }); return true; } catch { return false; }
})();
console.log("efter fetch: prod/develop =", efterFetch, "· prod ⊆ lokal:", anfader);
if (!anfader) {
  console.log(git(["merge", "--no-edit", "prod/develop"]).trim());
}
console.log(git(["push", "prod", "develop"]).trim() || "push tyst");
console.log("slut: lokal", git(["rev-parse", "--short", "HEAD"]).trim());
