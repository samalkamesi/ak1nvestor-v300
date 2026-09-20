#!/usr/bin/env node
/** V217 — bevis: RAM-väktaren avlivar svitträdet, aggregatern överlever. */
import { copyFileSync, existsSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const SENASTE = ROTA + "/data/vakten/testaggregator-SENASTE.md";
const BACKUP = "/tmp/_v217-senaste-backup.md";

// 1. backa SENASTE-rapporten (beviskörningen får inte förstöra senaste svepet)
if (existsSync(SENASTE)) copyFileSync(SENASTE, BACKUP);

// 2. kör aggregern mot OFFRET med omöjligt hög krit-tröskel ⇒ vakten eldar
const r = spawnSync(
  process.execPath,
  [ROTA + "/verktyg/kor-alla-tester.mjs", "--mönster=^testa-v217-ramvakt-offer\\.mjs$"],
  {
    cwd: ROTA,
    env: { ...process.env, AK1A_RAM_KRIT_MB: "9000", NO_COLOR: "1" },
    encoding: "utf8",
    timeout: 180_000,
  },
);
const logg = `${r.stdout || ""}\n${r.stderr || ""}`;

// 3. läs ORSAK ur JSON-rapporten INNAN återställning (orsaken syns ej i konsolen)
let orsak = "";
try {
  const rapport = JSON.parse(readFileSync(ROTA + "/data/vakten/testaggregator-SENASTE.json", "utf8"));
  const svit = (rapport.sviter || rapport.resultat || []).find((s) => String(s.fil || s.namn || "").includes("v217"));
  orsak = String((svit && svit.orsak) || "");
} catch { /* rapporten avgör */ }

// återställ SENASTE + städa offret
if (existsSync(BACKUP)) copyFileSync(BACKUP, SENASTE);
rmSync(ROTA + "/verktyg/testa-v217-ramvakt-offer.mjs", { force: true });

// 4. bedöm
const vaktenEldade = /ram-vakt: .*poll/.test(logg);
const avlivad = /ram-vakt: svitträdet avlivat/.test(orsak) || /ram-vakt/.test(orsak);
const rodaRapporterad = /"roda":1/.test(logg);
const offerOverlevde = /offer KLAR — vakten svek/.test(logg);
const aggregatorLevde = r.status !== null && String(r.stdout || "").includes("RESULTAT_JSON");
console.log("=== V217 BEVIS ===");
console.log("vakten detekterade tryck:", vaktenEldade ? "JA" : "NEJ");
console.log("orsak=ram-vakt i rapporten:", avlivad ? "JA" : "NEJ", orsak ? `(${orsak.slice(0, 120)})` : "(tom orsak!)");
console.log("RÖD räknad i RESULTAT_JSON:", rodaRapporterad ? "JA" : "NEJ");
console.log("offret nådde ALDRIG sitt KLAR:", offerOverlevde ? "NEJ (fel — avlivades ej)" : "JA");
console.log("aggregatern levde ut rapporten:", aggregatorLevde ? "JA" : "NEJ");
console.log("--- nyckelrader ur loggen ---");
for (const rad of logg.split("\n")) {
  if (/ram-vakt|RÖD|GRÖN|RESULTAT_JSON/.test(rad)) console.log(rad.slice(0, 200));
}
const pass = vaktenEldade && avlivad && rodaRapporterad && !offerOverlevde && aggregatorLevde;
console.log(pass ? "V217-BEVIS: PASS" : "V217-BEVIS: FAIL");
process.exit(pass ? 0 : 1);
