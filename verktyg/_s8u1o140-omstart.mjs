#!/usr/bin/env node
// o140 (s8-u1): samordnad omstart av ak1a-pumpor — aktiverar tick-mätningen.
// Doktrin V216 (EN ägare per omstart) följd manuellt för daemonen:
//   1. deploy-grind: flock /tmp/ak1a-deploy.lock FÖRST (deploybygget äger pm2).
//   2. journal FÖRE pm2-anropet (annan kanal < 3 min ⇒ vägra).
//   3. pm2 i execFileSync-arrayform (o116 K2-mall).
//   4. tyst minut: :x2/:x3/:x6 (aldrig :x1/:x4/:x5/:x7/:x8/:x9/:x0-sloten).
//   5. live-bevis: ny start-rad + TICK-MÄTNING-aktiv-rad + nästa organ-rop.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { deployPagar, JOURNAL_SOKVAG } from "./omstart-samordning.mjs";

const KANAL = "s8-u1-o140-tick-installation";
const ORSAK = "o140 aktiverar tick-mätningen i pumpor-daemonen (o136 §6.3)";
const LOGG = "/home/ak1a/.pm2/logs/ak1a-pumpor-out.log";
const TYSTA_MINUTER = new Set([2, 3, 6]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. deploy-grind
if (deployPagar()) {
  console.log("AVBRUTEN: deploy pågår (flock hålls) — vänta 3 min, försök igen");
  process.exit(3);
}

// 2. journalkontroll (V216: annan kanal inom 3 min vägras)
let senaste = null;
try { senaste = JSON.parse(readFileSync(JOURNAL_SOKVAG, "utf8")); } catch { /* första */ }
const alder = senaste ? Date.now() - senaste.ts : Infinity;
if (senaste && alder < 3 * 60_000 && senaste.kanal !== KANAL) {
  console.log(`AVBRUTEN: ${senaste.kanal} omstartade för ${Math.round(alder / 1000)} s sedan`);
  process.exit(4);
}
console.log(`Journal-föregångare: ${senaste ? senaste.kanal + " (" + Math.round(alder / 1000) + " s sedan)" : "ingen"} — OK`);

// 3. vänta in tyst minut (max ~70 s)
for (let forsok = 0; forsok < 8; forsok++) {
  const min = new Date().getMinutes() % 10;
  if (TYSTA_MINUTER.has(min)) break;
  console.log(`Minut :x${min} är roptung — väntar 10 s på tyst minut`);
  await sleep(10_000);
}
const min = new Date().getMinutes() % 10;
if (!TYSTA_MINUTER.has(min)) {
  console.log(`AVBRUTEN: ingen tyst minut inom taket (nu :x${min})`);
  process.exit(6);
}
console.log(`Tyst minut :x${min} — startar`);

// 4. journal FÖRE pm2 (V216-ordningen)
writeFileSync(JOURNAL_SOKVAG, JSON.stringify({ kanal: KANAL, orsak: ORSAK.slice(0, 120), ts: Date.now() }) + "\n");
const foreLangd = readFileSync(LOGG, "utf8").split("\n").length;

// 5. pm2 restart i arrayform
try {
  execFileSync("pm2", ["restart", "ak1a-pumpor", "--update-env"], { timeout: 90_000, stdio: "ignore" });
  console.log("PM2 RESTART ak1a-pumpor OK");
} catch (e) {
  console.log(`PM2-FEL: ${String(e?.message || e).slice(0, 200)}`);
  process.exit(5);
}

// 6. live-bevis: start-rad + TICK-MÄTNING-rad + nästa rop (automation-motor ≤ ~65 s)
const start = Date.now();
let sawStart = false, sawTickAktiv = false, sawRop = false, tickSvalt = [];
for (let i = 0; i < 30 && !(sawStart && sawTickAktiv && sawRop); i++) {
  await sleep(5_000);
  const rader = readFileSync(LOGG, "utf8").split("\n").slice(foreLangd - 1);
  sawStart ||= rader.some((r) => /PUMPOR-DAEMONEN.*startar/.test(r));
  sawTickAktiv ||= rader.some((r) => /TICK-MÄTNING aktiv/.test(r));
  sawRop ||= rader.some((r) => /▶ automation-motor/.test(r));
  tickSvalt = rader.filter((r) => r.includes("TICK-SVÄLT"));
}
const sek = Math.round((Date.now() - start) / 1000);
console.log(`BEVIS efter ${sek} s: start-rad=${sawStart} · TICK-MÄTNING-aktiv=${sawTickAktiv} · nytt-rop=${sawRop} · TICK-SVÄLT-rader=${tickSvalt.length}`);
if (!(sawStart && sawTickAktiv && sawRop)) process.exit(7);
console.log("LIVE-AKTIVERING KLAR — instrumentet andas i prod-daemonen");
