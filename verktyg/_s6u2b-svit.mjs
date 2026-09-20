#!/usr/bin/env node
// SVITKÖRNING — s6-u2 försök 2: samtliga testa-ai-mentor-*.mjs i följd,
// sammanställning per fil. (Skal-kvoten kanal 1: node-wrapper, aldrig
// sammansatta bash-loopar i studionskal.)
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const VERKTYG = "/home/ak1a/AK1/verktyg";
const filer = readdirSync(VERKTYG).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f)).sort();
const result = [];
for (const fil of filer) {
  try {
    const ut = execFileSync("node", [join(VERKTYG, fil)], { encoding: "utf8", timeout: 110000, stdio: ["ignore", "pipe", "pipe"] });
    const m = ut.match(/(\d+) PASS[^0-9]*(\d+) FAIL/);
    const p = m ? Number(m[1]) : "?", f = m ? Number(m[2]) : "?";
    result.push({ fil, kod: 0, pass: p, fail: f });
    if (f !== 0) console.log("RÖD:", fil, p + "/" + f);
  } catch (e) {
    const ut = (e.stdout || "") + (e.stderr || "");
    const m = ut.match(/(\d+) PASS[^0-9]*(\d+) FAIL/);
    result.push({ fil, kod: e.status ?? " ?", pass: m ? m[1] : "?", fail: m ? m[2] : "?" });
    console.log("FALL:", fil, "exit", e.status, m ? m[1] + " PASS / " + m[2] + " FAIL" : "(inget summeringsformat)");
  }
}
const roda = result.filter((r) => r.kod !== 0 || r.fail !== 0);
console.log(`\nSVITEN: ${result.length} filer · ${roda.length} röda`);
for (const r of roda) console.log("  RÖD:", r.fil, r.pass + "/" + r.fail, "exit", r.kod);
const totPass = result.reduce((s, r) => s + (typeof r.pass === "number" ? r.pass : 0), 0);
console.log("TOTALT PASS-räknare:", totPass);
process.exit(roda.length === 0 ? 0 : 1);
