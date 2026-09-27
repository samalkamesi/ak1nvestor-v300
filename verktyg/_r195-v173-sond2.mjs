#!/usr/bin/env node
/**
 * _r195-v173-sond2.mjs — v173 dataset-djup (rond 195): sond innan leverans.
 * (1) hitta llms-regen-mall med GENERISK CAGR-rad (slug-parametriserad —
 *     diskens sektion bär CAGR-rader för ALLA tio branscher, men omg29/v209u3-
 *     kropparna specialfäller bara finans; okritisk kopiering skulle radera 9 rader),
 * (2) mäta aktuell sektion (radantal + etiketter),
 * (3) läsa Kao 4452.T som Japan/konsument-fältstrukturmall,
 * (4) konstatera 4661.T-läget.
 * Kvitto: /tmp/r195-cagrmall.txt
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const ut = [];
for (const f of readdirSync("verktyg")) {
  if (!/llms-regen\.mjs$/.test(f)) continue;
  const t = readFileSync("verktyg/" + f, "utf8");
  if (/resultat-cagr-5ar/.test(t) && /dataset\/\$\{slug\}\/resultat-cagr/.test(t))
    ut.push("GENERISK-CAGR-MALL: " + f);
}

const txt = readFileSync("public/llms.txt", "utf8").split("\n");
const s = txt.findIndex((r) => r === "## Dataset — branschmedianer");
const e = txt.findIndex((r, i) => i > s && r.startsWith("## "));
ut.push("sektion rader " + s + "–" + e + " = " + (e - s) + " rader");
txt.slice(s, e).forEach((r, i) => { if (r.startsWith("- [")) ut.push("  " + i + ": " + r.slice(0, 110)); });

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const kao = u.find((b) => b.ticker === "4452.T");
ut.push("--- KAO 4452.T nycklar: " + Object.keys(kao).join(","));
ut.push(JSON.stringify({
  tillvaxt: kao.tillvaxt, lonksamhet: kao.lonksamhet, stabilitet: kao.stabilitet,
  aterkop: kao.aterkop, moat: kao.moat, vardering: kao.vardering, golv: kao.golv,
  serier: kao.serier, pris: kao.pris, marknadsKapitalMdr: kao.marknadsKapitalMdr, hamtat: kao.hamtat,
}, null, 1).slice(0, 2600));
ut.push("--- antal: " + u.length + " | konsument: " + u.filter((b) => b.bransch === "konsument").length + " | 4661.T finns: " + u.some((b) => b.ticker === "4661.T"));

writeFileSync("/tmp/r195-cagrmall.txt", ut.join("\n"));
console.log("OK skrev /tmp/r195-cagrmall.txt (" + ut.length + " rader)");
