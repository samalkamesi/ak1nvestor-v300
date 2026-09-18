#!/usr/bin/env node
/** Väntar på att prod-synken deployar nytt bygge (BUILD_ID byte), max 18 min. */
import { readFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/.next/BUILD_ID";
const GAMAL = readFileSync(FIL, "utf8").trim();
const start = Date.now();
console.log("Väntar på deploy; gammalt BUILD_ID =", GAMAL);

await new Promise((res) => {
  const iv = setInterval(() => {
    let nu = "";
    try { nu = readFileSync(FIL, "utf8").trim(); } catch { /* bygger pågående */ }
    if (nu && nu !== GAMAL) {
      console.log("NYTT BUILD_ID =", nu, "efter", Math.round((Date.now() - start) / 1000), "s");
      clearInterval(iv);
      res();
    } else if (Date.now() - start > 18 * 60_000) {
      console.log("TIMEOUT efter 18 min — inget nytt bygge landade");
      clearInterval(iv);
      res();
    }
  }, 5000);
});
