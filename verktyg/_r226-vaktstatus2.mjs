#!/usr/bin/env node
/** _r226-vaktstatus2.mjs — läs PROD-trädets senaste kvalitetsrapport (E35-spåret). */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = "/home/ak1a/AK1/data/rapporter";
const filer = readdirSync(dir).filter((f) => f.includes("kvalitet") || f.includes("granssnitt")).sort();
console.log("prod-rapporter: " + filer.slice(-5).join(", "));
for (const f of filer.slice(-2)) {
  const txt = readFileSync(join(dir, f), "utf8");
  const rader = txt.split("\n");
  console.log("--- " + f + " (" + rader.length + " rader) ---");
  console.log(rader.slice(0, 12).join("\n"));
  const fel = rader.filter((r) => /RÖD|FEL|✗|gap|E35/i.test(r)).slice(0, 15);
  console.log("… fyndrader: " + (fel.join("\n") || "inga"));
}
