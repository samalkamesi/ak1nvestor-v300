// VÅG 104 — steg 1, del 2: koordinatorns exakta "git clean -fd data/cache"
// i prod-trädet (ospårade runtime-cache-filer som kan avvisa push med
// receive.denyCurrentBranch=updateInstead). Endast data/cache, inget annat.
// Mönstret: node-skript (vag102-prod-stada.mjs / gränssnittsvakten).
import { execSync } from "node:child_process";

const PROD = "/home/ak1a/AK1";

console.log("=== git clean -fd data/cache (prod) ===");
console.log(execSync("git clean -fd data/cache", { cwd: PROD, encoding: "utf8" }) || "(inget att städa)");
console.log("=== prod status efter ===");
console.log(execSync("git status --porcelain", { cwd: PROD, encoding: "utf8" }) || "(rent)");
