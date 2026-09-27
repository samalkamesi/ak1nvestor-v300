#!/usr/bin/env node
/** _r226-vaktstatus.mjs — läs senaste kvalitetsrapporten + gränssnittsvaktens status (E35-spåret). */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const filer = readdirSync("data/rapporter").filter((f) => f.startsWith("kvalitetsrapport")).sort();
console.log("kvalitetsrapporter (senaste 3): " + filer.slice(-3).join(", "));
const senast = filer[filer.length - 1];
if (senast) {
  const txt = readFileSync(join("data/rapporter", senast), "utf8");
  console.log("--- " + senast + " (första 80 rader) ---");
  console.log(txt.split("\n").slice(0, 80).join("\n"));
}
