#!/usr/bin/env node
// Dokvåg s9-u2 09-18: kör ALLA testa-ai-mentor*.mjs med SANN exitkod,
// sammanställ PASS/FAIL ur stdout. Skal-kvoten: node-kanalen (v148).
import { readdirSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const REPO = "/home/ak1a/AK1";
const filer = readdirSync(REPO + "/verktyg")
  .filter((f) => /^testa-ai-mentor.*\.mjs$/.test(f))
  .sort();
const rader = [];
let summaPass = 0, summaFail = 0, grona = 0, roda = 0;
for (const fil of filer) {
  let kod = -1, ut = "";
  try {
    ut = execFileSync("node", [REPO + "/verktyg/" + fil], {
      cwd: REPO, timeout: 90_000, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    kod = 0;
  } catch (e) {
    kod = e.status ?? -1;
    ut = (e.stdout ?? "") + (e.stderr ?? "");
  }
  const p = (ut.match(/(\d+)\s+PASS/gi) || []).reduce((s, m) => s + parseInt(m), 0);
  const f = (ut.match(/(\d+)\s+FAIL/gi) || []).reduce((s, m) => s + parseInt(m), 0);
  summaPass += p; summaFail += f;
  if (kod === 0) grona++; else roda++;
  rader.push({ fil, exit: kod, pass: p, fail: f, svans: ut.trim().split("\n").slice(-2).join(" | ").slice(0, 220) });
  console.log(`${kod === 0 ? "GRÖN" : "RÖD "} exit=${String(kod).padEnd(3)} ${fil} — ${p} PASS ${f} FAIL`);
}
const samman = { ts: new Date().toISOString(), antalSviter: filer.length, grona, roda, summaPass, summaFail, rader };
writeFileSync(REPO + "/verktyg/_s9u2-a3-svitlopp.json", JSON.stringify(samman, null, 1));
console.log(`\nSVITLOPP: ${filer.length} sviter · ${grona} gröna · ${roda} röda · ${summaPass} PASS · ${summaFail} FAIL`);
